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

function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'complete': return 'Complete';
    default: return 'In progress';
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

export function DashboardContent({
  firstName,
  songs,
  projects,
}: {
  firstName: string;
  songs: RecentSong[];
  projects: RecentProject[];
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-4xl">
      {/* Greeting */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>
          {greeting}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>
          What are you working on today?
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/songwriting">
          <div
            className="group flex items-center gap-4 rounded-xl p-4 text-white transition-all duration-200 hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Plus className="h-[18px] w-[18px]" />
            </div>
            <div>
              <span className="block text-sm font-semibold">New Song</span>
              <span className="block text-xs opacity-80">Start writing</span>
            </div>
          </div>
        </Link>
        <Link href="/projects/new">
          <div
            className="group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:border-[var(--border-strong)]"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--gold-muted)', color: 'var(--gold)' }}>
              <FolderOpen className="h-[18px] w-[18px]" />
            </div>
            <div>
              <span className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>New Project</span>
              <span className="block text-xs" style={{ color: 'var(--muted)' }}>Organize & collaborate</span>
            </div>
          </div>
        </Link>
        <Link href="/meet">
          <div
            className="group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:border-[var(--border-strong)]"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--sage-muted)', color: 'var(--sage)' }}>
              <Video className="h-[18px] w-[18px]" />
            </div>
            <div>
              <span className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Start Session</span>
              <span className="block text-xs" style={{ color: 'var(--muted)' }}>Meet & play together</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Songs */}
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Recent Songs</h2>
          <Link href="/songs" className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80" style={{ color: 'var(--accent)' }}>
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {songs.length > 0 ? (
          <div className="space-y-1">
            {songs.map((song) => (
              <Link key={song.id} href={`/songwriting?id=${song.id}`}>
                <div className="group flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-white/[0.03]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--surface)', color: 'var(--accent)' }}>
                    <Music2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium" style={{ color: 'var(--text)' }}>{song.title}</span>
                    <span className="block text-xs" style={{ color: 'var(--muted)' }}>
                      {song.project?.name && `${song.project.name} · `}{getStatusLabel(song.status)}
                    </span>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1 text-xs sm:flex" style={{ color: 'var(--muted-soft)' }}>
                    <Clock className="h-3 w-3" />{getTimeAgo(song.updatedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border py-14" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--bg)', color: 'var(--accent)' }}>
              <Music2 className="h-5 w-5" />
            </div>
            <p className="mb-1 text-sm font-medium" style={{ color: 'var(--text)' }}>No songs yet</p>
            <p className="mb-5 text-xs" style={{ color: 'var(--muted)' }}>Every great song starts with a single note</p>
            <Link href="/songwriting" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--accent)' }}>
              <Plus className="h-4 w-4" />Write your first song
            </Link>
          </div>
        )}
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Projects</h2>
            <Link href="/projects" className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80" style={{ color: 'var(--accent)' }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <div className="rounded-lg border p-4 transition-all duration-150 hover:border-[var(--border-strong)] hover:bg-white/[0.02]" style={{ borderColor: 'var(--border)' }}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--gold-muted)', color: 'var(--gold)' }}>
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <span className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>{project.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                    {project._count?.songs !== undefined && <span>{project._count.songs} song{project._count.songs !== 1 ? 's' : ''}</span>}
                    {project._count?.members !== undefined && project._count.members > 1 && <span>{project._count.members} collaborator{project._count.members !== 1 ? 's' : ''}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
