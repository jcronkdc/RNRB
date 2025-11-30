'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Music2, Plus, X, Play, Pause, ExternalLink, Trash2, Link as LinkIcon } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

type ReferenceTrack = {
  id: string;
  title: string;
  artist: string;
  url?: string;
  notes?: string;
  timestamp?: string; // e.g., "2:30 - cool guitar riff"
};

type ReferenceTracksProps = {
  tracks: ReferenceTrack[];
  onAddTrack: (track: Omit<ReferenceTrack, 'id'>) => void;
  onRemoveTrack: (id: string) => void;
  onUpdateTrack: (id: string, updates: Partial<ReferenceTrack>) => void;
  className?: string;
};

// Detect platform from URL
function detectPlatform(url: string): 'spotify' | 'youtube' | 'soundcloud' | 'apple' | 'other' {
  if (url.includes('spotify.com') || url.includes('open.spotify')) return 'spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  if (url.includes('music.apple.com')) return 'apple';
  return 'other';
}

// Platform colors
const PLATFORM_COLORS: Record<string, string> = {
  spotify: '#1DB954',
  youtube: '#FF0000',
  soundcloud: '#FF5500',
  apple: '#FA243C',
  other: 'var(--accent)',
};

export function ReferenceTracks({
  tracks,
  onAddTrack,
  onRemoveTrack,
  onUpdateTrack,
  className = '',
}: ReferenceTracksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTrack, setNewTrack] = useState<Omit<ReferenceTrack, 'id'>>({
    title: '',
    artist: '',
    url: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    if (newTrack.title.trim() && newTrack.artist.trim()) {
      onAddTrack(newTrack);
      setNewTrack({ title: '', artist: '', url: '', notes: '' });
      setIsAdding(false);
    }
  }, [newTrack, onAddTrack]);

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Reference Tracks
          </span>
          <span
            className="rounded-lg px-1.5 py-0.5 text-xs"
            style={{ background: 'var(--background)', color: 'var(--muted)' }}
          >
            {tracks.length}
          </span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:opacity-80"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden rounded-lg p-3"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          >
            <div className="mb-3 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newTrack.title}
                onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                placeholder="Song title"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <input
                type="text"
                value={newTrack.artist}
                onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
                placeholder="Artist"
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <input
              type="url"
              value={newTrack.url}
              onChange={(e) => setNewTrack({ ...newTrack, url: e.target.value })}
              placeholder="Link (Spotify, YouTube, etc.) - optional"
              className="mb-2 w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
            <textarea
              value={newTrack.notes}
              onChange={(e) => setNewTrack({ ...newTrack, notes: e.target.value })}
              placeholder="Notes (e.g., 'Love the chord progression in the chorus')"
              rows={2}
              className="mb-3 w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="rounded-lg px-3 py-1.5 text-sm"
                style={{ color: 'var(--muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTrack.title.trim() || !newTrack.artist.trim()}
                className="rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                Add Reference
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track list */}
      <div className="space-y-2">
        {tracks.map((track) => {
          const platform = track.url ? detectPlatform(track.url) : null;
          const platformColor = platform ? PLATFORM_COLORS[platform] : null;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-lg p-3"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      {track.title}
                    </h4>
                    {platform && (
                      <span
                        className="rounded px-1.5 py-0.5 text-xs font-medium"
                        style={{ background: `${platformColor}20`, color: platformColor }}
                      >
                        {platform}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {track.artist}
                  </p>
                  {track.notes && (
                    <p
                      className="mt-2 rounded-lg p-2 text-xs italic"
                      style={{ background: 'var(--panel)', color: 'var(--muted)' }}
                    >
                      "{track.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  {track.url && (
                    <button
                      onClick={() => openUrl(track.url!)}
                      className="rounded-lg p-1.5 transition hover:opacity-80"
                      style={{ background: 'var(--panel)' }}
                      title="Open link"
                    >
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        style={{ color: platformColor || 'var(--muted)' }}
                      />
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveTrack(track.id)}
                    className="rounded-lg p-1.5 transition hover:opacity-80"
                    style={{ background: 'var(--panel)' }}
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--error)' }} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {tracks.length === 0 && !isAdding && (
          <div className="py-6 text-center">
            <Music2 className="mx-auto mb-2 h-8 w-8" style={{ color: 'var(--muted)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Add reference tracks for inspiration
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Link to songs you want to sound like
            </p>
          </div>
        )}
      </div>

      {/* Tip */}
      {tracks.length > 0 && (
        <p className="mt-3 text-center text-xs" style={{ color: 'var(--muted)' }}>
          💡 Reference tracks help communicate your vision to collaborators
        </p>
      )}
    </div>
  );
}

// Hook for managing reference tracks
export function useReferenceTracks(initialTracks: ReferenceTrack[] = []) {
  const [tracks, setTracks] = useState<ReferenceTrack[]>(initialTracks);

  const addTrack = useCallback((track: Omit<ReferenceTrack, 'id'>) => {
    setTracks((prev) => [...prev, { ...track, id: crypto.randomUUID() }]);
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTrack = useCallback((id: string, updates: Partial<ReferenceTrack>) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  return { tracks, addTrack, removeTrack, updateTrack };
}
