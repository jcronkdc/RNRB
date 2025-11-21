'use client';

import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react';
import { Music, X, Plus, Info } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';

export type ChordPlacement = {
  wordIndex: number;
  lineIndex: number;
  chord: string;
};

interface GranularChordEditorProps {
  content: string;
  chordPlacements?: ChordPlacement[];
  onContentChange: (content: string) => void;
  onChordsChange: (chordPlacements: ChordPlacement[]) => void;
  blockType: 'verse' | 'chorus' | 'bridge';
}

const COMMON_CHORDS = [
  'A', 'Am', 'A7', 'A#', 'Am7',
  'B', 'Bm', 'B7', 'Bb', 'Bm7',
  'C', 'Cm', 'C7', 'C#', 'Cm7',
  'D', 'Dm', 'D7', 'D#', 'Dm7',
  'E', 'Em', 'E7', 'Eb', 'Em7',
  'F', 'Fm', 'F7', 'F#', 'Fm7',
  'G', 'Gm', 'G7', 'G#', 'Gm7',
];

export const GranularChordEditor = memo(function GranularChordEditor({
  content,
  chordPlacements = [],
  onContentChange,
  onChordsChange,
  blockType,
}: GranularChordEditorProps) {
  const [selectedWord, setSelectedWord] = useState<{ lineIndex: number; wordIndex: number } | null>(null);
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [customChord, setCustomChord] = useState('');
  const [showHint, setShowHint] = useState(true);
  const customInputRef = useRef<HTMLInputElement>(null);

  const lines = useMemo(() => content.split('\n'), [content]);

  // Auto-focus custom input when modal opens
  useEffect(() => {
    if (showChordPicker && customInputRef.current) {
      setTimeout(() => customInputRef.current?.focus(), 100);
    }
  }, [showChordPicker]);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showChordPicker) {
        setShowChordPicker(false);
        setSelectedWord(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showChordPicker]);

  const addChord = useCallback((chord: string) => {
    if (!selectedWord) return;

    const newPlacements = chordPlacements.filter(
      (p) => !(p.lineIndex === selectedWord.lineIndex && p.wordIndex === selectedWord.wordIndex)
    );

    newPlacements.push({
      lineIndex: selectedWord.lineIndex,
      wordIndex: selectedWord.wordIndex,
      chord,
    });

    onChordsChange(newPlacements);
    setShowChordPicker(false);
    setSelectedWord(null);
    setCustomChord('');
  }, [selectedWord, chordPlacements, onChordsChange]);

  const removeChord = useCallback((lineIndex: number, wordIndex: number) => {
    const newPlacements = chordPlacements.filter(
      (p) => !(p.lineIndex === lineIndex && p.wordIndex === wordIndex)
    );
    onChordsChange(newPlacements);
  }, [chordPlacements, onChordsChange]);

  const getChordForWord = useCallback((lineIndex: number, wordIndex: number) => {
    return chordPlacements.find(
      (p) => p.lineIndex === lineIndex && p.wordIndex === wordIndex
    )?.chord;
  }, [chordPlacements]);

  const handleWordClick = useCallback((lineIndex: number, wordIndex: number) => {
    const existingChord = getChordForWord(lineIndex, wordIndex);
    if (existingChord) {
      removeChord(lineIndex, wordIndex);
    } else {
      setSelectedWord({ lineIndex, wordIndex });
      setShowChordPicker(true);
      setShowHint(false); // Hide hint after first interaction
    }
  }, [getChordForWord, removeChord]);

  const addCustomChord = useCallback(() => {
    if (customChord.trim() && selectedWord) {
      addChord(customChord.trim());
    }
  }, [customChord, selectedWord, addChord]);

  return (
    <div className="space-y-4">
      {/* Helpful hint for first-time users */}
      <AnimatePresence>
        {showHint && chordPlacements.length === 0 && content.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-sm"
          >
            <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-brand-primary">💡 Pro Tip</p>
              <p className="text-muted-foreground text-xs mt-1">
                Click any word below to add a chord above it. Perfect for precise chord placement!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyrics with clickable words */}
      <div className="space-y-3 min-h-[60px]">
        {lines.length > 0 && lines.some(line => line.trim()) ? (
          lines.map((line, lineIndex) => {
            const words = line.split(/(\s+)/);
            return (
              <div key={lineIndex} className="flex flex-wrap gap-1 items-start">
                {words.map((word, wordIndex) => {
                  if (!word.trim()) return <span key={wordIndex}>{word}</span>;

                  const actualWordIndex = words.slice(0, wordIndex).filter(w => w.trim()).length;
                  const chord = getChordForWord(lineIndex, actualWordIndex);
                  const hasChord = !!chord;

                  return (
                    <div key={wordIndex} className="relative inline-flex flex-col items-center">
                      {/* Chord display with animation */}
                      <AnimatePresence>
                        {hasChord && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 5 }}
                            className="absolute -top-7 left-1/2 -translate-x-1/2 group/chord"
                          >
                            <div className="relative">
                              <div className="min-w-[32px] px-2 py-0.5 bg-green-500/20 border-2 border-green-500/50 rounded text-xs font-bold text-green-600 dark:text-green-400 flex items-center justify-center whitespace-nowrap shadow-sm">
                                {chord}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeChord(lineIndex, actualWordIndex);
                                }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover/chord:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-transform"
                                title="Remove chord (or click word)"
                                aria-label="Remove chord"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Clickable word with hover effect */}
                      <button
                        onClick={() => handleWordClick(lineIndex, actualWordIndex)}
                        className={`px-1 py-0.5 rounded transition-all ${
                          hasChord
                            ? 'bg-green-500/10 text-green-700 dark:text-green-300 font-medium hover:bg-green-500/20 hover:scale-105'
                            : 'hover:bg-brand-primary/10 text-foreground hover:scale-105'
                        }`}
                        title={hasChord ? `${chord} - Click to remove` : 'Click to add chord'}
                        aria-label={hasChord ? `Remove ${chord} chord` : 'Add chord'}
                      >
                        {word}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Type your lyrics below to get started...
          </div>
        )}
      </div>

      {/* Text editor for lyrics */}
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={`Write your ${blockType} lyrics...\n\nTip: Type your lyrics, then click any word above to add a chord!`}
        className="w-full px-4 py-3 bg-surface/50 border border-border/50 rounded-lg text-foreground text-sm resize-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
        rows={4}
        aria-label={`${blockType} lyrics editor`}
      />

      {/* Chord count indicator */}
      {chordPlacements.length > 0 && (
        <div className="text-xs text-muted-foreground text-right">
          {chordPlacements.length} {chordPlacements.length === 1 ? 'chord' : 'chords'} placed
        </div>
      )}

      {/* Chord Picker Modal with animations */}
      <AnimatePresence>
        {showChordPicker && selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowChordPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface border-2 border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Music className="w-5 h-5 text-brand-primary" />
                  Choose Chord
                </h3>
                <button
                  onClick={() => setShowChordPicker(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                  aria-label="Close chord picker"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Common Chords Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {COMMON_CHORDS.map((chord, index) => (
                  <motion.button
                    key={chord}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => addChord(chord)}
                    className="min-w-[48px] px-2 py-2 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/30 hover:border-green-500/60 hover:scale-105 rounded-lg text-sm font-bold text-green-600 dark:text-green-400 hover:shadow-lg transition-all"
                    aria-label={`Add ${chord} chord`}
                  >
                    {chord}
                  </motion.button>
                ))}
              </div>

              {/* Custom Chord Input */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Or enter a custom chord:
                </p>
                <div className="flex gap-2">
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customChord}
                    onChange={(e) => setCustomChord(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomChord()}
                    placeholder="e.g., Cmaj7, Dsus4, Fadd9"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    aria-label="Custom chord input"
                  />
                  <Button
                    onClick={addCustomChord}
                    disabled={!customChord.trim()}
                    size="sm"
                    className="px-4"
                    aria-label="Add custom chord"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">Esc</kbd> for shortcuts
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

