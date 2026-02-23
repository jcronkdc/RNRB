'use client';

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import { Music, X, Plus } from '@/components/ui/custom-icons';
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
    <div className="space-y-2">
      {/* Helpful hint for first-time users - Compact */}
      <AnimatePresence>
        {showHint && chordPlacements.length === 0 && content.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2 rounded-md border border-brand-primary/30 bg-brand-primary/10 px-3 py-1.5"
          >
            <Music className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
            <p className="text-xs text-zinc-300">
              <span className="font-medium text-white">Tip:</span> Click any word above to add a
              chord
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyrics with clickable words - Compact Chord Chart Style */}
      <div className="min-h-[40px] space-y-0.5 rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-3 py-2">
        {lines.length > 0 && lines.some((line) => line.trim()) ? (
          lines.map((line, lineIndex) => {
            const words = line.split(/(\s+)/);
            const lineHasChords = words.some((word, wordIndex) => {
              if (!word.trim()) return false;
              const actualWordIndex = words.slice(0, wordIndex).filter((w) => w.trim()).length;
              return !!getChordForWord(lineIndex, actualWordIndex);
            });

            return (
              <div key={lineIndex} className="mb-1.5 last:mb-0">
                {/* Chord Row - Compact */}
                <div
                  className={`flex flex-wrap items-end gap-0.5 ${lineHasChords ? 'mb-0.5 min-h-[20px]' : 'h-0'}`}
                >
                  {words.map((word, wordIndex) => {
                    if (!word.trim())
                      return (
                        <span key={wordIndex} className="invisible text-xs">
                          {word}
                        </span>
                      );

                    const actualWordIndex = words
                      .slice(0, wordIndex)
                      .filter((w) => w.trim()).length;
                    const chord = getChordForWord(lineIndex, actualWordIndex);

                    return (
                      <div key={wordIndex} className="inline-flex min-w-0">
                        <AnimatePresence mode="wait">
                          {chord ? (
                            <motion.button
                              initial={{ opacity: 0, y: 2 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -2 }}
                              onClick={() => removeChord(lineIndex, actualWordIndex)}
                              className="group relative flex items-center gap-0.5 rounded border border-brand-primary/60 bg-brand-primary/20 px-1.5 py-0.5 text-xs font-bold text-brand-primary transition-all hover:border-brand-primary hover:bg-brand-primary/30"
                              title={`${chord} - Click to remove`}
                            >
                              {chord}
                              <X className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                            </motion.button>
                          ) : (
                            <span className="invisible px-1.5 py-0.5 text-xs">{word}</span>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Lyrics Row - Compact */}
                <div className="flex flex-wrap items-start gap-0.5">
                  {words.map((word, wordIndex) => {
                    if (!word.trim())
                      return (
                        <span key={wordIndex} className="text-sm text-zinc-300">
                          {word}
                        </span>
                      );

                    const actualWordIndex = words
                      .slice(0, wordIndex)
                      .filter((w) => w.trim()).length;
                    const chord = getChordForWord(lineIndex, actualWordIndex);
                    const hasChord = !!chord;

                    return (
                      <button
                        key={wordIndex}
                        onClick={() => handleWordClick(lineIndex, actualWordIndex)}
                        className={`rounded px-1 py-0.5 text-sm transition-all ${
                          hasChord
                            ? 'border border-brand-primary/30 bg-brand-primary/10 font-medium text-white'
                            : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                        }`}
                        title={hasChord ? `${chord} - Click to remove` : 'Click to add chord'}
                        aria-label={hasChord ? `Remove ${chord} chord` : 'Add chord'}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-center">
            <Music className="h-4 w-4 text-zinc-500" />
            <p className="text-xs text-zinc-400">Type lyrics below, click words to add chords</p>
          </div>
        )}
      </div>

      {/* Text editor for lyrics - Compact */}
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={`Write your ${blockType} lyrics...`}
        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition-all placeholder:text-zinc-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
        rows={2}
        aria-label={`${blockType} lyrics editor`}
      />

      {/* Chord count indicator - Inline */}
      {chordPlacements.length > 0 && (
        <div className="flex items-center justify-end gap-1.5 text-[10px]">
          <Music className="h-3 w-3 text-brand-primary" />
          <span className="font-medium text-brand-primary">
            {chordPlacements.length} {chordPlacements.length === 1 ? 'chord' : 'chords'}
          </span>
        </div>
      )}

      {/* Chord Picker Modal with animations */}
      <AnimatePresence>
        {showChordPicker && selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowChordPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg rounded-xl border-2 border-zinc-700/80 bg-zinc-900/95 p-6 shadow-2xl ring-1 ring-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20">
                    <Music className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Choose a Chord</h3>
                    <p className="text-xs text-zinc-400">
                      Select from common chords or enter your own
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChordPicker(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  aria-label="Close chord picker"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Common Chords Grid */}
              <div className="mb-5 max-h-[280px] overflow-y-auto rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                <motion.div
                  className="grid grid-cols-6 gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.008,
                        delayChildren: 0.02,
                      },
                    },
                  }}
                >
                  {COMMON_CHORDS.map((chord) => (
                    <motion.button
                      key={chord}
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: { opacity: 1, scale: 1 },
                      }}
                      onClick={() => addChord(chord)}
                      className="rounded-lg border border-brand-primary/40 bg-brand-primary/10 px-2 py-2.5 text-sm font-bold text-brand-primary transition-all hover:scale-105 hover:border-brand-primary hover:bg-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/20"
                      aria-label={`Add ${chord} chord`}
                    >
                      {chord}
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* Custom Chord Input */}
              <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
                  <Plus className="h-4 w-4 text-brand-primary" />
                  Custom Chord
                </p>
                <div className="flex gap-2">
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customChord}
                    onChange={(e) => setCustomChord(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomChord()}
                    placeholder="e.g., Cmaj7, Dsus4, Fadd9"
                    className="flex-1 rounded-lg border-2 border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                    aria-label="Custom chord input"
                  />
                  <Button
                    onClick={addCustomChord}
                    disabled={!customChord.trim()}
                    size="sm"
                    className="bg-brand-primary px-5 hover:bg-brand-primary/80"
                    aria-label="Add custom chord"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <p className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-zinc-600 bg-zinc-700 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                      Enter
                    </kbd>
                    to add
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-zinc-600 bg-zinc-700 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                      Esc
                    </kbd>
                    to close
                  </span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
