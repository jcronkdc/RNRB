'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music, Loader2 } from 'lucide-react';

interface PublishToCommunityModalProps {
  songId: string;
  songTitle: string;
  audioUrl?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PublishToCommunityModal({
  songId,
  songTitle,
  audioUrl,
  onClose,
  onSuccess,
}: PublishToCommunityModalProps) {
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [bpm, setBpm] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isExplicit, setIsExplicit] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowRemix, setAllowRemix] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const genres = ['Electronic', 'Rock', 'Hip Hop', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country', 'Folk', 'Other'];
  const moods = ['Upbeat', 'Chill', 'Dark', 'Energetic', 'Melancholic', 'Peaceful', 'Aggressive', 'Romantic'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!genre) {
      setError('Please select a genre');
      return;
    }

    if (!audioUrl) {
      setError('Song must have an audio file to be published');
      return;
    }

    setPublishing(true);

    try {
      // For now, we'll use the audioUrl as both URL and path
      // In production, you'd upload to Supabase Storage first
      const response = await fetch('/api/community/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId,
          audioUrl,
          audioPath: audioUrl, // Same as URL for now
          coverUrl: coverUrl || null,
          waveformData: null, // Could generate this client-side
          genre,
          mood: mood || null,
          bpm: bpm ? parseInt(bpm) : null,
          duration: 180, // Default 3 minutes - should be calculated from audio
          isExplicit,
          allowDownload,
          allowRemix,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish track');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to publish to community');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface border-border relative w-full max-w-lg rounded-xl border p-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground absolute right-4 top-4 transition"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Upload className="text-brand-primary h-6 w-6" />
            </div>
            <h2 className="text-foreground mb-1 text-2xl font-bold">Publish to Community</h2>
            <p className="text-foreground-muted text-sm">Share "{songTitle}" with the world</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Genre */}
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                Genre <span className="text-red-500">*</span>
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="border-border bg-surface text-foreground w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                required
              >
                <option value="">Select a genre</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood */}
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="border-border bg-surface text-foreground w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="">Select a mood (optional)</option>
                {moods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* BPM */}
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">BPM (Tempo)</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="e.g., 120"
                min="40"
                max="240"
                className="border-border bg-surface text-foreground w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            {/* Cover URL */}
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Cover Image URL</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="border-border bg-surface text-foreground w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isExplicit}
                  onChange={(e) => setIsExplicit(e.target.checked)}
                  className="text-brand-primary focus:ring-brand-primary/20 h-4 w-4 rounded"
                />
                <span className="text-foreground text-sm">This track contains explicit content</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="text-brand-primary focus:ring-brand-primary/20 h-4 w-4 rounded"
                />
                <span className="text-foreground text-sm">Allow others to download this track</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowRemix}
                  onChange={(e) => setAllowRemix(e.target.checked)}
                  className="text-brand-primary focus:ring-brand-primary/20 h-4 w-4 rounded"
                />
                <span className="text-foreground text-sm">Allow others to remix this track</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="border-border hover:bg-surface-hover flex-1 rounded-lg border px-4 py-2 font-medium transition"
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition disabled:opacity-50"
                disabled={publishing}
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Music className="h-4 w-4" />
                    Publish to Community
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}






