'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Music2, 
  Sparkles, 
  Folder, 
  Library, 
  Users2, 
  MessageSquare,
  TrendingUp,
  Clock,
  Play,
  ArrowRight,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import { TrackCard } from '@/components/track-card';
import { EmptyState, LoadingState } from '@/components/empty-states';

// Mock data for recent tracks
const mockRecentTracks = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist: 'AI Generated',
    duration: 180,
    createdAt: '2 hours ago',
    plays: 45,
    coverUrl: null,
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'AI Generated', 
    duration: 210,
    createdAt: 'Yesterday',
    plays: 123,
    coverUrl: null,
  },
  {
    id: '3',
    title: 'Electric Dreams',
    artist: 'AI Generated',
    duration: 195,
    createdAt: '3 days ago',
    plays: 89,
    coverUrl: null,
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentTracks, setRecentTracks] = useState(mockRecentTracks);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return <LoadingState message="Loading your workspace..." />;
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artist';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-foreground-muted mt-1">
          Your AI music creation workspace awaits
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="card p-4">
          <div className="flex items-center gap-2 text-foreground-muted mb-1">
            <Folder className="w-4 h-4" />
            <span className="text-sm">Projects</span>
          </div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-foreground-muted">2 active</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-foreground-muted mb-1">
            <Music2 className="w-4 h-4" />
            <span className="text-sm">Tracks</span>
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-foreground-muted">+3 this week</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-foreground-muted mb-1">
            <Users2 className="w-4 h-4" />
            <span className="text-sm">Collaborators</span>
          </div>
          <p className="text-2xl font-bold">5</p>
          <p className="text-xs text-foreground-muted">2 online</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-foreground-muted mb-1">
            <Play className="w-4 h-4" />
            <span className="text-sm">Total Plays</span>
          </div>
          <p className="text-2xl font-bold">234</p>
          <p className="text-xs text-foreground-muted">+45 today</p>
        </div>
      </motion.div>

      {/* Recent Tracks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Tracks</h2>
          <Link href="/projects" className="text-sm text-brand-primary hover:underline">
            View all tracks
          </Link>
        </div>
        
        {recentTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTracks.slice(0, 3).map((track) => (
              <TrackCard
                key={track.id}
                {...track}
                onPlay={() => console.log('Play', track.id)}
                onExtend={() => router.push('/create')}
                onRemix={() => console.log('Remix', track.id)}
                onDownload={() => console.log('Download', track.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            type="tracks"
            title="No tracks yet"
            description="Create your first AI-generated track to get started"
          />
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/create">
              <div className="
                card p-6 cursor-pointer h-full
                border-2 border-brand-primary/20
                hover:border-brand-primary hover:shadow-glow
                transition-all duration-200 group
              ">
                <div className="flex items-center justify-between mb-4">
                  <div className="
                    w-12 h-12 rounded-lg bg-brand-primary/10
                    flex items-center justify-center
                  ">
                    <Sparkles className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold mb-1">Create Track</h3>
                <p className="text-sm text-foreground-muted">
                  Generate AI music instantly
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/projects/new">
              <div className="
                card p-6 cursor-pointer h-full
                hover:shadow-lg transition-all duration-200 group
              ">
                <div className="flex items-center justify-between mb-4">
                  <div className="
                    w-12 h-12 rounded-lg bg-surface-hover
                    flex items-center justify-center
                  ">
                    <Folder className="w-6 h-6 text-foreground" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold mb-1">New Project</h3>
                <p className="text-sm text-foreground-muted">
                  Organize your albums & EPs
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/library">
              <div className="
                card p-6 cursor-pointer h-full
                hover:shadow-lg transition-all duration-200 group
              ">
                <div className="flex items-center justify-between mb-4">
                  <div className="
                    w-12 h-12 rounded-lg bg-surface-hover
                    flex items-center justify-center
                  ">
                    <Library className="w-6 h-6 text-foreground" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold mb-1">Browse Library</h3>
                <p className="text-sm text-foreground-muted">
                  Your stems & assets
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/explore">
              <div className="
                card p-6 cursor-pointer h-full
                hover:shadow-lg transition-all duration-200 group
              ">
                <div className="flex items-center justify-between mb-4">
                  <div className="
                    w-12 h-12 rounded-lg bg-surface-hover
                    flex items-center justify-center
                  ">
                    <Compass className="w-6 h-6 text-foreground" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold mb-1">Explore</h3>
                <p className="text-sm text-foreground-muted">
                  Find inspiration
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { icon: Sparkles, text: 'Generated "Summer Vibes" track', time: '2 hours ago', color: 'text-brand-primary' },
            { icon: Users2, text: 'Alex joined your "New Album" project', time: '5 hours ago', color: 'text-brand-secondary' },
            { icon: MessageSquare, text: 'New comment on "Midnight Drive"', time: 'Yesterday', color: 'text-info' },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + (index * 0.05) }}
              className="
                card p-4 flex items-center gap-3
                hover:bg-surface-hover transition-colors
              "
            >
              <div className={`
                w-10 h-10 rounded-lg bg-surface-hover
                flex items-center justify-center
              `}>
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-foreground-muted">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}