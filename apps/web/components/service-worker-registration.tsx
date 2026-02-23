'use client';

import { useEffect, useState } from 'react';

/**
 * Service Worker Registration Component
 *
 * Registers the service worker for offline-first PWA functionality.
 * Handles updates gracefully with user notification.
 */
export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only register in production and if supported
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service workers not supported');
      return;
    }

    // Don't register in development (causes caching issues)
    if (process.env.NODE_ENV === 'development') {
      console.log('[SW] Skipping registration in development');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        setRegistration(reg);
        console.log('[SW] Service worker registered:', reg.scope);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('[SW] New version available');
              setUpdateAvailable(true);
            }
          });
        });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Controller changed, reloading...');
          window.location.reload();
        });

        // Check for updates periodically (every hour)
        setInterval(
          () => {
            reg.update().catch(console.error);
          },
          60 * 60 * 1000
        );
      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    // Register after page load to not block critical path
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []);

  const handleUpdate = () => {
    if (!registration?.waiting) return;

    // Tell the waiting SW to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    setUpdateAvailable(false);
  };

  // Update available toast
  if (updateAvailable) {
    return (
      <div
        className="fixed right-4 bottom-4 left-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-lg p-4 shadow-lg md:right-4 md:left-auto"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'rgba(249, 115, 22, 0.2)' }}
          >
            <svg
              className="h-5 w-5 text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">Update Available</p>
            <p className="text-sm text-gray-400">Refresh to get the latest features</p>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          className="rounded-lg px-4 py-2 font-medium transition-colors"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
          }}
        >
          Update
        </button>
      </div>
    );
  }

  return null;
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

  return isOnline;
}

/**
 * Offline indicator component
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-2 py-2 text-sm font-medium"
      style={{
        background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
        color: '#fff',
      }}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
        />
      </svg>
      You&apos;re offline — changes will sync when reconnected
    </div>
  );
}
