'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Play,
  Pause,
  Download,
  Loader2,
  Music2,
  Mic,
  Volume2,
  Drum,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Sliders,
  X,
} from '@/components/ui/custom-icons';

interface StemResult {
  name: string;
  url: string;
  color: string;
  icon: React.ElementType;
}

interface SeparationJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  stems?: StemResult[];
  error?: string;
}

type SeparationMode = '2-stem' | '4-stem' | '6-stem';
type QualityPreset = 'fast' | 'balanced' | 'high';

const MODES: {
  id: SeparationMode;
  name: string;
  description: string;
  credits: number;
  stems: string[];
  useCase: string;
}[] = [
  {
    id: '2-stem',
    name: 'Vocals & Instrumental',
    description: 'Quick separation for karaoke or vocal practice',
    credits: 2,
    stems: ['Vocals', 'Instrumental'],
    useCase: 'Karaoke, acapella, vocal removal',
  },
  {
    id: '4-stem',
    name: 'Full Band Separation',
    description: 'Vocals, drums, bass, and other instruments',
    credits: 5,
    stems: ['Vocals', 'Drums', 'Bass', 'Other'],
    useCase: 'Learning parts, remixing, backing tracks',
  },
  {
    id: '6-stem',
    name: 'Pro Separation',
    description: 'Maximum detail with guitar and piano isolated',
    credits: 8,
    stems: ['Vocals', 'Drums', 'Bass', 'Guitar', 'Piano', 'Other'],
    useCase: 'Transcription, sampling, advanced remixing',
  },
];

const QUALITY_PRESETS: {
  id: QualityPreset;
  name: string;
  description: string;
  time: string;
  icon: string;
}[] = [
  {
    id: 'fast',
    name: 'Fast',
    description: 'Quick processing, good quality',
    time: '~1-2 min',
    icon: '',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Recommended for most uses',
    time: '~3-5 min',
    icon: '⚖️',
  },
  {
    id: 'high',
    name: 'High Quality',
    description: 'Best separation, slower',
    time: '~6-10 min',
    icon: '',
  },
];

