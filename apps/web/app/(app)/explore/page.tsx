'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  TrendingUp, 
  Clock, 
  Heart, 
  Play,
  Filter,
  Search
} from 'lucide-react';
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
    coverUrl: null,
    isLiked: true,
  },
  {
    id: '2',
    title: 'Cosmic Journey',
    artist: 'Community',
    duration: 180,
    createdAt: '3 hours ago',
    plays: 892,
    coverUrl: null,
  },
  {
    id: '3',
    title: 'Urban Pulse',
    artist: 'Community',
    duration: 195,
    createdAt: '5 hours ago',
    plays: 567,
    coverUrl: null,
  },
  {
    id: '4',
    title: 'Digital Rain',
    artist: 'Community',
    duration: 240,
    createdAt: 'Yesterday',
    plays: 445,
    coverUrl: null,
  },
];

// Example prompts
const examplePrompts = [
  { category: 'Electronic', prompts: [
    'Synthwave track with retro 80s vibes',
    'Dark techno with heavy bass and industrial sounds',
    'Ambient electronic with ethereal pads',
  ]},
  { category: 'Rock', prompts: [
    'Classic rock anthem with powerful guitar solos',
    'Progressive rock with complex time signatures',
    'Indie rock with dreamy vocals',
  ]},
  { category: 'Hip Hop', prompts: [
    'Lo-fi hip hop beat for studying',
    'Trap beat with heavy 808s',
    'Boom bap with jazzy samples',
  ]},
];

export default function ExplorePage() {
  const [filter, setFilter] = useState<'trending' | 'recent' | 'top'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-7xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Compass className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Community Tracks</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Explore</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover trending tracks and find inspiration from the community
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl py-12 px-4 space-y-8">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tracks, styles, or moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2.5 rounded-xl font-medium transition flex items-center gap-2 ${
                filter === 'trending'
                  ? 'bg-brand-primary text-brand-primary-foreground'
                  : 'bg-surface border border-border hover:border-brand-primary/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2.5 rounded-xl font-medium transition flex items-center gap-2 ${
                filter === 'recent'
                  ? 'bg-brand-primary text-brand-primary-foreground'
                  : 'bg-surface border border-border hover:border-brand-primary/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Recent
            </button>
            <button
              onClick={() => setFilter('top')}
              className={`px-4 py-2.5 rounded-xl font-medium transition flex items-center gap-2 ${
                filter === 'top'
                  ? 'bg-brand-primary text-brand-primary-foreground'
                  : 'bg-surface border border-border hover:border-brand-primary/50'
              }`}
            >
              <Heart className="w-4 h-4" />
              Top Rated
            </button>
          </div>
        </div>

      {/* Trending Tracks */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-primary" />
          {filter === 'trending' ? 'Trending Now' : filter === 'recent' ? 'Recently Added' : 'Top Rated'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <h2 className="text-2xl font-display font-bold mb-6">Popular Prompts</h2>
          
          <div className="space-y-6">
            {examplePrompts.map((category) => (
              <div key={category.category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.prompts.map((prompt, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl bg-surface border border-border hover:border-brand-primary/50 hover:bg-surface/80 cursor-pointer transition-all duration-200"
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
