'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

/**
 * PWA Update Prompt - Detects new service worker versions and prompts user to update
 * Also handles automatic updates in the background
 */
export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Register service worker and listen for updates
    const registerAndListen = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          // Check for updates more aggressively
          updateViaCache: 'none',
        });
        setRegistration(reg);

        // Check for updates immediately
        reg.update();

        // Check for updates every 30 seconds (more frequent for better PWA experience)
        const intervalId = setInterval(() => {
          reg.update();
        }, 30 * 1000);

        // Listen for new service worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available!
              console.log('[PWA] New service worker installed, prompting for update');
              setShowUpdatePrompt(true);
            }
          });
        });

        // Listen for controller change (update applied)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Controller changed, reloading...');
          // Reload to get fresh content
          window.location.reload();
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SW_UPDATED') {
            console.log('[PWA] Service worker updated to version:', event.data.version);
            // The new SW is already active, just log it
          }
        });

        return () => clearInterval(intervalId);
      } catch (err) {
        console.error('Service worker registration failed:', err);
      }
    };

    registerAndListen();
  }, []);

  // Handle update button click
  const handleUpdate = useCallback(() => {
    if (!registration?.waiting) return;

    setIsUpdating(true);

    // Tell the waiting service worker to skip waiting and activate
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [registration]);

  // Dismiss the prompt (update will still happen on next refresh)
  const handleDismiss = useCallback(() => {
    setShowUpdatePrompt(false);
  }, []);

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-[9998] mx-auto max-w-md rounded-2xl p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6"
          style={{
            background:
              'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(59, 130, 246, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1.5 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
            aria-label="Dismiss"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(59, 130, 246, 0.15)' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#3b82f6' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 pr-6">
              <h4 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
                Update Available
              </h4>
              <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                A new version of Rock N' Roll Basement is ready. Update now for the latest features
                and fixes.
              </p>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: '#3b82f6' }}
                >
                  {isUpdating ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Update Now
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Auto-update hook for programmatic control
 */
export function useAutoUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);

        // Check if there's already a waiting worker
        if (reg.waiting) {
          setUpdateAvailable(true);
        }

        // Listen for new updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    };

    checkForUpdates();
  }, []);

  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [registration]);

  const checkForUpdate = useCallback(async () => {
    if (!registration) return;
    await registration.update();
  }, [registration]);

  return {
    updateAvailable,
    applyUpdate,
    checkForUpdate,
  };
}
