'use client';

/**
 * Voice Room Component
 *
 * Discord-style always-on voice chat
 * Perfect for music collaboration while working
 *
 * Features:
 * - Join/leave voice rooms
 * - Audio-only (no video overhead)
 * - Participant list with speaking indicators
 * - Mute/unmute toggle
 * - Push-to-talk mode (optional)
 * - Audio level visualization
 */

import { Button } from '@cronkwaters/ui';
import { DailyProvider } from '@daily-co/daily-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Users, Volume2, VolumeX, Settings } from 'lucide-react';
import { useState } from 'react';

import { useVoiceRoom } from '@/hooks/use-voice-room';

interface VoiceRoomProps {
  roomName: string;
  projectName: string;
  userName: string;
  userAvatar?: string;
  pushToTalk?: boolean;
  className?: string;
}

export function VoiceRoom({
  roomName,
  projectName,
  userName,
  userAvatar,
  pushToTalk = false,
  className = '',
}: VoiceRoomProps) {
  const [showSettings, setShowSettings] = useState(false);

  const {
    isJoined,
    isConnecting,
    error,
    participants,
    isMuted,
    isPushToTalkActive,
    joinRoom,
    leaveRoom,
    toggleMute,
    startTalking,
    stopTalking,
  } = useVoiceRoom({
    roomName,
    userName,
    enableVideo: false,
    pushToTalk,
  });

  if (!isJoined) {
    return (
      <div className={`rounded-lg border border-border bg-surface p-6 ${className}`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Voice Room</h3>
            <p className="text-sm text-muted-foreground">{projectName}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
            <Volume2 className="h-5 w-5 text-brand-primary" />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <p className="mb-4 text-sm text-muted-foreground">
          Join the voice room to collaborate in real-time while working on the project. Your audio
          stays on in the background - just like Discord!
        </p>

        <Button onClick={joinRoom} disabled={isConnecting} className="w-full" size="lg">
          {isConnecting ? 'Connecting...' : 'Join Voice Room'}
        </Button>

        {pushToTalk && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Press and hold <kbd className="rounded bg-surface-muted px-2 py-1">Space</kbd> to talk
          </p>
        )}
      </div>
    );
  }

  return (
    <DailyProvider>
      <div className={`rounded-lg border border-border bg-surface ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Voice Room
            </h3>
            <p className="text-sm text-muted-foreground">
              {participants.length} {participants.length === 1 ? 'person' : 'people'}
            </p>
          </div>
          <Button onClick={() => setShowSettings(!showSettings)} variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Participants List */}
        <div className="max-h-[400px] space-y-2 overflow-y-auto p-4">
          <AnimatePresence>
            {participants.map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 rounded-lg border border-border p-3 transition ${
                  participant.isSpeaking
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'bg-surface-muted'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-foreground">
                    {userAvatar && participant.id === 'local' ? (
                      <img
                        src={userAvatar}
                        alt={participant.userName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      participant.userName[0].toUpperCase()
                    )}
                  </div>

                  {/* Speaking indicator */}
                  {participant.isSpeaking && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500"
                    >
                      <Volume2 className="h-2.5 w-2.5 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Name and status */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {participant.userName}
                      {participant.id === 'local' && ' (You)'}
                    </span>
                  </div>

                  {/* Audio level bar */}
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <motion.div
                      className="h-full rounded-full bg-brand-primary"
                      style={{
                        width: `${participant.audioLevel * 100}%`,
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                {/* Mute indicator */}
                {!participant.audioEnabled && (
                  <div className="flex-shrink-0">
                    <MicOff className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            {/* Mute/Unmute or Push-to-Talk */}
            {pushToTalk ? (
              <Button
                onMouseDown={startTalking}
                onMouseUp={stopTalking}
                onTouchStart={startTalking}
                onTouchEnd={stopTalking}
                variant={isPushToTalkActive ? 'default' : 'secondary'}
                size="lg"
                className="flex-1"
              >
                {isPushToTalkActive ? (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Talking...</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span>Hold to Talk</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={toggleMute}
                variant={isMuted ? 'secondary' : 'default'}
                size="lg"
                className="flex-1"
              >
                {isMuted ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span>Unmute</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Mute</span>
                  </>
                )}
              </Button>
            )}

            {/* Leave button */}
            <Button onClick={leaveRoom} variant="secondary" size="lg">
              <PhoneOff className="h-5 w-5" />
              <span>Leave</span>
            </Button>
          </div>

          {pushToTalk && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Press and hold <kbd className="rounded bg-surface-muted px-2 py-1">Space</kbd> or the
              button to talk
            </p>
          )}
        </div>
      </div>
    </DailyProvider>
  );
}
