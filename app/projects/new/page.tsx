'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Music, 
  Upload, 
  Lock, 
  Users, 
  Globe,
  Building,
  Sparkles,
  ArrowLeft,
  Folder
} from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    tagline: '',
    visibility: 'private' as 'private' | 'org' | 'public',
    cover_image: '',
    genre: '',
    target_release_date: ''
  });

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      setMessage({ type: 'error', text: 'Project name is required' });
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      const newProject = {
        id: `proj_${Date.now()}`,
        ...projectData,
        slug: generateSlug(projectData.name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        song_count: 0,
        collaborator_count: 1,
        session_count: 0
      };

      // Save to user metadata for now (will connect to database later)
      const existingProjects = user?.user_metadata?.projects || [];
      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user?.user_metadata,
          projects: [...existingProjects, newProject]
        }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Project created! Redirecting...' });
      
      setTimeout(() => {
        router.push(`/projects/${newProject.slug}`);
      }, 1000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create project' });
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
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
        </div>
        
        <div className="rnrb-container max-w-4xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/projects" className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6 transition">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Folder className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Workspace</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Create Project</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Foundation for songs, collaborators, and sessions—invite-only by default
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-4xl py-12 px-4">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}

        {/* Project Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rnrb-card p-8 mb-6">
            <h2 className="text-2xl font-display font-bold mb-6">Project Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  placeholder="My Debut Album"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
                />
                {projectData.name && (
                  <p className="text-xs text-muted-foreground mt-2">
                    URL: <span className="text-brand-primary">/projects/{generateSlug(projectData.name)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={projectData.tagline}
                  onChange={(e) => setProjectData({ ...projectData, tagline: e.target.value })}
                  placeholder="The album that changed everything"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  placeholder="Describe your project, its vision, the story behind it..."
                  rows={4}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={projectData.genre}
                    onChange={(e) => setProjectData({ ...projectData, genre: e.target.value })}
                    placeholder="Rock, Jazz, Hip-Hop..."
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Release Date
                  </label>
                  <input
                    type="date"
                    value={projectData.target_release_date}
                    onChange={(e) => setProjectData({ ...projectData, target_release_date: e.target.value })}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="rnrb-card p-8 mb-6">
            <h2 className="text-2xl font-display font-bold mb-2">Privacy & Access</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Control who can see and collaborate on this project
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => setProjectData({ ...projectData, visibility: 'private' })}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  projectData.visibility === 'private'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border bg-surface hover:border-brand-primary/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Lock className={`w-5 h-5 mt-1 ${
                    projectData.visibility === 'private' ? 'text-brand-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <p className="font-semibold mb-1">Private (Recommended)</p>
                    <p className="text-sm text-muted-foreground">
                      Only you can see this project. Invite collaborators for access. Perfect for works in progress.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setProjectData({ ...projectData, visibility: 'org' })}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  projectData.visibility === 'org'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border bg-surface hover:border-brand-primary/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Users className={`w-5 h-5 mt-1 ${
                    projectData.visibility === 'org' ? 'text-brand-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <p className="font-semibold mb-1">Band/Organization</p>
                    <p className="text-sm text-muted-foreground">
                      Shared with your band or organization members only.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setProjectData({ ...projectData, visibility: 'public' })}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  projectData.visibility === 'public'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border bg-surface hover:border-brand-primary/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Globe className={`w-5 h-5 mt-1 ${
                    projectData.visibility === 'public' ? 'text-brand-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <p className="font-semibold mb-1">Public</p>
                    <p className="text-sm text-muted-foreground">
                      Anyone can discover and listen. Great for released albums.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Create Button */}
          <div className="flex items-center justify-between">
            <Link href="/projects">
              <Button variant="secondary" className="px-6 py-3">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleCreateProject}
              disabled={creating || !projectData.name.trim()}
              className="rnrb-button-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {creating ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
