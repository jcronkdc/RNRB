'use client';

import { useState, useEffect } from 'react';
import { Book, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Rhyme Dictionary
 * Click any word → See rhyming words
 * Filter by syllable count
 * Click rhyme to replace
 */

interface RhymeResult {
  word: string;
  score: number;
  syllables: number | null;
}

interface RhymeDictionaryProps {
  selectedWord: string | null;
  onSelectRhyme: (word: string) => void;
}

export default function RhymeDictionary({ selectedWord, onSelectRhyme }: RhymeDictionaryProps) {
  const [rhymes, setRhymes] = useState<RhymeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [syllableFilter, setSyllableFilter] = useState<number | 'all'>('all');

  // Fetch rhymes when word changes
  useEffect(() => {
    if (!selectedWord) {
      setRhymes([]);
      return;
    }

    const fetchRhymes = async () => {
      setLoading(true);
      try {
        const url = `/api/rhymes?word=${encodeURIComponent(selectedWord)}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to fetch rhymes');
        
        const data = await response.json();
        setRhymes(data.rhymes || []);
      } catch (error) {
        console.error('Rhyme fetch error:', error);
        setRhymes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRhymes();
  }, [selectedWord]);

  // Filter rhymes by syllable count
  const filteredRhymes = syllableFilter === 'all' 
    ? rhymes 
    : rhymes.filter(r => r.syllables === syllableFilter);

  // Group by syllable count
  const syllableCounts = [...new Set(rhymes.map(r => r.syllables).filter(s => s !== null))].sort((a, b) => (a || 0) - (b || 0));

  if (!selectedWord) {
    return (
      <div className="rnrb-card p-6">
        <div className="text-center py-8">
          <Book className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Rhyme Dictionary</p>
          <p className="text-xs text-muted-foreground">
            Click any word in your lyrics to find rhymes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rnrb-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-brand-primary" />
          <div>
            <h3 className="font-semibold">Rhymes for "{selectedWord}"</h3>
            <p className="text-xs text-muted-foreground">
              {filteredRhymes.length} found
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted-foreground text-sm"
          >
            Finding rhymes...
          </motion.div>
        </div>
      ) : (
        <>
          {/* Syllable Filter */}
          {syllableCounts.length > 1 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                SYLLABLES
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSyllableFilter('all')}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase transition-all ${
                    syllableFilter === 'all'
                      ? 'bg-brand-primary text-brand-primary-foreground'
                      : 'bg-surface border border-border hover:border-brand-primary'
                  }`}
                >
                  ALL
                </button>
                {syllableCounts.map(count => (
                  <button
                    key={count}
                    onClick={() => setSyllableFilter(count as number)}
                    className={`px-3 py-1 rounded text-xs font-mono uppercase transition-all ${
                      syllableFilter === count
                        ? 'bg-brand-primary text-brand-primary-foreground'
                        : 'bg-surface border border-border hover:border-brand-primary'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rhymes List */}
          <div className="max-h-96 overflow-y-auto space-y-1">
            <AnimatePresence>
              {filteredRhymes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No rhymes found
                </p>
              ) : (
                filteredRhymes.slice(0, 50).map((rhyme, index) => (
                  <motion.button
                    key={rhyme.word}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onSelectRhyme(rhyme.word)}
                    className="w-full px-3 py-2 bg-surface hover:bg-surface-muted border border-border hover:border-brand-primary rounded transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rhyme.word}</span>
                      {rhyme.syllables && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {rhyme.syllables} syl
                        </span>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <TrendingUp className="w-4 h-4 text-brand-primary" style={{ 
                        transform: `rotate(${(rhyme.score / 1000) * 45}deg)` 
                      }} />
                    </div>
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 p-3 bg-muted/20 rounded text-xs text-muted-foreground">
            <p><strong>Tip:</strong> Words at the top are more common. Click any word to replace "{selectedWord}"</p>
          </div>
        </>
      )}
    </div>
  );
}
