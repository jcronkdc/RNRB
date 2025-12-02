'use client';

/**
 * COLLABORATIVE SETLIST BUILDER
 *
 * Real-time setlist editing with Ably broadcast
 * Drag-drop reordering syncs across all clients
 * Duration calculator, key change indicators
 *
 * NOW USES: Shared Ably client from AblyProvider (NO separate connections!)
 *
 * Mycelial Pathway:
 * User drags song → Ably broadcasts update → All clients reorder instantly
 */

import { Card, Button } from '@cronkwaters/ui';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RealtimeChannel } from 'ably';
import {
  Music,
  GripVertical,
  Plus,
  X,
  Clock,
  AlertCircle,
  Users,
  Sparkles,
  Download,
  Printer,
  FileText,
  Share2,
  QrCode,
} from '@/components/ui/custom-icons';
import { useState, useEffect, useMemo, useRef } from 'react';

import { CursorOverlay } from '@/components/cursor-overlay';
import { SetlistShareModal } from '@/components/setlist-share-modal';
import { useAblyClient } from '@/hooks/use-ably-client';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { exportSetlistToPDF, printSetlist } from '@/lib/setlist-pdf-export';

type Song = {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  tempo?: number;
  duration?: number; // in seconds
  notes?: string;
};

type SetlistSong = Song & {
  position: number;
  setlistId: string;
};

type UseSetlistSyncOptions = {
  channelName: string;
  userId: string;
  onSongAdded: (song: SetlistSong) => void;
  onSongRemoved: (songId: string) => void;
  onSongReordered: (songs: SetlistSong[]) => void;
  enabled: boolean;
};

/**
 * Hook: Real-time setlist sync via shared Ably client
 */
function useSetlistSync({
  channelName,
  userId,
  onSongAdded,
  onSongRemoved,
  onSongReordered,
  enabled,
}: UseSetlistSyncOptions) {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  // Use shared Ably client from AblyProvider (NO separate connections!)
  const { client: ablyClient, isConnected } = useAblyClient(enabled ? userId : undefined);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !ablyClient || !isConnected) return;

    let mounted = true;

    try {
      const channel = ablyClient.channels.get(channelName);
      channelRef.current = channel;

      // Subscribe to setlist events
      channel.subscribe('song-added', (message) => {
        if (mounted) onSongAdded(message.data);
      });

      channel.subscribe('song-removed', (message) => {
        if (mounted) onSongRemoved(message.data.songId);
      });

      channel.subscribe('songs-reordered', (message) => {
        if (mounted) onSongReordered(message.data.songs);
      });

      // Presence tracking
      channel.presence.enter();
      channel.presence.subscribe('enter', () => {
        channel.presence
          .get()
          .then((members) => {
            if (mounted) {
              setActiveUsers(members?.map((m) => m.clientId || 'anonymous') || []);
            }
          })
          .catch((err) => {
            console.error('Presence error:', err);
          });
      });

      channel.presence.subscribe('leave', () => {
        channel.presence
          .get()
          .then((members) => {
            if (mounted) {
              setActiveUsers(members?.map((m) => m.clientId || 'anonymous') || []);
            }
          })
          .catch((err) => {
            console.error('Presence error:', err);
          });
      });
    } catch (error) {
      console.error('Setlist sync error:', error);
    }

    // Cleanup - only unsubscribe, don't close shared client
    return () => {
      mounted = false;
      if (channelRef.current) {
        try {
          channelRef.current.presence.leave();
          channelRef.current.presence.unsubscribe();
          channelRef.current.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
    };
  }, [channelName, enabled, ablyClient, isConnected, onSongAdded, onSongRemoved, onSongReordered]);

  return { isConnected, activeUsers, channel: channelRef.current };
}

/**
 * Sortable Song Item
 */
