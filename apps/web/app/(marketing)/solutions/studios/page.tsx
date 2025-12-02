'use client';

import { motion } from 'framer-motion';
import {
  Building,
  Users,
  Video,
  HardDrive,
  Shield,
  Calendar,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Mic2,
  Headphones,
  FolderOpen,
  BarChart3,
  Lock,
  Globe,
  FileAudio,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function SolutionsForStudiosPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pb-20 pt-24"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="container relative z-10">
          <motion.div {...fadeIn} className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: 'rgba(20, 184, 166, 0.3)',
                background: 'rgba(20, 184, 166, 0.1)',
              }}
            >
              <Building className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-teal-400">For Studios & Producers</span>
            </div>

            <h1 className="hero-title mb-6 text-5xl font-bold md:text-6xl">
              <span className="hero-text-gradient">Professional Workflow. Modern Tools.</span>
            </h1>

            <p
              className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              Run your studio like a pro. Client management, session organization, remote
              collaboration, and project delivery—all integrated with the tools your artists already
              use.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth?signup=true&plan=studio"
                className="button hero-button-primary flex items-center gap-2 text-lg"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#features" className="button secondary text-lg">
                Explore Features
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  100GB
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Storage (Studio Plan)
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  Unlimited
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Projects & Clients
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  50
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Video Participants
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <motion.div {...fadeIn} className="section-header">
            <h2 className="section-title">Studio Life Is Complicated</h2>
            <p className="section-subtitle">
              Your job is making great music, not wrangling files and chasing invoices
            </p>
          </motion.div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  pain: 'File Chaos',
                  description:
                    'Dropbox links, Google Drive, WeTransfer—files everywhere, nothing organized',
                  stat: '6hrs',
                  statDesc: 'average weekly time lost to file management',
                },
                {
                  pain: 'Remote Session Struggles',
                  description: 'Zoom fatigue, latency issues, no way to share DAW screens properly',
                  stat: '78%',
                  statDesc: 'of studios now do remote sessions',
                },
                {
                  pain: 'Client Management',
                  description: 'Juggling projects, versions, approvals—nothing in one place',
                  stat: '34%',
                  statDesc: 'of studio revenue lost to poor project tracking',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.pain}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl p-6"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-4 text-3xl font-bold" style={{ color: '#14b8a6' }}>
                    {item.stat}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.pain}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs italic" style={{ color: 'var(--muted)' }}>
                    {item.statDesc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section
        id="features"
        className="page-section"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Built for How Studios Actually Work</h2>
            <p className="section-subtitle">
              Professional tools that integrate with your existing workflow
            </p>
          </div>

          {/* Feature 1: Project Organization */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.2)',
                  }}
                >
                  <FolderOpen className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-teal-400">Organization</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Every Project, Every Client, Organized</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Create separate workspaces for each client. Track every song, version, and stem.
                  No more hunting through folder hierarchies or lost file names.
                </p>
                <ul className="space-y-3">
                  {[
                    'Client-based workspace organization',
                    'Album/EP/Single project structures',
                    'Version tracking (Demo → V1 → Master)',
                    'Stem and multi-track organization',
                    'Searchable metadata and tags',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <div className="relative">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">Studio Projects</h4>
                    <span className="rounded-full bg-teal-500/10 px-2 py-1 text-xs text-teal-400">
                      12 Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        client: 'Sarah Mitchell',
                        project: 'Debut Album',
                        songs: '12 tracks',
                        status: 'Mixing',
                        progress: 75,
                      },
                      {
                        client: 'The Midnight Circuit',
                        project: 'Summer EP',
                        songs: '5 tracks',
                        status: 'Recording',
                        progress: 40,
                      },
                      {
                        client: 'DJ Rhythm',
                        project: 'Single Release',
                        songs: '1 track',
                        status: 'Mastering',
                        progress: 90,
                      },
                    ].map((p) => (
                      <div
                        key={p.client}
                        className="rounded-lg p-3"
                        style={{ background: 'var(--panel)' }}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{p.client}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {p.project} · {p.songs}
                            </p>
                          </div>
                          <span
                            className="rounded-full px-2 py-1 text-xs"
                            style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                          <div
                            className="h-1.5 rounded-full bg-teal-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Remote Sessions */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <div className="relative order-2 md:order-1">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                    <span className="text-sm font-medium">
                      Live Session: Sarah Mitchell - Track 7
                    </span>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{ background: 'var(--panel)' }}
                    >
                      <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500">
                        <Headphones className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-medium">You (Producer)</p>
                      <p className="text-xs text-green-400">Screen Sharing</p>
                    </div>
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{ background: 'var(--panel)' }}
                    >
                      <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500">
                        <Mic2 className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-medium">Sarah (Artist)</p>
                      <p className="text-xs text-green-400">Connected</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--panel)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      <span className="text-teal-400">You:</span> "Let's try the chorus again with
                      more dynamics"
                      <br />
                      <span className="text-pink-400">Sarah:</span> "Got it, rolling in 3..."
                    </p>
                  </div>
                </div>
              </div>
              <motion.div {...fadeIn} className="order-1 md:order-2">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Video className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Remote Sessions</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Run Sessions From Anywhere</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  HD video with up to 50 participants, screen sharing to show your DAW in real-time,
                  and instant messaging. It's like being in the control room together.
                </p>
                <ul className="space-y-3">
                  {[
                    'HD video (Daily.co powered, low latency)',
                    'Screen share your DAW in real-time',
                    'Record sessions for reference',
                    'Chat alongside video for notes',
                    'Invite clients, artists, or engineers',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Feature 3: File Storage & Delivery */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <HardDrive className="h-4 w-4 text-violet-400" />
                  <span className="text-sm text-violet-400">Storage & Delivery</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">100GB Cloud Storage, Seamless Delivery</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Upload stems, mixes, masters—all in one place. Generate secure download links for
                  clients. No more WeTransfer limits or expired links.
                </p>
                <ul className="space-y-3">
                  {[
                    '100 GB storage (Studio plan)',
                    'Drag-and-drop uploads (any file type)',
                    'Secure download links for clients',
                    'Version history for every file',
                    'Auto-backup of all project files',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <div className="relative">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">Project Files</h4>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      34.2 GB used
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Thunder_Road_Master_v4.wav', size: '58 MB', type: 'Master' },
                      { name: 'Thunder_Road_Stems.zip', size: '420 MB', type: 'Stems' },
                      { name: 'Thunder_Road_Mix_v3.wav', size: '52 MB', type: 'Mix' },
                      { name: 'Thunder_Road_Rough.mp3', size: '8 MB', type: 'Reference' },
                    ].map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-3 rounded-lg p-3"
                        style={{ background: 'var(--panel)' }}
                      >
                        <FileAudio className="h-5 w-5 text-violet-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {file.size} · {file.type}
                          </p>
                        </div>
                        <button
                          className="rounded px-2 py-1 text-xs"
                          style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
                        >
                          Share
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-4 w-full rounded-lg py-2 text-sm"
                    style={{ background: 'var(--panel)', border: '1px dashed var(--border)' }}
                  >
                    + Upload Files
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Client Portal */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <div className="relative order-2 md:order-1">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-4">
                    <h4 className="font-semibold">Client View: Sarah Mitchell</h4>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      What your client sees
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg p-4" style={{ background: 'var(--panel)' }}>
                      <p className="mb-2 text-sm font-medium">Latest Mix Ready for Review</p>
                      <p className="mb-3 text-xs" style={{ color: 'var(--muted)' }}>
                        "Midnight Highway" - Mix v3
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 rounded-lg bg-green-600 py-2 text-xs text-white">
                          ✓ Approve
                        </button>
                        <button
                          className="flex-1 rounded-lg py-2 text-xs"
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                    <div className="rounded-lg p-4" style={{ background: 'var(--panel)' }}>
                      <p className="mb-2 text-sm">Project Progress</p>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>
                          8 of 12 tracks complete
                        </span>
                        <span className="text-xs text-green-400">67%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                        <div className="h-2 rounded-full bg-green-500" style={{ width: '67%' }} />
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-3"
                      style={{
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                      }}
                    >
                      <p className="text-center text-xs text-blue-300">
                        📅 Next session: Friday 3pm · Join video call
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div {...fadeIn} className="order-1 md:order-2">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(251, 146, 60, 0.1)',
                    border: '1px solid rgba(251, 146, 60, 0.2)',
                  }}
                >
                  <Users className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-orange-400">Client Portal</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Give Clients Their Own View</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Clients can review mixes, approve versions, track progress, and join
                  sessions—without seeing your whole operation. Professional and organized.
                </p>
                <ul className="space-y-3">
                  {[
                    'Branded client portal view',
                    'Review and approve mixes in-platform',
                    'Comment on specific timestamps',
                    'Track project milestones',
                    'Join scheduled video sessions',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Feature 5: Analytics & Business */}
          <div>
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <BarChart3 className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">Analytics</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Know Your Numbers</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Track project timelines, revenue per client, and studio utilization. Make
                  data-driven decisions about your business.
                </p>
                <ul className="space-y-3">
                  {[
                    'Revenue tracking per project/client',
                    'Time tracking for billing',
                    'Project completion analytics',
                    'Client activity insights',
                    'Export reports for accounting',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <div className="relative">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h4 className="font-semibold">Studio Analytics</h4>
                    <span
                      className="rounded-full px-2 py-1 text-xs"
                      style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                    >
                      This Month
                    </span>
                  </div>
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{ background: 'var(--panel)' }}
                    >
                      <p className="text-2xl font-bold text-green-400">$12,450</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Revenue
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{ background: 'var(--panel)' }}
                    >
                      <p className="text-2xl font-bold text-blue-400">8</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Active Projects
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{ background: 'var(--panel)' }}
                    >
                      <p className="text-2xl font-bold text-violet-400">142</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Hours Logged
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{ background: 'var(--panel)' }}
                    >
                      <p className="text-2xl font-bold text-orange-400">23</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Tracks Delivered
                      </p>
                    </div>
                  </div>
                  <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
                      📈 Revenue up 18% from last month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Website Builder Section */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <motion.div {...fadeIn}>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                <Globe className="h-4 w-4 text-sky-400" />
                <span className="text-sm text-sky-400">Client Websites & EPKs</span>
              </div>
              <h3 className="mb-4 text-3xl font-bold">Deliver A Site With Every Project</h3>
              <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                Use our Website Builder to hand artists a polished microsite with stems, press
                photos, credits, and booking info. Quick Start pulls assets from the project, while
                custom domains and analytics keep clients coming back to you.
              </p>
              <ul className="space-y-3">
                {[
                  'Spin up a site in 60 seconds using project data',
                  'Separate pages for roster, discography, and booking',
                  'Guided custom domain setup + automatic SSL',
                  'Secure download links for WAV, stems, and splits',
                  'Built-in analytics + contact forms for your studio',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/features/website-builder"
                className="mt-6 inline-flex items-center gap-2 text-sky-300 underline-offset-4 hover:underline"
              >
                Learn more about Website Builder
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <div className="relative">
              <div
                className="rounded-2xl p-8"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="rounded-lg bg-sky-500/10 p-4">
                  <p className="mb-3 text-sm text-sky-200">Client Portal Snapshot</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--muted)' }}>Site</span>
                      <code>luminousstudios.cronkwaters.com</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--muted)' }}>Custom Domain</span>
                      <code>clients.luminousstudios.com</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--muted)' }}>Downloads</span>
                      <span>24-bit WAV · Instrumentals · Split Sheets</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-sky-200">
                    Perfect for EPK handoffs, sync pitches, and showcasing your catalogue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Professional Features</h2>
            <p className="section-subtitle">Everything a modern studio needs</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lock,
                title: 'Permission Controls',
                desc: 'Control who sees what—by project, role, or file',
                color: 'yellow',
              },
              {
                icon: Calendar,
                title: 'Session Scheduling',
                desc: 'Book sessions, send invites, avoid conflicts',
                color: 'blue',
              },
              {
                icon: Shield,
                title: 'Split Sheet Generation',
                desc: 'Create and distribute legal split agreements',
                color: 'green',
              },
              {
                icon: Mic2,
                title: 'In-Platform Recording',
                desc: 'Record directly with cloud backup',
                color: 'rose',
              },
              {
                icon: Users,
                title: 'Real-Time Collaboration',
                desc: 'Multi-cursor editing for lyrics and notes',
                color: 'cyan',
              },
              {
                icon: DollarSign,
                title: 'Invoice Integration',
                desc: 'Export time logs for client billing',
                color: 'emerald',
              },
              {
                icon: Globe,
                title: 'Website Builder',
                desc: 'Deliver branded sites with custom domains + analytics',
                color: 'sky',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className={`bg- mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg${feature.color}-500/10`}
                >
                  <feature.icon className={`text- h-5 w-5${feature.color}-400`} />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="section-title mb-6">Works With Your Existing Tools</h2>
            <p className="mb-12 text-lg" style={{ color: 'var(--muted)' }}>
              Rock N' Roll Basement doesn't replace your DAW—it complements it. Export to and from
              the tools you already use.
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { name: 'Pro Tools', desc: 'Session export/import' },
                { name: 'Logic Pro', desc: 'Project files supported' },
                { name: 'Ableton Live', desc: 'Stem sharing' },
                { name: 'FL Studio', desc: 'Project organization' },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-xl p-6"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <p className="mb-1 font-semibold">{tool.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="h-8 w-8 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote
              className="mb-6 text-2xl font-medium italic"
              style={{ color: 'var(--text)' }}
            >
              "We switched from a mess of Dropbox, Zoom, and spreadsheets to Rock N' Roll Basement.
              My clients love the portal view, I love not hunting for files, and our session
              workflows are actually professional now. Should have done this years ago."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500">
                <span className="text-lg font-bold text-white">MR</span>
              </div>
              <div className="text-left">
                <p className="font-semibold">Mike Rodriguez</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Owner, Sunset Sound Studios
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Studio-Ready Pricing</h2>
            <p className="section-subtitle">One subscription covers your entire operation</p>
          </div>

          <div className="mx-auto max-w-lg">
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--surface)', border: '2px solid var(--accent)' }}
            >
              <div
                className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                BUILT FOR STUDIOS
              </div>
              <h3 className="mb-2 text-2xl font-bold">Studio Plan</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-lg" style={{ color: 'var(--muted)' }}>
                  /month
                </span>
              </div>
              <ul className="mb-6 space-y-2 text-left">
                {[
                  'Unlimited projects & clients',
                  'Unlimited collaborators',
                  '100 GB storage',
                  'HD video calls (50 participants)',
                  'Screen sharing for DAW sessions',
                  'Client portal access',
                  'Advanced analytics',
                  'All AI features',
                  'Dedicated support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth?signup=true&plan=studio" className="button w-full text-lg">
                Start 7-Day Free Trial
              </Link>
              <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>

          <p className="mt-6 text-center" style={{ color: 'var(--muted)' }}>
            Need custom enterprise features?{' '}
            <Link href="/contact" className="underline hover:text-white">
              Contact us →
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-section">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6">Run Your Studio Like a Pro</h2>
            <p className="mb-8 text-xl" style={{ color: 'var(--muted)' }}>
              Professional workflow tools built for how studios actually work. Start your free trial
              and see the difference.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth?signup=true&plan=studio"
                className="button hero-button-primary flex items-center gap-2 text-lg"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/features/collaboration" className="button secondary text-lg">
                Explore Collaboration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6) 0' }}>
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <Image src="/logo-dark.png" alt="Rock N' Roll Basement" width={40} height={40} />
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                © 2024 Rock N' Roll Basement. Professional tools for professionals.
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/solutions/bands" className="nav-link">
                For Bands
              </Link>
              <Link href="/solutions/songwriters" className="nav-link">
                For Songwriters
              </Link>
              <Link href="/pricing" className="nav-link">
                Pricing
              </Link>
              <Link href="/why-rnrb" className="nav-link">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
