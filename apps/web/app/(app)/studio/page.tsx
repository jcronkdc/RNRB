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
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

import { StudioSession } from '@/components/daily/studio-session';
import { ProjectSelector } from '@/components/project-selector';
import { useDailyRoom } from '@/hooks/use-daily-room';

export default function StudioPage() {
  const [activeSession, setActiveSession] = useState(false);
  const [callObject, setCallObject] = useState<any>(null);
  const [roomData, setRoomData] = useState<{ room: any; token: string } | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const { createRoom, isLoading, error } = useDailyRoom();
  const callObjectRef = useRef<any>(null);

  // Initialize Daily call object once
  useEffect(() => {
    // Only create if not already created
    if (callObjectRef.current) return;

    const daily = Daily.createCallObject({
      subscribeToTracksAutomatically: true,
    });
    callObjectRef.current = daily;
    setCallObject(daily);

    return () => {
      // Cleanup on unmount
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
    };
  }, []);

  // Memoize room creation function
  const startNewSession = useCallback(async () => {
    if (isLoading) return; // Prevent double-clicks

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
  }, [createRoom, isLoading]);

  // Handle session end with cleanup
  const endSession = useCallback(() => {
    setActiveSession(false);
    setRoomData(null);
  }, []);

  return (
    <DailyProvider callObject={callObject}>
      <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Floating Music Notes */}
        <div className="music-notes-container pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="music-note"
              style={{
                left: `${5 + i * 8}%`,
                animationDelay: `${i * 0.7}s`,
                fontSize: `${18 + (i % 4) * 8}px`,
              }}
            >
              {['♪', '♫', '♬', '♩'][i % 4]}
            </div>
          ))}
        </div>

        {/* Animated Background Gradient Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
          <div className="gradient-orb gradient-orb-3"></div>
          <div className="gradient-orb-accent"></div>
        </div>

        {/* Hero Grid Pattern */}
        <div className="hero-grid-pattern"></div>

        {/* Hero Section */}
        <div className="relative z-10 overflow-hidden border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 py-8">
            {/* White RR Logo & Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex flex-col items-center"
            >
              <Link href="/" className="group relative inline-block">
                <Image
                  src="/logo-light.png"
                  alt="Rock N' Roll Basement"
                  width={160}
                  height={65}
                  priority
                  className="transition-all duration-300 group-hover:scale-105"
                  style={{
                    filter:
                      'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(255, 99, 71, 0.3))',
                  }}
                />
                <div
                  className="absolute inset-0 -z-10 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'rgba(255, 99, 71, 0.2)' }}
                />
              </Link>
              <h1 className="hero-title mt-4 text-center">
                <span className="hero-text-gradient text-2xl font-bold md:text-3xl">
                  Rock N' Roll Basement
                </span>
              </h1>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                Studio
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Accent bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 h-1 rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--accent), #ffd700)' }}
              />
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255, 99, 71, 0.2)' }}
                >
                  <Video className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--accent)' }}>
                    Professional Studio
                  </p>
                  <h1 className="font-display text-3xl font-bold md:text-4xl">
                    Recording Sessions
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-lg text-muted-foreground">
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
              className="rnrb-card rnrb-hover-lift cursor-pointer border-2 border-brand-primary/20 p-6 transition-colors hover:border-brand-primary/50"
              onClick={startNewSession}
              style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Disc className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Start Recording</h3>
                  <p className="text-sm text-muted-foreground">HD video/audio session</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rnrb-card rnrb-hover-lift cursor-pointer p-6 transition-colors hover:border-brand-primary/30"
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Radio className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Go Live</h3>
                  <p className="text-sm text-muted-foreground">Stream to fans</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rnrb-card rnrb-hover-lift cursor-pointer p-6 transition-colors hover:border-brand-primary/30"
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Users className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Collaborate</h3>
                  <p className="text-sm text-muted-foreground">Invite musicians</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rnrb-card rnrb-hover-lift cursor-pointer p-6 transition-colors hover:border-brand-primary/30"
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Calendar className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Schedule</h3>
                  <p className="text-sm text-muted-foreground">Plan sessions</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Active Session or Session List */}
          {activeSession && roomData ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">Live Studio Session</h2>
                <div className="flex items-center gap-2">
                  {recordingId && (
                    <ProjectSelector
                      songId={recordingId}
                      onProjectAdded={(slug) => {
                        console.log('Recording added to project:', slug);
                      }}
                    />
                  )}
                  <Button variant="secondary" onClick={endSession}>
                    End Session
                  </Button>
                </div>
              </div>

              <StudioSession
                roomUrl={roomData.room.url}
                token={roomData.token}
                onRecordingComplete={(id) => {
                  setRecordingId(id);
                  console.log('Recording complete:', id);
                }}
              />
            </div>
          ) : (
            <>
              {/* Honest Studio Overview */}
              <Card className="rnrb-card mb-8 p-8">
                <h2 className="font-display mb-4 text-3xl font-bold">
                  Remote Collaboration Studio
                </h2>
                <p className="mb-6 text-lg text-muted-foreground">
                  Let's be honest: You can't record professional multi-track audio over the internet
                  due to latency and compression. But you CAN collaborate effectively while each
                  person records locally.
                </p>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rnrb-card border-green-500/20 bg-green-500/5 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-brand-primary">
                      <CheckCircle className="h-5 w-5" />
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

                  <div className="rnrb-card border-red-500/20 bg-red-500/5 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-red-400">
                      <CheckCircle className="h-5 w-5" />
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

                <div className="rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-6">
                  <h3 className="mb-4 text-xl font-semibold">
                    The Real Professional Remote Workflow
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-bold text-brand-primary">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Each Musician Records Locally</p>
                        <p className="text-sm text-muted-foreground">
                          Use your own audio interface and DAW to record high-quality tracks
                          (48kHz/24-bit minimum)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-bold text-brand-primary">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Use Daily.co Video for Communication</p>
                        <p className="text-sm text-muted-foreground">
                          Producer in Nashville watches drummer's screen in LA, gives real-time
                          direction: "One more take, stronger on the chorus"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-bold text-brand-primary">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Upload High-Quality Files</p>
                        <p className="text-sm text-muted-foreground">
                          Once recorded, upload your WAV/AIFF files to the project for mixing (file
                          upload feature coming soon)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-bold text-brand-primary">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Mix Engineer Combines All Tracks</p>
                        <p className="text-sm text-muted-foreground">
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
                    <Video className="h-6 w-6 text-brand-primary" />
                    Video Collaboration Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-brand-primary/10 p-2">
                        <Video className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">HD Video Calls</p>
                        <p className="text-sm text-muted-foreground">
                          1080p video at 30fps. See your collaborators clearly for feedback
                          sessions, rehearsals, and songwriting.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-brand-primary/10 p-2">
                        <MonitorSpeaker className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Screen Sharing</p>
                        <p className="text-sm text-muted-foreground">
                          Share your DAW screen so producers can watch you work. They can provide
                          direction, suggest edits, and guide your recording process.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-brand-primary/10 p-2">
                        <Users className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Up to 32 Participants</p>
                        <p className="text-sm text-muted-foreground">
                          Large group video calls for full band meetings, collaborative songwriting,
                          or remote rehearsals.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-brand-primary/10 p-2">
                        <Disc className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Cloud Recording</p>
                        <p className="text-sm text-muted-foreground">
                          Record video sessions to cloud storage. Great for video content, not for
                          professional audio capture.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>

                <Card className="rnrb-card p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
                    <Radio className="h-6 w-6 text-brand-primary" />
                    Live Streaming Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-brand-primary/10 p-2">
                        <Radio className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Live Streaming to Fans</p>
                        <p className="text-sm text-muted-foreground">
                          Stream finished performances to YouTube, Twitch, Facebook Live via RTMP.
                          Perfect for virtual concerts and live events.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-brand-primary/10 p-2">
                        <MessageSquare className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">In-Session Chat</p>
                        <p className="text-sm text-muted-foreground">
                          Text chat during video calls for sharing links, notes, or quick messages
                          without interrupting the session.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-brand-primary/10 p-2">
                        <Mic className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Mute/Video Controls</p>
                        <p className="text-sm text-muted-foreground">
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
                    <h4 className="mb-3 font-semibold text-brand-primary">Video Communication</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 1080p HD video at 30fps</li>
                      <li>• H.264 codec (browser-compatible)</li>
                      <li>• Grid, active speaker, or custom layouts</li>
                      <li>• Screen sharing (up to 4K resolution)</li>
                      <li>• Up to 32 participants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-brand-primary">Audio Streaming</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Opus codec (compressed for internet)</li>
                      <li>• NOT professional recording quality</li>
                      <li>• 50-200ms internet latency (varies)</li>
                      <li>• Echo cancellation & noise suppression</li>
                      <li>• Good for communication, not audio capture</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-brand-primary">Live Streaming</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• RTMP/RTMPS output</li>
                      <li>• Stream to YouTube, Twitch, Facebook</li>
                      <li>• Great for finished performances</li>
                      <li>• Cloud recording available</li>
                      <li>• Custom stream keys supported</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-brand-primary">Recording Formats</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• MP4 video files</li>
                      <li>• WAV/MP3 audio exports</li>
                      <li>• Per-participant track isolation</li>
                      <li>• Automatic cloud storage</li>
                      <li>• Instant downloads</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-brand-primary">Best Uses</h4>
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
