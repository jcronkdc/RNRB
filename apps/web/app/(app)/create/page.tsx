'use client';

import { useState } from 'react';
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
} from 'lucide-react';

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

export default function CreatePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [duration, setDuration] = useState(30); // seconds
  const [tempo, setTempo] = useState(120); // BPM
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() && selectedGenres.length === 0 && selectedMoods.length === 0) {
      return;
    }

    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      // Would navigate to results or show inline
    }, 3000);
  };

  const toggleChip = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const canGenerate = prompt.trim() || selectedGenres.length > 0 || selectedMoods.length > 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - BADASS Orange Gradient */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/3 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                <Sparkles className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">AI Music Generation</p>
                <h1 className="text-3xl font-bold text-white md:text-4xl">Create New Track</h1>
              </div>
            </div>
            <p className="max-w-2xl text-lg text-gray-300">
              Describe your music idea or use the style options below to generate AI music
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Main Content Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-sm font-medium">Describe your track</label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., A driving rock anthem with powerful electric guitars and thunderous drums..."
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                  rows={4}
                  disabled={isGenerating}
                />
                <button
                  onClick={() =>
                    setPrompt(examplePrompts[Math.floor(Math.random() * examplePrompts.length)])
                  }
                  className="absolute bottom-3 right-3 rounded-lg p-2 text-muted-foreground transition hover:bg-surface/50 hover:text-foreground"
                  title="Get random prompt"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* Example prompts */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.slice(0, 3).map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs transition-all hover:border-brand-primary/50 hover:bg-surface/80"
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
                <label className="mb-3 block text-sm font-medium">Genre</label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.genre.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleChip(genre, selectedGenres, setSelectedGenres)}
                      className={`rounded-xl px-4 py-2 font-medium transition ${
                        selectedGenres.includes(genre)
                          ? 'bg-brand-primary text-brand-primary-foreground'
                          : 'border border-border bg-surface hover:border-brand-primary/50'
                      }`}
                      disabled={isGenerating}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="mb-3 block text-sm font-medium">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.mood.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => toggleChip(mood, selectedMoods, setSelectedMoods)}
                      className={`rounded-xl px-4 py-2 font-medium transition ${
                        selectedMoods.includes(mood)
                          ? 'bg-brand-primary text-brand-primary-foreground'
                          : 'border border-border bg-surface hover:border-brand-primary/50'
                      }`}
                      disabled={isGenerating}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instruments */}
              <div>
                <label className="mb-3 block text-sm font-medium">Instruments</label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.instruments.map((instrument) => (
                    <button
                      key={instrument}
                      onClick={() =>
                        toggleChip(instrument, selectedInstruments, setSelectedInstruments)
                      }
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition ${
                        selectedInstruments.includes(instrument)
                          ? 'bg-brand-primary text-brand-primary-foreground'
                          : 'border border-border bg-surface hover:border-brand-primary/50'
                      }`}
                      disabled={isGenerating}
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
                <label className="mb-3 block flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Duration
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1"
                    disabled={isGenerating}
                  />
                  <span className="w-16 text-right text-sm font-medium">{duration}s</span>
                </div>
              </div>

              <div>
                <label className="mb-3 block flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Tempo (BPM)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="10"
                    value={tempo}
                    onChange={(e) => setTempo(parseInt(e.target.value))}
                    className="flex-1"
                    disabled={isGenerating}
                  />
                  <span className="w-16 text-right text-sm font-medium">{tempo}</span>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                    <div className="mt-4 rounded-xl border border-border bg-surface/50 p-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block flex items-center gap-2 text-sm font-medium">
                            <Hash className="h-4 w-4" />
                            Seed (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Enter seed for consistent results"
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground transition focus:border-brand-primary focus:outline-none"
                            disabled={isGenerating}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Key Signature</label>
                          <select
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground transition focus:border-brand-primary focus:outline-none"
                            disabled={isGenerating}
                          >
                            <option>Auto</option>
                            <option>C Major</option>
                            <option>G Major</option>
                            <option>D Major</option>
                            <option>A Minor</option>
                            <option>E Minor</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Generation uses 10 credits</span>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
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

        {/* Results would appear here */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="rnrb-card p-12 text-center">
              <Music2 className="rnrb-pulse mx-auto mb-4 h-16 w-16 text-brand-primary" />
              <h3 className="mb-2 text-xl font-semibold">Creating your track...</h3>
              <p className="text-muted-foreground">This usually takes 20-30 seconds</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
