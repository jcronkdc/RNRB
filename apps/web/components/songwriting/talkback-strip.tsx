'use client';

/**
 * Talkback Strip — "The Room"
 *
 * A warm, subtle presence bar at the bottom of the song editor.
 * When someone else is in the same song, the strip gently appears.
 *
 * Design:
 * - Audio-first: voice is the default, video is the upgrade
 * - No "Join" button: you're in the room when the song is open
 * - Muted by default (like walking in quietly)
 * - One tap to unmute (like saying "hey")
 * - Soft pulse on collaborator dots when they speak
 * - Feels like a studio talkback mic, not a video call
 *
 * Implementation:
 * - Uses Daily.co for audio (via /api/songs/:id/session)
 * - Auto-joins when collaborators are present
 * - Renders as a fixed bar at the bottom of the editor
 */

import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, PhoneOff } from '@/components/ui/custom-icons';
import { useState, useEffect, useCallback, useRef } from 'react';

interface TalkbackParticipant {
  userId: string;
  userName: string;
  userColor: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isLocal: boolean;
}

interface TalkbackStripProps {
  /** Song ID — used to create/join the audio room */
  songId: string;
  /** Current user info */
  userId: string;
  userName: string;
  userColor: string;
  /** Collaborators currently in the song (from Yjs awareness) */
  collaborators: Array<{ userId: string; userName: string; userColor: string }>;
  /** Whether the strip should be visible */
  visible?: boolean;
}

export function TalkbackStrip({
  songId,
  userId,
  userName,
  userColor,
  collaborators,
  visible = true,
}: TalkbackStripProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted — walk in quietly
  const [participants, setParticipants] = useState<TalkbackParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const callObjectRef = useRef<any>(null);
  const hasJoinedRef = useRef(false);

  // Build the participant list from collaborators + local user
  const allPeople = [
    {
      userId,
      userName: 'You',
      userColor,
      isSpeaking: false,
      isMuted,
      isLocal: true,
    },
    ...collaborators.map((c) => {
      const participant = participants.find((p) => p.userId === c.userId);
      return {
        userId: c.userId,
        userName: c.userName,
        userColor: c.userColor,
        isSpeaking: participant?.isSpeaking || false,
        isMuted: participant?.isMuted || false,
        isLocal: false,
      };
    }),
  ];

  // Show the strip when there are collaborators (not just self)
  const shouldShow = visible && collaborators.length > 0;

  // Join the audio room when collaborators appear
  useEffect(() => {
    if (!shouldShow || hasJoinedRef.current) return;

    const joinRoom = async () => {
      try {
        // Get room URL and token from our song session API
        const response = await fetch(`/api/songs/${songId}/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Could not start audio');
          return;
        }

        const { roomUrl, token } = await response.json();

        // Dynamically import Daily to avoid SSR issues
        const DailyIframe = (await import('@daily-co/daily-js')).default;

        const callObject = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: false, // Audio-only by default
          dailyConfig: {
            experimentalChromeVideoMuteLightOff: true,
          } as any,
        });

        callObjectRef.current = callObject;

        // Listen for participant events
        callObject.on('participant-joined', () => updateParticipants(callObject));
        callObject.on('participant-left', () => updateParticipants(callObject));
        callObject.on('participant-updated', () => updateParticipants(callObject));

        // Join the room
        await callObject.join({ url: roomUrl, token, startVideoOff: true });
        // Start muted
        await callObject.setLocalAudio(false);

        hasJoinedRef.current = true;
        setIsConnected(true);
        updateParticipants(callObject);
      } catch (err) {
        console.error('[Talkback] Failed to join:', err);
        setError('Audio unavailable');
      }
    };

    joinRoom();

    return () => {
      // Clean up on unmount
      if (callObjectRef.current) {
        callObjectRef.current.leave().catch(() => {});
        callObjectRef.current.destroy().catch(() => {});
        callObjectRef.current = null;
        hasJoinedRef.current = false;
      }
    };
  }, [shouldShow, songId]);

  // Update participant list from Daily call state
  const updateParticipants = useCallback((callObject: any) => {
    if (!callObject) return;

    const dailyParticipants = callObject.participants();
    const updated: TalkbackParticipant[] = [];

    for (const [id, p] of Object.entries(dailyParticipants) as [string, any][]) {
      if (id === 'local') continue;

      updated.push({
        userId: p.user_id || id,
        userName: p.user_name || 'Songwriter',
        userColor: '#6B7280', // Default — will be overridden by awareness color
        isSpeaking: false, // TODO: wire to audio track activity
        isMuted: !p.audio,
        isLocal: false,
      });
    }

    setParticipants(updated);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!callObjectRef.current) return;

    const newMuted = !isMuted;
    try {
      await callObjectRef.current.setLocalAudio(!newMuted);
      setIsMuted(newMuted);
    } catch (err) {
      console.error('[Talkback] Failed to toggle mute:', err);
    }
  }, [isMuted]);

  // Leave the room
  const leaveRoom = useCallback(async () => {
    if (!callObjectRef.current) return;

    try {
      await callObjectRef.current.leave();
      await callObjectRef.current.destroy();
      callObjectRef.current = null;
      hasJoinedRef.current = false;
      setIsConnected(false);
      setParticipants([]);
    } catch (err) {
      console.error('[Talkback] Failed to leave:', err);
    }
  }, []);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed right-0 bottom-0 left-0 z-40 lg:left-[240px]"
          style={{
            background: 'var(--panel)',
            borderTop: '1px solid var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="flex h-14 items-center justify-between px-4">
            {/* Participants */}
            <div className="flex items-center gap-3">
              {allPeople.map((person) => (
                <div key={person.userId} className="flex items-center gap-2">
                  {/* Voice indicator dot */}
                  <div className="relative">
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: person.userColor }}
                      animate={
                        person.isSpeaking
                          ? { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }
                          : { scale: 1, opacity: person.isMuted ? 0.5 : 0.85 }
                      }
                      transition={
                        person.isSpeaking
                          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.3 }
                      }
                    >
                      {person.userName.charAt(0).toUpperCase()}
                    </motion.div>

                    {/* Mute indicator */}
                    {person.isMuted && (
                      <div
                        className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                        style={{ background: 'var(--panel)', border: '1.5px solid var(--border)' }}
                      >
                        <MicOff className="h-2 w-2" style={{ color: 'var(--muted)' }} />
                      </div>
                    )}
                  </div>

                  {/* Name — only show on larger screens */}
                  <span
                    className="hidden text-xs font-medium sm:block"
                    style={{ color: person.isMuted ? 'var(--muted)' : 'var(--text-secondary)' }}
                  >
                    {person.userName}
                  </span>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Mute/unmute toggle */}
              <button
                onClick={toggleMute}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
                style={{
                  background: isMuted ? 'var(--surface)' : 'var(--accent)',
                  color: isMuted ? 'var(--muted)' : 'white',
                }}
                title={isMuted ? 'Unmute (say hey)' : 'Mute'}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Leave button — subtle */}
              {isConnected && (
                <button
                  onClick={leaveRoom}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-red-500/10"
                  style={{ color: 'var(--muted)' }}
                  title="Leave the room"
                >
                  <PhoneOff className="h-4 w-4" />
                </button>
              )}

              {/* Error indicator */}
              {error && (
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {error}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
