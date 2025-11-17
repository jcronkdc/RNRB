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
  MonitorSpeaker
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
              {/* Recent Sessions */}
              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Sessions</h2>
                  <Button variant="secondary" size="sm">
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Album Recording - Track 3', date: '2 hours ago', duration: '45 min', type: 'recording' },
                    { name: 'Live Jam with Band', date: 'Yesterday', duration: '1h 30m', type: 'live' },
                    { name: 'Acoustic Session', date: '3 days ago', duration: '25 min', type: 'recording' },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded ${
                          session.type === 'live' ? 'bg-red-500/10' : 'bg-blue-500/10'
                        }`}>
                          {session.type === 'live' ? (
                            <Radio className="h-4 w-4 text-red-500" />
                          ) : (
                            <Disc className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{session.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.date} • {session.duration}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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
