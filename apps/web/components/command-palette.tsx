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

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command as CommandIcon, ArrowRight } from '@/components/ui/custom-icons';
import { useState, useEffect, useRef } from 'react';

import { useCommandPalette } from '@/hooks/use-command-palette';

export function CommandPalette() {
  const { isOpen, search, setSearch, filteredCommands, groupedCommands, close } =
    useCommandPalette();

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
        setSelectedIndex((i) => (i < filteredCommands.length - 1 ? i + 1 : i));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : 0));
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
      case 'navigation':
        return '🗺️ Navigate';
      case 'actions':
        return 'Actions';
      case 'recent':
        return '🕐 Recent';
      case 'projects':
        return '📁 Projects';
      case 'songs':
        return 'Songs';
      default:
        return category;
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Command Palette Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="mx-4 w-full max-w-2xl"
            >
              <div
                className="bg-card overflow-hidden rounded-xl border border-border shadow-2xl"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Search Input */}
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for anything..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center gap-1 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                    <CommandIcon className="h-3 w-3" />
                    <span>K</span>
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredCommands.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Search className="mx-auto mb-3 h-12 w-12 opacity-50" />
                      <p>No results found</p>
                      <p className="mt-1 text-sm">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {Object.entries(groupedCommands).map(([category, commands]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          {/* Category Header */}
                          <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                                    isSelected ? 'bg-brand-primary text-white' : 'hover:bg-muted/50'
                                  } `}
                                  whileHover={{ x: 4 }}
                                >
                                  {/* Icon */}
                                  {cmd.icon && <span className="shrink-0 text-lg">{cmd.icon}</span>}

                                  {/* Content */}
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}
                                    >
                                      {cmd.title}
                                    </p>
                                    {cmd.description && (
                                      <p
                                        className={`mt-0.5 text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}
                                      >
                                        {cmd.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Shortcut or Arrow */}
                                  {cmd.shortcut ? (
                                    <div
                                      className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
                                        isSelected
                                          ? 'bg-white/20 text-white'
                                          : 'bg-muted text-muted-foreground'
                                      } `}
                                    >
                                      {cmd.shortcut}
                                    </div>
                                  ) : (
                                    <ArrowRight
                                      className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-muted-foreground'}`}
                                    />
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
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded bg-muted px-1.5 py-0.5">↑</kbd>
                      <kbd className="rounded bg-muted px-1.5 py-0.5">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded bg-muted px-1.5 py-0.5">Esc</kbd>
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
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
      title="Open command palette (Cmd+K)"
    >
      <Search className="h-4 w-4" />
      <span className="hidden md:inline">Search...</span>
      <div className="hidden items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-xs md:flex">
        <CommandIcon className="h-3 w-3" />
        <span>K</span>
      </div>
    </button>
  );
}
