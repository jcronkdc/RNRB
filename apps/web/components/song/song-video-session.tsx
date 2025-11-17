'use client';

import { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, X, Users } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';

/**
 * Song-Level Video Co-Writing Session
 * Uses Daily.co for HD video collaboration while writing lyrics
 * Includes cursor control via screen share for shared editing
 */

interface SongVideoSessionProps {
  songId: string;
  songTitle: string;
  onClose?: () => void;
}

export default function SongVideoSession({ songId, songTitle, onClose }: SongVideoSessionProps) {
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [callFrame, setCallFrame] = useState<any>(null);
  const [participants, setParticipants] = useState<number>(0);
  const [localVideo, setLocalVideo] = useState(true);
  const [localAudio, setLocalAudio] = useState(true);
  const [screenShare, setScreenShare] = useState(false);

  useEffect(() => {
    // Create Daily.co room for this song
    const createRoom = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/daily/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `song-${songId}`,
            properties: {
              enable_chat: true,
              enable_screenshare: true,
              enable_recording: 'cloud',
              max_participants: 32,
            },
          }),
        });

        if (!response.ok) throw new Error('Failed to create room');

        const { url } = await response.json();
        setRoomUrl(url);
        initializeCall(url);
      } catch (error) {
        console.error('Room creation error:', error);
      } finally {
        setLoading(false);
      }
    };

    createRoom();

    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, [songId]);

  const initializeCall = async (url: string) => {
    // @ts-ignore - Daily.co loaded via CDN
    if (typeof window !== 'undefined' && window.DailyIframe) {
      // @ts-ignore
      const frame = window.DailyIframe.createFrame({
        showLeaveButton: true,
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '600px',
          border: '0',
          borderRadius: '8px',
        },
      });

      frame.join({ url });

      frame.on('participant-joined', () => {
        const count = Object.keys(frame.participants()).length;
        setParticipants(count);
      });

      frame.on('participant-left', () => {
        const count = Object.keys(frame.participants()).length;
        setParticipants(count);
      });

      setCallFrame(frame);
    }
  };

  const toggleVideo = () => {
    if (callFrame) {
      callFrame.setLocalVideo(!localVideo);
      setLocalVideo(!localVideo);
    }
  };

  const toggleAudio = () => {
    if (callFrame) {
      callFrame.setLocalAudio(!localAudio);
      setLocalAudio(!localAudio);
    }
  };

  const toggleScreenShare = async () => {
    if (!callFrame) return;

    if (screenShare) {
      await callFrame.stopScreenShare();
      setScreenShare(false);
    } else {
      await callFrame.startScreenShare();
      setScreenShare(true);
    }
  };

  const leaveCall = () => {
    if (callFrame) {
      callFrame.leave();
      callFrame.destroy();
    }
    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground"
        >
          Creating co-writing room...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Info */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div>
            <p className="font-semibold">Co-Writing: {songTitle}</p>
            <p className="text-xs text-muted-foreground">
              <Users className="w-3 h-3 inline mr-1" />
              {participants} in session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleVideo}
          >
            {localVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleAudio}
          >
            {localAudio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleScreenShare}
            className={screenShare ? 'bg-brand-primary text-brand-primary-foreground' : ''}
          >
            {screenShare ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={leaveCall}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Container */}
      <div 
        id="daily-call-container" 
        className="rounded-lg overflow-hidden border border-border bg-black"
        style={{ minHeight: '600px' }}
      />

      {/* Help Text */}
      <div className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/20">
        <p className="font-medium mb-2">Co-Writing Tips:</p>
        <ul className="space-y-1 text-xs">
          <li>• Use screen share to show your DAW or lyrics editor</li>
          <li>• Everyone can see cursor movements during screen share</li>
          <li>• Switch to Chat tab to discuss without speaking</li>
          <li>• Session auto-records to cloud for playback</li>
        </ul>
      </div>
    </div>
  );
}
