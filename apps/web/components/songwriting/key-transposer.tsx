'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, RotateCcw, Music } from '@/components/ui/custom-icons';
import { useState, useMemo, useCallback } from 'react';

// All chromatic notes
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Common chord patterns
const CHORD_REGEX = /^([A-G][#b]?)(m|min|maj|dim|aug|sus[24]?|add[0-9]+|[0-9]+)?$/i;

type KeyTransposerProps = {
  chords: string[];
  currentKey?: string;
  onTranspose: (transposedChords: string[], newKey: string, semitones: number) => void;
  className?: string;
};

// Normalize note to sharp notation
function normalizeNote(note: string): string {
  const flatToSharp: Record<string, string> = {
    Db: 'C#',
    Eb: 'D#',
    Fb: 'E',
    Gb: 'F#',
    Ab: 'G#',
    Bb: 'A#',
    Cb: 'B',
  };
  return flatToSharp[note] || note;
}

// Get note index
function getNoteIndex(note: string): number {
  const normalized = normalizeNote(note);
  return NOTES.indexOf(normalized);
}

// Transpose a single note
function transposeNote(note: string, semitones: number, useFlats: boolean = false): string {
  const index = getNoteIndex(note);
  if (index === -1) return note;

  const newIndex = (index + semitones + 12) % 12;
  return useFlats ? FLAT_NOTES[newIndex] : NOTES[newIndex];
}

// Transpose a chord
function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
  // Handle slash chords (e.g., C/G)
  if (chord.includes('/')) {
    const [main, bass] = chord.split('/');
    return `${transposeChord(main, semitones, useFlats)}/${transposeNote(bass, semitones, useFlats)}`;
  }

  // Extract root note and quality
  const match = chord.match(/^([A-G][#b]?)(.*)$/i);
  if (!match) return chord;

  const [, root, quality] = match;
  const newRoot = transposeNote(root, semitones, useFlats);
  return newRoot + quality;
}

// Determine if key should use flats
function shouldUseFlats(key: string): boolean {
  const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
  return flatKeys.some((k) => key.toLowerCase() === k.toLowerCase());
}

export function KeyTransposer({
  chords,
  currentKey,
  onTranspose,
  className = '',
}: KeyTransposerProps) {
  const [semitones, setSemitones] = useState(0);
  const [useFlats, setUseFlats] = useState(currentKey ? shouldUseFlats(currentKey) : false);

  // Calculate transposed chords
  const transposedChords = useMemo(() => {
    return chords.map((chord) => transposeChord(chord, semitones, useFlats));
  }, [chords, semitones, useFlats]);

  // Calculate new key
  const newKey = useMemo(() => {
    if (!currentKey) return undefined;
    return transposeChord(currentKey, semitones, useFlats);
  }, [currentKey, semitones, useFlats]);

  // Handle transpose
  const handleTranspose = useCallback(
    (direction: 'up' | 'down') => {
      const newSemitones = direction === 'up' ? semitones + 1 : semitones - 1;
      setSemitones(newSemitones);

      const newTransposed = chords.map((chord) => transposeChord(chord, newSemitones, useFlats));
      const transposedKey = currentKey ? transposeChord(currentKey, newSemitones, useFlats) : '';
      onTranspose(newTransposed, transposedKey, newSemitones);
    },
    [chords, currentKey, semitones, useFlats, onTranspose]
  );

  // Reset
  const handleReset = useCallback(() => {
    setSemitones(0);
    onTranspose(chords, currentKey || '', 0);
  }, [chords, currentKey, onTranspose]);

  // Quick transpose to specific key
  const quickTransposeToKey = useCallback(
    (targetKey: string) => {
      if (!currentKey) return;

      const currentIndex = getNoteIndex(currentKey.replace(/m.*$/, ''));
      const targetIndex = getNoteIndex(targetKey.replace(/m.*$/, ''));

      if (currentIndex === -1 || targetIndex === -1) return;

      let diff = targetIndex - currentIndex;
      if (diff > 6) diff -= 12;
      if (diff < -6) diff += 12;

      const newSemitones = semitones + diff;
      setSemitones(newSemitones);

      const newUseFlats = shouldUseFlats(targetKey);
      setUseFlats(newUseFlats);

      const newTransposed = chords.map((chord) => transposeChord(chord, newSemitones, newUseFlats));
      onTranspose(newTransposed, targetKey, newSemitones);
    },
    [chords, currentKey, semitones, onTranspose]
  );

  // Common keys for quick selection
  const commonKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Am', 'Em', 'Dm'];

  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Transpose
          </span>
        </div>
        {semitones !== 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition hover:opacity-80"
            style={{ background: 'var(--background)', color: 'var(--muted)' }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Current/New Key Display */}
      <div className="mb-4 flex items-center justify-center gap-4">
        {currentKey && (
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Original
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {currentKey}
            </p>
          </div>
        )}
        {semitones !== 0 && (
          <>
            <div className="text-xl" style={{ color: 'var(--muted)' }}>
              →
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: 'var(--accent)' }}>
                New Key
              </p>
              <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {newKey}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Transpose Controls */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTranspose('down')}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition"
          style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
        >
          <ArrowDown className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </motion.button>

        <div
          className="flex h-10 min-w-[60px] items-center justify-center rounded-xl px-3"
          style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
        >
          <span
            className="font-mono text-sm font-bold"
            style={{ color: semitones === 0 ? 'var(--muted)' : 'var(--accent)' }}
          >
            {semitones > 0 ? '+' : ''}
            {semitones}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTranspose('up')}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition"
          style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
        >
          <ArrowUp className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </motion.button>
      </div>

      {/* Quick Key Selection */}
      {currentKey && (
        <div>
          <p className="mb-2 text-center text-xs" style={{ color: 'var(--muted)' }}>
            Quick transpose to:
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {commonKeys.map((key) => (
              <button
                key={key}
                onClick={() => quickTransposeToKey(key)}
                disabled={key === (newKey || currentKey)}
                className="rounded-lg px-2 py-1 text-xs font-medium transition disabled:opacity-30"
                style={{
                  background:
                    key === (newKey || currentKey) ? 'var(--accent)' : 'var(--background)',
                  color: key === (newKey || currentKey) ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flat/Sharp Toggle */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          Use:
        </span>
        <button
          onClick={() => {
            setUseFlats(false);
            if (semitones !== 0) {
              const newTransposed = chords.map((chord) => transposeChord(chord, semitones, false));
              const transposedKey = currentKey ? transposeChord(currentKey, semitones, false) : '';
              onTranspose(newTransposed, transposedKey, semitones);
            }
          }}
          className="rounded-lg px-2 py-1 text-xs font-medium transition"
          style={{
            background: !useFlats ? 'var(--accent)' : 'var(--background)',
            color: !useFlats ? 'white' : 'var(--text)',
          }}
        >
          Sharps (#)
        </button>
        <button
          onClick={() => {
            setUseFlats(true);
            if (semitones !== 0) {
              const newTransposed = chords.map((chord) => transposeChord(chord, semitones, true));
              const transposedKey = currentKey ? transposeChord(currentKey, semitones, true) : '';
              onTranspose(newTransposed, transposedKey, semitones);
            }
          }}
          className="rounded-lg px-2 py-1 text-xs font-medium transition"
          style={{
            background: useFlats ? 'var(--accent)' : 'var(--background)',
            color: useFlats ? 'white' : 'var(--text)',
          }}
        >
          Flats (♭)
        </button>
      </div>

      {/* Preview transposed chords */}
      {semitones !== 0 && transposedChords.length > 0 && (
        <div className="mt-4 rounded-lg p-3" style={{ background: 'var(--background)' }}>
          <p className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>
            Preview:
          </p>
          <div className="flex flex-wrap gap-2">
            {transposedChords.slice(0, 8).map((chord, i) => (
              <span
                key={i}
                className="rounded-lg px-2 py-1 text-sm font-medium"
                style={{ background: 'var(--panel)', color: 'var(--accent)' }}
              >
                {chord}
              </span>
            ))}
            {transposedChords.length > 8 && (
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                +{transposedChords.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to transpose all chords in a text
export function transposeAllChords(
  text: string,
  semitones: number,
  useFlats: boolean = false
): string {
  // Match chord patterns in text
  const chordPattern =
    /\b([A-G][#b]?(?:m|min|maj|dim|aug|sus[24]?|add[0-9]+|[0-9]+)?(?:\/[A-G][#b]?)?)\b/g;

  return text.replace(chordPattern, (match) => {
    return transposeChord(match, semitones, useFlats);
  });
}

// Nashville Number System conversion
export function toNashvilleNumber(chord: string, key: string): string {
  const keyRoot = key.replace(/m.*$/, '');
  const isMinorKey = key.toLowerCase().includes('m');

  const keyIndex = getNoteIndex(keyRoot);
  if (keyIndex === -1) return chord;

  // Handle slash chords
  if (chord.includes('/')) {
    const [main, bass] = chord.split('/');
    return `${toNashvilleNumber(main, key)}/${toNashvilleNumber(bass, key)}`;
  }

  // Extract root note and quality
  const match = chord.match(/^([A-G][#b]?)(.*)$/i);
  if (!match) return chord;

  const [, root, quality] = match;
  const chordIndex = getNoteIndex(root);
  if (chordIndex === -1) return chord;

  // Calculate scale degree
  let degree = (chordIndex - keyIndex + 12) % 12;

  // Map semitones to scale degrees (major scale)
  const degreeMap: Record<number, string> = {
    0: '1',
    2: '2',
    4: '3',
    5: '4',
    7: '5',
    9: '6',
    11: '7',
  };

  // Handle accidentals
  let nashville = degreeMap[degree];
  if (!nashville) {
    // Check for flat/sharp degrees
    if (degree === 1) nashville = '♭2';
    else if (degree === 3) nashville = '♭3';
    else if (degree === 6) nashville = '♭5';
    else if (degree === 8) nashville = '♭6';
    else if (degree === 10) nashville = '♭7';
    else nashville = `#${degreeMap[degree - 1] || degree}`;
  }

  // Add quality (simplified)
  if (quality.toLowerCase().startsWith('m') && !quality.toLowerCase().includes('maj')) {
    nashville = nashville.toLowerCase();
  } else if (quality.includes('7') && !quality.includes('maj7')) {
    nashville += '7';
  } else if (quality.includes('maj7')) {
    nashville += 'maj7';
  }

  return nashville;
}
