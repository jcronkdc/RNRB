'use client';

import { useState } from 'react';
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
  Edit
} from 'lucide-react';
import Image from 'next/image';

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
  onExtend,
  onRemix,
  onDownload,
  isPlaying = false,
  progress = 0
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
  const waveform = waveformData || 
    Array.from({ length: 40 }, () => Math.random() * 0.6 + 0.4);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        relative group bg-surface rounded-lg border border-border
        hover:border-border-strong hover:shadow-lg
        transition-all duration-200
      "
    >
      {/* Album Art Section */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-surface-hover">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-16 h-16 text-foreground-muted opacity-50" />
          </div>
        )}
        
        {/* Play Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="
            absolute inset-0 bg-background/60 backdrop-blur-sm
            flex items-center justify-center
            pointer-events-none
          "
        >
          <button
            onClick={onPlay}
            className="
              pointer-events-auto
              w-16 h-16 rounded-full
              bg-brand-primary text-background
              flex items-center justify-center
              hover:scale-110 active:scale-100
              transition-transform duration-200
              shadow-xl
            "
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
        </motion.div>
        
        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          className="
            absolute top-3 right-3
            w-8 h-8 rounded-full
            bg-background/80 backdrop-blur-sm
            flex items-center justify-center
            hover:bg-background
            transition-all duration-200
          "
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              liked ? 'fill-brand-primary text-brand-primary' : 'text-foreground'
            }`}
          />
        </button>
        
        {/* Duration Badge */}
        <div className="
          absolute bottom-3 left-3
          px-2 py-1 rounded-md
          bg-background/80 backdrop-blur-sm
          text-xs font-medium
        ">
          {formatDuration(duration)}
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-4 space-y-3">
        {/* Title & Artist */}
        <div>
          <h3 className="font-medium text-foreground truncate">
            {title}
          </h3>
          <p className="text-sm text-foreground-muted truncate">
            {artist}
          </p>
        </div>
        
        {/* Mini Waveform */}
        <div className="relative h-8 flex items-end gap-0.5">
          {waveform.map((height, i) => {
            const isPassed = (i / waveform.length) * 100 <= progress;
            return (
              <div
                key={i}
                className={`
                  flex-1 rounded-t transition-all duration-200
                  ${isPlaying && isPassed 
                    ? 'bg-brand-primary' 
                    : 'bg-surface-hover'
                  }
                `}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>
        
        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {plays}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {createdAt}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExtend}
              className="btn-icon w-8 h-8 hover:bg-surface-hover"
              title="Extend"
            >
              <Wand2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={onRemix}
              className="btn-icon w-8 h-8 hover:bg-surface-hover"
              title="Get Stems"
            >
              <Layers className="w-4 h-4" />
            </button>
            
            <button
              onClick={onDownload}
              className="btn-icon w-8 h-8 hover:bg-surface-hover"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn-icon w-8 h-8 hover:bg-surface-hover"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="
                      absolute right-0 top-full mt-1 z-50
                      w-48 bg-surface rounded-lg border border-border
                      shadow-xl py-1
                    "
                  >
                    <button className="
                      w-full px-3 py-2 text-sm text-left
                      hover:bg-surface-hover transition-colors
                      flex items-center gap-2
                    ">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button className="
                      w-full px-3 py-2 text-sm text-left
                      hover:bg-surface-hover transition-colors
                      flex items-center gap-2
                    ">
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button className="
                      w-full px-3 py-2 text-sm text-left
                      hover:bg-surface-hover transition-colors
                      flex items-center gap-2
                    ">
                      <Edit className="w-4 h-4" />
                      Rename
                    </button>
                    <hr className="my-1 border-border" />
                    <button className="
                      w-full px-3 py-2 text-sm text-left
                      hover:bg-surface-hover transition-colors
                      flex items-center gap-2 text-error
                    ">
                      <Trash2 className="w-4 h-4" />
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
