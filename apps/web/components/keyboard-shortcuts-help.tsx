'use client';

/**
 * Keyboard Shortcuts Help Modal
 * 
 * Shows all available keyboard shortcuts
 * Press ? to open
 */

import { useKeyboardShortcuts, formatShortcutKeys } from '@/hooks/use-keyboard-shortcuts';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Navigation, Mouse, Command } from 'lucide-react';

export function KeyboardShortcutsHelp() {
  const { shortcuts, showHelp, setShowHelp } = useKeyboardShortcuts();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                    <p className="text-sm text-muted-foreground">Express lanes for power users</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {/* Global Shortcuts */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Command className="w-4 h-4 text-purple-400" />
                    Global Shortcuts
                  </h3>
                  <div className="space-y-2">
                    <ShortcutRow
                      keys={['⌘', 'K']}
                      description="Open Command Palette"
                    />
                    <ShortcutRow
                      keys={['⌘', '/']}
                      description="Search Everything"
                    />
                    <ShortcutRow
                      keys={['⌘', 'N']}
                      description="New Project"
                    />
                    <ShortcutRow
                      keys={['?']}
                      description="Show This Help"
                    />
                  </div>
                </div>

                {/* Category Shortcuts */}
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
                  const info = getCategoryInfo(category);
                  return (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <info.icon className={`w-4 h-4 ${info.color}`} />
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
              <div className="p-4 border-t border-border bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground">
                  🚇 <strong>Tokyo Subway Navigation:</strong> Press <kbd className="px-2 py-1 rounded bg-muted text-xs">G</kbd> then any letter to go instantly
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
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="text-sm text-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs font-medium bg-muted border border-border rounded shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

