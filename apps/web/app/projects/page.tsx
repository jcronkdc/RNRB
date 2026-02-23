'use client';

import { Button } from '@cronkwaters/ui';
import { motion } from 'motion/react';
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
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo, memo } from 'react';

import { ErrorBoundary } from '@/components/error-boundary';
import { EmptyState } from '@/components/workshop';
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
  <div
    className="rounded-xl border p-3 transition-all hover:shadow-lg sm:p-4 lg:p-5"
    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
  >
    <p className="mb-1 text-xs sm:mb-2 sm:text-sm" style={{ color: 'var(--muted)' }}>
      {label}
    </p>
    <p className="text-xl font-bold sm:text-2xl lg:text-3xl" style={{ color: 'var(--text)' }}>
      {value}
    </p>
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
      <div
        className="group h-full transform cursor-pointer rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Cover Image */}
        <div
          className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl sm:mb-4"
          style={{ background: 'var(--accent-glow)' }}
        >
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.name}
              className="h-full w-full object-cover"
              loading={index < 6 ? 'eager' : 'lazy'}
            />
          ) : (
            <Music className="h-12 w-12 sm:h-16 sm:w-16" style={{ color: 'var(--accent)' }} />
          )}
          <div className="absolute right-2 top-2">
            {project.visibility === 'private' && (
              <div
                className="rounded-lg border p-1 sm:p-1.5"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <Lock className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: 'var(--muted)' }} />
              </div>
            )}
            {project.visibility === 'public' && (
              <div
                className="rounded-lg border p-1 sm:p-1.5"
                style={{ background: 'var(--bg)', borderColor: 'var(--sage)' }}
              >
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: 'var(--sage)' }} />
              </div>
            )}
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
          <h3
            className="line-clamp-1 flex-1 text-lg font-semibold transition-colors sm:text-xl"
            style={{ color: 'var(--text)' }}
          >
            {project.name}
          </h3>
          <ArrowRight
            className="h-4 w-4 flex-shrink-0 transition-all group-hover:translate-x-1 sm:h-5 sm:w-5"
            style={{ color: 'var(--muted)' }}
          />
        </div>

        <p
          className="mb-3 line-clamp-2 text-xs sm:mb-4 sm:text-sm"
          style={{ color: 'var(--muted)' }}
        >
          {project.description || 'No description yet'}
        </p>

        {/* Stats */}
        <div
          className="flex items-center gap-3 border-t pt-3 text-xs sm:gap-4 sm:pt-4 sm:text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
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
  <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
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
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Opening your workshop...
        </p>
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
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
      <div className="relative overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--accent-glow) 0%, transparent 50%, var(--accent-glow) 100%)',
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute right-1/4 top-0 h-96 w-96 rounded-full blur-3xl"
            style={{ background: 'var(--accent-glow)' }}
          />
          <div
            className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full blur-3xl"
            style={{ background: 'rgba(212, 168, 75, 0.1)' }}
          />
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
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                    style={{ background: 'var(--accent-glow)' }}
                  >
                    <Folder
                      className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>
                      Your Creative Workspace
                    </p>
                    <h1
                      className="truncate text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl"
                      style={{ color: 'var(--text)' }}
                    >
                      Projects
                    </h1>
                  </div>
                </div>
                <p
                  className="text-sm sm:text-base lg:max-w-2xl lg:text-lg"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Organize songs, collaborate with your team, and build your music career
                </p>
              </div>
              <Link href="/projects/new" className="w-full sm:w-auto">
                <Button
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white shadow-lg transition-all sm:w-auto sm:px-6 sm:py-3"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 4px 12px var(--accent-glow)',
                  }}
                >
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
            <EmptyState type="noProjects" size="lg" />
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
            <div
              className="flex items-center gap-2 rounded-lg border px-4 py-2"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                Updating...
              </span>
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
