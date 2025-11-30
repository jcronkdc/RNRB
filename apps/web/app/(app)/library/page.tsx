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
  FileText,
  Image as ImageIcon,
  FileMusic,
  ScrollText,
  Piano,
  FolderOpen,
  File,
  Eye,
  Heart,
  Star,
  Clock,
  Filter,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Edit3,
  Copy,
  FolderPlus,
  Tag,
  Palette,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  BarChart3,
  Zap,
  TrendingUp,
  HardDrive,
  Music2,
  FileType,
  Calendar,
  Hash,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

import { AudioPlayer } from '@/components/audio-player';
import { FileViewer } from '@/components/file-viewer';
import {
  useLibrary,
  useLibraryUpload,
  useLibraryCollections,
  useLibraryStats,
  type LibraryFileType,
  type LibraryFile,
  type LibraryCollection,
  MUSICAL_KEYS,
  MOODS,
  LABEL_COLORS,
} from '@/hooks/use-library';
import { useRequireAuth } from '@/hooks/use-require-auth';

// File type configuration
const FILE_TYPE_CONFIG: Record<
  LibraryFileType,
  { label: string; icon: any; color: string; accept: string; description: string }
> = {
  stem: {
    label: 'Stem',
    icon: Disc,
    color: 'text-orange-500',
    accept: 'audio/*',
    description: 'Audio stems',
  },
  demo: {
    label: 'Demo',
    icon: Music,
    color: 'text-orange-500',
    accept: 'audio/*',
    description: 'Demo recordings',
  },
  sample: {
    label: 'Sample',
    icon: Mic2,
    color: 'text-orange-500',
    accept: 'audio/*',
    description: 'Audio samples',
  },
  loop: {
    label: 'Loop',
    icon: Radio,
    color: 'text-orange-500',
    accept: 'audio/*',
    description: 'Audio loops',
  },
  lyrics: {
    label: 'Lyrics',
    icon: ScrollText,
    color: 'text-purple-500',
    accept: '.txt,.md,.rtf,.doc,.docx,.pdf',
    description: 'Lyric sheets',
  },
  chords: {
    label: 'Chords',
    icon: FileMusic,
    color: 'text-blue-500',
    accept: '.txt,.pdf,.png,.jpg,.chordpro,.cho',
    description: 'Chord charts',
  },
  sheet_music: {
    label: 'Sheet Music',
    icon: Piano,
    color: 'text-indigo-500',
    accept: '.pdf,.png,.jpg,.musicxml',
    description: 'Notation',
  },
  midi: {
    label: 'MIDI',
    icon: FileAudio,
    color: 'text-cyan-500',
    accept: '.mid,.midi',
    description: 'MIDI files',
  },
  image: {
    label: 'Image',
    icon: ImageIcon,
    color: 'text-pink-500',
    accept: 'image/*',
    description: 'Album art',
  },
  document: {
    label: 'Document',
    icon: FileText,
    color: 'text-emerald-500',
    accept: '.pdf,.doc,.docx,.txt',
    description: 'Documents',
  },
  project: {
    label: 'Project',
    icon: FolderOpen,
    color: 'text-yellow-500',
    accept: '.als,.flp,.logic,.ptx',
    description: 'DAW projects',
  },
  other: {
    label: 'Other',
    icon: File,
    color: 'text-gray-500',
    accept: '*',
    description: 'Any file',
  },
};

