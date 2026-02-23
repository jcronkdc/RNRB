'use client';

import { InstallAppButton } from '@/components/install-app-button';
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Globe,
  Layers,
  Music,
  Shield,
  ShoppingBag,
  Users,
  XCircle,
  Zap,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';

const competitors = [
  {
    name: 'Traditional DAWs',
    examples: 'Pro Tools, Logic, Ableton',
    hasFeature: {
      recording: true,
      collaboration: false,
      streaming: false,
      touring: false,
      rights: false,
      revenue: false,
      merch: false,
      messaging: false,
      nativeApp: true,
      integrated: false,
    },
  },
  {
    name: 'Streaming Platforms',
    examples: 'OBS, Streamlabs',
    hasFeature: {
      recording: true,
      collaboration: false,
      streaming: true,
      touring: false,
      rights: false,
      revenue: false,
      merch: false,
      messaging: false,
      nativeApp: true,
      integrated: false,
    },
  },
  {
    name: 'Collaboration Tools',
    examples: 'Splice, BandLab',
    hasFeature: {
      recording: false,
      collaboration: true,
      streaming: false,
      touring: false,
      rights: false,
      revenue: false,
      merch: false,
      messaging: true,
      nativeApp: false,
      integrated: false,
    },
  },
  {
    name: 'Tour Management',
    examples: 'Master Tour, Eventric',
    hasFeature: {
      recording: false,
      collaboration: false,
      streaming: false,
      touring: true,
      rights: false,
      revenue: true,
      merch: false,
      messaging: false,
      nativeApp: false,
      integrated: false,
    },
  },
  {
    name: 'Rights Management',
    examples: 'Songtrust, CD Baby Pro',
    hasFeature: {
      recording: false,
      collaboration: false,
      streaming: false,
      touring: false,
      rights: true,
      revenue: true,
      merch: false,
      messaging: false,
      nativeApp: false,
      integrated: false,
    },
  },
  {
    name: 'Merch Platforms',
    examples: 'Printful, Merchbar, Spring',
    hasFeature: {
      recording: false,
      collaboration: false,
      streaming: false,
      touring: false,
      rights: false,
      revenue: true,
      merch: true,
      messaging: false,
      nativeApp: false,
      integrated: false,
    },
  },
];

const features = [
  { key: 'recording', label: 'Studio Recording', shortLabel: 'Studio' },
  { key: 'collaboration', label: 'Real-time Collab', shortLabel: 'Collab' },
  { key: 'streaming', label: 'Live Streaming', shortLabel: 'Stream' },
  { key: 'touring', label: 'Tour Management', shortLabel: 'Tour' },
  { key: 'rights', label: 'Rights & Royalties', shortLabel: 'Rights' },
  { key: 'revenue', label: 'Revenue Tracking', shortLabel: 'Revenue' },
  { key: 'merch', label: 'Free Merch Store', shortLabel: 'Merch' },
  { key: 'messaging', label: 'Team Messaging', shortLabel: 'Chat' },
  { key: 'nativeApp', label: 'Native App', shortLabel: 'App' },
  { key: 'integrated', label: 'All-in-One', shortLabel: 'All' },
];

