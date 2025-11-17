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
  Video
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
              {/* Comprehensive Studio Overview */}
              <Card className="p-8 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <h2 className="text-3xl font-bold mb-4">🎸 Professional Recording Studio</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Rock N' Roll Basement provides a complete cloud-based recording studio with HD video/audio recording, 
                  real-time collaboration, and professional livestreaming capabilities - all accessible from your browser.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 bg-background/50 rounded-lg">
                    <Disc className="h-8 w-8 text-red-500 mb-3" />
                    <h4 className="font-semibold mb-2">HD Recording</h4>
                    <p className="text-sm text-muted-foreground">
                      Record in 1080p video with 48kHz/24-bit audio. Professional quality for any project.
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <Radio className="h-8 w-8 text-blue-500 mb-3" />
                    <h4 className="font-semibold mb-2">Multi-Platform Streaming</h4>
                    <p className="text-sm text-muted-foreground">
                      Broadcast to YouTube, Twitch, Facebook Live, or custom RTMP destinations simultaneously.
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <Users className="h-8 w-8 text-green-500 mb-3" />
                    <h4 className="font-semibold mb-2">Global Collaboration</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with up to 32 participants for remote recording sessions and virtual band practice.
                    </p>
                  </div>
                </div>

                <div className="bg-background/30 rounded-lg p-6 border border-brand-primary/20">
                  <h3 className="text-xl font-semibold mb-4">What Makes Our Studio Different</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">No Software Installation Required</p>
                        <p className="text-sm text-muted-foreground">
                          Works entirely in your browser - no DAW plugins, no complex setups. Just open the link and start recording.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Automatic Cloud Backup</p>
                        <p className="text-sm text-muted-foreground">
                          Every take is automatically saved to cloud storage. Never lose a performance due to computer crashes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Built-in Livestreaming</p>
                        <p className="text-sm text-muted-foreground">
                          Record AND stream simultaneously. Engage your audience while creating content - no separate tools needed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Real-Time Collaboration</p>
                        <p className="text-sm text-muted-foreground">
                          Band members join from anywhere. See everyone's video, hear everyone's audio, collaborate like you're in the same room.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Detailed Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Mic className="h-6 w-6 text-red-500" />
                    Advanced Recording Features
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-red-500/10 rounded flex-shrink-0">
                        <Disc className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Multi-track Audio Recording</p>
                        <p className="text-sm text-muted-foreground">
                          Record up to 32 separate audio tracks simultaneously. Perfect for full band recordings, 
                          orchestras, or complex production setups. Each track is saved independently for post-production.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/10 rounded flex-shrink-0">
                        <Video className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">HD Video Recording (1080p)</p>
                        <p className="text-sm text-muted-foreground">
                          Crystal-clear 1080p video at 30fps. Capture performances, music videos, or behind-the-scenes 
                          content with professional quality. Customizable layouts include grid view, active speaker, or picture-in-picture.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 rounded flex-shrink-0">
                        <MonitorSpeaker className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Zero-Latency Monitoring</p>
                        <p className="text-sm text-muted-foreground">
                          Hear yourself and other musicians in real-time with less than 50ms latency. Critical for 
                          tight performances and staying in sync during remote sessions.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded flex-shrink-0">
                        <Headphones className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Individual Headphone Mixes</p>
                        <p className="text-sm text-muted-foreground">
                          Each participant controls their own monitor mix. Drummers can boost the click track, 
                          vocalists can adjust their reverb - everyone hears exactly what they need.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-500" />
                    Collaboration & Streaming
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded flex-shrink-0">
                        <Users className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Up to 32 Participants</p>
                        <p className="text-sm text-muted-foreground">
                          Host massive remote sessions. Perfect for orchestras, choirs, or multi-band collaborations. 
                          Everyone sees and hears each other in real-time.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 rounded flex-shrink-0">
                        <Radio className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Multi-Destination Streaming</p>
                        <p className="text-sm text-muted-foreground">
                          Stream to YouTube, Twitch, Facebook Live, and custom RTMP servers simultaneously. 
                          Reach all your audiences at once without complex restreaming services.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/10 rounded flex-shrink-0">
                        <Volume2 className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Built-in Talkback System</p>
                        <p className="text-sm text-muted-foreground">
                          Producer/engineer communicates with performers without the audience hearing. Essential for 
                          directing sessions and giving feedback during livestreams.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-2 bg-orange-500/10 rounded flex-shrink-0">
                        <Settings className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Session Templates</p>
                        <p className="text-sm text-muted-foreground">
                          Save your audio routing, video layouts, and stream settings. Load them instantly for 
                          consistent quality across all your sessions.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Additional Features */}
              <Card className="p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Audio Quality</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 48kHz/24-bit audio recording</li>
                      <li>• Opus codec for streaming (48kbps-510kbps)</li>
                      <li>• Automatic gain control (AGC)</li>
                      <li>• Noise suppression & echo cancellation</li>
                      <li>• Stereo and mono input support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Video Quality</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 1080p HD video (1920x1080)</li>
                      <li>• 30fps smooth motion</li>
                      <li>• H.264 codec for compatibility</li>
                      <li>• Custom layouts (grid, speaker, PIP)</li>
                      <li>• Screen sharing up to 4K</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Streaming</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• RTMP/RTMPS output</li>
                      <li>• 1080p @ 6Mbps bitrate</li>
                      <li>• Multi-platform simultaneous</li>
                      <li>• Custom stream keys</li>
                      <li>• DVR/replay capability</li>
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
                    <h4 className="font-semibold mb-3 text-brand-primary">Collaboration</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Screen sharing & annotations</li>
                      <li>• In-session text chat</li>
                      <li>• Session recording permissions</li>
                      <li>• Mute/unmute controls</li>
                      <li>• Participant management</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-brand-primary">Use Cases</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Remote band rehearsals</li>
                      <li>• Album recording sessions</li>
                      <li>• Live concert streaming</li>
                      <li>• Music lessons/coaching</li>
                      <li>• Podcast recording</li>
                    </ul>
                  </div>
                </div>
              </Card>

            </>
          )}
        </motion.div>
      </div>
    </DailyProvider>
  );
}
