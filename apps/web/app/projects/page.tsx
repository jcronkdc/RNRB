'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-require-auth';

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
  const { user, loading } = useRequireAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (user) {
      // Load projects from database via API
      const loadProjects = async () => {
        try {
          const response = await fetch(`/api/projects?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setProjects(data);
          } else {
            console.error('Failed to load projects:', response.statusText);
          }
        } catch (error) {
          console.error('Error loading projects:', error);
        }
      };
      loadProjects();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500"></div>
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
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                    <Folder className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Your Creative Workspace</p>
                    <h1 className="text-3xl font-bold text-white md:text-4xl">Projects</h1>
                  </div>
                </div>
                <p className="max-w-2xl text-lg text-gray-300">
                  Where all your music lives and grows - organize songs, collaborate with your team,
                  and build your career
                </p>
              </div>
              <Link href="/projects/new">
                <Button className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600">
                  <Plus className="h-5 w-5" />
                  New Project
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-orange-500/50">
            <p className="mb-1 text-sm text-gray-400">Active Projects</p>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-orange-500/50">
            <p className="mb-1 text-sm text-gray-400">Total Songs</p>
            <p className="text-2xl font-bold text-white">
              {projects.reduce((sum, p) => sum + (p.song_count || 0), 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-orange-500/50">
            <p className="mb-1 text-sm text-gray-400">Collaborators</p>
            <p className="text-2xl font-bold text-white">
              {projects.reduce((sum, p) => sum + (p.collaborator_count || 1), 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-orange-500/50">
            <p className="mb-1 text-sm text-gray-400">Total Sessions</p>
            <p className="text-2xl font-bold text-white">
              {projects.reduce((sum, p) => sum + (p.session_count || 0), 0)}
            </p>
          </div>
        </motion.div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-12 text-center">
              <div className="mx-auto max-w-2xl">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/10">
                  <Music className="h-12 w-12 text-orange-500" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-white">Create Your First Project</h2>
                <p className="mb-8 text-lg text-gray-300">
                  Projects are your foundation for organizing songs, collaborating with others, and
                  building your music career.
                </p>

                <div className="mb-8 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
                  <div className="rounded-xl border border-gray-800 bg-black/50 p-4 transition-colors hover:border-orange-500/50">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Music className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="mb-2 font-semibold text-white">Organize Songs</p>
                    <p className="text-sm text-gray-400">
                      Group songs into albums, EPs, or singles
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-black/50 p-4 transition-colors hover:border-orange-500/50">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Users className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="mb-2 font-semibold text-white">Collaborate</p>
                    <p className="text-sm text-gray-400">
                      Invite band members and track contributions
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-black/50 p-4 transition-colors hover:border-orange-500/50">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="mb-2 font-semibold text-white">Track Progress</p>
                    <p className="text-sm text-gray-400">Monitor sessions and creative work</p>
                  </div>
                </div>

                <Link href="/projects/new">
                  <Button className="inline-flex items-center gap-3 rounded-xl bg-orange-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-orange-600">
                    <Plus className="h-6 w-6" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/projects/${project.slug}`}>
                  <div className="group h-full transform cursor-pointer rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10">
                    {/* Cover Image */}
                    <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5">
                      {project.cover_image ? (
                        <img
                          src={project.cover_image}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Music className="h-16 w-16 text-orange-500/50" />
                      )}
                      <div className="absolute right-2 top-2">
                        {project.visibility === 'private' && (
                          <div className="rounded-lg border border-gray-700 bg-black/90 p-1.5 backdrop-blur-sm">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        {project.visibility === 'public' && (
                          <div className="rounded-lg border border-gray-700 bg-black/90 p-1.5 backdrop-blur-sm">
                            <Globe className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-orange-500">
                        {project.name}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-orange-500" />
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-400">
                      {project.description || 'No description yet'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 border-t border-gray-800 pt-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        <span>{project.song_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.collaborator_count || 1}</span>
                      </div>
                      {project.session_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
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