const STEM_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  vocals: { bg: 'from-pink-500 to-rose-600', text: 'text-pink-400', icon: Mic },
  drums: { bg: 'from-orange-500 to-red-600', text: 'text-orange-400', icon: Drum },
  bass: { bg: 'from-purple-500 to-indigo-600', text: 'text-purple-400', icon: Volume2 },
  guitar: { bg: 'from-amber-500 to-yellow-600', text: 'text-amber-400', icon: Music2 },
  piano: { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-400', icon: Music2 },
  other: { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', icon: Sliders },
  instrumental: { bg: 'from-indigo-500 to-purple-600', text: 'text-indigo-400', icon: Music2 },
};

export function StemSeparator() {
  const [selectedMode, setSelectedMode] = useState<SeparationMode>('4-stem');
  const [selectedQuality, setSelectedQuality] = useState<QualityPreset>('balanced');
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [job, setJob] = useState<SeparationJob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playingStems, setPlayingStems] = useState<Record<string, boolean>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a'];
      if (
        !validTypes.includes(selectedFile.type) &&
        !selectedFile.name.match(/\.(mp3|wav|flac|m4a)$/i)
      ) {
        alert('Please select an audio file (MP3, WAV, FLAC, or M4A)');
        return;
      }
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File size must be under 50MB');
        return;
      }
      setFile(selectedFile);
      setJob(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        const fakeEvent = {
          target: { files: [droppedFile] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(fakeEvent);
      }
    },
    [handleFileSelect]
  );

  const uploadAndSeparate = async () => {
    if (!file) return;

    setIsUploading(true);
    setJob({ id: '', status: 'processing', progress: 0 });

    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio file');
      }

      const { url } = await uploadResponse.json();
      setAudioUrl(url);

      // Start separation
      const separateResponse = await fetch('/api/stems/separate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: url,
          mode: selectedMode,
          quality: selectedQuality,
        }),
      });

      if (!separateResponse.ok) {
        const error = await separateResponse.json();
        throw new Error(error.error || 'Failed to start separation');
      }

      const { predictionId } = await separateResponse.json();
      setJob((prev) => (prev ? { ...prev, id: predictionId, progress: 10 } : null));

      // Poll for completion
      await pollForCompletion(predictionId);
    } catch (error) {
      console.error('Separation error:', error);
      setJob({
        id: '',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Separation failed',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const pollForCompletion = async (predictionId: string) => {
    const maxAttempts = 120; // 10 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      attempts++;

      try {
        const response = await fetch(`/api/stems/status/${predictionId}`);
        if (!response.ok) throw new Error('Failed to check status');

        const data = await response.json();

        if (data.status === 'succeeded' && data.stems) {
          // Convert stems object to array
          const stemsArray: StemResult[] = Object.entries(data.stems)
            .filter(([_, url]) => url)
            .map(([name, url]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              url: url as string,
              color: STEM_COLORS[name.toLowerCase()]?.bg || 'from-gray-500 to-gray-600',
              icon: STEM_COLORS[name.toLowerCase()]?.icon || Music2,
            }));

          setJob({
            id: predictionId,
            status: 'completed',
            progress: 100,
            stems: stemsArray,
          });
          return;
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Separation failed');
        } else {
          // Update progress
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  progress: Math.min(90, 10 + attempts * 2),
                }
              : null
          );
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }

    // Timeout
    setJob((prev) =>
      prev
        ? {
            ...prev,
            status: 'failed',
            error: 'Processing timed out. Please try again.',
          }
        : null
    );
  };

  const toggleStemPlayback = (stemName: string, url: string) => {
    const audio = audioRefs.current[stemName];

    if (!audio) {
      const newAudio = new Audio(url);
      audioRefs.current[stemName] = newAudio;
      newAudio.play();
      setPlayingStems((prev) => ({ ...prev, [stemName]: true }));
      newAudio.onended = () => {
        setPlayingStems((prev) => ({ ...prev, [stemName]: false }));
      };
    } else {
      if (playingStems[stemName]) {
        audio.pause();
        setPlayingStems((prev) => ({ ...prev, [stemName]: false }));
      } else {
        audio.play();
        setPlayingStems((prev) => ({ ...prev, [stemName]: true }));
      }
    }
  };

  const downloadStem = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace(/\.[^/.]+$/, '')}_${name.toLowerCase()}.wav`;
    link.click();
  };

  const downloadAllStems = () => {
    if (!job?.stems) return;
    job.stems.forEach((stem) => {
      downloadStem(stem.url, stem.name);
    });
  };

  const reset = () => {
    // Stop all playing audio
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    audioRefs.current = {};
    setPlayingStems({});
    setFile(null);
    setAudioUrl(null);
    setJob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white/70">Separation Mode</label>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((mode) => (
            <motion.button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                selectedMode === mode.id
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white">{mode.name}</h4>
                  <p className="mt-1 text-xs text-white/50">{mode.description}</p>
                </div>
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
                  {mode.credits} credits
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {mode.stems.map((stem) => (
                  <span
                    key={stem}
                    className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/60"
                  >
                    {stem}
                  </span>
                ))}
              </div>
              {selectedMode === mode.id && (
                <motion.div
                  layoutId="mode-indicator"
                  className="absolute inset-0 -z-10 bg-linear-to-br from-orange-500/20 to-transparent"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white/70">Processing Quality</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {QUALITY_PRESETS.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => setSelectedQuality(preset.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-lg border p-3 text-left transition-all ${
                selectedQuality === preset.id
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{preset.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{preset.name}</h4>
                  <p className="text-xs text-white/50">{preset.time}</p>
                </div>
              </div>
              {selectedQuality === preset.id && (
                <motion.div
                  layoutId="quality-indicator"
                  className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-500/20 to-transparent"
                />
              )}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-white/40">
          {QUALITY_PRESETS.find((p) => p.id === selectedQuality)?.description}
        </p>
      </div>

      {/* File Upload */}
      {!job?.stems && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            file ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/20 hover:border-white/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={job?.status === 'processing'}
          />

          {file ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500/20 to-red-500/20">
                <Music2 className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-white/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="mx-auto flex items-center gap-1 text-sm text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <Upload className="h-8 w-8 text-white/40" />
              </div>
              <div>
                <p className="font-medium text-white">Drop your audio file here</p>
                <p className="text-sm text-white/50">
                  or click to browse (MP3, WAV, FLAC, M4A up to 50MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Status */}
      <AnimatePresence mode="wait">
        {job?.status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Separating Stems...</h4>
                <p className="text-sm text-white/50">
                  This may take 2-5 minutes depending on track length
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Progress</span>
                <span className="text-orange-400">{job.progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${job.progress}%` }}
                  className="h-full bg-linear-to-r from-orange-500 to-red-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {job?.status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Separation Failed</h4>
                <p className="text-sm text-red-400/80">{job.error}</p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {job?.status === 'completed' && job.stems && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Separation Complete!</h4>
                  <p className="text-sm text-white/50">{job.stems.length} stems extracted</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadAllStems}
                  className="flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:shadow-xl"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  New File
                </button>
              </div>
            </div>

            {/* Stems Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {job.stems.map((stem, index) => {
                const IconComponent = stem.icon;
                return (
                  <motion.div
                    key={stem.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${stem.color}`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-white">{stem.name}</h5>
                        <p className="text-xs text-white/50">Stem track</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStemPlayback(stem.name, stem.url)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          {playingStems[stem.name] ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => downloadStem(stem.url, stem.name)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Button */}
      {file && !job && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={uploadAndSeparate}
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Music2 className="h-5 w-5" />
              Separate Stems ({MODES.find((m) => m.id === selectedMode)?.credits} credits)
            </>
          )}
        </motion.button>
      )}

      {/* Use Cases */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="mb-3 text-sm font-semibold text-white/70">What You Can Do With Stems</h4>
        <div className="grid gap-2 text-sm text-white/50 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Create karaoke versions (remove vocals)
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Learn drum parts in isolation
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Practice bass lines alone
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Transcribe guitar solos clearly
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Create backing tracks for live shows
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Sample and remix individual elements
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-xs text-emerald-400">
            <span className="font-semibold">Pro Tip:</span> Use "High Quality" mode when you need
            the cleanest stems for remixing or sampling. "Fast" is great for quick previews.
          </p>
        </div>
      </div>
    </div>
  );
}
