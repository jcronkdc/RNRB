'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen,
  Star,
  Clock,
  FileText,
  Music2,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  Sparkles,
} from '@/components/ui/custom-icons';
import { useState, useMemo } from 'react';

import { useLibrary, type LibraryFile } from '@/hooks/use-library';

interface QuickLibraryImportProps {
  onImport: (file: LibraryFile) => void;
  onOpenFullLibrary: () => void;
}

/**
 * Quick Library Import Panel
 * Shows recent and favorite lyrics/chord files for fast importing
 */
export function QuickLibraryImport({ onImport, onOpenFullLibrary }: QuickLibraryImportProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'lyrics'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch lyrics and chord files
  const { files: allFiles, isLoading } = useLibrary({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Filter for text-based song files (lyrics, chords, sheet music)
  const songFiles = useMemo(() => {
    return allFiles.filter((f) => ['lyrics', 'chords', 'sheet_music'].includes(f.type));
  }, [allFiles]);

  // Recent files (last 10 updated)
  const recentFiles = useMemo(() => {
    return songFiles.slice(0, 10);
  }, [songFiles]);

  // Favorite files
  const favoriteFiles = useMemo(() => {
    return songFiles.filter((f) => f.isFavorite);
  }, [songFiles]);

  // Filtered files based on search
  const filteredFiles = useMemo(() => {
    let files: LibraryFile[] = [];
    switch (activeTab) {
      case 'recent':
        files = recentFiles;
        break;
      case 'favorites':
        files = favoriteFiles;
        break;
      case 'lyrics':
        files = songFiles;
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      files = files.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return files;
  }, [activeTab, recentFiles, favoriteFiles, songFiles, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lyrics':
        return <FileText className="h-3.5 w-3.5 text-blue-400" />;
      case 'chords':
        return <Music2 className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const tabs = [
    { id: 'recent' as const, label: 'Recent', icon: Clock, count: recentFiles.length },
    { id: 'favorites' as const, label: 'Favorites', icon: Star, count: favoriteFiles.length },
    { id: 'lyrics' as const, label: 'All Lyrics', icon: FileText, count: songFiles.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 transition hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
            }}
          >
            <FolderOpen className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Quick Import
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {songFiles.length} songs in library
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && recentFiles.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Click to browse
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-3 pb-3" style={{ borderTop: '1px solid var(--border)' }}>
              {/* Search */}
              <div className="relative mt-3">
                <Search
                  className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                  style={{ color: 'var(--muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search your songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-0 py-2 pl-8 pr-3 text-xs outline-hidden transition focus:ring-2"
                  style={{
                    background: 'var(--background)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
                    style={{
                      background: activeTab === tab.id ? 'var(--accent)' : 'var(--background)',
                      color: activeTab === tab.id ? 'white' : 'var(--muted)',
                    }}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span
                        className="rounded-full px-1.5 text-[10px]"
                        style={{
                          background:
                            activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--panel)',
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* File List */}
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-(--accent) border-t-transparent" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="py-6 text-center">
                    <Sparkles className="mx-auto mb-2 h-6 w-6" style={{ color: 'var(--muted)' }} />
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {searchQuery ? 'No matching songs' : 'No songs yet'}
                    </p>
                    <button
                      onClick={onOpenFullLibrary}
                      className="mt-2 text-xs font-medium transition hover:opacity-80"
                      style={{ color: 'var(--accent)' }}
                    >
                      Browse full library →
                    </button>
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <motion.button
                      key={file.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onImport(file)}
                      className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition"
                      style={{ background: 'var(--background)' }}
                      title={`Click to import "${file.name}"`}
                    >
                      {/* Icon */}
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                        style={{ background: 'var(--panel)' }}
                      >
                        {getTypeIcon(file.type)}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-xs font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          {file.name.replace(/\.[^/.]+$/, '')}
                        </p>
                        <p className="truncate text-[10px]" style={{ color: 'var(--muted)' }}>
                          {file.type} • {new Date(file.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Favorite indicator */}
                      {file.isFavorite && (
                        <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                      )}

                      {/* Import arrow - shows on hover */}
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100"
                        style={{ color: 'var(--accent)' }}
                      />
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <button
                onClick={onOpenFullLibrary}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition hover:bg-white/5"
                style={{ color: 'var(--accent)', background: 'var(--background)' }}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Open Full Library
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
