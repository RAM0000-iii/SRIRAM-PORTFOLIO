// ============================================================
// INDEXED DB PERSISTENCE FOR VIDEO FILES
// ============================================================
// Stores large video files directly in browser IndexedDB
// so they survive page refreshes and browser restarts.
// ============================================================

const DB_NAME = 'sriram_portfolio_db';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache of active Object URLs to prevent memory leaks and redundant conversions
const activeUrlCache = new Map<string, string>();

export async function storeVideoFile(id: string, file: Blob): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(file, id);

    putReq.onsuccess = () => {
      // Revoke any previous active URL for this id
      if (activeUrlCache.has(id)) {
        URL.revokeObjectURL(activeUrlCache.get(id)!);
      }
      const newUrl = URL.createObjectURL(file);
      activeUrlCache.set(id, newUrl);
      resolve(newUrl);
    };

    putReq.onerror = () => reject(putReq.error);
  });
}

export async function getVideoFileUrl(id: string): Promise<string | null> {
  if (activeUrlCache.has(id)) {
    return activeUrlCache.get(id)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const file: Blob | undefined = getReq.result;
        if (file && file instanceof Blob) {
          const url = URL.createObjectURL(file);
          activeUrlCache.set(id, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteVideoFile(id: string): Promise<void> {
  if (activeUrlCache.has(id)) {
    URL.revokeObjectURL(activeUrlCache.get(id)!);
    activeUrlCache.delete(id);
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
    });
  } catch {
    // Ignore error
  }
}
