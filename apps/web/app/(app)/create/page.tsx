'use client';

import { Card } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Music2,
  Clock,
  Zap,
  Hash,
  Mic2,
  Sliders,
  RefreshCw,
  ChevronDown,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Coins,
  Volume2,
  Download,
  FolderPlus,
  X,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useCallback, useEffect } from 'react';

import { ProjectSelector } from '@/components/project-selector';

// Style chips for genre/mood/tempo
const styleOptions = {
  genre: [
    'Rock',
    'Pop',
    'Electronic',
    'Hip Hop',
    'Jazz',
    'Classical',
    'Country',
    'Metal',
    'Indie',
    'R&B',
    'Funk',
    'Blues',
  ],
  mood: [
    'Energetic',
    'Chill',
    'Happy',
    'Sad',
    'Dark',
    'Uplifting',
    'Aggressive',
    'Dreamy',
    'Mysterious',
    'Romantic',
    'Epic',
    'Groovy',
  ],
  instruments: [
    'Guitar',
    'Piano',
    'Drums',
    'Bass',
    'Synth',
    'Strings',
    'Brass',
    'Vocals',
    'Saxophone',
    'Violin',
    'Flute',
    'Percussion',
  ],
};

// Example prompts for inspiration
const examplePrompts = [
  'A driving rock anthem with powerful guitars and drums',
  'Chill lo-fi hip hop beat for studying',
  'Epic orchestral piece building to a climactic finale',
  'Funky bass groove with jazzy piano chords',
  'Dark electronic track with heavy bass and glitchy effects',
];

type GenerationStatus = 'idle' | 'validating' | 'generating' | 'success' | 'error';

