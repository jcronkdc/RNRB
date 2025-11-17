'use client';

import { useState } from 'react';
import { Music2, Sparkles, TrendingUp, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHORD_PROGRESSIONS, getChordSubstitutions, getProgressionsByFilter, progressionToKey } from '@/lib/chord-progressions';

/**
 * Chord Explorer & Progression Library
 * Click any chord → See alternatives
 * Browse progressions by genre/mood
 * Try new chords beyond the same 4
 */

interface ChordExplorerProps {
  currentChord?: string;
  songKey?: string;
  onSelectChord: (chord: string) => void;
}

export default function ChordExplorer({ currentChord, songKey = 'C', onSelectChord }: ChordExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pop-rock' | 'blues' | 'jazz' | 'country'>('all');
  const [activeMood, setActiveMood] = useState<'all' | 'happy' | 'sad' | 'dark' | 'sophisticated'>('all');
  const [showSubstitutions, setShowSubstitutions] = useState(false);

  const substitutions = currentChord ? getChordSubstitutions(currentChord) : [];
  const filteredProgressions = getProgressionsByFilter({
    genre: activeFilter !== 'all' ? activeFilter : undefined,
    mood: activeMood !== 'all' ? activeMood : undefined,
  });

  return (
    <div className="space-y-6">
      
      {/* Chord Substitutions (if chord selected) */}
      {currentChord && (
        <div className="rnrb-card p-6 bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              Alternatives for "{currentChord}"
            </h3>
            <button
              onClick={() => setShowSubstitutions(!showSubstitutions)}
              className="text-xs text-brand-primary hover:underline"
            >
              {showSubstitutions ? 'Hide' : 'Show All'}
            </button>
          </div>

          {showSubstitutions && substitutions.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {substitutions.map((sub) => (
                <button
                  key={sub.chord}
                  onClick={() => onSelectChord(sub.chord)}
                  className="p-3 bg-surface hover:bg-surface-muted border border-border hover:border-brand-primary rounded-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-bold text-brand-primary group-hover:text-brand-primary text-lg">
                      {sub.chord}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-brand-primary/10 rounded">
                      {sub.vibe}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sub.description}
                  </p>
                </button>
              ))}
            </div>
          )}

          {substitutions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No substitutions available for this chord
            </p>
          )}
        </div>
      )}

      {/* Progression Library */}
      <div className="rnrb-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Music2 className="w-5 h-5 text-brand-primary" />
          Chord Progression Library
        </h3>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">
              GENRE
            </p>
            <div className="flex flex-wrap gap-2">
              {['all', 'pop-rock', 'blues', 'jazz', 'country'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => setActiveFilter(genre as any)}
                  className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                    activeFilter === genre
                      ? 'bg-brand-primary text-brand-primary-foreground'
                      : 'bg-surface hover:bg-surface-muted border border-border'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">
              MOOD
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', icon: null, label: 'All' },
                { value: 'happy', icon: <Heart className="w-3 h-3" />, label: 'Happy' },
                { value: 'sad', icon: <TrendingUp className="w-3 h-3 rotate-180" />, label: 'Sad' },
                { value: 'dark', icon: <Zap className="w-3 h-3" />, label: 'Dark' },
              ].map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setActiveMood(mood.value as any)}
                  className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1 ${
                    activeMood === mood.value
                      ? 'bg-brand-primary text-brand-primary-foreground'
                      : 'bg-surface hover:bg-surface-muted border border-border'
                  }`}
                >
                  {mood.icon}
                  {mood.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progressions List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredProgressions.map((category) => (
            <div key={category.name}>
              <h4 className="font-semibold text-sm mb-2">{category.name}</h4>
              <div className="space-y-2">
                {category.progressions.map((prog) => {
                  const chordsInKey = progressionToKey(prog.romanNumerals, songKey);
                  
                  return (
                    <div
                      key={prog.name}
                      className="p-3 bg-surface border border-border rounded-lg hover:border-brand-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{prog.name}</p>
                          <p className="text-xs text-muted-foreground">{prog.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {chordsInKey.map((chord, idx) => (
                          <button
                            key={idx}
                            onClick={() => onSelectChord(chord)}
                            className="px-3 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded font-bold text-brand-primary text-sm transition-colors"
                          >
                            {chord}
                          </button>
                        ))}
                      </div>

                      {prog.examples.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Used in: {prog.examples.join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-muted/20 rounded-lg text-xs text-muted-foreground">
        <p className="font-semibold mb-2">How to Use:</p>
        <ul className="space-y-1">
          <li>• Click any chord in progression → Adds to your song</li>
          <li>• Try substitutions to change the vibe</li>
          <li>• Filter by genre/mood for inspiration</li>
          <li>• All progressions shown in your song's key ({songKey})</li>
        </ul>
      </div>
    </div>
  );
}
