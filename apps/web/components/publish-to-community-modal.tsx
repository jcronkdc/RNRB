'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music, Loader2 } from '@/components/ui/custom-icons';
import { useState } from 'react';

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

  const genres = [
    'Electronic',
    'Rock',
    'Hip Hop',
    'Pop',
    'Jazz',
    'Classical',
    'R&B',
    'Country',
    'Folk',
    'Other',
  ];
  const moods = [
    'Upbeat',
    'Chill',
    'Dark',
    'Energetic',
    'Melancholic',
    'Peaceful',
    'Aggressive',
    'Romantic',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!genre.trim()) {
      setError('Please enter a genre');
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
          className="relative w-full max-w-lg rounded-xl border border-border bg-surface p-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-foreground-muted transition hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
              <Upload className="h-6 w-6 text-brand-primary" />
            </div>
            <h2 className="mb-1 text-2xl font-bold text-foreground">Publish to Community</h2>
            <p className="text-sm text-foreground-muted">Share "{songTitle}" with the world</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Genre */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Genre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="genre-suggestions"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Select or type a genre"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                required
              />
              <datalist id="genre-suggestions">
                {genres.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-foreground-muted">
                Choose from suggestions or type your own
              </p>
            </div>

            {/* Mood */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Mood</label>
              <input
                type="text"
                list="mood-suggestions"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Select or type a mood (optional)"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
              <datalist id="mood-suggestions">
                {moods.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            {/* BPM */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">BPM (Tempo)</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="e.g., 120"
                min="40"
                max="240"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            {/* Cover URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isExplicit}
                  onChange={(e) => setIsExplicit(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary/20"
                />
                <span className="text-sm text-foreground">
                  This track contains explicit content
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary/20"
                />
                <span className="text-sm text-foreground">Allow others to download this track</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowRemix}
                  onChange={(e) => setAllowRemix(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary/20"
                />
                <span className="text-sm text-foreground">Allow others to remix this track</span>
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
                className="flex-1 rounded-lg border border-border px-4 py-2 font-medium transition hover:bg-surface-hover"
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-primary-foreground transition hover:bg-brand-primary/90 disabled:opacity-50"
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
