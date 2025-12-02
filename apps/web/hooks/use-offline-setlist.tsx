/**
 * Offline Setlist Hook
 *
 * Enables saving and loading setlists for offline performer mode.
 * Uses Service Worker + IndexedDB for reliable offline storage.
 */

import { useState, useEffect, useCallback } from 'react';

interface OfflineSetlist {
  id: string;
  name: string;
  showName?: string;
  showDate?: string;
  venueName?: string;
  songs: Array<{
    id: string;
    position: number;
    title: string;
    key?: string;
    tempo?: number;
    duration?: number;
    lyrics?: string;
    chords?: string;
    notes?: string;
    isEncore?: boolean;
  }>;
  cachedAt?: number;
  pendingSync?: boolean;
}

interface UseOfflineSetlistReturn {
  isOfflineReady: boolean;
  offlineSetlists: OfflineSetlist[];
  saveSetlistOffline: (setlist: OfflineSetlist) => Promise<boolean>;
  getOfflineSetlist: (id: string) => Promise<OfflineSetlist | null>;
  deleteOfflineSetlist: (id: string) => Promise<boolean>;
  refreshOfflineSetlists: () => Promise<void>;
  isOnline: boolean;
}

/**
 * Send message to service worker and wait for response
 */
function sendToServiceWorker<T>(type: string, payload?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker?.controller) {
      reject(new Error('Service worker not ready'));
      return;
    }

    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data.success) {
        resolve(event.data as T);
      } else {
        reject(new Error(event.data.error || 'Unknown error'));
      }
    };

    navigator.serviceWorker.controller.postMessage({ type, payload }, [messageChannel.port2]);

    // Timeout after 5 seconds
    setTimeout(() => {
      reject(new Error('Service worker timeout'));
    }, 5000);
  });
}

export function useOfflineSetlist(): UseOfflineSetlistReturn {
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [offlineSetlists, setOfflineSetlists] = useState<OfflineSetlist[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Check service worker and online status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if service worker is ready
    const checkServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker?.ready;
        setIsOfflineReady(!!registration);
      } catch {
        setIsOfflineReady(false);
      }
    };

    checkServiceWorker();

    // Online/offline detection
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline setlists on mount
  useEffect(() => {
    if (isOfflineReady) {
      refreshOfflineSetlists();
    }
  }, [isOfflineReady]);

  const refreshOfflineSetlists = useCallback(async () => {
    try {
      const response = await sendToServiceWorker<{ setlists: OfflineSetlist[] }>(
        'GET_ALL_OFFLINE_SETLISTS'
      );
      setOfflineSetlists(response.setlists || []);
    } catch (error) {
      console.error('Failed to load offline setlists:', error);
    }
  }, []);

  const saveSetlistOffline = useCallback(
    async (setlist: OfflineSetlist): Promise<boolean> => {
      try {
        await sendToServiceWorker('SAVE_SETLIST_OFFLINE', setlist);
        await refreshOfflineSetlists();
        return true;
      } catch (error) {
        console.error('Failed to save setlist offline:', error);
        return false;
      }
    },
    [refreshOfflineSetlists]
  );

  const getOfflineSetlist = useCallback(async (id: string): Promise<OfflineSetlist | null> => {
    try {
      const response = await sendToServiceWorker<{ setlist: OfflineSetlist }>(
        'GET_OFFLINE_SETLIST',
        { id }
      );
      return response.setlist || null;
    } catch (error) {
      console.error('Failed to get offline setlist:', error);
      return null;
    }
  }, []);

  const deleteOfflineSetlist = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await sendToServiceWorker('DELETE_OFFLINE_SETLIST', { id });
        await refreshOfflineSetlists();
        return true;
      } catch (error) {
        console.error('Failed to delete offline setlist:', error);
        return false;
      }
    },
    [refreshOfflineSetlists]
  );

  return {
    isOfflineReady,
    offlineSetlists,
    saveSetlistOffline,
    getOfflineSetlist,
    deleteOfflineSetlist,
    refreshOfflineSetlists,
    isOnline,
  };
}

/**
 * Component to show offline indicator
 */
export function OfflineIndicator() {
  const { isOnline, isOfflineReady, offlineSetlists } = useOfflineSetlist();

  if (isOnline && offlineSetlists.length === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg ${
        isOnline
          ? 'border border-green-500/30 bg-green-500/20 text-green-400'
          : 'border border-orange-500/30 bg-orange-500/20 text-orange-400'
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'animate-pulse bg-orange-500'}`}
      />
      {isOnline ? (
        <>
          Online • {offlineSetlists.length} setlist{offlineSetlists.length !== 1 ? 's' : ''} saved
        </>
      ) : (
        <>
          Offline • {offlineSetlists.length} setlist{offlineSetlists.length !== 1 ? 's' : ''}{' '}
          available
        </>
      )}
    </div>
  );
}
