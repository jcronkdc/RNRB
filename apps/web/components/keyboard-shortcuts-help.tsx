'use client';

/**
 * Keyboard Shortcuts Help Modal
 *
 * Shows all available keyboard shortcuts
 * Press ? to open
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Navigation, Mouse, Command } from '@/components/ui/custom-icons';

import { useKeyboardShortcuts } from '@/components/providers/keyboard-shortcuts-provider';

export function KeyboardShortcutsHelp() {
  const { shortcuts, showHelp, setShowHelp } = useKeyboardShortcuts();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, typeof shortcuts>
  );

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'navigation':
        return { icon: Navigation, label: 'Navigation', color: 'text-blue-400' };
      case 'actions':
        return { icon: Zap, label: 'Actions', color: 'text-green-400' };
      case 'system':
        return { icon: Command, label: 'System', color: 'text-purple-400' };
      default:
        return { icon: Mouse, label: category, color: 'text-gray-400' };
    }
  };

  return (
    <AnimatePresence>
      {showHelp && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="fixed inset-0 z-50 bg-black/60"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="border-border bg-card w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl"
            >
              {/* Header */}
              <div className="border-border bg-muted/30 flex items-center justify-between border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-pink-500">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                    <p className="text-muted-foreground text-sm">Express lanes for power users</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="max-h-[600px] overflow-y-auto p-6">
                {/* Global Shortcuts */}
                <div className="mb-6">
                  <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                    <Command className="h-4 w-4 text-purple-400" />
                    Global Shortcuts
                  </h3>
                  <div className="space-y-2">
                    <ShortcutRow keys={['⌘', 'K']} description="Open Command Palette" />
                    <ShortcutRow keys={['⌘', '/']} description="Search Everything" />
                    <ShortcutRow keys={['⌘', 'N']} description="New Project" />
                    <ShortcutRow keys={['?']} description="Show This Help" />
                  </div>
                </div>

                {/* Category Shortcuts */}
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
                  const info = getCategoryInfo(category);
                  return (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                        <info.icon className={`h-4 w-4 ${info.color}`} />
                        {info.label}
                      </h3>
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <ShortcutRow
                            key={index}
                            keys={shortcut.keys}
                            description={shortcut.description}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-border bg-muted/30 border-t p-4 text-center">
                <p className="text-muted-foreground text-sm">
                  🚇 <strong>Tokyo Subway Navigation:</strong> Press{' '}
                  <kbd className="bg-muted rounded px-2 py-1 text-xs">G</kbd> then any letter to go
                  instantly
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
      <span className="text-foreground text-sm">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="border-border bg-muted rounded border px-2 py-1 text-xs font-medium shadow-xs"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