export default function CreatePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [customMood, setCustomMood] = useState('');
  const [duration, setDuration] = useState(15); // seconds (MusicGen supports 5-30s)
  const [tempo, setTempo] = useState(120); // BPM
  const [seed, setSeed] = useState('');
  const [keySignature, setKeySignature] = useState('Auto');

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedTrackId, setGeneratedTrackId] = useState<string | null>(null);
  const [generatedSongId, setGeneratedSongId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [estimatedCredits, setEstimatedCredits] = useState(10);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true); // Show tutorial by default for new users

  // Calculate estimated credits based on parameters
  useEffect(() => {
    let credits = 10; // Base cost
    if (duration > 60) credits += 5;
    if (duration > 120) credits += 10;
    if (selectedInstruments.length > 4) credits += 5;
    setEstimatedCredits(credits);
  }, [duration, selectedInstruments.length]);

  const validateInputs = useCallback(() => {
    if (!prompt.trim() && selectedGenres.length === 0 && selectedMoods.length === 0) {
      setError('Please provide a description or select at least one genre/mood');
      return false;
    }

    if (prompt.length > 500) {
      setError('Description must be less than 500 characters');
      return false;
    }

    if (duration < 5 || duration > 30) {
      setError('Duration must be between 5 and 30 seconds');
      return false;
    }

    if (tempo < 60 || tempo > 200) {
      setError('Tempo must be between 60 and 200 BPM');
      return false;
    }

    setError(null);
    return true;
  }, [prompt, selectedGenres, selectedMoods, duration, tempo]);

  const handleGenerate = async () => {
    if (!validateInputs()) return;
    if (!session?.user?.id) {
      setError('Please sign in to generate tracks');
      router.push('/auth');
      return;
    }

    setStatus('generating');
    setProgress(0);
    setError(null);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          return prev + 10;
        });
      }, 2000);

      const response = await fetch('/api/tracks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || undefined, // Only send if not empty (API requires min 1 char)
          genres: selectedGenres,
          moods: selectedMoods,
          instruments: selectedInstruments,
          duration,
          tempo,
          seed: seed ? parseInt(seed, 10) : undefined,
          keySignature: keySignature !== 'Auto' ? keySignature : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate track');
      }

      setProgress(100);
      setStatus('success');

      // Handle both demo mode and production mode responses
      if (data.mode === 'demo') {
        setGeneratedTrackId(data.song?.id || data.trackId);
        setGeneratedSongId(data.songId || data.song?.id);
        // Store demo mode flag for UI
        (window as any).__rnrbDemoMode = true;
      } else {
        setGeneratedTrackId(data.song?.id || data.trackId);
        setGeneratedSongId(data.songId || data.song?.id);
        (window as any).__rnrbDemoMode = false;
      }

      setShowProjectSelector(true); // Show project selector after success

      // Don't auto-redirect - let user add to project first
      // setTimeout(() => {
      //   if (data.trackId) {
      //     router.push(`/tracks/${data.trackId}`);
      //   }
      // }, 2000);
    } catch (err: any) {
      console.error('Generation error:', err);
      setStatus('error');
      setError(err.message || 'Failed to generate track. Please try again.');
      setProgress(0);
    } finally {
      // Always clear the interval to prevent memory leaks
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  const toggleChip = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void,
    maxSelections = 999
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      if (selected.length < maxSelections) {
        setSelected([...selected, value]);
      }
    }
  };

  const canGenerate =
    (prompt.trim() || selectedGenres.length > 0 || selectedMoods.length > 0) &&
    status !== 'generating' &&
    status !== 'success';

  const isDisabled = status === 'generating' || status === 'success';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header Section */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* White RR Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex flex-col items-center"
          >
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Accent bar */}
            <div className="mb-4 h-1 w-12 rounded-full" style={{ background: 'var(--accent)' }} />
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: 'var(--panel)' }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                    AI Music Sketches • BETA
                  </p>
                  <h1 className="text-2xl font-bold text-white">Generate Quick Ideas</h1>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5"
                style={{ color: 'var(--muted)' }}
              >
                <HelpCircle className="h-4 w-4" />
                {showTutorial ? 'Hide Guide' : 'Show Guide'}
              </button>
            </div>
            <p style={{ color: 'var(--muted)' }}>
              Generate 5-30 second clips for inspiration, loops, and getting unstuck
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tutorial/Onboarding Section */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b"
            style={{
              borderColor: 'var(--border)',
              background: 'linear-gradient(to bottom, rgba(249, 115, 22, 0.05), transparent)',
            }}
          >
            <div className="mx-auto max-w-6xl px-4 py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <Info className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    How It Works
                  </h2>

                  {/* What This Is */}
                  <div
                    className="mb-4 rounded-xl p-4"
                    style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="mb-3 font-medium text-white">Best For:</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-orange-500/20 p-2">
                          <Sparkles className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Inspiration</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            Get unstuck with a quick idea
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-500/20 p-2">
                          <RefreshCw className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Loops & Sketches</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            5-30 second clips to build on
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-500/20 p-2">
                          <Music2 className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Temp Tracks</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            Placeholder while writing
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-purple-500/20 p-2">
                          <Zap className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Experimenting</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            Try different genre combos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Honest Limitations */}
                  <div
                    className="mb-6 rounded-xl p-3"
                    style={{
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                    }}
                  >
                    <p className="text-sm" style={{ color: 'rgb(251, 191, 36)' }}>
                      <strong>Heads up:</strong> This generates short AI clips (max 30 sec) — great
                      for sparking ideas, not for finished songs. Think of it as a creative starting
                      point.
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="mb-6">
                    <h3 className="mb-3 font-medium text-white">Steps:</h3>
                    <div className="grid gap-2 sm:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                          1
                        </span>
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>
                          Describe or select style
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                          2
                        </span>
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>
                          Choose duration & tempo
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                          3
                        </span>
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>
                          Click "Generate Track"
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                          4
                        </span>
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>
                          Listen & add to project
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Credit Info */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(249, 115, 22, 0.1)',
                      border: '1px solid rgba(249, 115, 22, 0.2)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Coins className="mt-0.5 h-5 w-5 text-orange-400" />
                      <div>
                        <h3 className="font-medium text-white">Credit System</h3>
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                          Each track costs <strong className="text-orange-400">10 credits</strong>.
                          Credits reset monthly based on your plan:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          <span>
                            <span className="text-gray-400">Free:</span>{' '}
                            <span className="text-white">10/month</span>
                          </span>
                          <span>
                            <span className="text-gray-400">Creator ($17.99):</span>{' '}
                            <span className="text-white">100/month</span>
                          </span>
                          <span>
                            <span className="text-gray-400">Studio ($29.99):</span>{' '}
                            <span className="text-white">500/month</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowTutorial(false)}
                  className="rounded-lg p-2 transition hover:bg-white/10"
                  style={{ color: 'var(--muted)' }}
                  title="Close guide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Main Content Card */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-sm font-medium">
                Describe your track
                <span className="ml-2 text-xs text-[color:var(--muted)]">
                  ({prompt.length}/500 characters)
                </span>
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., A driving rock anthem with powerful electric guitars and thunderous drums..."
                  className="w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                  maxLength={500}
                  disabled={isDisabled}
                />
                <button
                  onClick={() =>
                    setPrompt(examplePrompts[Math.floor(Math.random() * examplePrompts.length)])
                  }
                  className="hover:bg-[color:var(--surface)]/50 absolute bottom-3 right-3 rounded-lg p-2 text-[color:var(--muted)] transition hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Get random prompt"
                  disabled={isDisabled}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Example prompts */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-[color:var(--muted)]">Try:</span>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.slice(0, 3).map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="hover:bg-[color:var(--surface)]/80 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-xs transition-all hover:border-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isDisabled}
                    >
                      {example.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style Chips */}
            <div className="space-y-6">
              {/* Genre */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Genre
                  {selectedGenres.length > 0 && (
                    <span className="ml-2 text-xs text-[color:var(--muted)]">
                      ({selectedGenres.length} selected, max 3)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.genre.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleChip(genre, selectedGenres, setSelectedGenres, 3)}
                      className={`rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedGenres.includes(genre)
                          ? 'text-[color:var(--accent)]-foreground bg-[color:var(--accent)]'
                          : 'border border-[color:var(--border)] bg-[color:var(--surface)] hover:border-brand-primary/50'
                      }`}
                      disabled={isDisabled}
                    >
                      {genre}
                    </button>
                  ))}
                  {/* Custom genres that were added */}
                  {selectedGenres
                    .filter((g) => !styleOptions.genre.includes(g))
                    .map((customG) => (
                      <button
                        key={customG}
                        onClick={() => toggleChip(customG, selectedGenres, setSelectedGenres, 3)}
                        className="text-[color:var(--accent)]-foreground rounded-xl bg-[color:var(--accent)] px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isDisabled}
                      >
                        {customG} ×
                      </button>
                    ))}
                </div>
                {/* Custom genre input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="Add custom genre..."
                    className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--text)] transition focus:border-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDisabled || selectedGenres.length >= 3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customGenre.trim() && selectedGenres.length < 3) {
                        e.preventDefault();
                        if (!selectedGenres.includes(customGenre.trim())) {
                          setSelectedGenres([...selectedGenres, customGenre.trim()]);
                        }
                        setCustomGenre('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        customGenre.trim() &&
                        selectedGenres.length < 3 &&
                        !selectedGenres.includes(customGenre.trim())
                      ) {
                        setSelectedGenres([...selectedGenres, customGenre.trim()]);
                        setCustomGenre('');
                      }
                    }}
                    className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm transition hover:border-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDisabled || !customGenre.trim() || selectedGenres.length >= 3}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Mood
                  {selectedMoods.length > 0 && (
                    <span className="ml-2 text-xs text-[color:var(--muted)]">
                      ({selectedMoods.length} selected, max 3)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.mood.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => toggleChip(mood, selectedMoods, setSelectedMoods, 3)}
                      className={`rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedMoods.includes(mood)
                          ? 'text-[color:var(--accent)]-foreground bg-[color:var(--accent)]'
                          : 'border border-[color:var(--border)] bg-[color:var(--surface)] hover:border-brand-primary/50'
                      }`}
                      disabled={isDisabled}
                    >
                      {mood}
                    </button>
                  ))}
                  {/* Custom moods that were added */}
                  {selectedMoods
                    .filter((m) => !styleOptions.mood.includes(m))
                    .map((customM) => (
                      <button
                        key={customM}
                        onClick={() => toggleChip(customM, selectedMoods, setSelectedMoods, 3)}
                        className="text-[color:var(--accent)]-foreground rounded-xl bg-[color:var(--accent)] px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isDisabled}
                      >
                        {customM} ×
                      </button>
                    ))}
                </div>
                {/* Custom mood input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customMood}
                    onChange={(e) => setCustomMood(e.target.value)}
                    placeholder="Add custom mood..."
                    className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--text)] transition focus:border-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDisabled || selectedMoods.length >= 3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customMood.trim() && selectedMoods.length < 3) {
                        e.preventDefault();
                        if (!selectedMoods.includes(customMood.trim())) {
                          setSelectedMoods([...selectedMoods, customMood.trim()]);
                        }
                        setCustomMood('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        customMood.trim() &&
                        selectedMoods.length < 3 &&
                        !selectedMoods.includes(customMood.trim())
                      ) {
                        setSelectedMoods([...selectedMoods, customMood.trim()]);
                        setCustomMood('');
                      }
                    }}
                    className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm transition hover:border-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDisabled || !customMood.trim() || selectedMoods.length >= 3}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Instruments */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Instruments
                  {selectedInstruments.length > 0 && (
                    <span className="ml-2 text-xs text-[color:var(--muted)]">
                      ({selectedInstruments.length} selected)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.instruments.map((instrument) => (
                    <button
                      key={instrument}
                      onClick={() =>
                        toggleChip(instrument, selectedInstruments, setSelectedInstruments, 6)
                      }
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedInstruments.includes(instrument)
                          ? 'text-[color:var(--accent)]-foreground bg-[color:var(--accent)]'
                          : 'border border-[color:var(--border)] bg-[color:var(--surface)] hover:border-brand-primary/50'
                      }`}
                      disabled={isDisabled}
                    >
                      <Mic2 className="h-3 w-3" />
                      {instrument}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration & Parameters */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration: {duration} seconds
                  </span>
                  <span className="mt-1 block text-xs font-normal text-[color:var(--muted)]">
                    AI generates 5-30 second clips
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1 accent-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDisabled}
                  />
                  <span className="w-16 text-right text-sm font-medium text-gray-400">
                    {duration}s
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-3 block flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Tempo: {tempo} BPM
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="10"
                    value={tempo}
                    onChange={(e) => setTempo(parseInt(e.target.value))}
                    className="flex-1 accent-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDisabled}
                  />
                  <span className="w-16 text-right text-sm font-medium text-gray-400">
                    {tempo >= 180 ? 'Fast' : tempo >= 120 ? 'Medium' : 'Slow'}
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDisabled}
              >
                <Sliders className="h-4 w-4" />
                Advanced Options
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[color:var(--surface)]/50 mt-4 rounded-xl border border-[color:var(--border)] p-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block flex items-center gap-2 text-sm font-medium">
                            <Hash className="h-4 w-4" />
                            Seed (optional)
                          </label>
                          <input
                            type="text"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            placeholder="Enter seed for consistent results"
                            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-[color:var(--text)] transition focus:border-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isDisabled}
                          />
                          <p className="mt-1 text-xs text-[color:var(--muted)]">
                            Same seed = same output
                          </p>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Key Signature</label>
                          <select
                            value={keySignature}
                            onChange={(e) => setKeySignature(e.target.value)}
                            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-[color:var(--text)] transition focus:border-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isDisabled}
                          >
                            <option>Auto</option>
                            <option>C Major</option>
                            <option>G Major</option>
                            <option>D Major</option>
                            <option>A Major</option>
                            <option>E Major</option>
                            <option>A Minor</option>
                            <option>E Minor</option>
                            <option>D Minor</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col gap-4 border-t border-[color:var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                  <Info className="h-4 w-4" />
                  <span>Generation uses {estimatedCredits} credits</span>
                </div>
                {status === 'generating' && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-700">
                      <motion.div
                        className="h-full bg-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{progress}%</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="rnrb-button-primary flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'generating' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Success!
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Track
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {status === 'generating' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <Card className="rnrb-card p-12 text-center">
                <Music2 className="rnrb-pulse mx-auto mb-4 h-16 w-16 text-[color:var(--accent)]" />
                <h3 className="mb-2 text-xl font-semibold">Creating your track...</h3>
                <p className="mb-4 text-[color:var(--muted)]">This usually takes 20-30 seconds</p>
                <div className="mx-auto max-w-md space-y-2 text-sm text-[color:var(--muted)]">
                  {progress >= 0 && progress < 30 && (
                    <p className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing your inputs...
                    </p>
                  )}
                  {progress >= 30 && progress < 60 && (
                    <p className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating musical structure...
                    </p>
                  )}
                  {progress >= 60 && progress < 90 && (
                    <p className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding instruments and mixing...
                    </p>
                  )}
                  {progress >= 90 && (
                    <p className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finalizing your track...
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8"
            >
              <Card className="rnrb-card border-green-500/20 bg-green-500/5 p-12 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h3 className="mb-2 text-xl font-semibold text-green-400">Track Generated!</h3>
                <p className="mb-4 text-[color:var(--muted)]">
                  Your AI-generated track is ready. Add it to a project or view it now.
                </p>

                {/* Demo Mode Notice */}
                {(window as any).__rnrbDemoMode && (
                  <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-left">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-yellow-400">Demo Mode Active</p>
                        <p className="mt-1 text-xs text-yellow-400/80">
                          A placeholder track has been created. For real AI-generated music,
                          configure REPLICATE_API_TOKEN in your environment. Demo tracks show how
                          the workflow works without using AI credits.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Preview */}
                <div className="mb-6 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-center gap-4">
                    <Volume2 className="h-5 w-5 text-[color:var(--muted)]" />
                    <span className="text-sm text-[color:var(--muted)]">
                      Your track:{' '}
                      <span className="font-medium text-white">
                        {selectedMoods[0] || 'AI'} {selectedGenres[0] || ''} Track
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {generatedSongId && (
                    <ProjectSelector
                      songId={generatedSongId}
                      onProjectAdded={(slug) => {
                        console.log('Added to project:', slug);
                      }}
                      className="w-full sm:w-auto"
                    />
                  )}

                  <button
                    onClick={() => generatedSongId && router.push(`/library`)}
                    className="rnrb-button-primary w-full rounded-xl px-6 py-3 sm:w-auto"
                  >
                    View in Library
                  </button>

                  <button
                    onClick={() => {
                      setStatus('idle');
                      setGeneratedTrackId(null);
                      setGeneratedSongId(null);
                      setShowProjectSelector(false);
                      setPrompt('');
                      setSelectedGenres([]);
                      setSelectedMoods([]);
                      setSelectedInstruments([]);
                      (window as any).__rnrbDemoMode = false;
                    }}
                    className="rnrb-button-secondary w-full rounded-xl px-6 py-3 sm:w-auto"
                  >
                    Generate Another
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {status === 'error' && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <Card className="rnrb-card border-red-500/20 bg-red-500/5 p-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                <h3 className="mb-2 text-xl font-semibold text-red-400">Generation Failed</h3>
                <p className="mb-4 text-[color:var(--muted)]">{error}</p>
                <button
                  onClick={() => {
                    setStatus('idle');
                    setError(null);
                  }}
                  className="rnrb-button-secondary rounded-xl px-6 py-2 text-sm font-semibold"
                >
                  Try Again
                </button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
