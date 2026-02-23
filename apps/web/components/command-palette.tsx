'use client';

/**
 * Command Palette Component
 *
 * Tokyo Subway Navigation - Instant access to everything
 * Press Cmd+K / Ctrl+K to open
 *
 * Features:
 * - Global search across all content
 * - Fuzzy search for navigation and actions
 * - Keyboard navigation (arrow keys, enter)
 * - Real-time results with loading states
 * - Rich previews with avatars and metadata
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command as CommandIcon, ArrowRight, Loader2 } from '@/components/ui/custom-icons';
import { useState, useEffect, useRef } from 'react';

import { useCommandPalette } from '@/hooks/use-command-palette';

export function CommandPalette() {
  const {
    isOpen,
    search,
    setSearch,
    isSearching,
    searchError,
    hasSearchResults,
    totalSearchResults,
    filteredCommands,
    groupedCommands,
    close,
  } = useCommandPalette();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search, filteredCommands.length]);

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

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Get category label with icon
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation':
        return '🗺️ Navigate';
      case 'actions':
        return '⚡ Quick Actions';
      case 'recent':
        return '🕐 Recent';
      case 'projects':
        return '📁 Projects';
      case 'songs':
        return '🎵 Songs';
      case 'users':
        return '👥 People';
      case 'messages':
        return '💬 Messages';
      case 'files':
        return '📂 Files';
      case 'shows':
        return '🎸 Shows';
      default:
        return category;
    }
  };

  // Get category order for display
  const categoryOrder = [
    'projects',
    'songs',
    'users',
    'messages',
    'files',
    'shows',
    'navigation',
    'actions',
    'recent',
  ];

  const sortedCategories = Object.keys(groupedCommands).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

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
            className="fixed inset-0 z-50 bg-black/90"
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
                className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Search Input */}
                <div className="flex items-center gap-3 border-b border-border p-4">
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
                  ) : (
                    <Search className="h-5 w-5 text-muted-foreground" />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search everything... projects, songs, people, messages"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-foreground outline-hidden placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center gap-1 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                    <CommandIcon className="h-3 w-3" />
                    <span>K</span>
                  </div>
                </div>

                {/* Search Status Banner */}
                {search.length >= 2 && hasSearchResults && (
                  <div className="flex items-center justify-between border-b border-border bg-brand-primary/10 px-4 py-2">
                    <span className="text-sm font-medium text-brand-primary">
                      Found {totalSearchResults} result
                      {totalSearchResults !== 1 ? 's' : ''} for "{search}"
                    </span>
                  </div>
                )}

                {/* Error Banner */}
                {searchError && (
                  <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2">
                    <span className="text-sm text-red-400">{searchError}</span>
                  </div>
                )}

                {/* Results */}
                <div ref={listRef} className="max-h-[500px] overflow-y-auto">
                  {filteredCommands.length === 0 && !isSearching ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Search className="mx-auto mb-3 h-12 w-12 opacity-50" />
                      <p>No results found</p>
                      <p className="mt-1 text-sm">
                        {search.length < 2
                          ? 'Type at least 2 characters to search'
                          : 'Try a different search term'}
                      </p>
                    </div>
                  ) : isSearching && search.length >= 2 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Loader2 className="mx-auto mb-3 h-12 w-12 animate-spin opacity-50" />
                      <p>Searching...</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {sortedCategories.map((category) => {
                        const commands = groupedCommands[category];
                        if (!commands || commands.length === 0) return null;

                        return (
                          <div key={category} className="mb-4 last:mb-0">
                            {/* Category Header */}
                            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {getCategoryLabel(category)}
                            </div>

                            {/* Commands in Category */}
                            <div className="space-y-1">
                              {commands.map((cmd) => {
                                const globalIdx = filteredCommands.indexOf(cmd);
                                const isSelected = globalIdx === selectedIndex;

                                return (
                                  <motion.button
                                    key={cmd.id}
                                    data-index={globalIdx}
                                    onClick={() => cmd.handler()}
                                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                                      isSelected
                                        ? 'bg-brand-primary text-white'
                                        : 'hover:bg-muted/50'
                                    } `}
                                    whileHover={{ x: 4 }}
                                  >
                                    {/* Avatar/Image or Icon */}
                                    {cmd.image ? (
                                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                        <img
                                          src={cmd.image}
                                          alt=""
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    ) : cmd.icon ? (
                                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-lg">
                                        {cmd.icon}
                                      </span>
                                    ) : null}

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={`truncate text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}
                                      >
                                        {cmd.title}
                                      </p>
                                      {(cmd.description || cmd.subtitle) && (
                                        <p
                                          className={`mt-0.5 truncate text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}
                                        >
                                          {cmd.subtitle || cmd.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Meta badges */}
                                    {cmd.meta?.location && (
                                      <span
                                        className={`hidden shrink-0 rounded px-2 py-0.5 text-xs md:inline ${
                                          isSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                      >
                                        {cmd.meta.location}
                                      </span>
                                    )}

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
                        );
                      })}
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
                  <span>
                    {filteredCommands.length} result
                    {filteredCommands.length !== 1 ? 's' : ''}
                  </span>
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
