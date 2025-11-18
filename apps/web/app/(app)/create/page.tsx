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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-brand-primary" />
          Create New Track
        </h1>
        <p className="text-foreground-muted">
          Describe your music idea or use the style options below to generate AI music
        </p>
      </div>
      
      {/* Main Prompt Area */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your track
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A driving rock anthem with powerful electric guitars and thunderous drums..."
              className="
                prompt-input w-full resize-none
                pr-12 focus:ring-2 focus:ring-brand-primary/30
              "
              rows={3}
              disabled={isGenerating}
            />
            <button
              onClick={() => setPrompt(examplePrompts[Math.floor(Math.random() * examplePrompts.length)])}
              className="
                absolute bottom-3 right-3 
                btn-ghost p-2 text-foreground-muted
                hover:text-foreground
              "
              title="Get random prompt"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Example prompts */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-foreground-muted">Try:</span>
            <div className="flex gap-2 flex-wrap">
              {examplePrompts.slice(0, 3).map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="
                    text-xs px-2 py-1 rounded-md
                    bg-surface border border-border
                    hover:bg-surface-hover hover:border-border-strong
                    transition-all duration-200
                  "
                >
                  {example.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Style Chips */}
        <div className="space-y-4">
          {/* Genre */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Genre
            </label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.genre.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleChip(genre, selectedGenres, setSelectedGenres)}
                  className={`
                    chip
                    ${selectedGenres.includes(genre) ? 'active' : ''}
                  `}
                  disabled={isGenerating}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.mood.map((mood) => (
                <button
                  key={mood}
                  onClick={() => toggleChip(mood, selectedMoods, setSelectedMoods)}
                  className={`
                    chip
                    ${selectedMoods.includes(mood) ? 'active' : ''}
                  `}
                  disabled={isGenerating}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
          
          {/* Instruments */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Instruments
            </label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.instruments.map((instrument) => (
                <button
                  key={instrument}
                  onClick={() => toggleChip(instrument, selectedInstruments, setSelectedInstruments)}
                  className={`
                    chip
                    ${selectedInstruments.includes(instrument) ? 'active' : ''}
                  `}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Duration
            </label>
            <div className="flex items-center gap-3">
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
            <label className="block text-sm font-medium mb-2">
              <Zap className="w-4 h-4 inline mr-1" />
              Tempo (BPM)
            </label>
            <div className="flex items-center gap-3">
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
            className="
              flex items-center gap-2 text-sm font-medium
              text-foreground-muted hover:text-foreground
              transition-colors duration-200
            "
          >
            <Sliders className="w-4 h-4" />
            Advanced Options
            <ChevronDown className={`
              w-4 h-4 transition-transform duration-200
              ${showAdvanced ? 'rotate-180' : ''}
            `} />
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
                <div className="mt-4 p-4 bg-surface rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Hash className="w-4 h-4 inline mr-1" />
                        Seed (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter seed for consistent results"
                        className="input w-full"
                        disabled={isGenerating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Key Signature
                      </label>
                      <select className="input w-full" disabled={isGenerating}>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Info className="w-4 h-4" />
            <span>Generation uses 10 credits</span>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={`
              btn-primary px-8 py-3 text-base font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isGenerating ? 'cursor-wait' : ''}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Track
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Results would appear here */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-8 bg-surface rounded-lg border border-border text-center"
        >
          <Music2 className="w-16 h-16 mx-auto mb-4 text-brand-primary animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Creating your track...</h3>
          <p className="text-foreground-muted">
            This usually takes 20-30 seconds
          </p>
        </motion.div>
      )}
    </div>
  );
}
