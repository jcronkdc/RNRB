'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings, RefreshCw, Music2 } from 'lucide-react';
import { Button } from '@cronkwaters/ui';

// Note frequencies for A4 = 440Hz
const NOTE_STRINGS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface TunerState {
  note: string;
  octave: number;
  frequency: number;
  cents: number;
  isInTune: boolean;
}

export function ChromaticTuner() {
  const [isListening, setIsListening] = useState(false);
  const [tunerState, setTunerState] = useState<TunerState | null>(null);
  const [referenceFreq, setReferenceFreq] = useState(440);
  const [showSettings, setShowSettings] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.01);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Convert frequency to note
  const frequencyToNote = useCallback(
    (frequency: number): TunerState => {
      const noteNum = 12 * Math.log2(frequency / referenceFreq);
      const noteNumRounded = Math.round(noteNum);
      const cents = Math.round((noteNum - noteNumRounded) * 100);

      // A4 is note 0 in our calculation, A is index 9 in NOTE_STRINGS
      const noteIndex = ((noteNumRounded % 12) + 12 + 9) % 12;
      const octave = Math.floor((noteNumRounded + 9) / 12) + 4;

      const isInTune = Math.abs(cents) <= 5;

      return {
        note: NOTE_STRINGS[noteIndex],
        octave,
        frequency,
        cents,
        isInTune,
      };
    },
    [referenceFreq]
  );

  // Auto-correlation pitch detection algorithm
  const detectPitch = useCallback(
    (buffer: Float32Array, sampleRate: number): number | null => {
      const SIZE = buffer.length;
      const MAX_SAMPLES = Math.floor(SIZE / 2);
      let bestOffset = -1;
      let bestCorrelation = 0;
      let rms = 0;

      // Calculate RMS (volume level)
      for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
      }
      rms = Math.sqrt(rms / SIZE);

      // Not enough signal
      if (rms < sensitivity) return null;

      let lastCorrelation = 1;
      for (let offset = 0; offset < MAX_SAMPLES; offset++) {
        let correlation = 0;

        for (let i = 0; i < MAX_SAMPLES; i++) {
          correlation += Math.abs(buffer[i] - buffer[i + offset]);
        }

        correlation = 1 - correlation / MAX_SAMPLES;

        if (correlation > 0.9 && correlation > lastCorrelation) {
          if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
          }
        }
        lastCorrelation = correlation;
      }

      if (bestCorrelation > 0.01 && bestOffset > 0) {
        // Quadratic interpolation for better accuracy
        const shift =
          (buffer[bestOffset + 1] - buffer[bestOffset - 1]) /
          (2 * (2 * buffer[bestOffset] - buffer[bestOffset - 1] - buffer[bestOffset + 1]));
        return sampleRate / (bestOffset + (shift || 0));
      }
      return null;
    },
    [sensitivity]
  );

  // Main analysis loop
  const analyze = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);

    const pitch = detectPitch(buffer, audioContextRef.current.sampleRate);

    if (pitch && pitch > 20 && pitch < 5000) {
      setTunerState(frequencyToNote(pitch));
    }

    rafIdRef.current = requestAnimationFrame(analyze);
  }, [detectPitch, frequencyToNote]);

  // Start listening
  const startListening = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsListening(true);
      analyze();
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use the tuner.');
      console.error('Failed to access microphone:', err);
    }
  };

  // Stop listening
  const stopListening = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);
    setTunerState(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Calculate needle position (-50 to 50 degrees)
  const needleRotation = tunerState ? Math.max(-50, Math.min(50, tunerState.cents)) : 0;

  // Get color based on tuning accuracy
  const getTuningColor = (cents: number) => {
    const absCents = Math.abs(cents);
    if (absCents <= 5) return '#22c55e'; // Green - in tune
    if (absCents <= 15) return '#eab308'; // Yellow - close
    return '#ef4444'; // Red - out of tune
  };

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Chromatic Tuner</h3>
            <p className="text-sm text-muted-foreground">A4 = {referenceFreq}Hz</p>
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
            <div className="space-y-4 rounded-xl bg-white/5 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Reference Frequency (A4)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="432"
                    max="446"
                    value={referenceFreq}
                    onChange={(e) => setReferenceFreq(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-mono text-sm">{referenceFreq} Hz</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>432 Hz (Verdi)</span>
                  <span>440 Hz (Standard)</span>
                  <span>446 Hz</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Sensitivity</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.001"
                    max="0.05"
                    step="0.001"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-mono text-sm">
                    {(sensitivity * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      {/* Tuner Display */}
      <div className="relative mx-auto mb-6 aspect-[2/1] max-w-md">
        {/* Tuner Arc Background */}
        <svg viewBox="0 0 200 100" className="h-full w-full">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="tunerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#eab308" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="65%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Arc background */}
          <path
            d="M 10 90 A 90 90 0 0 1 190 90"
            fill="none"
            stroke="url(#tunerGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Center marker */}
          <line x1="100" y1="10" x2="100" y2="25" stroke="#22c55e" strokeWidth="3" />

          {/* Minor tick marks */}
          {[-40, -30, -20, -10, 10, 20, 30, 40].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const x1 = 100 + 75 * Math.cos(rad);
            const y1 = 90 + 75 * Math.sin(rad);
            const x2 = 100 + 85 * Math.cos(rad);
            const y2 = 90 + 85 * Math.sin(rad);
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--muted)"
                strokeWidth="1"
              />
            );
          })}

          {/* Cent labels */}
          <text x="20" y="80" fill="var(--muted)" fontSize="8" textAnchor="middle">
            -50
          </text>
          <text x="100" y="20" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">
            0
          </text>
          <text x="180" y="80" fill="var(--muted)" fontSize="8" textAnchor="middle">
            +50
          </text>

          {/* Needle */}
          <motion.g
            animate={{ rotate: needleRotation }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            style={{ transformOrigin: '100px 90px' }}
          >
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="20"
              stroke={tunerState ? getTuningColor(tunerState.cents) : 'var(--muted)'}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="90"
              r="6"
              fill={tunerState ? getTuningColor(tunerState.cents) : 'var(--muted)'}
            />
          </motion.g>
        </svg>
      </div>

      {/* Note Display */}
      <div className="mb-6 text-center">
        {tunerState ? (
          <motion.div
            key={tunerState.note + tunerState.octave}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-baseline justify-center gap-1">
              <span
                className="font-display text-7xl font-black"
                style={{ color: getTuningColor(tunerState.cents) }}
              >
                {tunerState.note}
              </span>
              <span className="text-2xl font-bold text-muted-foreground">{tunerState.octave}</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="font-mono text-muted-foreground">
                {tunerState.frequency.toFixed(1)} Hz
              </span>
              <span
                className="font-mono font-bold"
                style={{ color: getTuningColor(tunerState.cents) }}
              >
                {tunerState.cents > 0 ? '+' : ''}
                {tunerState.cents} cents
              </span>
            </div>
            {tunerState.isInTune && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1 text-emerald-400"
              >
                <span className="text-sm font-medium">In Tune!</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <span className="font-display text-7xl font-black text-muted-foreground/30">—</span>
            <p className="text-sm text-muted-foreground">
              {isListening ? 'Play a note...' : 'Click Start to begin tuning'}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={isListening ? stopListening : startListening}
          className={`gap-2 rounded-full px-8 py-6 text-lg font-bold transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5" />
              Stop
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              Start Tuning
            </>
          )}
        </Button>
      </div>

      {/* Quick Reference */}
      <div className="mt-6 rounded-xl bg-white/5 p-4">
        <h4 className="mb-3 text-sm font-semibold">Standard Guitar Tuning</h4>
        <div className="grid grid-cols-6 gap-2">
          {['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map((note, i) => (
            <div key={note} className="rounded-lg bg-white/5 p-2 text-center">
              <div className="text-xs text-muted-foreground">String {6 - i}</div>
              <div className="font-mono font-bold">{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
