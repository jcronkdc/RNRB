'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * Install App Button - Shows when the app is installable as a PWA
 * Provides easy one-click installation for users
 */
export function InstallAppButton({
  variant = 'default',
  className = '',
}: {
  variant?: 'default' | 'prominent' | 'minimal';
  className?: string;
}) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if already installed
  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Capture the install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if prompt was already captured (for hot reloads)
    if ((window as any).deferredInstallPrompt) {
      setInstallPrompt((window as any).deferredInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Store prompt globally for persistence
  useEffect(() => {
    if (installPrompt) {
      (window as any).deferredInstallPrompt = installPrompt;
    }
  }, [installPrompt]);

  // Handle install click
  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;

    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }

      setInstallPrompt(null);
      (window as any).deferredInstallPrompt = null;
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setIsInstalling(false);
    }
  }, [installPrompt]);

  // Don't render if already installed or not installable
  if (isInstalled) {
    return showSuccess ? (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${className}`}
        style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        App Installed!
      </motion.div>
    ) : null;
  }

  if (!installPrompt) {
    // Show manual instructions for iOS/Safari
    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      return <IOSInstallInstructions variant={variant} className={className} />;
    }
    return null;
  }

  // Render based on variant
  if (variant === 'prominent') {
    return (
      <motion.button
        onClick={handleInstall}
        disabled={isInstalling}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-xl px-6 py-3 text-white transition-all ${className}`}
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
        }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span className="font-medium">{isInstalling ? 'Installing...' : 'Install App'}</span>
      </motion.button>
    );
  }

  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={handleInstall}
        disabled={isInstalling}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${className}`}
        style={{ color: 'var(--sage)' }}
      >
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {isInstalling ? 'Installing...' : 'Install App'}
      </motion.button>
    );
  }

  // Default variant
  return (
    <motion.button
      onClick={handleInstall}
      disabled={isInstalling}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${className}`}
      style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        color: '#22c55e',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {isInstalling ? 'Installing...' : 'Install App'}
    </motion.button>
  );
}

/**
 * iOS Install Instructions - Safari doesn't support beforeinstallprompt
 */
function IOSInstallInstructions({
  variant,
  className = '',
}: {
  variant: 'default' | 'prominent' | 'minimal';
  className?: string;
}) {
  const [showInstructions, setShowInstructions] = useState(false);

  if (variant === 'minimal') {
    return (
      <>
        <button
          onClick={() => setShowInstructions(true)}
          className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${className}`}
          style={{ color: 'var(--sage)' }}
        >
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Install App
        </button>
        <IOSInstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
        />
      </>
    );
  }

  return (
    <>
      <motion.button
        onClick={() => setShowInstructions(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${className}`}
        style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Install App
      </motion.button>
      <IOSInstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </>
  );
}

/**
 * Modal with iOS installation instructions
 */
function IOSInstructionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md rounded-2xl p-6"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="mb-4 text-xl font-semibold" style={{ color: 'var(--text)' }}>
            Install on iPhone/iPad
          </h3>

          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Follow these steps to add Rock N' Roll Basement to your home screen:
          </p>

          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                1
              </span>
              <div>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  Tap the Share button
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Look for the square with an arrow pointing up at the bottom of Safari
                </p>
                <div
                  className="mt-2 flex items-center justify-center rounded-lg p-3"
                  style={{ background: 'var(--bg)' }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ color: 'var(--accent)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                2
              </span>
              <div>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  Scroll down and tap "Add to Home Screen"
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  It has a plus (+) icon next to it
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                3
              </span>
              <div>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  Tap "Add" in the top right
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  The app icon will appear on your home screen
                </p>
              </div>
            </li>
          </ol>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl py-3 text-center font-medium text-white transition-all hover:scale-[1.02]"
            style={{ background: 'var(--accent)' }}
          >
            Got it!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Install App Banner - A more prominent call-to-action
 */
export function InstallAppBanner({ onDismiss }: { onDismiss?: () => void }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Check localStorage for dismiss
    const wasDismissed = localStorage.getItem('install-banner-dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('install-banner-dismissed', 'true');
    onDismiss?.();
  };

  if (isInstalled || dismissed || !installPrompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6"
      style={{
        background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 transition-colors hover:bg-white/10"
        style={{ color: 'var(--muted)' }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(34, 197, 94, 0.15)' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: '#22c55e' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h4 className="font-semibold" style={{ color: 'var(--text)' }}>
            Install Rock N' Roll Basement
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Add to your home screen for quick access & offline use
          </p>
        </div>

        <button
          onClick={handleInstall}
          className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105"
          style={{ background: '#22c55e' }}
        >
          Install
        </button>
      </div>
    </motion.div>
  );
}
