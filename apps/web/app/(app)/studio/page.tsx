'use client';

import { Card, Button } from '@cronkwaters/ui';
import Daily, { DailyCall } from '@daily-co/daily-js';
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
  Music2,
  Drum,
  ClipboardList,
  Wrench,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

import { StudioSession } from '@/components/daily/studio-session';
import { ProjectSelector } from '@/components/project-selector';
import { useDailyRoom } from '@/hooks/use-daily-room';

// Singleton to prevent duplicate Daily instances (Daily SDK only allows one)
let globalDailyInstance: DailyCall | null = null;

function getOrCreateDailyInstance(): DailyCall {
  if (!globalDailyInstance) {
    globalDailyInstance = Daily.createCallObject({
      subscribeToTracksAutomatically: true,
    });
  }
  return globalDailyInstance;
}

export default function StudioPage() {
  const [activeSession, setActiveSession] = useState(false);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [roomData, setRoomData] = useState<{ room: any; token: string } | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const { createRoom, isLoading, error } = useDailyRoom();
  const mountedRef = useRef(true);

  // Initialize Daily call object using singleton pattern
  useEffect(() => {
    mountedRef.current = true;

    // Use singleton to prevent duplicate instances
    const daily = getOrCreateDailyInstance();
    setCallObject(daily);

    return () => {
      mountedRef.current = false;
      // Don't destroy on unmount - let the singleton persist
      // This prevents issues with React Strict Mode double-mounting
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
  const endSession = useCallback(async () => {
    // Leave the call but don't destroy the singleton
    if (callObject && callObject.meetingState() !== 'left-meeting') {
      try {
        await callObject.leave();
      } catch (e) {
        console.warn('Error leaving call:', e);
      }
    }
    setActiveSession(false);
    setRoomData(null);
  }, [callObject]);

  return (
    <DailyProvider callObject={callObject}>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Header Section */}
        <div className="border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-7xl px-4 py-8">
            {/* White RR Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex flex-col items-center"
            >
              <Link href="/" className="group inline-block">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={140}
                  height={57}
                  priority
                  className="transition-opacity duration-200 group-hover:opacity-80"
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Accent bar */}
              <div className="mb-4 h-1 w-12 rounded-full" style={{ background: 'var(--accent)' }} />
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: 'var(--panel)' }}
                >
                  <Video className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                    Professional Studio
                  </p>
                  <h1 className="text-2xl font-bold text-white">Recording Sessions</h1>
                </div>
              </div>
              <p className="max-w-2xl" style={{ color: 'var(--muted)' }}>
                HD recording, real-time collaboration, and live streaming - all in one place
              </p>
            </motion.div>
          </div>
        </div>

        <div className="rnrb-container max-w-7xl px-4 py-12">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-display mb-2 text-2xl font-bold">Quick Actions</h2>
            <p className="text-[color:var(--muted)]">Start your creative session</p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rnrb-card rnrb-hover-lift cursor-pointer border-2 border-[color:rgba(232,93,59,0.2)] p-6 transition-colors hover:border-[color:rgba(232,93,59,0.5)]"
              onClick={startNewSession}
              style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:rgba(232,93,59,0.1)]">
                  <Disc className="h-6 w-6 text-[color:var(--accent)]" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Start Recording</h3>
                  <p className="text-sm text-[color:var(--muted)]">HD video/audio session</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rnrb-card rnrb-hover-lift cursor-pointer p-6 transition-colors hover:border-[color:rgba(232,93,59,0.3)]"
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:rgba(232,93,59,0.1)]">
                  <Radio className="h-6 w-6 text-[color:var(--accent)]" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Go Live</h3>
                  <p className="text-sm text-[color:var(--muted)]">Stream to fans</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rnrb-card rnrb-hover-lift cursor-pointer p-6 transition-colors hover:border-[color:rgba(232,93,59,0.3)]"
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:rgba(232,93,59,0.1)]">
                  <Users className="h-6 w-6 text-[color:var(--accent)]" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Collaborate</h3>
                  <p className="text-sm text-[color:var(--muted)]">Invite musicians</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rnrb-card rnrb-hover-lift cursor-pointer p-6 transition-colors hover:border-[color:rgba(232,93,59,0.3)]"
            >
              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:rgba(232,93,59,0.1)]">
                  <Calendar className="h-6 w-6 text-[color:var(--accent)]" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Schedule</h3>
                  <p className="text-sm text-[color:var(--muted)]">Plan sessions</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Studio Tools Section */}
          <div className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display mb-2 text-2xl font-bold">Studio Tools</h2>
                <p className="text-[color:var(--muted)]">
                  Essential tools for your recording session
                </p>
              </div>
              <Link href="/tools">
                <Button variant="outline" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  All Tools
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/tools?tool=tuner">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rnrb-card group cursor-pointer p-5 transition-all hover:border-emerald-500/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Music2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-emerald-400">Tuner</h3>
                      <p className="text-xs text-[color:var(--muted)]">Tune before recording</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/tools?tool=click-track">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rnrb-card group cursor-pointer p-5 transition-all hover:border-orange-500/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                      <Drum className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-orange-400">Click Track</h3>
                      <p className="text-xs text-[color:var(--muted)]">Record to tempo</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/tools?tool=session-notes">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rnrb-card group cursor-pointer p-5 transition-all hover:border-teal-500/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-teal-400">Session Notes</h3>
                      <p className="text-xs text-[color:var(--muted)]">Document your setup</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/studio/recording-guide">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rnrb-card group cursor-pointer p-5 transition-all hover:border-purple-500/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                      <Mic className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-purple-400">Recording Guide</h3>
                      <p className="text-xs text-[color:var(--muted)]">Best practices</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
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
                <p className="mb-6 text-lg text-[color:var(--muted)]">
                  Let's be honest: You can't record professional multi-track audio over the internet
                  due to latency and compression. But you CAN collaborate effectively while each
                  person records locally.
                </p>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rnrb-card border-green-500/20 bg-green-500/5 p-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-[color:var(--accent)]">
                      <CheckCircle className="h-5 w-5" />
                      What This Studio DOES
                    </h4>
                    <ul className="space-y-2 text-sm text-[color:var(--muted)]">
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
                    <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                      <li>✗ Multi-track recording (use your local DAW)</li>
                      <li>✗ Replace professional audio interfaces</li>
                      <li>✗ Latency-free jamming (physics limits: 50-200ms)</li>
                      <li>✗ Capture individual instrument tracks remotely</li>
                      <li>✗ Professional mixing/mastering (use proper tools)</li>
                      <li>✗ Replace in-person studio sessions</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-[color:rgba(232,93,59,0.2)] bg-brand-primary/5 p-6">
                  <h3 className="mb-4 text-xl font-semibold">
                    The Real Professional Remote Workflow
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:rgba(232,93,59,0.2)] text-sm font-bold text-[color:var(--accent)]">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Each Musician Records Locally</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Use your own audio interface and DAW to record high-quality tracks
                          (48kHz/24-bit minimum)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:rgba(232,93,59,0.2)] text-sm font-bold text-[color:var(--accent)]">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Use Daily.co Video for Communication</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Producer in Nashville watches drummer's screen in LA, gives real-time
                          direction: "One more take, stronger on the chorus"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:rgba(232,93,59,0.2)] text-sm font-bold text-[color:var(--accent)]">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Upload High-Quality Files</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Once recorded, upload your WAV/AIFF files to the project for mixing (file
                          upload feature coming soon)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:rgba(232,93,59,0.2)] text-sm font-bold text-[color:var(--accent)]">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Mix Engineer Combines All Tracks</p>
                        <p className="text-sm text-[color:var(--muted)]">
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
                    <Video className="h-6 w-6 text-[color:var(--accent)]" />
                    Video Collaboration Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-[color:rgba(232,93,59,0.1)] p-2">
                        <Video className="h-5 w-5 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">HD Video Calls</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          1080p video at 30fps. See your collaborators clearly for feedback
                          sessions, rehearsals, and songwriting.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-[color:rgba(232,93,59,0.1)] p-2">
                        <MonitorSpeaker className="h-5 w-5 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Screen Sharing</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Share your DAW screen so producers can watch you work. They can provide
                          direction, suggest edits, and guide your recording process.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-[color:rgba(232,93,59,0.1)] p-2">
                        <Users className="h-5 w-5 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Up to 32 Participants</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Large group video calls for full band meetings, collaborative songwriting,
                          or remote rehearsals.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-[color:rgba(232,93,59,0.1)] p-2">
                        <Disc className="h-5 w-5 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Cloud Recording</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Record video sessions to cloud storage. Great for video content, not for
                          professional audio capture.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>

                <Card className="rnrb-card p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
                    <Radio className="h-6 w-6 text-[color:var(--accent)]" />
                    Live Streaming Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-[color:rgba(232,93,59,0.1)] p-2">
                        <Radio className="h-5 w-5 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Live Streaming to Fans</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Stream finished performances to YouTube, Twitch, Facebook Live via RTMP.
                          Perfect for virtual concerts and live events.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-[color:rgba(232,93,59,0.1)] p-2">
                        <MessageSquare className="h-5 w-5 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">In-Session Chat</p>
                        <p className="text-sm text-[color:var(--muted)]">
                          Text chat during video calls for sharing links, notes, or quick messages
                          without interrupting the session.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded bg-[color:rgba(232,93,59,0.1)] p-2">
                        <Mic className="h-5 w-5 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold">Mute/Video Controls</p>
                        <p className="text-sm text-[color:var(--muted)]">
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
                    <h4 className="mb-3 font-semibold text-[color:var(--accent)]">
                      Video Communication
                    </h4>
                    <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                      <li>• 1080p HD video at 30fps</li>
                      <li>• H.264 codec (browser-compatible)</li>
                      <li>• Grid, active speaker, or custom layouts</li>
                      <li>• Screen sharing (up to 4K resolution)</li>
                      <li>• Up to 32 participants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-[color:var(--accent)]">
                      Audio Streaming
                    </h4>
                    <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                      <li>• Opus codec (compressed for internet)</li>
                      <li>• NOT professional recording quality</li>
                      <li>• 50-200ms internet latency (varies)</li>
                      <li>• Echo cancellation & noise suppression</li>
                      <li>• Good for communication, not audio capture</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-[color:var(--accent)]">
                      Live Streaming
                    </h4>
                    <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                      <li>• RTMP/RTMPS output</li>
                      <li>• Stream to YouTube, Twitch, Facebook</li>
                      <li>• Great for finished performances</li>
                      <li>• Cloud recording available</li>
                      <li>• Custom stream keys supported</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-[color:var(--accent)]">
                      Recording Formats
                    </h4>
                    <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                      <li>• MP4 video files</li>
                      <li>• WAV/MP3 audio exports</li>
                      <li>• Per-participant track isolation</li>
                      <li>• Automatic cloud storage</li>
                      <li>• Instant downloads</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold text-[color:var(--accent)]">Best Uses</h4>
                    <ul className="space-y-2 text-sm text-[color:var(--muted)]">
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
