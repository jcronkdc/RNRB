'use client';

import { motion } from 'framer-motion';
import { Compass, TrendingUp, Clock, Heart, Search, Loader2, Sparkles, Music2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { AudioPlayer } from '@/components/audio-player';
import { TrackCard } from '@/components/track-card';

interface CommunityTrack {
  id: string;
  audioUrl: string;
  coverUrl?: string;
  waveformData?: number[];
  duration: number;
  publishedAt: string;
  song: {
    id: string;
    title: string;
    description?: string;
  };
  user: {
    id: string;
    name?: string;
    image?: string;
  };
  _count: {
    likes: number;
    plays: number;
    comments: number;
  };
  isLikedByCurrentUser: boolean;
}

export default function ExplorePage() {
  const [filter, setFilter] = useState<'trending' | 'recent' | 'top'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<CommunityTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<CommunityTrack | null>(null);

  // Fetch tracks
  useEffect(() => {
    async function fetchTracks() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          filter,
          limit: '20',
        });

        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const response = await fetch(`/api/community/tracks?${params}`);
        const data = await response.json();

        if (data.tracks) {
          setTracks(data.tracks);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timer = setTimeout(
      () => {
        fetchTracks();
      },
      searchQuery ? 500 : 0
    );

    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  // Handle like toggle
  const handleLike = async (trackId: string) => {
    try {
      const response = await fetch(`/api/community/tracks/${trackId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setTracks((prev) =>
          prev.map((track) =>
            track.id === trackId
              ? {
                  ...track,
                  isLikedByCurrentUser: data.isLiked,
                  _count: {
                    ...track._count,
                    likes: data.likeCount,
                  },
                }
              : track
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Calculate relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-cyan-500/20 blur-[100px]" />
        <div
          className="absolute -right-32 top-1/4 h-80 w-80 animate-pulse rounded-full bg-purple-500/15 blur-[100px]"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-pulse rounded-full bg-pink-500/10 blur-[100px]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Hero Section */}
      <div className="relative z-10 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 via-black to-purple-900/20">
        <div className="rnrb-container max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Gradient accent bar */}
            <div className="mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm">
                    <Compass className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cyan-400">Community Tracks</p>
                    <h1 className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
                      Explore
                    </h1>
                  </div>
                </div>
                <p className="max-w-2xl text-lg text-gray-400">
                  Discover trending tracks and find inspiration from the community
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">{tracks.length} Tracks</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">AI Generated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container relative z-10 max-w-7xl space-y-8 px-4 py-12">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tracks, styles, or moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white outline-none backdrop-blur-sm transition placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('trending')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition ${
                filter === 'trending'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'border border-white/10 bg-white/5 text-gray-300 hover:border-cyan-500/50 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition ${
                filter === 'recent'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'border border-white/10 bg-white/5 text-gray-300 hover:border-cyan-500/50 hover:bg-white/10'
              }`}
            >
              <Clock className="h-4 w-4" />
              Recent
            </button>
            <button
              onClick={() => setFilter('top')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition ${
                filter === 'top'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'border border-white/10 bg-white/5 text-gray-300 hover:border-cyan-500/50 hover:bg-white/10'
              }`}
            >
              <Heart className="h-4 w-4" />
              Top Rated
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative mx-auto mb-4 h-12 w-12">
                <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/30" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                </div>
              </div>
              <p className="text-gray-400">Discovering tracks...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && tracks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
              <Compass className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No tracks found</h3>
            <p className="text-gray-400">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Be the first to share your music with the community!'}
            </p>
          </motion.div>
        )}

        {/* Tracks Grid */}
        {!loading && tracks.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              {filter === 'trending'
                ? 'Trending Now'
                : filter === 'recent'
                  ? 'Recently Added'
                  : 'Top Rated'}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TrackCard
                    id={track.id}
                    title={track.song.title}
                    artist={track.user.name || 'Unknown Artist'}
                    duration={track.duration}
                    coverUrl={track.coverUrl}
                    waveformData={track.waveformData as number[] | undefined}
                    createdAt={getRelativeTime(track.publishedAt)}
                    plays={track._count.plays}
                    isLiked={track.isLikedByCurrentUser}
                    onPlay={() => setSelectedTrack(track)}
                    onLike={() => handleLike(track.id)}
                    onExtend={() => console.log('Extend', track.id)}
                    onRemix={() => console.log('Remix', track.id)}
                    onDownload={() => window.open(track.audioUrl, '_blank')}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Player (Fixed at bottom when track selected) */}
        {selectedTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 p-4 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-4">
                {selectedTrack.coverUrl && (
                  <img
                    src={selectedTrack.coverUrl}
                    alt={selectedTrack.song.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-white">{selectedTrack.song.title}</p>
                  <p className="text-sm text-white/60">
                    {selectedTrack.user.name || 'Unknown Artist'}
                  </p>
                </div>
              </div>
              <AudioPlayer
                src={selectedTrack.audioUrl}
                name={selectedTrack.song.title}
                onEnded={() => {
                  // Auto-play next track
                  const currentIndex = tracks.findIndex((t) => t.id === selectedTrack.id);
                  if (currentIndex < tracks.length - 1) {
                    setSelectedTrack(tracks[currentIndex + 1]);
                  }
                }}
                autoPlay
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const _unused = { Music2, Sparkles }; // Ensure imports are used