export default function WhyRNRBPage() {
  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ============================================
          EPIC HERO SECTION
          ============================================ */}
      <section className="hero-section relative min-h-[90vh] overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Floating music notes */}
          <div className="music-notes-container">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="music-note"
                style={{
                  left: `${8 + i * 9}%`,
                  animationDelay: `${i * 0.8}s`,
                  fontSize: `${16 + (i % 4) * 8}px`,
                }}
              >
                {['♪', '♫', '♬', '♩'][i % 4]}
              </div>
            ))}
          </div>

          {/* Enhanced gradient orbs */}
          <div className="absolute inset-0">
            <div className="gradient-orb gradient-orb-1"></div>
            <div className="gradient-orb gradient-orb-2"></div>
            <div className="gradient-orb gradient-orb-3"></div>
            <div className="gradient-orb-accent"></div>
          </div>

          {/* Subtle grid pattern */}
          <div className="hero-grid-pattern"></div>
        </div>

        <div className="container relative z-10 flex min-h-[90vh] flex-col items-center justify-center py-16">
          <div className="mx-auto max-w-5xl text-center">
            {/* Logo with Effects */}
            <Link href="/" className="logo-mega-wrapper mb-6 inline-block">
              <div className="logo-spotlight"></div>
              <div className="logo-ring logo-ring-1"></div>
              <div className="logo-ring logo-ring-2"></div>
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                className="logo-mega"
                width={280}
                height={114}
                priority
                style={{ width: '280px', height: 'auto' }}
              />
              <div className="logo-mega-glow"></div>
            </Link>

            {/* Epic Title */}
            <h1 className="hero-title relative mb-4">
              <span className="hero-text-gradient">The Only Platform</span>
              <br />
              <span style={{ color: 'var(--text)' }}>That Does It All</span>
              <div className="hero-underline"></div>
            </h1>

            {/* Tagline */}
            <p className="tagline mb-6">One Platform. Zero Compromises.</p>

            {/* Description */}
            <p className="hero-description mx-auto mb-10 max-w-3xl text-lg md:text-xl">
              Rock N&apos; Roll Basement is the world&apos;s first and only platform that combines
              professional studio recording, live streaming, tour management, rights tracking, and
              revenue management in one integrated system.{' '}
              <span style={{ color: 'var(--accent)' }}>Stop juggling. Start creating.</span>
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth?signup=true" className="button hero-button-primary text-lg">
                <span>Start Free Trial</span>
                <ArrowRight className="ml-2 h-5 w-5" />
                <div className="button-shine"></div>
              </Link>
              <Link href="#comparison" className="button secondary hero-button-secondary text-lg">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  />
                </svg>
                <span>See The Proof</span>
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <div className="scroll-arrow"></div>
          </div>
        </div>
      </section>

      {/* ============================================
          THE PROBLEM - DRAMATIC STATS
          ============================================ */}
      <section
        className="problem-section relative py-20 md:py-28"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(ellipse, rgba(239, 68, 68, 0.15), transparent 70%)',
            }}
          />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <p
                className="mb-3 text-sm font-medium uppercase tracking-widest"
                style={{ color: '#ef4444' }}
              >
                The Industry&apos;s Dirty Secret
              </p>
              <h2
                className="font-display mb-4 text-3xl font-normal md:text-4xl lg:text-5xl"
                style={{ color: 'var(--text)' }}
              >
                Musicians Are Being <span style={{ color: '#ef4444' }}>Nickel &amp; Dimed</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--text-secondary)' }}>
                You shouldn&apos;t need a computer science degree and 7 subscriptions just to make
                music.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div
                className="group relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
              >
                <div className="relative z-10">
                  <div
                    className="mb-2 text-5xl font-extrabold md:text-6xl"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #fbbf24)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    7+
                  </div>
                  <div className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Apps Used Daily
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    DAW • Collab • Tour • Rights • Chat • Storage • More
                  </p>
                </div>
              </div>

              <div
                className="group relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
              >
                <div className="relative z-10">
                  <div
                    className="mb-2 text-5xl font-extrabold md:text-6xl"
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    $180
                  </div>
                  <div className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Monthly Cost
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Money that should go to YOUR music, not software
                  </p>
                </div>
              </div>

              <div
                className="group relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
              >
                <div className="relative z-10">
                  <div
                    className="mb-2 text-5xl font-extrabold md:text-6xl"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #fbbf24)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    40%
                  </div>
                  <div className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Time Wasted
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Context switching murders creativity and momentum
                  </p>
                </div>
              </div>
            </div>

            <p
              className="mt-12 text-center text-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              We built Rock N&apos; Roll Basement to{' '}
              <span style={{ color: 'var(--accent)' }}>end this madness.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          COMPARISON TABLE - THE KNOCKOUT
          ============================================ */}
      <section
        id="comparison"
        className="relative py-20 md:py-28"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'linear-gradient(180deg, var(--bg) 0%, #161616 100%)',
        }}
      >
        <div className="container">
          <div className="mb-16 text-center">
            <p
              className="mb-3 text-sm font-medium uppercase tracking-widest"
              style={{ color: 'var(--gold)' }}
            >
              Feature Comparison
            </p>
            <h2
              className="font-display mb-4 text-3xl font-normal md:text-4xl lg:text-5xl"
              style={{ color: 'var(--text)' }}
            >
              Why Musicians Need <span style={{ color: 'var(--accent)' }}>5+ Apps</span> Today
            </h2>
            <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--text-secondary)' }}>
              The truth hurts. See how we stack up against the fragmented competition.
            </p>
          </div>

          {/* Scrollable Table Container */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            {/* Glow effect at top */}
            <div
              className="absolute left-0 right-0 top-0 h-1"
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--accent), var(--gold), var(--accent), transparent)',
              }}
            />

            <div className="overflow-x-auto p-6 md:p-8">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th
                      className="pb-4 pr-4 text-left text-base font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      Platform
                    </th>
                    {features.map((feature) => (
                      <th key={feature.key} className="px-2 pb-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="hidden text-xs font-medium md:inline"
                            style={{ color: 'var(--muted)' }}
                          >
                            {feature.label}
                          </span>
                          <span
                            className="text-xs font-medium md:hidden"
                            style={{ color: 'var(--muted)' }}
                          >
                            {feature.shortLabel}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor, index) => (
                    <tr
                      key={index}
                      className="group transition-colors"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="py-4 pr-4">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text)' }}>
                            {competitor.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--muted)' }}>
                            {competitor.examples}
                          </p>
                        </div>
                      </td>
                      {features.map((feature) => (
                        <td key={feature.key} className="px-2 py-4 text-center">
                          {competitor.hasFeature[
                            feature.key as keyof typeof competitor.hasFeature
                          ] ? (
                            <div
                              className="mx-auto flex h-7 w-7 items-center justify-center rounded-full"
                              style={{ background: 'var(--sage-dim)' }}
                            >
                              <CheckCircle className="h-4 w-4" style={{ color: 'var(--sage)' }} />
                            </div>
                          ) : (
                            <div
                              className="mx-auto flex h-7 w-7 items-center justify-center rounded-full"
                              style={{ background: 'rgba(100, 100, 100, 0.1)' }}
                            >
                              <XCircle className="h-4 w-4" style={{ color: 'var(--muted-soft)' }} />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Rock N' Roll Basement Row - THE WINNER */}
                  <tr
                    className="relative"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(232, 93, 59, 0.1), rgba(212, 168, 75, 0.1), rgba(232, 93, 59, 0.1))',
                    }}
                  >
                    <td className="py-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent), var(--gold))',
                          }}
                        >
                          <Music className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                            Rock N&apos; Roll Basement
                          </p>
                          <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                            All-in-One Platform
                          </p>
                        </div>
                      </div>
                    </td>
                    {features.map((feature) => (
                      <td key={feature.key} className="px-2 py-6 text-center">
                        <div
                          className="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent), var(--gold))',
                          }}
                        >
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-8 text-center text-lg" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent)' }}>One subscription.</span> Everything you need.{' '}
            <span style={{ color: 'var(--gold)' }}>No compromises.</span>
          </p>
        </div>
      </section>

      {/* ============================================
          WHAT MAKES US UNIQUE - FEATURE SHOWCASE
          ============================================ */}
      <section className="relative py-20 md:py-28" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full blur-[150px]"
            style={{
              background: 'radial-gradient(ellipse, rgba(232, 93, 59, 0.08), transparent 70%)',
            }}
          />
        </div>

        <div className="container relative z-10">
          <div className="mb-16 text-center">
            <p
              className="mb-3 text-sm font-medium uppercase tracking-widest"
              style={{ color: 'var(--accent)' }}
            >
              Built Different
            </p>
            <h2
              className="font-display mb-4 text-3xl font-normal md:text-4xl lg:text-5xl"
              style={{ color: 'var(--text)' }}
            >
              What Makes Us <span style={{ color: 'var(--gold)' }}>Truly Unique</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Integrated Workflow */}
            <div
              className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10 flex gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(232, 93, 59, 0.15)' }}
                >
                  <Layers className="h-7 w-7" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Integrated Workflow
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Record a song, stream the session, schedule the tour, track the royalties, and
                    manage the revenue—all without switching platforms.
                  </p>
                  <ul className="space-y-2">
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--accent)' }}
                      />
                      <span>Seamless data flow between features</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--accent)' }}
                      />
                      <span>One login, infinite possibilities</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--accent)' }}
                      />
                      <span>Unified analytics across all activities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Built for Modern Musicians */}
            <div
              className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10 flex gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(107, 155, 195, 0.15)' }}
                >
                  <Globe className="h-7 w-7" style={{ color: 'var(--sky)' }} />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Built for Modern Musicians
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Today&apos;s artists are creators, performers, and entrepreneurs. Our platform
                    reflects that reality.
                  </p>
                  <ul className="space-y-2">
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--sky)' }}
                      />
                      <span>Stream concerts while tracking sales</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--sky)' }}
                      />
                      <span>Collaborate with HD video &amp; audio</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--sky)' }}
                      />
                      <span>Manage streaming &amp; sync rights</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Financial Transparency */}
            <div
              className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10 flex gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(123, 145, 120, 0.15)' }}
                >
                  <DollarSign className="h-7 w-7" style={{ color: 'var(--sage)' }} />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Financial Transparency
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    See exactly where your money comes from and where it goes, all in real-time.
                  </p>
                  <ul className="space-y-2">
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--sage)' }}
                      />
                      <span>Automated royalty calculations</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--sage)' }}
                      />
                      <span>Tour revenue vs. expenses</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--sage)' }}
                      />
                      <span>Streaming income consolidation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Industry-Grade Security */}
            <div
              className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10 flex gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(212, 168, 75, 0.15)' }}
                >
                  <Shield className="h-7 w-7" style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    Industry-Grade Security
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Your music, your data, your revenue—protected with the same security used by
                    major labels.
                  </p>
                  <ul className="space-y-2">
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--gold)' }}
                      />
                      <span>End-to-end encryption</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--gold)' }}
                      />
                      <span>Secure contract storage</span>
                    </li>
                    <li
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--gold)' }}
                      />
                      <span>GDPR and CCPA compliant</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Use Anywhere - PWA Section */}
          <div
            className="mt-8 overflow-hidden rounded-2xl p-8"
            style={{
              background:
                'linear-gradient(135deg, rgba(123, 145, 120, 0.1), rgba(16, 185, 129, 0.05))',
              border: '1px solid rgba(123, 145, 120, 0.3)',
            }}
          >
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, var(--sage), #10b981)' }}
              >
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2L12 8M12 8L9 5M12 8L15 5"
                  />
                  <rect x="4" y="10" width="16" height="12" rx="2" />
                  <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Install as a Native App on Any Device
                </h3>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Rock N&apos; Roll Basement works like a native app on Mac, PC, iPhone, iPad, and
                  Android—no app store required.
                </p>
                <div className="mb-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{ background: 'rgba(123, 145, 120, 0.2)', color: 'var(--sage)' }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mac &amp; Windows
                  </span>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{ background: 'rgba(123, 145, 120, 0.2)', color: 'var(--sage)' }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    iPhone &amp; Android
                  </span>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{ background: 'rgba(123, 145, 120, 0.2)', color: 'var(--sage)' }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Works Offline
                  </span>
                </div>
                <div className="flex justify-center md:justify-start">
                  <InstallAppButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST INDICATORS
          ============================================ */}
      <section
        className="relative py-20 md:py-28"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'linear-gradient(180deg, #161616 0%, var(--bg) 100%)',
        }}
      >
        <div className="container">
          <div className="mb-12 text-center">
            <h2
              className="font-display mb-4 text-3xl font-normal md:text-4xl"
              style={{ color: 'var(--text)' }}
            >
              Why Musicians <span style={{ color: 'var(--accent)' }}>Trust Us</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(232, 93, 59, 0.15)' }}
                >
                  <Music className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                  Built by Musicians
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  We understand your workflow because we&apos;ve lived it
                </p>
              </div>
            </div>

            <div
              className="group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(212, 168, 75, 0.15)' }}
                >
                  <Zap className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                </div>
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                  Always Improving
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Regular updates based on your feedback
                </p>
              </div>
            </div>

            <div
              className="group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(107, 155, 195, 0.15)' }}
                >
                  <Users className="h-6 w-6" style={{ color: 'var(--sky)' }} />
                </div>
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                  Community First
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Join thousands of artists on the platform
                </p>
              </div>
            </div>

            <div
              className="group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="relative z-10">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(123, 145, 120, 0.15)' }}
                >
                  <Shield className="h-6 w-6" style={{ color: 'var(--sage)' }} />
                </div>
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                  Your Rights Protected
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  You own your music, data, and creative work
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA - CONCERT ENERGY
          ============================================ */}
      <section
        className="final-cta relative overflow-hidden py-24 md:py-32"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
            style={{
              background: 'radial-gradient(ellipse, rgba(232, 93, 59, 0.15), transparent 60%)',
            }}
          />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="cta-title mb-4">Ready to Simplify Your Music Career?</h2>
            <p className="cta-subtitle mx-auto max-w-2xl">
              Join the revolution. One platform, unlimited possibilities.
              <br />
              <span style={{ color: 'var(--accent)' }}>No credit card required to start.</span>
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth?signup=true"
                className="button hero-button-primary cta-button-primary text-lg"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="ml-2 h-5 w-5" />
                <div className="button-shine"></div>
              </Link>
              <Link href="/pricing" className="button secondary hero-button-secondary text-lg">
                View Pricing
              </Link>
            </div>

            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Free for 14 days • No credit card required • Cancel anytime
            </p>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                <Shield className="h-4 w-4" style={{ color: 'var(--sage)' }} />
                <span>Secure &amp; Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                <CheckCircle className="h-4 w-4" style={{ color: 'var(--sage)' }} />
                <span>You Own Your Music</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                <Zap className="h-4 w-4" style={{ color: 'var(--sage)' }} />
                <span>Instant Setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
