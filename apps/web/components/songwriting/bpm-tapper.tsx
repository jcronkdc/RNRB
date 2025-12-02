'use client';

import { motion } from 'framer-motion';
import { MousePointer2, RotateCcw, Check } from '@/components/ui/custom-icons';
import { useState, useCallback, useRef, useEffect } from 'react';

type BpmTapperProps = {
  onBpmDetected: (bpm: number) => void;
  currentBpm?: number;
  className?: string;
};

export function BpmTapper({ onBpmDetected, currentBpm, className = '' }: BpmTapperProps) {
  const [taps, setTaps] = useState<number[]>([]);
  const [detectedBpm, setDetectedBpm] = useState<number | null>(null);
  const [isTapping, setIsTapping] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate BPM from tap intervals
  const calculateBpm = useCallback((tapTimes: number[]) => {
    if (tapTimes.length < 2) return null;

    // Calculate intervals between taps
    const intervals: number[] = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }

    // Average interval in ms
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Convert to BPM
    const bpm = Math.round(60000 / avgInterval);

    // Clamp to reasonable range
    return Math.min(Math.max(bpm, 20), 300);
  }, []);

  // Handle tap
  const handleTap = useCallback(() => {
    const now = Date.now();

    // Clear timeout for resetting
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If it's been more than 2 seconds since last tap, reset
    const lastTap = taps[taps.length - 1];
    if (lastTap && now - lastTap > 2000) {
      setTaps([now]);
      setTapCount(1);
      setDetectedBpm(null);
    } else {
      const newTaps = [...taps, now].slice(-8); // Keep last 8 taps
      setTaps(newTaps);
      setTapCount(newTaps.length);

      // Calculate BPM after at least 3 taps
      if (newTaps.length >= 3) {
        const bpm = calculateBpm(newTaps);
        if (bpm) {
          setDetectedBpm(bpm);
        }
      }
    }

    setIsTapping(true);

    // Reset tapping state after 2 seconds of no taps
    timeoutRef.current = setTimeout(() => {
      setIsTapping(false);
    }, 2000);
  }, [taps, calculateBpm]);

  // Handle key press for tapping (spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  // Reset
  const handleReset = () => {
    setTaps([]);
    setDetectedBpm(null);
    setTapCount(0);
    setIsTapping(false);
  };

  // Apply detected BPM
  const handleApply = () => {
    if (detectedBpm) {
      onBpmDetected(detectedBpm);
    }
  };

  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          Tap Tempo
        </span>
        {currentBpm && (
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Current: {currentBpm} BPM
          </span>
        )}
      </div>

      {/* Tap Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleTap}
        className="relative mb-4 flex h-24 w-full items-center justify-center rounded-xl transition"
        style={{
          background: isTapping
            ? 'linear-gradient(135deg, rgba(255, 99, 71, 0.3), rgba(255, 215, 0, 0.2))'
            : 'var(--background)',
          border: `2px solid ${isTapping ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        <div className="text-center">
          <motion.div
            animate={isTapping ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            <MousePointer2
              className="mx-auto mb-2 h-8 w-8"
              style={{ color: isTapping ? 'var(--accent)' : 'var(--muted)' }}
            />
          </motion.div>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Tap or press Space
          </span>
        </div>

        {/* Tap ripple effect */}
        {isTapping && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ background: 'var(--accent)' }}
          />
        )}
      </motion.button>

      {/* Stats */}
      <div className="mb-4 flex items-center justify-center gap-6">
        <div className="text-center">
          <p
            className="text-2xl font-bold"
            style={{ color: detectedBpm ? 'var(--accent)' : 'var(--muted)' }}
          >
            {detectedBpm || '---'}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            BPM
          </p>
        </div>
        <div className="h-8 w-px" style={{ background: 'var(--border)' }} />
        <div className="text-center">
          <p
            className="text-2xl font-bold"
            style={{ color: tapCount >= 3 ? 'var(--text)' : 'var(--muted)' }}
          >
            {tapCount}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Taps
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
          <span>Accuracy</span>
          <span>{Math.min(tapCount, 8)}/8 taps</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ background: 'var(--background)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent)' }}
            animate={{ width: `${(Math.min(tapCount, 8) / 8) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition"
          style={{ background: 'var(--background)', color: 'var(--text)' }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button
          onClick={handleApply}
          disabled={!detectedBpm}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-white transition disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          <Check className="h-4 w-4" />
          Apply
        </button>
      </div>

      {/* Hint */}
      <p className="mt-3 text-center text-xs" style={{ color: 'var(--muted)' }}>
        Tap along to the beat of your song. More taps = better accuracy.
      </p>
    </div>
  );
}
