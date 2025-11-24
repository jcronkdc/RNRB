'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

export default function AnalyticsPage() {
  const { user, loading } = useRequireAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSongs: 0,
    totalSessions: 0,
    totalHours: 0,
    collaborators: 0,
    thisWeekSongs: 0,
    thisWeekHours: 0,
    streakDays: 0,
  });

  useEffect(() => {
    if (user) {
      // Calculate stats from user data
      const projects = user.user_metadata?.projects || [];
      const totalProjects = projects.length;
      const totalSongs = projects.reduce((sum: number, p: any) => sum + (p.song_count || 0), 0);
      const allSessions = projects.flatMap((p: any) => p.sessions || []);
      const totalSessions = allSessions.length;
      const totalMinutes = allSessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0);
      const totalHours = Math.floor(totalMinutes / 60);

      // Calculate unique collaborators
      const allCollaborators = new Set();
      projects.forEach((p: any) => {
        (p.collaborators || []).forEach((c: any) => allCollaborators.add(c.email || c.id));
      });

      setStats({
        totalProjects,
        totalSongs,
        totalSessions,
        totalHours,
        collaborators: allCollaborators.size,
        thisWeekSongs: 0, // TODO: Calculate based on date
        thisWeekHours: 0, // TODO: Calculate based on date
        streakDays: 0, // TODO: Calculate work streak
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  const isEmpty = stats.totalProjects === 0 && stats.totalSongs === 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Premium Hero */}
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
                <TrendingUp className="text-brand-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Track Your Progress</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Analytics</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Visualize your creative journey and celebrate your progress
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl px-4 py-12">
        {isEmpty ? (
          /* Empty State */
          <Card className="rnrb-card p-16 text-center">
            <TrendingUp className="text-muted-foreground/50 mx-auto mb-6 h-20 w-20" />
            <h2 className="font-display mb-4 text-3xl font-bold">
              Start Creating to See Your Progress
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
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
                    <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                      <Music className="text-brand-primary h-6 w-6" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.totalSongs}</p>
                  <p className="text-muted-foreground text-sm">Songs Created</p>
                  <p className="text-brand-primary mt-2 text-xs">
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
                    <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                      <Clock className="text-brand-primary h-6 w-6" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.totalHours}h</p>
                  <p className="text-muted-foreground text-sm">Time Invested</p>
                  <p className="text-brand-primary mt-2 text-xs">
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
                    <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                      <Users className="text-brand-primary h-6 w-6" />
                    </div>
                    <Award className="text-brand-primary h-5 w-5" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.collaborators}</p>
                  <p className="text-muted-foreground text-sm">Collaborators</p>
                  <p className="text-muted-foreground mt-2 text-xs">Across all projects</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="rnrb-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                      <Target className="text-brand-primary h-6 w-6" />
                    </div>
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.totalProjects}</p>
                  <p className="text-muted-foreground text-sm">Active Projects</p>
                  <p className="text-muted-foreground mt-2 text-xs">In progress</p>
                </Card>
              </motion.div>
            </div>

            {/* Motivation Card */}
            <Card className="rnrb-card from-brand-primary/5 bg-gradient-to-br to-purple-500/5 p-8">
              <div className="flex items-start gap-4">
                <div className="bg-brand-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                  <Award className="text-brand-primary h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold">You're Making Progress!</h3>
                  <p className="text-muted-foreground mb-4">
                    {stats.totalSongs > 0 &&
                      `You've created ${stats.totalSongs} ${stats.totalSongs === 1 ? 'song' : 'songs'}. `}
                    {stats.totalHours > 0 &&
                      `You've invested ${stats.totalHours} hours into your craft. `}
                    {stats.collaborators > 0 &&
                      `You're collaborating with ${stats.collaborators} ${stats.collaborators === 1 ? 'artist' : 'artists'}. `}
                    Keep going - every session brings you closer to your musical goals.
                  </p>
                  {stats.totalSessions > 0 && (
                    <p className="text-brand-primary text-sm font-medium">
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
                  <Calendar className="text-brand-primary h-5 w-5" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {stats.totalSessions === 0 && stats.totalSongs === 0 && (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                      No activity yet. Start creating!
                    </p>
                  )}
                  {stats.totalSongs > 0 && (
                    <div className="bg-surface-muted flex items-center gap-3 rounded-lg p-3">
                      <Music className="text-brand-primary h-5 w-5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Created {stats.totalSongs} {stats.totalSongs === 1 ? 'song' : 'songs'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Across {stats.totalProjects}{' '}
                          {stats.totalProjects === 1 ? 'project' : 'projects'}
                        </p>
                      </div>
                    </div>
                  )}
                  {stats.totalSessions > 0 && (
                    <div className="bg-surface-muted flex items-center gap-3 rounded-lg p-3">
                      <Clock className="text-brand-primary h-5 w-5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {stats.totalSessions} recording sessions
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {stats.totalHours} hours total
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="rnrb-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Users className="text-brand-primary h-5 w-5" />
                  Collaboration Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{stats.collaborators}</p>
                    <p className="text-muted-foreground text-sm">Active Collaborators</p>
                  </div>
                  <div className="border-border border-t pt-4">
                    <p className="text-muted-foreground mb-2 text-sm">
                      Collaboration Features Used:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="text-brand-primary h-4 w-4" />
                        <span>Project & Song Chat (Ably)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="text-brand-primary h-4 w-4" />
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

            {/* Future: Charts, graphs, more detailed analytics */}
            <Card className="rnrb-card border-purple-500/20 bg-purple-500/5 p-6">
              <p className="text-brand-primary mb-1 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Advanced Analytics Coming Soon
              </p>
              <p className="text-muted-foreground text-xs">
                Detailed charts, progress graphs, goal tracking, and AI-powered insights launching
                soon
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
