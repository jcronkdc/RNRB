'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Video,
  Map,
  Music,
  MessageSquare,
  Shield,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Globe,
  Mic2,
  ListMusic,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function SolutionsForBandsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pb-20 pt-24"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="container relative z-10">
          <motion.div {...fadeIn} className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: 'rgba(59, 130, 246, 0.3)',
                background: 'rgba(59, 130, 246, 0.1)',
              }}
            >
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">For Bands & Groups</span>
            </div>

            <h1 className="hero-title mb-6 text-5xl font-bold md:text-6xl">
              <span className="hero-text-gradient">Your Band. One Platform.</span>
            </h1>

            <p
              className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              Whether your drummer's in Denver and your bassist's in Boston, Rock N' Roll Basement
              keeps your band connected, creative, and crushing it—without the chaos of 10 different
              apps.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="button hero-button-primary flex items-center gap-2 text-lg"
              >
                Start Free Today
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#features" className="button secondary text-lg">
                See How It Works
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  50+
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Video Participants
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  Real-Time
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Collaboration
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  $0
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  To Start
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
            <h2 className="section-title">The Band Struggle Is Real</h2>
            <p className="section-subtitle">
              Being in a band shouldn't require a PhD in project management
            </p>
          </motion.div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  pain: 'Scattered Communication',
                  description:
                    'Group texts, emails, WhatsApp, Discord... everyone misses something',
                  stat: '47%',
                  statDesc: 'of band conflicts start from miscommunication',
                },
                {
                  pain: 'Remote Collaboration Chaos',
                  description: 'Sending WAV files back and forth, version confusion, lost ideas',
                  stat: '4hrs',
                  statDesc: 'wasted weekly on file management',
                },
                {
                  pain: 'Tour Planning Nightmare',
                  description: 'Spreadsheets, phone calls, no visibility on routes or finances',
                  stat: '23%',
                  statDesc: 'of bands have gone over budget on tour',
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
                  <div className="mb-4 text-3xl font-bold" style={{ color: '#ef4444' }}>
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
            <h2 className="section-title">Everything Your Band Needs</h2>
            <p className="section-subtitle">Purpose-built tools for how bands actually work</p>
          </div>

          {/* Feature 1: Real-Time Collaboration */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Video className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Live Collaboration</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Practice Without Being In The Same Room</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  HD video calls with up to 50 participants, screen sharing for showing your DAW,
                  and real-time CRDT editing so everyone can contribute to lyrics and arrangements
                  simultaneously.
                </p>
                <ul className="space-y-3">
                  {[
                    'HD Video conferencing (Daily.co powered)',
                    'Screen share your DAW in real-time',
                    "Multi-cursor editing—see who's typing where",
                    "Instant voice messages when you can't call",
                    "Presence indicators—know who's online",
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
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    {['Alex - Guitar', 'Sam - Drums', 'Jordan - Bass', 'Taylor - Vocals'].map(
                      (member) => (
                        <div
                          key={member}
                          className="rounded-lg p-4 text-center"
                          style={{ background: 'var(--panel)' }}
                        >
                          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-sm font-medium">{member}</p>
                          <div className="mt-1 flex items-center justify-center gap-1">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                            <span className="text-xs text-green-400">Live</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--panel)' }}>
                    <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      <span className="text-blue-400">Alex:</span> "What if we add a bridge here?"
                      <br />
                      <span className="text-purple-400">Sam:</span> "I like it—let me try a fill"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Tour Management */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <div className="relative order-2 md:order-1">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">Summer Tour 2025</h4>
                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400">
                      12 Shows
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        city: 'Austin, TX',
                        venue: 'The Mohawk',
                        date: 'Jun 15',
                        revenue: '$2,400',
                      },
                      { city: 'Dallas, TX', venue: 'Trees', date: 'Jun 16', revenue: '$1,800' },
                      {
                        city: 'Houston, TX',
                        venue: 'White Oak',
                        date: 'Jun 17',
                        revenue: '$2,100',
                      },
                    ].map((show) => (
                      <div
                        key={show.city}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: 'var(--panel)' }}
                      >
                        <div>
                          <p className="text-sm font-medium">{show.city}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {show.venue} · {show.date}
                          </p>
                        </div>
                        <span className="font-medium text-green-400">{show.revenue}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--muted)' }}>Projected Revenue</span>
                      <span className="font-bold text-green-400">$18,500</span>
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
                  <Map className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-orange-400">Tour Management</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Plan Tours Without Losing Your Mind</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  AI-optimized routing, venue database, financial tracking, and shared calendars. No
                  more spreadsheet hell or endless group texts about logistics.
                </p>
                <ul className="space-y-3">
                  {[
                    'AI route optimization saves gas money',
                    'Venue database with contacts & capacity',
                    'Revenue tracking per show and tour-wide',
                    'Shared calendar with conflict detection',
                    'Export itineraries for the whole band',
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

          {/* Feature 3: Smart Setlists */}
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
                  <ListMusic className="h-4 w-4 text-violet-400" />
                  <span className="text-sm text-violet-400">Smart Setlists</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Setlists That Actually Flow</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  AI analyzes your songs' tempo, key, and energy to suggest setlists that build
                  momentum. Drag-and-drop reordering, audience request integration, and live
                  performance mode.
                </p>
                <ul className="space-y-3">
                  {[
                    'AI-curated based on tempo & energy flow',
                    'Key transition analysis (avoid awkward jumps)',
                    'Save templates for different venue types',
                    'Live mode with big, readable display',
                    'Fan song requests integrated automatically',
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
                    <h4 className="font-semibold">Friday Night Set</h4>
                    <span
                      className="rounded-full px-2 py-1 text-xs"
                      style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
                    >
                      AI Optimized
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { song: 'Opening Thunder', bpm: '140 BPM', key: 'E', energy: 'High' },
                      { song: 'Midnight Drive', bpm: '120 BPM', key: 'A', energy: 'Medium' },
                      { song: 'Slow Burn', bpm: '72 BPM', key: 'G', energy: 'Low' },
                      { song: 'Rising Up', bpm: '135 BPM', key: 'D', energy: 'Building' },
                      { song: 'Finale Fury', bpm: '160 BPM', key: 'E', energy: 'Peak' },
                    ].map((song, i) => (
                      <div
                        key={song.song}
                        className="flex items-center gap-3 rounded-lg p-3"
                        style={{ background: 'var(--panel)' }}
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{song.song}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {song.bpm} · {song.key} · {song.energy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-4 rounded-lg p-3"
                    style={{
                      background: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.1)',
                    }}
                  >
                    <p className="text-center text-xs text-violet-300">
                      ✨ AI suggests moving "Slow Burn" earlier for better energy flow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Project Management */}
          <div>
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <div className="relative order-2 md:order-1">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <h4 className="mb-4 font-semibold">New Album: "Electric Dreams"</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm">Recording Progress</span>
                        <span className="text-sm text-green-400">8/12 tracks</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'var(--panel)' }}>
                        <div className="h-2 rounded-full bg-green-500" style={{ width: '66%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm">Mixing</span>
                        <span className="text-sm text-yellow-400">3/12 tracks</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'var(--panel)' }}>
                        <div className="h-2 rounded-full bg-yellow-500" style={{ width: '25%' }} />
                      </div>
                    </div>
                    <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>
                        Recent Activity
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-blue-400">Alex</span> uploaded guitar stems for
                          "Neon Lights"
                        </p>
                        <p className="text-sm">
                          <span className="text-purple-400">Sam</span> left feedback on verse 2
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div {...fadeIn} className="order-1 md:order-2">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.2)',
                  }}
                >
                  <Music className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-teal-400">Project Management</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Keep Your Album On Track</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Track every song from demo to master. Version control for recordings, milestone
                  tracking, and clear visibility on who's doing what.
                </p>
                <ul className="space-y-3">
                  {[
                    'Organize by album, EP, or single',
                    'Track versions (Demo → V1 → Radio Edit)',
                    'Assign tasks to band members',
                    'Deadline and milestone tracking',
                    'Activity feed shows all progress',
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

          {/* Feature 5: Website Builder */}
          <div className="mb-20">
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
                  <span className="text-sm text-sky-400">Digital Presence</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Launch A Pro Site In Minutes</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Turn your CronkWaters data into a beautiful band website. Quick Start pulls in
                  your songs, tour dates, and press photos automatically—then add a custom domain
                  with guided DNS instructions.
                </p>
                <ul className="space-y-3">
                  {[
                    '8 world-class templates built for bands',
                    'Auto-syncs music, videos, and upcoming shows',
                    'Guided custom domain + free SSL certificates',
                    'Built-in contact form, mailing list, and analytics',
                    'Update once—website refreshes instantly',
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
                  See Website Builder →
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <div className="relative">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-6 rounded-lg p-4" style={{ background: 'var(--panel)' }}>
                    <p className="mb-2 text-sm" style={{ color: 'var(--muted)' }}>
                      Default URL
                    </p>
                    <code className="text-lg font-semibold">midnightcircuit.cronkwaters.com</code>
                  </div>
                  <div className="rounded-lg bg-sky-500/10 p-4">
                    <p className="mb-3 text-sm text-sky-200">Custom Domain Checklist</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Add TXT verification record
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Point CNAME → cronkwaters
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Auto issue SSL certificate
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-sky-200">
                      Go live with yourband.com in under 10 minutes.
                    </p>
                  </div>
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
            <h2 className="section-title">Plus Everything Else</h2>
            <p className="section-subtitle">All the tools bands actually need, in one place</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: 'Band Chat',
                desc: 'Dedicated messaging with file sharing and voice memos',
                color: 'blue',
              },
              {
                icon: Shield,
                title: 'Split Sheets',
                desc: 'Generate legal split agreements, email to sign',
                color: 'yellow',
              },
              {
                icon: Clock,
                title: 'Version Control',
                desc: 'Never lose a take—every version saved and accessible',
                color: 'purple',
              },
              {
                icon: Globe,
                title: 'Community',
                desc: 'Discover other bands, producers, and session musicians',
                color: 'green',
              },
              {
                icon: Mic2,
                title: 'Studio Recording',
                desc: 'Record directly in-platform with cloud backup',
                color: 'rose',
              },
              {
                icon: DollarSign,
                title: 'Revenue Tracking',
                desc: 'Track merch, streams, and ticket sales in one dashboard',
                color: 'emerald',
              },
              {
                icon: Globe,
                title: 'Website Builder',
                desc: 'Launch a pro site with custom domain + auto-updated music & shows',
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

      {/* Testimonial Section */}
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
              "We went from a nightmare of scattered files and endless group texts to actually
              finishing our album. The tour planning alone saved us $3,000 in gas money with the AI
              routing."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                <span className="text-lg font-bold text-white">JT</span>
              </div>
              <div className="text-left">
                <p className="font-semibold">Jake Thompson</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Lead Guitarist, The Midnight Circuit
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pricing That Makes Sense</h2>
            <p className="section-subtitle">One subscription for your whole band—not per member</p>
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
                RECOMMENDED FOR BANDS
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
                  'Unlimited projects & collaborators',
                  'HD video calls (50 participants)',
                  'All AI features (tour routing, setlists, songwriting)',
                  '100 GB storage for your band',
                  'Advanced analytics & reports',
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
                No credit card required
              </p>
            </div>
          </div>

          <p className="mt-6 text-center" style={{ color: 'var(--muted)' }}>
            Need something different?{' '}
            <Link href="/pricing" className="underline hover:text-white">
              See all plans →
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-section">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6">Ready to Get Your Band Organized?</h2>
            <p className="mb-8 text-xl" style={{ color: 'var(--muted)' }}>
              Join thousands of bands who've ditched the chaos for a platform built specifically for
              how musicians actually work together.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="button hero-button-primary flex items-center gap-2 text-lg"
              >
                Start Free Today
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/features/collaboration" className="button secondary text-lg">
                Explore Collaboration Features
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
                © 2024 Rock N' Roll Basement. Built for musicians, by musicians.
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/solutions/songwriters" className="nav-link">
                For Songwriters
              </Link>
              <Link href="/solutions/studios" className="nav-link">
                For Studios
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
