'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Users,
  Clock,
  Share2,
  Heart,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Bell,
  BellOff,
  ExternalLink,
  ArrowLeft,
  X,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { FloatingReactions, ReactionBar } from '@/components/live/floating-reactions';
import { LiveChat } from '@/components/live/live-chat';
import { VideoPlayer } from '@/components/live/video-player';
import { useLiveStream, Reaction } from '@/hooks/use-live-stream';

export default function WatchLivePage() {
  const params = useParams();
  const streamId = params.streamId as string;

  const {
    stream,
    viewerSession,
    chatMessages,
    reactions,
    error,
    isLoading,
    joinStream,
    leaveStream,
    sendMessage,
    sendReaction,
    refreshStream,
  } = useLiveStream(streamId);

  const [showChat, setShowChat] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [shared, setShared] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Join stream on mount
  useEffect(() => {
    joinStream();
    return () => {
      leaveStream();
    };
  }, [joinStream, leaveStream]);

  // Refresh stream periodically
  useEffect(() => {
    const interval = setInterval(refreshStream, 10000);
    return () => clearInterval(interval);
  }, [refreshStream]);

  // Duration tracking
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (stream?.startedAt && stream.status === 'live') {
      const updateDuration = () => {
        const start = new Date(stream.startedAt!).getTime();
        setDuration(Math.floor((Date.now() - start) / 1000));
      };
      updateDuration();
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    }
  }, [stream?.startedAt, stream?.status]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: stream?.title || 'Live Stream',
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleFollow = async () => {
    // TODO: Implement follow/unfollow
    setIsFollowing(!isFollowing);
  };

  const handleToggleNotifications = async () => {
    // TODO: Implement notification toggle
    setHasNotifications(!hasNotifications);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-white/60">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
            <Radio className="h-10 w-10 text-white/30" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Stream Not Found</h2>
          <p className="mb-6 text-white/60">
            {error || 'This stream may have ended or been removed.'}
          </p>
          <Link
            href="/live"
            className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 font-medium text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Live
          </Link>
        </div>
      </div>
    );
  }

  const isLive = stream.status === 'live';

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Mobile */}
      {isMobileView && (
        <div className="fixed left-0 right-0 top-0 z-20 bg-gradient-to-b from-black via-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <Link href="/live">
              <ArrowLeft className="h-6 w-6 text-white" />
            </Link>
            <div className="flex items-center gap-3">
              {isLive && (
                <div className="flex items-center gap-2 rounded-full bg-red-500 px-2 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                  </span>
                  <span className="text-xs font-bold text-white">LIVE</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-white/70">
                <Users className="h-4 w-4" />
                {stream.viewerCount || 0}
              </div>
            </div>
            <button onClick={() => setShowChat(!showChat)}>
              <MessageSquare
                className={`h-6 w-6 ${showChat ? 'text-purple-500' : 'text-white/70'}`}
              />
            </button>
          </div>
        </div>
      )}

      <div className={`flex ${isMobileView ? 'flex-col' : 'h-screen'}`}>
        {/* Main content area */}
        <div className={`${isMobileView ? 'w-full' : showChat ? 'flex-1' : 'w-full'} relative`}>
          {/* Video player */}
          <div className={`relative ${isMobileView ? 'aspect-video' : 'h-full'} bg-black`}>
            <VideoPlayer
              playbackId={stream.playbackId || ''}
              streamId={stream.id}
              title={stream.title}
              isLive={isLive}
              viewerCount={stream.viewerCount}
            />

            {/* Floating reactions overlay */}
            {stream.reactionsEnabled && (
              <FloatingReactions reactions={reactions} onReact={sendReaction} />
            )}

            {/* Desktop header overlay */}
            {!isMobileView && (
              <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <Link
                    href="/live"
                    className="flex items-center gap-2 text-white/80 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <Image
                      src="/logo-dark.png"
                      alt="Rock N' Roll Basement"
                      width={100}
                      height={32}
                      className="h-6 w-auto"
                    />
                  </Link>

                  <div className="flex items-center gap-4">
                    {isLive && (
                      <>
                        <div className="flex items-center gap-2 rounded-full bg-red-500 px-3 py-1">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                          </span>
                          <span className="text-sm font-bold text-white">LIVE</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80">
                          <Clock className="h-4 w-4" />
                          <span className="font-mono text-sm">{formatDuration(duration)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{stream.viewerCount?.toLocaleString() || 0}</span>
                    </div>

                    <button
                      onClick={() => setShowChat(!showChat)}
                      className={`rounded-full p-2 transition-colors ${showChat ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'} `}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom info overlay (desktop) */}
            {!isMobileView && (
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                <div className="flex items-end justify-between">
                  {/* Streamer info */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/20">
                      {stream.streamer.avatar ? (
                        <Image
                          src={stream.streamer.avatar}
                          alt={stream.streamer.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
                          {stream.streamer.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">{stream.title}</h1>
                      <p className="text-white/70">{stream.streamer.name}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={handleFollow}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors ${
                        isFollowing
                          ? 'bg-white/20 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      } `}
                    >
                      <Heart className={`h-4 w-4 ${isFollowing ? 'fill-white' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </motion.button>

                    <button
                      onClick={handleToggleNotifications}
                      className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20"
                      title={hasNotifications ? 'Disable notifications' : 'Enable notifications'}
                    >
                      {hasNotifications ? (
                        <Bell className="h-5 w-5" />
                      ) : (
                        <BellOff className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20"
                    >
                      {shared ? (
                        <span className="px-2 text-sm text-green-400">Copied!</span>
                      ) : (
                        <Share2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile stream info */}
          {isMobileView && (
            <div className="border-b border-white/10 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/20">
                  {stream.streamer.avatar ? (
                    <Image
                      src={stream.streamer.avatar}
                      alt={stream.streamer.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white">
                      {stream.streamer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-white">{stream.title}</h1>
                  <p className="text-sm text-white/60">{stream.streamer.name}</p>
                </div>
                <motion.button
                  onClick={handleFollow}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    isFollowing
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  } `}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
              </div>

              {/* Reaction bar for mobile */}
              {stream.reactionsEnabled && <ReactionBar onReact={sendReaction} />}
            </div>
          )}
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {showChat && stream.chatEnabled && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobileView ? '100%' : 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={` ${isMobileView ? 'flex-1' : 'h-full'} flex flex-col border-l border-white/10 bg-zinc-900`}
            >
              <LiveChat
                messages={chatMessages}
                onSend={sendMessage}
                isAuthenticated={viewerSession?.isAuthenticated ?? false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile reaction bar fixed at bottom */}
      {isMobileView && stream.reactionsEnabled && !showChat && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <ReactionBar onReact={sendReaction} />
        </div>
      )}
    </div>
  );
}
