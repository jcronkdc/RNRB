'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Card, Button } from '@cronkwaters/ui';
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
  Plus
} from 'lucide-react';
import Link from 'next/link';

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
    streakDays: 0
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
        streakDays: 0 // TODO: Calculate work streak
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  const isEmpty = stats.totalProjects === 0 && stats.totalSongs === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero */}
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
                <TrendingUp className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Track Your Progress</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Analytics</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Visualize your creative journey and celebrate your progress
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl py-12 px-4">

        {isEmpty ? (
          /* Empty State */
          <Card className="p-16 text-center rnrb-card">
            <TrendingUp className="w-20 h-20 text-muted-foreground/50 mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold mb-4">Start Creating to See Your Progress</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your analytics dashboard will come alive as you create projects, add songs, and log sessions. 
              Every creative action builds your story.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/projects/new">
                <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 rnrb-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Music className="w-6 h-6 text-brand-primary" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stats.totalSongs}</p>
                  <p className="text-sm text-muted-foreground">Songs Created</p>
                  <p className="text-xs text-brand-primary mt-2">+{stats.thisWeekSongs} this week</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-6 rnrb-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-brand-primary" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stats.totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Time Invested</p>
                  <p className="text-xs text-brand-primary mt-2">+{stats.thisWeekHours}h this week</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 rnrb-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-brand-primary" />
                    </div>
                    <Award className="w-5 h-5 text-brand-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stats.collaborators}</p>
                  <p className="text-sm text-muted-foreground">Collaborators</p>
                  <p className="text-xs text-muted-foreground mt-2">Across all projects</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-6 rnrb-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-brand-primary" />
                    </div>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stats.totalProjects}</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-xs text-muted-foreground mt-2">In progress</p>
                </Card>
              </motion.div>
            </div>

            {/* Motivation Card */}
            <Card className="p-8 rnrb-card bg-gradient-to-br from-brand-primary/5 to-purple-500/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">You're Making Progress!</h3>
                  <p className="text-muted-foreground mb-4">
                    {stats.totalSongs > 0 && `You've created ${stats.totalSongs} ${stats.totalSongs === 1 ? 'song' : 'songs'}. `}
                    {stats.totalHours > 0 && `You've invested ${stats.totalHours} hours into your craft. `}
                    {stats.collaborators > 0 && `You're collaborating with ${stats.collaborators} ${stats.collaborators === 1 ? 'artist' : 'artists'}. `}
                    Keep going - every session brings you closer to your musical goals.
                  </p>
                  {stats.totalSessions > 0 && (
                    <p className="text-sm text-brand-primary font-medium">
                      {stats.totalSessions} recording sessions logged
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Activity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rnrb-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {stats.totalSessions === 0 && stats.totalSongs === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No activity yet. Start creating!
                    </p>
                  )}
                  {stats.totalSongs > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
                      <Music className="w-5 h-5 text-brand-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Created {stats.totalSongs} {stats.totalSongs === 1 ? 'song' : 'songs'}</p>
                        <p className="text-xs text-muted-foreground">Across {stats.totalProjects} {stats.totalProjects === 1 ? 'project' : 'projects'}</p>
                      </div>
                    </div>
                  )}
                  {stats.totalSessions > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
                      <Clock className="w-5 h-5 text-brand-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{stats.totalSessions} recording sessions</p>
                        <p className="text-xs text-muted-foreground">{stats.totalHours} hours total</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 rnrb-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-primary" />
                  Collaboration Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{stats.collaborators}</p>
                    <p className="text-sm text-muted-foreground">Active Collaborators</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Collaboration Features Used:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-brand-primary" />
                        <span>Project & Song Chat (Ably)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-brand-primary" />
                        <span>Video Rooms (Daily.co)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>AI Chat Assistant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Future: Charts, graphs, more detailed analytics */}
            <Card className="p-6 rnrb-card bg-purple-500/5 border-purple-500/20">
              <p className="text-sm text-brand-primary font-medium mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Advanced Analytics Coming Soon
              </p>
              <p className="text-xs text-muted-foreground">
                Detailed charts, progress graphs, goal tracking, and AI-powered insights launching soon
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

