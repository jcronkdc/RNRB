'use client';

import { motion } from 'framer-motion';
import {
  Plus,
  Music2,
  Clock,
  ArrowRight,
  FolderOpen,
  Video,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

interface RecentSong {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  project?: { name: string; slug: string } | null;
}

interface RecentProject {
  id: string;
  name: string;
  slug: string;
  _count?: { songs: number; members: number };
  updatedAt: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  useRequireAuth();
  const { data: session } = useSession();
  const [songs, setSongs] = useState<RecentSong[]>([]);
  const [projects, setProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = session?.user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, projectsRes] = await Promise.all([
          fetch('/api/songs/all?limit=6&sortBy=updatedAt&sortOrder=desc'),
          fetch('/api/projects'),
        ]);

        if (songsRes.ok) {
          const data = await songsRes.json();
          setSongs(data.songs || []);
        }
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects((data || []).slice(0, 4));
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-12"
        >
          <h1
            className="text-3xl font-light tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--muted)' }}>
            What are you working on today?
          </p>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <Link href="/songwriting">
            <div
              className="group flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-semibold">New Song</span>
                <span className="block text-xs opacity-80">Start writing</span>
              </div>
            </div>
          </Link>

          <Link href="/projects">
            <div
              className="group flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'var(--surface)', color: 'var(--accent)' }}
              >
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  New Project
                </span>
                <span className="block text-xs" style={{ color: 'var(--muted)' }}>
                  Organize & collaborate
                </span>
              </div>
            </div>
          </Link>

          <Link href="/meet">
            <div
              className="group flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'var(--surface)', color: 'var(--sage)' }}
              >
                <Video className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  Start Session
                </span>
                <span className="block text-xs" style={{ color: 'var(--muted)' }}>
                  Meet & play together
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Recent songs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Recent Songs
            </h2>
            <Link
              href="/songs"
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl"
                  style={{ background: 'var(--panel)' }}
                />
              ))}
            </div>
          ) : songs.length > 0 ? (
            <div className="space-y-2">
              {songs.map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Link href={`/songs/${song.id}`}>
                    <div
                      className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/5"
                      style={{ border: '1px solid transparent' }}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: 'var(--surface)' }}
                      >
                        <Music2 className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="block truncate text-sm font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          {song.title}
                        </span>
                        <span className="block text-xs" style={{ color: 'var(--muted)' }}>
                          {song.project?.name && `${song.project.name} · `}
                          {song.status === 'draft' ? 'Draft' : song.status === 'complete' ? 'Complete' : 'In progress'}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(song.updatedAt)}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-16"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'var(--surface)' }}
              >
                <Music2 className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <p className="mb-1 text-sm font-medium" style={{ color: 'var(--text)' }}>
                No songs yet
              </p>
              <p className="mb-6 text-xs" style={{ color: 'var(--muted)' }}>
                Every great song starts with a single note
              </p>
              <Link href="/songwriting">
                <button
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  <Plus className="h-4 w-4" />
                  Write your first song
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Projects */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Projects
              </h2>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Link href={`/projects/${project.slug}`}>
                    <div
                      className="rounded-xl p-4 transition-all duration-200 hover:bg-white/5"
                      style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ background: 'var(--surface)' }}
                        >
                          <FolderOpen className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                        </div>
                        <span className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {project.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                        {project._count?.songs !== undefined && (
                          <span>{project._count.songs} song{project._count.songs !== 1 ? 's' : ''}</span>
                        )}
                        {project._count?.members !== undefined && project._count.members > 1 && (
                          <span>{project._count.members} collaborator{project._count.members !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
