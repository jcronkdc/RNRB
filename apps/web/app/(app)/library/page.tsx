'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Trash2,
  Grid3x3,
  List,
  Search,
  FileAudio,
  Disc,
  Mic2,
  Radio,
  Loader2,
  Folder,
  Download,
  CheckSquare,
  Square,
  X,
  Upload,
  AlertCircle,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback } from 'react';

import { AudioPlayer } from '@/components/audio-player';
import { useLibrary, useLibraryUpload, type LibraryFileType } from '@/hooks/use-library';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function LibraryPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LibraryFileType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'size'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [publishingFile, setPublishingFile] = useState<string | null>(null);

  // Use optimized hook with caching
  const {
    files,
    isLoading,
    error: libraryError,
    hasMore,
    loadMore,
    deleteFile,
    deleteFiles,
    total,
  } = useLibrary({
    type: filterType,
    search: searchQuery,
    sortBy,
    sortOrder,
  });

  // Upload hook with progress tracking
  const { upload, uploading, progress, error: uploadError } = useLibraryUpload();

  // Format file size
  const formatFileSize = (bytesStr: string): string => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, type: LibraryFileType) => {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      try {
        await upload(file, type);
      } catch (err) {
        console.error('Upload failed:', err);
      }

      event.target.value = '';
    },
    [upload, user]
  );

  // Handle single file deletion
  const handleDelete = useCallback(
    async (fileId: string) => {
      if (!confirm('Delete this file from your library?')) return;

      try {
        await deleteFile(fileId);
        if (playingId === fileId) {
          setPlayingId(null);
        }
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete file');
      }
    },
    [deleteFile, playingId]
  );

  // Handle bulk deletion
  const handleBulkDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} selected file(s)?`)) return;

    try {
      await deleteFiles(Array.from(selectedFiles));
      setSelectedFiles(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      console.error('Bulk delete failed:', err);
      alert('Failed to delete files');
    }
  }, [selectedFiles, deleteFiles]);

  // Toggle file selection
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  // Select all files
  const selectAll = useCallback(() => {
    setSelectedFiles(new Set(files.map((f) => f.id)));
  }, [files]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
    setIsSelectionMode(false);
  }, []);

  // Handle publish to community
  const handlePublish = useCallback(async (fileId: string) => {
    if (!confirm('Publish this file to the community? It will be visible to all users.')) return;

    setPublishingFile(fileId);
    try {
      const response = await fetch(`/api/library/${fileId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish file');
      }

      const data = await response.json();
      alert('File published successfully! Check the Community page to see it.');
    } catch (err) {
      console.error('Publish failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish file';
      alert(errorMessage);
    } finally {
      setPublishingFile(null);
    }
  }, []);

  // Get type icon
  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'stem':
        return <Disc className="h-5 w-5 text-orange-500" />;
      case 'demo':
        return <Music className="h-5 w-5 text-orange-500" />;
      case 'sample':
        return <Mic2 className="h-5 w-5 text-orange-500" />;
      case 'loop':
        return <Radio className="h-5 w-5 text-orange-500" />;
      default:
        return <FileAudio className="h-5 w-5 text-orange-500" />;
    }
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <div className="text-center">
            <div className="text-lg font-medium text-white">Loading your library...</div>
            <div className="mt-2 text-sm text-gray-400">Preparing your music assets</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Floating Music Notes */}
      <div className="music-notes-container pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="music-note"
            style={{
              left: `${5 + i * 8}%`,
              animationDelay: `${i * 0.7}s`,
              fontSize: `${18 + (i % 4) * 8}px`,
            }}
          >
            {['♪', '♫', '♬', '♩'][i % 4]}
          </div>
        ))}
      </div>

      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="gradient-orb-accent"></div>
      </div>

      {/* Hero Grid Pattern */}
      <div className="hero-grid-pattern"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {/* White RR Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <Link href="/" className="group relative inline-block">
            <Image
              src="/logo-light.png"
              alt="Rock N' Roll Basement"
              width={160}
              height={65}
              priority
              className="transition-all duration-300 group-hover:scale-105"
              style={{
                filter:
                  'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(255, 99, 71, 0.3))',
              }}
            />
            <div
              className="absolute inset-0 -z-10 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'rgba(255, 99, 71, 0.2)' }}
            />
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-2xl border p-4 sm:mb-8 sm:p-6 lg:mb-12 lg:p-10"
          style={{ borderColor: 'var(--border)', background: 'rgba(255, 99, 71, 0.05)' }}
        >
          {/* Accent bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4 h-1 rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--accent), #ffd700)' }}
          />
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                  style={{ background: 'rgba(255, 99, 71, 0.2)' }}
                >
                  <Folder className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <h1
                  className="truncate text-2xl font-bold sm:text-3xl lg:text-4xl"
                  style={{ color: 'var(--text)' }}
                >
                  My Library
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-xl" style={{ color: 'var(--muted)' }}>
                {total} file{total !== 1 ? 's' : ''} • Your music assets, ready to collaborate
              </p>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-xl p-2 transition-all sm:p-3 ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-xl p-2 transition-all sm:p-3 ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
                title="List view"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 space-y-3 sm:mb-6 sm:space-y-4 lg:mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2.5 pl-9 pr-3 text-sm text-white transition-all placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:py-3 sm:pl-12 sm:pr-4 sm:text-base"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex gap-1.5 overflow-x-auto sm:gap-2">
              {['all', 'stem', 'demo', 'sample', 'loop', 'other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-2.5 sm:text-sm ${
                    filterType === type
                      ? 'bg-orange-500 text-white'
                      : 'border border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="ml-auto flex gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white sm:text-sm"
              >
                <option value="createdAt">Date Added</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white sm:text-sm"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Selection Mode Controls */}
          {isSelectionMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3"
            >
              <CheckSquare className="h-4 w-4 text-orange-500" />
              <span className="flex-1 text-sm text-white">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAll}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
              >
                Select All
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedFiles.size === 0}
                className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/30 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="rounded-lg bg-gray-800 p-1.5 text-gray-400 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {!isSelectionMode && files.length > 0 && (
            <button
              onClick={() => setIsSelectionMode(true)}
              className="text-sm text-orange-500 hover:text-orange-400"
            >
              Select Multiple
            </button>
          )}
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6 lg:mb-8"
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5 lg:gap-4">
            {[
              { type: 'stem' as const, label: 'Upload Stem', icon: Disc },
              { type: 'demo' as const, label: 'Upload Demo', icon: Music },
              { type: 'sample' as const, label: 'Upload Sample', icon: Mic2 },
              { type: 'loop' as const, label: 'Upload Loop', icon: Radio },
              { type: 'other' as const, label: 'Upload File', icon: FileAudio },
            ].map((uploadType) => (
              <label
                key={uploadType.type}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-800 bg-gray-900 p-3 transition-all hover:border-orange-500 hover:bg-gray-800/50 sm:gap-3 sm:p-4 lg:p-6"
              >
                <uploadType.icon className="h-6 w-6 text-gray-500 transition-colors group-hover:text-orange-500 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                <span className="text-center text-xs font-medium text-gray-400 transition-colors group-hover:text-white sm:text-sm">
                  {uploadType.label}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, uploadType.type)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-gray-800 bg-gray-900 p-3 sm:mt-4 sm:p-4"
            >
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <Upload className="h-4 w-4 animate-pulse text-orange-500 sm:h-5 sm:w-5" />
                <span className="text-sm text-white sm:text-base">Uploading... {progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-800">
                <motion.div
                  className="h-2 rounded-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 sm:mt-4 sm:p-4"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 sm:h-5 sm:w-5" />
              <p className="text-sm text-red-400 sm:text-base">{uploadError}</p>
            </motion.div>
          )}

          {/* Library Error */}
          {libraryError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 sm:mt-4 sm:p-4"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 sm:h-5 sm:w-5" />
              <p className="text-sm text-red-400 sm:text-base">{libraryError}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Files Grid/List */}
        {isLoading && files.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : files.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center sm:p-8 lg:p-12"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 sm:mb-6 sm:h-24 sm:w-24">
              <Folder className="h-10 w-10 text-orange-500 sm:h-12 sm:w-12" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
              {searchQuery || filterType !== 'all' ? 'No files found' : 'Your Library is Empty'}
            </h2>
            <p className="mb-4 text-sm text-gray-400 sm:mb-6 sm:text-base">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Upload your first audio file to get started'}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-2'
              }
            >
              <AnimatePresence mode="popLayout">
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.02 }}
                    className={`group relative rounded-xl border transition-all ${
                      selectedFiles.has(file.id)
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-800 bg-gray-900 hover:border-orange-500/50'
                    } p-4 hover:shadow-lg hover:shadow-orange-500/10 sm:p-6 ${
                      viewMode === 'list' ? 'flex items-start gap-3 sm:gap-4' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <button
                        onClick={() => toggleFileSelection(file.id)}
                        className="absolute left-3 top-3 z-10 rounded-lg bg-gray-800/80 p-1.5 backdrop-blur-sm"
                      >
                        {selectedFiles.has(file.id) ? (
                          <CheckSquare className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    )}

                    {/* Icon */}
                    <div
                      className={`${viewMode === 'grid' ? 'mb-3 sm:mb-4' : 'shrink-0'} flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 sm:h-12 sm:w-12`}
                    >
                      {getTypeIcon(file.type)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-sm font-semibold text-white transition-colors group-hover:text-orange-500 sm:text-base">
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 sm:gap-2 sm:text-sm">
                        <span className="capitalize">{file.type}</span>
                        <span>•</span>
                        <span>{formatFileSize(file.size)}</span>
                        {file.duration && (
                          <>
                            <span>•</span>
                            <span>
                              {Math.floor(file.duration / 60)}:
                              {(file.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Audio Player (when playing) */}
                      {playingId === file.id && (
                        <div className="mt-3">
                          <AudioPlayer
                            src={file.url}
                            name={file.name}
                            onEnded={() => setPlayingId(null)}
                            className="!p-3"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {!isSelectionMode && (
                      <div className="mt-3 flex items-center gap-1.5 sm:mt-4 sm:gap-2 md:mt-0">
                        <button
                          onClick={() => setPlayingId(playingId === file.id ? null : file.id)}
                          className="rounded-lg bg-orange-500/10 p-1.5 text-orange-500 transition-all hover:bg-orange-500 hover:text-white sm:p-2"
                          title="Play/Pause"
                        >
                          {playingId === file.id ? (
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handlePublish(file.id)}
                          disabled={publishingFile === file.id}
                          className="rounded-lg bg-gray-800 p-1.5 text-gray-400 transition-all hover:bg-green-500/20 hover:text-green-500 disabled:opacity-50 sm:p-2"
                          title="Publish to Community"
                        >
                          <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <a
                          href={file.url}
                          download
                          className="rounded-lg bg-gray-800 p-1.5 text-gray-400 transition-all hover:bg-gray-700 hover:text-white sm:p-2"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="rounded-lg bg-gray-800 p-1.5 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-500 sm:p-2"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-all hover:border-orange-500 hover:bg-gray-800 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
