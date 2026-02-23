'use client';

import { Card, Button } from '@cronkwaters/ui';
import {
  useDaily,
  useLocalParticipant,
  useParticipantIds,
  useRecording,
  useScreenShare,
  useLiveStreaming,
  DailyVideo,
  DailyAudio,
} from '@daily-co/daily-react';
import { motion } from 'motion/react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  MonitorX,
  Radio,
  X,
  Disc,
  Square,
  Users,
  PhoneOff,
} from '@/components/ui/custom-icons';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';

interface StudioSessionProps {
  roomUrl: string;
  token?: string;
  onRecordingComplete?: (recordingId: string) => void;
}

export function StudioSession({ roomUrl, token, onRecordingComplete }: StudioSessionProps) {
  const callObject = useDaily();
  const localParticipant = useLocalParticipant();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const { isRecording, startRecording, stopRecording, error: recordingError } = useRecording();
  const { isSharingScreen, startScreenShare, stopScreenShare, screens } = useScreenShare();
  const {
    isLiveStreaming,
    startLiveStreaming,
    stopLiveStreaming,
    updateLiveStreaming,
    errorMsg: streamingError,
  } = useLiveStreaming();

  const [isJoining, setIsJoining] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [streamingUrl, setStreamingUrl] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Use ref to track if we've already attempted to join
  const hasJoinedRef = useRef(false);

  // Listen for recording events to capture recording ID
  useEffect(() => {
    if (!callObject || !onRecordingComplete) return;

    const handleRecordingEvent = (event: any) => {
      console.log('Recording event received:', event);

      // Daily.co may provide recording ID in different formats
      // Check multiple possible locations for the recording ID
      const recordingId = event?.recordingId || event?.id || event?.recording?.id;

      if (recordingId) {
        console.log('Recording stopped, ID:', recordingId);
        onRecordingComplete(recordingId);
      } else {
        console.warn('Recording stopped but no ID found in event:', event);
      }
    };

    // Subscribe to recording events
    // Daily.co fires this when a recording stops
    callObject.on('recording-stopped', handleRecordingEvent);

    return () => {
      callObject.off('recording-stopped', handleRecordingEvent);
    };
  }, [callObject, onRecordingComplete]);

  // Join the call
  const joinCall = useCallback(async () => {
    if (!callObject || !roomUrl || hasJoinedRef.current) return;

    setIsJoining(true);
    setCallError(null);
    hasJoinedRef.current = true;

    try {
      await callObject.join({
        url: roomUrl,
        token,
        userName: 'Studio User', // You can make this dynamic
      });
    } catch (error) {
      console.error('Failed to join call:', error);
      setCallError('Failed to join the studio session');
      hasJoinedRef.current = false; // Allow retry on error
    } finally {
      setIsJoining(false);
    }
  }, [callObject, roomUrl, token]);

  // Leave the call - Memoized
  const leaveCall = useCallback(async () => {
    if (!callObject) return;

    try {
      await callObject.leave();
      hasJoinedRef.current = false; // Reset join state
    } catch (error) {
      console.error('Failed to leave call:', error);
    }
  }, [callObject]);

  // Toggle video - Optimized to prevent re-renders
  const toggleVideo = useCallback(async () => {
    if (!callObject) return;

    const newState = !isVideoEnabled;
    try {
      await callObject.setLocalVideo(newState);
      setIsVideoEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  }, [callObject, isVideoEnabled]);

  // Toggle audio - Optimized to prevent re-renders
  const toggleAudio = useCallback(async () => {
    if (!callObject) return;

    const newState = !isAudioEnabled;
    try {
      await callObject.setLocalAudio(newState);
      setIsAudioEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  }, [callObject, isAudioEnabled]);

  // Start recording with configuration - Memoized
  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording({
        layout: {
          preset: 'default',
        },
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [startRecording]);

  // Start live streaming - Memoized with dependency
  const handleStartStreaming = useCallback(async () => {
    if (!streamingUrl.trim()) {
      alert('Please enter a streaming URL');
      return;
    }

    try {
      await startLiveStreaming({
        rtmpUrl: streamingUrl,
        layout: {
          preset: 'default',
        },
      });
    } catch (error) {
      console.error('Failed to start streaming:', error);
    }
  }, [startLiveStreaming, streamingUrl]);

  // Auto-join on mount if we have a room URL - Fixed to prevent re-render loop
  useEffect(() => {
    if (roomUrl && callObject && !localParticipant && !hasJoinedRef.current && !isJoining) {
      joinCall();
    }
  }, [roomUrl, callObject, localParticipant, isJoining]); // Removed joinCall from deps to prevent loop

  // Memoize participant count to prevent re-renders
  const participantCount = useMemo(() => {
    return remoteParticipantIds.length + 1;
  }, [remoteParticipantIds.length]);

  // Sync video/audio state with actual call state on participant change
  useEffect(() => {
    if (!localParticipant) return;

    setIsVideoEnabled(localParticipant.video ?? true);
    setIsAudioEnabled(localParticipant.audio ?? true);
  }, [localParticipant]);

  if (!callObject) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Initializing studio session...</p>
      </Card>
    );
  }

  if (!localParticipant) {
    return (
      <Card className="p-8 text-center">
        <h3 className="mb-4 text-xl font-semibold">Join Studio Session</h3>
        {callError && <p className="mb-4 text-red-500">{callError}</p>}
        <Button onClick={joinCall} disabled={isJoining} className="min-w-[200px]">
          {isJoining ? 'Joining...' : 'Join Session'}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Video Grid */}
      <Card className="p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Local participant */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <DailyVideo sessionId={localParticipant.session_id} type="video" mirror />
            <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
              You {localParticipant.audio ? '' : '(muted)'}
            </div>
          </div>

          {/* Remote participants */}
          {remoteParticipantIds.map((id) => (
            <div key={id} className="relative aspect-video overflow-hidden rounded-lg bg-black">
              <DailyVideo sessionId={id} type="video" />
              <DailyAudio />
            </div>
          ))}

          {/* Screen shares */}
          {screens.map((screen) => (
            <div
              key={screen.screenId}
              className="relative col-span-full aspect-video overflow-hidden rounded-lg bg-black"
            >
              <DailyVideo sessionId={screen.session_id} type="screenVideo" />
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
                {screen.screenId} (Screen Share)
              </div>
            </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Basic Controls */}
          <Button
            variant={isVideoEnabled ? 'secondary' : 'destructive'}
            size="icon"
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          <Button
            variant={isAudioEnabled ? 'secondary' : 'destructive'}
            size="icon"
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          {/* Screen Share */}
          <Button
            variant={isSharingScreen ? 'default' : 'secondary'}
            size="icon"
            onClick={() => (isSharingScreen ? stopScreenShare() : startScreenShare())}
            title={isSharingScreen ? 'Stop screen share' : 'Share screen'}
          >
            {isSharingScreen ? <MonitorX className="h-4 w-4" /> : <MonitorUp className="h-4 w-4" />}
          </Button>

          <div className="bg-border mx-2 h-8 w-px" />

          {/* Recording */}
          <Button
            variant={isRecording ? 'destructive' : 'default'}
            onClick={() => (isRecording ? stopRecording() : handleStartRecording())}
            className="gap-2"
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Disc className="h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>

          {/* Live Streaming */}
          {!isLiveStreaming && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="RTMP URL"
                value={streamingUrl}
                onChange={(e) => setStreamingUrl(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              />
              <Button variant="default" onClick={handleStartStreaming} className="gap-2">
                <Radio className="h-4 w-4" />
                Go Live
              </Button>
            </div>
          )}

          {isLiveStreaming && (
            <Button variant="destructive" onClick={() => stopLiveStreaming()} className="gap-2">
              <X className="h-4 w-4" />
              Stop Streaming
            </Button>
          )}

          <div className="bg-border mx-2 h-8 w-px" />

          {/* Leave Call */}
          <Button variant="destructive" onClick={leaveCall} className="gap-2">
            <PhoneOff className="h-4 w-4" />
            Leave
          </Button>
        </div>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-600"
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              Recording in progress...
            </motion.div>
          )}

          {isLiveStreaming && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-600"
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              Live streaming active
            </motion.div>
          )}

          {(recordingError || streamingError) && (
            <p className="text-sm text-red-500">Error: {recordingError || streamingError}</p>
          )}
        </div>
      </Card>

      {/* Participant Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>{participantCount} participants in session</span>
        </div>
      </Card>
    </div>
  );
}
