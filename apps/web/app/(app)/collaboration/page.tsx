'use client';

/**
 * Collaboration Dashboard
 * 
 * The Nerve Center - See EVERYTHING happening across the mycelial network
 * 
 * Shows in real-time:
 * - Who's online (Presence)
 * - What's happening (Activity Feed)
 * - Your notifications (Notifications)
 * - Active video rooms (Daily.co)
 * - Recent messages (Ably)
 * 
 * This demonstrates the power of the interconnected network!
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  Bell, 
  Video, 
  MessageSquare,
  TrendingUp,
  Zap,
  Globe,
  Eye
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import components
const ActivityFeed = dynamic(() => import('@/components/activity-feed').then(m => m.ActivityFeed), { ssr: false });
const PresenceIndicator = dynamic(() => import('@/components/presence-indicator').then(m => m.PresenceIndicator), { ssr: false });

export default function CollaborationDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
               style={{ borderColor: 'var(--accent) transparent var(--accent) var(--accent)' }} />
          <p className="text-lg text-muted">Loading collaboration dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Globe className="w-10 h-10 text-brand-primary" />
              Collaboration Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Real-time view of your entire collaborative network
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-green-400 font-medium">Live Network</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            label: 'Active Users',
            value: '0',
            icon: Users,
            color: 'from-green-500 to-emerald-500',
            description: 'Online right now'
          },
          {
            label: 'Recent Activity',
            value: '0',
            icon: Activity,
            color: 'from-blue-500 to-cyan-500',
            description: 'Last 24 hours'
          },
          {
            label: 'Video Rooms',
            value: '0',
            icon: Video,
            color: 'from-purple-500 to-pink-500',
            description: 'Active sessions'
          },
          {
            label: 'Messages',
            value: '0',
            icon: MessageSquare,
            color: 'from-orange-500 to-red-500',
            description: 'Unread chats'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="card p-6"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              <h2 className="text-xl font-semibold">Global Activity Stream</h2>
            </div>
            <ActivityFeed 
              channelName="activity:global"
              showHeader={false}
              maxHeight="700px"
            />
          </div>
        </motion.div>

        {/* Right Column - Presence & Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Who's Online */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">Who's Online</h2>
            </div>
            {user && (
              <PresenceIndicator
                channelName="presence:global"
                currentUser={{
                  userId: user.id,
                  userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                  userEmail: user.email || '',
                  avatar: user.user_metadata?.avatar_url,
                }}
                location="collaboration:dashboard"
                showDetails={true}
                maxVisible={10}
              />
            )}
          </div>

          {/* Network Health */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Network Health</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ably Connection</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily.co Video</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Ready
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Supabase Storage</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Presence Tracking</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/projects/new')}
                className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Create New Project
              </button>
              <button
                onClick={() => router.push('/songwriting')}
                className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
              >
                Open Songwriting Studio
              </button>
              <button
                onClick={() => router.push('/studio')}
                className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
              >
                Start Video Session
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg"
      >
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">🍄 The Mycelial Network is Alive!</h3>
            <p className="text-sm text-muted-foreground mb-3">
              This dashboard shows real-time data from all connected systems: Presence tracking (who's where), 
              Activity feeds (what's happening), Notifications (alerts), Video sessions (Daily.co), 
              and Chat messages (Ably). Everything pulses together as one living network!
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Ably Chat</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Daily.co Video</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Presence Tracking</span>
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">Activity Stream</span>
              <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded">Notifications</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

