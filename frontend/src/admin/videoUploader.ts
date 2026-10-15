// ============================================================
// VIDEO UPLOADER UTILITY
// ============================================================
// Supports uploading directly to Cloudflare R2 via Cloudflare Worker
// with fallback to local server and IndexedDB.
// ============================================================
import { storeVideoFile } from './indexedDB';
import { getAuthToken, getCloudflareConfig } from './portfolioStorage';

export interface UploadResult {
  videoPath: string;
  source: 'cloudflare' | 'server' | 'indexeddb';
}

export async function uploadVideo(
  projectId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const token = getAuthToken();
  const cfConfig = getCloudflareConfig();

  // 1. Try uploading to Cloudflare R2 Worker if configured
  if (cfConfig.uploadEndpoint && cfConfig.uploadEndpoint.trim()) {
    try {
      let endpoint = cfConfig.uploadEndpoint.trim();
      if (!endpoint.endsWith('/upload') && !endpoint.endsWith('/api/upload')) {
        endpoint = `${endpoint.replace(/\/$/, '')}/upload`;
      }

      const result = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint);
        xhr.setRequestHeader('x-filename', encodeURIComponent(file.name));
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resData = JSON.parse(xhr.responseText);
              if (resData && resData.url) {
                // Also cache in IndexedDB locally as fast fallback
                await storeVideoFile(projectId, file);
                resolve({
                  videoPath: resData.url,
                  source: 'cloudflare',
                });
                return;
              }
            } catch (err) {
              reject(err);
            }
          }
          reject(new Error(`Cloudflare upload returned status ${xhr.status}: ${xhr.responseText}`));
        };

        xhr.onerror = () => reject(new Error('Network error uploading to Cloudflare'));
        xhr.ontimeout = () => reject(new Error('Upload to Cloudflare timed out'));
        xhr.send(file);
      });

      return result;
    } catch (err) {
      console.warn('Cloudflare R2 upload failed, trying fallback:', err);
    }
  }

  // 2. Try uploading to local server (/api/upload-video)
  try {
    const headers: Record<string, string> = {
      'x-filename': file.name,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/upload-video', {
      method: 'POST',
      headers,
      body: file,
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.path) {
        // Also keep in IndexedDB as backup
        await storeVideoFile(projectId, file);
        return {
          videoPath: data.path,
          source: 'server',
        };
      }
    }
  } catch {
    // Server upload unavailable / static preview
  }

  // 3. Fallback to IndexedDB (local preview only)
  const idbUrl = await storeVideoFile(projectId, file);
  return {
    videoPath: idbUrl,
    source: 'indexeddb',
  };
}