function SortableSong({
  song,
  onRemove,
  onUpdateNotes,
  previousKey,
}: {
  song: SetlistSong;
  onRemove: () => void;
  onUpdateNotes: (notes: string) => void;
  previousKey?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song.id });
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Detect key change from previous song
  const keyChange = previousKey && song.key && previousKey !== song.key;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '?:??';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rnrb-card group mb-3 border-2 border-border bg-gradient-to-r from-surface to-surface-muted p-4 transition-all hover:border-brand-primary/30"
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Position */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-bold text-brand-primary">
          {song.position + 1}
        </div>

        {/* Song Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{song.title}</h4>
            {keyChange && (
              <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
                <AlertCircle className="h-3 w-3" />
                Key Change
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
            {song.artist && <span>{song.artist}</span>}
            {song.key && <span className="font-mono">{song.key}</span>}
            {song.tempo && <span>{song.tempo} BPM</span>}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(song.duration)}
            </span>
          </div>
          {notesExpanded && (
            <textarea
              value={song.notes || ''}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Add notes (key changes, tempo shifts, etc.)"
              className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              rows={2}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="rounded-lg bg-surface-muted px-3 py-1 text-xs font-medium hover:bg-surface"
          >
            {notesExpanded ? 'Hide' : 'Notes'}
          </button>
          <button onClick={onRemove} className="text-red-500 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Component: Collaborative Setlist Builder
 */
export function CollaborativeSetlistBuilder({
  setlistId,
  projectSlug,
  projectSongs,
  initialSongs = [],
  onUpdate,
  currentUser,
  showName = 'Live Performance',
  venueName,
  showDate,
}: {
  setlistId: string;
  projectSlug: string;
  projectSongs: Song[];
  initialSongs: SetlistSong[];
  onUpdate: (songs: SetlistSong[]) => void;
  currentUser: {
    userId: string;
    userName: string;
  };
  showName?: string;
  venueName?: string;
  showDate?: string;
}) {
  const [songs, setSongs] = useState<SetlistSong[]>(initialSongs);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Real-time setlist sync using shared Ably client
  const { isConnected, activeUsers, channel } = useSetlistSync({
    channelName: `setlist:${projectSlug}-${setlistId}`,
    userId: currentUser.userId,
    onSongAdded: (song) => {
      setSongs((prev) => [...prev, song].sort((a, b) => a.position - b.position));
    },
    onSongRemoved: (songId) => {
      setSongs((prev) => prev.filter((s) => s.id !== songId));
    },
    onSongReordered: (newSongs) => {
      setSongs(newSongs);
    },
    enabled: true,
  });

  // Collaborative cursors
  const { remoteCursors } = useCollaborativeCursors({
    channelName: `setlist:${projectSlug}-${setlistId}-cursors`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    enabled: true,
  });

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return songs.reduce((sum, song) => sum + (song.duration || 0), 0);
  }, [songs]);

  const formatTotalDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  // Broadcast song addition
  const addSong = async (song: Song) => {
    const setlistSong: SetlistSong = {
      ...song,
      position: songs.length,
      setlistId,
    };

    // Compute updated array first to avoid stale closure
    const updatedSongs = [...songs, setlistSong];
    setSongs(updatedSongs);
    onUpdate(updatedSongs);

    // Broadcast to collaborators
    try {
      if (channel) {
        await channel.publish('song-added', setlistSong);
      }
    } catch (error) {
      console.error('Failed to broadcast song addition:', error);
    }

    setShowSongPicker(false);
  };

  // Broadcast song removal
  const removeSong = async (songId: string) => {
    const updated = songs.filter((s) => s.id !== songId).map((s, idx) => ({ ...s, position: idx }));
    setSongs(updated);
    onUpdate(updated);

    try {
      if (channel) {
        await channel.publish('song-removed', { songId });
      }
    } catch (error) {
      console.error('Failed to broadcast song removal:', error);
    }
  };

  // Broadcast reorder
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setSongs((items) => {
      const oldIndex = items.findIndex((s) => s.id === active.id);
      const newIndex = items.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((s, idx) => ({
        ...s,
        position: idx,
      }));

      onUpdate(reordered);

      // Broadcast
      try {
        if (channel) {
          channel.publish('songs-reordered', { songs: reordered });
        }
      } catch (error) {
        console.error('Failed to broadcast reorder:', error);
      }

      return reordered;
    });
  };

  const updateSongNotes = (songId: string, notes: string) => {
    const updated = songs.map((s) => (s.id === songId ? { ...s, notes } : s));
    setSongs(updated);
    onUpdate(updated);
  };

  const handleExportPDF = (layout: 'full' | 'compact' | 'stage') => {
    exportSetlistToPDF(songs, {
      showName,
      venueName,
      date: showDate,
      layout,
    });
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    printSetlist(songs, {
      showName,
      venueName,
      date: showDate,
      layout: 'full',
    });
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="rnrb-card border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 to-transparent p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Total Songs</div>
            <div className="text-3xl font-bold text-foreground">{songs.length}</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Set Duration</div>
            <div className="text-3xl font-bold text-foreground">
              {formatTotalDuration(totalDuration)}
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Collaborators
            </div>
            <div className="text-3xl font-bold text-foreground">{activeUsers.length + 1}</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Sync Status</div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              />
              <span className="text-sm font-medium">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Setlist */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Setlist */}
        <div className="lg:col-span-2">
          <Card className="rnrb-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Setlist Order</h2>
              <div className="flex items-center gap-2">
                {/* Share Button - VIRAL LOOP */}
                <Button
                  variant="ghost"
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
                  disabled={songs.length === 0}
                >
                  <QrCode className="h-4 w-4" />
                  Share
                </Button>
                {/* Export Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2"
                    disabled={songs.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-border bg-surface shadow-xl">
                      <button
                        onClick={() => handleExportPDF('full')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-surface-muted"
                      >
                        <FileText className="h-4 w-4" />
                        PDF (Full Detail)
                      </button>
                      <button
                        onClick={() => handleExportPDF('compact')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-surface-muted"
                      >
                        <FileText className="h-4 w-4" />
                        PDF (Compact)
                      </button>
                      <button
                        onClick={() => handleExportPDF('stage')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-surface-muted"
                      >
                        <FileText className="h-4 w-4" />
                        PDF (Stage View)
                      </button>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handlePrint}
                        className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2 text-left text-sm transition hover:bg-surface-muted"
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </button>
                    </div>
                  )}
                </div>
                <Button onClick={() => setShowSongPicker(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Song
                </Button>
              </div>
            </div>

            {songs.length === 0 ? (
              <div className="py-16 text-center">
                <Music className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-xl font-semibold">Empty Setlist</h3>
                <p className="mb-4 text-muted-foreground">
                  Add songs to build your performance setlist
                </p>
                <Button onClick={() => setShowSongPicker(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Song
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={(e) => setActiveId(e.active.id as string)}
              >
                <SortableContext
                  items={songs.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {songs.map((song, index) => (
                    <SortableSong
                      key={song.id}
                      song={song}
                      onRemove={() => removeSong(song.id)}
                      onUpdateNotes={(notes) => updateSongNotes(song.id, notes)}
                      previousKey={index > 0 ? songs[index - 1].key : undefined}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="rnrb-card border-2 border-brand-primary bg-surface p-4 shadow-xl">
                      <div className="font-semibold">
                        {songs.find((s) => s.id === activeId)?.title}
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </Card>
        </div>

        {/* Song Picker Sidebar */}
        <div>
          <Card className="rnrb-card sticky top-4 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Available Songs
            </h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {projectSongs
                .filter((ps) => !songs.find((s) => s.id === ps.id))
                .map((song) => (
                  <button
                    key={song.id}
                    onClick={() => addSong(song)}
                    className="w-full rounded-lg border border-transparent bg-surface-muted p-3 text-left transition-all hover:border-brand-primary/30 hover:bg-surface"
                  >
                    <div className="text-sm font-medium">{song.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {song.key} • {song.tempo} BPM
                    </div>
                  </button>
                ))}
              {projectSongs.filter((ps) => !songs.find((s) => s.id === ps.id)).length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  All songs added to setlist
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cursors Overlay */}
      <CursorOverlay cursors={remoteCursors} />

      {/* Share Modal - VIRAL LOOP */}
      <SetlistShareModal
        setlistId={setlistId}
        setlistName={showName}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}
