import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlKey = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? ctrlKey : !ctrlKey;
        const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          shortcut.callback();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    shortcutsHelp: shortcuts.map((s) => ({
      ...s,
      formatted: formatShortcut(s),
    })),
  };
}

// Get platform-specific modifier key name
export function getModifierKey(): 'Cmd' | 'Ctrl' {
  if (typeof window === 'undefined') return 'Ctrl';
  return navigator.platform.toLowerCase().includes('mac') ? 'Cmd' : 'Ctrl';
}

// Format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const mod = getModifierKey();
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push(mod);
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}
