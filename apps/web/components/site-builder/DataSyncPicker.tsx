'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Music,
  Calendar,
  Users,
  Trophy,
  Disc,
  Check,
  RefreshCw,
  Link2,
  Link2Off,
  Loader2,
  Filter,
  ChevronDown,
  Play,
  MapPin,
  Clock,
} from 'lucide-react';

// Types for different data sources
export interface SyncableSong {
  id: string;
  title: string;
  artist?: string;
  audioUrl?: string | null;
  coverUrl?: string | null;
  duration?: number;
  createdAt: Date;
  projectName?: string;
}

export interface SyncableShow {
  id: string;
  name: string;
  date: Date;
  venue?: {
    name: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
  ticketUrl?: string | null;
  status?: 'scheduled' | 'soldout' | 'cancelled';
  tourName?: string;
}

export interface SyncableMember {
  id: string;
  name: string;
  role?: string;
  image?: string | null;
  instruments?: string[];
}

export interface SyncableAward {
  id: string;
  name: string;
  organization?: string;
  year?: number;
  image?: string | null;
}

export interface SyncableRelease {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single';
  releaseDate: Date;
  coverUrl?: string | null;
  trackCount?: number;
}

export type SyncableItem =
  | { type: 'song'; data: SyncableSong }
  | { type: 'show'; data: SyncableShow }
  | { type: 'member'; data: SyncableMember }
  | { type: 'award'; data: SyncableAward }
  | { type: 'release'; data: SyncableRelease };

type DataType = 'songs' | 'shows' | 'members' | 'awards' | 'releases';

interface DataSyncPickerProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: DataType;
  currentSelection: string[]; // IDs of currently selected items
  onSelectionChange: (selectedIds: string[], selectedItems: SyncableItem[]) => void;
  sectionType?: string;
}

const dataTypeConfig: Record<
  DataType,
  {
    label: string;
    icon: typeof Music;
    color: string;
    description: string;
  }
> = {
  songs: {
    label: 'Songs',
    icon: Music,
    color: '#10b981',
    description: 'Import tracks from your library',
  },
  shows: {
    label: 'Tour Dates',
    icon: Calendar,
    color: '#f59e0b',
    description: 'Import upcoming shows and tours',
  },
  members: {
    label: 'Band Members',
    icon: Users,
    color: '#06b6d4',
    description: 'Import team member profiles',
  },
  awards: {
    label: 'Awards',
    icon: Trophy,
    color: '#eab308',
    description: 'Import achievements and certifications',
  },
  releases: {
    label: 'Releases',
    icon: Disc,
    color: '#8b5cf6',
    description: 'Import albums, EPs, and singles',
  },
};

