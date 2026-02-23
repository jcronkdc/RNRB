'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Search,
  Music,
  X,
  Loader2,
  FileAudio,
  FileText,
  Star,
  Clock,
  Eye,
  ArrowRight,
  ChevronRight,
} from '@/components/ui/custom-icons';
import { useState, useMemo, useCallback } from 'react';

import { useLibrary, type LibraryFile, type LibraryFileType } from '@/hooks/use-library';

interface LibraryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: LibraryFile) => void;
  acceptTypes?: LibraryFileType[];
}

type FilterTab = 'all' | 'recent' | 'favorites' | 'lyrics' | 'audio';

/**
 * Enhanced Library Import Modal
 * Features: tabs, recent files, double-click import, preview pane
 */
export function LibraryImportModal({
  isOpen,
  onClose,
  onImport,
  acceptTypes,
}: LibraryImportModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('recent');
  const [showPreview, setShowPreview] = useState(false);

  const { files, isLoading, error } = useLibrary({
    search: searchQuery,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Get recent files (last 8)
  const recentFiles = useMemo(() => {
    const filtered = acceptTypes ? files.filter((f) => acceptTypes.includes(f.type)) : files;
    return filtered.slice(0, 8);
  }, [files, acceptTypes]);

  // Get favorite files
  const favoriteFiles = useMemo(() => {
    const filtered = acceptTypes ? files.filter((f) => acceptTypes.includes(f.type)) : files;
    return filtered.filter((f) => f.isFavorite);
  }, [files, acceptTypes]);

  // Get lyrics/text files
  const lyricsFiles = useMemo(() => {
    return files.filter((f) => ['lyrics', 'chords', 'sheet_music'].includes(f.type));
  }, [files]);

  // Get audio files
  const audioFiles = useMemo(() => {
    return files.filter((f) => ['demo', 'sample', 'loop', 'stem'].includes(f.type));
  }, [files]);

  // Current filtered list based on tab
  const filteredFiles = useMemo(() => {
    let result: LibraryFile[] = [];

    switch (activeTab) {
      case 'recent':
        result = recentFiles;
        break;
      case 'favorites':
        result = favoriteFiles;
        break;
      case 'lyrics':
        result = lyricsFiles;
        break;
      case 'audio':
        result = audioFiles;
        break;
      default:
        result = acceptTypes ? files.filter((f) => acceptTypes.includes(f.type)) : files;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.tags.some((t) => t.toLowerCase().includes(query)) ||
          f.type.toLowerCase().includes(query)
      );
    }

    return result;
  }, [
    activeTab,
    recentFiles,
    favoriteFiles,
    lyricsFiles,
    audioFiles,
    files,
    acceptTypes,
    searchQuery,
  ]);

  const handleImport = useCallback(() => {
    if (selectedFile) {
      onImport(selectedFile);
      onClose();
    }
  }, [selectedFile, onImport, onClose]);

  const handleDoubleClick = useCallback(
    (file: LibraryFile) => {
      onImport(file);
      onClose();
    },
    [onImport, onClose]
  );

  const formatFileSize = (bytesStr: string): string => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lyrics':
      case 'chords':
      case 'sheet_music':
        return <FileText className="h-4 w-4 text-blue-400" />;
      default:
        return <FileAudio className="h-4 w-4 text-orange-500" />;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'lyrics':
        return '#3b82f6';
      case 'chords':
        return '#8b5cf6';
      case 'sheet_music':
        return '#10b981';
      case 'demo':
        return '#f59e0b';
      case 'sample':
        return '#ec4899';
      case 'loop':
        return '#06b6d4';
      case 'stem':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const tabs: {
    id: FilterTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }[] = [
    { id: 'recent', label: 'Recent', icon: Clock, count: recentFiles.length },
    { id: 'favorites', label: 'Favorites', icon: Star, count: favoriteFiles.length },
    { id: 'lyrics', label: 'Lyrics & Chords', icon: FileText, count: lyricsFiles.length },
    { id: 'audio', label: 'Audio', icon: FileAudio, count: audioFiles.length },
    { id: 'all', label: 'All Files', icon: Music, count: files.length },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="flex w-full max-w-5xl overflow-hidden rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {/* Main Panel */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Import from Library
              </h2>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--muted)' }}>
                Double-click or select a file to import
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              style={{ color: 'var(--muted)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search + Tabs */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            {/* Search */}
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2"
                style={{
                  background: 'var(--background)',
                  color: 'var(--text)',
                }}
                autoFocus
              />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    background: activeTab === tab.id ? 'var(--accent)' : 'var(--background)',
                    color: activeTab === tab.id ? 'white' : 'var(--muted)',
                  }}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className="rounded-full px-1.5 text-[10px]"
                      style={{
                        background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--panel)',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* File List */}
          <div className="max-h-[400px] flex-1 overflow-y-auto px-4 py-3">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-16">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && filteredFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Music className="mb-4 h-12 w-12" style={{ color: 'var(--muted)' }} />
                <p style={{ color: 'var(--muted)' }}>
                  {searchQuery ? 'No files found' : 'No files in this category'}
                </p>
                <a
                  href="/library"
                  className="mt-3 text-sm transition hover:opacity-80"
                  style={{ color: 'var(--accent)' }}
                >
                  Upload files to your library →
                </a>
              </div>
            )}

            {!isLoading && !error && filteredFiles.length > 0 && (
              <div className="grid gap-2">
                {filteredFiles.map((file) => (
                  <motion.button
                    key={file.id}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setSelectedFile(file)}
                    onDoubleClick={() => handleDoubleClick(file)}
                    className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                      selectedFile?.id === file.id ? 'ring-2' : 'hover:bg-white/5'
                    }`}
                    style={{
                      background:
                        selectedFile?.id === file.id
                          ? `${getTypeColor(file.type)}15`
                          : 'var(--background)',
                      borderColor:
                        selectedFile?.id === file.id ? getTypeColor(file.type) : 'transparent',
                      ['--tw-ring-color' as any]: getTypeColor(file.type),
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${getTypeColor(file.type)}20` }}
                    >
                      {getTypeIcon(file.type)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="truncate text-sm font-semibold"
                          style={{ color: 'var(--text)' }}
                        >
                          {file.name.replace(/\.[^/.]+$/, '')}
                        </h3>
                        {file.isFavorite && (
                          <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <div
                        className="flex items-center gap-2 text-xs"
                        style={{ color: 'var(--muted)' }}
                      >
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium capitalize"
                          style={{
                            background: `${getTypeColor(file.type)}20`,
                            color: getTypeColor(file.type),
                          }}
                        >
                          {file.type.replace('_', ' ')}
                        </span>
                        {formatFileSize(file.size) && <span>{formatFileSize(file.size)}</span>}
                        {file.duration && (
                          <span>
                            {Math.floor(file.duration / 60)}:
                            {(file.duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {file.lyrics && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                            setShowPreview(true);
                          }}
                          className="rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100"
                          style={{ background: 'var(--panel)' }}
                          title="Preview lyrics"
                        >
                          <Eye className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
                        </button>
                      )}
                      {selectedFile?.id === file.id ? (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full"
                          style={{ background: getTypeColor(file.type) }}
                        >
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      ) : (
                        <ArrowRight
                          className="h-4 w-4 opacity-0 transition group-hover:opacity-60"
                          style={{ color: 'var(--muted)' }}
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} •{' '}
              <span className="italic">Double-click to import instantly</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl px-5 py-2 text-sm font-medium transition hover:bg-white/10"
                style={{ color: 'var(--muted)' }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                disabled={!selectedFile}
                className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                Import
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && selectedFile && selectedFile.lyrics && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col overflow-hidden"
              style={{ borderLeft: '1px solid var(--border)', background: 'var(--background)' }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="rounded p-1 transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <pre
                  className="whitespace-pre-wrap text-xs leading-relaxed"
                  style={{ color: 'var(--text)', fontFamily: 'inherit' }}
                >
                  {selectedFile.lyrics}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
