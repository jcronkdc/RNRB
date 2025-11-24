'use client';

import { Card, Button } from '@cronkwaters/ui';
import Daily from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';
import { motion } from 'framer-motion';
import {
  Radio,
  Disc,
  Users,
  Calendar,
  Mic,
  MonitorSpeaker,
  CheckCircle,
  Video,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="border-border/50 relative overflow-hidden border-b">
          <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
          <div className="absolute inset-0">
            <div className="bg-brand-primary/10 absolute right-1/4 top-0 h-96 w-96 rounded-full blur-3xl" />
          </div>

          <div className="rnrb-container relative z-10 max-w-7xl px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Video className="text-brand-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Professional Studio</p>
                  <h1 className="font-display text-3xl font-bold md:text-4xl">
                    Recording Sessions
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground max-w-2xl text-lg">
                HD recording, real-time collaboration, and live streaming - all in one place
              </p>
            </motion.div>
          </div>
        </div>

        <div className="rnrb-container max-w-7xl px-4 py-12">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-display mb-2 text-2xl font-bold">Quick Actions</h2>
            <p className="text-muted-foreground">Start your creative session</p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rnrb-card rnrb-hover-lift border-brand-primary/20 hover:border-brand-primary/50 cursor-pointer border-2 p-6 transition-colors"
              onClick={startNewSession}
            >
              <div className="flex flex-col gap-4">
                <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Disc className="text-brand-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Start Recording</h3>
                  <p className="text-muted-foreground text-sm">HD video/audio session</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rnrb-card rnrb-hover-lift hover:border-brand-primary/30 cursor-pointer p-6 transition-colors"
            >
              <div className="flex flex-col gap-4">
                <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Radio className="text-brand-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Go Live</h3>
                  <p className="text-muted-foreground text-sm">Stream to fans</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rnrb-card rnrb-hover-lift hover:border-brand-primary/30 cursor-pointer p-6 transition-colors"
            >
              <div className="flex flex-col gap-4">
                <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Users className="text-brand-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Collaborate</h3>
                  <p className="text-muted-foreground text-sm">Invite musicians</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rnrb-card rnrb-hover-lift hover:border-brand-primary/30 cursor-pointer p-6 transition-colors"
            >
              <div className="flex flex-col gap-4">
                <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Calendar className="text-brand-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Schedule</h3>
                  <p className="text-muted-foreground text-sm">Plan sessions</p>
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
              <Card className="rnrb-card mb-8 p-8">
                <h2 className="font-display mb-4 text-3xl font-bold">
                  Remote Collaboration Studio
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  Let's be honest: You can't record professional multi-track audio over the internet
                  due to latency and compression. But you CAN collaborate effectively while each
                  person records locally.
                </p>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rnrb-card border-green-500/20 bg-green-500/5 p-6">
                    <h4 className="text-brand-primary mb-3 flex items-center gap-2 font-semibold">
                      <CheckCircle className="h-5 w-5" />
                      What This Studio DOES
                    </h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>✓ HD video calls with up to 32 musicians</li>
                      <li>✓ Screen share your DAW (Pro Tools, Logic, Ableton)</li>
                      <li>✓ Remote direction & real-time feedback</li>
                      <li>✓ Record video performances for content</li>
                      <li>✓ Live stream finished performances to YouTube/Twitch</li>
                      <li>✓ Virtual rehearsals & songwriting sessions</li>
                    </ul>
                  </div>

                  <div className="rnrb-card border-red-500/20 bg-red-500/5 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-red-400">
                      <CheckCircle className="h-5 w-5" />
                      What This Studio DOESN'T Do
                    </h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>✗ Multi-track recording (use your local DAW)</li>
                      <li>✗ Replace professional audio interfaces</li>
                      <li>✗ Latency-free jamming (physics limits: 50-200ms)</li>
                      <li>✗ Capture individual instrument tracks remotely</li>
                      <li>✗ Professional mixing/mastering (use proper tools)</li>
                      <li>✗ Replace in-person studio sessions</li>
                    </ul>
                  </div>
                </div>

                <div className="border-brand-primary/20 bg-brand-primary/5 rounded-lg border p-6">
                  <h3 className="mb-4 text-xl font-semibold">
                    The Real Professional Remote Workflow
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-brand-primary/20 text-brand-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Each Musician Records Locally</p>
                        <p className="text-muted-foreground text-sm">
                          Use your own audio interface and DAW to record high-quality tracks
                          (48kHz/24-bit minimum)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-brand-primary/20 text-brand-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Use Daily.co Video for Communication</p>
                        <p className="text-muted-foreground text-sm">
                          Producer in Nashville watches drummer's screen in LA, gives real-time
                          direction: "One more take, stronger on the chorus"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-brand-primary/20 text-brand-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Upload High-Quality Files</p>
                        <p className="text-muted-foreground text-sm">
                          Once recorded, upload your WAV/AIFF files to the project for mixing (file
                          upload feature coming soon)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-brand-primary/20 text-brand-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Mix Engineer Combines All Tracks</p>
                        <p className="text-muted-foreground text-sm">
                          Download all musicians' files, mix in your DAW. This is how real
                          distributed albums are made.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Detailed Features Grid */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="rnrb-card p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
                    <Video className="text-brand-primary h-6 w-6" />
                    Video Collaboration Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 flex-shrink-0 rounded p-2">
                        <Video className="text-brand-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">HD Video Calls</p>
                        <p className="text-muted-foreground text-sm">
                          1080p video at 30fps. See your collaborators clearly for feedback
                          sessions, rehearsals, and songwriting.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 flex-shrink-0 rounded p-2">
                        <MonitorSpeaker className="text-brand-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Screen Sharing</p>
                        <p className="text-muted-foreground text-sm">
                          Share your DAW screen so producers can watch you work. They can provide
                          direction, suggest edits, and guide your recording process.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 flex-shrink-0 rounded p-2">
                        <Users className="text-brand-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Up to 32 Participants</p>
                        <p className="text-muted-foreground text-sm">
                          Large group video calls for full band meetings, collaborative songwriting,
                          or remote rehearsals.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 flex-shrink-0 rounded p-2">
                        <Disc className="text-brand-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Cloud Recording</p>
                        <p className="text-muted-foreground text-sm">
                          Record video sessions to cloud storage. Great for video content, not for
                          professional audio capture.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>

                <Card className="rnrb-card p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
                    <Radio className="text-brand-primary h-6 w-6" />
                    Live Streaming Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 flex-shrink-0 rounded p-2">
                        <Radio className="text-brand-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Live Streaming to Fans</p>
                        <p className="text-muted-foreground text-sm">
                          Stream finished performances to YouTube, Twitch, Facebook Live via RTMP.
                          Perfect for virtual concerts and live events.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 flex-shrink-0 rounded p-2">
                        <MessageSquare className="text-brand-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">In-Session Chat</p>
                        <p className="text-muted-foreground text-sm">
                          Text chat during video calls for sharing links, notes, or quick messages
                          without interrupting the session.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-primary/10 flex-shrink-0 rounded p-2">
                        <Mic className="text-brand-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Mute/Video Controls</p>
                        <p className="text-muted-foreground text-sm">
                          Individual audio/video controls. Participants can mute themselves or turn
                          off cameras as needed.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Technical Reality */}
              <Card className="rnrb-card mb-8 p-8">
                <h3 className="font-display mb-6 text-2xl font-bold">
                  Technical Reality (What You Actually Get)
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-brand-primary mb-3 font-semibold">Video Communication</h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• 1080p HD video at 30fps</li>
                      <li>• H.264 codec (browser-compatible)</li>
                      <li>• Grid, active speaker, or custom layouts</li>
                      <li>• Screen sharing (up to 4K resolution)</li>
                      <li>• Up to 32 participants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-brand-primary mb-3 font-semibold">Audio Streaming</h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Opus codec (compressed for internet)</li>
                      <li>• NOT professional recording quality</li>
                      <li>• 50-200ms internet latency (varies)</li>
                      <li>• Echo cancellation & noise suppression</li>
                      <li>• Good for communication, not audio capture</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-brand-primary mb-3 font-semibold">Live Streaming</h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• RTMP/RTMPS output</li>
                      <li>• Stream to YouTube, Twitch, Facebook</li>
                      <li>• Great for finished performances</li>
                      <li>• Cloud recording available</li>
                      <li>• Custom stream keys supported</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-brand-primary mb-3 font-semibold">Recording Formats</h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• MP4 video files</li>
                      <li>• WAV/MP3 audio exports</li>
                      <li>• Per-participant track isolation</li>
                      <li>• Automatic cloud storage</li>
                      <li>• Instant downloads</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-brand-primary mb-3 font-semibold">Best Uses</h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
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
