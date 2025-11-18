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
  CheckCircle,
  Video,
  MessageSquare
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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
          </div>
          
          <div className="rnrb-container max-w-7xl relative z-10 py-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Professional Studio</p>
                  <h1 className="text-3xl md:text-4xl font-display font-bold">Recording Sessions</h1>
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                HD recording, real-time collaboration, and live streaming - all in one place
              </p>
            </motion.div>
          </div>
        </div>

        <div className="rnrb-container max-w-7xl py-12 px-4">

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-2">Quick Actions</h2>
            <p className="text-muted-foreground">Start your creative session</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rnrb-card p-6 rnrb-hover-lift cursor-pointer border-2 border-brand-primary/20 hover:border-brand-primary/50 transition-colors" 
              onClick={startNewSession}
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <Disc className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Start Recording</h3>
                  <p className="text-sm text-muted-foreground">HD video/audio session</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rnrb-card p-6 rnrb-hover-lift cursor-pointer hover:border-brand-primary/30 transition-colors"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <Radio className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Go Live</h3>
                  <p className="text-sm text-muted-foreground">Stream to fans</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rnrb-card p-6 rnrb-hover-lift cursor-pointer hover:border-brand-primary/30 transition-colors"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Collaborate</h3>
                  <p className="text-sm text-muted-foreground">Invite musicians</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rnrb-card p-6 rnrb-hover-lift cursor-pointer hover:border-brand-primary/30 transition-colors"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Schedule</h3>
                  <p className="text-sm text-muted-foreground">Plan sessions</p>
                </div>
              </div>
            </motion.div>
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
              {/* Honest Studio Overview */}
              <Card className="p-8 mb-8 rnrb-card">
                <h2 className="text-3xl font-display font-bold mb-4">Remote Collaboration Studio</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Let's be honest: You can't record professional multi-track audio over the internet due to latency and compression. 
                  But you CAN collaborate effectively while each person records locally.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="rnrb-card p-6 bg-green-500/5 border-green-500/20">
                    <h4 className="font-semibold mb-3 text-brand-primary flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      What This Studio DOES
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ HD video calls with up to 32 musicians</li>
                      <li>✓ Screen share your DAW (Pro Tools, Logic, Ableton)</li>
                      <li>✓ Remote direction & real-time feedback</li>
                      <li>✓ Record video performances for content</li>
                      <li>✓ Live stream finished performances to YouTube/Twitch</li>
                      <li>✓ Virtual rehearsals & songwriting sessions</li>
                    </ul>
                  </div>
                  
                  <div className="rnrb-card p-6 bg-red-500/5 border-red-500/20">
                    <h4 className="font-semibold mb-3 text-red-400 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      What This Studio DOESN'T Do
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✗ Multi-track recording (use your local DAW)</li>
                      <li>✗ Replace professional audio interfaces</li>
                      <li>✗ Latency-free jamming (physics limits: 50-200ms)</li>
                      <li>✗ Capture individual instrument tracks remotely</li>
                      <li>✗ Professional mixing/mastering (use proper tools)</li>
                      <li>✗ Replace in-person studio sessions</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-brand-primary/5 rounded-lg p-6 border border-brand-primary/20">
                  <h3 className="text-xl font-semibold mb-4">The Real Professional Remote Workflow</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold flex-shrink-0">1</div>
                      <div>
                        <p className="font-medium">Each Musician Records Locally</p>
                        <p className="text-sm text-muted-foreground">
                          Use your own audio interface and DAW to record high-quality tracks (48kHz/24-bit minimum)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold flex-shrink-0">2</div>
                      <div>
                        <p className="font-medium">Use Daily.co Video for Communication</p>
                        <p className="text-sm text-muted-foreground">
                          Producer in Nashville watches drummer's screen in LA, gives real-time direction: "One more take, stronger on the chorus"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold flex-shrink-0">3</div>
                      <div>
                        <p className="font-medium">Upload High-Quality Files</p>
                        <p className="text-sm text-muted-foreground">
                          Once recorded, upload your WAV/AIFF files to the project for mixing (file upload feature coming soon)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-bold flex-shrink-0">4</div>
                      <div>
                        <p className="font-medium">Mix Engineer Combines All Tracks</p>
                        <p className="text-sm text-muted-foreground">
                          Download all musicians' files, mix in your DAW. This is how real distributed albums are made.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Detailed Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 rnrb-card">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Video className="h-6 w-6 text-brand-primary" />
                    Video Collaboration Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded flex-shrink-0">
                        <Video className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">HD Video Calls</p>
                        <p className="text-sm text-muted-foreground">
                          1080p video at 30fps. See your collaborators clearly for feedback sessions, rehearsals, and songwriting.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded flex-shrink-0">
                        <MonitorSpeaker className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Screen Sharing</p>
                        <p className="text-sm text-muted-foreground">
                          Share your DAW screen so producers can watch you work. They can provide direction, suggest edits, and guide your recording process.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded flex-shrink-0">
                        <Users className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Up to 32 Participants</p>
                        <p className="text-sm text-muted-foreground">
                          Large group video calls for full band meetings, collaborative songwriting, or remote rehearsals.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded flex-shrink-0">
                        <Disc className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Cloud Recording</p>
                        <p className="text-sm text-muted-foreground">
                          Record video sessions to cloud storage. Great for video content, not for professional audio capture.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 rnrb-card">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Radio className="h-6 w-6 text-brand-primary" />
                    Live Streaming Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded flex-shrink-0">
                        <Radio className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Live Streaming to Fans</p>
                        <p className="text-sm text-muted-foreground">
                          Stream finished performances to YouTube, Twitch, Facebook Live via RTMP. Perfect for virtual concerts and live events.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">In-Session Chat</p>
                        <p className="text-sm text-muted-foreground">
                          Text chat during video calls for sharing links, notes, or quick messages without interrupting the session.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded flex-shrink-0">
                        <Mic className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Mute/Video Controls</p>
                        <p className="text-sm text-muted-foreground">
                          Individual audio/video controls. Participants can mute themselves or turn off cameras as needed.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Technical Reality */}
              <Card className="p-8 mb-8 rnrb-card">
                <h3 className="text-2xl font-display font-bold mb-6">Technical Reality (What You Actually Get)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Video Communication</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 1080p HD video at 30fps</li>
                      <li>• H.264 codec (browser-compatible)</li>
                      <li>• Grid, active speaker, or custom layouts</li>
                      <li>• Screen sharing (up to 4K resolution)</li>
                      <li>• Up to 32 participants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Audio Streaming</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Opus codec (compressed for internet)</li>
                      <li>• NOT professional recording quality</li>
                      <li>• 50-200ms internet latency (varies)</li>
                      <li>• Echo cancellation & noise suppression</li>
                      <li>• Good for communication, not audio capture</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Live Streaming</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• RTMP/RTMPS output</li>
                      <li>• Stream to YouTube, Twitch, Facebook</li>
                      <li>• Great for finished performances</li>
                      <li>• Cloud recording available</li>
                      <li>• Custom stream keys supported</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Recording Formats</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• MP4 video files</li>
                      <li>• WAV/MP3 audio exports</li>
                      <li>• Per-participant track isolation</li>
                      <li>• Automatic cloud storage</li>
                      <li>• Instant downloads</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Best Uses</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Remote collaboration & feedback</li>
                      <li>• Screen sharing your DAW for direction</li>
                      <li>• Live streaming finished performances</li>
                      <li>• Virtual band meetings & rehearsals</li>
                      <li>• Songwriting sessions (video only)</li>
                    </ul>
                  </div>
                </div>
              </Card>

            </>
          )}
        </div>
      </div>
    </DailyProvider>
  );
}
