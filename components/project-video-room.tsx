'use client';

import { useEffect, useState } from 'react';
import { DailyProvider } from '@daily-co/daily-react';
import Daily from '@daily-co/daily-js';
import { StudioSession } from './daily/studio-session';
import { useDailyRoom } from '@/hooks/use-daily-room';
import { Button } from '@cronkwaters/ui';
import { Video, Users, Share2, Mic, VideoOff } from 'lucide-react';

type ProjectVideoRoomProps = {
  projectSlug: string;
  projectName: string;
};

export function ProjectVideoRoom({ projectSlug, projectName }: ProjectVideoRoomProps) {
  const [callObject, setCallObject] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const { createRoom, isLoading, error } = useDailyRoom();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const daily = Daily.createCallObject({
        subscribeToTracksAutomatically: true,
      });
      setCallObject(daily);

      return () => {
        daily.destroy();
      };
    }
  }, []);

  const startVideoRoom = async () => {
    try {
      const data = await createRoom({
        name: `project-${projectSlug}-${Date.now()}`,
        properties: {
          enable_recording: true,
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: true,
        },
      });
      setRoomData(data);
      setIsActive(true);
    } catch (err) {
      console.error('Failed to create video room:', err);
    }
  };

  const endVideoRoom = () => {
    setIsActive(false);
    setRoomData(null);
  };

  if (!callObject) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">Initializing video system...</p>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <div className="space-y-4">
        {!isActive ? (
          <>
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Collaborative Video Room
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start a video room to collaborate in real-time with your team. 
                Perfect for remote songwriting, production meetings, or virtual rehearsals.
              </p>
              
              <Button
                onClick={startVideoRoom}
                disabled={isLoading}
                className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground px-8 py-4 text-lg font-semibold"
              >
                <Video className="w-5 h-5 mr-2" />
                {isLoading ? 'Creating Room...' : 'Start Video Room'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface border border-border rounded-lg">
                <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Up to 32 Participants
                </p>
                <p className="text-sm text-muted-foreground">
                  Invite your entire team for large collaboration sessions
                </p>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg">
                <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  Screen Share & Cursor Control
                </p>
                <p className="text-sm text-muted-foreground">
                  Share your DAW, sheet music, or collaborate on lyrics
                </p>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg">
                <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-green-400" />
                  HD Audio Recording
                </p>
                <p className="text-sm text-muted-foreground">
                  Record your collaborative sessions automatically
                </p>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg">
                <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <VideoOff className="w-4 h-4 text-orange-400" />
                  Audio-Only Option
                </p>
                <p className="text-sm text-muted-foreground">
                  Disable video for low-bandwidth collaboration
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">
                🔴 Live Video Room for {projectName}
              </h3>
              <Button
                onClick={endVideoRoom}
                variant="secondary"
              >
                End Session
              </Button>
            </div>
            
            <StudioSession roomUrl={roomData.room.url} token={roomData.token} />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </DailyProvider>
  );
}