export default function LibraryPage() {
  const { user, loading: authLoading } = useRequireAuth();

  // View and UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCollections, setShowCollections] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LibraryFileType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'size' | 'playCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [bpmRange, setBpmRange] = useState<[number | null, number | null]>([null, null]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Playback state
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Modal state
  const [viewingFile, setViewingFile] = useState<{
    url: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [editingFile, setEditingFile] = useState<LibraryFile | null>(null);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedType, setDraggedType] = useState<LibraryFileType>('other');
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    files,
    isLoading,
    error: libraryError,
    hasMore,
    loadMore,
    deleteFile,
    deleteFiles,
    toggleFavorite,
    incrementPlayCount,
    moveToCollection,
    total,
  } = useLibrary({
    type: filterType,
    search: searchQuery,
    sortBy,
    sortOrder,
    collectionId: selectedCollection || undefined,
    isFavorite: showFavorites || undefined,
    bpmMin: bpmRange[0] || undefined,
    bpmMax: bpmRange[1] || undefined,
    musicalKey: selectedKey || undefined,
    mood: selectedMood || undefined,
  });

  const {
    upload,
    uploadMultiple,
    uploading,
    progress,
    error: uploadError,
    uploads,
  } = useLibraryUpload();
  const { collections, createCollection, deleteCollection } = useLibraryCollections();
  const { stats } = useLibraryStats();

  // Format file size
  const formatFileSize = (bytesStr: string): string => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'Unknown';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if file is audio
  const isAudio = (mimeType: string) => mimeType.startsWith('audio/') && !mimeType.includes('midi');

  // Check if file is viewable
  const isViewable = (mimeType: string, fileName: string) =>
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/') ||
    fileName.match(/\.(txt|md|rtf|chordpro|cho|crd)$/i);

  // Get type icon
  const getTypeIcon = (type: LibraryFileType) => {
    const config = FILE_TYPE_CONFIG[type];
    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.color}`} />;
  };

  // Handle drag & drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length === 0) return;

      // Detect file types and upload
      for (const file of droppedFiles) {
        let type: LibraryFileType = 'other';

        if (file.type.startsWith('audio/')) {
          type = 'demo'; // Default audio to demo
        } else if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type === 'application/pdf' || file.name.match(/\.(pdf)$/i)) {
          type = 'document';
        } else if (file.name.match(/\.(txt|md|rtf)$/i)) {
          type = 'lyrics';
        } else if (file.name.match(/\.(mid|midi)$/i)) {
          type = 'midi';
        }

        try {
          await upload(file, type);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }
    },
    [upload]
  );

  // Handle file upload from input
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, type: LibraryFileType) => {
      const files = event.target.files;
      if (!files || files.length === 0 || !user) return;

      for (const file of Array.from(files)) {
        try {
          await upload(file, type);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }

      event.target.value = '';
    },
    [upload, user]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (fileId: string) => {
      if (!confirm('Delete this file from your library?')) return;
      try {
        await deleteFile(fileId);
        if (playingId === fileId) setPlayingId(null);
      } catch (err) {
        alert('Failed to delete file');
      }
    },
    [deleteFile, playingId]
  );

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} selected file(s)?`)) return;
    try {
      await deleteFiles(Array.from(selectedFiles));
      setSelectedFiles(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      alert('Failed to delete files');
    }
  }, [selectedFiles, deleteFiles]);

  // Handle play
  const handlePlay = useCallback(
    async (file: LibraryFile) => {
      if (playingId === file.id) {
        setPlayingId(null);
      } else {
        setPlayingId(file.id);
        await incrementPlayCount(file.id);
      }
    },
    [playingId, incrementPlayCount]
  );

  // Handle create collection
  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim()) return;
    try {
      await createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowNewCollection(false);
    } catch (err) {
      alert('Failed to create collection');
    }
  }, [newCollectionName, createCollection]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setIsSelectionMode(false);
        setSelectedFiles(new Set());
        setViewingFile(null);
      }
      if (e.key === 'g') setViewMode('grid');
      if (e.key === 'l') setViewMode('list');
      if (e.key === 'f') setShowFavorites(!showFavorites);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFavorites]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterType !== 'all') count++;
    if (showFavorites) count++;
    if (bpmRange[0] || bpmRange[1]) count++;
    if (selectedKey) count++;
    if (selectedMood) count++;
    return count;
  }, [filterType, showFavorites, bpmRange, selectedKey, selectedMood]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <div className="text-center">
            <div className="text-lg font-medium text-white">Loading your library...</div>
            <div className="mt-2 text-sm text-gray-400">Preparing your files</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropZoneRef}
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          url={viewingFile.url}
          name={viewingFile.name}
          mimeType={viewingFile.mimeType}
          onClose={() => setViewingFile(null)}
        />
      )}

      {/* Global Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-orange-500 bg-orange-500/10 p-12"
            >
              <Upload className="h-16 w-16 text-orange-500" />
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">Drop files here</h3>
                <p className="mt-1 text-gray-400">Release to upload to your library</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Collections Sidebar */}
        <AnimatePresence>
          {showCollections && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden shrink-0 border-r border-gray-800 bg-gray-950/50 lg:block"
            >
              <div className="sticky top-0 flex h-screen flex-col p-4">
                {/* Logo */}
                <Link href="/" className="mb-6 flex justify-center">
                  <Image
                    src="/logo-light.png"
                    alt="Rock N' Roll Basement"
                    width={140}
                    height={56}
                    priority
                    className="transition-all duration-300 hover:scale-105"
                  />
                </Link>

                {/* Quick Filters */}
                <div className="mb-4 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCollection(null);
                      setShowFavorites(false);
                      setFilterType('all');
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      !selectedCollection && !showFavorites
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Folder className="h-4 w-4" />
                    <span>All Files</span>
                    <span className="ml-auto text-xs text-gray-500">{total}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowFavorites(true);
                      setSelectedCollection(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      showFavorites
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favorites</span>
                    <span className="ml-auto text-xs text-gray-500">{stats?.favorites || 0}</span>
                  </button>

                  <button
                    onClick={() => setSortBy('playCount')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      sortBy === 'playCount'
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Most Played</span>
                  </button>

                  <button
                    onClick={() => setSortBy('createdAt')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      sortBy === 'createdAt'
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Recently Added</span>
                  </button>
                </div>

                {/* Collections */}
                <div className="flex-1 overflow-y-auto">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Collections
                    </h3>
                    <button
                      onClick={() => setShowNewCollection(true)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* New Collection Input */}
                  {showNewCollection && (
                    <div className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Collection name"
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateCollection();
                          if (e.key === 'Escape') setShowNewCollection(false);
                        }}
                      />
                      <button
                        onClick={handleCreateCollection}
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm text-white hover:bg-orange-600"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    {collections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => {
                          setSelectedCollection(collection.id);
                          setShowFavorites(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                          selectedCollection === collection.id
                            ? 'bg-orange-500/20 text-orange-500'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: collection.color || '#6b7280' }}
                        />
                        <span className="truncate">{collection.name}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {collection.fileCount || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Storage Stats */}
                {stats && (
                  <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                      <HardDrive className="h-3 w-3" />
                      <span>Storage Used</span>
                    </div>
                    <div className="mb-1 text-lg font-semibold text-white">
                      {formatFileSize(stats.totalSize.toString())}
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800">
                      <div
                        className="h-1.5 rounded-full bg-orange-500"
                        style={{
                          width: `${Math.min((stats.totalSize / (5 * 1024 * 1024 * 1024)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-center lg:hidden"
            >
              <Link href="/" className="group relative inline-block">
                <Image
                  src="/logo-light.png"
                  alt="Rock N' Roll Basement"
                  width={140}
                  height={56}
                  priority
                  className="transition-all duration-300 group-hover:scale-105"
                />
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">My Library</h1>
                  <p className="mt-1 text-sm text-gray-400">
                    {total} file{total !== 1 ? 's' : ''} • Your complete songwriter toolkit
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Collections */}
                  <button
                    onClick={() => setShowCollections(!showCollections)}
                    className={`hidden rounded-lg p-2 transition-all lg:block ${
                      showCollections
                        ? 'bg-orange-500/20 text-orange-500'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <Folder className="h-5 w-5" />
                  </button>

                  {/* View Toggle */}
                  <div className="flex rounded-lg bg-gray-900 p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded-md p-2 transition-all ${
                        viewMode === 'grid'
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded-md p-2 transition-all ${
                        viewMode === 'list'
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Statistics Cards */}
            {showStats && stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4"
              >
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                      <Music2 className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.totalFiles}</div>
                      <div className="text-xs text-gray-400">Total Files</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20">
                      <Heart className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.favorites}</div>
                      <div className="text-xs text-gray-400">Favorites</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <FileType className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {Object.keys(stats.byType || {}).length}
                      </div>
                      <div className="text-xs text-gray-400">File Types</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                      <HardDrive className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {formatFileSize(stats.totalSize.toString())}
                      </div>
                      <div className="text-xs text-gray-400">Storage Used</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 space-y-4"
            >
              <div className="flex gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search files, lyrics, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all ${
                    showFilters || activeFiltersCount > 0
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Expanded Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50"
                  >
                    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Type Filter */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-400">
                          File Type
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as LibraryFileType | 'all')}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                        >
                          <option value="all">All Types</option>
                          {Object.entries(FILE_TYPE_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Key Filter */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-400">
                          Musical Key
                        </label>
                        <select
                          value={selectedKey || ''}
                          onChange={(e) => setSelectedKey(e.target.value || null)}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                        >
                          <option value="">Any Key</option>
                          {MUSICAL_KEYS.map((key) => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Mood Filter */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-400">Mood</label>
                        <select
                          value={selectedMood || ''}
                          onChange={(e) => setSelectedMood(e.target.value || null)}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                        >
                          <option value="">Any Mood</option>
                          {MOODS.map((mood) => (
                            <option key={mood} value={mood}>
                              {mood}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* BPM Range */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-400">
                          BPM Range
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={bpmRange[0] || ''}
                            onChange={(e) =>
                              setBpmRange([
                                e.target.value ? parseInt(e.target.value) : null,
                                bpmRange[1],
                              ])
                            }
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={bpmRange[1] || ''}
                            onChange={(e) =>
                              setBpmRange([
                                bpmRange[0],
                                e.target.value ? parseInt(e.target.value) : null,
                              ])
                            }
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="border-t border-gray-800 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-400">Sort by:</span>
                        {[
                          { value: 'createdAt', label: 'Date Added' },
                          { value: 'name', label: 'Name' },
                          { value: 'size', label: 'Size' },
                          { value: 'playCount', label: 'Play Count' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSortBy(option.value as any)}
                            className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                              sortBy === option.value
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="ml-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                        >
                          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Type Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.entries(FILE_TYPE_CONFIG)
                  .slice(0, 8)
                  .map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setFilterType(filterType === key ? 'all' : (key as LibraryFileType))
                      }
                      className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        filterType === key
                          ? 'bg-orange-500 text-white'
                          : 'border border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <config.icon className="h-3.5 w-3.5" />
                      {config.label}
                    </button>
                  ))}
              </div>

              {/* Selection Mode Bar */}
              {isSelectionMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3"
                >
                  <CheckSquare className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-white">{selectedFiles.size} selected</span>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setSelectedFiles(new Set(files.map((f) => f.id)))}
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
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedFiles(new Set());
                      }}
                      className="rounded-lg bg-gray-800 p-1.5 text-gray-400 hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Upload Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Object.entries(FILE_TYPE_CONFIG)
                  .slice(0, 6)
                  .map(([key, config]) => (
                    <label
                      key={key}
                      className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-orange-500 hover:bg-gray-800/50"
                    >
                      <config.icon className="h-6 w-6 text-gray-500 transition-colors group-hover:text-orange-500" />
                      <span className="text-xs font-medium text-gray-400 group-hover:text-white">
                        {config.label}
                      </span>
                      <input
                        type="file"
                        accept={config.accept}
                        multiple
                        onChange={(e) => handleFileUpload(e, key as LibraryFileType)}
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
                  className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-4"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <Upload className="h-5 w-5 animate-pulse text-orange-500" />
                    <span className="text-white">Uploading... {progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800">
                    <motion.div
                      className="h-2 rounded-full bg-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Errors */}
              {(uploadError || libraryError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                >
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-400">{uploadError || libraryError}</p>
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
                className="rounded-2xl border border-gray-800 bg-gray-900/50 p-12 text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10">
                  <Folder className="h-10 w-10 text-orange-500" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">
                  {searchQuery || filterType !== 'all' || showFavorites
                    ? 'No files found'
                    : 'Your Library is Empty'}
                </h2>
                <p className="mx-auto max-w-md text-gray-400">
                  {searchQuery || filterType !== 'all' || showFavorites
                    ? 'Try adjusting your search or filters'
                    : 'Drag and drop files here, or click the upload buttons above to add your first files.'}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Selection Toggle */}
                {!isSelectionMode && files.length > 0 && (
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="text-sm text-orange-500 hover:text-orange-400"
                    >
                      Select Multiple
                    </button>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
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
                            : 'border-gray-800 bg-gray-900/50 hover:border-orange-500/50'
                        } ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'}`}
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

                        {/* Favorite Badge */}
                        {file.isFavorite && (
                          <div className="absolute right-3 top-3">
                            <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          className={`${viewMode === 'grid' ? 'mb-3' : ''} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-800`}
                        >
                          {getTypeIcon(file.type)}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-white group-hover:text-orange-500">
                            {file.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            <span className="capitalize">{file.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.size)}</span>
                            {file.duration && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(file.duration)}</span>
                              </>
                            )}
                            {file.bpm && (
                              <>
                                <span>•</span>
                                <span>{file.bpm} BPM</span>
                              </>
                            )}
                            {file.musicalKey && (
                              <>
                                <span>•</span>
                                <span>{file.musicalKey}</span>
                              </>
                            )}
                          </div>

                          {/* Tags */}
                          {file.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {file.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
                                >
                                  {tag}
                                </span>
                              ))}
                              {file.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{file.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Audio Player */}
                          {playingId === file.id && isAudio(file.mimeType) && (
                            <div className="mt-3">
                              <AudioPlayer
                                src={file.url}
                                name={file.name}
                                onEnded={() => setPlayingId(null)}
                                className="!p-2"
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {!isSelectionMode && (
                          <div
                            className={`${viewMode === 'grid' ? 'mt-3 border-t border-gray-800 pt-3' : ''} flex items-center gap-1`}
                          >
                            {/* Play/Pause for audio */}
                            {isAudio(file.mimeType) && (
                              <button
                                onClick={() => handlePlay(file)}
                                className="rounded-lg bg-orange-500/10 p-2 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                              >
                                {playingId === file.id ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </button>
                            )}

                            {/* View button */}
                            {isViewable(file.mimeType, file.name) && (
                              <button
                                onClick={() =>
                                  setViewingFile({
                                    url: file.url,
                                    name: file.name,
                                    mimeType: file.mimeType,
                                  })
                                }
                                className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-all hover:bg-blue-500/20 hover:text-blue-500"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}

                            {/* Favorite */}
                            <button
                              onClick={() => toggleFavorite(file.id)}
                              className={`rounded-lg p-2 transition-all ${
                                file.isFavorite
                                  ? 'bg-pink-500/20 text-pink-500'
                                  : 'bg-gray-800 text-gray-400 hover:bg-pink-500/20 hover:text-pink-500'
                              }`}
                            >
                              <Heart
                                className={`h-4 w-4 ${file.isFavorite ? 'fill-current' : ''}`}
                              />
                            </button>

                            {/* Download */}
                            <a
                              href={file.url}
                              download
                              className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-all hover:bg-gray-700 hover:text-white"
                            >
                              <Download className="h-4 w-4" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="rounded-xl border border-gray-800 bg-gray-900 px-8 py-3 font-medium text-white transition-all hover:border-orange-500 hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Keyboard Shortcuts Help */}
            <div className="mt-8 text-center text-xs text-gray-600">
              <kbd className="rounded bg-gray-800 px-1.5 py-0.5">G</kbd> Grid •{' '}
              <kbd className="rounded bg-gray-800 px-1.5 py-0.5">L</kbd> List •{' '}
              <kbd className="rounded bg-gray-800 px-1.5 py-0.5">F</kbd> Favorites •{' '}
              <kbd className="rounded bg-gray-800 px-1.5 py-0.5">Esc</kbd> Cancel
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
