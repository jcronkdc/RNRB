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
  Loader2
} from 'lucide-react';

// Style chips for genre/mood/tempo
const styleOptions = {
  genre: [
    'Rock', 'Pop', 'Electronic', 'Hip Hop', 'Jazz', 'Classical', 
    'Country', 'Metal', 'Indie', 'R&B', 'Funk', 'Blues'
  ],
  mood: [
    'Energetic', 'Chill', 'Happy', 'Sad', 'Dark', 'Uplifting',
    'Aggressive', 'Dreamy', 'Mysterious', 'Romantic', 'Epic', 'Groovy'
  ],
  instruments: [
    'Guitar', 'Piano', 'Drums', 'Bass', 'Synth', 'Strings',
    'Brass', 'Vocals', 'Saxophone', 'Violin', 'Flute', 'Percussion'
  ]
};

// Example prompts for inspiration
const examplePrompts = [
  "A driving rock anthem with powerful guitars and drums",
  "Chill lo-fi hip hop beat for studying",
  "Epic orchestral piece building to a climactic finale",
  "Funky bass groove with jazzy piano chords",
  "Dark electronic track with heavy bass and glitchy effects"
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
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };
  
  const canGenerate = prompt.trim() || selectedGenres.length > 0 || selectedMoods.length > 0;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-7xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Music Generation</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Create New Track</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Describe your music idea or use the style options below to generate AI music
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-6xl py-12 px-4">

      {/* Main Content Card */}
      <div className="rnrb-card p-8">
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-3">
              Describe your track
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A driving rock anthem with powerful electric guitars and thunderous drums..."
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition resize-none"
                rows={4}
                disabled={isGenerating}
              />
              <button
                onClick={() => setPrompt(examplePrompts[Math.floor(Math.random() * examplePrompts.length)])}
                className="absolute bottom-3 right-3 p-2 text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-surface/50"
                title="Get random prompt"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Example prompts */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Try:</span>
              <div className="flex gap-2 flex-wrap">
                {examplePrompts.slice(0, 3).map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface/80 hover:border-brand-primary/50 transition-all"
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
              <label className="block text-sm font-medium mb-3">
                Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {styleOptions.genre.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleChip(genre, selectedGenres, setSelectedGenres)}
                    className={`px-4 py-2 rounded-xl font-medium transition ${
                      selectedGenres.includes(genre)
                        ? 'bg-brand-primary text-brand-primary-foreground'
                        : 'bg-surface border border-border hover:border-brand-primary/50'
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
              <label className="block text-sm font-medium mb-3">
                Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {styleOptions.mood.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => toggleChip(mood, selectedMoods, setSelectedMoods)}
                    className={`px-4 py-2 rounded-xl font-medium transition ${
                      selectedMoods.includes(mood)
                        ? 'bg-brand-primary text-brand-primary-foreground'
                        : 'bg-surface border border-border hover:border-brand-primary/50'
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
              <label className="block text-sm font-medium mb-3">
                Instruments
              </label>
              <div className="flex flex-wrap gap-2">
                {styleOptions.instruments.map((instrument) => (
                  <button
                    key={instrument}
                    onClick={() => toggleChip(instrument, selectedInstruments, setSelectedInstruments)}
                    className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                      selectedInstruments.includes(instrument)
                        ? 'bg-brand-primary text-brand-primary-foreground'
                        : 'bg-surface border border-border hover:border-brand-primary/50'
                    }`}
                    disabled={isGenerating}
                  >
                    <Mic2 className="w-3 h-3" />
                    {instrument}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Duration & Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
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
                <span className="text-sm font-medium w-16 text-right">
                  {duration}s
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
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
                <span className="text-sm font-medium w-16 text-right">
                  {tempo}
                </span>
              </div>
            </div>
          </div>
          
          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Sliders className="w-4 h-4" />
              Advanced Options
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
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
                  <div className="mt-4 p-6 bg-surface/50 rounded-xl border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Seed (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter seed for consistent results"
                          className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none transition"
                          disabled={isGenerating}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Key Signature
                        </label>
                        <select 
                          className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none transition"
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
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Generation uses 10 credits</span>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="rnrb-button-primary px-8 py-3 rounded-xl text-base font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
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
          <Card className="p-12 text-center rnrb-card">
            <Music2 className="w-16 h-16 mx-auto mb-4 text-brand-primary rnrb-pulse" />
            <h3 className="text-xl font-semibold mb-2">Creating your track...</h3>
            <p className="text-muted-foreground">
              This usually takes 20-30 seconds
            </p>
          </Card>
        </motion.div>
      )}
      </div>
    </div>
  );
}
