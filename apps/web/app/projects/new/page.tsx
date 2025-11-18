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
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground font-mono text-sm"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-4xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-primary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Back to Projects</span>
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Folder className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Create New</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  Project
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Organize your songs, collaborate with your team, and build your music career
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-4xl py-12 px-4">

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Project Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8 mb-6 rnrb-card">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                placeholder="My Debut Album"
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground text-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {projectData.name && `URL: /projects/${generateSlug(projectData.name)}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={projectData.tagline}
                onChange={(e) => setProjectData({ ...projectData, tagline: e.target.value })}
                placeholder="The album that changed everything"
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="Describe your project, its vision, the story behind it..."
                rows={4}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  value={projectData.genre}
                  onChange={(e) => setProjectData({ ...projectData, genre: e.target.value })}
                  placeholder="Rock, Jazz, Hip-Hop..."
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Release Date
                </label>
                <input
                  type="date"
                  value={projectData.target_release_date}
                  onChange={(e) => setProjectData({ ...projectData, target_release_date: e.target.value })}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition focus:outline-none"
                />
              </div>
            </div>
          </div>
          </Card>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-8 mb-6 rnrb-card">
          <h2 className="text-2xl font-semibold mb-6">Privacy & Access</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => setProjectData({ ...projectData, visibility: 'private' })}
              className={`w-full p-4 rounded-xl border-2 transition text-left ${
                projectData.visibility === 'private'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-border bg-surface hover:border-brand-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Lock className={`w-5 h-5 mt-1 ${
                  projectData.visibility === 'private' ? 'text-brand-primary' : 'text-muted-foreground'
                }`} />
                <div>
                  <p className="font-semibold text-foreground mb-1">Private</p>
                  <p className="text-sm text-muted-foreground">
                    Only you can see this project. Perfect for works in progress.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setProjectData({ ...projectData, visibility: 'org' })}
              className={`w-full p-4 rounded-xl border-2 transition text-left ${
                projectData.visibility === 'org'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-border bg-surface hover:border-brand-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Users className={`w-5 h-5 mt-1 ${
                  projectData.visibility === 'org' ? 'text-brand-primary' : 'text-muted-foreground'
                }`} />
                <div>
                  <p className="font-semibold text-foreground mb-1">Band/Organization</p>
                  <p className="text-sm text-muted-foreground">
                    Shared with your band or organization members only.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setProjectData({ ...projectData, visibility: 'public' })}
              className={`w-full p-4 rounded-xl border-2 transition text-left ${
                projectData.visibility === 'public'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-border bg-surface hover:border-brand-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Globe className={`w-5 h-5 mt-1 ${
                  projectData.visibility === 'public' ? 'text-brand-primary' : 'text-muted-foreground'
                }`} />
                <div>
                  <p className="font-semibold text-foreground mb-1">Public</p>
                  <p className="text-sm text-muted-foreground">
                    Anyone can discover and listen. Great for released albums.
                  </p>
                </div>
              </div>
            </button>
          </div>
          </Card>
        </motion.div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-between"
        >
          <Link href="/projects">
            <Button variant="secondary" className="px-6 py-3">
              Cancel
            </Button>
          </Link>
            <Button
              onClick={handleCreateProject}
              disabled={creating || !projectData.name.trim()}
              className="rnrb-button-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
            <Sparkles className="w-5 h-5" />
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

