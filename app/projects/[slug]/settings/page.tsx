'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { ArrowLeft, Save, Trash2, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const projects = user.user_metadata?.projects || [];
      const updatedProjects = projects.map((p: any) => 
        p.slug === slug ? { ...project, updated_at: new Date().toISOString() } : p
      );

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects
        }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Project updated!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;

    try {
      const projects = user.user_metadata?.projects || [];
      const updatedProjects = projects.filter((p: any) => p.slug !== slug);

      await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects
        }
      });

      router.push('/projects');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        
        <div className="rnrb-container max-w-4xl relative z-10 py-12 px-4">
          <Link href={`/projects/${slug}`} className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">Project Settings</h1>
              <p className="text-sm text-muted-foreground">{project.name}</p>
            </div>
          </div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rnrb-card p-8 mb-6">
            <h2 className="text-2xl font-display font-bold mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <input
                  type="text"
                  value={project.tagline || ''}
                  onChange={(e) => setProject({ ...project, tagline: e.target.value })}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={project.description || ''}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <input
                  type="text"
                  value={project.genre || ''}
                  onChange={(e) => setProject({ ...project, genre: e.target.value })}
                  placeholder="Rock, Jazz, Hip-Hop..."
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition"
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              onClick={handleDelete}
              variant="secondary"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rnrb-button-primary px-8 py-3 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
