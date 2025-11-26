/**
 * Voice Room Hook
 *
 * Discord-style voice rooms for always-on audio collaboration
 * Uses Daily.co for WebRTC infrastructure
 *
 * Features:
 * - Create/join voice rooms
 * - Audio-only mode (no video overhead)
 * - Push-to-talk (optional)
 * - Participant list with audio levels
 * - Room persistence
 * - Spatial audio (optional)
 */

import { useDaily, useParticipantIds, useLocalParticipant, useAudioTrack } from '@daily-co/daily-react';
import { useState, useCallback, useEffect, useRef } from 'react';

interface VoiceRoomConfig {
  roomName: string;
  userName: string;
  enableVideo?: boolean;
  pushToTalk?: boolean;
  spatialAudio?: boolean;
}

interface Participant {
  id: string;
  userName: string;
  audioEnabled: boolean;
  audioLevel: number; // 0-1
  isSpeaking: boolean;
}

export function useVoiceRoom(config: VoiceRoomConfig) {
  const callObject = useDaily();
  const participantIds = useParticipantIds({ filter: 'remote' });
  const localParticipant = useLocalParticipant();

  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map());

  // Initialize audio analysis
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create or join voice room
  const joinRoom = useCallback(async () => {
    if (!callObject) {
      setError('Daily.co not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Get or create room
      const response = await fetch('/api/rooms/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: config.roomName,
          maxParticipants: 32,
          enableVideo: config.enableVideo || false,
          spatialAudio: config.spatialAudio || false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/join room');
      }

      const { roomUrl } = await response.json();

      // Join the Daily.co room
      await callObject.join({
        url: roomUrl,
        userName: config.userName,
        videoSource: false, // Audio only
        audioSource: true,
      });

      // Disable video track
      await callObject.setLocalVideo(false);

      // Start muted if push-to-talk
      if (config.pushToTalk) {
        await callObject.setLocalAudio(false);
        setIsMuted(true);
      }

      setIsJoined(true);
    } catch (err) {
      console.error('Error joining voice room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsConnecting(false);
    }
  }, [callObject, config]);

  // Leave voice room
  const leaveRoom = useCallback(async () => {
    if (!callObject || !isJoined) return;

    try {
      await callObject.leave();
      setIsJoined(false);
      setParticipants([]);
    } catch (err) {
      console.error('Error leaving room:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave room');
    }
  }, [callObject, isJoined]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!callObject) return;

    const newMuted = !isMuted;
    await callObject.setLocalAudio(!newMuted);
    setIsMuted(newMuted);
  }, [callObject, isMuted]);

  // Push-to-talk handlers
  const startTalking = useCallback(async () => {
    if (!callObject || !config.pushToTalk) return;

    await callObject.setLocalAudio(true);
    setIsPushToTalkActive(true);
    setIsMuted(false);
  }, [callObject, config.pushToTalk]);

  const stopTalking = useCallback(async () => {
    if (!callObject || !config.pushToTalk) return;

    await callObject.setLocalAudio(false);
    setIsPushToTalkActive(false);
    setIsMuted(true);
  }, [callObject, config.pushToTalk]);

  // Monitor audio levels for all participants
  useEffect(() => {
    if (!callObject || !isJoined) return;

    const interval = setInterval(() => {
      const remoteParticipants = callObject.participants();
      const participantList: Participant[] = [];

      Object.entries(remoteParticipants).forEach(([id, participant]) => {
        if (id === 'local') return;

        participantList.push({
          id,
          userName: participant.user_name || 'Unknown',
          audioEnabled: !!participant.audio,
          audioLevel: participant.audioLevel || 0,
          isSpeaking: (participant.audioLevel || 0) > 0.1,
        });
      });

      // Add local participant
      if (localParticipant) {
        participantList.unshift({
          id: 'local',
          userName: config.userName,
          audioEnabled: !isMuted,
          audioLevel: localParticipant.audioLevel || 0,
          isSpeaking: (localParticipant.audioLevel || 0) > 0.1,
        });
      }

      setParticipants(participantList);
    }, 100); // Update 10 times per second

    return () => clearInterval(interval);
  }, [callObject, isJoined, localParticipant, isMuted, config.userName]);

  // Keyboard shortcuts for push-to-talk
  useEffect(() => {
    if (!config.pushToTalk) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        startTalking();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        stopTalking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [config.pushToTalk, startTalking, stopTalking]);

  return {
    isJoined,
    isConnecting,
    error,
    participants,
    isMuted,
    isPushToTalkActive,
    joinRoom,
    leaveRoom,
    toggleMute,
    startTalking, // For push-to-talk
    stopTalking, // For push-to-talk
  };
}