export function DataSyncPicker({
  isOpen,
  onClose,
  dataType,
  currentSelection,
  onSelectionChange,
}: DataSyncPickerProps) {
  const [items, setItems] = useState<SyncableItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentSelection));
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [filterProject, setFilterProject] = useState<string | null>(null);

  const config = dataTypeConfig[dataType];
  const Icon = config.icon;

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sites/sync-data?type=${dataType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [dataType]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSelectedIds(new Set(currentSelection));
    }
  }, [isOpen, fetchData, currentSelection]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(
      new Set(
        filteredItems.map((item) => {
          switch (item.type) {
            case 'song':
              return item.data.id;
            case 'show':
              return item.data.id;
            case 'member':
              return item.data.id;
            case 'award':
              return item.data.id;
            case 'release':
              return item.data.id;
          }
        })
      )
    );
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const selectedItems = items.filter((item) => {
      const id =
        item.type === 'song'
          ? item.data.id
          : item.type === 'show'
            ? item.data.id
            : item.type === 'member'
              ? item.data.id
              : item.type === 'award'
                ? item.data.id
                : item.data.id;
      return selectedIds.has(id);
    });
    onSelectionChange(Array.from(selectedIds), selectedItems);
    onClose();
  };

  // Filter and sort items
  const filteredItems = items
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      switch (item.type) {
        case 'song':
          return (
            item.data.title.toLowerCase().includes(searchLower) ||
            item.data.artist?.toLowerCase().includes(searchLower) ||
            item.data.projectName?.toLowerCase().includes(searchLower)
          );
        case 'show':
          return (
            item.data.name.toLowerCase().includes(searchLower) ||
            item.data.venue?.name.toLowerCase().includes(searchLower) ||
            item.data.venue?.city?.toLowerCase().includes(searchLower)
          );
        case 'member':
          return (
            item.data.name.toLowerCase().includes(searchLower) ||
            item.data.role?.toLowerCase().includes(searchLower)
          );
        case 'award':
          return (
            item.data.name.toLowerCase().includes(searchLower) ||
            item.data.organization?.toLowerCase().includes(searchLower)
          );
        case 'release':
          return item.data.title.toLowerCase().includes(searchLower);
      }
    })
    .filter((item) => {
      if (!filterProject) return true;
      if (item.type === 'song') {
        return item.data.projectName === filterProject;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA =
          a.type === 'song'
            ? a.data.title
            : a.type === 'show'
              ? a.data.name
              : a.type === 'member'
                ? a.data.name
                : a.type === 'award'
                  ? a.data.name
                  : a.data.title;
        const nameB =
          b.type === 'song'
            ? b.data.title
            : b.type === 'show'
              ? b.data.name
              : b.type === 'member'
                ? b.data.name
                : b.type === 'award'
                  ? b.data.name
                  : b.data.title;
        return nameA.localeCompare(nameB);
      }

      const dateA =
        a.type === 'song'
          ? new Date(a.data.createdAt)
          : a.type === 'show'
            ? new Date(a.data.date)
            : a.type === 'release'
              ? new Date(a.data.releaseDate)
              : new Date();
      const dateB =
        b.type === 'song'
          ? new Date(b.data.createdAt)
          : b.type === 'show'
            ? new Date(b.data.date)
            : b.type === 'release'
              ? new Date(b.data.releaseDate)
              : new Date();

      return sortBy === 'newest'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  // Get unique projects for filtering
  const projects = [
    ...new Set(
      items
        .filter((item): item is { type: 'song'; data: SyncableSong } => item.type === 'song')
        .map((item) => item.data.projectName)
        .filter(Boolean)
    ),
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex flex-shrink-0 items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: config.color + '20' }}
              >
                <Icon size={24} style={{ color: config.color }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  Import {config.label}
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {config.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              style={{ color: 'var(--muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Toolbar */}
          <div
            className="flex flex-shrink-0 items-center gap-4 px-6 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${config.label.toLowerCase()}...`}
                className="w-full rounded-lg py-2 pl-10 pr-4"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none rounded-lg py-2 pl-3 pr-8"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
            </div>

            {/* Project Filter (for songs) */}
            {dataType === 'songs' && projects.length > 0 && (
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted)' }}
                />
                <select
                  value={filterProject || ''}
                  onChange={(e) => setFilterProject(e.target.value || null)}
                  className="appearance-none rounded-lg py-2 pl-9 pr-8"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted)' }}
                />
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="rounded-lg p-2 transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: 'var(--muted)' }}
              title="Refresh data"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Selection Controls */}
          <div
            className="flex flex-shrink-0 items-center justify-between px-6 py-2"
            style={{ background: 'var(--bg)' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                {selectedIds.size} of {filteredItems.length} selected
              </span>
              <button
                onClick={selectAll}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: config.color }}
              >
                Select All
              </button>
              <button
                onClick={selectNone}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--muted)' }}
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              {selectedIds.size > 0 ? (
                <>
                  <Link2 size={14} style={{ color: config.color }} />
                  <span>Items will sync with your dashboard</span>
                </>
              ) : (
                <>
                  <Link2Off size={14} />
                  <span>Select items to sync</span>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={32} className="animate-spin" style={{ color: config.color }} />
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p style={{ color: 'var(--text)' }} className="mb-2">
                  Failed to load data
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {error}
                </p>
                <button
                  onClick={fetchData}
                  className="mt-4 rounded-lg px-4 py-2 font-medium"
                  style={{ background: config.color, color: '#fff' }}
                >
                  Try Again
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Icon size={48} style={{ color: 'var(--muted)', opacity: 0.5 }} className="mb-4" />
                <p style={{ color: 'var(--text)' }}>
                  {searchQuery
                    ? 'No matching items found'
                    : `No ${config.label.toLowerCase()} in your dashboard`}
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  {searchQuery
                    ? 'Try a different search term'
                    : `Add ${config.label.toLowerCase()} to your dashboard first`}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredItems.map((item) => {
                  const id =
                    item.type === 'song'
                      ? item.data.id
                      : item.type === 'show'
                        ? item.data.id
                        : item.type === 'member'
                          ? item.data.id
                          : item.type === 'award'
                            ? item.data.id
                            : item.data.id;
                  const isSelected = selectedIds.has(id);

                  return (
                    <button
                      key={id}
                      onClick={() => toggleSelection(id)}
                      className={`flex items-center gap-4 rounded-xl p-4 text-left transition-all ${
                        isSelected ? 'ring-2' : 'hover:bg-white/5'
                      }`}
                      style={
                        {
                          background: isSelected ? config.color + '10' : 'var(--bg)',
                          border: `1px solid ${isSelected ? config.color : 'var(--border)'}`,
                          '--tw-ring-color': config.color,
                        } as React.CSSProperties
                      }
                    >
                      {/* Checkbox */}
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors ${
                          isSelected ? '' : 'border-2'
                        }`}
                        style={{
                          background: isSelected ? config.color : 'transparent',
                          borderColor: isSelected ? config.color : 'var(--border)',
                        }}
                      >
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>

                      {/* Item Content */}
                      {item.type === 'song' && <SongItem song={item.data} color={config.color} />}
                      {item.type === 'show' && <ShowItem show={item.data} color={config.color} />}
                      {item.type === 'member' && <MemberItem member={item.data} />}
                      {item.type === 'award' && <AwardItem award={item.data} />}
                      {item.type === 'release' && (
                        <ReleaseItem release={item.data} color={config.color} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex flex-shrink-0 items-center justify-between px-6 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {selectedIds.size > 0
                ? `${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''} will be synced`
                : 'Select items to import'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 font-medium transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: config.color, color: '#fff' }}
              >
                <Link2 size={16} />
                Import {selectedIds.size > 0 ? selectedIds.size : ''}{' '}
                {selectedIds.size === 1 ? 'Item' : 'Items'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sub-components for rendering different item types

function SongItem({ song, color }: { song: SyncableSong; color: string }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Cover Art */}
      <div
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ background: color + '20' }}
      >
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
        ) : (
          <Play size={20} style={{ color }} />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold" style={{ color: 'var(--text)' }}>
          {song.title}
        </h4>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          {song.artist && <span>{song.artist}</span>}
          {song.projectName && (
            <>
              <span>•</span>
              <span>{song.projectName}</span>
            </>
          )}
        </div>
      </div>

      {/* Meta */}
      <div
        className="flex flex-shrink-0 items-center gap-4 text-sm"
        style={{ color: 'var(--muted)' }}
      >
        {song.duration && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(song.duration)}
          </span>
        )}
        {song.audioUrl && (
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: color + '20', color }}
          >
            Audio Ready
          </span>
        )}
      </div>
    </>
  );
}

function ShowItem({ show, color }: { show: SyncableShow; color: string }) {
  const date = new Date(show.date);
  const isPast = date < new Date();

  return (
    <>
      {/* Date Block */}
      <div
        className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg"
        style={{ background: color + '20' }}
      >
        <span className="text-xs font-bold uppercase" style={{ color }}>
          {date.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          {date.getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold" style={{ color: 'var(--text)' }}>
          {show.name}
        </h4>
        {show.venue && (
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
            <MapPin size={14} />
            <span className="truncate">
              {show.venue.name}
              {show.venue.city && `, ${show.venue.city}`}
            </span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {show.tourName && (
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {show.tourName}
          </span>
        )}
        {show.status === 'soldout' && (
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
            Sold Out
          </span>
        )}
        {show.status === 'cancelled' && (
          <span className="rounded-full bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">
            Cancelled
          </span>
        )}
        {isPast && !show.status && (
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: 'var(--bg)', color: 'var(--muted)' }}
          >
            Past
          </span>
        )}
      </div>
    </>
  );
}

function MemberItem({ member }: { member: SyncableMember }) {
  return (
    <>
      {/* Avatar */}
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800">
        {member.image ? (
          <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
        ) : (
          <Users size={20} style={{ color: 'var(--muted)' }} />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold" style={{ color: 'var(--text)' }}>
          {member.name}
        </h4>
        {member.role && (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {member.role}
          </p>
        )}
      </div>

      {/* Instruments */}
      {member.instruments && member.instruments.length > 0 && (
        <div className="flex flex-shrink-0 flex-wrap gap-1">
          {member.instruments.slice(0, 3).map((inst, i) => (
            <span
              key={i}
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ background: 'var(--bg)', color: 'var(--muted)' }}
            >
              {inst}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function AwardItem({ award }: { award: SyncableAward }) {
  return (
    <>
      {/* Icon */}
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-500/20">
        {award.image ? (
          <img
            src={award.image}
            alt={award.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <Trophy size={24} className="text-yellow-500" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold" style={{ color: 'var(--text)' }}>
          {award.name}
        </h4>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          {award.organization && <span>{award.organization}</span>}
          {award.year && (
            <>
              {award.organization && <span>•</span>}
              <span>{award.year}</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ReleaseItem({ release, color }: { release: SyncableRelease; color: string }) {
  const date = new Date(release.releaseDate);

  return (
    <>
      {/* Cover */}
      <div
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ background: color + '20' }}
      >
        {release.coverUrl ? (
          <img src={release.coverUrl} alt={release.title} className="h-full w-full object-cover" />
        ) : (
          <Disc size={24} style={{ color }} />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold" style={{ color: 'var(--text)' }}>
          {release.title}
        </h4>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <span className="uppercase">{release.type}</span>
          <span>•</span>
          <span>{date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
          {release.trackCount && (
            <>
              <span>•</span>
              <span>{release.trackCount} tracks</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
