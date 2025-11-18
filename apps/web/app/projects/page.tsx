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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="text-lg text-gray-400">Loading your projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      
      {/* Premium Hero Section with Gradient */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Folder className="w-6 h-6 text-orange-500" />
                  </div>
          <div>
                    <p className="text-sm text-gray-400">Your Creative Workspace</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      Projects
            </h1>
                  </div>
                </div>
                <p className="text-lg text-gray-300 max-w-2xl">
                  Where all your music lives and grows - organize songs, collaborate with your team, and build your career
            </p>
          </div>
          <Link href="/projects/new">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </Link>
        </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4">

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors">
            <p className="text-sm text-gray-400 mb-1">Active Projects</p>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
              </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors">
            <p className="text-sm text-gray-400 mb-1">Total Songs</p>
            <p className="text-2xl font-bold text-white">{projects.reduce((sum, p) => sum + (p.song_count || 0), 0)}</p>
              </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors">
            <p className="text-sm text-gray-400 mb-1">Collaborators</p>
            <p className="text-2xl font-bold text-white">{projects.reduce((sum, p) => sum + (p.collaborator_count || 1), 0)}</p>
            </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors">
            <p className="text-sm text-gray-400 mb-1">Total Sessions</p>
            <p className="text-2xl font-bold text-white">{projects.reduce((sum, p) => sum + (p.session_count || 0), 0)}</p>
              </div>
        </motion.div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="p-12 text-center bg-gray-900 border border-gray-800 rounded-2xl">
            <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="w-12 h-12 text-orange-500" />
              </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                Create Your First Project
              </h2>
                <p className="text-lg text-gray-300 mb-8">
                Projects are your foundation for organizing songs, collaborating with others, and building your music career.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                  <div className="p-4 bg-black/50 border border-gray-800 rounded-xl hover:border-orange-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                      <Music className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="font-semibold text-white mb-2">Organize Songs</p>
                    <p className="text-sm text-gray-400">
                    Group songs into albums, EPs, or singles
                  </p>
                </div>
                  <div className="p-4 bg-black/50 border border-gray-800 rounded-xl hover:border-orange-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="font-semibold text-white mb-2">Collaborate</p>
                    <p className="text-sm text-gray-400">
                    Invite band members and track contributions
                  </p>
                </div>
                  <div className="p-4 bg-black/50 border border-gray-800 rounded-xl hover:border-orange-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="font-semibold text-white mb-2">Track Progress</p>
                    <p className="text-sm text-gray-400">
                      Monitor sessions and creative work
                  </p>
                </div>
              </div>

              <Link href="/projects/new">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 transition-all">
                  <Plus className="w-6 h-6" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
            </div>
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
                  <div className="group bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer h-full hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-1">
                  {/* Cover Image */}
                    <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                        <Music className="w-16 h-16 text-orange-500/50" />
                      )}
                      <div className="absolute top-2 right-2">
                        {project.visibility === 'private' && (
                          <div className="p-1.5 bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        {project.visibility === 'public' && (
                          <div className="p-1.5 bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700">
                            <Globe className="w-4 h-4 text-green-500" />
                          </div>
                    )}
                      </div>
                  </div>

                  {/* Project Info */}
                  <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-orange-500 transition-colors">
                        {project.name}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>

                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {project.description || 'No description yet'}
                  </p>

                  {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-800">
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

