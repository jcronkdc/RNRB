'use client';

/**
 * Voice Message Player Component
 *
 * Plays back voice messages in chat with waveform visualization
 * WhatsApp-style playback interface
 *
 * Features:
 * - Play/pause toggle
 * - Scrubbing through waveform
 * - Current time / total duration
 * - Playback speed control
 * - Download option
 */

import { Button } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import { Play, Pause, Download, Gauge } from '@/components/ui/custom-icons';
import { useState, useRef, useEffect } from 'react';

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
  waveformData: number[];
  userName?: string;
  timestamp?: Date;
  className?: string;
}

export function VoiceMessagePlayer({
  audioUrl,
  duration,
  waveformData,
  userName,
  timestamp,
  className = '',
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleWaveformClick = (index: number) => {
    if (audioRef.current && waveformData.length > 0) {
      const clickedTime = (index / waveformData.length) * duration;
      audioRef.current.currentTime = clickedTime;
    }
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voice-message-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className={`border-border bg-surface rounded-lg border p-3 ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} />

      {/* Voice message header */}
      {(userName || timestamp) && (
        <div className="mb-2 flex items-center justify-between">
          {userName && <span className="text-foreground text-sm font-medium">{userName}</span>}
          {timestamp && (
            <span className="text-muted-foreground text-xs">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {/* Player controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <Button onClick={togglePlayPause} variant="secondary" size="sm" className="shrink-0">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </Button>

        {/* Waveform with progress */}
        <div className="relative flex flex-1 items-center gap-0.5">
          {waveformData.map((amplitude, index) => {
            const barProgress = index / waveformData.length;
            const isPlayed = barProgress <= progress;

            return (
              <motion.button
                key={index}
                onClick={() => handleWaveformClick(index)}
                className={`w-1 rounded-full transition-colors ${
                  isPlayed ? 'bg-brand-primary' : 'bg-brand-primary/30'
                }`}
                style={{
                  height: `${Math.max(4, amplitude * 32)}px`,
                  opacity: isPlayed ? 1 : 0.4 + amplitude * 0.3,
                }}
                whileHover={{ opacity: 1 }}
                whileTap={{ scale: 1.1 }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className="text-muted-foreground shrink-0 font-mono text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Playback speed */}
        <Button
          onClick={cyclePlaybackSpeed}
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1"
          title="Playback speed"
        >
          <Gauge className="h-3 w-3" />
          <span className="text-xs">{playbackRate}x</span>
        </Button>

        {/* Download */}
        <Button
          onClick={handleDownload}
          variant="secondary"
          size="sm"
          className="shrink-0"
          title="Download"
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
