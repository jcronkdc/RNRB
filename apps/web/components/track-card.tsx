'use client';

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Download,
  MoreVertical,
  Wand2,
  Layers,
  Share2,
  Heart,
  Clock,
  Music2,
  Copy,
  Trash2,
  Edit,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface TrackCardProps {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  coverUrl?: string;
  waveformData?: number[];
  createdAt: string;
  plays?: number;
  isLiked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onExtend?: () => void;
  onRemix?: () => void;
  onDownload?: () => void;
  isPlaying?: boolean;
  progress?: number; // 0-100
}

export function TrackCard({
  id,
  title,
  artist = 'AI Generated',
  duration,
  coverUrl,
  waveformData,
  createdAt,
  plays = 0,
  isLiked = false,
  onPlay,
  onLike,
  onExtend,
  onRemix,
  onDownload,
  isPlaying = false,
  progress = 0,
}: TrackCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(isLiked);

  // Format duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate fake waveform if not provided
  const waveform = waveformData || Array.from({ length: 40 }, () => Math.random() * 0.6 + 0.4);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-lg border border-border bg-surface transition-all duration-200 hover:border-border-strong hover:shadow-lg"
    >
      {/* Album Art Section */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-surface-hover">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2 className="h-16 w-16 text-foreground-muted opacity-50" />
          </div>
        )}

        {/* Play Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <button
            onClick={onPlay}
            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-background shadow-xl transition-transform duration-200 hover:scale-110 active:scale-100"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
          </button>
        </motion.div>

        {/* Like Button */}
        <button
          onClick={() => {
            setLiked(!liked);
            onLike?.();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? 'fill-brand-primary text-brand-primary' : 'text-foreground'
            }`}
          />
        </button>

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 rounded-md bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-3 p-4">
        {/* Title & Artist */}
        <div>
          <h3 className="truncate font-medium text-foreground">{title}</h3>
          <p className="truncate text-sm text-foreground-muted">{artist}</p>
        </div>

        {/* Mini Waveform */}
        <div className="relative flex h-8 items-end gap-0.5">
          {waveform.map((height, i) => {
            const isPassed = (i / waveform.length) * 100 <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all duration-200 ${
                  isPlaying && isPassed ? 'bg-brand-primary' : 'bg-surface-hover'
                } `}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {plays}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {createdAt}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExtend}
              className="btn-icon h-8 w-8 hover:bg-surface-hover"
              title="Extend"
            >
              <Wand2 className="h-4 w-4" />
            </button>

            <button
              onClick={onRemix}
              className="btn-icon h-8 w-8 hover:bg-surface-hover"
              title="Get Stems"
            >
              <Layers className="h-4 w-4" />
            </button>

            <button
              onClick={onDownload}
              className="btn-icon h-8 w-8 hover:bg-surface-hover"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn-icon h-8 w-8 hover:bg-surface-hover"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-xl"
                  >
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover">
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover">
                      <Edit className="h-4 w-4" />
                      Rename
                    </button>
                    <hr className="my-1 border-border" />
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error transition-colors hover:bg-surface-hover">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
