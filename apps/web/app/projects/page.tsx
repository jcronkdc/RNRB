'use client';

import { Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Plus,
  Music,
  Users,
  Calendar,
  TrendingUp,
  Folder,
  Lock,
  Globe,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo, memo } from 'react';

import { ErrorBoundary } from '@/components/error-boundary';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/hooks/useToast';

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

// Memoized stats card component
const StatsCard = memo(({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-3 transition-all hover:border-orange-500/50 hover:shadow-lg sm:p-4 lg:p-5">
    <p className="mb-1 text-xs text-gray-400 sm:mb-2 sm:text-sm">{label}</p>
    <p className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">{value}</p>
  </div>
));
StatsCard.displayName = 'StatsCard';

// Memoized project card component
const ProjectCard = memo(({ project, index }: { project: Project; index: number }) => (
  <motion.div
    key={project.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Link href={`/projects/${project.slug}`} prefetch={index < 3}>
      <div className="group h-full transform cursor-pointer rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 sm:p-6">
        {/* Cover Image */}
        <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 sm:mb-4">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.name}
              className="h-full w-full object-cover"
              loading={index < 6 ? 'eager' : 'lazy'}
            />
          ) : (
            <Music className="h-12 w-12 text-orange-500/50 sm:h-16 sm:w-16" />
          )}
          <div className="absolute right-2 top-2">
            {project.visibility === 'private' && (
              <div className="rounded-lg border border-gray-700 bg-black/90 p-1 backdrop-blur-sm sm:p-1.5">
                <Lock className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
              </div>
            )}
            {project.visibility === 'public' && (
              <div className="rounded-lg border border-gray-700 bg-black/90 p-1 backdrop-blur-sm sm:p-1.5">
                <Globe className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
          <h3 className="line-clamp-1 flex-1 text-lg font-semibold text-white transition-colors group-hover:text-orange-500 sm:text-xl">
            {project.name}
          </h3>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-orange-500 sm:h-5 sm:w-5" />
        </div>

        <p className="mb-3 line-clamp-2 text-xs text-gray-400 sm:mb-4 sm:text-sm">
          {project.description || 'No description yet'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 border-t border-gray-800 pt-3 text-xs text-gray-400 sm:gap-4 sm:pt-4 sm:text-sm">
          <div className="flex items-center gap-1">
            <Music className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{project.song_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{project.collaborator_count || 1}</span>
          </div>
          {project.session_count > 0 && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{project.session_count}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
));
ProjectCard.displayName = 'ProjectCard';

// Loading skeleton
const ProjectsLoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/50 to-black">
    <div className="flex justify-center pt-6">
      <Link href="/" className="group inline-block">
        <Image
          src="/logo-dark.png"
          alt="Rock N' Roll Basement"
          width={140}
          height={57}
          priority
          className="transition-opacity duration-200 group-hover:opacity-80"
        />
      </Link>
    </div>
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        <div className="text-center">
          <div className="text-lg font-medium text-white">Loading your projects...</div>
          <div className="mt-2 text-sm text-gray-400">Preparing your creative workspace</div>
        </div>
      </div>
    </div>
  </div>
);

function ProjectsPageContent() {
  const { user, loading } = useRequireAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const { showToast } = useToast();

  // Performance monitoring
  usePerformanceMonitor('projects_list');

  // Memoized stats calculations
  const stats = useMemo(
    () => ({
      activeProjects: projects.length,
      totalSongs: projects.reduce((sum, p) => sum + (p.song_count || 0), 0),
      collaborators: projects.reduce((sum, p) => sum + (p.collaborator_count || 1), 0),
      sessions: projects.reduce((sum, p) => sum + (p.session_count || 0), 0),
    }),
    [projects]
  );

  // Load projects with proper cleanup
  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      if (!user) return;

      setLoadingProjects(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to load projects');
        }

        const data = await response.json();

        // Safety: Only update if still mounted
        if (mounted) {
          setProjects(data);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        if (mounted) {
          showToast('Failed to load projects', 'error');
        }
      } finally {
        if (mounted) {
          setLoadingProjects(false);
        }
      }
    };

    if (user) {
      loadProjects();
    }

    // Cleanup
    return () => {
      mounted = false;
    };
  }, [user, showToast]);

  // Track page view
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('projects_list_viewed', {
        user_id: user.id,
        project_count: projects.length,
      });
    }
  }, [user, projects.length]);

  if (loading || (loadingProjects && projects.length === 0)) {
    return <ProjectsLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/50 to-black">
      {/* RR Logo - white logo for dark bg */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center pt-6"
      >
        <Link href="/" className="group inline-block">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={140}
            height={57}
            priority
            className="transition-opacity duration-200 group-hover:opacity-80"
          />
        </Link>
      </motion.div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-start justify-between gap-4 sm:gap-6 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-3 sm:mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 shadow-lg sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                    <Folder className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-gray-400 sm:text-sm">
                      Your Creative Workspace
                    </p>
                    <h1 className="truncate text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">
                      Projects
                    </h1>
                  </div>
                </div>
                <p className="text-sm text-gray-300 sm:text-base lg:max-w-2xl lg:text-lg">
                  Organize songs, collaborate with your team, and build your music career
                </p>
              </div>
              <Link href="/projects/new" className="w-full sm:w-auto">
                <Button className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-orange-500/50 sm:w-auto sm:px-6 sm:py-3">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">New Project</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:mb-8"
        >
          <StatsCard label="Active Projects" value={stats.activeProjects} />
          <StatsCard label="Total Songs" value={stats.totalSongs} />
          <StatsCard label="Collaborators" value={stats.collaborators} />
          <StatsCard label="Sessions" value={stats.sessions} />
        </motion.div>

        {/* Projects Grid or Empty State */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-8 text-center sm:p-12">
              <div className="mx-auto max-w-2xl">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 sm:mb-8 sm:h-24 sm:w-24">
                  <Music className="h-10 w-10 text-orange-500 sm:h-12 sm:w-12" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-3xl lg:text-4xl">
                  Create Your First Project
                </h2>
                <p className="mb-6 text-base text-gray-300 sm:mb-8 sm:text-lg">
                  Projects are your foundation for organizing songs, collaborating with others, and
                  building your music career.
                </p>

                <div className="mb-6 grid grid-cols-1 gap-3 text-left sm:mb-8 sm:gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-800 bg-black/50 p-3 transition-colors hover:border-orange-500/50 sm:p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 sm:mb-3 sm:h-10 sm:w-10">
                      <Music className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-white sm:mb-2 sm:text-base">
                      Organize Songs
                    </p>
                    <p className="text-xs text-gray-400 sm:text-sm">
                      Group songs into albums, EPs, or singles
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-black/50 p-3 transition-colors hover:border-orange-500/50 sm:p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 sm:mb-3 sm:h-10 sm:w-10">
                      <Users className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-white sm:mb-2 sm:text-base">
                      Collaborate
                    </p>
                    <p className="text-xs text-gray-400 sm:text-sm">
                      Invite band members and track contributions
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-black/50 p-3 transition-colors hover:border-orange-500/50 sm:p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 sm:mb-3 sm:h-10 sm:w-10">
                      <TrendingUp className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-white sm:mb-2 sm:text-base">
                      Track Progress
                    </p>
                    <p className="text-xs text-gray-400 sm:text-sm">
                      Monitor sessions and creative work
                    </p>
                  </div>
                </div>

                <Link href="/projects/new">
                  <Button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-orange-600 sm:gap-3 sm:px-8 sm:py-4 sm:text-lg">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {/* Loading indicator for refresh */}
        {loadingProjects && projects.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              <span className="text-sm text-gray-400">Updating...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <ProjectsPageContent />
    </ErrorBoundary>
  );
}
