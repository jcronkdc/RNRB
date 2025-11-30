'use client';

import { motion } from 'framer-motion';
import { Hash, Info, Copy, Check } from 'lucide-react';
import { useState, useMemo } from 'react';

type NashvilleNumbersProps = {
  chords: string[];
  songKey: string;
  className?: string;
};

// All chromatic notes
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

// Convert chord to Nashville Number
function toNashvilleNumber(
  chord: string,
  key: string
): { number: string; quality: string; original: string } {
  const keyRoot = key.replace(/m.*$/, '');
  const keyIndex = getNoteIndex(keyRoot);

  if (keyIndex === -1) {
    return { number: '?', quality: '', original: chord };
  }

  // Handle slash chords
  if (chord.includes('/')) {
    const [main, bass] = chord.split('/');
    const mainResult = toNashvilleNumber(main, key);
    const bassResult = toNashvilleNumber(bass, key);
    return {
      number: `${mainResult.number}/${bassResult.number}`,
      quality: mainResult.quality,
      original: chord,
    };
  }

  // Extract root note and quality
  const match = chord.match(/^([A-G][#b]?)(.*)$/i);
  if (!match) {
    return { number: '?', quality: '', original: chord };
  }

  const [, root, quality] = match;
  const chordIndex = getNoteIndex(root);

  if (chordIndex === -1) {
    return { number: '?', quality: '', original: chord };
  }

  // Calculate scale degree
  const degree = (chordIndex - keyIndex + 12) % 12;

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

  let nashville = degreeMap[degree];

  // Handle accidentals (chromatic notes)
  if (!nashville) {
    if (degree === 1) nashville = '♭2';
    else if (degree === 3) nashville = '♭3';
    else if (degree === 6) nashville = '♭5';
    else if (degree === 8) nashville = '♭6';
    else if (degree === 10) nashville = '♭7';
    else nashville = `#${degreeMap[degree - 1] || degree}`;
  }

  // Parse quality
  let qualitySymbol = '';
  const lowerQuality = quality.toLowerCase();

  if (lowerQuality.startsWith('m') && !lowerQuality.includes('maj')) {
    // Minor chord - use lowercase number
    nashville = nashville.toLowerCase();
  }
  if (lowerQuality.includes('dim')) {
    qualitySymbol = '°';
  } else if (lowerQuality.includes('aug')) {
    qualitySymbol = '+';
  } else if (lowerQuality.includes('sus4')) {
    qualitySymbol = 'sus4';
  } else if (lowerQuality.includes('sus2')) {
    qualitySymbol = 'sus2';
  } else if (lowerQuality.includes('maj7')) {
    qualitySymbol = 'Δ7';
  } else if (lowerQuality.includes('7')) {
    qualitySymbol = '7';
  } else if (lowerQuality.includes('9')) {
    qualitySymbol = '9';
  } else if (lowerQuality.includes('add')) {
    qualitySymbol = quality.match(/add\d+/i)?.[0] || '';
  }

  return { number: nashville, quality: qualitySymbol, original: chord };
}

export function NashvilleNumbers({ chords, songKey, className = '' }: NashvilleNumbersProps) {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Convert all chords
  const nashvilleChords = useMemo(() => {
    return chords.map((chord) => toNashvilleNumber(chord, songKey));
  }, [chords, songKey]);

  // Generate Nashville notation string
  const nashvilleString = useMemo(() => {
    return nashvilleChords.map((c) => `${c.number}${c.quality}`).join(' | ');
  }, [nashvilleChords]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(nashvilleString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!songKey || chords.length === 0) {
    return (
      <div
        className={`rounded-xl p-4 ${className}`}
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <Hash className="h-4 w-4" />
          Set a key to see Nashville Numbers
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Nashville Numbers
          </span>
          <span
            className="rounded-lg px-2 py-0.5 text-xs"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Key: {songKey}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-lg p-1.5 transition hover:opacity-80"
            style={{ background: showInfo ? 'var(--accent)' : 'var(--background)' }}
          >
            <Info className="h-3.5 w-3.5" style={{ color: showInfo ? 'white' : 'var(--muted)' }} />
          </button>
          <button
            onClick={copyToClipboard}
            className="rounded-lg p-1.5 transition hover:opacity-80"
            style={{ background: 'var(--background)' }}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" style={{ color: 'var(--success)' }} />
            ) : (
              <Copy className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 rounded-lg p-3"
          style={{ background: 'var(--background)' }}
        >
          <p className="mb-2 text-xs" style={{ color: 'var(--text)' }}>
            <strong>Nashville Number System</strong> uses numbers instead of chord names:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--muted)' }}>
            <div>
              <span style={{ color: 'var(--accent)' }}>1-7</span> = Major chords
            </div>
            <div>
              <span style={{ color: 'var(--accent)' }}>1-7</span> (lowercase) = Minor
            </div>
            <div>
              <span style={{ color: 'var(--accent)' }}>°</span> = Diminished
            </div>
            <div>
              <span style={{ color: 'var(--accent)' }}>Δ7</span> = Major 7th
            </div>
            <div>
              <span style={{ color: 'var(--accent)' }}>7</span> = Dominant 7th
            </div>
            <div>
              <span style={{ color: 'var(--accent)' }}>♭</span> = Flat degree
            </div>
          </div>
        </motion.div>
      )}

      {/* Chord comparison */}
      <div className="space-y-2">
        {/* Original chords row */}
        <div className="flex flex-wrap gap-2">
          {nashvilleChords.map((chord, i) => (
            <div
              key={`original-${i}`}
              className="flex flex-col items-center rounded-lg px-3 py-2"
              style={{ background: 'var(--background)' }}
            >
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {chord.original}
              </span>
              <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {chord.number}
                <span className="text-sm">{chord.quality}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full string preview */}
      <div
        className="mt-3 rounded-lg p-2 font-mono text-sm"
        style={{ background: 'var(--background)', color: 'var(--text)' }}
      >
        {nashvilleString}
      </div>
    </div>
  );
}

// Compact inline display
export function NashvilleInline({ chord, songKey }: { chord: string; songKey: string }) {
  const result = toNashvilleNumber(chord, songKey);

  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 font-mono text-xs font-bold"
      style={{ background: 'var(--panel)', color: 'var(--accent)' }}
      title={`${chord} in key of ${songKey}`}
    >
      {result.number}
      {result.quality}
    </span>
  );
}
