'use client';

/**
 * Waveform Audio Player
 *
 * Professional audio player with visual waveform
 * Perfect for music collaboration - see the song structure visually
 *
 * Features:
 * - Waveform visualization
 * - Click to seek
 * - Play/pause, volume control
 * - Loop regions
 * - Download audio
 * - Share timestamp links
 */

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Repeat,
} from '@/components/ui/custom-icons';
import { useEffect, useRef, useState } from 'react';

type WaveformPlayerProps = {
  audioUrl: string;
  audioName: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
};

export function WaveformPlayer({ audioUrl, audioName, onTimeUpdate }: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [loading, setLoading] = useState(true);

  // Load and decode audio for waveform
  useEffect(() => {
    const loadAudio = async () => {
      try {
        setLoading(true);
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);

        setAudioBuffer(buffer);
        setLoading(false);
      } catch (err) {
        console.error('Error loading audio:', err);
        setLoading(false);
      }
    };

    loadAudio();
  }, [audioUrl]);

  // Draw waveform
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0); // Get first channel
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#FF6347';
    ctx.lineWidth = 2;

    for (let i = 0; i < width; i++) {
      const min = Math.min(...Array.from({ length: step }, (_, j) => data[i * step + j] || 0));
      const max = Math.max(...Array.from({ length: step }, (_, j) => data[i * step + j] || 0));

      if (i === 0) {
        ctx.moveTo(i, (1 + min) * amp);
      }
      ctx.lineTo(i, (1 + max) * amp);
      ctx.lineTo(i, (1 + min) * amp);
    }

    ctx.stroke();

    // Draw progress overlay
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressX = progress * width;

    ctx.fillStyle = 'rgba(255, 99, 71, 0.3)';
    ctx.fillRect(0, 0, progressX, height);

    // Draw playhead
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
  }, [audioBuffer, currentTime, duration]);

  // Audio event handlers
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
    onTimeUpdate?.(audio.currentTime, audio.duration);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setDuration(audio.duration);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audio.currentTime = percent * duration;
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = audioName;
    link.click();
  };

  const shareTimestamp = () => {
    const timestamp = Math.floor(currentTime);
    const url = `${window.location.href}?t=${timestamp}`;
    navigator.clipboard.writeText(url);
    // Could show a toast notification here
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Song Info */}
      <div className="flex items-center justify-between">
        <h4 className="text-foreground font-medium">{audioName}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadAudio}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={shareTimestamp}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title="Share current timestamp"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Waveform */}
      <div
        ref={containerRef}
        className="border-border bg-surface relative cursor-pointer overflow-hidden rounded-lg border"
        style={{ height: '120px' }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-brand-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={120}
            onClick={seek}
            className="h-full w-full"
          />
        )}

        {/* Time Display Overlay */}
        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 font-mono text-xs text-white">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => skip(-10)}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title="Skip back 10s"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={togglePlay}
            className="bg-brand-primary hover:bg-brand-primary/90 rounded-full p-3 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title="Skip forward 10s"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            onClick={toggleLoop}
            className={`rounded-lg p-2 transition-colors ${
              isLooping ? 'bg-brand-primary text-white' : 'hover:bg-muted'
            }`}
            title={isLooping ? 'Disable loop' : 'Enable loop'}
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Volume Control */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="hover:bg-muted rounded-lg p-2 transition-colors">
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
