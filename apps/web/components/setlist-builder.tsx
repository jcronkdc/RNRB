'use client';

/**
 * COLLABORATIVE SETLIST BUILDER
 * 
 * Real-time setlist editing with Ably broadcast
 * Drag-drop reordering syncs across all clients
 * Duration calculator, key change indicators
 * 
 * Mycelial Pathway:
 * User drags song → Ably broadcasts update → All clients reorder instantly
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Music, 
  GripVertical, 
  Plus, 
  X, 
  Clock,
  AlertCircle,
  Users,
  Sparkles,
  Play,
  Pause,
  Download,
  Printer,
  FileText
} from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { CursorOverlay } from '@/components/cursor-overlay';
import { Realtime } from 'ably';
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
  onSongAdded: (song: SetlistSong) => void;
  onSongRemoved: (songId: string) => void;
  onSongReordered: (songs: SetlistSong[]) => void;
  enabled: boolean;
};

/**
 * Hook: Real-time setlist sync via Ably
 */
function useSetlistSync({
  channelName,
  onSongAdded,
  onSongRemoved,
  onSongReordered,
  enabled,
}: UseSetlistSyncOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    let ablyClient: Realtime | null = null;

    const initAbly = async () => {
      try {
        const response = await fetch('/api/ably/token');
        if (!response.ok) {
          console.info('Ably not configured - setlist sync disabled');
          return;
        }

        ablyClient = new Realtime({ authUrl: '/api/ably/token' });
        if (!mounted) {
          ablyClient.close();
          return;
        }

        const channel = ablyClient.channels.get(channelName);
        setChannel(channel); // Expose channel to component

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
          channel.presence.get((err, members) => {
            if (!err && mounted) {
              setActiveUsers(members?.map(m => m.clientId || 'anonymous') || []);
            }
          });
        });

        channel.presence.subscribe('leave', () => {
          channel.presence.get((err, members) => {
            if (!err && mounted) {
              setActiveUsers(members?.map(m => m.clientId || 'anonymous') || []);
            }
          });
        });

        setIsConnected(true);
      } catch (error) {
        console.error('Setlist sync error:', error);
      }
    };

    initAbly();

    return () => {
      mounted = false;
      ablyClient?.close();
      setIsConnected(false);
      setChannel(null);
    };
  }, [channelName, enabled]);

  return { isConnected, activeUsers, channel };
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
      className="mb-3 rnrb-card p-4 bg-gradient-to-r from-surface to-surface-muted border-2 border-border hover:border-brand-primary/30 transition-all group"
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Position */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary font-bold text-sm">
          {song.position + 1}
        </div>

        {/* Song Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{song.title}</h4>
            {keyChange && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Key Change
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            {song.artist && <span>{song.artist}</span>}
            {song.key && <span className="font-mono">{song.key}</span>}
            {song.tempo && <span>{song.tempo} BPM</span>}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(song.duration)}
            </span>
          </div>
          {notesExpanded && (
            <textarea
              value={song.notes || ''}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Add notes (key changes, tempo shifts, etc.)"
              className="w-full mt-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm resize-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
              rows={2}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="px-3 py-1 rounded-lg bg-surface-muted hover:bg-surface text-xs font-medium"
          >
            {notesExpanded ? 'Hide' : 'Notes'}
          </button>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-600"
          >
            <X className="w-4 h-4" />
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Real-time setlist sync
  const { isConnected, activeUsers, channel } = useSetlistSync({
    channelName: `setlist:${projectSlug}-${setlistId}`,
    onSongAdded: (song) => {
      setSongs((prev) => [...prev, song].sort((a, b) => a.position - b.position));
    },
    onSongRemoved: (songId) => {
      setSongs((prev) => prev.filter(s => s.id !== songId));
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
    const updated = songs.filter(s => s.id !== songId).map((s, idx) => ({ ...s, position: idx }));
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
      const oldIndex = items.findIndex(s => s.id === active.id);
      const newIndex = items.findIndex(s => s.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((s, idx) => ({ ...s, position: idx }));
      
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
    const updated = songs.map(s => s.id === songId ? { ...s, notes } : s);
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
      <Card className="p-6 rnrb-card bg-gradient-to-r from-brand-primary/10 to-transparent border-brand-primary/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Songs</div>
            <div className="text-3xl font-bold text-foreground">{songs.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Set Duration</div>
            <div className="text-3xl font-bold text-foreground">{formatTotalDuration(totalDuration)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborators
            </div>
            <div className="text-3xl font-bold text-foreground">{activeUsers.length + 1}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Sync Status</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Setlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Setlist */}
        <div className="lg:col-span-2">
          <Card className="p-6 rnrb-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Setlist Order</h2>
              <div className="flex items-center gap-2">
                {/* Export Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2"
                    disabled={songs.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl z-10">
                      <button
                        onClick={() => handleExportPDF('full')}
                        className="w-full px-4 py-2 text-left hover:bg-surface-muted transition flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        PDF (Full Detail)
                      </button>
                      <button
                        onClick={() => handleExportPDF('compact')}
                        className="w-full px-4 py-2 text-left hover:bg-surface-muted transition flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        PDF (Compact)
                      </button>
                      <button
                        onClick={() => handleExportPDF('stage')}
                        className="w-full px-4 py-2 text-left hover:bg-surface-muted transition flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        PDF (Stage View)
                      </button>
                      <hr className="border-border my-1" />
                      <button
                        onClick={handlePrint}
                        className="w-full px-4 py-2 text-left hover:bg-surface-muted transition flex items-center gap-2 text-sm rounded-b-lg"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowSongPicker(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Song
                </Button>
              </div>
            </div>

            {songs.length === 0 ? (
              <div className="py-16 text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Empty Setlist</h3>
                <p className="text-muted-foreground mb-4">Add songs to build your performance setlist</p>
                <Button onClick={() => setShowSongPicker(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Song
                </Button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
                <SortableContext items={songs.map(s => s.id)} strategy={verticalListSortingStrategy}>
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
                    <div className="rnrb-card p-4 bg-surface border-2 border-brand-primary shadow-xl">
                      <div className="font-semibold">{songs.find(s => s.id === activeId)?.title}</div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </Card>
        </div>

        {/* Song Picker Sidebar */}
        <div>
          <Card className="p-6 rnrb-card sticky top-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Available Songs
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {projectSongs
                .filter(ps => !songs.find(s => s.id === ps.id))
                .map((song) => (
                  <button
                    key={song.id}
                    onClick={() => addSong(song)}
                    className="w-full text-left p-3 rounded-lg bg-surface-muted hover:bg-surface border border-transparent hover:border-brand-primary/30 transition-all"
                  >
                    <div className="font-medium text-sm">{song.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {song.key} • {song.tempo} BPM
                    </div>
                  </button>
                ))}
              {projectSongs.filter(ps => !songs.find(s => s.id === ps.id)).length === 0 && (
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
    </div>
  );
}
