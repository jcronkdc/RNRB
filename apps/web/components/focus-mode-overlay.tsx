'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from '@/components/ui/custom-icons';
import { useFocusMode } from '@/hooks/use-focus-mode';
import { useState, useEffect } from 'react';

/**
 * Focus Mode Overlay
 *
 * Shows a subtle exit hint when entering focus mode
 * Provides escape route for users in distraction-free mode
 */

export function FocusModeOverlay() {
  const { isFocusMode, disableFocusMode } = useFocusMode();
  const [showHint, setShowHint] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);

  // Show hint briefly when entering focus mode
  useEffect(() => {
    if (isFocusMode) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFocusMode]);

  // Show exit button on mouse move to top of screen
  useEffect(() => {
    if (!isFocusMode) return;

    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      // Show exit button when mouse is near top of screen
      if (e.clientY < 60) {
        setShowExitButton(true);
        clearTimeout(timeoutId);
      } else {
        // Hide after 2 seconds of mouse leaving top area
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setShowExitButton(false), 2000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [isFocusMode]);

  if (!isFocusMode) return null;

  return (
    <>
      {/* Entry hint - shows briefly when entering focus mode */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 z-100 -translate-x-1/2"
          >
            <div
              className="flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <Maximize2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <div className="flex flex-col">
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Focus Mode Active
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  Press{' '}
                  <kbd className="mx-1 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px]">
                    Esc
                  </kbd>{' '}
                  or move mouse to top to exit
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit button - appears when mouse near top */}
      <AnimatePresence>
        {showExitButton && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-4 z-100 -translate-x-1/2"
          >
            <button
              onClick={disableFocusMode}
              className="group flex items-center gap-2 rounded-full px-4 py-2 shadow-xl transition-all hover:scale-105"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <X
                className="h-4 w-4 transition-transform group-hover:rotate-90"
                style={{ color: 'var(--muted)' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Exit Focus Mode
              </span>
              <kbd
                className="ml-1 rounded px-1.5 py-0.5 font-mono text-[10px]"
                style={{ background: 'var(--surface)', color: 'var(--muted)' }}
              >
                Esc
              </kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible click-to-exit zones at corners */}
      <div
        className="fixed left-0 top-0 z-99 h-16 w-16 cursor-pointer"
        onClick={disableFocusMode}
        title="Exit Focus Mode"
      />
      <div
        className="fixed right-0 top-0 z-99 h-16 w-16 cursor-pointer"
        onClick={disableFocusMode}
        title="Exit Focus Mode"
      />
    </>
  );
}
