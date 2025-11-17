'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Project = {
  id: string;
  name: string;
  slug: string;
  type: 'album' | 'ep' | 'single' | 'mixtape';
  status: 'planning' | 'recording' | 'mixing' | 'complete';
  created_at: string;
  updated_at: string;
  song_count: number;
  collaborators: number;
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
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-600 font-mono text-xs uppercase tracking-widest"
        >
          Loading Projects
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-900">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-2">
                PROJECT LIBRARY
              </h1>
              <p className="font-[family-name:var(--rnrb-font-marker)] text-3xl">
                Your Music Catalog
              </p>
            </div>
            <Link 
              href="/projects/new"
              className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              NEW PROJECT
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {projects.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto text-center py-20"
          >
            <div className="border border-zinc-900 p-12">
              <h2 className="font-mono text-2xl uppercase tracking-wider mb-4">
                NO ACTIVE PROJECTS
              </h2>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Start your first project to organize songs, manage collaborations, and track your creative process.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                {[
                  { type: 'ALBUM', tracks: '8-16 TRACKS', time: '40-80 MIN' },
                  { type: 'EP', tracks: '4-6 TRACKS', time: '20-30 MIN' },
                  { type: 'SINGLE', tracks: '1-3 TRACKS', time: '5-15 MIN' },
                ].map((format) => (
                  <div key={format.type} className="border border-zinc-800 p-6">
                    <h3 className="font-mono text-sm uppercase tracking-widest mb-2">
                      {format.type}
                    </h3>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">
                      {format.tracks}
                    </p>
                    <p className="text-zinc-600 text-xs uppercase">
                      {format.time}
                    </p>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/projects/new"
                className="inline-block px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                CREATE FIRST PROJECT
              </Link>
            </div>
          </motion.div>
        ) : (
          // Projects Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/projects/${project.slug}`}>
                  <div className="border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group">
                    {/* Project Cover */}
                    <div className="aspect-square bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
                          {project.type}
                        </p>
                        <h3 className="font-[family-name:var(--rnrb-font-marker)] text-2xl mb-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-zinc-500">
                          <span>{project.song_count} TRACKS</span>
                          <span>{project.collaborators} ARTISTS</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project Status */}
                    <div className="p-4 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                            STATUS
                          </p>
                          <p className="font-mono text-xs uppercase tracking-wider">
                            {project.status.toUpperCase()}
                          </p>
                        </div>
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            project.status === 'recording' ? 'bg-red-600 animate-pulse' :
                            project.status === 'mixing' ? 'bg-yellow-600' :
                            project.status === 'complete' ? 'bg-green-600' :
                            'bg-zinc-600'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex items-center justify-center gap-8"
        >
          {[
            { label: 'ARCHIVE', count: 0 },
            { label: 'DRAFTS', count: 0 },
            { label: 'SHARED', count: 0 },
          ].map((item) => (
            <button
              key={item.label}
              className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors"
            >
              {item.label} ({item.count})
            </button>
          ))}
        </motion.div>
      </main>
    </div>
  );
}