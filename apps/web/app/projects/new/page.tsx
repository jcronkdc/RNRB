'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-400 font-mono text-sm uppercase tracking-widest"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <Link 
            href="/projects" 
            className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors inline-block mb-8"
          >
            ← BACK TO PROJECTS
          </Link>
          
          <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 mb-2">
            CREATE NEW PROJECT
          </h1>
          <p className="font-[family-name:var(--rnrb-font-marker)] text-4xl text-white">
            Start Your Next Release
          </p>
        </motion.div>

        {message && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-8 p-4 border ${
              message.type === 'success'
                ? 'border-green-800 bg-green-900/20 text-green-400'
                : 'border-red-800 bg-red-900/20 text-red-400'
            }`}
          >
            <p className="font-mono text-xs uppercase tracking-wider">{message.text}</p>
          </motion.div>
        )}

        {/* Project Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-zinc-800 bg-zinc-900/50 p-8 mb-8"
        >
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-zinc-400 mb-8">
            PROJECT INFORMATION
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                PROJECT NAME *
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                placeholder="Enter project name"
                className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors font-mono"
              />
              {projectData.name && (
                <p className="text-xs text-zinc-600 mt-2 font-mono">
                  URL: /projects/{generateSlug(projectData.name)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                  GENRE
                </label>
                <input
                  type="text"
                  value={projectData.genre}
                  onChange={(e) => setProjectData({ ...projectData, genre: e.target.value })}
                  placeholder="Rock, Electronic, etc"
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                  RELEASE DATE
                </label>
                <input
                  type="date"
                  value={projectData.target_release_date}
                  onChange={(e) => setProjectData({ ...projectData, target_release_date: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                DESCRIPTION
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="Describe your project..."
                rows={4}
                className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors font-mono resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-zinc-800 bg-zinc-900/50 p-8 mb-12"
        >
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-zinc-400 mb-8">
            VISIBILITY SETTINGS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'private', label: 'PRIVATE', desc: 'Only visible to you' },
              { value: 'org', label: 'TEAM', desc: 'Visible to your team' },
              { value: 'public', label: 'PUBLIC', desc: 'Visible to everyone' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setProjectData({ ...projectData, visibility: option.value as any })}
                className={`
                  p-6 border transition-all text-left
                  ${projectData.visibility === option.value
                    ? 'border-white bg-zinc-800'
                    : 'border-zinc-800 hover:border-zinc-700'
                  }
                `}
              >
                <p className="font-mono text-xs uppercase tracking-widest mb-1">
                  {option.label}
                </p>
                <p className="text-xs text-zinc-500">
                  {option.desc}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <Link
            href="/projects"
            className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors"
          >
            CANCEL
          </Link>
          
          <button
            onClick={handleCreateProject}
            disabled={creating || !projectData.name.trim()}
            className="px-8 py-3 bg-white text-black font-mono text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? 'CREATING...' : 'CREATE PROJECT'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}