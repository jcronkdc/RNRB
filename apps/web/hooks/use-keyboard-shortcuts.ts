/**
 * Keyboard Shortcuts Hook
 *
 * Express lanes for the Tokyo Subway - fastest pathways
 * Like ants finding optimal routes, these are the quickest ways to navigate
 *
 * Global Shortcuts:
 * - Cmd/Ctrl + K: Command Palette
 * - Cmd/Ctrl + /: Search
 * - Cmd/Ctrl + N: New Project
 * - G then D: Go to Dashboard
 * - G then P: Go to Projects
 * - G then S: Go to Songwriting
 * - G then C: Go to Collaboration
 * - ?: Show shortcuts help
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Shortcut = {
  keys: string[];
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'system';
};

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Define all keyboard shortcuts
  const shortcuts: Shortcut[] = [
    // Navigation (Gmail-style G shortcuts)
    {
      keys: ['g', 'd'],
      description: 'Go to Dashboard',
      category: 'navigation',
      action: () => router.push('/dashboard'),
    },
    {
      keys: ['g', 'p'],
      description: 'Go to Projects',
      category: 'navigation',
      action: () => router.push('/projects'),
    },
    {
      keys: ['g', 's'],
      description: 'Go to Songwriting',
      category: 'navigation',
      action: () => router.push('/songwriting'),
    },
    {
      keys: ['g', 'c'],
      description: 'Go to Collaboration',
      category: 'navigation',
      action: () => router.push('/collaboration'),
    },
    {
      keys: ['g', 'l'],
      description: 'Go to Library',
      category: 'navigation',
      action: () => router.push('/library'),
    },
    {
      keys: ['g', 'm'],
      description: 'Go to Messages',
      category: 'navigation',
      action: () => router.push('/messages'),
    },
    {
      keys: ['g', 't'],
      description: 'Go to Studio',
      category: 'navigation',
      action: () => router.push('/studio'),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Handle single key shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Handle two-key sequences (like Gmail's "g d")
      if (lastKey === 'g') {
        const shortcut = shortcuts.find(
          (s) => s.keys.length === 2 && s.keys[0] === 'g' && s.keys[1] === e.key
        );

        if (shortcut) {
          e.preventDefault();
          shortcut.action();
          setLastKey(null);
          return;
        }
      }

      // Track 'g' key for sequences
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        setLastKey('g');
        // Clear after 1 second if no follow-up
        setTimeout(() => setLastKey(null), 1000);
        return;
      }

      // Clear last key on any other key
      setLastKey(null);
    };

    const handleKeyUp = () => {
      // Visual feedback could go here
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [lastKey, router]);

  return {
    shortcuts,
    showHelp,
    setShowHelp,
    lastKey,
  };
}

/**
 * Format shortcut keys for display
 */
export function formatShortcutKeys(keys: string[]): string {
  return keys
    .map((k) => {
      if (k === 'meta') return '⌘';
      if (k === 'ctrl') return 'Ctrl';
      if (k === 'shift') return '⇧';
      if (k === 'alt') return '⌥';
      return k.toUpperCase();
    })
    .join(' ');
}

/**
 * Get platform-specific modifier key
 */
export function getModifierKey(): 'cmd' | 'ctrl' {
  if (typeof window === 'undefined') return 'cmd';
  return navigator.platform.toLowerCase().includes('mac') ? 'cmd' : 'ctrl';
}

/**
 * Check if keyboard shortcut is pressed
 */
export function isShortcutPressed(
  e: KeyboardEvent,
  key: string,
  modifiers?: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean }
): boolean {
  const keyMatch = e.key.toLowerCase() === key.toLowerCase();
  const metaMatch = modifiers?.meta ? e.metaKey : !e.metaKey;
  const ctrlMatch = modifiers?.ctrl ? e.ctrlKey : !e.ctrlKey;
  const shiftMatch = modifiers?.shift ? e.shiftKey : !e.shiftKey;
  const altMatch = modifiers?.alt ? e.altKey : !e.altKey;

  return keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch;
}
