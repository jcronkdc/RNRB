'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  X,
  Play,
  Square,
  Trash2,
  Edit2,
  Check,
  ArrowRight,
  Clock,
  DoorOpen,
  DoorClosed,
  AlertCircle,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

interface BreakoutRoom {
  id: string;
  name: string;
  is_open: boolean;
  participant_count: number;
  participants: {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar: string | null;
    joined_at: string;
  }[];
}

interface BreakoutRoomsProps {
  meetingCode: string;
  isHost: boolean;
  currentRoomId?: string | null;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
}

export function BreakoutRooms({
  meetingCode,
  isHost,
  currentRoomId,
  onJoinRoom,
  onLeaveRoom,
}: BreakoutRoomsProps) {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomCount, setRoomCount] = useState(2);
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load breakout rooms
  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch(`/api/meet/${meetingCode}/breakout`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to load breakout rooms:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meetingCode]);

  useEffect(() => {
    loadRooms();
    // Poll for updates
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  // Create breakout rooms
  const handleCreate = useCallback(async () => {
    if (!isHost) return;
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch(`/api/meet/${meetingCode}/breakout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms: customNames.length > 0 ? customNames : roomCount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRooms((prev) => [...prev, ...data.rooms]);
        setShowCreateModal(false);
        setCustomNames([]);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create rooms');
      }
    } catch (err) {
      setError('Failed to create rooms');
    } finally {
      setIsCreating(false);
    }
  }, [meetingCode, isHost, roomCount, customNames]);

  // Open/close all rooms
  const handleToggleRooms = useCallback(
    async (action: 'open' | 'close') => {
      if (!isHost) return;

      try {
        const res = await fetch(`/api/meet/${meetingCode}/breakout`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        if (res.ok) {
          loadRooms();
        }
      } catch (err) {
        console.error('Failed to toggle rooms:', err);
      }
    },
    [meetingCode, isHost, loadRooms]
  );

  // End all breakout sessions
  const handleEndBreakout = useCallback(async () => {
    if (!isHost) return;

    try {
      const res = await fetch(`/api/meet/${meetingCode}/breakout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });

      if (res.ok) {
        setRooms([]);
        onLeaveRoom();
      }
    } catch (err) {
      console.error('Failed to end breakout:', err);
    }
  }, [meetingCode, isHost, onLeaveRoom]);

  // Join room
  const handleJoinRoom = useCallback(
    async (roomId: string) => {
      try {
        const res = await fetch(`/api/meet/${meetingCode}/breakout/${roomId}`, {
          method: 'POST',
        });

        if (res.ok) {
          onJoinRoom(roomId);
          loadRooms();
        }
      } catch (err) {
        console.error('Failed to join room:', err);
      }
    },
    [meetingCode, onJoinRoom, loadRooms]
  );

  // Leave room
  const handleLeaveRoom = useCallback(async () => {
    if (!currentRoomId) return;

    try {
      const res = await fetch(`/api/meet/${meetingCode}/breakout/${currentRoomId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onLeaveRoom();
        loadRooms();
      }
    } catch (err) {
      console.error('Failed to leave room:', err);
    }
  }, [meetingCode, currentRoomId, onLeaveRoom, loadRooms]);

  // Rename room
  const handleRenameRoom = useCallback(
    async (roomId: string) => {
      if (!editName.trim()) {
        setEditingRoom(null);
        return;
      }

      try {
        const res = await fetch(`/api/meet/${meetingCode}/breakout/${roomId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName }),
        });

        if (res.ok) {
          loadRooms();
        }
      } catch (err) {
        console.error('Failed to rename room:', err);
      } finally {
        setEditingRoom(null);
        setEditName('');
      }
    },
    [meetingCode, editName, loadRooms]
  );

  const areRoomsOpen = rooms.some((r) => r.is_open);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-purple-400" />
            Breakout Rooms
          </h3>
          {isHost && rooms.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-purple-600"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          )}
        </div>

        {/* Host Controls */}
        {isHost && rooms.length > 0 && (
          <div className="flex items-center gap-2">
            {!areRoomsOpen ? (
              <button
                onClick={() => handleToggleRooms('open')}
                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-600"
              >
                <Play className="h-4 w-4" />
                Open Rooms
              </button>
            ) : (
              <button
                onClick={() => handleToggleRooms('close')}
                className="flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-yellow-600"
              >
                <Square className="h-4 w-4" />
                Close Rooms
              </button>
            )}
            <button
              onClick={handleEndBreakout}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4" />
              End All
            </button>
          </div>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="py-8 text-center text-white/50">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="py-8 text-center text-white/50">
            <DoorClosed className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>No breakout rooms yet</p>
            {isHost && <p className="mt-1 text-sm">Click "Create" to add rooms</p>}
          </div>
        ) : (
          rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border transition-colors ${
                currentRoomId === room.id
                  ? 'border-purple-500/50 bg-purple-500/20'
                  : room.is_open
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-white/5 bg-white/5 opacity-60'
              }`}
            >
              <div className="p-4">
                {/* Room Header */}
                <div className="mb-2 flex items-center justify-between">
                  {editingRoom === room.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-sm text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameRoom(room.id)}
                        className="rounded-lg bg-green-500/20 p-1.5 transition-colors hover:bg-green-500/30"
                      >
                        <Check className="h-4 w-4 text-green-400" />
                      </button>
                      <button
                        onClick={() => setEditingRoom(null)}
                        className="rounded-lg bg-white/10 p-1.5 transition-colors hover:bg-white/20"
                      >
                        <X className="h-4 w-4 text-white/50" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {room.is_open ? (
                          <DoorOpen className="h-4 w-4 text-green-400" />
                        ) : (
                          <DoorClosed className="h-4 w-4 text-white/30" />
                        )}
                        <h4 className="font-medium text-white">{room.name}</h4>
                        {isHost && (
                          <button
                            onClick={() => {
                              setEditingRoom(room.id);
                              setEditName(room.name);
                            }}
                            className="rounded p-1 transition-colors hover:bg-white/10"
                          >
                            <Edit2 className="h-3 w-3 text-white/30" />
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-white/50">{room.participant_count} joined</span>
                    </>
                  )}
                </div>

                {/* Participants */}
                {room.participants.length > 0 && (
                  <div className="mb-3 flex items-center gap-1">
                    {room.participants.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-500 text-xs font-medium text-white"
                        title={p.user_name}
                      >
                        {p.user_avatar ? (
                          <img
                            src={p.user_avatar}
                            alt={p.user_name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          p.user_name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                    ))}
                    {room.participants.length > 5 && (
                      <span className="ml-1 text-xs text-white/50">
                        +{room.participants.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {currentRoomId === room.id ? (
                    <button
                      onClick={handleLeaveRoom}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Leave Room
                    </button>
                  ) : room.is_open ? (
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-500 px-3 py-2 text-white transition-colors hover:bg-purple-600"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Join Room
                    </button>
                  ) : (
                    <div className="flex flex-1 items-center justify-center gap-2 px-3 py-2 text-white/30">
                      <Clock className="h-4 w-4" />
                      Room Closed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gray-900"
            >
              <div className="border-b border-white/10 p-5">
                <h3 className="text-lg font-semibold text-white">Create Breakout Rooms</h3>
              </div>

              <div className="space-y-4 p-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-white/70">Number of Rooms</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                      className="h-10 w-10 rounded-lg bg-white/10 text-xl text-white transition-colors hover:bg-white/20"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-2xl font-bold text-white">
                      {roomCount}
                    </span>
                    <button
                      onClick={() => setRoomCount(Math.min(10, roomCount + 1))}
                      className="h-10 w-10 rounded-lg bg-white/10 text-xl text-white transition-colors hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Custom Room Names (optional)
                  </label>
                  <div className="space-y-2">
                    {Array.from({ length: roomCount }).map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Room ${i + 1}`}
                        value={customNames[i] || ''}
                        onChange={(e) => {
                          const newNames = [...customNames];
                          newNames[i] = e.target.value;
                          setCustomNames(newNames);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-white/30"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-white/70 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="rounded-xl bg-purple-500 px-5 py-2 font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Rooms'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BreakoutRooms;
