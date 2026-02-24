/**
 * Synchronized Playback Hook
 *
 * Everyone hears the audio at the same timestamp.
 * Like Netflix Party but for music production.
 *
 * Features:
 * - Play/pause sync across all users
 * - Seek position broadcast
 * - Latency compensation
 * - Host control mode (optional)
 */

import type { Message } from 'ably';
import { useChannel, useConnectionStateListener } from 'ably/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type PlaybackState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
};

export type PlaybackCommand = {
  type: 'play' | 'pause' | 'seek' | 'rate';
  timestamp: number; // Server timestamp for sync
  position?: number; // For seek
  rate?: number; // For playback rate
  userId: string;
  userName: string;
};

export type PlaybackUser = {
  userId: string;
  userName: string;
  isHost: boolean;
  currentTime: number;
  lastUpdate: number;
};

type UseSynchronizedPlaybackOptions = {
  channelName: string;
  userId: string;
  userName: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isHost?: boolean; // Only host can control playback
  enabled?: boolean;
};

export function useSynchronizedPlayback({
  channelName,
  userId,
  userName,
  audioRef,
  isHost = false,
  enabled = true,
}: UseSynchronizedPlaybackOptions) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
  });
  const [connectedUsers, setConnectedUsers] = useState<Map<string, PlaybackUser>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastCommandRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor connection state
  useConnectionStateListener((stateChange) => {
    setIsConnected(stateChange.current === 'connected');
    if (stateChange.current === 'failed') {
      setError('Connection failed');
    } else if (stateChange.current === 'connected') {
      setError(null);
    }
  });

  // Channel for playback commands
  const { publish: publishCommand } = useChannel(
    channelName,
    'playback-command',
    (message: Message) => {
      if (!enabled) return;
      const command = message.data as PlaybackCommand;
      if (command.userId === userId) return; // Skip own commands

      const audio = audioRef.current;
      if (!audio) return;

      // Apply command with latency compensation
      const latency = Date.now() - command.timestamp;
      const compensatedPosition =
        command.position !== undefined
          ? command.position + (command.type === 'play' ? latency / 1000 : 0)
          : undefined;

      switch (command.type) {
        case 'play':
          if (compensatedPosition !== undefined) {
            audio.currentTime = compensatedPosition;
          }
          audio.play().catch(console.error);
          setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
          break;
        case 'pause':
          audio.pause();
          if (command.position !== undefined) {
            audio.currentTime = command.position;
          }
          setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
          break;
        case 'seek':
          if (command.position !== undefined) {
            audio.currentTime = command.position;
          }
          break;
        case 'rate':
          if (command.rate !== undefined) {
            audio.playbackRate = command.rate;
            setPlaybackState((prev) => ({ ...prev, playbackRate: command.rate! }));
          }
          break;
      }

      lastCommandRef.current = command.timestamp;
    }
  );

  // Channel for position sync (periodic updates)
  const { publish: publishPosition } = useChannel(
    channelName,
    'position-sync',
    (message: Message) => {
      if (!enabled) return;
      const user = message.data as PlaybackUser;

      setConnectedUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(user.userId, user);
        return newMap;
      });

      // If this user is the host, update host ID
      if (user.isHost && user.userId !== userId) {
        setHostId(user.userId);
      }
    }
  );

  // Broadcast a playback command
  const broadcastCommand = useCallback(
    (type: PlaybackCommand['type'], position?: number, rate?: number) => {
      if (!publishCommand || !enabled) return;

      // In host mode, only the host can send commands
      if (hostId && hostId !== userId && !isHost) {
        return;
      }

      const command: PlaybackCommand = {
        type,
        timestamp: Date.now(),
        position,
        rate,
        userId,
        userName,
      };

      publishCommand({ name: 'playback-command', data: command });
    },
    [userId, userName, hostId, isHost, enabled, publishCommand]
  );

  // Play command
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play().catch(console.error);
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
    broadcastCommand('play', audio.currentTime);
  }, [audioRef, broadcastCommand]);

  // Pause command
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    broadcastCommand('pause', audio.currentTime);
  }, [audioRef, broadcastCommand]);

  // Seek command
  const seek = useCallback(
    (position: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = position;
      setPlaybackState((prev) => ({ ...prev, currentTime: position }));
      broadcastCommand('seek', position);
    },
    [audioRef, broadcastCommand]
  );

  // Set playback rate
  const setPlaybackRate = useCallback(
    (rate: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.playbackRate = rate;
      setPlaybackState((prev) => ({ ...prev, playbackRate: rate }));
      broadcastCommand('rate', undefined, rate);
    },
    [audioRef, broadcastCommand]
  );

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (playbackState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playbackState.isPlaying, play, pause]);

  // Periodic position sync
  useEffect(() => {
    if (!enabled || !publishPosition) return;

    syncIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const user: PlaybackUser = {
        userId,
        userName,
        isHost,
        currentTime: audio.currentTime,
        lastUpdate: Date.now(),
      };

      publishPosition({ name: 'position-sync', data: user });

      // Update local state
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    }, 1000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [userId, userName, isHost, enabled, audioRef, publishPosition]);

  // Clean up stale users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setConnectedUsers((prev) => {
        const newMap = new Map(prev);
        for (const [key, user] of newMap) {
          if (now - user.lastUpdate > 5000) {
            newMap.delete(key);
          }
        }
        return newMap;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleLoadedMetadata = () => {
      setPlaybackState((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    const handleEnded = () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef]);

  return {
    playbackState,
    connectedUsers: Array.from(connectedUsers.values()),
    isConnected,
    error,
    isHost,
    hostId,
    play,
    pause,
    seek,
    toggle,
    setPlaybackRate,
  };
}
