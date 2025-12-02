'use client';

import { motion } from 'framer-motion';
import {
  Radio,
  Calendar,
  Play,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  status: string;
  thumbnailUrl?: string;
  viewerCount: number;
  peakViewerCount: number;
  startedAt?: string;
  scheduledAt?: string;
  streamer: {
    id: string;
    name: string;
    avatar?: string;
  };
}

function LiveStreamCard({ stream, featured = false }: { stream: LiveStream; featured?: boolean }) {
  const isLive = stream.status === 'live';
  const timeSinceStart = stream.startedAt
    ? Math.floor((Date.now() - new Date(stream.startedAt).getTime()) / 60000)
    : 0;

  return (
    <Link href={`/live/${stream.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black ${featured ? 'aspect-video md:aspect-[21/9]' : 'aspect-video'} `}
      >
        {/* Thumbnail */}
        {stream.thumbnailUrl ? (
          <Image
            src={stream.thumbnailUrl}
            alt={stream.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 to-amber-900/50" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Live badge */}
        {isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-red-500 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
              </span>
              <span className="text-xs font-bold uppercase text-white">Live</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
              <Users className="h-3 w-3 text-white" />
              <span className="text-xs text-white">{stream.viewerCount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Scheduled badge */}
        {!isLive && stream.scheduledAt && (
          <div className="absolute left-3 top-3">
            <div className="flex items-center gap-2 rounded-full bg-amber-500/80 px-3 py-1 backdrop-blur-sm">
              <Calendar className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">
                {new Date(stream.scheduledAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-3">
            {/* Streamer avatar */}
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20">
              {stream.streamer.avatar ? (
                <Image
                  src={stream.streamer.avatar}
                  alt={stream.streamer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-white">
                  {stream.streamer.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Stream info */}
            <div className="min-w-0 flex-1">
              <h3 className={`truncate font-bold text-white ${featured ? 'text-xl' : 'text-sm'}`}>
                {stream.title}
              </h3>
              <p className="truncate text-sm text-white/70">{stream.streamer.name}</p>
              {featured && stream.description && (
                <p className="mt-1 line-clamp-2 hidden text-sm text-white/50 md:block">
                  {stream.description}
                </p>
              )}
            </div>

            {/* Watch button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Play className="ml-0.5 h-5 w-5 text-white" />
            </motion.div>
          </div>

          {/* Tags */}
          {stream.tags.length > 0 && (
            <div className="mt-3 flex gap-2">
              {stream.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function LivePage() {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [scheduledStreams, setScheduledStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStreams() {
      try {
        const [liveRes, scheduledRes] = await Promise.all([
          fetch('/api/live?status=live'),
          fetch('/api/live?status=scheduled'),
        ]);

        if (liveRes.ok) {
          const data = await liveRes.json();
          setLiveStreams(data.streams);
        }

        if (scheduledRes.ok) {
          const data = await scheduledRes.json();
          setScheduledStreams(data.streams);
        }
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStreams();
    const interval = setInterval(fetchStreams, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const featuredStream = liveStreams[0];
  const otherLiveStreams = liveStreams.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="flex items-center gap-2 text-xl font-bold text-white">
                <Radio className="h-5 w-5 text-red-500" />
                Live
              </h1>
            </div>

            {/* Go Live button */}
            <Link href="/live/go">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 font-semibold text-white shadow-lg shadow-red-500/30"
              >
                <Sparkles className="h-4 w-4" />
                Go Live
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              <p className="text-white/60">Loading streams...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured live stream */}
            {featuredStream && (
              <section className="mb-12">
                <div className="mb-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                  </span>
                  <h2 className="text-xl font-bold text-white">Featured Live Now</h2>
                </div>
                <LiveStreamCard stream={featuredStream} featured />
              </section>
            )}

            {/* Other live streams */}
            {otherLiveStreams.length > 0 && (
              <section className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <Radio className="h-5 w-5 text-red-500" />
                    Live Now
                    <span className="text-sm font-normal text-white/50">
                      ({liveStreams.length} streaming)
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {otherLiveStreams.map((stream) => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              </section>
            )}

            {/* Scheduled streams */}
            {scheduledStreams.length > 0 && (
              <section className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <Calendar className="h-5 w-5 text-amber-500" />
                    Upcoming Streams
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scheduledStreams.map((stream) => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {liveStreams.length === 0 && scheduledStreams.length === 0 && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <Radio className="h-10 w-10 text-white/30" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">No Live Streams</h2>
                <p className="mx-auto mb-6 max-w-md text-white/60">
                  No one is streaming right now. Be the first to go live!
                </p>
                <Link href="/live/go">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30"
                  >
                    <Sparkles className="h-5 w-5" />
                    Start Streaming
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
