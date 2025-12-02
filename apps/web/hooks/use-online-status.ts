'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Hook to detect online/offline status
 * Uses useSyncExternalStore for reliable SSR hydration
 */

function getSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getServerSnapshot(): boolean {
  return true; // Assume online on server
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Extended hook with additional offline utilities
 */
export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
  pendingActionsCount: number;
  syncPendingActions: () => Promise<void>;
}

export function useOfflineStatus(): OfflineStatus {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);

  // Track offline transitions
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else {
      setLastOnlineAt(new Date());
    }
  }, [isOnline]);

  // Check pending actions count
  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const db = await openDatabase();
        const tx = db.transaction('pendingActions', 'readonly');
        const store = tx.objectStore('pendingActions');
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          setPendingActionsCount(countRequest.result);
        };
      } catch {
        // IndexedDB not available
      }
    };

    checkPendingActions();

    // Listen for sync complete messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        checkPendingActions();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [isOnline]);

  // Manual sync trigger
  const syncPendingActions = useCallback(async () => {
    if (!isOnline) return;

    if ('serviceWorker' in navigator && 'sync' in window.SyncManager.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-pending-actions');
    }
  }, [isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    lastOnlineAt,
    pendingActionsCount,
    syncPendingActions,
  };
}

// IndexedDB helper
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rnrb-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cachedData')) {
        const store = db.createObjectStore('cachedData', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

/**
 * Queue an action to be synced when back online
 */
export async function queueOfflineAction(action: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('pendingActions', 'readwrite');
    const store = tx.objectStore('pendingActions');

    await new Promise<void>((resolve, reject) => {
      const request = store.add({
        ...action,
        timestamp: Date.now(),
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    // Request background sync
    if ('serviceWorker' in navigator && 'sync' in (window as any).SyncManager?.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('sync-pending-actions');
    }
  } catch (err) {
    console.error('Failed to queue offline action:', err);
  }
}

/**
 * Cache data locally for offline access
 */
export async function cacheOfflineData(key: string, data: unknown): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('cachedData', 'readwrite');
    const store = tx.objectStore('cachedData');

    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        key,
        data,
        timestamp: Date.now(),
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (err) {
    console.error('Failed to cache offline data:', err);
  }
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('cachedData', 'readonly');
    const store = tx.objectStore('cachedData');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result?.data ?? null);
      };
    });
  } catch {
    return null;
  }
}
