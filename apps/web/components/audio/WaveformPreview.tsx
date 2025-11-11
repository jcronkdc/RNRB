'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@songforge/ui';

interface WaveformPreviewProps {
  audioUrl: string;
  onLUFS?: (lufs: number) => void;
}

export function WaveformPreview({ audioUrl, onLUFS }: WaveformPreviewProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [lufs, setLufs] = useState<number | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(139, 92, 246)',
      progressColor: 'rgb(99, 102, 241)',
      cursorColor: 'rgb(99, 102, 241)',
      barWidth: 2,
      barRadius: 3,
      responsive: true,
      height: 100,
      normalize: true,
    });

    wavesurfer.load(audioUrl);

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      // Calculate LUFS (simplified - in production use loudness.js or similar)
      calculateLUFS(wavesurfer);
    });
    wavesurfer.on('timeupdate', (time) => setCurrentTime(time));

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const calculateLUFS = async (wavesurfer: WaveSurfer) => {
    // Simplified LUFS calculation
    // In production, use a proper loudness meter library
    const peaks = wavesurfer.getDecodedData();
    if (!peaks) return;

    let sum = 0;
    let count = 0;
    const channelData = peaks.getChannelData(0);

    for (let i = 0; i < channelData.length; i += 1000) {
      const rms = Math.sqrt(
        channelData.slice(i, i + 1000).reduce((acc, val) => acc + val * val, 0) / 1000
      );
      const db = 20 * Math.log10(rms + 0.0001);
      sum += db;
      count++;
    }

    const avgDb = sum / count;
    // Approximate LUFS (LUFS ≈ dB - 23)
    const estimatedLUFS = avgDb - 23;
    setLufs(estimatedLUFS);
    if (onLUFS) {
      onLUFS(estimatedLUFS);
    }
  };

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-surface/80 p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={togglePlay} size="icon">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        {lufs !== null && (
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {lufs.toFixed(1)} LUFS
            </span>
          </div>
        )}
      </div>
      <div ref={waveformRef} className="w-full" />
    </div>
  );
}




