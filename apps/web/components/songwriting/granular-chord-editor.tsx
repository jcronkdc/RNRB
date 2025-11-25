'use client';

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Plus, Info } from 'lucide-react';
import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react';

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
  'A',
  'Am',
  'A7',
  'A#',
  'Am7',
  'B',
  'Bm',
  'B7',
  'Bb',
  'Bm7',
  'C',
  'Cm',
  'C7',
  'C#',
  'Cm7',
  'D',
  'Dm',
  'D7',
  'D#',
  'Dm7',
  'E',
  'Em',
  'E7',
  'Eb',
  'Em7',
  'F',
  'Fm',
  'F7',
  'F#',
  'Fm7',
  'G',
  'Gm',
  'G7',
  'G#',
  'Gm7',
];

export const GranularChordEditor = memo(function GranularChordEditor({
  content,
  chordPlacements = [],
  onContentChange,
  onChordsChange,
  blockType,
}: GranularChordEditorProps) {
  const [selectedWord, setSelectedWord] = useState<{ lineIndex: number; wordIndex: number } | null>(
    null
  );
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

  const addChord = useCallback(
    (chord: string) => {
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
    },
    [selectedWord, chordPlacements, onChordsChange]
  );

  const removeChord = useCallback(
    (lineIndex: number, wordIndex: number) => {
      const newPlacements = chordPlacements.filter(
        (p) => !(p.lineIndex === lineIndex && p.wordIndex === wordIndex)
      );
      onChordsChange(newPlacements);
    },
    [chordPlacements, onChordsChange]
  );

  const getChordForWord = useCallback(
    (lineIndex: number, wordIndex: number) => {
      return chordPlacements.find((p) => p.lineIndex === lineIndex && p.wordIndex === wordIndex)
        ?.chord;
    },
    [chordPlacements]
  );

  const handleWordClick = useCallback(
    (lineIndex: number, wordIndex: number) => {
      const existingChord = getChordForWord(lineIndex, wordIndex);
      if (existingChord) {
        removeChord(lineIndex, wordIndex);
      } else {
        setSelectedWord({ lineIndex, wordIndex });
        setShowChordPicker(true);
        setShowHint(false); // Hide hint after first interaction
      }
    },
    [getChordForWord, removeChord]
  );

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
            className="flex items-start gap-2 rounded border border-zinc-800 bg-zinc-900/50 p-3 text-sm"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-300">Tip</p>
              <p className="mt-1 text-xs text-zinc-400">
                Click any word below to add a chord above it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyrics with clickable words */}
      <div className="min-h-[60px] space-y-3">
        {lines.length > 0 && lines.some((line) => line.trim()) ? (
          lines.map((line, lineIndex) => {
            const words = line.split(/(\s+)/);
            return (
              <div key={lineIndex} className="flex flex-wrap items-start gap-1">
                {words.map((word, wordIndex) => {
                  if (!word.trim()) return <span key={wordIndex}>{word}</span>;

                  const actualWordIndex = words.slice(0, wordIndex).filter((w) => w.trim()).length;
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
                            className="group/chord absolute -top-7 left-1/2 -translate-x-1/2"
                          >
                            <div className="relative">
                              <div className="flex min-w-[32px] items-center justify-center whitespace-nowrap rounded border-2 border-green-500/50 bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-600 shadow-sm dark:text-green-400">
                                {chord}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeChord(lineIndex, actualWordIndex);
                                }}
                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity transition-transform hover:scale-110 hover:bg-red-600 group-hover/chord:opacity-100"
                                title="Remove chord (or click word)"
                                aria-label="Remove chord"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Clickable word with hover effect */}
                      <button
                        onClick={() => handleWordClick(lineIndex, actualWordIndex)}
                        className={`rounded px-1 py-0.5 transition-all ${
                          hasChord
                            ? 'bg-zinc-800 font-medium text-white hover:scale-105 hover:bg-zinc-700'
                            : 'text-white hover:bg-zinc-800 hover:scale-105'
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
          <div className="text-muted-foreground py-8 text-center text-sm">
            Type your lyrics below to get started...
          </div>
        )}
      </div>

      {/* Text editor for lyrics */}
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={`Write your ${blockType} lyrics...\n\nTip: Type your lyrics, then click any word above to add a chord!`}
        className="border-border/50 bg-surface/50 text-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
        rows={4}
        aria-label={`${blockType} lyrics editor`}
      />

      {/* Chord count indicator */}
      {chordPlacements.length > 0 && (
        <div className="text-muted-foreground text-right text-xs">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setShowChordPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Music className="text-brand-primary h-5 w-5" />
                  Choose Chord
                </h3>
                <button
                  onClick={() => setShowChordPicker(false)}
                  className="text-muted-foreground hover:bg-surface-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition"
                  aria-label="Close chord picker"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Common Chords Grid */}
              <div className="mb-4 grid grid-cols-5 gap-2">
                {COMMON_CHORDS.map((chord, index) => (
                  <motion.button
                    key={chord}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => addChord(chord)}
                    className="min-w-[48px] rounded-lg border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 px-2 py-2 text-sm font-bold text-green-600 transition-all hover:scale-105 hover:border-green-500/60 hover:shadow-lg dark:text-green-400"
                    aria-label={`Add ${chord} chord`}
                  >
                    {chord}
                  </motion.button>
                ))}
              </div>

              {/* Custom Chord Input */}
              <div className="border-border border-t pt-4">
                <p className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                  <Info className="h-3.5 w-3.5" />
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
                    className="border-border bg-background focus:border-brand-primary focus:ring-brand-primary/20 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                    aria-label="Custom chord input"
                  />
                  <Button
                    onClick={addCustomChord}
                    disabled={!customChord.trim()}
                    size="sm"
                    className="px-4"
                    aria-label="Add custom chord"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Press{' '}
                  <kbd className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
                    Enter
                  </kbd>{' '}
                  or{' '}
                  <kbd className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">Esc</kbd>{' '}
                  for shortcuts
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
