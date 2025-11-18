'use client';

/**
 * Command Palette Component
 * 
 * Tokyo Subway Navigation - Instant access to everything
 * Press Cmd+K / Ctrl+K to open
 * 
 * Features:
 * - Fuzzy search
 * - Keyboard navigation (arrow keys, enter)
 * - Recent items
 * - Categories
 * - Shortcuts display
 */

import { useCommandPalette } from '@/hooks/use-command-palette';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command as CommandIcon, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function CommandPalette() {
  const {
    isOpen,
    search,
    setSearch,
    filteredCommands,
    groupedCommands,
    close,
  } = useCommandPalette();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => 
          i < filteredCommands.length - 1 ? i + 1 : i
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i > 0 ? i - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.handler();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation': return '🗺️ Navigate';
      case 'actions': return '⚡ Actions';
      case 'recent': return '🕐 Recent';
      case 'projects': return '📁 Projects';
      case 'songs': return '🎵 Songs';
      default: return category;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Command Palette Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl mx-4"
            >
              <div 
                className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for anything..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 text-xs text-muted-foreground">
                    <CommandIcon className="w-3 h-3" />
                    <span>K</span>
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredCommands.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No results found</p>
                      <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {Object.entries(groupedCommands).map(([category, commands]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          {/* Category Header */}
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {getCategoryLabel(category)}
                          </div>

                          {/* Commands in Category */}
                          <div className="space-y-1">
                            {commands.map((cmd, idx) => {
                              const globalIdx = filteredCommands.indexOf(cmd);
                              const isSelected = globalIdx === selectedIndex;

                              return (
                                <motion.button
                                  key={cmd.id}
                                  onClick={() => cmd.handler()}
                                  onMouseEnter={() => setSelectedIndex(globalIdx)}
                                  className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    transition-all text-left
                                    ${isSelected 
                                      ? 'bg-brand-primary text-white' 
                                      : 'hover:bg-muted/50'
                                    }
                                  `}
                                  whileHover={{ x: 4 }}
                                >
                                  {/* Icon */}
                                  {cmd.icon && (
                                    <span className="text-lg shrink-0">
                                      {cmd.icon}
                                    </span>
                                  )}

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                      {cmd.title}
                                    </p>
                                    {cmd.description && (
                                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                        {cmd.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Shortcut or Arrow */}
                                  {cmd.shortcut ? (
                                    <div className={`
                                      px-2 py-1 rounded text-xs font-medium shrink-0
                                      ${isSelected 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-muted text-muted-foreground'
                                      }
                                    `}>
                                      {cmd.shortcut}
                                    </div>
                                  ) : (
                                    <ArrowRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">↑</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">Esc</kbd>
                      Close
                    </span>
                  </div>
                  <span>{filteredCommands.length} results</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Command Palette Trigger Button
 * Shows the keyboard shortcut hint
 */
export function CommandPaletteTrigger() {
  const { open } = useCommandPalette();

  return (
    <button
      onClick={open}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
      title="Open command palette (Cmd+K)"
    >
      <Search className="w-4 h-4" />
      <span className="hidden md:inline">Search...</span>
      <div className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-xs">
        <CommandIcon className="w-3 h-3" />
        <span>K</span>
      </div>
    </button>
  );
}

