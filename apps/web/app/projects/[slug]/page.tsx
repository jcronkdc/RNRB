'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Music,
  Plus,
  Users,
  Calendar,
  Settings,
  FileText,
  Lock,
  Globe,
  ArrowLeft,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { supabase } from '@/lib/supabase';

const MilestoneTimeline = dynamic(
  () => import('@/components/milestone-timeline').then((m) => m.MilestoneTimeline),
  { ssr: false }
);

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);

      // Load project from API
      try {
        const response = await fetch(`/api/projects/${slug}?userId=${user.id}`);
        if (!response.ok) {
          router.push('/projects');
          return;
        }

        const foundProject = await response.json();
        setProject(foundProject);
        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        router.push('/projects');
      }
    });
  }, [router, slug]);

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground font-mono text-sm"
        >
          Loading project...
        </motion.div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="bg-background min-h-screen">
      {/* Premium Hero Section */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="bg-brand-primary/10 absolute right-1/4 top-0 h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-brand-primary/5 absolute bottom-0 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <Link
              href="/projects"
              className="text-muted-foreground hover:text-brand-primary mb-6 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">All Projects</span>
            </Link>

            {/* Project Header */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Cover Art */}
                <div className="from-brand-primary/20 to-brand-primary/5 flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br">
                  {project.cover_image ? (
                    <img
                      src={project.cover_image}
                      alt={project.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Music className="text-brand-primary/50 h-10 w-10" />
                  )}
                </div>

                {/* Project Info */}
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="font-display text-foreground text-3xl font-bold md:text-4xl">
                      {project.name}
                    </h1>
                    {project.visibility === 'private' && (
                      <span className="border-border bg-surface text-muted-foreground flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                    {project.visibility === 'public' && (
                      <span className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm text-green-500">
                        <Globe className="h-3 w-3" />
                        Public
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-muted-foreground">{project.description}</p>
                  )}
                </div>
              </div>

              <Link href={`/projects/${slug}/settings`}>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rnrb-card p-4">
                <p className="text-muted-foreground mb-1 text-sm">Songs</p>
                <p className="text-2xl font-bold">{project.song_count || 0}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="text-muted-foreground mb-1 text-sm">Collaborators</p>
                <p className="text-2xl font-bold">{project.collaborator_count || 1}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="text-muted-foreground mb-1 text-sm">Sessions</p>
                <p className="text-2xl font-bold">{project.session_count || 0}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="text-muted-foreground mb-1 text-sm">Revenue</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <Link href={`/projects/${slug}/songs/new`}>
            <div className="rnrb-card rnrb-hover-lift border-border hover:border-brand-primary/50 group h-full cursor-pointer border p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="bg-brand-primary/10 group-hover:bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <Music className="text-brand-primary h-6 w-6" />
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-brand-primary h-5 w-5 transition-all group-hover:translate-x-1" />
              </div>
              <h3 className="mb-1 font-semibold">Add Song</h3>
              <p className="text-muted-foreground text-xs">Create new track</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/collaborate`}>
            <div className="rnrb-card rnrb-hover-lift border-border hover:border-brand-primary/50 group h-full cursor-pointer border p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="bg-brand-primary/10 group-hover:bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <MessageSquare className="text-brand-primary h-6 w-6" />
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-brand-primary h-5 w-5 transition-all group-hover:translate-x-1" />
              </div>
              <h3 className="mb-1 font-semibold">Collaborate</h3>
              <p className="text-muted-foreground text-xs">Chat & video</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/sessions`}>
            <div className="rnrb-card rnrb-hover-lift border-border hover:border-brand-primary/50 group h-full cursor-pointer border p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="bg-brand-primary/10 group-hover:bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <Calendar className="text-brand-primary h-6 w-6" />
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-brand-primary h-5 w-5 transition-all group-hover:translate-x-1" />
              </div>
              <h3 className="mb-1 font-semibold">Sessions</h3>
              <p className="text-muted-foreground text-xs">Track work</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/setlists`}>
            <div className="rnrb-card rnrb-hover-lift border-border hover:border-brand-primary/50 group h-full cursor-pointer border p-6 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className="bg-brand-primary/10 group-hover:bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <FileText className="text-brand-primary h-6 w-6" />
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-brand-primary h-5 w-5 transition-all group-hover:translate-x-1" />
              </div>
              <h3 className="mb-1 font-semibold">Setlists</h3>
              <p className="text-muted-foreground text-xs">For gigs</p>
            </div>
          </Link>
        </motion.div>

        {/* Project Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Songs (Main Column) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6 lg:col-span-2"
          >
            <Card className="rnrb-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-foreground flex items-center gap-2 text-2xl font-semibold">
                  <Music className="text-brand-primary h-6 w-6" />
                  Songs
                </h2>
                <Link href={`/projects/${slug}/songs/new`}>
                  <Button className="rnrb-button-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Song
                  </Button>
                </Link>
              </div>

              {(project.song_count || 0) === 0 ? (
                <div className="py-12 text-center">
                  <Music className="text-brand-primary/30 mx-auto mb-4 h-16 w-16" />
                  <p className="text-muted-foreground mb-2">No songs yet</p>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Create your first song to get started with this project
                  </p>
                  <Link href={`/projects/${slug}/songs/new`}>
                    <Button className="rnrb-button-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Song
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(project.songs || []).map((song: any, index: number) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={`/projects/${slug}/songs/${song.id}`}>
                        <div className="border-border bg-surface hover:border-brand-primary/50 hover:bg-surface-muted group cursor-pointer rounded-xl border p-4 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-brand-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <Music className="text-brand-primary h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-foreground group-hover:text-brand-primary font-semibold transition-colors">
                                  {song.title}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                  {song.key && `${song.key} • `}
                                  {song.tempo && `${song.tempo} BPM`}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="text-muted-foreground group-hover:text-brand-primary h-5 w-5 transition-all group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            {/* Project Roadmap / Milestones */}
            <Card className="rnrb-card p-6">
              <MilestoneTimeline 
                projectSlug={slug}
                onMilestoneClick={(milestoneId) => {
                  // Could navigate to milestone detail or open modal
                  console.log('Milestone clicked:', milestoneId);
                }}
              />
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            {/* Team Members */}
            <Card className="rnrb-card p-6">
              <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
                <Users className="text-brand-primary h-5 w-5" />
                Team Members
              </h3>
              <div className="space-y-3">
                <div className="border-border bg-surface-muted flex items-center gap-3 rounded-lg border p-3">
                  <div className="bg-brand-primary/20 text-foreground flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">You</p>
                    <p className="text-muted-foreground text-xs">Owner</p>
                  </div>
                </div>
                <Link href={`/projects/${slug}/collaborate`}>
                  <Button variant="secondary" className="w-full" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Members
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="rnrb-card p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">Quick Links</h3>
              <div className="space-y-2">
                <Link href={`/projects/${slug}/collaborate`}>
                  <button className="border-border bg-surface hover:bg-surface-muted flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-left transition-colors">
                    <MessageSquare className="text-brand-primary h-4 w-4" />
                    <span className="text-sm">Project Chat</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/sessions`}>
                  <button className="border-border bg-surface hover:bg-surface-muted flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-left transition-colors">
                    <Calendar className="text-brand-primary h-4 w-4" />
                    <span className="text-sm">View Sessions</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/setlists`}>
                  <button className="border-border bg-surface hover:bg-surface-muted flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-left transition-colors">
                    <FileText className="text-brand-primary h-4 w-4" />
                    <span className="text-sm">Setlists</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/settings`}>
                  <button className="border-border bg-surface hover:bg-surface-muted flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-left transition-colors">
                    <Settings className="text-brand-primary h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
