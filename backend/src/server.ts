import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  getAllProjects,
  createProject,
  updateProjectById,
  deleteProjectById,
  getAdminSettings,
  updateAdminPin,
  type ProjectRecord,
} from '../../database';

const PORT = process.env.PORT || 5000;
const VIDEOS_DIR = path.resolve(__dirname, '../../frontend/public/videos');
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB max
const ALLOWED_EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_CATEGORIES = new Set(['REELS', 'CINEMATIC', 'EXPERIMENTS']);

// Session tokens with 4-hour expiration
const activeTokens = new Map<string, number>();

// Rate limit store: IP -> { attempts, resetAt }
const authRateLimits = new Map<string, { attempts: number; resetAt: number }>();
const uploadRateLimits = new Map<string, { count: number; resetAt: number }>();

function ensureVideosDir(): void {
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
}

function getClientIp(req: http.IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function verifyAuthToken(req: http.IncomingMessage): boolean {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const expiresAt = activeTokens.get(token);
  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    activeTokens.delete(token);
    return false;
  }
  return true;
}

// Sanitize string to prevent injection / XSS
function sanitizeString(str: any, maxLen: number): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip HTML brackets
    .trim()
    .substring(0, maxLen);
}

const server = http.createServer((req, res) => {
  // Security & CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-filename');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const clientIp = getClientIp(req);

  // 1. PUBLIC: GET /api/projects
  if (req.method === 'GET' && pathname === '/api/projects') {
    try {
      const projects = getAllProjects();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(projects));
    } catch {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to retrieve projects' }));
    }
    return;
  }

  // 2. AUTHENTICATION: POST /api/auth/verify (Rate-limited)
  if (req.method === 'POST' && pathname === '/api/auth/verify') {
    const now = Date.now();
    const rate = authRateLimits.get(clientIp);

    if (rate && now < rate.resetAt && rate.attempts >= 5) {
      const waitSeconds = Math.ceil((rate.resetAt - now) / 1000);
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Too many failed attempts. Please wait ${waitSeconds}s.` }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024) req.destroy(); // prevent giant payloads
    });

    req.on('end', () => {
      try {
        const { pin } = JSON.parse(body);
        const admin = getAdminSettings();

        // Constant-time comparison to prevent timing attacks
        const pinBuffer = Buffer.from(String(pin || ''));
        const targetBuffer = Buffer.from(admin.adminPin);

        const isValid =
          pinBuffer.length === targetBuffer.length &&
          crypto.timingSafeEqual(pinBuffer, targetBuffer);

        if (isValid) {
          // Reset rate limit on success
          authRateLimits.delete(clientIp);

          // Generate secure session token
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = now + 4 * 60 * 60 * 1000; // 4 hours
          activeTokens.set(token, expiresAt);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ valid: true, token, expiresAt }));
        } else {
          // Increment failed attempts
          const currentRate = authRateLimits.get(clientIp) || { attempts: 0, resetAt: now + 15 * 60 * 1000 };
          currentRate.attempts += 1;
          authRateLimits.set(clientIp, currentRate);

          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ valid: false, error: 'Invalid PIN' }));
        }
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // ALL MUTATING ROUTES BELOW REQUIRE AUTHENTICATION
  if (!verifyAuthToken(req)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unauthorized: Admin authentication required' }));
    return;
  }

  // 3. PROTECTED: POST /api/projects (Create)
  if (req.method === 'POST' && pathname === '/api/projects') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 50000) req.destroy();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Input Validation
        const title = sanitizeString(data.title, 100);
        if (!title) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Title is required' }));
          return;
        }

        const category = ALLOWED_CATEGORIES.has(data.category) ? data.category : 'REELS';
        const description = sanitizeString(data.description, 1000);
        const videoPath = sanitizeString(data.videoPath, 300);
        const thumbnailPath = sanitizeString(data.thumbnailPath, 300);
        const date = sanitizeString(data.date, 20) || new Date().getFullYear().toString();
        const externalLink = typeof data.externalLink === 'string' && data.externalLink.startsWith('https://')
          ? data.externalLink.substring(0, 300)
          : '';

        const techniques = Array.isArray(data.techniques)
          ? data.techniques.map((t: any) => sanitizeString(t, 40)).filter(Boolean).slice(0, 8)
          : [];

        const record: ProjectRecord = {
          id: sanitizeString(data.id, 50) || Date.now().toString(),
          title,
          category,
          videoPath,
          thumbnailPath,
          description,
          techniques,
          date,
          externalLink,
        };

        const created = createProject(record);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(created));
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid project payload' }));
      }
    });
    return;
  }

  // 4. PROTECTED: PUT /api/projects/:id (Update)
  if (req.method === 'PUT' && pathname.startsWith('/api/projects/')) {
    const id = pathname.replace('/api/projects/', '').replace(/[^a-zA-Z0-9_-]/g, '');
    let body = '';
    req.on('data', (chunk) => (body += chunk));

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const updates: Partial<ProjectRecord> = {};

        if (data.title) updates.title = sanitizeString(data.title, 100);
        if (data.category && ALLOWED_CATEGORIES.has(data.category)) updates.category = data.category;
        if (data.description !== undefined) updates.description = sanitizeString(data.description, 1000);
        if (data.videoPath !== undefined) updates.videoPath = sanitizeString(data.videoPath, 300);
        if (data.thumbnailPath !== undefined) updates.thumbnailPath = sanitizeString(data.thumbnailPath, 300);
        if (data.date !== undefined) updates.date = sanitizeString(data.date, 20);
        if (data.externalLink !== undefined) {
          updates.externalLink = data.externalLink.startsWith('https://') ? data.externalLink.substring(0, 300) : '';
        }
        if (Array.isArray(data.techniques)) {
          updates.techniques = data.techniques.map((t: any) => sanitizeString(t, 40)).filter(Boolean).slice(0, 8);
        }

        const updated = updateProjectById(id, updates);
        if (updated) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(updated));
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Project not found' }));
        }
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid update payload' }));
      }
    });
    return;
  }

  // 5. PROTECTED: DELETE /api/projects/:id
  if (req.method === 'DELETE' && pathname.startsWith('/api/projects/')) {
    const id = pathname.replace('/api/projects/', '').replace(/[^a-zA-Z0-9_-]/g, '');
    const success = deleteProjectById(id);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success }));
    return;
  }

  // 6. PROTECTED & RATE-LIMITED: POST /api/upload-video
  if (req.method === 'POST' && pathname === '/api/upload-video') {
    const now = Date.now();
    const upRate = uploadRateLimits.get(clientIp);
    if (upRate && now < upRate.resetAt && upRate.count >= 20) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Upload rate limit reached. Please wait.' }));
      return;
    }

    ensureVideosDir();
    const rawFilename = (req.headers['x-filename'] as string) || `reel-${Date.now()}.mp4`;
    const ext = path.extname(rawFilename).toLowerCase();

    // Strict extension verification
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid file format. Only video and image formats are permitted.' }));
      return;
    }

    const baseName = path.basename(rawFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const safeFilename = `${baseName}-${Date.now()}${ext}`;
    const targetPath = path.join(VIDEOS_DIR, safeFilename);

    let bytesReceived = 0;
    const writeStream = fs.createWriteStream(targetPath);

    req.on('data', (chunk) => {
      bytesReceived += chunk.length;
      if (bytesReceived > MAX_VIDEO_SIZE_BYTES) {
        writeStream.destroy();
        fs.unlink(targetPath, () => {});
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'File exceeds maximum 100MB limit' }));
        req.destroy();
      }
    });

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      // Increment upload rate
      const currentUp = uploadRateLimits.get(clientIp) || { count: 0, resetAt: now + 60 * 60 * 1000 };
      currentUp.count += 1;
      uploadRateLimits.set(clientIp, currentUp);

      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          path: `/videos/${safeFilename}`,
          filename: safeFilename,
        })
      );
    });

    writeStream.on('error', () => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to write upload' }));
    });
    return;
  }

  // 7. PROTECTED: POST /api/auth/update-pin
  if (req.method === 'POST' && pathname === '/api/auth/update-pin') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { newPin } = JSON.parse(body);
        if (newPin && String(newPin).length >= 4 && String(newPin).length <= 32) {
          updateAdminPin(String(newPin));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } else {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'PIN must be between 4 and 32 characters' }));
        }
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Default 404
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  // Silent production start
});
