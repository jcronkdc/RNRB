import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section - Enhanced */}
      <section className="hero-section relative min-h-screen overflow-hidden pt-20">
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
                alt="Rock N' Roll Basement"
                className="logo-mega"
                width={320}
                height={130}
                priority
                quality={100}
              />
              <div className="logo-mega-glow"></div>
              <div className="logo-particles">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="logo-particle" style={{ '--i': i } as React.CSSProperties}></div>
                ))}
              </div>
            </div>

            {/* Animated Title */}
            <h1 className="hero-title relative mb-6" data-immutable="true">
              <span className="hero-text-gradient">Rock N' Roll Basement</span>
              <div className="hero-underline"></div>
            </h1>

            {/* Tagline */}
            <p className="tagline mb-6">The All-In-One Platform for Modern Musicians</p>

            {/* Description */}
            <div className="hero-description-wrapper">
              <p className="hero-description mb-10 text-xl" data-immutable="true">
                Whether you're a songwriter needing better tools, new to the business and finding
                gigs, discovering your roots in gospel or Appalachian folk, inventing country metal,
                or following Dylan's path to say what you need to say. This is where your music
                finds its voice. Collaborate with artists worldwide in ways rarely seen before.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="hero-buttons mb-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth?signup=true" className="button hero-button-primary text-lg">
                <span>Start Free Today</span>
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="button-shine"></div>
              </Link>
              <Link href="#demo" className="button secondary hero-button-secondary text-lg">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>See It In Action</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="hero-stats grid grid-cols-3 gap-6 text-center">
              <div className="stat-item">
                <div className="stat-number">75+</div>
                <div className="stat-label">Features</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">∞</div>
                <div className="stat-label">Creativity</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1</div>
                <div className="stat-label">Platform</div>
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
      <section className="problem-section page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Musicians Deserve Better</h2>
            <p className="section-subtitle">
              Today's artists juggle 7+ apps just to create, collaborate, perform, and get paid.
              It's chaos. We fixed it.
            </p>
          </div>

          <div className="problem-grid mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="problem-stat">
              <div className="problem-number">7+</div>
              <div className="problem-label">Apps Musicians Use Daily</div>
              <p className="problem-desc">DAW + Collaboration + Tour + Rights + Messaging + Storage + More</p>
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

      {/* Feature Showcase - Interactive Cards */}
      <section id="features" className="page-section feature-showcase" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need. Nothing You Don't.</h2>
            <p className="section-subtitle">
              From writing your first chord to managing your world tour—all in one place.
            </p>
          </div>

          {/* Primary Features - Large Cards */}
          <div className="primary-features mb-12 grid gap-6 md:grid-cols-2">
            {/* AI Songwriting */}
            <Link href="/features/songwriting" className="feature-card-large group">
              <div className="feature-card-bg" style={{ '--accent-color': '#ec4899' } as React.CSSProperties}></div>
              <div className="feature-card-content">
                <div className="feature-icon-large" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
                  <svg className="h-8 w-8" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <div className="feature-badge">AI-Powered</div>
                  <h3 className="feature-title-large">Songwriting Studio</h3>
                  <p className="feature-desc-large">
                    Complete songwriting environment with version control, multi-track mixer, 
                    real-time key detection, AI chord/lyric suggestions, split sheets, copyright registration guidance, and ISWC/ISRC tracking.
                  </p>
                  <ul className="feature-list">
                    <li>✓ Version control (v1, v2, Radio Edit)</li>
                    <li>✓ Multi-track stems mixer</li>
                    <li>✓ AI chord & lyric suggestions</li>
                    <li>✓ Split sheets & copyright tools</li>
                  </ul>
                  <span className="feature-link">Explore Songwriting →</span>
                </div>
              </div>
            </Link>

            {/* Real-Time Collaboration */}
            <Link href="/features/collaboration" className="feature-card-large group">
              <div className="feature-card-bg" style={{ '--accent-color': '#3b82f6' } as React.CSSProperties}></div>
              <div className="feature-card-content">
                <div className="feature-icon-large" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                  <svg className="h-8 w-8" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="feature-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>Live Sessions</div>
                  <h3 className="feature-title-large">Real-Time Collaboration</h3>
                  <p className="feature-desc-large">
                    HD video calls (up to 50 people), screen sharing, real-time CRDT editing (Yjs), 
                    instant messaging with voice messages, presence tracking, multi-cursor editing, and pinned comments on lyrics/audio.
                  </p>
                  <ul className="feature-list">
                    <li>✓ HD Video (Daily.co) + Screen share</li>
                    <li>✓ Real-time sync (Ably + Yjs CRDT)</li>
                    <li>✓ Multi-cursor editing</li>
                    <li>✓ Voice messages + reactions</li>
                  </ul>
                  <span className="feature-link" style={{ color: '#3b82f6' }}>Explore Collaboration →</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary Features Grid - Expanded */}
          <div className="secondary-features grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* Tour Management */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(251, 146, 60, 0.1)' }}>
                <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h4 className="feature-title-small">Tour Management</h4>
              <p className="feature-desc-small">Book venues, manage shows, track revenue with AI route optimization</p>
            </div>

            {/* Gig Calendar */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                <svg className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Gig Calendar</h4>
              <p className="feature-desc-small">Visual calendar with conflict detection and revenue tracking</p>
            </div>

            {/* Smart Setlists */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h4 className="feature-title-small">Smart Setlists</h4>
              <p className="feature-desc-small">AI-curated setlists analyzing tempo flow, key transitions & energy</p>
            </div>

            {/* Screen Sharing */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Screen Sharing</h4>
              <p className="feature-desc-small">Share your DAW in real-time during video sessions</p>
            </div>

            {/* Studio Recording */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>
                <svg className="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Studio Recording</h4>
              <p className="feature-desc-small">Record sessions with automatic cloud backup and project integration</p>
            </div>

            {/* AI Assistant */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                <svg className="h-5 w-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="feature-title-small">AI Assistant</h4>
              <p className="feature-desc-small">Claude-powered help for lyrics, chords, and creative blocks</p>
            </div>

            {/* Copyright Assistant */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Copyright Registration</h4>
              <p className="feature-desc-small">Step-by-step guidance for protecting your work with copyright.gov links</p>
            </div>

            {/* Split Sheets */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Split Sheets</h4>
              <p className="feature-desc-small">Generate and share legal split agreements with email delivery</p>
            </div>

            {/* Multi-Cursor Editing */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h4 className="feature-title-small">Multi-Cursor Editing</h4>
              <p className="feature-desc-small">See collaborators' cursors and edits in real-time with Yjs CRDT</p>
            </div>

            {/* Project Management */}
            <Link href="/features/project-management" className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
                <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Project Management</h4>
              <p className="feature-desc-small">Organize songs, milestones, files with version control & permissions</p>
            </Link>

            {/* Community Features */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Community & Discovery</h4>
              <p className="feature-desc-small">Musician profiles, follow artists, discover talent, networking</p>
            </div>

            {/* Voice Memos */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Voice Memos</h4>
              <p className="feature-desc-small">Record ideas instantly, attach to songs, playback with controls</p>
            </div>

            {/* Media Library */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(217, 70, 239, 0.1)' }}>
                <svg className="h-5 w-5 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Media Library</h4>
              <p className="feature-desc-small">Cloud storage for all your music files with drag-drop upload</p>
            </div>

            {/* Venue Database */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="feature-title-small">Venue Database</h4>
              <p className="feature-desc-small">Track venue details, contacts, capacity, and booking history</p>
            </div>

            {/* Revenue Tracking */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="feature-title-small">Revenue Tracking</h4>
              <p className="feature-desc-small">Track royalties, ticket sales, merch—all in one dashboard</p>
            </div>

            {/* Notifications & Activity */}
            <div className="feature-card-small group">
              <div className="feature-icon-small" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                <svg className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h4 className="feature-title-small">Real-Time Notifications</h4>
              <p className="feature-desc-small">Activity feed with comments, mentions, invites & updates</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="#demo" className="button secondary">
              See All Features In Action →
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="page-section demo-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">See The Magic Happen</h2>
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
                <div className="demo-window-title">Rock N' Roll Basement - Songwriting Studio</div>
              </div>
              <div className="demo-window-content">
                <div className="demo-placeholder">
                  <div className="demo-placeholder-icon">
                    <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      <section id="who" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Built For Real Musicians</h2>
            <p className="section-subtitle">From bedroom producers to touring bands, we've got you covered</p>
          </div>
          <div className="persona-grid grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="persona-card">
              <div className="persona-icon" style={{ background: 'linear-gradient(135deg, rgba(255, 99, 71, 0.15), rgba(255, 99, 71, 0.05))' }}>
                <svg className="h-8 w-8" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3>Solo Artists</h3>
              <p>Write, record, and release—all on your own schedule with AI as your co-pilot</p>
            </div>
            <div className="persona-card">
              <div className="persona-icon" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))' }}>
                <svg className="h-8 w-8" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>Bands</h3>
              <p>Collaborate remotely, manage your catalog, and plan tours together</p>
            </div>
            <div className="persona-card">
              <div className="persona-icon" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))' }}>
                <svg className="h-8 w-8" style={{ color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3>Producers</h3>
              <p>Work with artists anywhere, share sessions, get instant feedback</p>
            </div>
            <div className="persona-card">
              <div className="persona-icon" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))' }}>
                <svg className="h-8 w-8" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3>Songwriters</h3>
              <p>Break through blocks with AI, protect your rights, find collaborators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Enhanced */}
      <section id="pricing" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple, Honest Pricing</h2>
            <p className="section-subtitle">Start free, upgrade when you're ready. No tricks.</p>
          </div>

          <div className="pricing-grid mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Free</h3>
                <p className="pricing-subtitle">Perfect for getting started</p>
                <div className="pricing-amount">
                  <span className="price">$0</span>
                  <span className="period">forever</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> 3 projects</li>
                <li><span className="check">✓</span> 1 collaborator per project</li>
                <li><span className="check">✓</span> 1 GB storage</li>
                <li><span className="check">✓</span> Real-time collaboration</li>
                <li><span className="check">✓</span> Basic songwriting tools</li>
                <li><span className="check">✓</span> Community support</li>
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">
                Get Started Free
              </Link>
            </div>

            {/* Creator Plan */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Creator</h3>
                <p className="pricing-subtitle">For serious musicians</p>
                <div className="pricing-amount">
                  <span className="price">$9.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> 10 projects</li>
                <li><span className="check">✓</span> 5 collaborators per project</li>
                <li><span className="check">✓</span> 10 GB storage</li>
                <li><span className="check">✓</span> AI-powered songwriting</li>
                <li><span className="check">✓</span> AI lyrics assistant</li>
                <li><span className="check">✓</span> AI tour routing</li>
                <li><span className="check">✓</span> Priority support</li>
              </ul>
              <Link href="/auth?signup=true&plan=creator" className="button secondary w-full">
                Start 7-Day Trial
              </Link>
            </div>

            {/* Studio Plan - Most Popular */}
            <div className="pricing-card pricing-card-featured">
              <div className="pricing-badge">MOST POPULAR</div>
              <div className="pricing-header">
                <h3>Studio</h3>
                <p className="pricing-subtitle">For professionals & teams</p>
                <div className="pricing-amount">
                  <span className="price">$29.99</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> Unlimited projects</li>
                <li><span className="check">✓</span> Unlimited collaborators</li>
                <li><span className="check">✓</span> 100 GB storage</li>
                <li><span className="check">✓</span> All AI features</li>
                <li><span className="check">✓</span> HD video calls (50 people)</li>
                <li><span className="check">✓</span> Screen sharing</li>
                <li><span className="check">✓</span> Advanced analytics</li>
                <li><span className="check">✓</span> Dedicated support</li>
              </ul>
              <Link href="/auth?signup=true&plan=studio" className="button w-full">
                Start 7-Day Trial
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center" style={{ color: 'var(--muted)' }}>
            All plans include a 7-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* FAQ - Condensed */}
      <section id="faq" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Questions? We've Got Answers.</h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="faq-item">
              <h3 className="faq-question">Who owns my music?</h3>
              <p className="faq-answer">You do. Always. We never claim any rights to your work. Your music is yours.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is my data secure?</h3>
              <p className="faq-answer">Yes. End-to-end encryption, GDPR compliant, and industry-standard security practices.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I export my work?</h3>
              <p className="faq-answer">Export anytime in standard formats—MIDI, PDF, WAV, MP3. No lock-in ever.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How does the AI work?</h3>
              <p className="faq-answer">Powered by Claude, our AI assists—never replaces—your creativity. You stay in control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="cta-content mx-auto max-w-3xl text-center">
            <h2 className="cta-title">Ready to Transform Your Music Career?</h2>
            <p className="cta-subtitle">
              Join thousands of musicians who've already simplified their creative workflow.
              No credit card required. Start making music today.
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
      <footer className="site-footer" style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6) 0' }}>
        <div className="container">
          <div className="footer-content flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="footer-brand flex items-center gap-3">
              <Image src="/logo-dark.png" alt="Rock N' Roll Basement" width={40} height={40} />
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                © 2024 Rock N' Roll Basement. All rights reserved.
              </span>
            </div>
            <div className="footer-links flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/features/songwriting" className="nav-link">Songwriting</Link>
              <Link href="/features/collaboration" className="nav-link">Collaboration</Link>
              <Link href="/why-rnrb" className="nav-link">Why RNRB</Link>
              <Link href="/pricing" className="nav-link">Pricing</Link>
              <Link href="/terms" className="nav-link">Terms</Link>
              <Link href="/privacy" className="nav-link">Privacy</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
