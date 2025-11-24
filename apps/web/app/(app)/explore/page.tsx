'use client';

import { motion } from 'framer-motion';
import { Compass, TrendingUp, Clock, Heart, Search } from 'lucide-react';
import { useState } from 'react';

import { TrackCard } from '@/components/track-card';

// Mock trending tracks
const mockTrendingTracks = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Community',
    duration: 225,
    createdAt: '1 hour ago',
    plays: 1234,
    coverUrl: undefined,
    isLiked: true,
  },
  {
    id: '2',
    title: 'Cosmic Journey',
    artist: 'Community',
    duration: 180,
    createdAt: '3 hours ago',
    plays: 892,
    coverUrl: undefined,
  },
  {
    id: '3',
    title: 'Urban Pulse',
    artist: 'Community',
    duration: 195,
    createdAt: '5 hours ago',
    plays: 567,
    coverUrl: undefined,
  },
  {
    id: '4',
    title: 'Digital Rain',
    artist: 'Community',
    duration: 240,
    createdAt: 'Yesterday',
    plays: 445,
    coverUrl: undefined,
  },
];

// Example prompts
const examplePrompts = [
  {
    category: 'Electronic',
    prompts: [
      'Synthwave track with retro 80s vibes',
      'Dark techno with heavy bass and industrial sounds',
      'Ambient electronic with ethereal pads',
    ],
  },
  {
    category: 'Rock',
    prompts: [
      'Classic rock anthem with powerful guitar solos',
      'Progressive rock with complex time signatures',
      'Indie rock with dreamy vocals',
    ],
  },
  {
    category: 'Hip Hop',
    prompts: [
      'Lo-fi hip hop beat for studying',
      'Trap beat with heavy 808s',
      'Boom bap with jazzy samples',
    ],
  },
];

export default function ExplorePage() {
  const [filter, setFilter] = useState<'trending' | 'recent' | 'top'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* Trending Tracks */}
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
            {mockTrendingTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TrackCard
                  {...track}
                  onPlay={() => console.log('Play', track.id)}
                  onExtend={() => console.log('Extend', track.id)}
                  onRemix={() => console.log('Remix', track.id)}
                  onDownload={() => console.log('Download', track.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Example Prompts */}
        <div>
          <h2 className="font-display mb-6 text-2xl font-bold">Popular Prompts</h2>

          <div className="space-y-6">
            {examplePrompts.map((category) => (
              <div key={category.category}>
                <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wider">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {category.prompts.map((prompt, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="border-border bg-surface hover:border-brand-primary/50 hover:bg-surface/80 cursor-pointer rounded-xl border p-4 transition-all duration-200"
                      onClick={() => {
                        // Would copy to clipboard or navigate to create page
                        console.log('Use prompt:', prompt);
                      }}
                    >
                      <p className="text-sm">{prompt}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
