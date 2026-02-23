'use client';

import { motion } from 'motion/react';
import { Guitar, Piano } from '@/components/ui/custom-icons';
import { useState, memo } from 'react';

type ChordDiagramsProps = {
  chord: string;
  className?: string;
};

// Guitar chord fingerings database
const GUITAR_CHORDS: Record<
  string,
  {
    frets: (number | 'x')[];
    barres?: { fret: number; fromString: number; toString: number }[];
    position?: number;
  }
> = {
  // Major chords
  C: { frets: ['x', 3, 2, 0, 1, 0] },
  D: { frets: ['x', 'x', 0, 2, 3, 2] },
  E: { frets: [0, 2, 2, 1, 0, 0] },
  F: { frets: [1, 3, 3, 2, 1, 1], barres: [{ fret: 1, fromString: 1, toString: 6 }] },
  G: { frets: [3, 2, 0, 0, 0, 3] },
  A: { frets: ['x', 0, 2, 2, 2, 0] },
  B: {
    frets: ['x', 2, 4, 4, 4, 2],
    barres: [{ fret: 2, fromString: 1, toString: 5 }],
    position: 2,
  },

  // Minor chords
  Cm: {
    frets: ['x', 3, 5, 5, 4, 3],
    barres: [{ fret: 3, fromString: 1, toString: 5 }],
    position: 3,
  },
  Dm: { frets: ['x', 'x', 0, 2, 3, 1] },
  Em: { frets: [0, 2, 2, 0, 0, 0] },
  Fm: { frets: [1, 3, 3, 1, 1, 1], barres: [{ fret: 1, fromString: 1, toString: 6 }] },
  Gm: { frets: [3, 5, 5, 3, 3, 3], barres: [{ fret: 3, fromString: 1, toString: 6 }], position: 3 },
  Am: { frets: ['x', 0, 2, 2, 1, 0] },
  Bm: {
    frets: ['x', 2, 4, 4, 3, 2],
    barres: [{ fret: 2, fromString: 1, toString: 5 }],
    position: 2,
  },

  // 7th chords
  C7: { frets: ['x', 3, 2, 3, 1, 0] },
  D7: { frets: ['x', 'x', 0, 2, 1, 2] },
  E7: { frets: [0, 2, 0, 1, 0, 0] },
  F7: { frets: [1, 3, 1, 2, 1, 1], barres: [{ fret: 1, fromString: 1, toString: 6 }] },
  G7: { frets: [3, 2, 0, 0, 0, 1] },
  A7: { frets: ['x', 0, 2, 0, 2, 0] },
  B7: { frets: ['x', 2, 1, 2, 0, 2] },

  // Maj7 chords
  Cmaj7: { frets: ['x', 3, 2, 0, 0, 0] },
  Dmaj7: { frets: ['x', 'x', 0, 2, 2, 2] },
  Emaj7: { frets: [0, 2, 1, 1, 0, 0] },
  Fmaj7: { frets: [1, 'x', 2, 2, 1, 0] },
  Gmaj7: { frets: [3, 2, 0, 0, 0, 2] },
  Amaj7: { frets: ['x', 0, 2, 1, 2, 0] },

  // Minor 7th chords
  Cm7: { frets: ['x', 3, 5, 3, 4, 3], position: 3 },
  Dm7: { frets: ['x', 'x', 0, 2, 1, 1] },
  Em7: { frets: [0, 2, 0, 0, 0, 0] },
  Am7: { frets: ['x', 0, 2, 0, 1, 0] },

  // Sus chords
  Dsus2: { frets: ['x', 'x', 0, 2, 3, 0] },
  Dsus4: { frets: ['x', 'x', 0, 2, 3, 3] },
  Asus2: { frets: ['x', 0, 2, 2, 0, 0] },
  Asus4: { frets: ['x', 0, 2, 2, 3, 0] },

  // Sharps/Flats (using sharp notation)
  'C#': {
    frets: ['x', 4, 6, 6, 6, 4],
    barres: [{ fret: 4, fromString: 1, toString: 5 }],
    position: 4,
  },
  'D#': {
    frets: ['x', 6, 8, 8, 8, 6],
    barres: [{ fret: 6, fromString: 1, toString: 5 }],
    position: 6,
  },
  'F#': {
    frets: [2, 4, 4, 3, 2, 2],
    barres: [{ fret: 2, fromString: 1, toString: 6 }],
    position: 2,
  },
  'G#': {
    frets: [4, 6, 6, 5, 4, 4],
    barres: [{ fret: 4, fromString: 1, toString: 6 }],
    position: 4,
  },
  'A#': { frets: ['x', 1, 3, 3, 3, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }] },

  'C#m': {
    frets: ['x', 4, 6, 6, 5, 4],
    barres: [{ fret: 4, fromString: 1, toString: 5 }],
    position: 4,
  },
  'F#m': {
    frets: [2, 4, 4, 2, 2, 2],
    barres: [{ fret: 2, fromString: 1, toString: 6 }],
    position: 2,
  },
  'G#m': {
    frets: [4, 6, 6, 4, 4, 4],
    barres: [{ fret: 4, fromString: 1, toString: 6 }],
    position: 4,
  },
};

