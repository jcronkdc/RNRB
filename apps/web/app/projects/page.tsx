'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Plus, 
  Music, 
  Users, 
  Calendar,
  TrendingUp,
  MoreVertical,
  Folder,
  Lock,
  Globe,
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  visibility: 'private' | 'org' | 'public';
  created_at: string;
  updated_at: string;
  song_count: number;
  collaborator_count: number;
  session_count: number;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        // Load projects from user_metadata for now (will connect to database later)
        const userProjects = user.user_metadata?.projects || [];
        setProjects(userProjects);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading your projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Premium Hero Section with Gradient */}
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
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <Folder className="w-6 h-6 text-brand-primary" />
                  </div>
          <div>
                    <p className="text-sm text-muted-foreground">Your Creative Workspace</p>
                    <h1 className="text-3xl md:text-4xl font-display font-bold">
                      Projects
            </h1>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Where all your music lives and grows - organize songs, collaborate with your team, and build your career
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="rnrb-button-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </Link>
        </div>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-7xl py-12 px-4">

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="rnrb-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
            <p className="text-2xl font-bold">{projects.length}</p>
              </div>
          <div className="rnrb-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Songs</p>
            <p className="text-2xl font-bold">{projects.reduce((sum, p) => sum + (p.song_count || 0), 0)}</p>
              </div>
          <div className="rnrb-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Collaborators</p>
            <p className="text-2xl font-bold">{projects.reduce((sum, p) => sum + (p.collaborator_count || 1), 0)}</p>
            </div>
          <div className="rnrb-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
            <p className="text-2xl font-bold">{projects.reduce((sum, p) => sum + (p.session_count || 0), 0)}</p>
              </div>
        </motion.div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
          <Card className="p-12 text-center rnrb-card">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-12 h-12 text-brand-primary" />
              </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Create Your First Project
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Projects are your foundation for organizing songs, collaborating with others, and building your music career.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                  <div className="p-4 rnrb-card bg-surface-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3">
                      <Music className="w-5 h-5 text-brand-primary" />
                    </div>
                  <p className="font-semibold text-foreground mb-2">Organize Songs</p>
                  <p className="text-sm text-muted-foreground">
                    Group songs into albums, EPs, or singles
                  </p>
                </div>
                  <div className="p-4 rnrb-card bg-surface-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5 text-brand-primary" />
                    </div>
                  <p className="font-semibold text-foreground mb-2">Collaborate</p>
                  <p className="text-sm text-muted-foreground">
                    Invite band members and track contributions
                  </p>
                </div>
                  <div className="p-4 rnrb-card bg-surface-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5 text-brand-primary" />
                    </div>
                    <p className="font-semibold text-foreground mb-2">Track Progress</p>
                  <p className="text-sm text-muted-foreground">
                      Monitor sessions and creative work
                  </p>
                </div>
              </div>

              <Link href="/projects/new">
                <Button className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3">
                  <Plus className="w-6 h-6" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/projects/${project.slug}`}>
                  <div className="group rnrb-card p-6 rnrb-hover-lift cursor-pointer h-full border border-border hover:border-brand-primary/50 transition-all">
                  {/* Cover Image */}
                    <div className="aspect-square bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                        <Music className="w-16 h-16 text-brand-primary/50" />
                      )}
                      <div className="absolute top-2 right-2">
                        {project.visibility === 'private' && (
                          <div className="p-1.5 bg-surface/90 backdrop-blur-sm rounded-lg border border-border">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        {project.visibility === 'public' && (
                          <div className="p-1.5 bg-surface/90 backdrop-blur-sm rounded-lg border border-border">
                            <Globe className="w-4 h-4 text-green-500" />
                          </div>
                    )}
                      </div>
                  </div>

                  {/* Project Info */}
                  <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                        {project.name}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description || 'No description yet'}
                  </p>

                  {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                        <span>{project.song_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                        <span>{project.collaborator_count || 1}</span>
                      </div>
                      {project.session_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{project.session_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
              </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Explanation Section - Removed mushroom language */}
      </div>
    </div>
  );
}

