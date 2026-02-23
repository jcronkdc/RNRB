'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Info, Volume2, VolumeX, Play } from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

interface KeyInfo {
  major: string;
  minor: string;
  sharpsFlats: number; // positive = sharps, negative = flats
  accidentals: string;
  chords: {
    major: string[];
    minor: string[];
  };
  relativeMinor: string;
  parallelMinor: string;
}

const KEYS: KeyInfo[] = [
  {
    major: 'C',
    minor: 'Am',
    sharpsFlats: 0,
    accidentals: 'None',
    chords: {
      major: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
      minor: ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
    },
    relativeMinor: 'Am',
    parallelMinor: 'Cm',
  },
  {
    major: 'G',
    minor: 'Em',
    sharpsFlats: 1,
    accidentals: 'F#',
    chords: {
      major: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
      minor: ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
    },
    relativeMinor: 'Em',
    parallelMinor: 'Gm',
  },
  {
    major: 'D',
    minor: 'Bm',
    sharpsFlats: 2,
    accidentals: 'F#, C#',
    chords: {
      major: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
      minor: ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'],
    },
    relativeMinor: 'Bm',
    parallelMinor: 'Dm',
  },
  {
    major: 'A',
    minor: 'F#m',
    sharpsFlats: 3,
    accidentals: 'F#, C#, G#',
    chords: {
      major: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
      minor: ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'],
    },
    relativeMinor: 'F#m',
    parallelMinor: 'Am',
  },
  {
    major: 'E',
    minor: 'C#m',
    sharpsFlats: 4,
    accidentals: 'F#, C#, G#, D#',
    chords: {
      major: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
      minor: ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'],
    },
    relativeMinor: 'C#m',
    parallelMinor: 'Em',
  },
  {
    major: 'B',
    minor: 'G#m',
    sharpsFlats: 5,
    accidentals: 'F#, C#, G#, D#, A#',
    chords: {
      major: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
      minor: ['G#m', 'A#dim', 'B', 'C#m', 'D#m', 'E', 'F#'],
    },
    relativeMinor: 'G#m',
    parallelMinor: 'Bm',
  },
  {
    major: 'F#/Gb',
    minor: 'D#m/Ebm',
    sharpsFlats: 6,
    accidentals: 'F#, C#, G#, D#, A#, E#',
    chords: {
      major: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
      minor: ['D#m', 'E#dim', 'F#', 'G#m', 'A#m', 'B', 'C#'],
    },
    relativeMinor: 'D#m',
    parallelMinor: 'F#m',
  },
  {
    major: 'Db',
    minor: 'Bbm',
    sharpsFlats: -5,
    accidentals: 'Bb, Eb, Ab, Db, Gb',
    chords: {
      major: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'],
      minor: ['Bbm', 'Cdim', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab'],
    },
    relativeMinor: 'Bbm',
    parallelMinor: 'Dbm',
  },
  {
    major: 'Ab',
    minor: 'Fm',
    sharpsFlats: -4,
    accidentals: 'Bb, Eb, Ab, Db',
    chords: {
      major: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
      minor: ['Fm', 'Gdim', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'],
    },
    relativeMinor: 'Fm',
    parallelMinor: 'Abm',
  },
  {
    major: 'Eb',
    minor: 'Cm',
    sharpsFlats: -3,
    accidentals: 'Bb, Eb, Ab',
    chords: {
      major: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
      minor: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'],
    },
    relativeMinor: 'Cm',
    parallelMinor: 'Ebm',
  },
  {
    major: 'Bb',
    minor: 'Gm',
    sharpsFlats: -2,
    accidentals: 'Bb, Eb',
    chords: {
      major: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
      minor: ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'],
    },
    relativeMinor: 'Gm',
    parallelMinor: 'Bbm',
  },
  {
    major: 'F',
    minor: 'Dm',
    sharpsFlats: -1,
    accidentals: 'Bb',
    chords: {
      major: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
      minor: ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'],
    },
    relativeMinor: 'Dm',
    parallelMinor: 'Fm',
  },
];

// Note frequencies for playing sounds
const NOTE_FREQUENCIES: { [key: string]: number } = {
  C: 261.63,
  'C#': 277.18,
  Db: 277.18,
  D: 293.66,
  'D#': 311.13,
  Eb: 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99,
  Gb: 369.99,
  G: 392.0,
  'G#': 415.3,
  Ab: 415.3,
  A: 440.0,
  'A#': 466.16,
  Bb: 466.16,
  B: 493.88,
};

export function CircleOfFifths() {
  const [selectedKey, setSelectedKey] = useState<KeyInfo | null>(null);
  const [showMinor, setShowMinor] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context
  const initAudio = () => {
    if (!audioContext) {
      setAudioContext(new AudioContext());
    }
  };

  // Play a note
  const playNote = (noteName: string) => {
    if (!audioEnabled) return;

    initAudio();
    const ctx = audioContext || new AudioContext();
    if (!audioContext) setAudioContext(ctx);

    // Handle compound notes like "F#/Gb"
    const baseNote = noteName.split('/')[0].replace('m', '').replace('dim', '');
    const freq = NOTE_FREQUENCIES[baseNote];
    if (!freq) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.value = freq;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  // Play a chord
  const playChord = (chordName: string) => {
    if (!audioEnabled) return;

    initAudio();
    const ctx = audioContext || new AudioContext();
    if (!audioContext) setAudioContext(ctx);

    const baseNote = chordName.replace('m', '').replace('dim', '').split('/')[0];
    const isMinor = chordName.includes('m') && !chordName.includes('maj');
    const isDim = chordName.includes('dim');

    const baseFreq = NOTE_FREQUENCIES[baseNote];
    if (!baseFreq) return;

    // Calculate chord intervals
    const intervals = isDim
      ? [1, Math.pow(2, 3 / 12), Math.pow(2, 6 / 12)] // diminished
      : isMinor
        ? [1, Math.pow(2, 3 / 12), Math.pow(2, 7 / 12)] // minor
        : [1, Math.pow(2, 4 / 12), Math.pow(2, 7 / 12)]; // major

    intervals.forEach((interval, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.value = baseFreq * interval;

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

      oscillator.start(ctx.currentTime + i * 0.05);
      oscillator.stop(ctx.currentTime + 1);
    });
  };

  // Calculate position for each key on the circle
  const getKeyPosition = (index: number, radius: number) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    return {
      x: 150 + radius * Math.cos(angle),
      y: 150 + radius * Math.sin(angle),
    };
  };

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-600">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Circle of Fifths</h3>
            <p className="text-sm text-muted-foreground">Interactive music theory reference</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="rounded-full"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Major/Minor Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-full bg-white/5 p-1">
          <button
            onClick={() => setShowMinor(false)}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              !showMinor
                ? 'bg-linear-to-r from-blue-500 to-cyan-600 text-white'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Major Keys
          </button>
          <button
            onClick={() => setShowMinor(true)}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              showMinor
                ? 'bg-linear-to-r from-purple-500 to-pink-600 text-white'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Minor Keys
          </button>
        </div>
      </div>

      {/* Circle Visualization */}
      <div className="relative mx-auto mb-6 aspect-square max-w-md">
        <svg viewBox="0 0 300 300" className="h-full w-full">
          {/* Background circles */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.3"
          />
          <circle
            cx="150"
            cy="150"
            r="100"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.3"
          />
          <circle cx="150" cy="150" r="50" fill="var(--panel)" />

          {/* Connecting lines (fifths relationship) */}
          {KEYS.map((_, i) => {
            const from = getKeyPosition(i, 120);
            const to = getKeyPosition((i + 1) % 12, 120);
            return (
              <line
                key={`line-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--border)"
                strokeWidth="1"
                opacity="0.2"
              />
            );
          })}

          {/* Major keys (outer ring) */}
          {KEYS.map((key, i) => {
            const pos = getKeyPosition(i, 120);
            const isSelected = selectedKey?.major === key.major;

            return (
              <g key={key.major}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 22 : 18}
                  className="cursor-pointer"
                  fill={isSelected ? 'url(#majorGradient)' : 'var(--panel)'}
                  stroke={isSelected ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isSelected ? 2 : 1}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    setSelectedKey(key);
                    playNote(key.major.split('/')[0]);
                  }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected ? 'white' : 'var(--text)'}
                  fontSize={key.major.length > 2 ? '10' : '12'}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {key.major}
                </text>
              </g>
            );
          })}

          {/* Minor keys (inner ring) */}
          {KEYS.map((key, i) => {
            const pos = getKeyPosition(i, 75);
            const isSelected = selectedKey?.minor === key.minor;

            return (
              <g key={key.minor}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 18 : 14}
                  className="cursor-pointer"
                  fill={isSelected ? 'url(#minorGradient)' : 'rgba(255,255,255,0.05)'}
                  stroke={isSelected ? 'rgb(168, 85, 247)' : 'var(--border)'}
                  strokeWidth={isSelected ? 2 : 1}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    setSelectedKey(key);
                    playNote(key.minor.split('/')[0].replace('m', ''));
                  }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected ? 'white' : 'var(--muted)'}
                  fontSize={key.minor.length > 3 ? '8' : '10'}
                  className="pointer-events-none"
                >
                  {key.minor}
                </text>
              </g>
            );
          })}

          {/* Center info */}
          <text
            x="150"
            y="150"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--muted)"
            fontSize="10"
          >
            {selectedKey
              ? `${Math.abs(selectedKey.sharpsFlats)}${selectedKey.sharpsFlats >= 0 ? '#' : 'b'}`
              : 'Select Key'}
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="majorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="minorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Selected Key Info */}
      <AnimatePresence mode="wait">
        {selectedKey && (
          <motion.div
            key={selectedKey.major}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 rounded-xl bg-white/5 p-4"
          >
            {/* Key Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold">
                  {showMinor ? selectedKey.minor : selectedKey.major} {showMinor ? '' : 'Major'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedKey.sharpsFlats === 0
                    ? 'No sharps or flats'
                    : `${Math.abs(selectedKey.sharpsFlats)} ${selectedKey.sharpsFlats > 0 ? 'sharp' : 'flat'}${Math.abs(selectedKey.sharpsFlats) > 1 ? 's' : ''}: ${selectedKey.accidentals}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Relative Minor</div>
                <div className="font-semibold">{selectedKey.relativeMinor}</div>
              </div>
            </div>

            {/* Chord Scale */}
            <div>
              <h5 className="mb-2 text-sm font-semibold">
                {showMinor ? 'Natural Minor' : 'Major'} Scale Chords
              </h5>
              <div className="flex flex-wrap gap-2">
                {(showMinor ? selectedKey.chords.minor : selectedKey.chords.major).map(
                  (chord, i) => {
                    const numerals = showMinor
                      ? ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
                      : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

                    return (
                      <motion.button
                        key={chord}
                        onClick={() => playChord(chord)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
                      >
                        <span className="text-xs text-muted-foreground">{numerals[i]}</span>
                        <span className="font-bold">{chord}</span>
                      </motion.button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Common Progressions */}
            <div>
              <h5 className="mb-2 text-sm font-semibold">Common Progressions</h5>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                {(showMinor
                  ? [
                      { name: 'Andalusian', chords: 'i-VII-VI-V' },
                      { name: 'Doo-Wop', chords: 'i-VI-III-VII' },
                      { name: 'Minor Blues', chords: 'i-iv-i-V' },
                      { name: 'Pop Minor', chords: 'i-iv-VI-V' },
                    ]
                  : [
                      { name: 'Pop', chords: 'I-V-vi-IV' },
                      { name: 'Blues', chords: 'I-IV-I-V' },
                      { name: 'Jazz ii-V-I', chords: 'ii-V-I' },
                      { name: '50s', chords: 'I-vi-IV-V' },
                    ]
                ).map((prog) => (
                  <div key={prog.name} className="rounded-lg bg-white/5 p-2">
                    <div className="text-xs text-muted-foreground">{prog.name}</div>
                    <div className="font-mono text-xs">{prog.chords}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Relationships */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-xs text-muted-foreground">Parallel Minor</div>
                <div className="font-semibold">{selectedKey.parallelMinor}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-xs text-muted-foreground">Relative Major</div>
                <div className="font-semibold">
                  {KEYS[(KEYS.findIndex((k) => k.major === selectedKey.major) + 3) % 12]?.major ||
                    selectedKey.major}
                </div>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-xs text-muted-foreground">Dominant</div>
                <div className="font-semibold">
                  {KEYS[(KEYS.findIndex((k) => k.major === selectedKey.major) + 1) % 12]?.major}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-linear-to-r from-blue-500 to-cyan-600" />
          <span className="text-muted-foreground">Major Keys</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-linear-to-r from-purple-500 to-pink-600" />
          <span className="text-muted-foreground">Minor Keys</span>
        </div>
      </div>
    </div>
  );
}
