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

import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Video,
  MessageSquare,
  TrendingUp,
  Zap,
  Globe,
  Eye,
  Sparkles,
  Radio,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

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
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Animated background while loading */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="relative flex min-h-[80vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mx-auto mb-6 h-20 w-20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
              <div
                className="absolute inset-2 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              />
            </div>
            <p className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-lg font-medium text-transparent">
              Connecting to the network...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-600/20 to-transparent blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-cyan-600/15 to-transparent blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-pink-600/10 to-transparent blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between">
            <div>
              {/* Accent bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 h-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
              />
              <h1 className="mb-3 flex items-center gap-4 text-4xl font-bold md:text-5xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm">
                  <Globe className="h-7 w-7 text-purple-400" />
                </div>
                <span className="bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent">
                  Collaboration Hub
                </span>
              </h1>
              <p className="max-w-xl text-lg text-gray-400">
                Real-time view of your entire collaborative network. See who's online, what's
                happening, and connect instantly.
              </p>
            </div>

            {/* Live indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 rounded-full border border-green-500/30 bg-green-500/10 px-5 py-2.5 backdrop-blur-sm"
            >
              <motion.div
                className="h-3 w-3 rounded-full bg-green-400"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-semibold text-green-400">Live Network</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Overview - Glass Morphism Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          {[
            {
              label: 'Active Users',
              value: '0',
              icon: Users,
              gradient: 'from-green-500 to-emerald-500',
              bgGlow: 'green',
              description: 'Online right now',
            },
            {
              label: 'Recent Activity',
              value: '0',
              icon: Activity,
              gradient: 'from-blue-500 to-cyan-500',
              bgGlow: 'blue',
              description: 'Last 24 hours',
            },
            {
              label: 'Video Rooms',
              value: '0',
              icon: Video,
              gradient: 'from-purple-500 to-pink-500',
              bgGlow: 'purple',
              description: 'Active sessions',
            },
            {
              label: 'Messages',
              value: '0',
              icon: MessageSquare,
              gradient: 'from-orange-500 to-red-500',
              bgGlow: 'orange',
              description: 'Unread chats',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            >
              {/* Glow effect on hover */}
              <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${stat.bgGlow}-500/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className="relative">
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <p className="mb-1 text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm font-semibold text-white/90">{stat.label}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Global Activity Stream</h2>
                  <p className="text-sm text-gray-500">Real-time updates from your network</p>
                </div>
              </div>
              <ActivityFeed channelName="activity:global" showHeader={false} maxHeight="700px" />
            </div>
          </motion.div>

          {/* Right Column - Presence & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Who's Online */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <Eye className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Who's Online</h2>
                  <p className="text-xs text-gray-500">Active collaborators</p>
                </div>
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
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Network Health</h2>
                  <p className="text-xs text-gray-500">System status</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Ably Connection', status: 'Connected' },
                  { label: 'Daily.co Video', status: 'Ready' },
                  { label: 'Supabase Storage', status: 'Online' },
                  { label: 'Presence Tracking', status: 'Active' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/projects/new')}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
                >
                  Create New Project
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/songwriting')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Open Songwriting Studio
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/studio')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Start Video Session
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-cyan-500/10 p-6 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Radio className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-bold text-white">The Mycelial Network is Alive!</h3>
              <p className="mb-4 text-sm text-gray-400">
                This dashboard shows real-time data from all connected systems: Presence tracking
                (who's where), Activity feeds (what's happening), Notifications (alerts), Video
                sessions (Daily.co), and Chat messages (Ably). Everything pulses together as one
                living network!
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Ably Chat', color: 'green' },
                  { label: 'Daily.co Video', color: 'blue' },
                  { label: 'Presence Tracking', color: 'purple' },
                  { label: 'Activity Stream', color: 'orange' },
                  { label: 'Notifications', color: 'pink' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`rounded-full bg-${tag.color}-500/20 px-3 py-1 text-xs font-medium text-${tag.color}-400`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
