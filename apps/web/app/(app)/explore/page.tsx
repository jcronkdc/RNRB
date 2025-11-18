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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Compass className="w-8 h-8 text-brand-primary" />
          Explore
        </h1>
        <p className="text-foreground-muted mt-1">
          Discover trending tracks and find inspiration from the community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search tracks, styles, or moods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('trending')}
            className={`chip ${filter === 'trending' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            Trending
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`chip ${filter === 'recent' ? 'active' : ''}`}
          >
            <Clock className="w-4 h-4" />
            Recent
          </button>
          <button
            onClick={() => setFilter('top')}
            className={`chip ${filter === 'top' ? 'active' : ''}`}
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
        <h2 className="text-xl font-semibold mb-4">Popular Prompts</h2>
        
        <div className="space-y-6">
          {examplePrompts.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-medium text-foreground-muted mb-3">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.prompts.map((prompt, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      p-3 rounded-lg bg-surface border border-border
                      hover:border-brand-primary/50 hover:bg-surface-hover
                      cursor-pointer transition-all duration-200
                      text-sm
                    "
                    onClick={() => {
                      // Would copy to clipboard or navigate to create page
                      console.log('Use prompt:', prompt);
                    }}
                  >
                    {prompt}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
