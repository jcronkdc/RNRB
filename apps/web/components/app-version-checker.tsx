'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { APP_VERSION, BUILD_DATE } from '@/lib/version';

interface VersionResponse {
  latest: string;
  minimum: string;
  buildDate: string;
  forceUpdate: boolean;
  updateAvailable: boolean;
  message: string | null;
  releaseNotes: string[];
}

/**
 * App Version Checker
 *
 * - Checks for updates on mount and periodically
 * - Shows force-update modal if version is critically outdated
 * - Shows optional update banner for new versions
 * - Displays current version in settings
 */
export function AppVersionChecker() {
  const [versionInfo, setVersionInfo] = useState<VersionResponse | null>(null);
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkVersion = useCallback(async () => {
    try {
      const res = await fetch(`/api/version?client=${APP_VERSION}`);
      if (!res.ok) return;

      const data: VersionResponse = await res.json();
      setVersionInfo(data);

      if (data.forceUpdate) {
        setShowForceUpdate(true);
      } else if (data.updateAvailable && !dismissed) {
        setShowUpdateBanner(true);
      }
    } catch {
      // Silently fail - don't block app usage
      console.log('[Version] Failed to check version');
    }
  }, [dismissed]);

  useEffect(() => {
    // Check on mount
    checkVersion();

    // Check every 30 minutes
    const interval = setInterval(checkVersion, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkVersion]);

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true);

    // Clear all caches
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }

    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    // Clear localStorage version cache
    localStorage.removeItem('rnrb-version');

    // Hard reload
    window.location.reload();
  }, []);

  const handleDismiss = useCallback(() => {
    setShowUpdateBanner(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('rnrb-update-dismissed', 'true');
  }, []);

  // Force Update Modal - Cannot be dismissed
  if (showForceUpdate && versionInfo) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl p-8 text-center"
          style={{
            background:
              'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(255, 99, 71, 0.1) 100%)',
            border: '2px solid var(--accent)',
            boxShadow: '0 0 60px rgba(255, 99, 71, 0.3)',
          }}
        >
          {/* Warning Icon */}
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'rgba(255, 99, 71, 0.2)' }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: 'var(--accent)' }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2 className="mb-3 text-2xl font-black" style={{ color: 'var(--text)' }}>
            Update Required
          </h2>

          <p className="mb-2 text-base" style={{ color: 'var(--text-secondary)' }}>
            {versionInfo.message}
          </p>

          <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
            Your version: v{APP_VERSION} → Latest: v{versionInfo.latest}
          </p>

          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="w-full rounded-xl px-8 py-4 font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #ff8c5a 100%)',
            }}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Updating...
              </span>
            ) : (
              'Update Now'
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  // Optional Update Banner
  return (
    <AnimatePresence>
      {showUpdateBanner && versionInfo && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed left-4 right-4 top-4 z-9998 mx-auto max-w-lg rounded-2xl p-4 shadow-2xl md:left-auto md:right-4"
          style={{
            background:
              'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1.5 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>

            <div className="flex-1 pr-6">
              <h4 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
                New Version Available!
              </h4>
              <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                v{versionInfo.latest} is ready with new features.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-500"
                >
                  Update
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
 * Version Display Component - For settings/about pages
 */
export function AppVersionDisplay() {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <span>Version {APP_VERSION}</span>
      <span className="opacity-50">•</span>
      <span className="opacity-50">{BUILD_DATE}</span>
    </div>
  );
}

/**
 * Hook for programmatic version checking
 */
export function useAppVersion() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/api/version?client=${APP_VERSION}`);
        if (!res.ok) return;

        const data = await res.json();
        setUpdateAvailable(data.updateAvailable);
        setForceUpdate(data.forceUpdate);
        setLatestVersion(data.latest);
      } catch {
        // Silently fail
      }
    };

    check();
  }, []);

  return {
    currentVersion: APP_VERSION,
    latestVersion,
    updateAvailable,
    forceUpdate,
    buildDate: BUILD_DATE,
  };
}