// Piano chord fingerings (notes on keyboard)
const PIANO_CHORDS: Record<string, number[]> = {
  // Major
  C: [0, 4, 7], // C E G
  D: [2, 6, 9],
  E: [4, 8, 11],
  F: [5, 9, 12],
  G: [7, 11, 14],
  A: [9, 13, 16],
  B: [11, 15, 18],

  // Minor
  Cm: [0, 3, 7],
  Dm: [2, 5, 9],
  Em: [4, 7, 11],
  Fm: [5, 8, 12],
  Gm: [7, 10, 14],
  Am: [9, 12, 16],
  Bm: [11, 14, 18],

  // 7th
  C7: [0, 4, 7, 10],
  D7: [2, 6, 9, 12],
  E7: [4, 8, 11, 14],
  G7: [7, 11, 14, 17],
  A7: [9, 13, 16, 19],

  // Maj7
  Cmaj7: [0, 4, 7, 11],
  Dmaj7: [2, 6, 9, 13],
  Fmaj7: [5, 9, 12, 16],
  Gmaj7: [7, 11, 14, 18],
  Amaj7: [9, 13, 16, 20],

  // Minor 7
  Am7: [9, 12, 16, 19],
  Dm7: [2, 5, 9, 12],
  Em7: [4, 7, 11, 14],
};

// Normalize chord name (handle flats -> sharps)
function normalizeChordName(chord: string): string {
  const flatToSharp: Record<string, string> = {
    Db: 'C#',
    Eb: 'D#',
    Gb: 'F#',
    Ab: 'G#',
    Bb: 'A#',
  };

  for (const [flat, sharp] of Object.entries(flatToSharp)) {
    if (chord.startsWith(flat)) {
      return chord.replace(flat, sharp);
    }
  }
  return chord;
}

