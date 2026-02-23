'use client';

import { motion } from 'motion/react';
import {
  Pen,
  Music2,
  Sparkles,
  FileText,
  Shield,
  Users,
  Clock,
  Lightbulb,
  Heart,
  BookOpen,
  Mic,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Copy,
  Mail,
  Globe,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function SolutionsForSongwritersPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pb-20 pt-24"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="container relative z-10">
          <motion.div {...fadeIn} className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: 'rgba(236, 72, 153, 0.3)',
                background: 'rgba(236, 72, 153, 0.1)',
              }}
            >
              <Pen className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-400">For Songwriters</span>
            </div>

            <h1 className="hero-title mb-6 text-5xl font-bold md:text-6xl">
              <span className="hero-text-gradient">Write Songs That Matter</span>
            </h1>

            <p
              className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              Whether you're staring at a blank page or polishing your hundredth song, Rock N' Roll
              Basement gives you AI-powered tools to break through blocks, protect your work, and
              connect with collaborators.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="button hero-button-primary flex items-center gap-2 text-lg"
              >
                Start Writing Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#features" className="button secondary text-lg">
                See The Tools
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  50+
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  AI Assists/Month Free
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  100%
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Your Ownership
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  ∞
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Creative Possibilities
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
            <h2 className="section-title">The Songwriter's Struggle</h2>
            <p className="section-subtitle">
              Great songs deserve better than getting lost in notebooks and hard drives
            </p>
          </motion.div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  pain: 'Creative Blocks',
                  description: 'Staring at blank pages, the same four chords, uninspired lyrics',
                  stat: '73%',
                  statDesc: 'of songwriters report regular creative blocks',
                },
                {
                  pain: 'Unprotected Work',
                  description: 'Songs getting stolen, no paper trail, unclear ownership',
                  stat: '$12B',
                  statDesc: 'in annual royalty disputes in the music industry',
                },
                {
                  pain: 'Isolation',
                  description: 'Writing alone, no feedback, hard to find co-writers',
                  stat: '89%',
                  statDesc: 'of hit songs have multiple writers',
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
                  <div className="mb-4 text-3xl font-bold" style={{ color: '#ec4899' }}>
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
            <h2 className="section-title">Tools That Unlock Your Creativity</h2>
            <p className="section-subtitle">
              AI assistance that enhances—never replaces—your voice
            </p>
          </div>

          {/* Feature 1: AI Songwriting Assistant */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                  }}
                >
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span className="text-sm text-pink-400">AI-Powered</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Break Through Writer's Block</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Our Claude-powered AI understands music theory, song structure, and natural
                  language. Get chord suggestions, rhyme ideas, and lyrical inspiration—all tailored
                  to your style.
                </p>
                <ul className="space-y-3">
                  {[
                    'Chord progression generator (all 12 keys)',
                    'Rhyme and syllable suggestions',
                    'Thesaurus built for songwriters',
                    'Genre-aware recommendations',
                    'Never claim your work as its own',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
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
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    <h4 className="font-semibold">AI Songwriting Assistant</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg p-4" style={{ background: 'var(--panel)' }}>
                      <p className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>
                        Your input:
                      </p>
                      <p className="text-sm italic">
                        "I need a verse about leaving home, folk rock style"
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4"
                      style={{
                        background: 'rgba(236, 72, 153, 0.05)',
                        border: '1px solid rgba(236, 72, 153, 0.1)',
                      }}
                    >
                      <p className="mb-2 text-xs text-pink-400">AI suggestions:</p>
                      <p className="mb-2 text-sm">📝 Lyric idea:</p>
                      <p className="mb-3 text-sm italic" style={{ color: 'var(--muted)' }}>
                        "Packed my bags before the morning light / Left a note where you'd find it
                        right..."
                      </p>
                      <p className="mb-2 text-sm">Chord progression:</p>
                      <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
                        G - C - Em - D (I-IV-vi-V)
                      </p>
                      <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                        Rhymes with "light": sight, night, write, bite, flight...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Copyright & Protection */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <div className="relative order-2 md:order-1">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h4 className="font-semibold">Copyright Registration Guide</h4>
                    <Shield className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
                        ✓
                      </div>
                      <div>
                        <p className="text-sm font-medium">Step 1: Gather Your Materials</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          Lyrics, audio recording, lead sheet
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
                        ✓
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Step 2: Create Account at copyright.gov
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          Direct link provided
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-xs text-yellow-400">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium">Step 3: File Your Application</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          $45 standard fee per work
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: 'var(--panel)' }}
                      >
                        4
                      </div>
                      <div>
                        <p className="text-sm font-medium">Step 4: Upload Deposit Copy</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          We export in the right format
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
                      Pro tip: Register within 3 months of publication for statutory damages
                    </p>
                  </div>
                </div>
              </div>
              <motion.div {...fadeIn} className="order-1 md:order-2">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                  }}
                >
                  <Shield className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">Protection</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Protect What You Create</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Step-by-step copyright registration guidance, split sheet generation, and
                  ISWC/ISRC tracking. Your work deserves protection from day one.
                </p>
                <ul className="space-y-3">
                  {[
                    'Copyright registration walkthrough',
                    'Direct links to copyright.gov',
                    'Split sheet generator with email delivery',
                    'ISWC & ISRC number tracking',
                    'Timestamped version history (proof of creation)',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Feature 3: Split Sheets */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <FileText className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">Legal Tools</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Split Sheets Made Simple</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Before the song's even mixed, get your splits documented. Generate professional
                  split agreements and send them to co-writers with one click.
                </p>
                <ul className="space-y-3">
                  {[
                    'Auto-populated with song metadata',
                    'Percentage allocation for each writer',
                    'Publisher information fields',
                    'Email delivery to all parties',
                    'PDF export for your records',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
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
                    <h4 className="font-semibold">Split Sheet</h4>
                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400">
                      Ready to Send
                    </span>
                  </div>
                  <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-sm font-medium">"Midnight Highway"</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Written: November 2024
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Sarah Mitchell', role: 'Lyrics, Melody', split: '40%' },
                      { name: 'James Rodriguez', role: 'Music, Production', split: '35%' },
                      { name: 'Alex Chen', role: 'Bridge, Arrangement', split: '25%' },
                    ].map((writer) => (
                      <div
                        key={writer.name}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: 'var(--panel)' }}
                      >
                        <div>
                          <p className="text-sm font-medium">{writer.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {writer.role}
                          </p>
                        </div>
                        <span className="font-bold text-green-400">{writer.split}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm"
                      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white">
                      <Mail className="h-4 w-4" />
                      Email All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Version Control */}
          <div className="mb-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <div className="relative order-2 md:order-1">
                <div
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <h4 className="mb-4 font-semibold">"Thunder Road" Version History</h4>
                  <div className="space-y-3">
                    {[
                      {
                        version: 'v4 (Current)',
                        date: 'Nov 15',
                        note: 'Final master with strings',
                        status: 'active',
                      },
                      {
                        version: 'v3',
                        date: 'Nov 10',
                        note: 'Added bridge, new key change',
                        status: 'saved',
                      },
                      {
                        version: 'v2 - Radio Edit',
                        date: 'Nov 5',
                        note: 'Shortened for radio (3:30)',
                        status: 'saved',
                      },
                      {
                        version: 'v1 - Original Demo',
                        date: 'Oct 28',
                        note: 'Initial recording, acoustic',
                        status: 'saved',
                      },
                    ].map((v) => (
                      <div
                        key={v.version}
                        className={`flex items-center gap-3 rounded-lg p-3 ${v.status === 'active' ? 'ring-2 ring-pink-500' : ''}`}
                        style={{ background: 'var(--panel)' }}
                      >
                        <div
                          className={`h-3 w-3 rounded-full ${v.status === 'active' ? 'bg-pink-500' : 'bg-gray-500'}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{v.version}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {v.note}
                          </p>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>
                          {v.date}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-center text-xs" style={{ color: 'var(--muted)' }}>
                    Click any version to restore or compare
                  </p>
                </div>
              </div>
              <motion.div {...fadeIn} className="order-1 md:order-2">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <Clock className="h-4 w-4 text-violet-400" />
                  <span className="text-sm text-violet-400">Version Control</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Never Lose a Good Idea</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Every save is timestamped. Compare versions, restore old ideas, keep your Radio
                  Edit separate from your Album Version.
                </p>
                <ul className="space-y-3">
                  {[
                    'Automatic timestamped saves',
                    'Named versions (Demo, V1, Radio Edit)',
                    'Side-by-side comparison view',
                    'One-click restore to any version',
                    'Full history as proof of creation date',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Feature 5: Find Collaborators */}
          <div>
            <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
              <motion.div {...fadeIn}>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Community</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold">Find Your Perfect Co-Writer</h3>
                <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                  Connect with songwriters, producers, and musicians who complement your style.
                  Real-time collaboration makes distance irrelevant.
                </p>
                <ul className="space-y-3">
                  {[
                    'Musician profiles with style/genre tags',
                    'Search by instrument, location, availability',
                    'See their published work and credits',
                    'Invite to collaborate with one click',
                    'Real-time co-writing sessions',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
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
                    <h4 className="font-semibold">Discover Collaborators</h4>
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        name: 'Marcus Thompson',
                        location: 'Nashville, TN',
                        skills: 'Lyrics, Country, Folk',
                        available: true,
                      },
                      {
                        name: 'Elena Vasquez',
                        location: 'Los Angeles, CA',
                        skills: 'Pop Production, Melodies',
                        available: true,
                      },
                      {
                        name: 'DJ Rhythm',
                        location: 'Atlanta, GA',
                        skills: 'Hip-Hop, R&B Beats',
                        available: false,
                      },
                    ].map((person) => (
                      <div
                        key={person.name}
                        className="flex items-center gap-3 rounded-lg p-3"
                        style={{ background: 'var(--panel)' }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                          {person.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{person.name}</p>
                            {person.available && (
                              <span className="h-2 w-2 rounded-full bg-green-400" />
                            )}
                          </div>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {person.location}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {person.skills}
                          </p>
                        </div>
                        <button
                          className="rounded-lg px-3 py-1 text-xs"
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                          }}
                        >
                          Invite
                        </button>
                      </div>
                    ))}
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
                <span className="text-sm text-sky-400">Website Builder</span>
              </div>
              <h3 className="mb-4 text-3xl font-bold">Showcase Your Catalog Anywhere</h3>
              <p className="mb-6 text-lg" style={{ color: 'var(--muted)' }}>
                Turn your finished songs into a gorgeous website with split sheets, credits, and
                press-ready bios. Quick Start uses your CronkWaters data, then you can add a custom
                domain and mailing list in minutes.
              </p>
              <ul className="space-y-3">
                {[
                  '8 customizable templates tuned for artists & writers',
                  'Auto-syncs lyrics, demos, and upcoming cuts',
                  'Guided custom domain setup + automatic SSL',
                  'Built-in contact + pitch form for music supervisors',
                  'Visitor analytics to see which songs get traction',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/features/website-builder"
                className="mt-6 inline-flex items-center gap-2 text-sky-300 underline-offset-4 hover:underline"
              >
                Explore Website Builder
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <div className="relative">
              <div
                className="rounded-2xl p-8"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="rounded-lg bg-sky-500/10 p-4">
                  <p className="mb-2 text-sm text-sky-200">EPK Snapshot</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--muted)' }}>Site</span>
                      <code>janedoe.cronkwaters.com</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--muted)' }}>Custom Domain</span>
                      <code>janedoesongs.com</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--muted)' }}>Downloads</span>
                      <span>Lyrics / Lead Sheets / WAV</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-sky-200">
                    Update a song in CronkWaters → website refreshes automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Songwriting Tools Grid */}
      <section className="page-section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Your Complete Songwriting Toolkit</h2>
            <p className="section-subtitle">Everything you need, nothing you don't</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Music2,
                title: 'Chord Library',
                desc: 'Every chord in every key, with voicing suggestions',
                color: 'pink',
              },
              {
                icon: BookOpen,
                title: 'Rhyme Dictionary',
                desc: 'Perfect rhymes, near rhymes, and slant rhymes',
                color: 'purple',
              },
              {
                icon: Lightbulb,
                title: 'Prompt Generator',
                desc: 'Random prompts when you need creative sparks',
                color: 'yellow',
              },
              {
                icon: Mic,
                title: 'Voice Memos',
                desc: 'Record ideas instantly, attach to any song',
                color: 'rose',
              },
              {
                icon: FileText,
                title: 'Lyric Sheets',
                desc: 'Export beautiful PDFs for sessions',
                color: 'blue',
              },
              {
                icon: Heart,
                title: 'Favorites',
                desc: 'Save your best chord progressions and phrases',
                color: 'red',
              },
              {
                icon: Globe,
                title: 'Artist Website',
                desc: 'Launch a custom-domain site with auto-updated songs & lyrics',
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
              "I've written songs for 15 years using nothing but a notebook and guitar. The AI
              assistant doesn't write for me—it helps me discover ideas I wouldn't have found alone.
              And the copyright guidance? Should be required learning for every new songwriter."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-purple-500">
                <span className="text-lg font-bold text-white">RK</span>
              </div>
              <div className="text-left">
                <p className="font-semibold">Rachel Kim</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Songwriter, 3x Grammy Nominated
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
            <h2 className="section-title">Start Writing Today</h2>
            <p className="section-subtitle">Free forever tier with generous AI limits</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {/* Free Tier */}
            <div
              className="rounded-2xl p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h3 className="mb-2 text-2xl font-bold">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-lg" style={{ color: 'var(--muted)' }}>
                  {' '}
                  forever
                </span>
              </div>
              <ul className="mb-6 space-y-2">
                {[
                  '50 AI assists per month',
                  '3 projects',
                  'Version control',
                  'Rhyme dictionary',
                  'Chord library',
                  'Voice memos',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">
                Start Free
              </Link>
            </div>

            {/* Creator Tier */}
            <div
              className="rounded-2xl p-8"
              style={{ background: 'var(--surface)', border: '2px solid var(--accent)' }}
            >
              <div
                className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                BEST FOR SONGWRITERS
              </div>
              <h3 className="mb-2 text-2xl font-bold">Creator</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$17.99</span>
                <span className="text-lg" style={{ color: 'var(--muted)' }}>
                  /month
                </span>
              </div>
              <ul className="mb-6 space-y-2">
                {[
                  'Unlimited AI assists',
                  '10 projects',
                  'Split sheet generator',
                  'Copyright registration guide',
                  'ISWC/ISRC tracking',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth?signup=true&plan=creator" className="button w-full">
                Start 7-Day Trial
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center" style={{ color: 'var(--muted)' }}>
            Need more storage or team features?{' '}
            <Link href="/pricing" className="underline hover:text-white">
              See Studio plan →
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-section">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6">Your Next Great Song Is Waiting</h2>
            <p className="mb-8 text-xl" style={{ color: 'var(--muted)' }}>
              Stop fighting your tools and start creating. Everything you need to write, protect,
              and share your songs—in one place.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="button hero-button-primary flex items-center gap-2 text-lg"
              >
                Start Writing Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/features/songwriting" className="button secondary text-lg">
                Explore Songwriting Tools
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
                © 2024 Rock N' Roll Basement. Write on.
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/solutions/bands" className="nav-link">
                For Bands
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
