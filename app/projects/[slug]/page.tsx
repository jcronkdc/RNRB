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
  DollarSign,
  FileText,
  Share2,
  Lock,
  Globe,
  ArrowLeft,
  MessageSquare,
  Video,
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
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      setUser(user);
      
      // Find project from user metadata
      const projects = user.user_metadata?.projects || [];
      const foundProject = projects.find((p: any) => p.slug === slug);
      
      if (!foundProject) {
        router.push('/projects');
        return;
      }
      
      setProject(foundProject);
      setLoading(false);
    });
  }, [router, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-7xl relative z-10 py-12 px-4">
          {/* Back Navigation */}
          <Link href="/projects" className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6 transition">
            <ArrowLeft className="w-4 h-4" />
            All Projects
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-48 h-48 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-border"
            >
              {project.cover_image ? (
                <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-24 h-24 text-muted-foreground/30" />
              )}
            </motion.div>

            {/* Project Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-display font-bold">{project.name}</h1>
                      {project.visibility === 'private' && (
                        <span className="px-3 py-1 bg-surface border border-border rounded-full text-sm text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Private
                        </span>
                      )}
                      {project.visibility === 'public' && (
                        <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-sm text-brand-primary flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Public
                        </span>
                      )}
                    </div>
                    {project.tagline && (
                      <p className="text-xl text-brand-primary mb-3">{project.tagline}</p>
                    )}
                    {project.description && (
                      <p className="text-muted-foreground">{project.description}</p>
                    )}
                  </div>
                  <Link href={`/projects/${slug}/settings`}>
                    <Button variant="secondary" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-full">
                    <Music className="w-4 h-4 text-brand-primary" />
                    <span>{project.song_count || 0} songs</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-full">
                    <Users className="w-4 h-4 text-brand-primary" />
                    <span>{project.collaborator_count || 1} collaborators</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-full">
                    <Calendar className="w-4 h-4 text-brand-primary" />
                    <span>{project.session_count || 0} sessions</span>
                  </div>
                  {project.genre && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-full">
                      <span className="text-brand-primary">{project.genre}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl py-12 px-4">
        {/* Quick Actions - Collaboration First */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-2">Quick Actions</h2>
          <p className="text-muted-foreground">Navigate to key features</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link href={`/projects/${slug}/songs/new`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rnrb-card p-6 rnrb-hover-lift cursor-pointer text-center group hover:border-brand-primary/30"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                <Music className="w-6 h-6 text-brand-primary" />
              </div>
              <p className="font-semibold mb-1">Add Song</p>
              <p className="text-xs text-muted-foreground">Create new track</p>
            </motion.div>
          </Link>

          <Link href={`/projects/${slug}/collaborate`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="rnrb-card p-6 rnrb-hover-lift cursor-pointer text-center group border-2 border-brand-primary/20 hover:border-brand-primary/50"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-brand-primary" />
              </div>
              <p className="font-semibold mb-1">Collaborate</p>
              <p className="text-xs text-muted-foreground">Chat & video</p>
            </motion.div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rnrb-card p-6 rnrb-hover-lift cursor-pointer text-center group hover:border-brand-primary/30"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
              <Calendar className="w-6 h-6 text-brand-primary" />
            </div>
            <p className="font-semibold mb-1">Session</p>
            <p className="text-xs text-muted-foreground">Schedule recording</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rnrb-card p-6 rnrb-hover-lift cursor-pointer text-center group hover:border-brand-primary/30"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
              <Upload className="w-6 h-6 text-brand-primary" />
            </div>
            <p className="font-semibold mb-1">Upload</p>
            <p className="text-xs text-muted-foreground">Add files</p>
          </motion.div>
        </div>

        {/* Project Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Songs (Main Column) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rnrb-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
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
                  <Music className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No songs yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first song to get started
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
                  {(project.songs || []).map((song: any) => (
                    <Link key={song.id} href={`/projects/${slug}/songs/${song.id}`}>
                      <div className="p-4 bg-surface hover:bg-surface/80 border border-border rounded-lg transition cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{song.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {song.key && `${song.key} • `}
                              {song.tempo && `${song.tempo} BPM`}
                            </p>
                          </div>
                          {song.has_lyrics && <FileText className="w-5 h-5 text-brand-primary" />}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Collaboration Card */}
            <Card className="rnrb-card p-6 bg-brand-primary/5 border-brand-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat and video with your collaborators—invite-only and private by default
                  </p>
                  <Link href={`/projects/${slug}/collaborate`}>
                    <Button className="rnrb-button-primary flex items-center gap-2">
                      Start Collaborating
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collaborators */}
            <Card className="rnrb-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                Collaborators
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary/50 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">You (Owner)</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Link href={`/projects/${slug}/collaborate`}>
                  <Button variant="secondary" className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Collaborators
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Project Stats */}
            <Card className="rnrb-card p-6">
              <h3 className="text-lg font-semibold mb-3">Project Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Songs</span>
                  <span className="font-medium">{project.song_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-medium">{project.session_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Collaborators</span>
                  <span className="font-medium">{project.collaborator_count || 1}</span>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="rnrb-card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href={`/projects/${slug}/settings`}>
                  <Button variant="secondary" className="w-full justify-start" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Project Settings
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full justify-start" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Project
                </Button>
                <Button variant="secondary" className="w-full justify-start" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
