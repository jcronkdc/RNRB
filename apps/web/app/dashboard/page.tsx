'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Music, Radio, MessageSquare, Folder, TrendingUp, Settings, Sparkles, ArrowRight, CheckCircle2, HelpCircle, Users, Mic2, Video, BarChart3, Headphones } from 'lucide-react';
import Link from 'next/link';
import { FirstTimeOnboarding } from '@/components/first-time-onboarding';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* First-Time User Onboarding */}
      <FirstTimeOnboarding />
      
      {/* Hero Section with Vibrant Gradient */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-brand-primary/10 to-pink-500/10" />
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/15 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          />
        </div>
        
        <div className="rnrb-container max-w-7xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Welcome to your workspace</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Musician'}
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Your central command hub for projects, collaborations, and creative work
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            <div className="rnrb-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="rnrb-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Songs</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="rnrb-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Collaborators</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="rnrb-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Sessions</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl py-12 px-4">

        {/* Section Header with Helper */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold mb-2">Quick Actions</h2>
            <p className="text-muted-foreground">Jump into your workflow - start here if you're new</p>
          </div>
          <button
            onClick={() => localStorage.removeItem('rnrb_onboarding_complete')}
            className="text-sm text-brand-primary hover:text-brand-primary/80 flex items-center gap-1 transition"
            title="Replay onboarding tour"
          >
            <HelpCircle className="w-4 h-4" />
            Need help?
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* NEW PROJECT - Primary Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/projects/new">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full border-2 border-brand-primary/20 hover:border-brand-primary/50 transition-colors">
                <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
                  <span className="text-xs font-semibold text-brand-primary">START HERE</span>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <Music className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start a New Album/EP</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Organize songs, invite collaborators, track sessions. Your private creative workspace.
                </p>
                <div className="text-sm text-brand-primary font-medium flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  Create project →
                </div>
              </div>
            </Link>
          </motion.div>

          {/* FIND COLLABORATORS - Quick Shortcut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <Link href="/discover">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full hover:border-purple-500/30 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2 relative">Find Band Members</h3>
                <p className="text-sm text-muted-foreground mb-3 relative">
                  Search musicians, invite to collaborate. Real-time chat & video co-writing.
                </p>
                <div className="text-sm text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity relative flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Discover →
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/studio">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full hover:border-pink-500/30 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <Mic2 className="w-6 h-6 text-pink-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2 relative">Record Your Music</h3>
                <p className="text-sm text-muted-foreground mb-3 relative">
                  HD video sessions, remote collaboration, live streaming. Daily.co powered.
                </p>
                <div className="text-sm text-pink-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity relative flex items-center gap-1">
                  <Mic2 className="w-4 h-4" />
                  Start recording →
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/tours">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full hover:border-brand-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <Radio className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tours & Shows</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Schedule shows, track tickets, stream virtual concerts
                </p>
                <div className="text-sm text-brand-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Manage tour →</div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/messages">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full hover:border-brand-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <MessageSquare className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Messaging</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Real-time chat, file sharing, presence awareness
                </p>
                <div className="text-sm text-brand-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Start chatting →</div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/projects">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full hover:border-brand-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <Folder className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">My Projects</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  View all your projects, songs, and collaborations
                </p>
                <div className="text-sm text-brand-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">View all →</div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link href="/settings">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full hover:border-brand-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <Settings className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Profile, billing, notifications, integrations
                </p>
                <div className="text-sm text-brand-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Configure →</div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Getting Started Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-2">Get Started</h2>
          <p className="text-muted-foreground">Build your creative workflow step by step</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Create Your First Project</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Projects are your foundation - organize songs, collaborators, sessions, and revenue in one place
                </p>
                <Link href="/projects/new" className="text-sm text-brand-primary font-medium hover:underline">
                  Create project →
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Invite Collaborators</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add band members and collaborators to projects for real-time chat, video sessions, and shared workflows
                </p>
                <Link href="/projects" className="text-sm text-brand-primary font-medium hover:underline">
                  Manage collaborators →
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Start Recording</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Use the studio for HD video/audio recording, screen sharing, and live streaming to multiple platforms
                </p>
                <Link href="/studio" className="text-sm text-brand-primary font-medium hover:underline">
                  Go to studio →
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="rnrb-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Plan Tours & Shows</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Schedule venues, manage setlists, track ticket sales, and stream virtual concerts
                </p>
                <Link href="/tours" className="text-sm text-brand-primary font-medium hover:underline">
                  Manage tours →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

