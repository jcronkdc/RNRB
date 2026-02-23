'use client';

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Loader2,
} from '@/components/ui/custom-icons';
import { useRef, useState, useEffect, useCallback, memo } from 'react';

export type AudioPlayerProps = {
  src: string;
  name: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  autoPlay?: boolean;
  className?: string;
};

export const AudioPlayer = memo(
  ({ src, name, onEnded, onPlay, onPause, autoPlay = false, className = '' }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Format time display
    const formatTime = (time: number): string => {
      if (isNaN(time)) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle play/pause
    const togglePlay = useCallback(async () => {
      if (!audioRef.current) return;

      try {
        if (isPlaying) {
          await audioRef.current.pause();
          setIsPlaying(false);
          onPause?.();
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
          onPlay?.();
        }
      } catch (err) {
        console.error('Playback error:', err);
        setError('Failed to play audio');
      }
    }, [isPlaying, onPlay, onPause]);

    // Handle seek
    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }, []);

    // Handle volume change
    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      const newVolume = parseFloat(e.target.value);
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }, []);

    // Toggle mute
    const toggleMute = useCallback(() => {
      if (!audioRef.current) return;
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }, [isMuted, volume]);

    // Skip forward/backward
    const skip = useCallback(
      (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(
          0,
          Math.min(duration, audioRef.current.currentTime + seconds)
        );
      },
      [duration]
    );

    // Audio event listeners
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onEnded?.();
      };

      const handleError = () => {
        setError('Failed to load audio file');
        setIsLoading(false);
      };

      const handleCanPlay = () => {
        setIsLoading(false);
      };

      const handleWaiting = () => {
        setIsLoading(true);
      };

      const handlePlaying = () => {
        setIsLoading(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('playing', handlePlaying);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
      };
    }, [onEnded]);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return; // Don't trigger shortcuts when typing
        }

        switch (e.key) {
          case ' ':
            e.preventDefault();
            togglePlay();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            skip(-5);
            break;
          case 'ArrowRight':
            e.preventDefault();
            skip(5);
            break;
          case 'm':
          case 'M':
            e.preventDefault();
            toggleMute();
            break;
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [togglePlay, skip, toggleMute]);

    // Progress percentage
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (error) {
      return (
        <div className={`rounded-lg border border-red-500/30 bg-red-500/10 p-4 ${className}`}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      );
    }

    return (
      <div className={`rounded-lg border border-gray-800 bg-gray-900 p-4 ${className}`}>
        <audio ref={audioRef} src={src} preload="metadata" autoPlay={autoPlay} />

        {/* Track Info */}
        <div className="mb-3">
          <h4 className="truncate text-sm font-medium text-white">{name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="group mb-4">
          <div className="relative h-2 w-full cursor-pointer rounded-full bg-gray-800">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-10)}
              disabled={isLoading}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
              title="Skip back 10s"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="rounded-lg bg-orange-500 p-2.5 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              disabled={isLoading}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
              title="Skip forward 10s"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <div className="hidden sm:block">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-gray-800 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-3 border-t border-gray-800 pt-3">
          <p className="text-xs text-gray-500">
            <span className="font-mono">Space</span> Play/Pause •{' '}
            <span className="font-mono">←/→</span> Skip 5s • <span className="font-mono">M</span>{' '}
            Mute
          </p>
        </div>
      </div>
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';
