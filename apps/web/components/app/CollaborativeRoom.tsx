'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  useDaily,
  useLocalParticipant,
  useScreenShare,
  DailyProvider,
} from '@daily-co/daily-react';
import DailyIframe from '@daily-co/daily-js';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Users } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';

interface CollaborativeRoomProps {
  roomUrl: string;
  roomName: string;
  userName: string;
}

function RoomContent({ roomUrl, roomName, userName }: CollaborativeRoomProps) {
  const callObject = useDaily();
  const localParticipant = useLocalParticipant();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();
  const [participants, setParticipants] = useState<Record<string, any>>({});

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Join room on mount
  useEffect(() => {
    if (!callObject) return;

    const joinRoom = async () => {
      try {
        setIsJoining(true);
        setError(null);

        await callObject.join({
          url: roomUrl,
          userName,
        });

        setIsJoining(false);
      } catch (err) {
        console.error('Failed to join room:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to join room';

        // Provide helpful message if Daily.co API key is missing
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          setError(
            'Video collaboration is not configured. Please contact support or check DAILY_API_KEY.'
          );
        } else {
          setError(errorMessage);
        }
        setIsJoining(false);
      }
    };

    joinRoom();

    // Track participants
    const updateParticipants = () => {
      const currentParticipants = callObject.participants();
      setParticipants(currentParticipants || {});
    };

    callObject.on('participant-joined', updateParticipants);
    callObject.on('participant-left', updateParticipants);
    callObject.on('participant-updated', updateParticipants);
    updateParticipants();

    return () => {
      callObject.off('participant-joined', updateParticipants);
      callObject.off('participant-left', updateParticipants);
      callObject.off('participant-updated', updateParticipants);
      callObject.leave();
    };
  }, [callObject, roomUrl, userName]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!callObject) return;
    const newState = !isVideoEnabled;
    callObject.setLocalVideo(newState);
    setIsVideoEnabled(newState);
  }, [callObject, isVideoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!callObject) return;
    const newState = !isAudioEnabled;
    callObject.setLocalAudio(newState);
    setIsAudioEnabled(newState);
  }, [callObject, isAudioEnabled]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (isSharingScreen) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Failed to toggle screen share');
    }
  }, [isSharingScreen, startScreenShare, stopScreenShare]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (callObject) {
      callObject.leave();
    }
  }, [callObject]);

  if (error) {
    return (
      <div className="border-danger/60 bg-danger/10 flex min-h-[400px] items-center justify-center rounded-2xl border p-8">
        <div className="text-center">
          <p className="text-danger-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Reload
          </Button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-surface p-8">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground">Joining {roomName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-4">
      {/* Room Header */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <Users className="text-primary h-5 w-5" />
          <div>
            <h3 className="font-semibold text-foreground">{roomName}</h3>
            <p className="text-sm text-muted-foreground">
              {Object.keys(participants).length}{' '}
              {Object.keys(participants).length === 1 ? 'participant' : 'participants'}
            </p>
          </div>
        </div>
        <Button onClick={leaveRoom} variant="outline" size="sm">
          Leave Room
        </Button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {Object.values(participants).map((participant) => (
            <motion.div
              key={participant.session_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-surface/50"
            >
              {participant.video ? (
                <video
                  ref={(el) => {
                    if (el && participant.videoTrack) {
                      el.srcObject = new MediaStream([participant.videoTrack]);
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={participant.local}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="from-primary/20 to-primary/5 flex h-full w-full items-center justify-center bg-gradient-to-br">
                  <div className="bg-primary/20 text-primary flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold">
                    {participant.user_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-sm font-medium text-white">
                  {participant.user_name || 'Guest'}
                </span>
                {!participant.audio && <MicOff className="h-3 w-3 text-white/80" />}
                {participant.local && <span className="text-xs text-white/60">(You)</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-4">
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? 'solid' : 'outline'}
          size="lg"
          className="gap-2"
        >
          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          {isVideoEnabled ? 'Camera On' : 'Camera Off'}
        </Button>

        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? 'solid' : 'outline'}
          size="lg"
          className="gap-2"
        >
          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          {isAudioEnabled ? 'Mic On' : 'Mic Off'}
        </Button>

        <Button
          onClick={toggleScreenShare}
          variant={isSharingScreen ? 'solid' : 'outline'}
          size="lg"
          className="gap-2"
        >
          {isSharingScreen ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          {isSharingScreen ? 'Stop Sharing' : 'Share Screen'}
        </Button>
      </div>
    </div>
  );
}

export default function CollaborativeRoom({ roomUrl, roomName, userName }: CollaborativeRoomProps) {
  const [callObject, setCallObject] = useState<typeof DailyIframe | null>(null);

  useEffect(() => {
    const daily = DailyIframe.createCallObject({
      // Configure options here
    });
    setCallObject(daily);

    return () => {
      daily.destroy();
    };
  }, []);

  if (!callObject) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-surface p-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <RoomContent roomUrl={roomUrl} roomName={roomName} userName={userName} />
    </DailyProvider>
  );
}
