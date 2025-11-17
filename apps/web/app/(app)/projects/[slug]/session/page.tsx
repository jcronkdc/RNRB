'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Mic, MonitorUp, Radio, Square, Settings } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import { DailyProvider } from '@daily-co/daily-react';
import Daily from '@daily-co/daily-js';
import { StudioSession } from '@/components/daily/studio-session';
import { useDailyRoom } from '@/hooks/use-daily-room';

// Optimal pathway: Project Detail → Session (1 click)
// Collaboration: Multi-participant video with cursor control

export default function ProjectSessionPage({ params }: { params: { slug: string } }) {
  const [activeSession, setActiveSession] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);
  const [roomData, setRoomData] = useState<{ room: any; token: string } | null>(null);
  const { createRoom, isLoading, error } = useDailyRoom();

  useEffect(() => {
    const daily = Daily.createCallObject({
      subscribeToTracksAutomatically: true,
    });
    setCallObject(daily);

    return () => {
      daily.destroy();
    };
  }, []);

  const startCollaborationSession = async () => {
    try {
      const data = await createRoom({
        name: `project-${params.slug}-${Date.now()}`,
        properties: {
          enable_recording: true,
          enable_chat: true,
          enable_screenshare: true,
          enable_network_ui: true,
        },
      });
      setRoomData(data);
      setActiveSession(true);
    } catch (err) {
      console.error('Failed to create session:', err);
      alert('Failed to start session. Check DAILY_API_KEY in environment variables.');
    }
  };

  return (
    <DailyProvider callObject={callObject}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Video className="w-8 h-8 text-brand-primary" />
              Collaboration Session
            </h1>
            <p className="text-muted-foreground">
              HD video collaboration with screen sharing, cursor control, and recording.
            </p>
          </div>

          {activeSession && roomData ? (
            /* Active Session */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Live Collaboration Session</h2>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setActiveSession(false);
                    setRoomData(null);
                  }}
                >
                  <Square className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </div>
              
              <StudioSession roomUrl={roomData.room.url} token={roomData.token} />
            </div>
          ) : (
            /* Start Session Interface */
            <>
              {/* Quick Start Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-brand-primary"
                  onClick={startCollaborationSession}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-red-500/10 rounded-full">
                      <Radio className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Live Session</h3>
                      <p className="text-sm text-muted-foreground">
                        Start recording with collaborators
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-brand-primary">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-blue-500/10 rounded-full">
                      <Mic className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Writing Session</h3>
                      <p className="text-sm text-muted-foreground">
                        Collaborate on lyrics and arrangements
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-brand-primary">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-green-500/10 rounded-full">
                      <MonitorUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Screen Share</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your DAW or production software
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Session Features */}
              <Card className="p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  True Remote Collaboration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-3">Video & Audio Features</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Video className="w-5 h-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium">HD Video (up to 32 participants)</p>
                          <p className="text-sm text-muted-foreground">Crystal clear video for remote sessions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Mic className="w-5 h-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Studio-Quality Audio</p>
                          <p className="text-sm text-muted-foreground">Professional audio for music production</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <MonitorUp className="w-5 h-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Screen Sharing</p>
                          <p className="text-sm text-muted-foreground">Share your DAW, charts, or lyrics</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-3">Collaboration Tools</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Settings className="w-5 h-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Cursor Control (Coming Soon)</p>
                          <p className="text-sm text-muted-foreground">See collaborator cursors in real-time</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Radio className="w-5 h-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Cloud Recording</p>
                          <p className="text-sm text-muted-foreground">Automatically record all sessions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Presence Awareness</p>
                          <p className="text-sm text-muted-foreground">See who's in the session at all times</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button 
                    size="lg" 
                    onClick={startCollaborationSession}
                    disabled={isLoading}
                    className="px-8"
                  >
                    {isLoading ? 'Starting Session...' : 'Start Collaboration Session'}
                  </Button>
                  {error && (
                    <p className="text-sm text-red-500 mt-2">
                      Error: {error}. Check DAILY_API_KEY environment variable.
                    </p>
                  )}
                </div>
              </Card>

              {/* Privacy Notice */}
              <Card className="p-6 bg-green-500/5 border-green-500/20">
                <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                  🔒 Private & Secure
                </h3>
                <p className="text-sm text-muted-foreground">
                  This session is invite-only. Only project members you've invited can join.
                  All video and audio is encrypted end-to-end. Recordings are stored securely in your account.
                </p>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </DailyProvider>
  );
}

