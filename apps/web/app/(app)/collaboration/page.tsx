'use client';

/**
 * Collaboration Dashboard
 *
 * The Nerve Center - See EVERYTHING happening across the mycelial network
 */

import { motion } from 'motion/react';
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
} from '@/components/ui/custom-icons';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CollaborationSkeleton } from '@/components/loading-skeletons';
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
    return <CollaborationSkeleton />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* White RR Logo - Centered at top */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex flex-col items-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              {/* Accent bar */}
              <div className="mb-4 h-1 w-12 rounded-full" style={{ background: 'var(--accent)' }} />
              <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-white">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'var(--panel)' }}
                >
                  <Globe className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                Collaboration Hub
              </h1>
              <p className="max-w-xl" style={{ color: 'var(--muted)' }}>
                Real-time view of your collaborative network. See who's online, what's happening,
                and connect instantly.
              </p>
            </div>

            {/* Live indicator */}
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
              }}
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-sm font-medium text-green-400">Live</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Active Users', value: '0', icon: Users, description: 'Online now' },
            { label: 'Activity', value: '0', icon: Activity, description: 'Last 24h' },
            { label: 'Video Rooms', value: '0', icon: Video, description: 'Active' },
            { label: 'Messages', value: '0', icon: MessageSquare, description: 'Unread' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-5 transition-colors hover:bg-(--panel-hover)"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'var(--bg)' }}
              >
                <stat.icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm font-medium text-(--text-secondary)">{stat.label}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2">
            <div
              className="h-full rounded-xl p-6"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'var(--bg)' }}
                >
                  <TrendingUp className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Activity Stream</h2>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Real-time updates
                  </p>
                </div>
              </div>
              <ActivityFeed channelName="activity:global" showHeader={false} maxHeight="700px" />
            </div>
          </div>

          {/* Right Column - Presence & Quick Actions */}
          <div className="space-y-4">
            {/* Who's Online */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'var(--bg)' }}
                >
                  <Eye className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Who's Online</h2>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Active collaborators
                  </p>
                </div>
              </div>
              {user && (
                <PresenceIndicator
                  channelName="presence:global"
                  currentUser={{
                    userId: user.id,
                    userName: user.name || user.email?.split('@')[0] || 'User',
                    userEmail: user.email || '',
                    avatar: user.image,
                  }}
                  location="collaboration:dashboard"
                  showDetails={true}
                  maxVisible={10}
                />
              )}
            </div>

            {/* Network Health */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'var(--bg)' }}
                >
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Network Health</h2>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    System status
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Ably Connection', status: 'Connected' },
                  { label: 'Daily.co Video', status: 'Ready' },
                  { label: 'Supabase Storage', status: 'Online' },
                  { label: 'Presence Tracking', status: 'Active' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>
                      {item.label}
                    </span>
                    <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: 'var(--bg)' }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {/* Primary Actions - Video & Live */}
                <button
                  onClick={() => router.push('/meet')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <Video className="h-4 w-4" />
                  Start Video Meeting
                </button>
                <button
                  onClick={() => router.push('/meet')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <Radio className="h-4 w-4" />
                  Go Live Stream
                </button>

                {/* Secondary Actions */}
                <div className="pt-2">
                  <p
                    className="mb-2 text-xs font-medium tracking-wider uppercase"
                    style={{ color: 'var(--muted)' }}
                  >
                    More
                  </p>
                  <button
                    onClick={() => router.push('/masterclasses')}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--panel-hover)"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-500/20">
                      <span className="text-xs">🎓</span>
                    </span>
                    Masterclasses
                  </button>
                  <button
                    onClick={() => router.push('/projects/new')}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--panel-hover)"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--accent-glow)">
                      <span className="text-xs">+</span>
                    </span>
                    New Project
                  </button>
                  <button
                    onClick={() => router.push('/studio')}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--panel-hover)"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--sage)/20">
                      <span className="text-xs">🎙️</span>
                    </span>
                    Recording Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div
          className="mt-8 rounded-xl p-5"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'var(--bg)' }}
            >
              <Radio className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">The Mycelial Network</h3>
              <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                Real-time data from all connected systems: Presence tracking, Activity feeds,
                Notifications, Video sessions, and Chat messages.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Ably Chat', 'Daily.co Video', 'Presence', 'Activity', 'Notifications'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
