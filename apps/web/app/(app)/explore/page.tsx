'use client';

import { motion } from 'framer-motion';
import { Compass, TrendingUp, Clock, Heart, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { TrackCard } from '@/components/track-card';
import { AudioPlayer } from '@/components/audio-player';

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
    const timer = setTimeout(() => {
      fetchTracks();
    }, searchQuery ? 500 : 0);

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
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="bg-brand-primary/10 absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <Compass className="text-brand-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Community Tracks</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Explore</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Discover trending tracks and find inspiration from the community
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl space-y-8 px-4 py-12">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracks, styles, or moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-xl border py-3 pl-11 pr-4 outline-none transition focus:ring-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('trending')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition ${
                filter === 'trending'
                  ? 'bg-brand-primary text-brand-primary-foreground'
                  : 'border-border bg-surface hover:border-brand-primary/50 border'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition ${
                filter === 'recent'
                  ? 'bg-brand-primary text-brand-primary-foreground'
                  : 'border-border bg-surface hover:border-brand-primary/50 border'
              }`}
            >
              <Clock className="h-4 w-4" />
              Recent
            </button>
            <button
              onClick={() => setFilter('top')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition ${
                filter === 'top'
                  ? 'bg-brand-primary text-brand-primary-foreground'
                  : 'border-border bg-surface hover:border-brand-primary/50 border'
              }`}
            >
              <Heart className="h-4 w-4" />
              Top Rated
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-brand-primary h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && tracks.length === 0 && (
          <div className="border-border bg-surface rounded-xl border p-12 text-center">
            <Compass className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">No tracks found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Be the first to share your music with the community!'}
            </p>
          </div>
        )}

        {/* Tracks Grid */}
        {!loading && tracks.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <TrendingUp className="text-brand-primary h-5 w-5" />
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
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur-lg">
            <div className="mx-auto max-w-4xl">
              <AudioPlayer
                trackId={selectedTrack.id}
                audioUrl={selectedTrack.audioUrl}
                title={selectedTrack.song.title}
                artist={selectedTrack.user.name || 'Unknown Artist'}
                coverUrl={selectedTrack.coverUrl}
                waveformData={selectedTrack.waveformData as number[] | undefined}
                duration={selectedTrack.duration}
                onPlayComplete={() => {
                  // Auto-play next track
                  const currentIndex = tracks.findIndex((t) => t.id === selectedTrack.id);
                  if (currentIndex < tracks.length - 1) {
                    setSelectedTrack(tracks[currentIndex + 1]);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
