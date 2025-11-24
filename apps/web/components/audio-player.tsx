'use client';

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  trackId: string;
  audioUrl: string;
  title: string;
  artist: string;
  coverUrl?: string;
  waveformData?: number[];
  duration: number;
  onPlayComplete?: () => void;
  onPlayStart?: () => void;
}

export function AudioPlayer({
  trackId,
  audioUrl,
  title,
  artist,
  coverUrl,
  waveformData,
  duration,
  onPlayComplete,
  onPlayStart,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number>(0);

  // Generate waveform if not provided
  const waveform = waveformData || Array.from({ length: 100 }, () => Math.random() * 0.6 + 0.4);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);

      // Record play duration
      if (playStartTime > 0) {
        const playDuration = Math.floor((Date.now() - playStartTime) / 1000);
        // Send play event to API
        await fetch(`/api/community/tracks/${trackId}/play`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: playDuration,
            completed: false,
          }),
        });
      }
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
      setPlayStartTime(Date.now());
      onPlayStart?.();
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.volume = newMuted ? 0 : volume;
  };

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      setCurrentTime(0);

      // Record completed play
      if (playStartTime > 0) {
        await fetch(`/api/community/tracks/${trackId}/play`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: duration,
            completed: true,
          }),
        });
      }

      onPlayComplete?.();

      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
        setPlayStartTime(Date.now());
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [trackId, duration, isRepeat, playStartTime, onPlayComplete]);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="border-border bg-surface rounded-xl border p-6">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Track Info */}
      <div className="mb-6 flex items-center gap-4">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <div className="bg-surface-hover flex h-16 w-16 items-center justify-center rounded-lg">
            <Play className="text-foreground-muted h-8 w-8" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground truncate font-semibold">{title}</h3>
          <p className="text-foreground-muted truncate text-sm">{artist}</p>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-4">
        <div className="relative flex h-16 items-end gap-0.5">
          {waveform.map((height, i) => {
            const barProgress = (i / waveform.length) * 100;
            const isPassed = barProgress <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all duration-200 ${
                  isPassed ? 'bg-brand-primary' : 'bg-surface-hover'
                }`}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>

        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="mt-4 w-full"
        />

        {/* Time Display */}
        <div className="text-foreground-muted mt-2 flex justify-between text-xs">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Shuffle (placeholder) */}
          <button
            className="btn-icon hover:bg-surface-hover h-8 w-8"
            title="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          {/* Previous Track (placeholder) */}
          <button
            className="btn-icon hover:bg-surface-hover h-8 w-8"
            title="Previous"
          >
            <SkipBack className="h-4 w-4" />
          </button>
        </div>

        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          className="bg-brand-primary text-background flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2">
          {/* Next Track (placeholder) */}
          <button
            className="btn-icon hover:bg-surface-hover h-8 w-8"
            title="Next"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          {/* Repeat */}
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`btn-icon hover:bg-surface-hover h-8 w-8 ${
              isRepeat ? 'text-brand-primary' : ''
            }`}
            title="Repeat"
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Volume Control */}
      <div className="mt-4 flex items-center gap-3">
        <button onClick={toggleMute} className="btn-icon hover:bg-surface-hover h-8 w-8">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1"
        />
      </div>
    </div>
  );
}


