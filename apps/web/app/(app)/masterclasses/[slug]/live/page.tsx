'use client';

import { DailyProvider, useCallObject, useDaily } from '@daily-co/daily-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  MessageSquare,
  Hand,
  Share2,
  Settings,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface Masterclass {
  id: string;
  title: string;
  scheduledAt: string;
  liveStreamRoomId: string;
  instructor: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

function LiveSessionContent({
  masterclass,
  token,
  isInstructor,
}: {
  masterclass: Masterclass;
  token: string;
  isInstructor: boolean;
}) {
  const callObject = useCallObject({
    options: {
      url: `https://cronkwaters.daily.co/${masterclass.liveStreamRoomId}`,
      token,
    },
  });

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callObject) return;

    const joinCall = async () => {
      try {
        await callObject.join();
      } catch (err) {
        console.error('Error joining call:', err);
        setError('Failed to join the live session');
      }
    };

    joinCall();

    // Listen for participant updates
    const handleParticipantsUpdate = () => {
      const participants = callObject.participants();
      setParticipantCount(Object.keys(participants).length);
    };

    callObject.on('participant-joined', handleParticipantsUpdate);
    callObject.on('participant-left', handleParticipantsUpdate);

    return () => {
      callObject.leave();
    };
  }, [callObject]);

  const toggleVideo = useCallback(() => {
    if (!callObject) return;
    callObject.setLocalVideo(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  }, [callObject, isVideoOn]);

  const toggleAudio = useCallback(() => {
    if (!callObject) return;
    callObject.setLocalAudio(!isAudioOn);
    setIsAudioOn(!isAudioOn);
  }, [callObject, isAudioOn]);

  const leaveCall = useCallback(async () => {
    if (!callObject) return;
    await callObject.leave();
    window.location.href = `/masterclasses/${masterclass.id}`;
  }, [callObject, masterclass.id]);

  const toggleScreenShare = useCallback(async () => {
    if (!callObject) return;

    if (isScreenSharing) {
      await callObject.stopScreenShare();
      setIsScreenSharing(false);
    } else {
      await callObject.startScreenShare();
      setIsScreenSharing(true);
    }
  }, [callObject, isScreenSharing]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleHandRaise = useCallback(() => {
    // In a real implementation, this would communicate to the instructor
    setIsHandRaised(!isHandRaised);
  }, [isHandRaised]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-(--text)">{error}</h2>
          <Link href={`/masterclasses/${masterclass.id}`}>
            <button className="mt-4 rounded-full bg-(--accent) px-6 py-3 text-(--text)">
              Return to Course
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/logo-dark.png" alt="Logo" width={36} height={36} />
          </Link>
          <div>
            <h1 className="font-bold text-(--text)">{masterclass.title}</h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm text-red-400">LIVE</span>
              <span className="text-sm text-(--muted)">•</span>
              <span className="text-sm text-(--muted)">
                {masterclass.instructor.displayName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-(--panel) px-3 py-1">
            <Users className="h-4 w-4 text-(--accent)" />
            <span className="text-sm text-(--text)">{participantCount}</span>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`rounded-lg p-2 ${showChat ? 'bg-(--accent) text-(--text)' : 'text-(--muted) hover:text-(--text)'}`}
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div
            className="relative h-full w-full overflow-hidden rounded-xl bg-[#111]"
            id="daily-container"
          >
            {/* Daily.co video will render here */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-(--muted)">Connecting to live session...</div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden border-l border-white/10 bg-[#1a1a1a]"
            >
              <div className="flex h-full flex-col p-4">
                <h3 className="mb-4 font-bold text-(--text)">Live Chat</h3>
                <div className="flex-1 overflow-y-auto rounded-lg bg-[#111] p-4">
                  <p className="text-center text-sm text-(--muted)">
                    Chat messages will appear here
                  </p>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Send a message..."
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-2 text-(--text) placeholder-(--muted) focus:outline-hidden focus:ring-2 focus:ring-(--accent)"
                  />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="border-t border-white/10 bg-[#1a1a1a] px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`rounded-full p-4 ${isAudioOn ? 'bg-(--panel) text-(--text)' : 'bg-red-500 text-(--text)'}`}
          >
            {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`rounded-full p-4 ${isVideoOn ? 'bg-(--panel) text-(--text)' : 'bg-red-500 text-(--text)'}`}
          >
            {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          {isInstructor && (
            <button
              onClick={toggleScreenShare}
              className={`rounded-full p-4 ${isScreenSharing ? 'bg-(--accent) text-(--text)' : 'bg-(--panel) text-(--text)'}`}
            >
              <Share2 className="h-6 w-6" />
            </button>
          )}

          {!isInstructor && (
            <button
              onClick={toggleHandRaise}
              className={`rounded-full p-4 ${isHandRaised ? 'bg-yellow-500 text-(--text)' : 'bg-(--panel) text-(--text)'}`}
            >
              <Hand className="h-6 w-6" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="rounded-full bg-(--panel) p-4 text-(--text)"
          >
            {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
          </button>

          <button
            onClick={leaveCall}
            className="rounded-full bg-red-500 p-4 text-(--text) hover:bg-red-600"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ scheduledAt }: { scheduledAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const scheduled = new Date(scheduledAt).getTime();
      const diff = scheduled - now;

      // Allow joining 5 minutes before scheduled time
      if (diff <= 5 * 60 * 1000) {
        setCanJoin(true);
      }

      if (diff <= 0) {
        setTimeLeft('Starting now...');
        setCanJoin(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  return { timeLeft, canJoin };
}

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [masterclass, setMasterclass] = useState<Masterclass | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveSession() {
      try {
        // Get masterclass details
        const classRes = await fetch(`/api/masterclasses/${slug}`);
        if (!classRes.ok) {
          router.push('/masterclasses');
          return;
        }
        const classData = await classRes.json();

        if (classData.masterclass.type !== 'live') {
          router.push(`/masterclasses/${slug}`);
          return;
        }

        setMasterclass(classData.masterclass);
        setIsInstructor(classData.isInstructor);

        // Get Daily.co token for this session
        const tokenRes = await fetch(`/api/masterclasses/${classData.masterclass.id}/live-token`);
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          setToken(tokenData.token);
        }
      } catch (err) {
        console.error('Error loading live session:', err);
        setError('Failed to load live session');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchLiveSession();
    }
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent)" />
          <p className="text-(--muted)">Loading live session...</p>
        </div>
      </div>
    );
  }

  if (error || !masterclass) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-(--text)">
            {error || 'Session not found'}
          </h2>
          <Link href="/masterclasses">
            <button className="mt-4 rounded-full bg-(--accent) px-6 py-3 text-(--text)">
              Browse Masterclasses
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // If session hasn't started yet, show countdown
  const scheduledTime = new Date(masterclass.scheduledAt).getTime();
  const now = Date.now();
  const canJoin = now >= scheduledTime - 5 * 60 * 1000; // 5 minutes before

  if (!canJoin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <div className="text-center">
          <Link href="/" className="mb-8 inline-block">
            <Image src="/logo-dark.png" alt="Logo" width={60} height={60} />
          </Link>

          <div className="max-w-md rounded-2xl border border-(--border) bg-(--panel) p-8">
            <div className="bg-(--accent)/20 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <Clock className="h-8 w-8 text-(--accent)" />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-(--text)">{masterclass.title}</h2>
            <p className="mb-6 text-(--muted)">with {masterclass.instructor.displayName}</p>

            <div className="mb-2 text-4xl font-bold text-(--text)">
              <CountdownDisplay scheduledAt={masterclass.scheduledAt} />
            </div>
            <p className="mb-6 text-sm text-(--muted)">until session starts</p>

            <p className="text-sm text-(--muted)">
              You'll be able to join 5 minutes before the scheduled start time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent)" />
          <p className="text-(--muted)">Getting session access...</p>
        </div>
      </div>
    );
  }

  return (
    <DailyProvider>
      <LiveSessionContent masterclass={masterclass} token={token} isInstructor={isInstructor} />
    </DailyProvider>
  );
}

// Helper component for countdown display
function CountdownDisplay({ scheduledAt }: { scheduledAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const scheduled = new Date(scheduledAt).getTime();
      const diff = scheduled - now;

      if (diff <= 0) {
        setTimeLeft('Starting now!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(
          `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else {
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  return <span>{timeLeft}</span>;
}
