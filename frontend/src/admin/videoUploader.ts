// ============================================================
// VIDEO UPLOADER UTILITY
// ============================================================
// Automatically uploads and saves video files directly to public/videos/
// with automatic IndexedDB fallback.
// ============================================================
import { storeVideoFile } from './indexedDB';
import { getAuthToken } from './portfolioStorage';

export interface UploadResult {
  videoPath: string;
  source: 'server' | 'indexeddb';
}

export async function uploadVideo(projectId: string, file: File): Promise<UploadResult> {
  const token = getAuthToken();

  // 1. Try uploading to local server (/api/upload-video)
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

  // 2. Fallback to IndexedDB
  const idbUrl = await storeVideoFile(projectId, file);
  return {
    videoPath: idbUrl,
    source: 'indexeddb',
  };
}
