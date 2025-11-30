'use client';

/**
 * AI Music Experiment Playground
 *
 * Interactive demo for the stem-based AI music generation concept
 * Users can:
 * - Enter creative prompts
 * - See generated stems (mocked for now)
 * - "Regenerate" or "Replace" individual stems
 * - Experience the real-time collaboration preview
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Volume2,
  VolumeX,
  Sliders,
  Wand2,
  Drum,
  Guitar,
  Piano,
  Mic,
  Layers,
  CheckCircle,
  Loader2,
  Lock,
  Music,
  Users,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

// Stem types with their colors and icons
const STEM_DEFINITIONS = [
  {
    id: 'drums',
    name: 'Drums',
    icon: Drum,
    color: 'red',
    waveform: [0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.6, 0.8],
  },
  {
    id: 'bass',
    name: 'Bass',
    icon: Guitar,
    color: 'orange',
    waveform: [0.3, 0.4, 0.6, 0.4, 0.5, 0.3, 0.4, 0.5],
  },
  {
    id: 'guitar',
    name: 'Guitar',
    icon: Guitar,
    color: 'yellow',
    waveform: [0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.6, 0.4],
  },
  {
    id: 'keys',
    name: 'Keys',
    icon: Piano,
    color: 'green',
    waveform: [0.6, 0.5, 0.7, 0.4, 0.6, 0.5, 0.4, 0.6],
  },
  {
    id: 'synth',
    name: 'Synth/Pads',
    icon: Layers,
    color: 'blue',
    waveform: [0.2, 0.3, 0.4, 0.3, 0.5, 0.4, 0.3, 0.4],
  },
  {
    id: 'vocals',
    name: 'Vocals',
    icon: Mic,
    color: 'purple',
    waveform: [0.5, 0.6, 0.4, 0.7, 0.3, 0.6, 0.5, 0.4],
  },
];

// Example prompts for inspiration
const EXAMPLE_PROMPTS = [
  'Upbeat indie rock, 120 BPM, key of G major, energetic drums',
  'Chill lo-fi hip hop, 85 BPM, jazzy chords, vinyl crackle vibe',
  'Epic orchestral, 140 BPM, dramatic brass, cinematic feel',
  'Funky disco groove, 118 BPM, slap bass, vintage synths',
  'Ambient electronic, 70 BPM, atmospheric pads, ethereal',
];

type StemState = {
  id: string;
  isGenerated: boolean;
  isGenerating: boolean;
  isReplaced: boolean;
  isMuted: boolean;
  volume: number;
};

export default function ExperimentPage() {
  const { user, loading } = useRequireAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [stems, setStems] = useState<StemState[]>(() =>
    STEM_DEFINITIONS.map((stem) => ({
      id: stem.id,
      isGenerated: false,
      isGenerating: false,
      isReplaced: false,
      isMuted: false,
      volume: 75,
    }))
  );

  // Simulate generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setHasGenerated(false);

    // Reset stems
    setStems((prev) =>
      prev.map((s) => ({
        ...s,
        isGenerated: false,
        isGenerating: true,
        isReplaced: false,
      }))
    );

    // Staggered generation for each stem
    for (let i = 0; i < STEM_DEFINITIONS.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));
      setStems((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, isGenerated: true, isGenerating: false } : s))
      );
    }

    setIsGenerating(false);
    setHasGenerated(true);
  }, [prompt]);

  // Regenerate a single stem
  const handleRegenerate = useCallback(async (stemId: string) => {
    setStems((prev) =>
      prev.map((s) => (s.id === stemId ? { ...s, isGenerating: true, isGenerated: false } : s))
    );

    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

    setStems((prev) =>
      prev.map((s) =>
        s.id === stemId ? { ...s, isGenerating: false, isGenerated: true, isReplaced: false } : s
      )
    );
  }, []);

  // "Replace" with user recording (simulated)
  const handleReplace = useCallback((stemId: string) => {
    setStems((prev) => prev.map((s) => (s.id === stemId ? { ...s, isReplaced: true } : s)));
  }, []);

  // Toggle mute
  const toggleMute = useCallback((stemId: string) => {
    setStems((prev) => prev.map((s) => (s.id === stemId ? { ...s, isMuted: !s.isMuted } : s)));
  }, []);

  // Update volume
  const updateVolume = useCallback((stemId: string, volume: number) => {
    setStems((prev) => prev.map((s) => (s.id === stemId ? { ...s, volume } : s)));
  }, []);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-400" />
          <p className="text-gray-400">Loading experiment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="group mb-6 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="mb-4 flex items-center justify-center gap-2">
            <Link
              href="/labs"
              className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Labs
            </Link>
          </div>

          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: 'rgba(255, 99, 71, 0.15)', border: '1px solid var(--border)' }}
          >
            <FlaskConical className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            <span className="font-bold" style={{ color: 'var(--accent)' }}>
              EXPERIMENT PLAYGROUND
            </span>
          </div>

          <h1 className="mb-2 text-3xl font-bold md:text-4xl" style={{ color: 'var(--text)' }}>
            AI Stem Generator
          </h1>
          <p className="mx-auto max-w-2xl" style={{ color: 'var(--muted)' }}>
            Experience the future of AI music. Enter a creative prompt and watch as individual stems
            are generated. Regenerate any stem or replace it with your own recording.
          </p>
        </motion.div>

        {/* Main Experiment Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            {/* Prompt Input */}
            <div className="border-b border-white/10 p-6">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Creative Direction
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Wand2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the music you want to create..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-orange-600 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Stems
                    </>
                  )}
                </Button>
              </div>

              {/* Example Prompts */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Try:</span>
                {EXAMPLE_PROMPTS.slice(0, 3).map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(example)}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {example.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Stem Mixer */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Sliders className="h-5 w-5 text-purple-400" />
                  Stem Mixer
                </h3>
                {hasGenerated && (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Play Mix
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Stems Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STEM_DEFINITIONS.map((stemDef, index) => {
                  const stem = stems[index];
                  const colorClasses = {
                    red: 'border-red-500/30 bg-red-500/10',
                    orange: 'border-orange-500/30 bg-orange-500/10',
                    yellow: 'border-yellow-500/30 bg-yellow-500/10',
                    green: 'border-green-500/30 bg-green-500/10',
                    blue: 'border-blue-500/30 bg-blue-500/10',
                    purple: 'border-purple-500/30 bg-purple-500/10',
                  };

                  return (
                    <motion.div
                      key={stemDef.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <Card
                        className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
                          colorClasses[stemDef.color as keyof typeof colorClasses]
                        } ${stem.isMuted ? 'opacity-50' : ''}`}
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <stemDef.icon className={`h-5 w-5 text-${stemDef.color}-400`} />
                            <span className="font-medium text-white">{stemDef.name}</span>
                            {stem.isReplaced && (
                              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">
                                YOUR RECORDING
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleMute(stemDef.id)}
                            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                          >
                            {stem.isMuted ? (
                              <VolumeX className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Volume2 className="h-4 w-4 text-white" />
                            )}
                          </button>
                        </div>

                        {/* Waveform Visualization */}
                        <div className="mb-3 flex h-12 items-end justify-around rounded-lg bg-black/30 p-2">
                          {stem.isGenerating ? (
                            <div className="flex h-full w-full items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                          ) : stem.isGenerated || stem.isReplaced ? (
                            stemDef.waveform.map((height, i) => (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{
                                  height: isPlaying ? `${height * 100}%` : `${height * 60}%`,
                                }}
                                transition={{
                                  duration: 0.3,
                                  repeat: isPlaying ? Infinity : 0,
                                  repeatType: 'reverse',
                                }}
                                className={`w-2 rounded-full ${
                                  stem.isReplaced ? 'bg-green-400' : `bg-${stemDef.color}-400`
                                }`}
                              />
                            ))
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Lock className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Volume Slider */}
                        <div className="mb-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={stem.volume}
                            onChange={(e) => updateVolume(stemDef.id, parseInt(e.target.value))}
                            disabled={!stem.isGenerated && !stem.isReplaced}
                            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRegenerate(stemDef.id)}
                            disabled={!stem.isGenerated || stem.isGenerating}
                            className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Regenerate
                          </Button>
                          <Button
                            onClick={() => handleReplace(stemDef.id)}
                            disabled={!stem.isGenerated && !stem.isReplaced}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                              stem.isReplaced
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            } disabled:opacity-50`}
                          >
                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                            {stem.isReplaced ? 'Replaced!' : 'Replace'}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer Info */}
            {hasGenerated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-white/10 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-400">
                        {stems.filter((s) => s.isReplaced).length} stems replaced with your
                        recordings
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">
                        {stems.filter((s) => s.isGenerated && !s.isReplaced).length} AI-generated
                        stems
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-1.5">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-purple-300">
                      Collaborators would see this in real-time!
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Card className="inline-flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-3">
            <FlaskConical className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-300">
              This is a preview. Actual AI generation coming in Phase 3!
            </span>
          </Card>
          <p className="mt-4 text-sm text-gray-500">
            <Link href="/labs/volunteer" className="text-purple-400 hover:underline">
              Sign up as a volunteer
            </Link>{' '}
            to be the first to test real AI-generated stems.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
