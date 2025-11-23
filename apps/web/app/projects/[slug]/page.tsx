'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Music, 
  Plus,
  Users, 
  Calendar,
  Settings,
  Upload,
  Radio,
  DollarSign,
  Disc,
  FileText,
  Share2,
  Lock,
  Globe,
  ArrowLeft,
  MoreVertical,
  MessageSquare,
  Video,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
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
    <div className="min-h-screen bg-background">
      
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <Link href="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-primary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">All Projects</span>
            </Link>

            {/* Project Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                {/* Cover Art */}
                <div className="w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-10 h-10 text-brand-primary/50" />
                  )}
                </div>

                {/* Project Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{project.name}</h1>
                    {project.visibility === 'private' && (
                      <span className="px-3 py-1 bg-surface border border-border rounded-full text-sm text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    )}
                    {project.visibility === 'public' && (
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
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
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rnrb-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Songs</p>
                <p className="text-2xl font-bold">{project.song_count || 0}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Collaborators</p>
                <p className="text-2xl font-bold">{project.collaborator_count || 1}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Sessions</p>
                <p className="text-2xl font-bold">{project.session_count || 0}</p>
              </div>
              <div className="rnrb-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl py-12 px-4">

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Link href={`/projects/${slug}/songs/new`}>
            <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full border border-border hover:border-brand-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Music className="w-6 h-6 text-brand-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold mb-1">Add Song</h3>
              <p className="text-xs text-muted-foreground">Create new track</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/collaborate`}>
            <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full border border-border hover:border-brand-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <MessageSquare className="w-6 h-6 text-brand-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold mb-1">Collaborate</h3>
              <p className="text-xs text-muted-foreground">Chat & video</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/sessions`}>
            <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full border border-border hover:border-brand-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-brand-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold mb-1">Sessions</h3>
              <p className="text-xs text-muted-foreground">Track work</p>
            </div>
          </Link>

          <Link href={`/projects/${slug}/setlists`}>
            <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full border border-border hover:border-brand-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-brand-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold mb-1">Setlists</h3>
              <p className="text-xs text-muted-foreground">For gigs</p>
            </div>
          </Link>
        </motion.div>

        {/* Project Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Songs (Main Column) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="p-6 rnrb-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Music className="w-6 h-6 text-brand-primary" />
                  Songs
                </h2>
                <Link href={`/projects/${slug}/songs/new`}>
                  <Button className="rnrb-button-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Song
                  </Button>
                </Link>
              </div>
              
              {(project.song_count || 0) === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-brand-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No songs yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first song to get started with this project
                  </p>
                  <Link href={`/projects/${slug}/songs/new`}>
                    <Button className="rnrb-button-primary">
                      <Plus className="w-4 h-4 mr-2" />
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
                        <div className="group p-4 bg-surface hover:bg-surface-muted border border-border hover:border-brand-primary/50 rounded-xl transition-all cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <Music className="w-5 h-5 text-brand-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground group-hover:text-brand-primary transition-colors">{song.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {song.key && `${song.key} • `}
                                  {song.tempo && `${song.tempo} BPM`}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
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
            <Card className="p-6 rnrb-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                Team Members
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg border border-border">
                  <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center text-foreground font-semibold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">You</p>
                    <p className="text-xs text-muted-foreground">Owner</p>
                  </div>
                </div>
                <Link href={`/projects/${slug}/collaborate`}>
                  <Button variant="secondary" className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Members
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 rnrb-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href={`/projects/${slug}/collaborate`}>
                  <button className="w-full px-4 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm">Project Chat</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/sessions`}>
                  <button className="w-full px-4 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm">View Sessions</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/setlists`}>
                  <button className="w-full px-4 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm">Setlists</span>
                  </button>
                </Link>
                <Link href={`/projects/${slug}/settings`}>
                  <button className="w-full px-4 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-primary" />
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

