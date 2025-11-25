import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section className="page-section relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          {/* Floating music notes */}
          <div className="music-notes-container">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="music-note"
                style={{
                  left: `${15 + i * 15}%`,
                  animationDelay: `${i * 0.5}s`,
                  fontSize: `${24 + i * 4}px`,
                }}
              >
                ♪
              </div>
            ))}
          </div>

          {/* Animated gradient orbs */}
          <div className="absolute inset-0">
            <div className="gradient-orb gradient-orb-1"></div>
            <div className="gradient-orb gradient-orb-2"></div>
            <div className="gradient-orb gradient-orb-3"></div>
          </div>
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Prominent Logo */}
            <div className="logo-hero-wrapper mb-8">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                className="logo-hero mx-auto"
                width={240}
                height={100}
                priority
                quality={90}
              />
              <div className="logo-hero-glow"></div>
            </div>

            {/* Animated Title */}
            <h1 className="hero-title relative inline-block" data-immutable="true">
              <span className="hero-text-gradient">Rock N' Roll Basement</span>
              <div className="hero-underline"></div>

              {/* Glow effect */}
              <div className="hero-glow absolute inset-0"></div>
            </h1>

            {/* Animated Description */}
            <div className="hero-description-wrapper">
              <p className="hero-description mb-8 text-xl" data-immutable="true">
                Whether you're a songwriter needing better tools, new to the business and finding
                gigs, discovering your roots in gospel or Appalachian folk, inventing country metal,
                or following Dylan's path to say what you need to say. This is where your music
                finds its voice. Collaborate with artists worldwide in ways rarely seen before.
              </p>

              {/* Subtle highlight effect */}
              <div className="hero-highlight-words">
                <span className="highlight-word" style={{ animationDelay: '2s' }}>
                  songwriter
                </span>
                <span className="highlight-word" style={{ animationDelay: '2.5s' }}>
                  gospel
                </span>
                <span className="highlight-word" style={{ animationDelay: '3s' }}>
                  Dylan
                </span>
                <span className="highlight-word" style={{ animationDelay: '3.5s' }}>
                  voice
                </span>
                <span className="highlight-word" style={{ animationDelay: '4s' }}>
                  worldwide
                </span>
              </div>
            </div>

            {/* Animated Buttons */}
            <div className="hero-buttons flex items-center justify-center gap-4">
              <Link href="/auth?signup=true" className="button hero-button-primary">
                <span>Start Free</span>
                <div className="button-shine"></div>
              </Link>
              <Link href="#why" className="button secondary hero-button-secondary">
                <span>See Why</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section id="who" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Who It's For</h2>
            <p className="section-subtitle">Built for creators at every stage</p>
          </div>
          <div className="feature-grid">
            <div className="card">
              <h3>Songwriters</h3>
              <ul className="mt-4 space-y-2" style={{ color: 'var(--muted)' }}>
                <li>• Track versions and ideas</li>
                <li>• Collaborate in real-time</li>
                <li>• Protect your work</li>
              </ul>
            </div>
            <div className="card">
              <h3>Bands & Producers</h3>
              <ul className="mt-4 space-y-2" style={{ color: 'var(--muted)' }}>
                <li>• Manage sessions remotely</li>
                <li>• Share stems and mixes</li>
                <li>• Coordinate schedules</li>
              </ul>
            </div>
            <div className="card">
              <h3>Emerging Artists</h3>
              <ul className="mt-4 space-y-2" style={{ color: 'var(--muted)' }}>
                <li>• Find collaborators</li>
                <li>• Book and plan tours</li>
                <li>• Build your catalog</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="#how" className="button secondary">
              See How It Works →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three steps to better music creation</p>
          </div>
          <div className="feature-grid">
            <div className="text-center">
              <div className="mb-4 text-5xl" style={{ color: 'var(--accent)' }}>
                1
              </div>
              <h3>Create</h3>
              <p style={{ color: 'var(--muted)' }}>
                Start projects, upload tracks, organize your work in one secure space.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-5xl" style={{ color: 'var(--accent)' }}>
                2
              </div>
              <h3>Collaborate</h3>
              <p style={{ color: 'var(--muted)' }}>
                Invite bandmates, work in real-time, share feedback instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-5xl" style={{ color: 'var(--accent)' }}>
                3
              </div>
              <h3>Share</h3>
              <p style={{ color: 'var(--muted)' }}>
                Export finished tracks, manage rights, distribute your music.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="#features" className="button secondary">
              Explore Features →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section
        id="features"
        className="page-section"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Feature Highlights</h2>
            <p className="section-subtitle">Tools built for real musicians</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* HD Video Calls - Links to Collaboration */}
            <Link
              href="/features/collaboration"
              className="tile hover:border-accent/30 group cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(255, 99, 71, 0.1)' }}
                >
                  <svg
                    className="h-6 w-6 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    HD Video Calls{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--accent)' }}>
                      LIVE
                    </span>
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Crystal-clear video sessions powered by Daily.co with up to 50 participants.
                  </p>
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent)' }}>
                    Studio plan →
                  </p>
                </div>
              </div>
            </Link>

            {/* Screen Sharing - Links to Collaboration */}
            <Link
              href="/features/collaboration"
              className="tile hover:border-accent/30 group cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <svg
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    Screen Sharing{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--accent)' }}>
                      LIVE
                    </span>
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Share your DAW, lyrics, or any app in real-time during video sessions.
                  </p>
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent)' }}>
                    Studio plan →
                  </p>
                </div>
              </div>
            </Link>

            {/* Instant Messaging - Links to Collaboration */}
            <Link
              href="/features/collaboration"
              className="tile hover:border-accent/30 group cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(139, 92, 246, 0.1)' }}
                >
                  <svg
                    className="h-6 w-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    Real-Time Collaboration{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--accent)' }}>
                      LIVE
                    </span>
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Multi-cursor editing, instant chat, presence tracking powered by Ably.
                  </p>
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent)' }}>
                    See who's online →
                  </p>
                </div>
              </div>
            </Link>

            {/* AI Songwriting - Links to Songwriting */}
            <Link
              href="/features/songwriting"
              className="tile hover:border-accent/30 group cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(236, 72, 153, 0.1)' }}
                >
                  <svg
                    className="h-6 w-6 text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    AI Songwriting Studio{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--accent)' }}>
                      LIVE
                    </span>
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Real-time key detection, word-level chord placement, AI-powered lyrics and
                    progressions.
                  </p>
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent)' }}>
                    Creator plan →
                  </p>
                </div>
              </div>
            </Link>

            {/* Project Management - Links to Project Management */}
            <Link
              href="/features/project-management"
              className="tile hover:border-accent/30 group cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    Smart Project Organization{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--accent)' }}>
                      LIVE
                    </span>
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Projects, songs, sessions, setlists. Invite collaborators with role-based
                    permissions.
                  </p>
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent)' }}>
                    Full version control →
                  </p>
                </div>
              </div>
            </Link>

            {/* AI Music Generation - Links to AI Music */}
            <Link
              href="/features/ai-music"
              className="tile hover:border-accent/30 group cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(251, 146, 60, 0.1)' }}
                >
                  <svg
                    className="h-6 w-6 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    AI Tour Routing{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--accent)' }}>
                      LIVE
                    </span>
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    Optimize your tour schedule with AI using Tokyo subway model algorithms.
                  </p>
                  <p className="mt-2 text-xs" style={{ color: 'var(--accent)' }}>
                    Creator plan →
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Link href="#labs" className="button secondary">
              Discover RNR Labs →
            </Link>
          </div>
        </div>
      </section>

      {/* RNR Basement Labs */}
      <section id="labs" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">RNR Basement Labs</h2>
            <p className="section-subtitle">Shape the future of music tools</p>
          </div>
          <div className="card mx-auto max-w-2xl text-center">
            <p className="mb-6">
              Join early access to experimental features and help us build what musicians actually
              need.
            </p>
            <Link href="/labs" className="button">
              Join Labs
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Link href="#social" className="button secondary">
              See Who's Using It →
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section
        id="social"
        className="page-section"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trusted by Musicians</h2>
          </div>
          <div className="feature-grid">
            <div className="card text-center">
              <p style={{ color: 'var(--muted)' }}>[PLACEHOLDER – QUOTE]</p>
            </div>
            <div className="card text-center">
              <p style={{ color: 'var(--muted)' }}>[PLACEHOLDER – QUOTE]</p>
            </div>
            <div className="card text-center">
              <p style={{ color: 'var(--muted)' }}>[PLACEHOLDER – QUOTE]</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="#pricing" className="button secondary">
              View Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="page-section"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple Pricing</h2>
            <p className="section-subtitle">Start free, upgrade when you're ready</p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free Plan */}
            <div className="card text-center">
              <h3 className="mb-2 text-xl font-semibold">Free</h3>
              <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                Perfect for getting started
              </p>
              <div className="mb-1 text-4xl font-bold">$0</div>
              <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                forever
              </p>
              <ul
                className="mb-6 space-y-2 text-left text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>3 projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>1 collaborator per project</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>1 GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Basic songwriting tools</span>
                </li>
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">
                Get Started Free
              </Link>
            </div>

            {/* Creator Plan */}
            <div className="card text-center">
              <h3 className="mb-2 text-xl font-semibold">Creator</h3>
              <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                For serious musicians
              </p>
              <div className="mb-1 text-4xl font-bold">$9.99</div>
              <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                per month
              </p>
              <ul
                className="mb-6 space-y-2 text-left text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>10 projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>5 collaborators per project</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>10 GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>AI-powered songwriting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>AI lyrics assistant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>AI content generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>AI tour routing</span>
                </li>
              </ul>
              <Link href="/auth?signup=true&plan=creator" className="button secondary w-full">
                Start 7-Day Trial
              </Link>
            </div>

            {/* Studio Plan - Most Popular */}
            <div
              className="card relative border-2 text-center"
              style={{ borderColor: 'var(--accent)' }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                MOST POPULAR
              </div>
              <h3 className="mb-2 text-xl font-semibold">Studio</h3>
              <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                For professionals & teams
              </p>
              <div className="mb-1 text-4xl font-bold">$29.99</div>
              <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                per month
              </p>
              <ul
                className="mb-6 space-y-2 text-left text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Unlimited collaborators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>100 GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>All AI features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>HD video calls (up to 50)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Screen sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/auth?signup=true&plan=studio" className="button w-full">
                Start 7-Day Trial
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="#faq" className="button secondary">
              Common Questions →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="faq-item">
              <h3 className="faq-question">Who owns my music?</h3>
              <p className="faq-answer">You do. Always. We never claim any rights to your work.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is my data private?</h3>
              <p className="faq-answer">
                Yes. End-to-end encryption for all your projects and communications.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I export my work?</h3>
              <p className="faq-answer">
                Export anytime in standard formats. Your music, your choice.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How does collaboration work?</h3>
              <p className="faq-answer">
                Invite by email, set permissions, work together in real-time.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What about offline work?</h3>
              <p className="faq-answer">[PLACEHOLDER – CONTENT NEEDED]</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do you offer education discounts?</h3>
              <p className="faq-answer">[PLACEHOLDER – CONTENT NEEDED]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6) 0' }}>
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              © 2024 Rock N' Roll Basement. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="nav-link">
                About
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
