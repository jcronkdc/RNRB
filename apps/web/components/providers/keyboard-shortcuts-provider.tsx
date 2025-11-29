'use client';

/**
 * Keyboard Shortcuts Provider
 *
 * Provides global keyboard shortcuts state and management
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
  action?: () => void;
}

interface KeyboardShortcutsContextValue {
  shortcuts: KeyboardShortcut[];
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (keys: string[]) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | undefined>(
  undefined
);

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [showHelp, setShowHelp] = useState(false);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => {
      // Don't add duplicates
      const exists = prev.some((s) => JSON.stringify(s.keys) === JSON.stringify(shortcut.keys));
      if (exists) return prev;
      return [...prev, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((keys: string[]) => {
    setShortcuts((prev) => prev.filter((s) => JSON.stringify(s.keys) !== JSON.stringify(keys)));
  }, []);

  // Listen for ? key to toggle help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help on ? key (not in input fields)
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
      // Close on Escape
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        showHelp,
        setShowHelp,
        registerShortcut,
        unregisterShortcut,
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
}
