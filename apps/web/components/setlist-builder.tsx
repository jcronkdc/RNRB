'use client';

/**
 * Collaborative Setlist Builder
 * 
 * Drag-and-drop setlist organizer with real-time sync
 * Perfect for planning live performances together
 * 
 * Features:
 * - Drag-and-drop reordering
 * - Real-time sync via Ably
 * - Real-time collaborative cursors (see team members' cursors)
 * - Set duration calculator
 * - Key change indicators
 * - Notes per song
 * - Export/print
 * - Share with team
 */

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Realtime, Types } from 'ably';
import { motion } from 'framer-motion';
import { 
  GripVertical,
  Music,
  Clock,
  Key as KeyIcon,
  FileText,
  Trash2,
  Plus,
  Download,
  Share2,
  Users as UsersIcon
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { CursorOverlay } from '@/components/cursor-overlay';

type SetlistSong = {
  id: string;
  songId: string;
  songTitle: string;
  duration?: number; // in seconds
  key?: string;
  tempo?: number;
  notes?: string;
  order: number;
};

type CollaborativeSetlistProps = {
  setlistId: string;
  projectSlug: string;
  projectSongs: any[];
  initialSongs: SetlistSong[];
  onUpdate: (songs: SetlistSong[]) => void;
  currentUser: {
    userId: string;
    userName: string;
  };
};

export function CollaborativeSetlistBuilder({
  setlistId,
  projectSlug,
  projectSongs,
  initialSongs,
  onUpdate,
  currentUser,
}: CollaborativeSetlistProps) {
  const [songs, setSongs] = useState<SetlistSong[]>(initialSongs);
  const [ably, setAbly] = useState<Realtime | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [availableSongs, setAvailableSongs] = useState(projectSongs);

  // Collaborative cursors
  const { remoteCursors } = useCollaborativeCursors({
    channelName: `setlist:${setlistId}-cursors`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    enabled: true,
  });

  // Initialize Ably for real-time sync
  useEffect(() => {
    let mounted = true;
    let channel: Types.RealtimeChannelCallbacks | null = null;

    const initAbly = async () => {
      try {
        const ablyClient = new Realtime({ authUrl: '/api/ably/token' });
        if (!mounted) {
          ablyClient.close();
          return;
        }

        setAbly(ablyClient);
        channel = ablyClient.channels.get(`setlist:${setlistId}`);

        // Subscribe to setlist updates
        channel.subscribe('update', (message) => {
          if (!mounted) return;
          const updatedSongs: SetlistSong[] = message.data.songs;
          setSongs(updatedSongs);
        });

        // Subscribe to song additions
        channel.subscribe('add', (message) => {
          if (!mounted) return;
          const newSong: SetlistSong = message.data;
          setSongs(prev => [...prev, newSong].sort((a, b) => a.order - b.order));
        });

        // Subscribe to song removals
        channel.subscribe('remove', (message) => {
          if (!mounted) return;
          const songId = message.data.songId;
          setSongs(prev => prev.filter(s => s.id !== songId));
        });

        setIsConnected(true);
      } catch (err) {
        console.error('Setlist Ably error:', err);
      }
    };

    initAbly();

    return () => {
      mounted = false;
      channel?.unsubscribe();
      ably?.close();
    };
  }, [setlistId]);

  // Broadcast updates to other users
  const broadcastUpdate = async (updatedSongs: SetlistSong[]) => {
    if (!ably || !isConnected) return;

    const channel = ably.channels.get(`setlist:${setlistId}`);
    await channel.publish('update', { songs: updatedSongs });
  };

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    // Dragging from available songs to setlist (ADD song)
    if (source.droppableId === 'available' && destination.droppableId === 'setlist') {
      const draggedSong = availableSongs[source.index];
      
      // Check if already in setlist
      if (songs.some(s => s.songId === draggedSong.id)) return;
      
      const newSong: SetlistSong = {
        id: `setlist_song_${Date.now()}`,
        songId: draggedSong.id,
        songTitle: draggedSong.title,
        duration: draggedSong.duration,
        key: draggedSong.key,
        tempo: draggedSong.tempo,
        order: destination.index,
      };

      // Insert at the dropped position
      const updatedSongs = Array.from(songs);
      updatedSongs.splice(destination.index, 0, newSong);
      
      // Update order values
      const reorderedSongs = updatedSongs.map((song, index) => ({
        ...song,
        order: index,
      }));

      setSongs(reorderedSongs);
      onUpdate(reorderedSongs);

      if (ably && isConnected) {
        const channel = ably.channels.get(`setlist:${setlistId}`);
        await channel.publish('add', newSong);
      }
      return;
    }

    // Reordering within setlist (MOVE song)
    if (source.droppableId === 'setlist' && destination.droppableId === 'setlist') {
      const items = Array.from(songs);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      // Update order values
      const reorderedSongs = items.map((song, index) => ({
        ...song,
        order: index,
      }));

      setSongs(reorderedSongs);
      onUpdate(reorderedSongs);
      await broadcastUpdate(reorderedSongs);
    }
  };

  // Add song to setlist
  const addSong = async (song: any) => {
    const newSong: SetlistSong = {
      id: `setlist_song_${Date.now()}`,
      songId: song.id,
      songTitle: song.title,
      duration: song.duration,
      key: song.key,
      tempo: song.tempo,
      order: songs.length,
    };

    const updatedSongs = [...songs, newSong];
    setSongs(updatedSongs);
    onUpdate(updatedSongs);

    if (ably && isConnected) {
      const channel = ably.channels.get(`setlist:${setlistId}`);
      await channel.publish('add', newSong);
    }
  };

  // Remove song from setlist
  const removeSong = async (songId: string) => {
    const updatedSongs = songs.filter(s => s.id !== songId).map((s, i) => ({ ...s, order: i }));
    setSongs(updatedSongs);
    onUpdate(updatedSongs);

    if (ably && isConnected) {
      const channel = ably.channels.get(`setlist:${setlistId}`);
      await channel.publish('remove', { songId });
    }
  };

  // Calculate total duration
  const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Export setlist
  const exportSetlist = () => {
    const text = songs.map((song, i) => 
      `${i + 1}. ${song.songTitle}${song.key ? ` (${song.key})` : ''}${song.notes ? ` - ${song.notes}` : ''}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `setlist_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">{songs.length} songs</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">{formatDuration(totalDuration)}</span>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-green-400">Live Sync</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportSetlist}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Setlist (Drop Zone) */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Your Setlist</h3>

              <Droppable droppableId="setlist">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`
                      min-h-[200px] space-y-2 rounded-lg transition-all
                      ${snapshot.isDraggingOver ? 'bg-brand-primary/5 ring-2 ring-brand-primary/30' : ''}
                    `}
                  >
                    {songs.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Music className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>No songs in setlist yet</p>
                        <p className="text-sm mt-1">Drag songs from the right panel or click to add</p>
                      </div>
                    )}
                    
                    {songs.map((song, index) => (
                      <Draggable key={song.id} draggableId={song.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              p-4 bg-surface border border-border rounded-lg
                              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-brand-primary rotate-2' : ''}
                              transition-all
                            `}
                          >
                            <div className="flex items-center gap-3">
                              {/* Drag Handle */}
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-muted-foreground hover:text-brand-primary transition-colors" />
                              </div>

                              {/* Order Number */}
                              <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm flex-shrink-0">
                                {index + 1}
                              </div>

                              {/* Song Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{song.songTitle}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {song.key && (
                                    <span className="flex items-center gap-1">
                                      <KeyIcon className="w-3 h-3" />
                                      {song.key}
                                    </span>
                                  )}
                                  {song.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDuration(song.duration)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeSong(song.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                                title="Remove from setlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Right: Available Songs (Drag Source) */}
          <div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Available Songs
                <span className="text-xs text-muted-foreground font-normal">(Drag to add)</span>
              </h3>
              
              {availableSongs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No songs available</p>
                </div>
              ) : (
                <Droppable droppableId="available" isDropDisabled={true}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {availableSongs.map((song, index) => {
                        const isInSetlist = songs.some(s => s.songId === song.id);
                        
                        return (
                          <Draggable
                            key={song.id}
                            draggableId={`available-${song.id}`}
                            index={index}
                            isDragDisabled={isInSetlist}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  p-3 rounded-lg border transition-all
                                  ${snapshot.isDragging ? 'shadow-lg ring-2 ring-brand-primary rotate-2' : ''}
                                  ${isInSetlist 
                                    ? 'border-green-500/30 bg-green-500/10 opacity-60' 
                                    : 'border-border hover:border-brand-primary/50 cursor-grab active:cursor-grabbing'
                                  }
                                `}
                                onClick={() => !isInSetlist && addSong(song)}
                              >
                                <div className="flex items-center gap-2">
                                  {!isInSetlist && (
                                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{song.title}</p>
                                    {song.key && (
                                      <p className="text-xs text-muted-foreground">Key: {song.key}</p>
                                    )}
                                  </div>
                                  {isInSetlist ? (
                                    <span className="text-xs text-green-400 flex-shrink-0">In setlist</span>
                                  ) : (
                                    <Plus className="w-4 h-4 text-brand-primary flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Collaborative Cursors Overlay */}
      <CursorOverlay cursors={remoteCursors} />
    </div>
  );
}

