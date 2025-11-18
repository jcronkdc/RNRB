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
  CheckCircle2
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
  projectSongs
}: CreateSetlistModalProps) {
  const [setlistName, setSetlistName] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Get songs not yet in setlist
  const availableSongs = projectSongs.filter(song => !selectedSongIds.includes(song.id));
  
  // Get songs in setlist order
  const setlistSongs = selectedSongIds
    .map(id => projectSongs.find(s => s.id === id))
    .filter(Boolean) as typeof projectSongs;

  const addSongToSetlist = (songId: string) => {
    setSelectedSongIds([...selectedSongIds, songId]);
  };

  const removeSongFromSetlist = (songId: string) => {
    setSelectedSongIds(selectedSongIds.filter(id => id !== songId));
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-background border border-border rounded-2xl shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-display font-bold">Create Setlist</h2>
                  <p className="text-sm text-muted-foreground">Organize songs for your show</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Setlist Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={setlistName}
                        onChange={(e) => setSetlistName(e.target.value)}
                        placeholder="Friday Night Show, Acoustic Set, Main Set..."
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Venue <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="The Bluebird Cafe, House of Blues..."
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Show Date <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Setlist Stats</label>
                      <div className="flex gap-2 text-xs">
                        <div className="px-3 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded">
                          <span className="font-bold text-brand-primary">{setlistSongs.length}</span> songs
                        </div>
                        <div className="px-3 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded">
                          <span className="font-bold text-brand-primary">~{totalDuration}</span> min
                        </div>
                        {keyChanges > 0 && (
                          <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                            <span className="font-bold text-yellow-500">{keyChanges}</span> key changes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Available Songs */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Music className="w-4 h-4 text-brand-primary" />
                        Available Songs ({availableSongs.length})
                      </h3>
                      
                      {availableSongs.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm text-muted-foreground">All songs added!</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {availableSongs.map((song) => (
                            <button
                              key={song.id}
                              onClick={() => addSongToSetlist(song.id)}
                              className="w-full p-3 bg-surface border border-border hover:border-brand-primary rounded-lg transition-all text-left group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{song.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    {song.key && <span>Key: {song.key}</span>}
                                    {song.tempo && <><span>•</span><span>{song.tempo} BPM</span></>}
                                  </div>
                                </div>
                                <Plus className="w-4 h-4 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Setlist Order (Drag-Drop) */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-brand-primary" />
                        Setlist Order ({setlistSongs.length})
                        <span className="text-xs text-muted-foreground font-normal ml-auto">
                          Drag to reorder
                        </span>
                      </h3>

                      {setlistSongs.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
                          <ArrowRight className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50 rotate-180" />
                          <p className="text-sm text-muted-foreground">
                            Add songs from the left
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click any song to add it to your setlist
                          </p>
                        </div>
                      ) : (
                        <Reorder.Group
                          axis="y"
                          values={selectedSongIds}
                          onReorder={setSelectedSongIds}
                          className="space-y-2 max-h-96 overflow-y-auto pr-2"
                        >
                          {setlistSongs.map((song, index) => (
                            <Reorder.Item
                              key={song.id}
                              value={song.id}
                              className="p-3 bg-brand-primary/5 border border-brand-primary/30 rounded-lg cursor-move group"
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="w-6 h-6 rounded-full bg-brand-primary text-brand-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                                  {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{song.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    {song.key && <span>Key: {song.key}</span>}
                                    {song.tempo && <><span>•</span><span>{song.tempo} BPM</span></>}
                                    {song.duration_estimate && <><span>•</span><span>~{song.duration_estimate}m</span></>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeSongFromSetlist(song.id)}
                                  className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                  title="Remove from setlist"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Key Change Warning */}
                              {index > 0 && song.key && setlistSongs[index - 1]?.key && song.key !== setlistSongs[index - 1]?.key && (
                                <div className="mt-2 pt-2 border-t border-yellow-500/20 flex items-center gap-2 text-xs text-yellow-500">
                                  <AlertCircle className="w-3 h-3" />
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
                    <label className="block text-sm font-semibold mb-2">
                      Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special requests, transitions between songs, tuning changes..."
                      rows={3}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none resize-none text-sm"
                    />
                  </div>

                  {/* Collaborative Notice */}
                  <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <p className="text-sm text-brand-primary font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Pro Tips for Great Setlists
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• <strong>Start strong:</strong> Open with a crowd-pleaser</li>
                      <li>• <strong>Energy arc:</strong> Build up, dip for intimacy, finish big</li>
                      <li>• <strong>Key changes:</strong> {keyChanges > 3 ? '⚠️ Many key changes can tire your voice' : '✓ Good variety'}</li>
                      <li>• <strong>Collaborate:</strong> Share in project chat for band feedback!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-background border-t border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="text-sm text-muted-foreground">
                  {!isValid && (
                    <span className="flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="w-4 h-4" />
                      {!setlistName.trim() ? 'Name required' : 'Add at least 1 song'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleSave}
                    disabled={!isValid || saving}
                    className="rnrb-button-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? 'Creating...' : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
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

