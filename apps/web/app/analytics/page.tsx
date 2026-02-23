'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Music,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Video,
  Sparkles,
  Target,
  Award,
  Plus,
  BarChart3,
  Flame,
  FileAudio,
  FolderOpen,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Trophy,
  Star,
  GitBranch,
  Activity,
  HardDrive,
  RefreshCcw,
  Loader2,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

export default function AnalyticsPage() {
  const { user, loading } = useRequireAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSongs: 0,
    totalSessions: 0,
    totalHours: 0,
    collaborators: 0,
    thisWeekSongs: 0,
    thisWeekHours: 0,
    streakDays: 0,
    storageUsed: 0,
    storageTotal: 0,
    subscriptionTier: 'free',
  });

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalProjects: data.projectCount || 0,
          totalSongs: data.songCount || 0,
          totalSessions: data.recentActivity || 0,
          totalHours: data.thisWeekHours || 0,
          collaborators: data.collaboratorCount || 0,
          thisWeekSongs: data.thisWeekSongs || 0,
          thisWeekHours: data.thisWeekHours || 0,
          streakDays: data.streakDays || 0,
          storageUsed: data.storageUsed || 0,
          storageTotal: data.storageTotal || 0,
          subscriptionTier: data.subscriptionTier || 'free',
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Format storage size
  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  // Storage percentage
  const storagePercentage =
    stats.storageTotal > 0 ? Math.round((stats.storageUsed / stats.storageTotal) * 100) : 0;

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2
            className="mx-auto mb-4 h-12 w-12 animate-spin"
            style={{ color: 'var(--accent)' }}
          />
          <p style={{ color: 'var(--muted)' }}>Loading analytics...</p>
        </motion.div>
      </div>
    );
  }

  const isEmpty = stats.totalProjects === 0 && stats.totalSongs === 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Premium Hero */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12">
          {/* White RR Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex flex-col items-center"
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div
              className="mb-4 inline-flex items-center gap-3 rounded-full px-6 py-3"
              style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid var(--border)' }}
            >
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <span className="font-bold" style={{ color: 'var(--accent)' }}>
                ANALYTICS
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: 'var(--text)' }}>
              Your Creative Journey
            </h1>
            <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--muted)' }}>
              Track your progress, celebrate wins, and see how your music is growing
            </p>

            {/* Refresh Button */}
            <button
              onClick={fetchStats}
              disabled={isRefreshing}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
            </button>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl px-4 py-12">
        {isEmpty ? (
          /* Empty State */
          <Card className="rnrb-card p-16 text-center">
            <TrendingUp className="mx-auto mb-6 h-20 w-20 text-muted-foreground/50" />
            <h2 className="font-display mb-4 text-3xl font-bold">
              Start Creating to See Your Progress
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Your analytics dashboard will come alive as you create projects, add songs, and log
              sessions. Every creative action builds your story.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/projects/new">
                <Button className="rnrb-button-primary flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
                  <Plus className="h-5 w-5" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="rnrb-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                      <Music className="h-6 w-6 text-brand-primary" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.totalSongs}</p>
                  <p className="text-sm text-muted-foreground">Songs Created</p>
                  <p className="mt-2 text-xs text-brand-primary">
                    +{stats.thisWeekSongs} this week
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="rnrb-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                      <Clock className="h-6 w-6 text-brand-primary" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Time Invested</p>
                  <p className="mt-2 text-xs text-brand-primary">
                    +{stats.thisWeekHours}h this week
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="rnrb-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                      <Users className="h-6 w-6 text-brand-primary" />
                    </div>
                    <Award className="h-5 w-5 text-brand-primary" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.collaborators}</p>
                  <p className="text-sm text-muted-foreground">Collaborators</p>
                  <p className="mt-2 text-xs text-muted-foreground">Across all projects</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="rnrb-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                      <Target className="h-6 w-6 text-brand-primary" />
                    </div>
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.totalProjects}</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="mt-2 text-xs text-muted-foreground">In progress</p>
                </Card>
              </motion.div>
            </div>

            {/* Motivation Card */}
            <Card className="rnrb-card bg-linear-to-br from-brand-primary/5 to-purple-500/5 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Award className="h-6 w-6 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold">You're Making Progress!</h3>
                  <p className="mb-4 text-muted-foreground">
                    {stats.totalSongs > 0 &&
                      `You've created ${stats.totalSongs} ${stats.totalSongs === 1 ? 'song' : 'songs'}. `}
                    {stats.totalHours > 0 &&
                      `You've invested ${stats.totalHours} hours into your craft. `}
                    {stats.collaborators > 0 &&
                      `You're collaborating with ${stats.collaborators} ${stats.collaborators === 1 ? 'artist' : 'artists'}. `}
                    Keep going - every session brings you closer to your musical goals.
                  </p>
                  {stats.totalSessions > 0 && (
                    <p className="text-sm font-medium text-brand-primary">
                      {stats.totalSessions} recording sessions logged
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Activity Overview */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="rnrb-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5 text-brand-primary" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {stats.totalSessions === 0 && stats.totalSongs === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No activity yet. Start creating!
                    </p>
                  )}
                  {stats.totalSongs > 0 && (
                    <div className="flex items-center gap-3 rounded-lg bg-surface-muted p-3">
                      <Music className="h-5 w-5 text-brand-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Created {stats.totalSongs} {stats.totalSongs === 1 ? 'song' : 'songs'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Across {stats.totalProjects}{' '}
                          {stats.totalProjects === 1 ? 'project' : 'projects'}
                        </p>
                      </div>
                    </div>
                  )}
                  {stats.totalSessions > 0 && (
                    <div className="flex items-center gap-3 rounded-lg bg-surface-muted p-3">
                      <Clock className="h-5 w-5 text-brand-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {stats.totalSessions} recording sessions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats.totalHours} hours total
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="rnrb-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5 text-brand-primary" />
                  Collaboration Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{stats.collaborators}</p>
                    <p className="text-sm text-muted-foreground">Active Collaborators</p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="mb-2 text-sm text-muted-foreground">
                      Collaboration Features Used:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-brand-primary" />
                        <span>Project & Song Chat (Ably)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-brand-primary" />
                        <span>Video Rooms (Daily.co)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span>AI Chat Assistant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Activity Streak */}
            {stats.streakDays > 0 && (
              <Card className="rnrb-card border-orange-500/30 bg-linear-to-br from-orange-500/10 to-red-500/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-500">
                      <Flame className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {stats.streakDays} Day Streak!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You've been creating music for {stats.streakDays} days in a row
                      </p>
                    </div>
                  </div>
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-xs text-muted-foreground">Keep it going!</span>
                    <div className="mt-1 flex gap-1">
                      {[...Array(Math.min(stats.streakDays, 7))].map((_, i) => (
                        <div key={i} className="h-2 w-2 rounded-full bg-orange-500" />
                      ))}
                      {stats.streakDays < 7 &&
                        [...Array(7 - Math.min(stats.streakDays, 7))].map((_, i) => (
                          <div key={i} className="h-2 w-2 rounded-full bg-white/20" />
                        ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Storage Usage */}
            <Card className="rnrb-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <HardDrive className="h-5 w-5 text-brand-primary" />
                  Storage Usage
                </h3>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  {stats.subscriptionTier.charAt(0).toUpperCase() + stats.subscriptionTier.slice(1)}{' '}
                  Plan
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted)' }}>Used</span>
                  <span className="font-medium">
                    {formatStorage(stats.storageUsed)} / {formatStorage(stats.storageTotal)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      storagePercentage > 90
                        ? 'bg-red-500'
                        : storagePercentage > 70
                          ? 'bg-yellow-500'
                          : 'bg-brand-primary'
                    }`}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {100 - storagePercentage}% remaining
                </p>
              </div>
            </Card>

            {/* Quick Stats Summary */}
            <Card className="rnrb-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-brand-primary" />
                This Week's Highlights
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-surface-muted p-4 text-center">
                  <p className="text-3xl font-bold text-brand-primary">{stats.thisWeekSongs}</p>
                  <p className="text-sm text-muted-foreground">Songs Created</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">{stats.thisWeekHours}h</p>
                  <p className="text-sm text-muted-foreground">Hours Active</p>
                </div>
              </div>
            </Card>

            {/* Pro Tips */}
            <Card className="rnrb-card border-purple-500/20 bg-purple-500/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-white">Pro Tips to Boost Your Stats</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-400" />
                      Create at least one song per day to maintain your streak
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-400" />
                      Invite collaborators to unlock team features
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-400" />
                      Use the AI assistant to get songwriting help
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
