'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

/**
 * Audio Player Component
 * Play instrumental while editing lyrics
 * Sync to song structure
 */

interface AudioPlayerProps {
  audioUrl: string;
  filename: string;
  onRemove?: () => void;
}

export default function AudioPlayer({ audioUrl, filename, onRemove }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rnrb-card p-6 bg-gradient-to-br from-brand-primary/5 to-transparent border-brand-primary/20">
      <audio ref={audioRef} src={audioUrl} />

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-sm truncate flex-1">{filename}</p>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-muted-foreground hover:text-red-500 transition-colors ml-2"
              title="Remove audio"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Instrumental Track • {formatTime(duration)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, hsl(var(--rnrb-gold)) 0%, hsl(var(--rnrb-gold)) ${(currentTime / duration) * 100}%, hsl(var(--rnrb-steel)) ${(currentTime / duration) * 100}%, hsl(var(--rnrb-steel)) 100%)`
          }}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={skipBackward}
            className="p-2 hover:bg-surface rounded transition-colors"
            title="Skip back 10s"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 bg-brand-primary text-brand-primary-foreground rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={skipForward}
            className="p-2 hover:bg-surface rounded transition-colors"
            title="Skip forward 10s"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-surface rounded transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 h-1 bg-surface rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
