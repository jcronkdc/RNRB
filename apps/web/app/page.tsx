import Image from 'next/image';
import Link from 'next/link';

import { generateFAQSchema, JsonLd } from '@/lib/seo';

const faqs = [
  {
    question: 'Who owns my music?',
    answer:
      "You do. Always. We never claim any rights to your work. Your music is yours. Rock N' Roll Basement is a platform that helps you create, collaborate, and manage your music, but all intellectual property rights remain with you.",
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. We use end-to-end encryption, are GDPR compliant, and follow industry-standard security practices. Your data is stored securely with enterprise-grade encryption both in transit and at rest.',
  },
  {
    question: 'Can I export my work?',
    answer:
      'Export anytime in standard formats—MIDI, PDF, WAV, MP3. No lock-in ever. You have complete control over your data and can download all your work whenever you want.',
  },
  {
    question: 'How does the AI work?',
    answer:
      'Powered by Claude from Anthropic, our AI assists—never replaces—your creativity. You stay in control. The AI can help with chord progressions, lyric suggestions, arrangement ideas, and more, but every final decision is yours.',
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={generateFAQSchema(faqs)} />
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {/* Hero Section - Enhanced */}
        <section
          className="hero-section relative min-h-screen overflow-hidden pt-20"
          aria-label="Hero"
        >
          {/* Animated Background - Enhanced */}
          <div className="absolute inset-0">
            {/* Floating music notes */}
            <div className="music-notes-container">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="music-note"
                  style={{
                    left: `${5 + i * 8}%`,
                    animationDelay: `${i * 0.7}s`,
                    fontSize: `${18 + (i % 4) * 8}px`,
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

          <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center py-16">
            <div className="mx-auto max-w-5xl text-center">
              {/* SUPER PROMINENT LOGO */}
              <div className="logo-mega-wrapper mb-8">
                <div className="logo-spotlight"></div>
                <div className="logo-ring logo-ring-1"></div>
                <div className="logo-ring logo-ring-2"></div>
                <div className="logo-ring logo-ring-3"></div>
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement - Music Collaboration Platform Logo"
                  className="logo-mega"
                  width={320}
                  height={130}
                  priority
                  quality={100}
                />
                <div className="logo-mega-glow"></div>
                <div className="logo-particles">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="logo-particle"
                      style={{ '--i': i } as React.CSSProperties}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Animated Title */}
              <h1 className="hero-title relative mb-6" data-immutable="true">
                <span className="hero-text-gradient">Rock N' Roll Basement</span>
                <div className="hero-underline"></div>
              </h1>

              {/* Tagline */}
              <h2 className="tagline mb-6">Your Workshop. Your Sound. Your Story.</h2>

              {/* Description */}
              <div className="hero-description-wrapper">
                <p className="hero-description mb-10 text-xl" data-immutable="true">
                  This isn't just software. It's a home for your music. Write, collaborate, perform,
                  and get paid—all in one place. Whether you're a bedroom producer, touring artist,
                  or just someone with a melody that won't leave your head— you belong here.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="hero-buttons mb-12 flex flex-wrap items-center justify-center gap-4">
                <Link href="/auth?signup=true" className="button hero-button-primary text-lg">
                  <span>Enter Your Workshop →</span>
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <div className="button-shine"></div>
                </Link>
                <Link href="#demo" className="button secondary hero-button-secondary text-lg">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>See It In Action</span>
                </Link>
              </div>

              {/* Quick Stats - Story-Driven */}
              <div className="hero-stats grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
                <div className="stat-item">
                  <div className="stat-number">Your</div>
                  <div className="stat-label">Music, Your Rights</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">75+</div>
                  <div className="stat-label">Tools in One Place</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">$0</div>
                  <div className="stat-label">To Start Creating</div>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="scroll-indicator">
              <div className="scroll-arrow"></div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section
          className="problem-section page-section"
          style={{ borderTop: '1px solid var(--border)' }}
          aria-labelledby="problem-heading"
        >
          <div className="container">
            <div className="section-header">
              <h2 id="problem-heading" className="section-title">
                You Deserve Better Than This
              </h2>
              <p className="section-subtitle">
                You shouldn't need 7 apps, 3 subscriptions, and a spreadsheet just to make music. We
                built something different.
              </p>
            </div>

            <div className="problem-grid mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="problem-stat">
                <div className="problem-number">7+</div>
                <div className="problem-label">Apps Musicians Use Daily</div>
                <p className="problem-desc">
                  DAW + Collaboration + Tour + Rights + Messaging + Storage + More
                </p>
              </div>
              <div className="problem-stat">
                <div className="problem-number">$180</div>
                <div className="problem-label">Monthly Subscription Cost</div>
                <p className="problem-desc">Money that should go toward your music, not software</p>
              </div>
              <div className="problem-stat">
                <div className="problem-number">40%</div>
                <div className="problem-label">Time Wasted Switching</div>
                <p className="problem-desc">Context switching kills creativity and momentum</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/why-rnrb" className="button secondary">
                See The Full Comparison →
              </Link>
            </div>
          </div>
        </section>

        {/* Your Workshop - Story-Driven Feature Showcase */}
        <section
          id="features"
          className="workshop-features"
          style={{ borderTop: '1px solid var(--border)' }}
          aria-labelledby="features-heading"
        >
          <div className="container py-20 md:py-28">
            {/* Section Header */}
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p
                className="mb-3 text-sm font-medium uppercase tracking-widest"
                style={{ color: 'var(--gold)' }}
              >
                Your Workshop, Fully Equipped
              </p>
              <h2
                id="features-heading"
                className="font-display mb-6 text-3xl font-normal md:text-4xl lg:text-5xl"
                style={{ color: 'var(--text)' }}
              >
                Every tool you need.
                <br />
                <span style={{ color: 'var(--accent)' }}>Nothing you don't.</span>
              </h2>
              <p className="text-lg md:text-xl" style={{ color: 'var(--text-secondary)' }}>
                From the spark of an idea at 3am to your first sold-out show— we're with you every
                step of the way.
              </p>
            </div>

            {/* Three Pillars - The Heart of the Workshop */}
            <div className="mb-20 grid gap-8 md:grid-cols-3">
              {/* Pillar 1: The Blank Page */}
              <Link
                href="/songwriting"
                className="workshop-pillar group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, var(--panel) 0%, var(--bg-elevated) 100%)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Warm glow effect */}
                <div
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                  style={{ background: 'var(--accent)' }}
                />

                {/* Custom Icon - Pencil/Notes */}
                <div
                  className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: 'var(--accent-glow)' }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: 'var(--accent)' }}
                  >
                    <path
                      d="M12 19.5L19.5 12L21 13.5L13.5 21L12 19.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 20H8L18 10L14 6L4 16V20Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 3L7 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                    <path
                      d="M14 6L18 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p
                  className="mb-2 text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Create
                </p>

                <h3 className="font-display mb-4 text-2xl" style={{ color: 'var(--text)' }}>
                  The Blank Page
                </h3>

                <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  That 3am melody won't wait. Capture ideas instantly. Shape them into songs. Get
                  unstuck with AI that suggests—never dictates. Your voice, amplified.
                </p>

                {/* Benefits - not checkmarks */}
                <ul className="mb-6 space-y-2">
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Chord progressions & lyric suggestions
                  </li>
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Version control—never lose an idea
                  </li>
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Voice memos to capture inspiration
                  </li>
                </ul>

                <span
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Start Writing
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Pillar 2: The Session */}
              <Link
                href="/collaboration"
                className="workshop-pillar group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, var(--panel) 0%, var(--bg-elevated) 100%)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Warm glow effect */}
                <div
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                  style={{ background: 'var(--gold)' }}
                />

                {/* Custom Icon - People/Connection */}
                <div
                  className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: 'var(--gold-dim)' }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: 'var(--gold)' }}
                  >
                    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M3 21V18C3 15.7909 4.79086 14 7 14H11C13.2091 14 15 15.7909 15 18V21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17 14C19.2091 14 21 15.7909 21 18V21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 10L14 12L12 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p
                  className="mb-2 text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Connect
                </p>

                <h3 className="font-display mb-4 text-2xl" style={{ color: 'var(--text)' }}>
                  The Session
                </h3>

                <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Your bandmate's in Berlin. Your producer's in LA. Jump on a call, share your
                  screen, write together in real-time. Distance disappears.
                </p>

                {/* Benefits */}
                <ul className="mb-6 space-y-2">
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    HD video calls with up to 50 people
                  </li>
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    Screen sharing for DAW walkthroughs
                  </li>
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    Real-time cursor collaboration
                  </li>
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    Schedule meetings with shareable links
                  </li>
                </ul>

                <span
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--gold)' }}
                >
                  Start a Session
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Pillar 3: The Stage */}
              <Link
                href="/features/website-builder"
                className="workshop-pillar group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(180deg, var(--panel) 0%, var(--bg-elevated) 100%)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Warm glow effect */}
                <div
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                  style={{ background: 'var(--sage)' }}
                />

                {/* Custom Icon - Stage/Globe */}
                <div
                  className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: 'var(--sage-dim)' }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: 'var(--sage)' }}
                  >
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M12 3C12 3 8 7.5 8 12C8 16.5 12 21 12 21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 3C12 3 16 7.5 16 12C16 16.5 12 21 12 21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4.5 7.5H19.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4.5 16.5H19.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <p
                  className="mb-2 text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  Grow
                </p>

                <h3 className="font-display mb-4 text-2xl" style={{ color: 'var(--text)' }}>
                  The Stage
                </h3>

                <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Your music deserves to be heard. Launch a stunning website in minutes. Plan your
                  tour. Build your audience. Get paid for your work.
                </p>

                {/* Benefits */}
                <ul className="mb-6 space-y-2">
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    Professional website in 60 seconds
                  </li>
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    Tour planning with smart routing
                  </li>
                  <li
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    Track revenue from all sources
                  </li>
                </ul>

                <span
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--sage)' }}
                >
                  Take the Stage
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* The Full Toolkit - Grouped by Purpose */}
            <div className="mb-16">
              <h3
                className="mb-8 text-center text-lg font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                And that's just the beginning...
              </h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Category: Protect Your Work */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'var(--gold-dim)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: 'var(--gold)' }}
                      >
                        <path
                          d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Protect Your Work
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--gold)' }}
                      />
                      Copyright registration guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--gold)' }}
                      />
                      Split sheet generation & sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--gold)' }}
                      />
                      ISWC & ISRC tracking
                    </li>
                  </ul>
                </div>

                {/* Category: Stay Organized */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'var(--sage-dim)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: 'var(--sage)' }}
                      >
                        <path
                          d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Stay Organized
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--sage)' }}
                      />
                      Project folders & milestones
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--sage)' }}
                      />
                      Cloud storage with drag & drop
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--sage)' }}
                      />
                      Version control for every song
                    </li>
                  </ul>
                </div>

                {/* Category: Hit the Road */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(232, 93, 59, 0.1)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: 'var(--accent)' }}
                      >
                        <path
                          d="M9 20L5 16M5 16L9 12M5 16H15C17.2091 16 19 14.2091 19 12V4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="19" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Hit the Road
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--accent)' }}
                      />
                      Tour planner with smart routing
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--accent)' }}
                      />
                      Venue database & contacts
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: 'var(--accent)' }}
                      />
                      Smart setlist builder
                    </li>
                  </ul>
                </div>

                {/* Category: Get Paid */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#22c55e' }}
                      >
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M12 7V17M15 9.5C15 8.12 13.66 7 12 7C10.34 7 9 8.12 9 9.5C9 10.88 10.34 12 12 12C13.66 12 15 13.12 15 14.5C15 15.88 13.66 17 12 17C10.34 17 9 15.88 9 14.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Get Paid
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#22c55e' }} />
                      Revenue dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#22c55e' }} />
                      Royalty tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#22c55e' }} />
                      Ticket & merch sales
                    </li>
                  </ul>
                </div>

                {/* Category: Find Your People */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(139, 92, 246, 0.1)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#8b5cf6' }}
                      >
                        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M3 21V18C3 15.79 4.79 14 7 14H11C13.21 14 15 15.79 15 18V21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M17 14C19.21 14 21 15.79 21 18V21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Find Your People
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#8b5cf6' }} />
                      Musician discovery
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#8b5cf6' }} />
                      Direct messaging
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#8b5cf6' }} />
                      Collaboration requests
                    </li>
                  </ul>
                </div>

                {/* Category: AI That Assists */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(236, 72, 153, 0.1)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#ec4899' }}
                      >
                        <path
                          d="M12 2V4M12 20V22M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      AI That Assists
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#ec4899' }} />
                      Chord suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#ec4899' }} />
                      Lyric inspiration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#ec4899' }} />
                      Tour route optimization
                    </li>
                  </ul>
                </div>

                {/* Category: Go Live */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#ef4444' }}
                      >
                        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Go Live
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#ef4444' }} />
                      Stream to fans worldwide
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#ef4444' }} />
                      Live chat & reactions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#ef4444' }} />
                      Schedule streams in advance
                    </li>
                  </ul>
                </div>

                {/* Category: Masterclasses */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(168, 85, 247, 0.1)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#a855f7' }}
                      >
                        <path
                          d="M22 10v6M2 10l10-5 10 5-10 5z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Masterclasses
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#a855f7' }} />
                      Learn from industry pros
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#a855f7' }} />
                      Live & on-demand lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#a855f7' }} />
                      Teach and earn revenue
                    </li>
                  </ul>
                </div>

                {/* Category: Video Meetings */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#3b82f6' }}
                      >
                        <path
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                      Video Meetings
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#3b82f6' }} />
                      Zoom-style HD video calls
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#3b82f6' }} />
                      Screen sharing built-in
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full" style={{ background: '#3b82f6' }} />
                      Meeting scheduling & links
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="mb-6 text-lg" style={{ color: 'var(--text-secondary)' }}>
                75+ tools. One home. Zero friction.
              </p>
              <Link
                href="/auth?signup=true"
                className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-medium text-white transition-all hover:scale-105"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 8px 24px var(--accent-glow)',
                }}
              >
                Enter Your Workshop
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section
          id="demo"
          className="page-section demo-section"
          style={{ borderTop: '1px solid var(--border)' }}
          aria-labelledby="demo-heading"
        >
          <div className="container">
            <div className="section-header">
              <h2 id="demo-heading" className="section-title">
                See The Magic Happen
              </h2>
              <p className="section-subtitle">
                Watch how Rock N' Roll Basement transforms the way you create music
              </p>
            </div>

            <div className="demo-showcase mx-auto max-w-5xl">
              <div className="demo-window">
                <div className="demo-window-header">
                  <div className="demo-window-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="demo-window-title">
                    Rock N' Roll Basement - Songwriting Studio
                  </div>
                </div>
                <div className="demo-window-content">
                  <div className="demo-placeholder">
                    <div className="demo-placeholder-icon">
                      <svg
                        className="h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p>Interactive Demo Coming Soon</p>
                    <Link href="/auth?signup=true" className="button mt-4">
                      Try It Free Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For - Enhanced with Professional Icons */}
        <section
          id="who"
          className="page-section"
          style={{ borderTop: '1px solid var(--border)' }}
          aria-labelledby="who-heading"
        >
          <div className="container">
            <div className="section-header">
              <h2 id="who-heading" className="section-title">
                Built For Real Musicians
              </h2>
              <p className="section-subtitle">
                From bedroom producers to touring bands, we've got you covered
              </p>
            </div>
            <div className="persona-grid grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="persona-card">
                <div
                  className="persona-icon"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 99, 71, 0.15), rgba(255, 99, 71, 0.05))',
                  }}
                >
                  <svg
                    className="h-8 w-8"
                    style={{ color: 'var(--accent)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3>Solo Artists</h3>
                <p>Write, record, and release—all on your own schedule with AI as your co-pilot</p>
              </div>
              <div className="persona-card">
                <div
                  className="persona-icon"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
                  }}
                >
                  <svg
                    className="h-8 w-8"
                    style={{ color: '#3b82f6' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3>Bands</h3>
                <p>Collaborate remotely, manage your catalog, and plan tours together</p>
              </div>
              <div className="persona-card">
                <div
                  className="persona-icon"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
                  }}
                >
                  <svg
                    className="h-8 w-8"
                    style={{ color: '#8b5cf6' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <h3>Producers</h3>
                <p>Work with artists anywhere, share sessions, get instant feedback</p>
              </div>
              <div className="persona-card">
                <div
                  className="persona-icon"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))',
                  }}
                >
                  <svg
                    className="h-8 w-8"
                    style={{ color: '#ec4899' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3>Songwriters</h3>
                <p>Break through blocks with AI, protect your rights, find collaborators</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing - Workshop Style */}
        <section
          id="pricing"
          className="py-20 md:py-28"
          style={{ borderTop: '1px solid var(--border)' }}
          aria-labelledby="pricing-heading"
        >
          <div className="container mx-auto max-w-6xl px-4">
            {/* Section Header */}
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p
                className="mb-3 text-sm font-medium uppercase tracking-widest"
                style={{ color: 'var(--gold)' }}
              >
                Invest in Your Craft
              </p>
              <h2
                id="pricing-heading"
                className="font-display mb-4 text-3xl font-normal md:text-4xl"
                style={{ color: 'var(--text)' }}
              >
                Your music is worth it.
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>Our pricing isn't a barrier.</span>
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                Start free. Grow at your own pace. No tricks, no hidden fees.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {/* Free Plan - The Spark */}
              <div
                className="relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="mb-6">
                  <p
                    className="mb-1 text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--muted)' }}
                  >
                    The Spark
                  </p>
                  <h3 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                    Free
                  </h3>
                  <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    For those just getting started. Plant the seed.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                      $0
                    </span>
                    <span style={{ color: 'var(--muted)' }}>forever</span>
                  </div>
                </div>

                <ul className="mb-6 space-y-3">
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    3 projects to experiment with
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    Invite 1 collaborator per project
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    1 GB cloud storage
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    Real-time collaboration
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    Core songwriting tools
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--sage)' }}
                    />
                    Community support
                  </li>
                </ul>

                <Link
                  href="/auth?signup=true"
                  className="block w-full rounded-xl py-3 text-center text-sm font-medium transition-colors"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  Start Free →
                </Link>
              </div>

              {/* Creator Plan - The Grind */}
              <div
                className="relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="mb-6">
                  <p
                    className="mb-1 text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--gold)' }}
                  >
                    The Grind
                  </p>
                  <h3 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                    Creator
                  </h3>
                  <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    For musicians ready to level up. This is where it gets real.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                      $17.99
                    </span>
                    <span style={{ color: 'var(--muted)' }}>/month</span>
                  </div>
                </div>

                <ul className="mb-6 space-y-3">
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    10 projects—room to grow
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    5 collaborators per project
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    10 GB storage for your catalog
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    AI chord & lyric suggestions
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    Smart tour routing
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    Priority support
                  </li>
                </ul>

                <Link
                  href="/auth?signup=true&plan=creator"
                  className="block w-full rounded-xl py-3 text-center text-sm font-medium transition-colors"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold)',
                  }}
                >
                  Try Free for 7 Days →
                </Link>
              </div>

              {/* Studio Plan - The Machine */}
              <div
                className="relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(232, 93, 59, 0.05) 100%)',
                  border: '1px solid var(--accent)',
                  boxShadow: '0 0 40px var(--accent-glow)',
                }}
              >
                {/* Popular Badge */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  Most Popular
                </div>

                <div className="mb-6 pt-2">
                  <p
                    className="mb-1 text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--accent)' }}
                  >
                    The Machine
                  </p>
                  <h3 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                    Studio
                  </h3>
                  <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    For professionals who mean business. No limits.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                      $29.99
                    </span>
                    <span style={{ color: 'var(--muted)' }}>/month</span>
                  </div>
                </div>

                <ul className="mb-6 space-y-3">
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Unlimited projects
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Unlimited collaborators
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    100 GB storage
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    All AI tools unlocked
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    HD video calls (50 people)
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Screen sharing & recording
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Advanced analytics
                  </li>
                  <li
                    className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    Dedicated support
                  </li>
                </ul>

                <Link
                  href="/auth?signup=true&plan=studio"
                  className="block w-full rounded-xl py-3 text-center text-sm font-medium text-white transition-all hover:scale-105"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 4px 12px var(--accent-glow)',
                  }}
                >
                  Try Free for 7 Days →
                </Link>
              </div>
            </div>

            {/* Trust Message */}
            <p
              className="mx-auto mt-10 max-w-md text-center text-sm"
              style={{ color: 'var(--muted)' }}
            >
              All paid plans include a 7-day free trial. No credit card required to start. Cancel
              anytime—your music stays yours.
            </p>
          </div>
        </section>

        {/* FAQ - Condensed */}
        <section
          id="faq"
          className="page-section"
          style={{ borderTop: '1px solid var(--border)' }}
          itemScope
          itemType="https://schema.org/FAQPage"
          aria-labelledby="faq-heading"
        >
          <div className="container">
            <div className="section-header">
              <h2 id="faq-heading" className="section-title">
                Questions? We've Got Answers.
              </h2>
            </div>
            <div className="mx-auto max-w-3xl">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-item"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <h3 className="faq-question" itemProp="name">
                    {faq.question}
                  </h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="faq-answer" itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="final-cta page-section"
          style={{ borderTop: '1px solid var(--border)' }}
          aria-labelledby="cta-heading"
        >
          <div className="container">
            <div className="cta-content mx-auto max-w-3xl text-center">
              <h2 id="cta-heading" className="cta-title">
                Ready to Transform Your Music Career?
              </h2>
              <p className="cta-subtitle">
                Join thousands of musicians who've already simplified their creative workflow. No
                credit card required. Start making music today.
              </p>
              <div className="cta-buttons flex flex-wrap items-center justify-center gap-4">
                <Link href="/auth?signup=true" className="button cta-button-primary text-lg">
                  Start Free Today
                </Link>
                <Link href="/why-rnrb" className="button secondary text-lg">
                  Compare Platforms
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="site-footer"
          style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6) 0' }}
          role="contentinfo"
        >
          <div className="container">
            <div className="footer-content flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="footer-brand flex items-center gap-3">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement Logo"
                  width={40}
                  height={40}
                />
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  © 2024 Rock N' Roll Basement. All rights reserved.
                </span>
              </div>
              <nav
                className="footer-links flex flex-wrap justify-center gap-6 text-sm"
                aria-label="Footer navigation"
              >
                <Link href="/features/songwriting" className="nav-link">
                  Songwriting
                </Link>
                <Link href="/features/collaboration" className="nav-link">
                  Collaboration
                </Link>
                <Link href="/live" className="nav-link">
                  Live Streaming
                </Link>
                <Link href="/masterclasses" className="nav-link">
                  Masterclasses
                </Link>
                <Link href="/features/website-builder" className="nav-link">
                  Website Builder
                </Link>
                <Link href="/why-rnrb" className="nav-link">
                  Why RNRB
                </Link>
                <Link href="/pricing" className="nav-link">
                  Pricing
                </Link>
                <Link href="/terms" className="nav-link">
                  Terms
                </Link>
                <Link href="/privacy" className="nav-link">
                  Privacy
                </Link>
                <Link href="/contact" className="nav-link">
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
