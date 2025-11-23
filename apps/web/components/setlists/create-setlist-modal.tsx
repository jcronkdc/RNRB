'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  X,
  Music,
  GripVertical,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@cronkwaters/ui';

interface CreateSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (setlist: {
    name: string;
    venue?: string;
    date?: string;
    songs: string[]; // Song IDs in order
    notes?: string;
  }) => Promise<void>;
  projectSongs: Array<{
    id: string;
    title: string;
    key?: string;
    tempo?: number;
    duration_estimate?: number; // in minutes
  }>;
}

export default function CreateSetlistModal({
  isOpen,
  onClose,
  onSave,
  projectSongs,
}: CreateSetlistModalProps) {
  const [setlistName, setSetlistName] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Get songs not yet in setlist
  const availableSongs = projectSongs.filter((song) => !selectedSongIds.includes(song.id));

  // Get songs in setlist order
  const setlistSongs = selectedSongIds
    .map((id) => projectSongs.find((s) => s.id === id))
    .filter(Boolean) as typeof projectSongs;

  const addSongToSetlist = (songId: string) => {
    setSelectedSongIds([...selectedSongIds, songId]);
  };

  const removeSongFromSetlist = (songId: string) => {
    setSelectedSongIds(selectedSongIds.filter((id) => id !== songId));
  };

  // Calculate setlist stats
  const totalDuration = setlistSongs.reduce((sum, song) => sum + (song.duration_estimate || 3), 0);
  const keyChanges = setlistSongs.reduce((count, song, index) => {
    if (index === 0) return 0;
    const prevKey = setlistSongs[index - 1]?.key;
    return prevKey && song.key && prevKey !== song.key ? count + 1 : count;
  }, 0);

  const handleSave = async () => {
    if (!setlistName.trim() || selectedSongIds.length === 0) return;

    setSaving(true);
    try {
      await onSave({
        name: setlistName,
        venue: venue || undefined,
        date: date || undefined,
        songs: selectedSongIds,
        notes: notes || undefined,
      });

      // Reset form
      setSetlistName('');
      setVenue('');
      setDate('');
      setNotes('');
      setSelectedSongIds([]);

      onClose();
    } catch (error) {
      console.error('Error creating setlist:', error);
    } finally {
      setSaving(false);
    }
  };

  const isValid = setlistName.trim() && selectedSongIds.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Create Setlist</h2>
                  <p className="text-sm text-muted-foreground">Organize songs for your show</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 transition-colors hover:bg-surface"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Basic Info */}
                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Setlist Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={setlistName}
                        onChange={(e) => setSetlistName(e.target.value)}
                        placeholder="Friday Night Show, Acoustic Set, Main Set..."
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-brand-primary focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Venue <span className="font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="The Bluebird Cafe, House of Blues..."
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-brand-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Show Date{' '}
                        <span className="font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-brand-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">Setlist Stats</label>
                      <div className="flex gap-2 text-xs">
                        <div className="rounded border border-brand-primary/30 bg-brand-primary/10 px-3 py-2">
                          <span className="font-bold text-brand-primary">
                            {setlistSongs.length}
                          </span>{' '}
                          songs
                        </div>
                        <div className="rounded border border-brand-primary/30 bg-brand-primary/10 px-3 py-2">
                          <span className="font-bold text-brand-primary">~{totalDuration}</span> min
                        </div>
                        {keyChanges > 0 && (
                          <div className="rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                            <span className="font-bold text-yellow-500">{keyChanges}</span> key
                            changes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Available Songs */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-semibold">
                        <Music className="h-4 w-4 text-brand-primary" />
                        Available Songs ({availableSongs.length})
                      </h3>

                      {availableSongs.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                          <p className="text-sm text-muted-foreground">All songs added!</p>
                        </div>
                      ) : (
                        <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
                          {availableSongs.map((song) => (
                            <button
                              key={song.id}
                              onClick={() => addSongToSetlist(song.id)}
                              className="group w-full rounded-lg border border-border bg-surface p-3 text-left transition-all hover:border-brand-primary"
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">{song.title}</p>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    {song.key && <span>Key: {song.key}</span>}
                                    {song.tempo && (
                                      <>
                                        <span>•</span>
                                        <span>{song.tempo} BPM</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Plus className="ml-2 h-4 w-4 flex-shrink-0 text-brand-primary opacity-0 transition-opacity group-hover:opacity-100" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Setlist Order (Drag-Drop) */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-semibold">
                        <GripVertical className="h-4 w-4 text-brand-primary" />
                        Setlist Order ({setlistSongs.length})
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          Drag to reorder
                        </span>
                      </h3>

                      {setlistSongs.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                          <ArrowRight className="mx-auto mb-2 h-8 w-8 rotate-180 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">Add songs from the left</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Click any song to add it to your setlist
                          </p>
                        </div>
                      ) : (
                        <Reorder.Group
                          axis="y"
                          values={selectedSongIds}
                          onReorder={setSelectedSongIds}
                          className="max-h-96 space-y-2 overflow-y-auto pr-2"
                        >
                          {setlistSongs.map((song, index) => (
                            <Reorder.Item
                              key={song.id}
                              value={song.id}
                              className="group cursor-move rounded-lg border border-brand-primary/30 bg-brand-primary/5 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-brand-primary-foreground">
                                  {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">{song.title}</p>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    {song.key && <span>Key: {song.key}</span>}
                                    {song.tempo && (
                                      <>
                                        <span>•</span>
                                        <span>{song.tempo} BPM</span>
                                      </>
                                    )}
                                    {song.duration_estimate && (
                                      <>
                                        <span>•</span>
                                        <span>~{song.duration_estimate}m</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeSongFromSetlist(song.id)}
                                  className="flex-shrink-0 p-1 text-muted-foreground opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                                  title="Remove from setlist"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Key Change Warning */}
                              {index > 0 &&
                                song.key &&
                                setlistSongs[index - 1]?.key &&
                                song.key !== setlistSongs[index - 1]?.key && (
                                  <div className="mt-2 flex items-center gap-2 border-t border-yellow-500/20 pt-2 text-xs text-yellow-500">
                                    <AlertCircle className="h-3 w-3" />
                                    Key change: {setlistSongs[index - 1]?.key} → {song.key}
                                  </div>
                                )}
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold">
                      Notes <span className="font-normal text-muted-foreground">(Optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special requests, transitions between songs, tuning changes..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  {/* Collaborative Notice */}
                  <div className="mt-6 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-primary">
                      <Sparkles className="h-4 w-4" />
                      Pro Tips for Great Setlists
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>
                        • <strong>Start strong:</strong> Open with a crowd-pleaser
                      </li>
                      <li>
                        • <strong>Energy arc:</strong> Build up, dip for intimacy, finish big
                      </li>
                      <li>
                        • <strong>Key changes:</strong>{' '}
                        {keyChanges > 3
                          ? '⚠️ Many key changes can tire your voice'
                          : '✓ Good variety'}
                      </li>
                      <li>
                        • <strong>Collaborate:</strong> Share in project chat for band feedback!
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-shrink-0 items-center justify-between border-t border-border bg-background px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  {!isValid && (
                    <span className="flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      {!setlistName.trim() ? 'Name required' : 'Add at least 1 song'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleSave}
                    disabled={!isValid || saving}
                    className="rnrb-button-primary flex items-center gap-2 rounded-lg px-6 py-2 font-semibold disabled:opacity-50"
                  >
                    {saving ? (
                      'Creating...'
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Create Setlist ({setlistSongs.length} songs)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
