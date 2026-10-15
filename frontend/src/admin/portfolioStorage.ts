// ============================================================
// PORTFOLIO STORAGE & ADMIN SERVICE
// ============================================================
// Supports instant localStorage access + Backend/Database sync
// with secure session token authentication
// ============================================================
import { siteConfig, type Project } from '../config/portfolio';
import { deleteVideoFile } from './indexedDB';

const STORAGE_KEY = 'sriram_portfolio_projects';
const ADMIN_PIN_KEY = 'sriram_admin_pin';
const ADMIN_TOKEN_KEY = 'sriram_admin_token';

// Secret Admin PIN
export const DEFAULT_PIN = '121314161820';

export const getAdminPin = (): string => {
  const stored = localStorage.getItem(ADMIN_PIN_KEY);
  if (!stored || stored === '7989') {
    localStorage.setItem(ADMIN_PIN_KEY, DEFAULT_PIN);
    return DEFAULT_PIN;
  }
  return stored;
};

export const getAuthToken = (): string => {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
};

export const setAuthToken = (token: string): void => {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const verifyAdminPin = async (pin: string): Promise<boolean> => {
  // Check backend verification first
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.valid && data.token) {
        setAuthToken(data.token);
        return true;
      }
    }
  } catch {
    // Offline / direct static mode fallback
  }

  // Client fallback
  const isMatch = pin === getAdminPin();
  if (isMatch) {
    setAuthToken('local-session-' + Date.now());
  }
  return isMatch;
};

export const setAdminPin = async (newPin: string): Promise<void> => {
  localStorage.setItem(ADMIN_PIN_KEY, newPin);
  const token = getAuthToken();
  try {
    await fetch('/api/auth/update-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPin }),
    });
  } catch {
    // Local fallback
  }
};

export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return siteConfig.projects;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : siteConfig.projects;
  } catch {
    return siteConfig.projects;
  }
};

// Async sync with backend database
export const syncWithBackend = async (): Promise<void> => {
  try {
    const resp = await fetch('/api/projects');
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event('portfolio_projects_updated'));
      }
    }
  } catch {
    // Silent offline fallback
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event('portfolio_projects_updated'));
  } catch {
    // Storage quota fallback
  }
};

export const addProject = async (project: Project): Promise<void> => {
  const current = getStoredProjects();
  const updated = [project, ...current];
  saveProjects(updated);

  const token = getAuthToken();
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    });
  } catch {
    // Local storage acts as primary cache
  }
};

export const updateProject = async (updatedProj: Project): Promise<void> => {
  const current = getStoredProjects();
  const updated = current.map((p) => (p.id === updatedProj.id ? updatedProj : p));
  saveProjects(updated);

  const token = getAuthToken();
  try {
    await fetch(`/api/projects/${updatedProj.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedProj),
    });
  } catch {
    // Local fallback
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  await deleteVideoFile(id);
  const current = getStoredProjects();
  const updated = current.filter((p) => p.id !== id);
  saveProjects(updated);

  const token = getAuthToken();
  try {
    await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Local fallback
  }
};

export const resetProjectsToDefault = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('portfolio_projects_updated'));
};

// ============================================================
// CLOUDFLARE R2 CONFIGURATION STORAGE
// ============================================================
const CF_CONFIG_KEY = 'sriram_cloudflare_r2_config';

export interface CloudflareConfig {
  uploadEndpoint: string; // Worker upload URL, e.g. https://sriram-portfolio-videos.<subdomain>.workers.dev
  publicUrl: string;     // R2 public bucket URL or custom domain
}

export const DEFAULT_CF_WORKER_URL = 'https://sriram-portfolio-videos.sriram-portfolio.workers.dev';

export const getCloudflareConfig = (): CloudflareConfig => {
  try {
    const raw = localStorage.getItem(CF_CONFIG_KEY);
    if (!raw) return { uploadEndpoint: DEFAULT_CF_WORKER_URL, publicUrl: DEFAULT_CF_WORKER_URL };
    const parsed = JSON.parse(raw);
    return {
      uploadEndpoint: parsed.uploadEndpoint || DEFAULT_CF_WORKER_URL,
      publicUrl: parsed.publicUrl || DEFAULT_CF_WORKER_URL,
    };
  } catch {
    return { uploadEndpoint: DEFAULT_CF_WORKER_URL, publicUrl: DEFAULT_CF_WORKER_URL };
  }
};

export const saveCloudflareConfig = (config: CloudflareConfig): void => {
  localStorage.setItem(CF_CONFIG_KEY, JSON.stringify(config));
};

