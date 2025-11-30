'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Download, Volume2, VolumeX, Settings, Music, Drum } from 'lucide-react';
import { Button } from '@cronkwaters/ui';

interface TimeSignature {
  beats: number;
  noteValue: number;
}

interface ClickSound {
  name: string;
  accent: number; // frequency for accented beats
  normal: number; // frequency for normal beats
}

const CLICK_SOUNDS: ClickSound[] = [
  { name: 'Classic', accent: 1500, normal: 1000 },
  { name: 'Wood Block', accent: 800, normal: 600 },
  { name: 'Cowbell', accent: 587, normal: 440 },
  { name: 'Hi-Hat', accent: 2500, normal: 2000 },
  { name: 'Rim Shot', accent: 300, normal: 200 },
];

const TIME_SIGNATURES: TimeSignature[] = [
  { beats: 2, noteValue: 4 },
  { beats: 3, noteValue: 4 },
  { beats: 4, noteValue: 4 },
  { beats: 5, noteValue: 4 },
  { beats: 6, noteValue: 8 },
  { beats: 7, noteValue: 8 },
  { beats: 9, noteValue: 8 },
  { beats: 12, noteValue: 8 },
];

export function ClickTrackGenerator() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({ beats: 4, noteValue: 4 });
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [clickSound, setClickSound] = useState(CLICK_SOUNDS[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [accentFirst, setAccentFirst] = useState(true);
  const [subdivision, setSubdivision] = useState(1); // 1 = quarter, 2 = eighth, 4 = sixteenth
  const [countIn, setCountIn] = useState(false);
  const [countInBeats, setCountInBeats] = useState(4);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beatRef = useRef(0);
  const isCountingInRef = useRef(false);
  const countInBeatRef = useRef(0);

  // Create click sound
  const playClick = useCallback(
    (isAccent: boolean, isCountIn: boolean = false) => {
      if (!audioContextRef.current || isMuted) return;

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Use triangle wave for softer sound
      oscillator.type = 'triangle';
      oscillator.frequency.value = isAccent ? clickSound.accent : clickSound.normal;

      const effectiveVolume = volume * (isCountIn ? 0.5 : 1);
      gainNode.gain.setValueAtTime(effectiveVolume, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    },
    [clickSound, volume, isMuted]
  );

  // Start click track
  const startClick = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    beatRef.current = 0;
    setCurrentBeat(0);

    // Handle count-in
    if (countIn) {
      isCountingInRef.current = true;
      countInBeatRef.current = 0;
    }

    const intervalMs = (60 / bpm / subdivision) * 1000;

    intervalRef.current = setInterval(() => {
      if (isCountingInRef.current) {
        // Count-in phase
        const isAccent =
          countInBeatRef.current % subdivision === 0 &&
          (countInBeatRef.current / subdivision) % timeSignature.beats === 0;
        playClick(isAccent, true);
        countInBeatRef.current++;

        if (countInBeatRef.current >= countInBeats * subdivision) {
          isCountingInRef.current = false;
          beatRef.current = 0;
        }
      } else {
        // Normal playing
        const actualBeat = Math.floor(beatRef.current / subdivision);
        const isAccent =
          accentFirst &&
          beatRef.current % subdivision === 0 &&
          actualBeat % timeSignature.beats === 0;
        playClick(isAccent);

        beatRef.current = (beatRef.current + 1) % (timeSignature.beats * subdivision);
        setCurrentBeat(Math.floor(beatRef.current / subdivision));
      }
    }, intervalMs);

    setIsPlaying(true);
  }, [bpm, timeSignature, subdivision, accentFirst, countIn, countInBeats, playClick]);

  // Stop click track
  const stopClick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isCountingInRef.current = false;
    setIsPlaying(false);
    setCurrentBeat(0);
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopClick();
    } else {
      startClick();
    }
  }, [isPlaying, startClick, stopClick]);

  // Update interval when BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      stopClick();
      startClick();
    }
  }, [bpm, subdivision]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopClick();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopClick]);

  // Generate and download click track as WAV
  const downloadClickTrack = useCallback(async () => {
    const duration = 60; // 60 seconds
    const sampleRate = 44100;
    const numSamples = duration * sampleRate;
    const buffer = new Float32Array(numSamples);

    const intervalSamples = Math.floor((60 / bpm / subdivision) * sampleRate);
    const clickDuration = Math.floor(0.05 * sampleRate); // 50ms click

    let beatCount = 0;
    for (let i = 0; i < numSamples; i += intervalSamples) {
      const actualBeat = Math.floor(beatCount / subdivision);
      const isAccent =
        accentFirst && beatCount % subdivision === 0 && actualBeat % timeSignature.beats === 0;
      const frequency = isAccent ? clickSound.accent : clickSound.normal;

      for (let j = 0; j < clickDuration && i + j < numSamples; j++) {
        const t = j / sampleRate;
        const envelope = Math.exp(-t * 50); // Quick decay
        buffer[i + j] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
      }

      beatCount = (beatCount + 1) % (timeSignature.beats * subdivision);
    }

    // Convert to WAV
    const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(wavBuffer);

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Audio data
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    // Download
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `click-track-${bpm}bpm-${timeSignature.beats}-${timeSignature.noteValue}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bpm, timeSignature, subdivision, accentFirst, clickSound, volume]);

  // BPM tap detection
  const tapTimesRef = useRef<number[]>([]);
  const handleTap = useCallback(() => {
    const now = Date.now();
    tapTimesRef.current.push(now);

    // Keep only last 8 taps
    if (tapTimesRef.current.length > 8) {
      tapTimesRef.current.shift();
    }

    // Need at least 2 taps to calculate BPM
    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const tappedBpm = Math.round(60000 / avgInterval);

      // Only update if reasonable BPM
      if (tappedBpm >= 20 && tappedBpm <= 300) {
        setBpm(tappedBpm);
      }
    }

    // Reset if no tap for 2 seconds
    setTimeout(() => {
      if (
        tapTimesRef.current.length > 0 &&
        Date.now() - tapTimesRef.current[tapTimesRef.current.length - 1] > 2000
      ) {
        tapTimesRef.current = [];
      }
    }, 2000);
  }, []);

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Drum className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Click Track Generator</h3>
            <p className="text-sm text-muted-foreground">Create practice & recording clicks</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="grid gap-4 rounded-xl bg-white/5 p-4 sm:grid-cols-2">
              {/* Click Sound */}
              <div>
                <label className="mb-2 block text-sm font-medium">Click Sound</label>
                <select
                  value={clickSound.name}
                  onChange={(e) =>
                    setClickSound(
                      CLICK_SOUNDS.find((s) => s.name === e.target.value) || CLICK_SOUNDS[0]
                    )
                  }
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
                >
                  {CLICK_SOUNDS.map((sound) => (
                    <option key={sound.name} value={sound.name}>
                      {sound.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subdivision */}
              <div>
                <label className="mb-2 block text-sm font-medium">Subdivision</label>
                <select
                  value={subdivision}
                  onChange={(e) => setSubdivision(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
                >
                  <option value={1}>Quarter Notes</option>
                  <option value={2}>Eighth Notes</option>
                  <option value={4}>Sixteenth Notes</option>
                </select>
              </div>

              {/* Accent First Beat */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Accent First Beat</label>
                <button
                  onClick={() => setAccentFirst(!accentFirst)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    accentFirst ? 'bg-brand-primary' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      accentFirst ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Count-In */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Count-In ({countInBeats} beats)</label>
                <button
                  onClick={() => setCountIn(!countIn)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    countIn ? 'bg-brand-primary' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      countIn ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BPM Display */}
      <div className="mb-6 text-center">
        <div className="mb-4">
          <span className="font-display text-8xl font-black">{bpm}</span>
          <span className="ml-2 text-2xl text-muted-foreground">BPM</span>
        </div>

        {/* BPM Slider */}
        <div className="mx-auto max-w-md">
          <input
            type="range"
            min="20"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>20</span>
            <span>Largo</span>
            <span>Andante</span>
            <span>Allegro</span>
            <span>Presto</span>
            <span>300</span>
          </div>
        </div>

        {/* Quick BPM Buttons */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[60, 80, 100, 120, 140, 160, 180].map((preset) => (
            <Button
              key={preset}
              variant={bpm === preset ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBpm(preset)}
              className="rounded-full px-4"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Beat Visualizer */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: timeSignature.beats }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: isPlaying && currentBeat === i ? 1.3 : 1,
                backgroundColor:
                  isPlaying && currentBeat === i
                    ? i === 0 && accentFirst
                      ? 'rgb(249, 115, 22)'
                      : 'rgb(255, 99, 71)'
                    : 'rgb(64, 64, 64)',
              }}
              transition={{ duration: 0.1 }}
              className="flex h-12 w-12 items-center justify-center rounded-full"
            >
              <span className="text-lg font-bold">{i + 1}</span>
            </motion.div>
          ))}
        </div>

        {/* Time Signature Selector */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {TIME_SIGNATURES.map((ts) => (
            <Button
              key={`${ts.beats}/${ts.noteValue}`}
              variant={
                timeSignature.beats === ts.beats && timeSignature.noteValue === ts.noteValue
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() => {
                setTimeSignature(ts);
                if (isPlaying) {
                  stopClick();
                  setTimeout(startClick, 100);
                }
              }}
              className="rounded-lg px-3"
            >
              {ts.beats}/{ts.noteValue}
            </Button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Play/Pause */}
        <Button
          onClick={togglePlay}
          className={`gap-2 rounded-full px-8 py-6 text-lg font-bold ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start
            </>
          )}
        </Button>

        {/* Tap Tempo */}
        <Button variant="outline" onClick={handleTap} className="gap-2 rounded-full px-6 py-6">
          <Music className="h-5 w-5" />
          Tap Tempo
        </Button>

        {/* Volume */}
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20"
          />
        </div>

        {/* Download */}
        <Button
          variant="outline"
          onClick={downloadClickTrack}
          className="gap-2 rounded-full px-6 py-6"
        >
          <Download className="h-5 w-5" />
          Download WAV
        </Button>
      </div>

      {/* Tempo Reference */}
      <div className="mt-6 rounded-xl bg-white/5 p-4">
        <h4 className="mb-3 text-sm font-semibold">Tempo Reference</h4>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Grave</div>
            <div className="font-mono">20-40</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Largo</div>
            <div className="font-mono">40-60</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Adagio</div>
            <div className="font-mono">66-76</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Andante</div>
            <div className="font-mono">76-108</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Moderato</div>
            <div className="font-mono">108-120</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Allegro</div>
            <div className="font-mono">120-168</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Vivace</div>
            <div className="font-mono">168-176</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="text-xs text-muted-foreground">Presto</div>
            <div className="font-mono">176-200</div>
          </div>
        </div>
      </div>
    </div>
  );
}
