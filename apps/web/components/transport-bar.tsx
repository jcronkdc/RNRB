'use client';

import { motion } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  List,
  ChevronUp,
  Download,
  Share2,
  Heart,
  MoreVertical,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import { useState, useRef } from 'react';

interface Track {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  coverUrl?: string;
  waveformData?: number[];
}

interface TransportBarProps {
  currentTrack?: Track | null;
  isVisible?: boolean;
}

export function TransportBar({ currentTrack, isVisible = true }: TransportBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const waveformRef = useRef<HTMLDivElement>(null);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate fake waveform if not provided
  const waveformData =
    currentTrack?.waveformData || Array.from({ length: 100 }, () => Math.random() * 0.5 + 0.5);

  const progress = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0;

  // Handle waveform click for seeking
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !currentTrack) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * currentTrack.duration;

    setCurrentTime(newTime);
  };

  if (!isVisible || !currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-center gap-4 border-t border-border bg-surface px-4"
    >
      {/* Track Info */}
      <div className="flex w-64 min-w-0 shrink-0 items-center gap-3">
        {currentTrack.coverUrl ? (
          <Image
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            width={48}
            height={48}
            className="rounded-md"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-hover">
            <Volume2 className="h-5 w-5 text-foreground-muted" />
          </div>
        )}
        <div className="min-w-0">
          <h4 className="truncate text-sm font-medium">{currentTrack.title}</h4>
          <p className="truncate text-xs text-foreground-muted">
            {currentTrack.artist || 'Unknown Artist'}
          </p>
        </div>
        <button className="btn-icon h-8 w-8 shrink-0">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Main Controls & Waveform */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            className={`btn-icon h-8 w-8 ${isShuffle ? 'text-brand-primary' : ''}`}
            onClick={() => setIsShuffle(!isShuffle)}
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <button className="btn-icon h-8 w-8">
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            className="btn-icon h-10 w-10 bg-brand-primary text-background hover:bg-brand-primary/90"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>

          <button className="btn-icon h-8 w-8">
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            className={`btn-icon h-8 w-8 ${isRepeat ? 'text-brand-primary' : ''}`}
            onClick={() => setIsRepeat(!isRepeat)}
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        {/* Waveform & Time */}
        <div className="flex items-center gap-2">
          <span className="w-10 text-right text-xs text-foreground-muted">
            {formatTime(currentTime)}
          </span>

          {/* Waveform Visualization */}
          <div
            ref={waveformRef}
            className="group relative h-8 flex-1 cursor-pointer"
            onClick={handleWaveformClick}
          >
            <div className="absolute inset-0 flex items-end gap-0.5">
              {waveformData.map((height, i) => {
                const isPassed = (i / waveformData.length) * 100 <= progress;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-200 ${
                      isPassed ? 'bg-brand-primary' : 'bg-surface-hover group-hover:bg-border'
                    } `}
                    style={{ height: `${height * 100}%` }}
                  />
                );
              })}
            </div>

            {/* Progress indicator */}
            <div
              className="absolute bottom-0 top-0 w-0.5 bg-foreground"
              style={{ left: `${progress}%` }}
            />
          </div>

          <span className="w-10 text-xs text-foreground-muted">
            {formatTime(currentTrack.duration)}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <button className="btn-icon h-8 w-8" onClick={() => setIsMuted(!isMuted)}>
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <div className="group relative h-1 w-20 rounded-full bg-surface-hover">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-foreground"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                setIsMuted(val === 0);
              }}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
          </div>
        </div>

        {/* Queue */}
        <button
          className={`btn-icon h-8 w-8 ${showQueue ? 'text-brand-primary' : ''}`}
          onClick={() => setShowQueue(!showQueue)}
        >
          <List className="h-4 w-4" />
        </button>

        {/* Actions */}
        <button className="btn-icon h-8 w-8">
          <Download className="h-4 w-4" />
        </button>

        <button className="btn-icon h-8 w-8">
          <Share2 className="h-4 w-4" />
        </button>

        <button className="btn-icon h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </button>

        {/* Minimize */}
        <button className="btn-icon h-8 w-8">
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
