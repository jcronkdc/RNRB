'use client';

import { X, Command, Keyboard } from 'lucide-react';
import { getModifierKey } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: 'editing' | 'navigation' | 'view';
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const mod = getModifierKey();

  const shortcuts: Shortcut[] = [
    // Editing
    { keys: [mod, 'S'], description: 'Save changes', category: 'editing' },
    { keys: [mod, 'Z'], description: 'Undo', category: 'editing' },
    { keys: [mod, 'Shift', 'Z'], description: 'Redo', category: 'editing' },
    { keys: [mod, 'K'], description: 'Add new section', category: 'editing' },

    // Navigation
    { keys: ['1', '2', '3', '4', '5'], description: 'Switch tabs', category: 'navigation' },
    { keys: ['Escape'], description: 'Close modal', category: 'navigation' },
    { keys: ['?'], description: 'Show this help', category: 'navigation' },

    // View
    { keys: [mod, 'P'], description: 'Toggle preview', category: 'view' },
    { keys: [mod, 'E'], description: 'Toggle sidebar', category: 'view' },
    { keys: [mod, 'R'], description: 'Refresh preview', category: 'view' },
  ];

  const categories = {
    editing: { label: 'Editing', icon: Command },
    navigation: { label: 'Navigation', icon: Keyboard },
    view: { label: 'View', icon: Command },
  };

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) acc[shortcut.category] = [];
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: 'var(--accent)', opacity: 0.2 }}
            >
              <Keyboard size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Keyboard Shortcuts
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Work faster with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {(Object.entries(groupedShortcuts) as [string, Shortcut[]][]).map(
            ([category, categoryShortcuts]) => {
              const categoryInfo = categories[category as keyof typeof categories];
              return (
                <div key={category}>
                  <h3
                    className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--muted)' }}
                  >
                    {categoryInfo.label}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: 'var(--bg)' }}
                      >
                        <span className="text-sm" style={{ color: 'var(--text)' }}>
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, j) => (
                            <kbd
                              key={j}
                              className="rounded px-2 py-1 text-xs font-semibold"
                              style={{
                                background: 'var(--panel)',
                                color: 'var(--accent)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            Press <kbd className="rounded bg-white/10 px-2 py-1 text-xs font-semibold">?</kbd>{' '}
            anytime to see shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}
