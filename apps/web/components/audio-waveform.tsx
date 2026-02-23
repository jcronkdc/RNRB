'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from '@/components/ui/custom-icons';

interface AudioWaveformProps {
  url: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  height?: number;
  barWidth?: number;
  barGap?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

export function AudioWaveform({
  url,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onSeek,
  height = 60,
  barWidth = 3,
  barGap = 2,
  primaryColor = '#f97316',
  secondaryColor = '#374151',
  className = '',
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate waveform data from audio
  useEffect(() => {
    const generateWaveform = async () => {
      setLoading(true);
      setError(false);

      try {
        const audioContext = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )();

        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get channel data
        const channelData = audioBuffer.getChannelData(0);

        // Calculate number of bars based on container width
        const containerWidth = containerRef.current?.clientWidth || 300;
        const numBars = Math.floor(containerWidth / (barWidth + barGap));

        // Sample the audio data
        const blockSize = Math.floor(channelData.length / numBars);
        const samples: number[] = [];

        for (let i = 0; i < numBars; i++) {
          const start = i * blockSize;
          let sum = 0;

          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[start + j] || 0);
          }

          // Normalize to 0-1
          const avg = sum / blockSize;
          samples.push(Math.min(1, avg * 2)); // Amplify a bit for visibility
        }

        setWaveformData(samples);
        audioContext.close();
      } catch (err) {
        console.error('Failed to generate waveform:', err);
        setError(true);
        // Generate fake waveform as fallback
        generateFakeWaveform();
      } finally {
        setLoading(false);
      }
    };

    const generateFakeWaveform = () => {
      const containerWidth = containerRef.current?.clientWidth || 300;
      const numBars = Math.floor(containerWidth / (barWidth + barGap));
      const samples: number[] = [];

      for (let i = 0; i < numBars; i++) {
        // Generate more natural-looking fake waveform
        const progress = i / numBars;
        const base = 0.3 + Math.sin(progress * Math.PI * 2) * 0.2;
        const noise = Math.random() * 0.3;
        samples.push(Math.min(1, base + noise));
      }

      setWaveformData(samples);
    };

    generateWaveform();
  }, [url, barWidth, barGap]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const progressPercent = duration > 0 ? currentTime / duration : 0;
    const progressBars = Math.floor(waveformData.length * progressPercent);

    // Draw bars
    waveformData.forEach((amplitude, i) => {
      const x = i * (barWidth + barGap);
      const barHeight = Math.max(4, amplitude * height);
      const y = (height - barHeight) / 2;

      ctx.fillStyle = i < progressBars ? primaryColor : secondaryColor;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
      ctx.fill();
    });
  }, [waveformData, currentTime, duration, height, barWidth, barGap, primaryColor, secondaryColor]);

  // Handle click/seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onSeek || !duration) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const newTime = percent * duration;

      onSeek(Math.max(0, Math.min(duration, newTime)));
    },
    [onSeek, duration]
  );

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height }}>
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-pointer"
        style={{ height }}
        onClick={handleClick}
      />

      {/* Playing animation overlay */}
      {isPlaying && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-orange-500"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentTime / duration) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      )}
    </div>
  );
}

/**
 * Mini waveform for list views
 */
export function MiniWaveform({
  url,
  isPlaying = false,
  className = '',
}: {
  url: string;
  isPlaying?: boolean;
  className?: string;
}) {
  return (
    <AudioWaveform
      url={url}
      isPlaying={isPlaying}
      height={24}
      barWidth={2}
      barGap={1}
      className={className}
    />
  );
}

/**
 * Static waveform bars (no audio analysis, just visual)
 */
export function StaticWaveform({
  bars = 20,
  isPlaying = false,
  height = 24,
  className = '',
}: {
  bars?: number;
  isPlaying?: boolean;
  height?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.random() * 0.6 + 0.4; // 40-100% height

        return (
          <motion.div
            key={i}
            className="w-0.5 rounded-full bg-gray-600"
            style={{ height: `${h * 100}%` }}
            animate={
              isPlaying
                ? {
                    scaleY: [1, 0.5 + Math.random() * 0.5, 1],
                    backgroundColor: ['#f97316', '#fb923c', '#f97316'],
                  }
                : {}
            }
            transition={{
              duration: 0.3 + Math.random() * 0.2,
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        );
      })}
    </div>
  );
}
