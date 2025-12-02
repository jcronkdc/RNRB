'use client';

import MuxPlayer from '@mux/mux-player-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Wifi,
  WifiOff,
  Users,
  Eye,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronUp,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface VideoPlayerProps {
  playbackId: string;
  streamId?: string;
  title?: string;
  isLive?: boolean;
  viewerCount?: number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  posterTime?: number;
  onViewerCountChange?: (count: number) => void;
  onPlaybackStateChange?: (state: 'playing' | 'paused' | 'buffering' | 'ended') => void;
  className?: string;
}

const QUALITY_OPTIONS = [
  { value: 'auto', label: 'Auto', description: 'Best quality for your connection' },
  { value: '2160p', label: '4K', description: '2160p' },
  { value: '1440p', label: '1440p', description: 'QHD' },
  { value: '1080p', label: '1080p', description: 'Full HD' },
  { value: '720p', label: '720p', description: 'HD' },
  { value: '480p', label: '480p', description: 'SD' },
  { value: '360p', label: '360p', description: 'Low' },
] as const;

type QualityValue = (typeof QUALITY_OPTIONS)[number]['value'];

export function VideoPlayer({
  playbackId,
  streamId,
  title,
  isLive = false,
  viewerCount = 0,
  autoPlay = true,
  muted = false,
  loop = false,
  posterTime = 0,
  onViewerCountChange,
  onPlaybackStateChange,
  className = '',
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<QualityValue>('auto');
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !showQualityMenu) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showQualityMenu]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Handle quality change
  const handleQualityChange = useCallback((quality: QualityValue) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);

    // Mux Player handles quality automatically, but we can force a specific resolution
    // This would require additional implementation with the player's API
  }, []);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Connection quality indicator color
  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'good':
        return 'text-green-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
    }
  };

  if (!playbackId) {
    return (
      <div
        className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-black/90 ${className}`}
      >
        <div className="text-center text-white/60">
          <WifiOff className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>Stream not available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`group relative aspect-video overflow-hidden rounded-2xl bg-black ${className}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => !showQualityMenu && setShowControls(false)}
    >
      {/* Mux Player */}
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        streamType={isLive ? 'live' : 'on-demand'}
        autoPlay={autoPlay ? 'muted' : false}
        muted={isMuted}
        loop={loop}
        preload="auto"
        startTime={posterTime}
        thumbnailTime={posterTime}
        primaryColor="#06B6D4"
        secondaryColor="#FFFFFF"
        accentColor="#8B5CF6"
        title={title}
        metadata={{
          video_id: streamId,
          video_title: title,
          viewer_user_id:
            typeof window !== 'undefined'
              ? localStorage.getItem('userId') || 'anonymous'
              : 'anonymous',
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlay={() => {
          setIsPlaying(true);
          onPlaybackStateChange?.('playing');
        }}
        onPause={() => {
          setIsPlaying(false);
          onPlaybackStateChange?.('paused');
        }}
        onWaiting={() => {
          setIsBuffering(true);
          onPlaybackStateChange?.('buffering');
        }}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => onPlaybackStateChange?.('ended')}
        onTimeUpdate={(e: any) => setCurrentTime(e.target.currentTime || 0)}
        onDurationChange={(e: any) => setDuration(e.target.duration || 0)}
        onError={(e: any) => {
          console.error('Player error:', e);
          setError('Failed to load video. Please try again.');
        }}
        style={
          {
            width: '100%',
            height: '100%',
            '--controls': showControls ? 'visible' : 'hidden',
          } as any
        }
        className="absolute inset-0"
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {(isLoading || isBuffering) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
          >
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-cyan-400" />
              <p className="mt-3 text-sm text-white/70">
                {isLoading ? 'Loading stream...' : 'Buffering...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80"
          >
            <div className="p-6 text-center">
              <WifiOff className="mx-auto mb-3 h-12 w-12 text-red-400" />
              <p className="mb-4 text-white">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  playerRef.current?.play();
                }}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-white transition-colors hover:bg-cyan-600"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Badge + Viewer Count */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-4 top-4 z-10 flex items-center gap-3"
          >
            {isLive && (
              <div className="flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1.5 backdrop-blur-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                <span className="text-sm font-semibold text-white">LIVE</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              <Eye className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white">{viewerCount.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quality + Settings Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-4 top-4 z-10 flex items-center gap-2"
          >
            {/* Connection Quality Indicator */}
            <div
              className={`flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur-sm ${getConnectionColor()}`}
            >
              <Wifi className="h-4 w-4" />
              <span className="text-xs capitalize">{connectionQuality}</span>
            </div>

            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">
                  {selectedQuality === 'auto' ? 'Auto' : selectedQuality}
                </span>
                <ChevronUp
                  className={`h-3 w-3 transition-transform ${showQualityMenu ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showQualityMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-xl backdrop-blur-xl"
                  >
                    <div className="p-2">
                      <p className="px-3 py-1.5 text-xs uppercase tracking-wider text-white/50">
                        Quality
                      </p>
                      {QUALITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleQualityChange(option.value)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                            selectedQuality === option.value
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-white/50">{option.description}</span>
                          </div>
                          {selectedQuality === option.value && (
                            <div className="h-2 w-2 rounded-full bg-cyan-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar (for VOD) */}
      {!isLive && duration > 0 && showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4"
        >
          <div className="flex items-center gap-3 text-sm text-white">
            <span>{formatTime(currentTime)}</span>
            <div className="h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default VideoPlayer;