// Guitar fretboard diagram component
const GuitarDiagram = memo(function GuitarDiagram({ chord }: { chord: string }) {
  const normalizedChord = normalizeChordName(chord);
  const chordData = GUITAR_CHORDS[normalizedChord];

  if (!chordData) {
    return (
      <div
        className="flex h-32 items-center justify-center text-center text-xs"
        style={{ color: 'var(--muted)' }}
      >
        Chord diagram
        <br />
        not available
      </div>
    );
  }

  const { frets, barres, position = 1 } = chordData;
  const stringCount = 6;
  const fretCount = 5;
  const width = 100;
  const height = 130;
  const stringSpacing = (width - 20) / (stringCount - 1);
  const fretSpacing = (height - 40) / fretCount;
  const startX = 10;
  const startY = 25;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[120px]">
      {/* Nut or position indicator */}
      {position === 1 ? (
        <rect x={startX - 2} y={startY - 4} width={width - 16} height={4} fill="var(--text)" />
      ) : (
        <text x={startX - 8} y={startY + fretSpacing / 2 + 4} fontSize="10" fill="var(--muted)">
          {position}
        </text>
      )}

      {/* Frets */}
      {Array.from({ length: fretCount + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={startX}
          y1={startY + i * fretSpacing}
          x2={width - 10}
          y2={startY + i * fretSpacing}
          stroke="var(--border)"
          strokeWidth={i === 0 && position > 1 ? 1 : 1}
        />
      ))}

      {/* Strings */}
      {Array.from({ length: stringCount }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={startX + i * stringSpacing}
          y1={startY}
          x2={startX + i * stringSpacing}
          y2={startY + fretCount * fretSpacing}
          stroke="var(--muted)"
          strokeWidth={1}
        />
      ))}

      {/* Barres */}
      {barres?.map((barre, i) => (
        <rect
          key={`barre-${i}`}
          x={startX + (barre.fromString - 1) * stringSpacing - 4}
          y={startY + (barre.fret - position + 0.5) * fretSpacing - 6}
          width={(barre.toString - barre.fromString) * stringSpacing + 8}
          height={12}
          rx={6}
          fill="var(--accent)"
        />
      ))}

      {/* Finger positions */}
      {frets.map((fret, stringIndex) => {
        const x = startX + stringIndex * stringSpacing;

        if (fret === 'x') {
          return (
            <text
              key={`x-${stringIndex}`}
              x={x}
              y={startY - 10}
              fontSize="10"
              textAnchor="middle"
              fill="var(--muted)"
            >
              ×
            </text>
          );
        }

        if (fret === 0) {
          return (
            <circle
              key={`o-${stringIndex}`}
              cx={x}
              cy={startY - 10}
              r={4}
              fill="none"
              stroke="var(--text)"
              strokeWidth={1.5}
            />
          );
        }

        const adjustedFret = fret - position + 1;
        const y = startY + (adjustedFret - 0.5) * fretSpacing;

        return <circle key={`dot-${stringIndex}`} cx={x} cy={y} r={6} fill="var(--accent)" />;
      })}
    </svg>
  );
});

// Piano keyboard diagram component
const PianoDiagram = memo(function PianoDiagram({ chord }: { chord: string }) {
  const normalizedChord = normalizeChordName(chord);
  const notes = PIANO_CHORDS[normalizedChord];

  if (!notes) {
    return (
      <div
        className="flex h-20 items-center justify-center text-center text-xs"
        style={{ color: 'var(--muted)' }}
      >
        Piano diagram
        <br />
        not available
      </div>
    );
  }

  const whiteKeys = 14; // Show about one octave + a bit
  const whiteKeyWidth = 16;
  const blackKeyWidth = 10;
  const whiteKeyHeight = 60;
  const blackKeyHeight = 38;
  const width = whiteKeys * whiteKeyWidth;

  // Map of which positions are black keys (relative to C)
  const blackKeyPositions = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

  // Get white key index from note
  const getWhiteKeyIndex = (note: number) => {
    const octave = Math.floor(note / 12);
    const noteInOctave = note % 12;
    const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
    const whiteIndex = whiteNotes.indexOf(noteInOctave);
    if (whiteIndex !== -1) return octave * 7 + whiteIndex;
    return -1;
  };

  // Check if note is black key
  const isBlackKey = (note: number) => {
    return blackKeyPositions.includes(note % 12);
  };

  return (
    <svg viewBox={`0 0 ${width} ${whiteKeyHeight + 10}`} className="w-full max-w-[200px]">
      {/* White keys */}
      {Array.from({ length: whiteKeys }).map((_, i) => {
        const noteValue = [0, 2, 4, 5, 7, 9, 11][i % 7] + Math.floor(i / 7) * 12;
        const isPressed = notes.includes(noteValue);

        return (
          <rect
            key={`white-${i}`}
            x={i * whiteKeyWidth}
            y={0}
            width={whiteKeyWidth - 1}
            height={whiteKeyHeight}
            fill={isPressed ? 'var(--accent)' : '#fff'}
            stroke="var(--border)"
            strokeWidth={1}
            rx={2}
          />
        );
      })}

      {/* Black keys */}
      {Array.from({ length: whiteKeys - 1 }).map((_, i) => {
        const noteInOctave = [0, 2, 4, 5, 7, 9, 11][i % 7];
        const nextNote = [0, 2, 4, 5, 7, 9, 11][(i + 1) % 7];

        // Skip if no black key between these white keys
        if (nextNote - noteInOctave === 1 || (noteInOctave === 11 && nextNote === 0)) return null;

        const blackNoteValue = noteInOctave + 1 + Math.floor(i / 7) * 12;
        const isPressed = notes.includes(blackNoteValue);

        return (
          <rect
            key={`black-${i}`}
            x={i * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2}
            y={0}
            width={blackKeyWidth}
            height={blackKeyHeight}
            fill={isPressed ? 'var(--accent)' : '#222'}
            stroke="var(--border)"
            strokeWidth={0.5}
            rx={1}
          />
        );
      })}
    </svg>
  );
});

