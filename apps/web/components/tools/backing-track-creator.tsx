'use client';

import { Button } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  Download,
  Headphones,
  Loader2,
  Music,
  Pause,
  Play,
  PlayCircle,
  Trash2,
  Volume2,
} from '@/components/ui/custom-icons';
import { useState, useRef, useCallback, useEffect } from 'react';

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

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function encodeWAV(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = audioBuffer.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  let offset = headerSize;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function computeWaveformPeaks(buffers: Map<string, AudioBuffer>, resolution = 120): number[] {
  if (buffers.size === 0) return [];

  let maxLength = 0;
  buffers.forEach((buf) => {
    if (buf.length > maxLength) maxLength = buf.length;
  });

  if (maxLength === 0) return [];

  const samplesPerBin = Math.max(1, Math.floor(maxLength / resolution));
  const peaks: number[] = [];

  for (let i = 0; i < resolution; i++) {
    let peak = 0;
    const start = i * samplesPerBin;
    const end = start + samplesPerBin;

    buffers.forEach((buf) => {
      if (start >= buf.length) return;
      const data = buf.getChannelData(0);
      const limit = Math.min(end, data.length);
      for (let j = start; j < limit; j++) {
        const abs = Math.abs(data[j]);
        if (abs > peak) peak = abs;
      }
    });

    peaks.push(peak);
  }

  const maxPeak = Math.max(...peaks, 0.001);
  return peaks.map((p) => p / maxPeak);
}

export function BackingTrackCreator() {
  const [stems, setStems] = useState<StemTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [decodingIds, setDecodingIds] = useState<Set<string>>(new Set());
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // ── Audio engine refs ──────────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioBuffers = useRef(new Map<string, AudioBuffer>());
  const sourceNodes = useRef(new Map<string, AudioBufferSourceNode>());
  const gainNodes = useRef(new Map<string, GainNode>());
  const panNodes = useRef(new Map<string, StereoPannerNode>());

  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);
  const animFrameRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Mirror mutable state for use inside stable callbacks
  const stemsRef = useRef(stems);
  const masterVolumeRef = useRef(masterVolume);
  const durationRef = useRef(duration);

  useEffect(() => {
    stemsRef.current = stems;
  }, [stems]);
  useEffect(() => {
    masterVolumeRef.current = masterVolume;
  }, [masterVolume]);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // ── AudioContext initialization (user-gesture gated) ───────────────
  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = masterVolumeRef.current;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ── Recompute the combined duration ────────────────────────────────
  const recomputeDuration = useCallback(() => {
    let max = 0;
    audioBuffers.current.forEach((buf) => {
      if (buf.duration > max) max = buf.duration;
    });
    setDuration(max);
    durationRef.current = max;
    return max;
  }, []);

  // ── Stop all playing source nodes ──────────────────────────────────
  const stopAllSources = useCallback(() => {
    const nodes = new Map(sourceNodes.current);
    sourceNodes.current.clear();
    nodes.forEach((source) => {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      source.disconnect();
    });
  }, []);

  // ── Animation-frame timeline tick ──────────────────────────────────
  const tickTimeline = useCallback(() => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;

    const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
    const dur = durationRef.current;

    if (dur > 0 && elapsed >= dur) {
      isPlayingRef.current = false;
      pauseOffsetRef.current = 0;
      stopAllSources();
      setCurrentTime(0);
      setIsPlaying(false);
      return;
    }

    setCurrentTime(elapsed);
    animFrameRef.current = requestAnimationFrame(tickTimeline);
  }, [stopAllSources]);

  // ── Start playback from pauseOffset ────────────────────────────────
  const startPlayback = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!masterGainRef.current) return;

    const offset = pauseOffsetRef.current;
    const currentStems = stemsRef.current;
    const hasSoloed = currentStems.some((s) => s.solo);

    let hasAnySource = false;

    currentStems.forEach((stem) => {
      const buffer = audioBuffers.current.get(stem.id);
      if (!buffer || offset >= buffer.duration) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = gainNodes.current.get(stem.id);
      const pan = panNodes.current.get(stem.id);
      if (!gain || !pan) return;

      source.connect(gain);

      const effectiveGain = stem.muted || (hasSoloed && !stem.solo) ? 0 : stem.volume;
      gain.gain.value = effectiveGain;
      pan.pan.value = stem.pan;

      source.onended = () => {
        source.disconnect();
        sourceNodes.current.delete(stem.id);
      };

      source.start(0, offset);
      sourceNodes.current.set(stem.id, source);
      hasAnySource = true;
    });

    if (!hasAnySource) return;

    masterGainRef.current.gain.value = masterVolumeRef.current;
    startTimeRef.current = ctx.currentTime - offset;
    isPlayingRef.current = true;
    setIsPlaying(true);

    animFrameRef.current = requestAnimationFrame(tickTimeline);
  }, [ensureAudioContext, tickTimeline]);

  // ── Toggle play / pause ────────────────────────────────────────────
  const togglePlayPause = useCallback(() => {
    if (isPlayingRef.current) {
      if (audioCtxRef.current) {
        pauseOffsetRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = 0;
      }
      isPlayingRef.current = false;
      stopAllSources();
      setIsPlaying(false);
    } else {
      const hasBuffers = Array.from(audioBuffers.current.keys()).some((id) =>
        stemsRef.current.find((s) => s.id === id)
      );
      if (!hasBuffers) return;
      startPlayback();
    }
  }, [stopAllSources, startPlayback]);

  // ── Seek to position via timeline click ────────────────────────────
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const dur = durationRef.current;
      if (dur <= 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const seekTime = ratio * dur;

      pauseOffsetRef.current = seekTime;
      setCurrentTime(seekTime);

      if (isPlayingRef.current) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = 0;
        }
        isPlayingRef.current = false;
        stopAllSources();
        setIsPlaying(false);

        requestAnimationFrame(() => startPlayback());
      }
    },
    [stopAllSources, startPlayback]
  );

  // ── File upload → decode → store buffer ────────────────────────────
  const handleFileUpload = useCallback(
    async (id: string, file: File) => {
      const ctx = ensureAudioContext();

      setDecodingIds((prev) => new Set(prev).add(id));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBuffers.current.set(id, audioBuffer);

        if (!gainNodes.current.has(id)) {
          const gain = ctx.createGain();
          const pan = ctx.createStereoPanner();
          gain.connect(pan);
          pan.connect(masterGainRef.current!);
          gainNodes.current.set(id, gain);
          panNodes.current.set(id, pan);
        }

        setStems((prev) =>
          prev.map((s) => {
            if (s.id !== id) return s;
            if (s.url) URL.revokeObjectURL(s.url);
            return { ...s, file, url: URL.createObjectURL(file) };
          })
        );

        recomputeDuration();
        setWaveformData(computeWaveformPeaks(audioBuffers.current));
      } catch (err) {
        console.error('Failed to decode audio file:', (err as Error).message);
      } finally {
        setDecodingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [ensureAudioContext, recomputeDuration]
  );

  // ── Stem CRUD ──────────────────────────────────────────────────────
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

  const removeStem = useCallback(
    (id: string) => {
      const source = sourceNodes.current.get(id);
      if (source) {
        source.onended = null;
        try {
          source.stop();
        } catch {
          /* noop */
        }
        source.disconnect();
        sourceNodes.current.delete(id);
      }

      gainNodes.current.get(id)?.disconnect();
      gainNodes.current.delete(id);
      panNodes.current.get(id)?.disconnect();
      panNodes.current.delete(id);
      audioBuffers.current.delete(id);

      setStems((prev) => {
        const removed = prev.find((s) => s.id === id);
        if (removed?.url) URL.revokeObjectURL(removed.url);
        return prev.filter((s) => s.id !== id);
      });

      requestAnimationFrame(() => {
        recomputeDuration();
        setWaveformData(computeWaveformPeaks(audioBuffers.current));
      });
    },
    [recomputeDuration]
  );

  const updateStem = (id: string, updates: Partial<StemTrack>) => {
    setStems(stems.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const toggleMute = (id: string) => {
    updateStem(id, { muted: !stems.find((s) => s.id === id)?.muted });
  };

  const toggleSolo = (id: string) => {
    const stem = stems.find((s) => s.id === id);
    if (!stem) return;

    if (stem.solo) {
      setStems(stems.map((s) => ({ ...s, solo: false, muted: false })));
    } else {
      setStems(
        stems.map((s) => ({
          ...s,
          solo: s.id === id,
          muted: s.id !== id,
        }))
      );
    }
  };

  const getStemColor = (type: string) => {
    return STEM_TYPES.find((s) => s.id === type)?.color || '#6b7280';
  };

  const getEffectiveVolume = (stem: StemTrack) => {
    const hasSoloed = stems.some((s) => s.solo);
    if (stem.muted || (hasSoloed && !stem.solo)) return 0;
    return stem.volume * masterVolume;
  };

  // ── Sync audio node parameters when state changes ──────────────────
  useEffect(() => {
    const hasSoloed = stems.some((s) => s.solo);

    stems.forEach((stem) => {
      const gain = gainNodes.current.get(stem.id);
      if (gain) {
        gain.gain.value = stem.muted || (hasSoloed && !stem.solo) ? 0 : stem.volume;
      }

      const pan = panNodes.current.get(stem.id);
      if (pan) {
        pan.pan.value = stem.pan;
      }
    });

    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume;
    }
  }, [stems, masterVolume]);

  // ── Export via OfflineAudioContext → WAV download ───────────────────
  const exportBackingTrack = useCallback(async () => {
    if (audioBuffers.current.size === 0) return;

    setIsExporting(true);

    try {
      const sampleRate = 44100;
      const currentStems = stemsRef.current;
      const vol = masterVolumeRef.current;
      const hasSoloed = currentStems.some((s) => s.solo);

      const active: { buffer: AudioBuffer; stem: StemTrack }[] = [];

      currentStems.forEach((stem) => {
        if (stem.muted || (hasSoloed && !stem.solo)) return;
        const buffer = audioBuffers.current.get(stem.id);
        if (!buffer) return;
        active.push({ buffer, stem });
      });

      if (active.length === 0) {
        setIsExporting(false);
        return;
      }

      const maxDuration = Math.max(...active.map((d) => d.buffer.duration));
      const length = Math.ceil(maxDuration * sampleRate);

      const offlineCtx = new OfflineAudioContext(2, length, sampleRate);
      const offlineMaster = offlineCtx.createGain();
      offlineMaster.gain.value = vol;
      offlineMaster.connect(offlineCtx.destination);

      active.forEach(({ buffer, stem }) => {
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;

        const gain = offlineCtx.createGain();
        gain.gain.value = stem.volume;

        const pan = offlineCtx.createStereoPanner();
        pan.pan.value = stem.pan;

        source.connect(gain);
        gain.connect(pan);
        pan.connect(offlineMaster);
        source.start(0);
      });

      const rendered = await offlineCtx.startRendering();
      const wavBlob = encodeWAV(rendered);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(wavBlob);
      link.download = 'backing-track.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      sourceNodes.current.forEach((source) => {
        source.onended = null;
        try {
          source.stop();
        } catch {
          /* noop */
        }
        source.disconnect();
      });

      gainNodes.current.forEach((n) => n.disconnect());
      panNodes.current.forEach((n) => n.disconnect());
      masterGainRef.current?.disconnect();
      audioCtxRef.current?.close();

      stemsRef.current.forEach((s) => {
        if (s.url) URL.revokeObjectURL(s.url);
      });
    };
  }, []);

  // ── Derived state ──────────────────────────────────────────────────
  const hasUploadedFiles = audioBuffers.current.size > 0;
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-pink-600">
            <PlayCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Backing Track Creator</h3>
            <p className="text-muted-foreground text-sm">Mix stems for live performance</p>
          </div>
        </div>
        <Button
          onClick={exportBackingTrack}
          disabled={!hasUploadedFiles || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? 'Exporting…' : 'Export Mix'}
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
          <Music className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">No stems added yet</p>
          <p className="text-muted-foreground mt-2 text-sm">
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
                  className="h-10 w-10 shrink-0 rounded-lg"
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
                    className="w-full bg-transparent font-medium focus:outline-hidden"
                  />
                  {decodingIds.has(stem.id) ? (
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Decoding audio…
                    </span>
                  ) : stem.file ? (
                    <p className="text-muted-foreground text-xs">{stem.file.name}</p>
                  ) : (
                    <label className="text-brand-primary cursor-pointer text-xs hover:underline">
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
                  <Volume2 className="text-muted-foreground h-4 w-4" />
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
                  <span className="text-muted-foreground text-xs">L</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={stem.pan}
                    onChange={(e) => updateStem(stem.id, { pan: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground text-xs">R</span>
                </div>

                {/* Mute/Solo buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleMute(stem.id)}
                    className={`rounded px-2 py-1 text-xs font-bold ${
                      stem.muted
                        ? 'bg-red-500 text-white'
                        : 'text-muted-foreground bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(stem.id)}
                    className={`rounded px-2 py-1 text-xs font-bold ${
                      stem.solo
                        ? 'bg-yellow-500 text-black'
                        : 'text-muted-foreground bg-white/10 hover:bg-white/20'
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

      {/* Waveform Timeline */}
      {duration > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-14 text-right font-mono text-xs">
              {formatTime(currentTime)}
            </span>

            <div
              className="relative h-14 flex-1 cursor-pointer overflow-hidden rounded-lg bg-white/5"
              onClick={handleSeek}
            >
              {/* Inactive waveform bars */}
              <div className="absolute inset-0 flex items-end gap-px px-0.5">
                {waveformData.map((peak, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-white/10"
                    style={{ height: `${Math.max(6, peak * 100)}%` }}
                  />
                ))}
              </div>

              {/* Active (played) waveform overlay */}
              <div
                className="absolute inset-0 flex items-end gap-px px-0.5"
                style={{
                  clipPath: `inset(0 ${100 - progressPct}% 0 0)`,
                }}
              >
                {waveformData.map((peak, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-linear-to-t from-fuchsia-500 to-pink-400"
                    style={{ height: `${Math.max(6, peak * 100)}%` }}
                  />
                ))}
              </div>

              {/* Playhead */}
              <div
                className="absolute inset-y-0 z-10 w-0.5 bg-white"
                style={{
                  left: `${progressPct}%`,
                  boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                }}
              />
            </div>

            <span className="text-muted-foreground w-14 font-mono text-xs">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Master Controls */}
      {stems.length > 0 && (
        <div className="rounded-xl bg-linear-to-r from-fuchsia-500/10 to-pink-500/10 p-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              onClick={togglePlayPause}
              disabled={!hasUploadedFiles}
              className={`h-14 w-14 rounded-full ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-linear-to-r from-fuchsia-500 to-pink-600'
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
        <ol className="text-muted-foreground space-y-2 text-sm">
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
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Mute your own instrument to create a practice track</li>
          <li>• Use pan to spread instruments in the stereo field</li>
          <li>• Export different versions for rehearsal vs. performance</li>
          <li>• Keep click track separate for in-ear monitors</li>
        </ul>
      </div>
    </div>
  );
}
