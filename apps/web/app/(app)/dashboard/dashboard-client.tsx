'use client';

import { motion } from 'motion/react';
import {
  Plus,
  Music2,
  Clock,
  ArrowRight,
  FolderOpen,
  Video,
  Sparkles,
  Users,
  Zap,
  Bell,
  FlaskConical,
  ShoppingBag,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { DailySpark } from '@/components/workshop/daily-spark';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface DashboardStats {
  totalSongs: number;
  totalProjects: number;
  collaborators: number;
  songsThisWeek: number;
  unreadNotifications: number;
  tier: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'var(--muted)';
    case 'complete':
      return 'var(--sage)';
    default:
      return 'var(--accent)';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'complete':
      return 'Complete';
    default:
      return 'In progress';
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

// ─── Stat Pill ───────────────────────────────────────────────────────────────

function StatPill({
  value,
  label,
  icon: Icon,
}: {
  value: number | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ background: 'var(--bg)', color: 'var(--muted)' }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <span className="block text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
          {value}
        </span>
        <span className="block text-[11px] leading-tight" style={{ color: 'var(--muted)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Quick Action Card ───────────────────────────────────────────────────────

function QuickAction({
  href,
  icon: Icon,
  title,
  subtitle,
  primary,
  iconBg,
  iconColor,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  primary?: boolean;
  iconBg?: string;
  iconColor?: string;
}) {
  if (primary) {
    return (
      <Link href={href}>
        <div className="group flex items-center gap-4 rounded-xl p-4 text-white transition-all duration-200 hover:opacity-90" style={{ background: 'var(--accent)' }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div>
            <span className="block text-sm font-semibold">{title}</span>
            <span className="block text-xs opacity-80">{subtitle}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <div
        className="group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:border-(--border-strong)"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: iconBg || 'var(--bg)', color: iconColor || 'var(--muted)' }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div>
          <span className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</span>
          <span className="block text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function DashboardContent({
  firstName,
  songs,
  projects,
  stats,
}: {
  firstName: string;
  songs: RecentSong[];
  projects: RecentProject[];
  stats: DashboardStats;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-4xl">
      {/* ── Greeting ───────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>
          {greeting}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>
          {stats.songsThisWeek > 0
            ? `You wrote ${stats.songsThisWeek} song${stats.songsThisWeek !== 1 ? 's' : ''} this week. Keep going!`
            : 'What are you working on today?'}
        </p>
      </motion.div>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0.05}
        className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4"
      >
        <StatPill value={stats.totalSongs} label="Songs" icon={Music2} />
        <StatPill value={stats.totalProjects} label="Projects" icon={FolderOpen} />
        <StatPill value={stats.collaborators} label="Collaborators" icon={Users} />
        <StatPill value={stats.songsThisWeek} label="This week" icon={Zap} />
      </motion.div>

      {/* ── Two-Column: Quick Actions + Daily Spark ────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0.1}
        className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-5"
      >
        {/* Quick Actions — left 3 cols */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <QuickAction href="/songwriting" icon={Plus} title="New Song" subtitle="Start writing" primary />
            <QuickAction href="/projects/new" icon={FolderOpen} title="New Project" subtitle="Organize & collaborate" iconBg="var(--gold-muted)" iconColor="var(--gold)" />
            <QuickAction href="/meet" icon={Video} title="Start Session" subtitle="Meet & play together" iconBg="var(--sage-muted)" iconColor="var(--sage)" />
            <QuickAction href="/create" icon={Sparkles} title="AI Sketch" subtitle="Generate ideas with AI" iconBg="var(--accent-muted)" iconColor="var(--accent)" />
            <QuickAction href="/tools" icon={FlaskConical} title="Tools" subtitle="Explore all tools" />
            <QuickAction href="/marketplace" icon={ShoppingBag} title="Marketplace" subtitle="Buy & sell gear" />
          </div>
        </div>

        {/* Daily Spark — right 2 cols */}
        <div className="lg:col-span-2">
          <DailySpark className="h-full" />
        </div>
      </motion.div>

      {/* ── Recent Songs ───────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.15} className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Recent Songs
          </h2>
          {songs.length > 0 && (
            <Link
              href="/songs"
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {songs.length > 0 ? (
          <div
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            {songs.map((song, i) => (
              <Link key={song.id} href={`/songwriting?id=${song.id}`}>
                <div
                  className="group flex items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-white/3"
                  style={i > 0 ? { borderTop: '1px solid var(--border)' } : undefined}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                    style={{ background: 'var(--bg)', color: 'var(--accent)' }}
                  >
                    <Music2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {song.title}
                    </span>
                    <span className="block text-xs" style={{ color: 'var(--muted)' }}>
                      {song.project?.name && `${song.project.name} · `}
                      <span style={{ color: getStatusColor(song.status) }}>{getStatusLabel(song.status)}</span>
                    </span>
                  </div>
                  <div
                    className="hidden shrink-0 items-center gap-1 text-xs sm:flex"
                    style={{ color: 'var(--muted-soft)' }}
                  >
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(song.updatedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-xl border py-14"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: 'var(--bg)', color: 'var(--accent)' }}
            >
              <Music2 className="h-5 w-5" />
            </div>
            <p className="mb-1 text-sm font-medium" style={{ color: 'var(--text)' }}>
              No songs yet
            </p>
            <p className="mb-5 text-xs" style={{ color: 'var(--muted)' }}>
              Every great song starts with a single note
            </p>
            <Link
              href="/songwriting"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              <Plus className="h-4 w-4" />
              Write your first song
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Projects ───────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.2} className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Projects
          </h2>
          {projects.length > 0 && (
            <Link
              href="/projects"
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <div
                  className="rounded-xl border p-4 transition-all duration-150 hover:border-(--border-strong) hover:bg-white/2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="mb-2.5 flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md"
                      style={{ background: 'var(--gold-muted)', color: 'var(--gold)' }}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <span className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {project.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                    {project._count?.songs !== undefined && (
                      <span>
                        {project._count.songs} song{project._count.songs !== 1 ? 's' : ''}
                      </span>
                    )}
                    {project._count?.members !== undefined && project._count.members > 1 && (
                      <span>
                        {project._count.members} member{project._count.members !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-xl border py-10"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: 'var(--bg)', color: 'var(--gold)' }}
            >
              <FolderOpen className="h-5 w-5" />
            </div>
            <p className="mb-1 text-sm font-medium" style={{ color: 'var(--text)' }}>
              No projects yet
            </p>
            <p className="mb-4 text-xs" style={{ color: 'var(--muted)' }}>
              Projects group your songs, collaborators, and files
            </p>
            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:border-(--border-strong)"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <Plus className="h-4 w-4" />
              Create a project
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Activity Footer ────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.25}>
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-3.5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
            <span>
              <strong style={{ color: 'var(--text)' }}>{stats.songsThisWeek}</strong> songs this week
            </span>
            <span className="hidden sm:inline" style={{ color: 'var(--border)' }}>|</span>
            <Link href="/notifications" className="flex items-center gap-1.5 transition-colors hover:opacity-80" style={{ color: stats.unreadNotifications > 0 ? 'var(--accent)' : 'var(--muted)' }}>
              <Bell className="h-3.5 w-3.5" />
              <span>
                <strong style={{ color: stats.unreadNotifications > 0 ? 'var(--accent)' : 'var(--text)' }}>
                  {stats.unreadNotifications}
                </strong>{' '}
                notification{stats.unreadNotifications !== 1 ? 's' : ''}
              </span>
            </Link>
          </div>
          <Link
            href="/settings"
            className="text-xs font-medium capitalize transition-colors hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            {stats.tier} plan
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
