'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  MoreVertical
} from 'lucide-react';
import Image from 'next/image';

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
  const waveformData = currentTrack?.waveformData || 
    Array.from({ length: 100 }, () => Math.random() * 0.5 + 0.5);
  
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
      className="
        fixed bottom-0 left-0 right-0 h-[72px] 
        bg-surface border-t border-border z-40
        flex items-center px-4 gap-4
      "
    >
      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0 w-64">
        {currentTrack.coverUrl ? (
          <Image
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            width={48}
            height={48}
            className="rounded-md"
          />
        ) : (
          <div className="w-12 h-12 bg-surface-hover rounded-md flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-foreground-muted" />
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-medium truncate">{currentTrack.title}</h4>
          <p className="text-xs text-foreground-muted truncate">
            {currentTrack.artist || 'Unknown Artist'}
          </p>
        </div>
        <button className="btn-icon w-8 h-8 flex-shrink-0">
          <Heart className="w-4 h-4" />
        </button>
      </div>
      
      {/* Main Controls & Waveform */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <button 
            className={`btn-icon w-8 h-8 ${isShuffle ? 'text-brand-primary' : ''}`}
            onClick={() => setIsShuffle(!isShuffle)}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button className="btn-icon w-8 h-8">
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button 
            className="btn-icon w-10 h-10 bg-brand-primary hover:bg-brand-primary/90 text-background"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button className="btn-icon w-8 h-8">
            <SkipForward className="w-4 h-4" />
          </button>
          
          <button 
            className={`btn-icon w-8 h-8 ${isRepeat ? 'text-brand-primary' : ''}`}
            onClick={() => setIsRepeat(!isRepeat)}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        {/* Waveform & Time */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted w-10 text-right">
            {formatTime(currentTime)}
          </span>
          
          {/* Waveform Visualization */}
          <div 
            ref={waveformRef}
            className="flex-1 h-8 relative cursor-pointer group"
            onClick={handleWaveformClick}
          >
            <div className="absolute inset-0 flex items-end gap-0.5">
              {waveformData.map((height, i) => {
                const isPassed = (i / waveformData.length) * 100 <= progress;
                return (
                  <div
                    key={i}
                    className={`
                      flex-1 rounded-t transition-all duration-200
                      ${isPassed 
                        ? 'bg-brand-primary' 
                        : 'bg-surface-hover group-hover:bg-border'
                      }
                    `}
                    style={{ height: `${height * 100}%` }}
                  />
                );
              })}
            </div>
            
            {/* Progress indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground"
              style={{ left: `${progress}%` }}
            />
          </div>
          
          <span className="text-xs text-foreground-muted w-10">
            {formatTime(currentTrack.duration)}
          </span>
        </div>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <button 
            className="btn-icon w-8 h-8"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          
          <div className="w-20 h-1 bg-surface-hover rounded-full relative group">
            <div 
              className="absolute inset-y-0 left-0 bg-foreground rounded-full"
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
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        
        {/* Queue */}
        <button 
          className={`btn-icon w-8 h-8 ${showQueue ? 'text-brand-primary' : ''}`}
          onClick={() => setShowQueue(!showQueue)}
        >
          <List className="w-4 h-4" />
        </button>
        
        {/* Actions */}
        <button className="btn-icon w-8 h-8">
          <Download className="w-4 h-4" />
        </button>
        
        <button className="btn-icon w-8 h-8">
          <Share2 className="w-4 h-4" />
        </button>
        
        <button className="btn-icon w-8 h-8">
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {/* Minimize */}
        <button className="btn-icon w-8 h-8">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
