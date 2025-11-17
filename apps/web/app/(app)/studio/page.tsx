'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Radio, 
  Disc, 
  Users, 
  Calendar,
  Settings,
  Plus,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Headphones,
  Mic,
  MonitorSpeaker,
  CheckCircle
} from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';
import { DailyProvider } from '@daily-co/daily-react';
import Daily from '@daily-co/daily-js';
import { StudioSession } from '@/components/daily/studio-session';
import { useDailyRoom } from '@/hooks/use-daily-room';

export default function StudioPage() {
  const [activeSession, setActiveSession] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);
  const [roomData, setRoomData] = useState<{ room: any; token: string } | null>(null);
  const { createRoom, isLoading, error } = useDailyRoom();

  useEffect(() => {
    // Initialize Daily call object
    const daily = Daily.createCallObject({
      subscribeToTracksAutomatically: true,
    });
    setCallObject(daily);

    return () => {
      daily.destroy();
    };
  }, []);

  const startNewSession = async () => {
    try {
      const data = await createRoom({
        name: `studio-${Date.now()}`,
        properties: {
          enable_recording: true,
          enable_live_streaming: true,
          enable_chat: true,
          enable_screenshare: true,
        },
      });
      setRoomData(data);
      setActiveSession(true);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  return (
    <DailyProvider callObject={callObject}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Studio Sessions</h1>
            <p className="text-muted-foreground">
              Professional recording, collaboration, and live streaming for musicians
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={startNewSession}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Disc className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Start Recording</h3>
                  <p className="text-sm text-muted-foreground">Record your session</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Radio className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Go Live</h3>
                  <p className="text-sm text-muted-foreground">Stream to fans</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Collaborate</h3>
                  <p className="text-sm text-muted-foreground">Invite musicians</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Schedule</h3>
                  <p className="text-sm text-muted-foreground">Plan sessions</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Active Session or Session List */}
          {activeSession && roomData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Live Studio Session</h2>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setActiveSession(false);
                    setRoomData(null);
                  }}
                >
                  End Session
                </Button>
              </div>
              
              <StudioSession roomUrl={roomData.room.url} token={roomData.token} />
            </div>
          ) : (
            <>
              {/* Getting Started */}
              <Card className="p-6 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">🎸 Getting Started</h2>
                  <p className="text-muted-foreground">
                    Professional recording studio features are currently in development. Sign in and click "Start Recording" above to test the studio interface.
                  </p>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                    <div className="p-2 rounded bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Multi-track Recording</h4>
                      <p className="text-sm text-muted-foreground">
                        Record multiple audio tracks simultaneously with professional quality
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                    <div className="p-2 rounded bg-blue-500/10">
                      <Radio className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Live Streaming</h4>
                      <p className="text-sm text-muted-foreground">
                        Stream your sessions to YouTube, Twitch, or Facebook Live
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                    <div className="p-2 rounded bg-purple-500/10">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Remote Collaboration</h4>
                      <p className="text-sm text-muted-foreground">
                        Work with musicians anywhere in the world in real-time
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Studio Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recording Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Mic className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Multi-track Recording</p>
                        <p className="text-sm text-muted-foreground">Record up to 32 tracks simultaneously</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <MonitorSpeaker className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Real-time Monitoring</p>
                        <p className="text-sm text-muted-foreground">Zero-latency monitoring with effects</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Headphones className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Virtual Sound Check</p>
                        <p className="text-sm text-muted-foreground">Practice with recorded multitracks</p>
                      </div>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Collaboration Tools</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Remote Sessions</p>
                        <p className="text-sm text-muted-foreground">Collaborate with musicians worldwide</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Volume2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Talkback System</p>
                        <p className="text-sm text-muted-foreground">Communicate between control room and live room</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Session Templates</p>
                        <p className="text-sm text-muted-foreground">Save and reuse your favorite setups</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>

            </>
          )}
        </motion.div>
      </div>
    </DailyProvider>
  );
}
