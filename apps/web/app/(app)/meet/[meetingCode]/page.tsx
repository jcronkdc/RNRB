'use client';

import DailyIframe from '@daily-co/daily-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Phone,
  MessageSquare,
  Users,
  Settings,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Hand,
  MoreVertical,
  Upload,
  Music,
  FileText,
  Link2 as LinkIcon,
  X,
  Send,
  Paperclip,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Circle,
  Square,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Participant {
  id: string;
  userId?: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  videoOn: boolean;
  audioOn: boolean;
  screenSharing: boolean;
  handRaised: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

interface SharedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const meetingCode = params.meetingCode as string;

  // Meeting state
  const [meeting, setMeeting] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  // Local controls
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Files
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);

  // Audio sharing
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<any>(null);

  // Daily.co
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch meeting details
  useEffect(() => {
    async function fetchMeeting() {
      try {
        const res = await fetch(`/api/meet/${meetingCode}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Meeting not found');
        }
        const data = await res.json();
        setMeeting(data.meeting);
        setParticipants(data.participants || []);
        setSharedFiles(data.meeting.sharedFiles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeeting();
  }, [meetingCode]);

  // Initialize Daily.co call
  const initializeCall = useCallback(async () => {
    if (!meeting?.dailyRoomUrl || !containerRef.current || callFrameRef.current) return;

    try {
      // Join the meeting first to get token
      const joinRes = await fetch(`/api/meet/${meetingCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!joinRes.ok) {
        const data = await joinRes.json();
        throw new Error(data.error || 'Failed to join meeting');
      }

      const joinData = await joinRes.json();

      // Create Daily.co iframe
      const callFrame = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
        },
        showLeaveButton: false,
        showFullscreenButton: false,
      });

      callFrameRef.current = callFrame;

      // Set up event listeners
      callFrame.on('joined-meeting', () => {
        setHasJoined(true);
      });

      callFrame.on('left-meeting', () => {
        handleLeave();
      });

      callFrame.on('participant-joined', (event: any) => {
        updateParticipants();
      });

      callFrame.on('participant-left', (event: any) => {
        updateParticipants();
      });

      callFrame.on('participant-updated', (event: any) => {
        updateParticipants();
      });

      callFrame.on('error', (event: any) => {
        console.error('Daily error:', event);
        setError(event.errorMsg || 'Connection error');
      });

      // Listen for incoming chat messages from other participants
      callFrame.on('app-message', (event: any) => {
        if (event?.data?.type === 'chat' && event?.data?.message) {
          const participantName = event.fromId
            ? callFrame.participants()?.[event.fromId]?.user_name || 'Participant'
            : 'Participant';

          const incomingMessage: ChatMessage = {
            id: `${Date.now()}-${event.fromId}`,
            senderId: event.fromId || 'unknown',
            senderName: participantName,
            message: event.data.message,
            timestamp: new Date(),
            type: 'text',
          };
          setChatMessages((prev) => [...prev, incomingMessage]);
        }
      });

      // Join the room
      await callFrame.join({
        url: meeting.dailyRoomUrl,
        token: joinData.meeting.dailyToken,
        startVideoOff: !videoEnabled,
        startAudioOff: !audioEnabled,
      });
    } catch (err: any) {
      console.error('Failed to initialize call:', err);
      setError(err.message || 'Failed to connect');
    }
  }, [meeting, meetingCode, videoEnabled, audioEnabled]);

  // Update participants list from Daily
  const updateParticipants = useCallback(() => {
    if (!callFrameRef.current) return;

    const dailyParticipants = callFrameRef.current.participants();
    const updated: Participant[] = Object.values(dailyParticipants).map((p: any) => ({
      id: p.user_id || p.session_id,
      userId: p.user_id,
      name: p.user_name || 'Guest',
      avatar: undefined,
      role: p.owner ? 'organizer' : 'participant',
      isOnline: true,
      videoOn: p.video,
      audioOn: p.audio,
      screenSharing: p.screen,
      handRaised: false,
    }));

    setParticipants(updated);
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalVideo(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  }, [videoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  }, [audioEnabled]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (!callFrameRef.current) return;

    if (isScreenSharing) {
      await callFrameRef.current.stopScreenShare();
    } else {
      await callFrameRef.current.startScreenShare();
    }
    setIsScreenSharing(!isScreenSharing);
  }, [isScreenSharing]);

  // Leave meeting
  const handleLeave = useCallback(async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.leave();
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }

    try {
      await fetch(`/api/meet/${meetingCode}/leave`, { method: 'POST' });
    } catch {
      // Best-effort leave — navigate away regardless
    }

    router.push('/meet');
  }, [meetingCode, router]);

  // Copy meeting link
  const copyLink = useCallback(() => {
    if (meeting?.joinUrl) {
      navigator.clipboard.writeText(meeting.joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [meeting]);

  // Send chat message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Send via Daily chat if available
    if (callFrameRef.current) {
      callFrameRef.current.sendAppMessage({ type: 'chat', message: newMessage.trim() }, '*');
    }
  }, [newMessage]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-white/60">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <Video className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Unable to Join</h2>
          <p className="mb-6 text-white/60">{error}</p>
          <Link
            href="/meet"
            className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 font-medium text-white"
          >
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  // Pre-join screen
  if (!hasJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-black via-zinc-950 to-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          {/* RR Logo */}
          <div className="mb-6 flex justify-center">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={64}
                height={64}
                className="object-contain"
              />
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">{meeting?.title || 'Meeting'}</h1>
            <p className="text-white/60">{meeting?.description || 'Ready to join?'}</p>
          </div>

          {/* Preview area */}
          <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl bg-zinc-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-500/20">
                <Video className="h-12 w-12 text-purple-400" />
              </div>
            </div>

            {/* Preview controls */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4">
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`rounded-full p-4 transition-all ${videoEnabled ? 'bg-white/10 text-white' : 'bg-red-500 text-white'} `}
              >
                {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </button>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`rounded-full p-4 transition-all ${audioEnabled ? 'bg-white/10 text-white' : 'bg-red-500 text-white'} `}
              >
                {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Join button */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={initializeCall}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-xs rounded-xl bg-linear-to-r from-purple-500 to-pink-500 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/30"
            >
              Join Meeting
            </motion.button>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy invite link'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // In-meeting UI
  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between border-b border-white/10 bg-zinc-900/50 px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0 transition-transform hover:scale-105">
            <Image
              src="/logo-dark.png"
              alt="RNRB"
              width={32}
              height={32}
              className="object-contain"
            />
          </Link>
          <h1 className="max-w-[200px] truncate font-semibold text-white">{meeting?.title}</h1>
          <span className="font-mono text-sm text-white/40">{meetingCode}</span>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <Circle className="h-3 w-3 animate-pulse fill-red-500" />
              Recording
            </div>
          )}

          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/20"
          >
            {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            {copied ? 'Copied' : 'Invite'}
          </button>

          <button
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/10 p-2 text-white/80 hover:bg-white/20"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Video area */}
        <div className="relative flex-1 p-4">
          <div
            ref={containerRef}
            className="absolute inset-4 overflow-hidden rounded-xl bg-zinc-900"
          />
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {(showChat || showParticipants || showFiles) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col border-l border-white/10 bg-zinc-900"
            >
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => {
                    setShowChat(true);
                    setShowParticipants(false);
                    setShowFiles(false);
                  }}
                  className={`flex-1 py-3 text-sm font-medium ${showChat ? 'border-b-2 border-purple-400 text-purple-400' : 'text-white/60'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => {
                    setShowParticipants(true);
                    setShowChat(false);
                    setShowFiles(false);
                  }}
                  className={`flex-1 py-3 text-sm font-medium ${showParticipants ? 'border-b-2 border-purple-400 text-purple-400' : 'text-white/60'}`}
                >
                  People ({participants.length})
                </button>
                <button
                  onClick={() => {
                    setShowFiles(true);
                    setShowChat(false);
                    setShowParticipants(false);
                  }}
                  className={`flex-1 py-3 text-sm font-medium ${showFiles ? 'border-b-2 border-purple-400 text-purple-400' : 'text-white/60'}`}
                >
                  Files
                </button>
              </div>

              {/* Panel content */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Chat */}
                {showChat && (
                  <>
                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                            <span className="text-xs font-medium text-purple-400">
                              {msg.senderName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium text-white">
                                {msg.senderName}
                              </span>
                              <span className="text-xs text-white/40">
                                {msg.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-white/80">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                      {chatMessages.length === 0 && (
                        <p className="py-8 text-center text-sm text-white/40">No messages yet</p>
                      )}
                    </div>
                    <div className="border-t border-white/10 p-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Send a message..."
                          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-hidden"
                        />
                        <button
                          onClick={sendMessage}
                          className="rounded-lg bg-purple-500 p-2 text-white"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Participants */}
                {showParticipants && (
                  <div className="flex-1 space-y-2 overflow-y-auto p-4">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                            <span className="text-sm font-medium text-purple-400">
                              {p.name.charAt(0)}
                            </span>
                          </div>
                          {p.isOnline && (
                            <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-zinc-900 bg-green-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{p.name}</p>
                          <p className="text-xs text-white/50 capitalize">{p.role}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!p.audioOn && <MicOff className="h-4 w-4 text-red-400" />}
                          {!p.videoOn && <VideoOff className="h-4 w-4 text-red-400" />}
                          {p.screenSharing && <Monitor className="h-4 w-4 text-green-400" />}
                          {p.handRaised && <Hand className="h-4 w-4 text-yellow-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Files */}
                {showFiles && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      {sharedFiles.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                        >
                          <FileText className="h-8 w-8 text-purple-400" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-white/50">Shared by {file.uploadedBy}</p>
                          </div>
                        </a>
                      ))}
                      {sharedFiles.length === 0 && (
                        <p className="py-8 text-center text-sm text-white/40">
                          No files shared yet
                        </p>
                      )}
                    </div>
                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 p-3 text-white/60 transition-colors hover:border-white/40 hover:text-white">
                      <Upload className="h-5 w-5" />
                      Share a file
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="flex h-20 items-center justify-center gap-4 border-t border-white/10 bg-zinc-900/50 px-4">
        {/* Audio */}
        <button
          onClick={toggleAudio}
          className={`rounded-full p-4 transition-all ${audioEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'} `}
        >
          {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>

        {/* Video */}
        <button
          onClick={toggleVideo}
          className={`rounded-full p-4 transition-all ${videoEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'} `}
        >
          {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`rounded-full p-4 transition-all ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'} `}
        >
          <Monitor className="h-6 w-6" />
        </button>

        {/* Hand Raise */}
        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`rounded-full p-4 transition-all ${handRaised ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'} `}
        >
          <Hand className="h-6 w-6" />
        </button>

        <div className="h-8 w-px bg-white/10" />

        {/* Chat */}
        <button
          onClick={() => {
            setShowChat(!showChat);
            setShowParticipants(false);
            setShowFiles(false);
          }}
          className={`rounded-full p-4 transition-all ${showChat ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'} `}
        >
          <MessageSquare className="h-6 w-6" />
        </button>

        {/* Participants */}
        <button
          onClick={() => {
            setShowParticipants(!showParticipants);
            setShowChat(false);
            setShowFiles(false);
          }}
          className={`relative rounded-full p-4 transition-all ${showParticipants ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'} `}
        >
          <Users className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs">
            {participants.length}
          </span>
        </button>

        {/* Files */}
        <button
          onClick={() => {
            setShowFiles(!showFiles);
            setShowChat(false);
            setShowParticipants(false);
          }}
          className={`rounded-full p-4 transition-all ${showFiles ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'} `}
        >
          <FileText className="h-6 w-6" />
        </button>

        <div className="h-8 w-px bg-white/10" />

        {/* Leave */}
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600"
        >
          <Phone className="h-5 w-5 rotate-135" />
          Leave
        </button>
      </div>
    </div>
  );
}
