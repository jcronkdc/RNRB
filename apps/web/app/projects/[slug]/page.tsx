'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Music, Plus, Users, MessageSquare, Video, Settings, ArrowLeft, Lock, Globe
} from 'lucide-react';

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
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground"
        >
          Loading project...
        </motion.div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="rnrb-container max-w-7xl py-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <Link 
            href="/projects" 
            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-6"
          >
            ← ALL PROJECTS
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-display font-bold">
                  {project.name}
                </h1>
                {project.visibility === 'private' && (
                  <span className="px-3 py-1 bg-muted/50 border border-border rounded-full text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </span>
                )}
                {project.visibility === 'public' && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </span>
                )}
              </div>
              {project.tagline && (
                <p className="text-xl text-brand-primary mb-2">{project.tagline}</p>
              )}
              {project.description && (
                <p className="text-muted-foreground max-w-2xl">{project.description}</p>
              )}
            </div>
            <Link href={`/projects/${slug}/settings`}>
              <button className="px-4 py-2 border border-border hover:border-brand-primary rounded-lg transition-colors font-mono text-xs uppercase tracking-wider">
                <Settings className="w-4 h-4 inline mr-2" />
                SETTINGS
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Songs List */}
            <div className="rnrb-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Music className="w-6 h-6 text-brand-primary" />
                  Songs
                </h2>
                <Link href={`/projects/${slug}/songs/new`}>
                  <button className="rnrb-button-primary px-6 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    NEW SONG
                  </button>
                </Link>
              </div>
              
              {(project.song_count || 0) === 0 ? (
                <div className="text-center py-12 border border-border rounded-lg">
                  <Music className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No songs in this project yet</p>
                  <Link href={`/projects/${slug}/songs/new`}>
                    <button className="rnrb-button-secondary px-6 py-2 rounded-lg">
                      CREATE FIRST SONG
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(project.songs || []).map((song: any) => (
                    <Link key={song.id} href={`/projects/${slug}/songs/${song.id}`}>
                      <div className="p-4 bg-surface hover:bg-surface-muted border border-border rounded-lg transition cursor-pointer">
                        <h4 className="font-semibold mb-1">{song.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {song.key && `${song.key}`}
                          {song.key && song.tempo && ' • '}
                          {song.tempo && `${song.tempo} BPM`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Collaborative Features */}
          <div className="space-y-6">
            
            {/* Collaboration Hub */}
            <div className="rnrb-card p-6 bg-gradient-to-br from-brand-primary/5 to-transparent border-brand-primary/20">
              <h3 className="font-semibold mb-4">Collaboration</h3>
              <div className="space-y-3">
                <Link href={`/projects/${slug}/chat`}>
                  <button className="w-full px-4 py-3 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                    <div>
                      <p className="font-medium text-sm">Group Chat</p>
                      <p className="text-xs text-muted-foreground">Text & voice messages</p>
                    </div>
                  </button>
                </Link>
                
                <Link href={`/projects/${slug}/session`}>
                  <button className="w-full px-4 py-3 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-3">
                    <Video className="w-5 h-5 text-brand-primary" />
                    <div>
                      <p className="font-medium text-sm">Video Meeting</p>
                      <p className="text-xs text-muted-foreground">Voice/video + screen share</p>
                    </div>
                  </button>
                </Link>
                
                <Link href={`/projects/${slug}/members`}>
                  <button className="w-full px-4 py-3 bg-surface hover:bg-surface-muted border border-border rounded-lg transition-colors text-left flex items-center gap-3">
                    <Users className="w-5 h-5 text-brand-primary" />
                    <div>
                      <p className="font-medium text-sm">Team Members</p>
                      <p className="text-xs text-muted-foreground">Invite collaborators</p>
                    </div>
                  </button>
                </Link>
              </div>
            </div>

            {/* Team */}
            <div className="rnrb-card p-6">
              <h3 className="font-semibold mb-4">Team</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary/50 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">You (Owner)</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Link href={`/projects/${slug}/members`}>
                  <button className="w-full px-4 py-2 border border-border hover:border-brand-primary rounded-lg transition-colors font-mono text-xs uppercase tracking-wider">
                    <Plus className="w-3 h-3 inline mr-2" />
                    INVITE
                  </button>
                </Link>
              </div>
            </div>

            {/* Project Info */}
            <div className="rnrb-card p-6">
              <h3 className="font-semibold mb-4">Project Info</h3>
              <div className="space-y-3 text-sm">
                {project.genre && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Genre</span>
                    <span className="font-medium">{project.genre}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Visibility</span>
                  <span className="font-medium capitalize">{project.visibility}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}