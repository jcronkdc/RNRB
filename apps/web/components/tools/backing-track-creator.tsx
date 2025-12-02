'use client';

import { Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Download,
  Headphones,
  Music,
  Pause,
  Play,
  PlayCircle,
  Trash2,
  Volume2,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface StemTrack {
  id: string;
  name: string;
  type: 'drums' | 'bass' | 'guitar' | 'keys' | 'vocals' | 'other';
  volume: number;
  muted: boolean;
  solo: boolean;
  pan: number;
  file?: File;
  url?: string;
}

const STEM_TYPES = [
  { id: 'drums', name: 'Drums', color: '#eab308' },
  { id: 'bass', name: 'Bass', color: '#22c55e' },
  { id: 'guitar', name: 'Guitar', color: '#3b82f6' },
  { id: 'keys', name: 'Keys', color: '#a855f7' },
  { id: 'vocals', name: 'Vocals', color: '#ec4899' },
  { id: 'other', name: 'Other', color: '#6b7280' },
];

export function BackingTrackCreator() {
  const [stems, setStems] = useState<StemTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1);
  const [_currentTime, _setCurrentTime] = useState(0);
  const [_duration, _setDuration] = useState(0);

  // Add new stem
  const addStem = (type: StemTrack['type']) => {
    const newStem: StemTrack = {
      id: `stem-${Date.now()}`,
      name: STEM_TYPES.find((s) => s.id === type)?.name || 'Track',
      type,
      volume: 0.8,
      muted: false,
      solo: false,
      pan: 0,
    };
    setStems([...stems, newStem]);
  };

  // Remove stem
  const removeStem = (id: string) => {
    setStems(stems.filter((s) => s.id !== id));
  };

  // Update stem
  const updateStem = (id: string, updates: Partial<StemTrack>) => {
    setStems(stems.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Toggle mute
  const toggleMute = (id: string) => {
    updateStem(id, { muted: !stems.find((s) => s.id === id)?.muted });
  };

  // Toggle solo
  const toggleSolo = (id: string) => {
    const stem = stems.find((s) => s.id === id);
    if (!stem) return;

    if (stem.solo) {
      // Unsolo - unmute all
      setStems(stems.map((s) => ({ ...s, solo: false, muted: false })));
    } else {
      // Solo - mute all others
      setStems(
        stems.map((s) => ({
          ...s,
          solo: s.id === id,
          muted: s.id !== id,
        }))
      );
    }
  };

  // Handle file upload for stem
  const handleFileUpload = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    updateStem(id, { file, url });
  };

  // Get color for stem type
  const getStemColor = (type: string) => {
    return STEM_TYPES.find((s) => s.id === type)?.color || '#6b7280';
  };

  // Calculate effective volume for display
  const getEffectiveVolume = (stem: StemTrack) => {
    const hasSoloed = stems.some((s) => s.solo);
    if (stem.muted || (hasSoloed && !stem.solo)) return 0;
    return stem.volume * masterVolume;
  };

  // Export backing track (mock)
  const exportBackingTrack = () => {
    // In real implementation, this would mix stems and export
    alert('In production, this would mix all unmuted stems and export as a single audio file.');
  };

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600">
            <PlayCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Backing Track Creator</h3>
            <p className="text-sm text-muted-foreground">Mix stems for live performance</p>
          </div>
        </div>
        <Button onClick={exportBackingTrack} disabled={stems.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          Export Mix
        </Button>
      </div>

      {/* Add Stems */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold">Add Stems</h4>
        <div className="flex flex-wrap gap-2">
          {STEM_TYPES.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              size="sm"
              onClick={() => addStem(type.id as StemTrack['type'])}
              className="gap-2"
              style={{ borderColor: type.color + '40' }}
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
              {type.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Stems List */}
      {stems.length === 0 ? (
        <div className="rounded-xl bg-white/5 py-12 text-center">
          <Music className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No stems added yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Click the buttons above to add instrument stems
          </p>
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          {stems.map((stem) => (
            <motion.div
              key={stem.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/5 p-4"
            >
              <div className="flex items-center gap-4">
                {/* Type indicator */}
                <div
                  className="h-10 w-10 flex-shrink-0 rounded-lg"
                  style={{ backgroundColor: getStemColor(stem.type) + '30' }}
                >
                  <div className="flex h-full items-center justify-center">
                    <Music className="h-5 w-5" style={{ color: getStemColor(stem.type) }} />
                  </div>
                </div>

                {/* Name and file upload */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={stem.name}
                    onChange={(e) => updateStem(stem.id, { name: e.target.value })}
                    className="w-full bg-transparent font-medium focus:outline-none"
                  />
                  {stem.file ? (
                    <p className="text-xs text-muted-foreground">{stem.file.name}</p>
                  ) : (
                    <label className="cursor-pointer text-xs text-brand-primary hover:underline">
                      Upload audio file
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(stem.id, file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Volume slider */}
                <div className="flex w-32 items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={stem.volume}
                    onChange={(e) => updateStem(stem.id, { volume: Number(e.target.value) })}
                    className="flex-1"
                  />
                </div>

                {/* Pan control */}
                <div className="flex w-24 items-center gap-1">
                  <span className="text-xs text-muted-foreground">L</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={stem.pan}
                    onChange={(e) => updateStem(stem.id, { pan: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground">R</span>
                </div>

                {/* Mute/Solo buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleMute(stem.id)}
                    className={`rounded px-2 py-1 text-xs font-bold ${
                      stem.muted
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-muted-foreground hover:bg-white/20'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(stem.id)}
                    className={`rounded px-2 py-1 text-xs font-bold ${
                      stem.solo
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-muted-foreground hover:bg-white/20'
                    }`}
                  >
                    S
                  </button>
                </div>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStem(stem.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume meter */}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getStemColor(stem.type) }}
                  animate={{ width: `${getEffectiveVolume(stem) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Master Controls */}
      {stems.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 p-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`h-14 w-14 rounded-full ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-fuchsia-500 to-pink-600'
              }`}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            {/* Master Volume */}
            <div className="flex flex-1 items-center gap-3">
              <Headphones className="h-5 w-5" />
              <span className="text-sm font-medium">Master</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-mono text-sm">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Active Stems Info */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {stems.filter((s) => !s.muted && (!stems.some((x) => x.solo) || s.solo)).length} of{' '}
              {stems.length} stems active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStems(stems.map((s) => ({ ...s, muted: false, solo: false })))}
            >
              Reset All
            </Button>
          </div>
        </div>
      )}

      {/* Usage Guide */}
      <div className="mt-6 rounded-xl bg-white/5 p-4">
        <h4 className="mb-3 text-sm font-semibold">How to Use</h4>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>
            1. <strong>Add stems</strong> for each instrument track you want to include
          </li>
          <li>
            2. <strong>Upload audio files</strong> for each stem (WAV, MP3, etc.)
          </li>
          <li>
            3. <strong>Adjust volumes</strong> and <strong>pan</strong> for each track
          </li>
          <li>
            4. <strong>Mute (M)</strong> tracks you want to play live yourself
          </li>
          <li>
            5. <strong>Solo (S)</strong> to isolate individual tracks for practice
          </li>
          <li>
            6. <strong>Export</strong> your custom backing track for live use
          </li>
        </ol>
      </div>

      {/* Tips */}
      <div className="mt-4 rounded-xl bg-yellow-500/10 p-4">
        <h4 className="mb-2 text-sm font-semibold text-yellow-400">Pro Tips</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Mute your own instrument to create a practice track</li>
          <li>• Use pan to spread instruments in the stereo field</li>
          <li>• Export different versions for rehearsal vs. performance</li>
          <li>• Keep click track separate for in-ear monitors</li>
        </ul>
      </div>
    </div>
  );
}
