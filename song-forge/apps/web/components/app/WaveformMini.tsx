'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface WaveformMiniProps {
  file: File;
}

const TARGET_SAMPLES = 200;
const MAX_SECONDS = 30;
const CANVAS_HEIGHT = 80;

const resolveColor = (token: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return value ? `hsl(${value})` : fallback;
};

export default function WaveformMini({ file }: WaveformMiniProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    let cancelled = false;
    const decode = async () => {
      if (!file.type.startsWith('audio/')) {
        setError('Preview unavailable for this file type.');
        return;
      }
      let context: AudioContext | null = null;
      try {
        setError(null);
        setPeaks(null);
        interface WebkitWindow extends Window {
          webkitAudioContext?: typeof AudioContext;
        }
        const AudioCtor = (window.AudioContext || (window as WebkitWindow).webkitAudioContext) as
          | (new () => AudioContext)
          | undefined;
        if (!AudioCtor) {
          throw new Error('AudioContext not supported');
        }
        context = new AudioCtor();
        const buffer = await file.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(buffer.slice(0));
        if (cancelled) {
          await context.close();
          return;
        }
        setDuration(audioBuffer.duration);
        const sampleRate = audioBuffer.sampleRate;
        const totalSamples = audioBuffer.length;
        const sliceSamples = Math.min(totalSamples, Math.floor(sampleRate * MAX_SECONDS));
        const step = Math.max(1, Math.floor(sliceSamples / TARGET_SAMPLES));
        const channels = Math.max(1, audioBuffer.numberOfChannels);
        const peakValues: number[] = [];
        for (let i = 0; i < TARGET_SAMPLES; i++) {
          const start = i * step;
          if (start >= sliceSamples) break;
          const end = Math.min(start + step, sliceSamples);
          let max = 0;
          for (let channel = 0; channel < channels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let sample = start; sample < end; sample++) {
              const value = Math.abs(channelData[sample]);
              if (value > max) max = value;
            }
          }
          peakValues.push(max);
        }
        const maxPeak = peakValues.reduce((acc, val) => (val > acc ? val : acc), 0) || 1;
        setPeaks(peakValues.map((value) => value / maxPeak));
        await context.close();
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('Unable to decode audio preview.');
        }
        if (context) {
          context.close();
        }
      }
    };

    decode();
    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    if (!peaks || peaks.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.parentElement?.clientWidth ?? 600;
    canvas.width = cssWidth * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = '100%';
    canvas.style.height = `${CANVAS_HEIGHT}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, CANVAS_HEIGHT);

    const bg = resolveColor('--sf-color-surface', 'hsl(240 10% 4%)');
    const fg = resolveColor('--sf-color-brand-primary', 'hsl(252 89% 62%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cssWidth, CANVAS_HEIGHT);
    ctx.fillStyle = fg;

    const barWidth = cssWidth / peaks.length;
    const baseline = CANVAS_HEIGHT / 2;
    const minBarHeight = 2;

    peaks.forEach((peak, index) => {
      const height = Math.max(minBarHeight, peak * CANVAS_HEIGHT);
      const x = index * barWidth;
      const y = baseline - height / 2;
      ctx.fillRect(x, y, barWidth * 0.85, height);
    });
  }, [peaks]);

  const durationLabel = useMemo(() => {
    if (!duration || Number.isNaN(duration)) return 'Unknown length';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [duration]);

  if (error) {
    return <p className="rounded-xl border border-border/60 bg-surface/80 px-4 py-3 text-sm text-muted-foreground">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/40 p-4">
      {peaks ? (
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl"
          role="img"
          aria-label={`${file.name} waveform preview (${durationLabel})`}
        />
      ) : (
        <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground">
          Decoding audio preview…
        </div>
      )}
      {audioUrl ? (
        <audio
          controls
          src={audioUrl}
          className="w-full"
          aria-label={`Audio preview for ${file.name}`}
        >
          <track kind="captions" />
        </audio>
      ) : null}
      <p className="text-xs text-muted-foreground">Preview length: {durationLabel}</p>
    </div>
  );
}
