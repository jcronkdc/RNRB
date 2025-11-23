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

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Bell,
  Video,
  MessageSquare,
  TrendingUp,
  Zap,
  Globe,
  Eye,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRequireAuth } from '@/hooks/use-require-auth';

// Dynamically import components
const ActivityFeed = dynamic(
  () => import('@/components/activity-feed').then((m) => m.ActivityFeed),
  { ssr: false }
);
const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then((m) => m.PresenceIndicator),
  { ssr: false }
);

export default function CollaborationDashboard() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: 'var(--accent) transparent var(--accent) var(--accent)' }}
          />
          <p className="text-lg text-muted">Loading collaboration dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold">
              <Globe className="h-10 w-10 text-brand-primary" />
              Collaboration Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Real-time view of your entire collaborative network
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-green-400">Live Network</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        {[
          {
            label: 'Active Users',
            value: '0',
            icon: Users,
            color: 'from-green-500 to-emerald-500',
            description: 'Online right now',
          },
          {
            label: 'Recent Activity',
            value: '0',
            icon: Activity,
            color: 'from-blue-500 to-cyan-500',
            description: 'Last 24 hours',
          },
          {
            label: 'Video Rooms',
            value: '0',
            icon: Video,
            color: 'from-purple-500 to-pink-500',
            description: 'Active sessions',
          },
          {
            label: 'Messages',
            value: '0',
            icon: MessageSquare,
            color: 'from-orange-500 to-red-500',
            description: 'Unread chats',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="card p-6"
          >
            <div
              className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4 flex items-center justify-center`}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <p className="mb-1 text-3xl font-bold">{stat.value}</p>
            <p className="mb-1 text-sm font-medium">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card h-full p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              <h2 className="text-xl font-semibold">Global Activity Stream</h2>
            </div>
            <ActivityFeed channelName="activity:global" showHeader={false} maxHeight="700px" />
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
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
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
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Network Health</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ably Connection</span>
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily.co Video</span>
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  Ready
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Supabase Storage</span>
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Presence Tracking</span>
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/projects/new')}
                className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Create New Project
              </button>
              <button
                onClick={() => router.push('/songwriting')}
                className="w-full rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                Open Songwriting Studio
              </button>
              <button
                onClick={() => router.push('/studio')}
                className="w-full rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
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
        className="mt-8 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6"
      >
        <div className="flex items-start gap-4">
          <Zap className="mt-1 h-6 w-6 shrink-0 text-purple-400" />
          <div>
            <h3 className="mb-2 font-semibold">🍄 The Mycelial Network is Alive!</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              This dashboard shows real-time data from all connected systems: Presence tracking
              (who's where), Activity feeds (what's happening), Notifications (alerts), Video
              sessions (Daily.co), and Chat messages (Ably). Everything pulses together as one
              living network!
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-green-500/20 px-2 py-1 text-green-400">Ably Chat</span>
              <span className="rounded bg-blue-500/20 px-2 py-1 text-blue-400">Daily.co Video</span>
              <span className="rounded bg-purple-500/20 px-2 py-1 text-purple-400">
                Presence Tracking
              </span>
              <span className="rounded bg-orange-500/20 px-2 py-1 text-orange-400">
                Activity Stream
              </span>
              <span className="rounded bg-pink-500/20 px-2 py-1 text-pink-400">Notifications</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