export function ChordDiagrams({ chord, className = '' }: ChordDiagramsProps) {
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>('guitar');

  return (
    <div
      className={`rounded-xl p-3 ${className}`}
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
          {chord}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setInstrument('guitar')}
            className="rounded-lg p-1.5 transition"
            style={{
              background: instrument === 'guitar' ? 'var(--accent)' : 'var(--background)',
              color: instrument === 'guitar' ? 'white' : 'var(--muted)',
            }}
            title="Guitar"
          >
            <Guitar className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setInstrument('piano')}
            className="rounded-lg p-1.5 transition"
            style={{
              background: instrument === 'piano' ? 'var(--accent)' : 'var(--background)',
              color: instrument === 'piano' ? 'white' : 'var(--muted)',
            }}
            title="Piano"
          >
            <Piano className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Diagram */}
      <div className="flex justify-center">
        {instrument === 'guitar' ? <GuitarDiagram chord={chord} /> : <PianoDiagram chord={chord} />}
      </div>
    </div>
  );
}

// Multi-chord display component
export function ChordDiagramStrip({
  chords,
  className = '',
}: {
  chords: string[];
  className?: string;
}) {
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>('guitar');
  const uniqueChords = [...new Set(chords)];

  return (
    <div className={className}>
      {/* Instrument toggle */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          Chord Diagrams
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setInstrument('guitar')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition"
            style={{
              background: instrument === 'guitar' ? 'var(--accent)' : 'var(--panel)',
              color: instrument === 'guitar' ? 'white' : 'var(--text)',
            }}
          >
            <Guitar className="h-3 w-3" />
            Guitar
          </button>
          <button
            onClick={() => setInstrument('piano')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition"
            style={{
              background: instrument === 'piano' ? 'var(--accent)' : 'var(--panel)',
              color: instrument === 'piano' ? 'white' : 'var(--text)',
            }}
          >
            <Piano className="h-3 w-3" />
            Piano
          </button>
        </div>
      </div>

      {/* Chord grid */}
      <div className="flex flex-wrap gap-2">
        {uniqueChords.map((chord) => (
          <motion.div
            key={chord}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-2"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <div className="mb-1 text-center text-xs font-bold" style={{ color: 'var(--accent)' }}>
              {chord}
            </div>
            {instrument === 'guitar' ? (
              <div className="w-20">
                <GuitarDiagram chord={chord} />
              </div>
            ) : (
              <div className="w-28">
                <PianoDiagram chord={chord} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
