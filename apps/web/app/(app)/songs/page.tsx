'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Search,
  Folder,
  FolderOpen,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileEdit,
  AlertCircle,
  Loader2,
  Grid3x3,
  List,
  SlidersHorizontal,
  Music2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';

// Note: useRouter is used in SongCard component

import { ProjectSelector } from '@/components/project-selector';
import { useRequireAuth } from '@/hooks/use-require-auth';

// Types
type Song = {
  id: string;
  title: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
  status: 'draft' | 'in_progress' | 'needs_review' | 'complete';
  visibility: string;
  lyrics?: string;
  tags?: string;
  projectId?: string;
  lastSavedAt?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    coverImage?: string;
  };
};

type SongStats = {
  total: number;
  standalone: number;
  inProject: number;
  drafts: number;
  complete: number;
};

type FilterType = 'all' | 'standalone' | 'in_project';
type StatusFilter = 'all' | 'draft' | 'in_progress' | 'needs_review' | 'complete';

// Status configuration
const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileEdit, color: 'text-gray-400', bg: 'bg-gray-500/20' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  needs_review: {
    label: 'Needs Review',
    icon: AlertCircle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
  },
  complete: {
    label: 'Complete',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
  },
};

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
        active
          ? 'border-orange-500 bg-orange-500/10'
          : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          active ? 'bg-orange-500' : 'bg-gray-800'
        }`}
      >
        <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </motion.button>
  );
}

// Song Card Component
function SongCard({
  song,
  viewMode,
  onProjectAdded,
}: {
  song: Song;
  viewMode: 'grid' | 'list';
  onProjectAdded?: () => void;
}) {
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[song.status];
  const StatusIcon = statusConfig.icon;

  const handleOpenSong = () => {
    if (song.project) {
      router.push(`/projects/${song.project.slug}/songs/${song.id}`);
    } else {
      // For standalone songs, open in songwriting tool with the song loaded
      router.push(`/songwriting?song=${song.id}`);
    }
  };

  const lyricsPreview = useMemo(() => {
    if (!song.lyrics) return null;
    const lines = song.lyrics.split('\n').filter((l) => l.trim() && !l.startsWith('['));
    return lines.slice(0, 2).join(' • ').substring(0, 80);
  }, [song.lyrics]);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="group flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-orange-500/50"
      >
        {/* Icon/Cover */}
        <button
          onClick={handleOpenSong}
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-800"
          aria-label={`Open ${song.title}`}
        >
          {song.project?.coverImage ? (
            <img
              src={song.project.coverImage}
              alt=""
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <Music className="h-6 w-6 text-orange-500" />
          )}
        </button>

        {/* Info */}
        <button
          className="min-w-0 flex-1 cursor-pointer text-left"
          onClick={handleOpenSong}
          aria-label={`Open ${song.title}`}
        >
          <h3 className="truncate font-semibold text-white group-hover:text-orange-500">
            {song.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {song.key && <span>{song.key}</span>}
            {song.tempo && <span>{song.tempo} BPM</span>}
            {song.timeSignature && <span>{song.timeSignature}</span>}
            {lyricsPreview && <span className="truncate text-gray-500">{lyricsPreview}...</span>}
          </div>
        </button>

        {/* Project Badge */}
        {song.project ? (
          <Link
            href={`/projects/${song.project.slug}`}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
          >
            <Folder className="h-3 w-3" />
            {song.project.name}
          </Link>
        ) : (
          <ProjectSelector songId={song.id} onProjectAdded={onProjectAdded} className="shrink-0" />
        )}

        {/* Status */}
        <div
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${statusConfig.bg}`}
        >
          <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
          <span className={statusConfig.color}>{statusConfig.label}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleOpenSong}
            className="rounded-lg bg-orange-500/10 p-2 text-orange-500 hover:bg-orange-500 hover:text-white"
            title="Open Song"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-orange-500/50"
    >
      {/* Status Badge */}
      <div
        className={`absolute right-3 top-3 flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${statusConfig.bg}`}
      >
        <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
      </div>

      {/* Content */}
      <button
        className="w-full cursor-pointer text-left"
        onClick={handleOpenSong}
        aria-label={`Open ${song.title}`}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800">
          <Music className="h-6 w-6 text-orange-500" />
        </div>

        <h3 className="mb-1 truncate font-semibold text-white group-hover:text-orange-500">
          {song.title}
        </h3>

        {/* Metadata */}
        <div className="mb-3 flex flex-wrap gap-1.5 text-xs text-gray-500">
          {song.key && <span className="rounded bg-gray-800 px-2 py-0.5">{song.key}</span>}
          {song.tempo && <span className="rounded bg-gray-800 px-2 py-0.5">{song.tempo} BPM</span>}
        </div>

        {/* Lyrics Preview */}
        {lyricsPreview && (
          <p className="mb-3 line-clamp-2 text-xs text-gray-500">{lyricsPreview}...</p>
        )}
      </button>

      {/* Project Info */}
      <div className="mt-auto border-t border-gray-800 pt-3">
        {song.project ? (
          <Link
            href={`/projects/${song.project.slug}`}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white"
          >
            <Folder className="h-3 w-3 text-orange-500" />
            <span className="truncate">{song.project.name}</span>
            <ChevronRight className="ml-auto h-3 w-3" />
          </Link>
        ) : (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <FolderOpen className="h-3 w-3" />
              Not in a project
            </span>
            <ProjectSelector
              songId={song.id}
              onProjectAdded={onProjectAdded}
              allowNavigation={false}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SongsPage() {
  const { user, loading: authLoading } = useRequireAuth();

  // State
  const [songs, setSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch songs
  const fetchSongs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('filter', filterType);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const response = await fetch(`/api/songs/all?${params}`);
      if (!response.ok) throw new Error('Failed to fetch songs');

      const data = await response.json();
      setSongs(data.songs);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, [user, filterType, statusFilter, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Debounced search - only trigger on searchQuery changes, not fetchSongs
  useEffect(() => {
    const timer = setTimeout(fetchSongs, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-center"
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                  <Music2 className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">My Songs</h1>
                  <p className="text-sm text-gray-400">All your songs in one place</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/songwriting"
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-medium text-white transition-all hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                New Song
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5"
          >
            <StatCard
              label="Total Songs"
              value={stats.total}
              icon={Music2}
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
            />
            <StatCard
              label="Standalone"
              value={stats.standalone}
              icon={FolderOpen}
              active={filterType === 'standalone'}
              onClick={() => setFilterType('standalone')}
            />
            <StatCard
              label="In Projects"
              value={stats.inProject}
              icon={Folder}
              active={filterType === 'in_project'}
              onClick={() => setFilterType('in_project')}
            />
            <StatCard
              label="Drafts"
              value={stats.drafts}
              icon={FileEdit}
              active={statusFilter === 'draft'}
              onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')}
            />
            <StatCard
              label="Complete"
              value={stats.complete}
              icon={CheckCircle2}
              active={statusFilter === 'complete'}
              onClick={() => setStatusFilter(statusFilter === 'complete' ? 'all' : 'complete')}
            />
          </motion.div>
        )}

        {/* Search & Filters */}
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
                placeholder="Search songs by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* View Toggle */}
            <div className="flex rounded-xl bg-gray-900 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all ${
                showFilters
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                  : 'border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
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
                <div className="grid gap-4 p-4 sm:grid-cols-3">
                  {/* Status Filter */}
                  <div>
                    <label
                      htmlFor="status-filter"
                      className="mb-2 block text-xs font-medium text-gray-400"
                    >
                      Status
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="in_progress">In Progress</option>
                      <option value="needs_review">Needs Review</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label
                      htmlFor="sort-by"
                      className="mb-2 block text-xs font-medium text-gray-400"
                    >
                      Sort By
                    </label>
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="updatedAt">Last Updated</option>
                      <option value="createdAt">Date Created</option>
                      <option value="title">Title</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label
                      htmlFor="sort-order"
                      className="mb-2 block text-xs font-medium text-gray-400"
                    >
                      Order
                    </label>
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center"
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h3 className="mb-2 text-lg font-semibold text-white">Error Loading Songs</h3>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={fetchSongs}
              className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-red-400 hover:bg-red-500/30"
            >
              Try Again
            </button>
          </motion.div>
        ) : songs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-800 bg-gray-900/50 p-12 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10">
              <Music className="h-10 w-10 text-orange-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">
              {searchQuery || filterType !== 'all' || statusFilter !== 'all'
                ? 'No songs found'
                : 'Start Your Musical Journey'}
            </h2>
            <p className="mx-auto mb-6 max-w-md text-gray-400">
              {searchQuery || filterType !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first song to begin building your musical catalog'}
            </p>
            {!searchQuery && filterType === 'all' && statusFilter === 'all' && (
              <Link
                href="/songwriting"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
              >
                <Sparkles className="h-4 w-4" />
                Create Your First Song
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-3'
            }
          >
            {songs.map((song) => (
              <SongCard key={song.id} song={song} viewMode={viewMode} onProjectAdded={fetchSongs} />
            ))}
          </motion.div>
        )}

        {/* Helpful Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 rounded-xl border border-gray-800 bg-gray-900/30 p-6"
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Sparkles className="h-4 w-4 text-orange-500" />
            Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>
                <strong>Standalone songs</strong> can be added to projects anytime using the "Add to
                Project" button
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>
                Use <strong>status filters</strong> to track song progress from draft to complete
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>
                Click any song to open it in the <strong>Songwriting Studio</strong> or project view
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
