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
  Star,
  Eye,
  Download,
  CheckSquare,
  Square,
  X,
  RefreshCw,
  Keyboard,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { ProjectSelector } from '@/components/project-selector';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { EmptyState } from '@/components/workshop';
import { microCopy } from '@/lib/workshop-voice';

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
  isFavorite?: boolean;
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
  favorites?: number;
};

type FilterType = 'all' | 'standalone' | 'in_project' | 'favorites';
type StatusFilter = 'all' | 'draft' | 'in_progress' | 'needs_review' | 'complete';

// Status configuration with progress values
const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    icon: FileEdit,
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    progress: 25,
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    progress: 50,
  },
  needs_review: {
    label: 'Needs Review',
    icon: AlertCircle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    progress: 75,
  },
  complete: {
    label: 'Complete',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    progress: 100,
  },
};

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

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

// Quick Preview Modal
function QuickPreviewModal({
  song,
  onClose,
  onEdit,
}: {
  song: Song;
  onClose: () => void;
  onEdit: () => void;
}) {
  const statusConfig = STATUS_CONFIG[song.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
              <Music className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{song.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {song.key && <span>{song.key}</span>}
                {song.tempo && <span>• {song.tempo} BPM</span>}
                <span className={statusConfig.color}>• {statusConfig.label}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              <ExternalLink className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="border-b border-gray-800 px-4 py-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-400">Progress</span>
            <span className={statusConfig.color}>{statusConfig.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${statusConfig.progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {song.lyrics ? (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
              {song.lyrics}
            </pre>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Music className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No lyrics yet</p>
              <button
                onClick={onEdit}
                className="mt-3 text-sm text-orange-500 hover:text-orange-400"
              >
                Add lyrics →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last edited {formatRelativeTime(song.updatedAt)}</span>
            {song.project && (
              <Link
                href={`/projects/${song.project.slug}`}
                className="flex items-center gap-1 text-orange-500 hover:text-orange-400"
              >
                <Folder className="h-3 w-3" />
                {song.project.name}
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Song Card Component with enhanced features
function SongCard({
  song,
  viewMode,
  isSelected,
  isFocused,
  onSelect,
  onToggleFavorite,
  onPreview,
  onProjectAdded,
}: {
  song: Song;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onPreview: () => void;
  onProjectAdded?: () => void;
}) {
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[song.status];
  const StatusIcon = statusConfig.icon;

  const handleOpenSong = () => {
    if (song.project) {
      router.push(`/projects/${song.project.slug}/songs/${song.id}`);
    } else {
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
        className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
          isFocused
            ? 'border-orange-500 bg-orange-500/5'
            : isSelected
              ? 'border-orange-500/50 bg-orange-500/10'
              : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
        }`}
      >
        {/* Selection Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="shrink-0 rounded p-1 hover:bg-gray-800"
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-orange-500" />
          ) : (
            <Square className="h-5 w-5 text-gray-600 group-hover:text-gray-400" />
          )}
        </button>

        {/* Favorite Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="shrink-0 rounded p-1 hover:bg-gray-800"
        >
          <Star
            className={`h-5 w-5 ${
              song.isFavorite
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-600 hover:text-yellow-500'
            }`}
          />
        </button>

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
        <button className="min-w-0 flex-1 cursor-pointer text-left" onClick={handleOpenSong}>
          <h3 className="truncate font-semibold text-white group-hover:text-orange-500">
            {song.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {song.key && <span>{song.key}</span>}
            {song.tempo && <span>{song.tempo} BPM</span>}
            <span className="text-gray-600">•</span>
            <span className="text-gray-500">{formatRelativeTime(song.updatedAt)}</span>
            {lyricsPreview && (
              <span className="hidden truncate text-gray-500 lg:inline">{lyricsPreview}...</span>
            )}
          </div>
        </button>

        {/* Progress Bar */}
        <div className="hidden w-24 shrink-0 md:block">
          <div className="mb-1 text-right text-xs text-gray-500">{statusConfig.progress}%</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
              style={{ width: `${statusConfig.progress}%` }}
            />
          </div>
        </div>

        {/* Project Badge */}
        {song.project ? (
          <Link
            href={`/projects/${song.project.slug}`}
            className="hidden items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 sm:flex"
          >
            <Folder className="h-3 w-3" />
            {song.project.name}
          </Link>
        ) : (
          <div className="hidden sm:block">
            <ProjectSelector
              songId={song.id}
              onProjectAdded={onProjectAdded}
              className="shrink-0"
            />
          </div>
        )}

        {/* Status */}
        <div
          className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:flex ${statusConfig.bg}`}
        >
          <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
          <span className={statusConfig.color}>{statusConfig.label}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-800 hover:text-white"
            title="Quick Preview (P)"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenSong}
            className="rounded-lg bg-orange-500/10 p-2 text-orange-500 hover:bg-orange-500 hover:text-white"
            title="Open Song (Enter)"
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
      className={`group relative rounded-xl border p-4 transition-all ${
        isFocused
          ? 'border-orange-500 bg-orange-500/5'
          : isSelected
            ? 'border-orange-500/50 bg-orange-500/10'
            : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
      }`}
    >
      {/* Top Row: Checkbox, Favorite, Status */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="rounded p-1 hover:bg-gray-800"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-orange-500" />
            ) : (
              <Square className="h-4 w-4 text-gray-600 group-hover:text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="rounded p-1 hover:bg-gray-800"
          >
            <Star
              className={`h-4 w-4 ${
                song.isFavorite
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-gray-600 hover:text-yellow-500'
              }`}
            />
          </button>
        </div>
        <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${statusConfig.bg}`}>
          <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
        </div>
      </div>

      {/* Content */}
      <button className="w-full cursor-pointer text-left" onClick={handleOpenSong}>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800">
          <Music className="h-6 w-6 text-orange-500" />
        </div>

        <h3 className="mb-1 truncate font-semibold text-white group-hover:text-orange-500">
          {song.title}
        </h3>

        {/* Metadata */}
        <div className="mb-2 flex flex-wrap gap-1.5 text-xs text-gray-500">
          {song.key && <span className="rounded bg-gray-800 px-2 py-0.5">{song.key}</span>}
          {song.tempo && <span className="rounded bg-gray-800 px-2 py-0.5">{song.tempo} BPM</span>}
        </div>

        {/* Last edited */}
        <p className="mb-2 text-xs text-gray-600">{formatRelativeTime(song.updatedAt)}</p>
      </button>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-1 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
            style={{ width: `${statusConfig.progress}%` }}
          />
        </div>
      </div>

      {/* Project Info */}
      <div className="border-t border-gray-800 pt-3">
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
              Not in project
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
              title="Preview"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Bulk Actions Bar
function BulkActionsBar({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkStatusChange,
  onBulkExport,
  totalCount,
}: {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkExport: () => void;
  totalCount: number;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-900/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-orange-500" />
          <span className="font-medium text-white">{selectedCount} selected</span>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        <button
          onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
          className="text-sm text-gray-400 hover:text-white"
        >
          {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
        </button>

        <div className="h-6 w-px bg-gray-700" />

        {/* Bulk Status Change */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Change Status
          </button>
          {showStatusMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-40 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    onBulkStatusChange(key);
                    setShowStatusMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Add to Project */}
        <ProjectSelector
          songId={undefined}
          allowNavigation={false}
          className="!bg-gray-800 hover:!bg-gray-700"
        />

        {/* Export */}
        <button
          onClick={onBulkExport}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
        >
          <Download className="h-4 w-4" />
          Export
        </button>

        <div className="h-6 w-px bg-gray-700" />

        <button
          onClick={onClearSelection}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}

// Keyboard Shortcuts Help
function KeyboardShortcutsHelp({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: 'j / ↓', desc: 'Move down' },
    { key: 'k / ↑', desc: 'Move up' },
    { key: 'Enter', desc: 'Open selected song' },
    { key: 'Space', desc: 'Toggle selection' },
    { key: 'p', desc: 'Quick preview' },
    { key: 's', desc: 'Toggle favorite' },
    { key: 'a', desc: 'Select all' },
    { key: 'Esc', desc: 'Clear selection / Close' },
    { key: 'g', desc: 'Grid view' },
    { key: 'l', desc: 'List view' },
    { key: '?', desc: 'Show shortcuts' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Keyboard className="h-5 w-5 text-orange-500" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {shortcuts.map(({ key, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2"
            >
              <span className="text-sm text-gray-400">{desc}</span>
              <kbd className="rounded bg-gray-700 px-2 py-0.5 text-xs text-white">{key}</kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SongsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const router = useRouter();

  // State
  const [songs, setSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & Navigation
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Preview
  const [previewSong, setPreviewSong] = useState<Song | null>(null);

  // Keyboard shortcuts help
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch songs
  const fetchSongs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterType === 'favorites') {
        params.set('favorites', 'true');
      } else if (filterType !== 'all') {
        params.set('filter', filterType);
      }
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(fetchSongs, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(
    async (songId: string) => {
      const song = songs.find((s) => s.id === songId);
      if (!song) return;

      // Optimistic update
      setSongs((prev) =>
        prev.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s))
      );

      try {
        await fetch(`/api/songs/${songId}/favorite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFavorite: !song.isFavorite }),
        });
      } catch {
        // Revert on error
        setSongs((prev) =>
          prev.map((s) => (s.id === songId ? { ...s, isFavorite: song.isFavorite } : s))
        );
      }
    },
    [songs]
  );

  // Bulk status change
  const handleBulkStatusChange = useCallback(
    async (status: string) => {
      const songIds = Array.from(selectedSongs);
      if (songIds.length === 0) return;

      // Optimistic update
      setSongs((prev) =>
        prev.map((s) => (selectedSongs.has(s.id) ? { ...s, status: status as Song['status'] } : s))
      );

      try {
        await fetch('/api/songs/bulk-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songIds, status }),
        });
        setSelectedSongs(new Set());
      } catch {
        fetchSongs(); // Revert by refetching
      }
    },
    [selectedSongs, fetchSongs]
  );

  // Bulk export
  const handleBulkExport = useCallback(() => {
    const selectedSongsList = songs.filter((s) => selectedSongs.has(s.id));

    let exportText = '# My Songs Export\n\n';
    selectedSongsList.forEach((song) => {
      exportText += `## ${song.title}\n`;
      exportText += `Status: ${STATUS_CONFIG[song.status].label}\n`;
      if (song.key) exportText += `Key: ${song.key}\n`;
      if (song.tempo) exportText += `Tempo: ${song.tempo} BPM\n`;
      if (song.project) exportText += `Project: ${song.project.name}\n`;
      exportText += '\n';
      if (song.lyrics) {
        exportText += `### Lyrics\n${song.lyrics}\n`;
      }
      exportText += '\n---\n\n';
    });

    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `songs-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [songs, selectedSongs]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Ignore if modal is open
      if (previewSong || showShortcuts) {
        if (e.key === 'Escape') {
          setPreviewSong(null);
          setShowShortcuts(false);
        }
        return;
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, songs.length - 1));
          break;
        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && songs[focusedIndex]) {
            const song = songs[focusedIndex];
            if (song.project) {
              router.push(`/projects/${song.project.slug}/songs/${song.id}`);
            } else {
              router.push(`/songwriting?song=${song.id}`);
            }
          }
          break;
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && songs[focusedIndex]) {
            const songId = songs[focusedIndex].id;
            setSelectedSongs((prev) => {
              const next = new Set(prev);
              if (next.has(songId)) {
                next.delete(songId);
              } else {
                next.add(songId);
              }
              return next;
            });
          }
          break;
        case 'p':
          e.preventDefault();
          if (focusedIndex >= 0 && songs[focusedIndex]) {
            setPreviewSong(songs[focusedIndex]);
          }
          break;
        case 's':
          e.preventDefault();
          if (focusedIndex >= 0 && songs[focusedIndex]) {
            handleToggleFavorite(songs[focusedIndex].id);
          }
          break;
        case 'a':
          e.preventDefault();
          if (selectedSongs.size === songs.length) {
            setSelectedSongs(new Set());
          } else {
            setSelectedSongs(new Set(songs.map((s) => s.id)));
          }
          break;
        case 'Escape':
          setSelectedSongs(new Set());
          setFocusedIndex(-1);
          break;
        case 'g':
          setViewMode('grid');
          break;
        case 'l':
          setViewMode('list');
          break;
        case '?':
          setShowShortcuts(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    songs,
    focusedIndex,
    selectedSongs,
    previewSong,
    showShortcuts,
    router,
    handleToggleFavorite,
  ]);

  // Favorites count (local calculation)
  const favoritesCount = useMemo(() => songs.filter((s) => s.isFavorite).length, [songs]);

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {microCopy.loading.songs}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex justify-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
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
                  <p className="text-sm text-gray-400">
                    {stats?.total || 0} songs • Press{' '}
                    <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-xs">?</kbd> for shortcuts
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShortcuts(true)}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Keyboard className="h-4 w-4" />
              </button>
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
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            <StatCard
              label="Total Songs"
              value={stats.total}
              icon={Music2}
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
            />
            <StatCard
              label="Favorites"
              value={favoritesCount}
              icon={Star}
              active={filterType === 'favorites'}
              onClick={() => setFilterType('favorites')}
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
                placeholder="Search songs by title... (type to filter)"
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
                title="Grid view (G)"
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
                title="List view (L)"
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
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {microCopy.loading.songs}
              </p>
            </div>
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
          searchQuery || filterType !== 'all' || statusFilter !== 'all' ? (
            <EmptyState
              type="noSearchResults"
              customTitle="No songs match your filters"
              customMessage="Try adjusting your search or filters to find what you're looking for."
              customSubtext="Sometimes the best discoveries come from starting fresh."
              customAction="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setFilterType('all');
                setStatusFilter('all');
              }}
              size="lg"
            />
          ) : (
            <EmptyState type="noSongs" size="lg" />
          )
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
            {songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                viewMode={viewMode}
                isSelected={selectedSongs.has(song.id)}
                isFocused={index === focusedIndex}
                onSelect={() => {
                  setSelectedSongs((prev) => {
                    const next = new Set(prev);
                    if (next.has(song.id)) {
                      next.delete(song.id);
                    } else {
                      next.add(song.id);
                    }
                    return next;
                  });
                }}
                onToggleFavorite={() => handleToggleFavorite(song.id)}
                onPreview={() => setPreviewSong(song)}
                onProjectAdded={fetchSongs}
              />
            ))}
          </motion.div>
        )}

        {/* Keyboard Shortcuts Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-xs text-gray-600"
        >
          <kbd className="rounded bg-gray-800 px-1.5 py-0.5">j</kbd>/
          <kbd className="rounded bg-gray-800 px-1.5 py-0.5">k</kbd> Navigate •{' '}
          <kbd className="rounded bg-gray-800 px-1.5 py-0.5">Space</kbd> Select •{' '}
          <kbd className="rounded bg-gray-800 px-1.5 py-0.5">Enter</kbd> Open •{' '}
          <kbd className="rounded bg-gray-800 px-1.5 py-0.5">p</kbd> Preview •{' '}
          <kbd className="rounded bg-gray-800 px-1.5 py-0.5">?</kbd> All shortcuts
        </motion.div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        <BulkActionsBar
          selectedCount={selectedSongs.size}
          totalCount={songs.length}
          onSelectAll={() => setSelectedSongs(new Set(songs.map((s) => s.id)))}
          onClearSelection={() => setSelectedSongs(new Set())}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkExport={handleBulkExport}
        />
      </AnimatePresence>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {previewSong && (
          <QuickPreviewModal
            song={previewSong}
            onClose={() => setPreviewSong(null)}
            onEdit={() => {
              if (previewSong.project) {
                router.push(`/projects/${previewSong.project.slug}/songs/${previewSong.id}`);
              } else {
                router.push(`/songwriting?song=${previewSong.id}`);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help */}
      <AnimatePresence>
        {showShortcuts && <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />}
      </AnimatePresence>
    </div>
  );
}
