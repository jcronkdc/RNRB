'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Music, Radio, MessageSquare, Folder, TrendingUp, Settings, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

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
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
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

        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-2">Quick Actions</h2>
          <p className="text-muted-foreground">Jump into your workflow</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/songs">
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full border-2 border-brand-primary/20 hover:border-brand-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <Music className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">My Songs</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  View your song library, import songs, add chords & organize
                </p>
                <div className="text-sm text-brand-primary font-medium">
                  {(user?.user_metadata?.songs?.length || 0) > 0 
                    ? `View ${user?.user_metadata?.songs?.length} songs →`
                    : 'Import songs →'}
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
              <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full hover:border-brand-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <Music className="w-6 h-6 text-brand-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Recording Studio</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Record HD video/audio, collaborate remotely, stream to platforms
                </p>
                <div className="text-sm text-brand-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Start session →</div>
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

