'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  Music,
  Hash,
  Tag,
  FileText,
  Palette,
  Heart,
  MessageSquare,
  FolderOpen,
  Zap,
  AlertCircle,
  Check,
  Trash2,
  ExternalLink,
} from '@/components/ui/custom-icons';
import {
  type LibraryFile,
  type LibraryCollection,
  MUSICAL_KEYS,
  MOODS,
  LABEL_COLORS,
} from '@/hooks/use-library';

interface FileEditModalProps {
  file: LibraryFile;
  collections: LibraryCollection[];
  onSave: (updates: Partial<LibraryFile>) => Promise<void>;
  onDelete: () => Promise<void>;
  onOpenInSongwriting?: () => void;
  onClose: () => void;
}

export function FileEditModal({
  file,
  collections,
  onSave,
  onDelete,
  onOpenInSongwriting,
  onClose,
}: FileEditModalProps) {
  // Form state
  const [name, setName] = useState(file.name);
  const [bpm, setBpm] = useState<string>(file.bpm?.toString() || '');
  const [musicalKey, setMusicalKey] = useState(file.musicalKey || '');
  const [mood, setMood] = useState(file.mood || '');
  const [color, setColor] = useState(file.color || '');
  const [notes, setNotes] = useState(file.notes || '');
  const [lyrics, setLyrics] = useState(file.lyrics || '');
  const [tags, setTags] = useState<string[]>(file.tags || []);
  const [newTag, setNewTag] = useState('');
  const [collectionId, setCollectionId] = useState(file.collectionId || '');
  const [isFavorite, setIsFavorite] = useState(file.isFavorite);

  // UI state
  const [activeTab, setActiveTab] = useState<'details' | 'lyrics' | 'notes'>('details');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const changed =
      name !== file.name ||
      bpm !== (file.bpm?.toString() || '') ||
      musicalKey !== (file.musicalKey || '') ||
      mood !== (file.mood || '') ||
      color !== (file.color || '') ||
      notes !== (file.notes || '') ||
      lyrics !== (file.lyrics || '') ||
      JSON.stringify(tags) !== JSON.stringify(file.tags || []) ||
      collectionId !== (file.collectionId || '') ||
      isFavorite !== file.isFavorite;

    setHasChanges(changed);
  }, [name, bpm, musicalKey, mood, color, notes, lyrics, tags, collectionId, isFavorite, file]);

  // Add tag
  const addTag = useCallback(() => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  }, [newTag, tags]);

  // Remove tag
  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updates: Partial<LibraryFile> = {
        name: name.trim() || file.name,
        bpm: bpm ? parseInt(bpm) : undefined,
        musicalKey: musicalKey || undefined,
        mood: mood || undefined,
        color: color || undefined,
        notes: notes || undefined,
        lyrics: lyrics || undefined,
        tags,
        collectionId: collectionId || undefined,
        isFavorite,
      };

      await onSave(updates);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) return;

    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      setSaving(false);
    }
  };

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges) handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, onClose]);

  // Check if file is lyrics/chords type
  const isLyricsType = ['lyrics', 'chords', 'sheet_music'].includes(file.type);
  const isAudioType = ['stem', 'demo', 'sample', 'loop'].includes(file.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !hasChanges) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Edit File</h2>
                <p className="text-sm text-gray-400">{file.originalName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {[
              { id: 'details', label: 'Details', icon: Music },
              { id: 'lyrics', label: 'Lyrics', icon: FileText },
              { id: 'notes', label: 'Notes', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                {/* Audio metadata (for audio files) */}
                {isAudioType && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* BPM */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Hash className="h-4 w-4" />
                        BPM
                      </label>
                      <input
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(e.target.value)}
                        placeholder="120"
                        min="20"
                        max="300"
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Key */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Music className="h-4 w-4" />
                        Key
                      </label>
                      <select
                        value={musicalKey}
                        onChange={(e) => setMusicalKey(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-orange-500 focus:outline-hidden"
                      >
                        <option value="">Select key...</option>
                        {MUSICAL_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mood */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Zap className="h-4 w-4" />
                        Mood
                      </label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-orange-500 focus:outline-hidden"
                      >
                        <option value="">Select mood...</option>
                        {MOODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Collection */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                    <FolderOpen className="h-4 w-4" />
                    Collection
                  </label>
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-orange-500 focus:outline-hidden"
                  >
                    <option value="">No collection</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Label */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Palette className="h-4 w-4" />
                    Color Label
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setColor('')}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                        !color ? 'border-white' : 'border-transparent'
                      } bg-gray-700`}
                    >
                      {!color && <X className="h-4 w-4 text-gray-400" />}
                    </button>
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          color === c.value ? 'scale-110 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Add tag..."
                        className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden"
                      />
                      <button
                        onClick={addTag}
                        className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Favorite */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
                      isFavorite
                        ? 'bg-pink-500/20 text-pink-500'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </button>
                </div>
              </div>
            )}

            {/* Lyrics Tab */}
            {activeTab === 'lyrics' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Store lyrics, chord progressions, or any text content with this file. This text is
                  searchable from the library.
                </p>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter lyrics, chords, or notes..."
                  className="h-80 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 p-4 font-mono text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{lyrics.length} characters</span>
                  <span>{lyrics.split('\n').length} lines</span>
                </div>

                {/* Open in Songwriting button */}
                {isLyricsType && onOpenInSongwriting && (
                  <button
                    onClick={onOpenInSongwriting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500 bg-orange-500/10 px-4 py-3 text-orange-500 transition-all hover:bg-orange-500/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Songwriting Tool
                  </button>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Add personal notes, reminders, or context about this file.
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this file..."
                  className="h-60 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="border-t border-gray-800 px-6 py-2 text-center text-xs text-gray-600">
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5">⌘</kbd> +{' '}
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5">S</kbd> to save •{' '}
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5">Esc</kbd> to close
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
