'use client';

/**
 * Synchronized Audio Player Component
 *
 * Everyone hears the audio at the same timestamp.
 * Like Netflix Party but for music production.
 */

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Users,
  Crown,
  Gauge,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';
import { useRef, useState, useEffect } from 'react';

import { useSynchronizedPlayback } from '@/hooks/use-synchronized-playback';

interface SynchronizedAudioPlayerProps {
  channelName: string;
  userId: string;
  userName: string;
  audioUrl: string;
  isHost?: boolean;
  title?: string;
  artist?: string;
  coverArt?: string;
}

export function SynchronizedAudioPlayer({
  channelName,
  userId,
  userName,
  audioUrl,
  isHost = false,
  title,
  artist,
  coverArt,
}: SynchronizedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const {
    playbackState,
    connectedUsers,
    isConnected,
    hostId,
    play,
    pause,
    seek,
    toggle,
    setPlaybackRate,
  } = useSynchronizedPlayback({
    channelName,
    userId,
    userName,
    audioRef,
    isHost,
  });

  const canControl = isHost || !hostId;
  const host = connectedUsers.find((u) => u.isHost);

  // Format time
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !canControl) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * playbackState.duration;
    seek(newTime);
  };

  // Handle volume change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Speed presets
  const speedPresets = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const progress =
    playbackState.duration > 0 ? (playbackState.currentTime / playbackState.duration) * 100 : 0;

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Cover Art */}
          {coverArt ? (
            <img src={coverArt} alt={title} className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl"
              style={{ background: 'var(--bg)' }}
            >
              <Volume2 className="h-8 w-8" style={{ color: 'var(--muted)' }} />
            </div>
          )}

          {/* Track Info */}
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              {title || 'Untitled Track'}
            </h3>
            {artist && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {artist}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              {isHost && (
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  <Crown className="h-3 w-3" />
                  Host
                </span>
              )}
              <span
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-zinc-500'}`}
              />
            </div>
          </div>
        </div>

        {/* Connected Users */}
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          <div className="flex -space-x-2">
            {connectedUsers.slice(0, 5).map((user) => (
              <div
                key={user.userId}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium"
                style={{
                  background: user.isHost ? 'var(--accent)' : 'var(--bg)',
                  borderColor: 'var(--panel)',
                  color: user.isHost ? 'white' : 'var(--text)',
                }}
                title={`${user.userName}${user.isHost ? ' (Host)' : ''}`}
              >
                {user.userName.charAt(0).toUpperCase()}
              </div>
            ))}
            {connectedUsers.length > 5 && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs"
                style={{ background: 'var(--bg)', borderColor: 'var(--panel)' }}
              >
                +{connectedUsers.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          ref={progressRef}
          className="relative h-2 cursor-pointer overflow-hidden rounded-full"
          style={{ background: 'var(--bg)' }}
          onClick={handleProgressClick}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent)' }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />

          {/* User position markers */}
          {connectedUsers
            .filter((u) => u.userId !== userId)
            .map((user) => {
              const userProgress =
                playbackState.duration > 0 ? (user.currentTime / playbackState.duration) * 100 : 0;
              return (
                <div
                  key={user.userId}
                  className="absolute top-0 h-full w-1 -translate-x-1/2"
                  style={{
                    left: `${userProgress}%`,
                    background: user.isHost ? 'var(--accent)' : 'var(--muted)',
                    opacity: 0.5,
                  }}
                  title={`${user.userName}: ${formatTime(user.currentTime)}`}
                />
              );
            })}
        </div>
        <div className="mt-1 flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
          <span>{formatTime(playbackState.currentTime)}</span>
          <span>{formatTime(playbackState.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Skip & Play Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => canControl && seek(Math.max(0, playbackState.currentTime - 10))}
            disabled={!canControl}
            title="Back 10s"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            onClick={() => canControl && toggle()}
            disabled={!canControl}
            className="h-12 w-12"
            style={{ background: 'var(--accent)' }}
          >
            {playbackState.isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              canControl && seek(Math.min(playbackState.duration, playbackState.currentTime + 10))
            }
            disabled={!canControl}
            title="Forward 10s"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Center: Playback Speed */}
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          <select
            value={playbackState.playbackRate}
            onChange={(e) => canControl && setPlaybackRate(parseFloat(e.target.value))}
            disabled={!canControl}
            className="rounded-lg bg-transparent px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: 'var(--text)' }}
          >
            {speedPresets.map((speed) => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2"
            style={{ color: 'var(--muted)' }}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      {/* Host Control Notice */}
      {hostId && hostId !== userId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl p-3 text-center text-sm"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <Crown className="mr-2 inline-block h-4 w-4" />
          {host?.userName || 'Host'} is controlling playback
        </motion.div>
      )}

      {/* Sync Status */}
      <div
        className="mt-4 flex items-center justify-center gap-4 rounded-xl p-3 text-xs"
        style={{ background: 'var(--bg)' }}
      >
        {connectedUsers.map((user) => (
          <div key={user.userId} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background:
                  Math.abs(user.currentTime - playbackState.currentTime) < 1
                    ? 'var(--success)'
                    : 'var(--warning)',
              }}
            />
            <span style={{ color: 'var(--muted)' }}>
              {user.userName}: {formatTime(user.currentTime)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
