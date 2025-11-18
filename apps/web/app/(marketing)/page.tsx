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
                  fontSize: `${20 + Math.random() * 20}px`
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
          <div className="max-w-4xl mx-auto text-center">
            {/* Prominent Logo */}
            <div className="logo-hero-wrapper mb-8">
              <img 
                src="/logo-light.png" 
                alt="Rock N' Roll Basement" 
                className="logo-hero mx-auto"
              />
              <div className="logo-hero-glow"></div>
            </div>
            
            {/* Animated Title */}
            <h1 className="hero-title relative inline-block" data-immutable="true">
              <span className="hero-text-gradient">Rock N' Roll Basement</span>
              <div className="hero-underline"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 hero-glow"></div>
            </h1>
            
            {/* Animated Description */}
            <div className="hero-description-wrapper">
              <p className="hero-description text-xl mb-8" data-immutable="true">
                Whether you're a songwriter needing better tools, new to the business and finding gigs, discovering your roots in gospel or Appalachian folk, inventing country metal, or following Dylan's path to say what you need to say. This is where your music finds its voice. Collaborate with artists worldwide in ways rarely seen before.
              </p>
              
              {/* Subtle highlight effect */}
              <div className="hero-highlight-words">
                <span className="highlight-word" style={{ animationDelay: '2s' }}>songwriter</span>
                <span className="highlight-word" style={{ animationDelay: '2.5s' }}>gospel</span>
                <span className="highlight-word" style={{ animationDelay: '3s' }}>Dylan</span>
                <span className="highlight-word" style={{ animationDelay: '3.5s' }}>voice</span>
                <span className="highlight-word" style={{ animationDelay: '4s' }}>worldwide</span>
              </div>
            </div>
            
            {/* Animated Buttons */}
            <div className="flex items-center justify-center gap-4 hero-buttons">
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
          <div className="text-center mt-8">
            <Link href="#how" className="button secondary">See How It Works →</Link>
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
              <div className="text-5xl mb-4" style={{ color: 'var(--accent)' }}>1</div>
              <h3>Create</h3>
              <p style={{ color: 'var(--muted)' }}>Start projects, upload tracks, organize your work in one secure space.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4" style={{ color: 'var(--accent)' }}>2</div>
              <h3>Collaborate</h3>
              <p style={{ color: 'var(--muted)' }}>Invite bandmates, work in real-time, share feedback instantly.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4" style={{ color: 'var(--accent)' }}>3</div>
              <h3>Share</h3>
              <p style={{ color: 'var(--muted)' }}>Export finished tracks, manage rights, distribute your music.</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="#features" className="button secondary">Explore Features →</Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Feature Highlights</h2>
            <p className="section-subtitle">Tools built for real musicians</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="tile">
              <h3 className="mb-2">Real-Time Rooms</h3>
              <p style={{ color: 'var(--muted)' }}>Video sessions with screen sharing for remote collaboration.</p>
            </div>
            <div className="tile">
              <h3 className="mb-2">Messaging</h3>
              <p style={{ color: 'var(--muted)' }}>Built-in chat for quick feedback and updates.</p>
            </div>
            <div className="tile">
              <h3 className="mb-2">Session Transcription</h3>
              <p style={{ color: 'var(--muted)' }}>Automatic notes from your recording sessions.</p>
            </div>
            <div className="tile">
              <h3 className="mb-2">Tour Routing</h3>
              <p style={{ color: 'var(--muted)' }}>[PLACEHOLDER – VERIFY FEATURE]</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="#labs" className="button secondary">Discover RNR Labs →</Link>
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
          <div className="card max-w-2xl mx-auto text-center">
            <p className="mb-6">Join early access to experimental features and help us build what musicians actually need.</p>
            <Link href="/labs" className="button">Join Labs</Link>
          </div>
          <div className="text-center mt-8">
            <Link href="#social" className="button secondary">See Who's Using It →</Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="social" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
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
          <div className="text-center mt-8">
            <Link href="#pricing" className="button secondary">View Pricing →</Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple Pricing</h2>
            <p className="section-subtitle">Start free, upgrade when you're ready</p>
          </div>
          <div className="feature-grid">
            <div className="card text-center">
              <h3>Free</h3>
              <div className="text-3xl font-bold my-4">$0</div>
              <ul className="text-left space-y-2 mb-6" style={{ color: 'var(--muted)' }}>
                <li>• 3 active projects</li>
                <li>• Basic collaboration</li>
                <li>• 5GB storage</li>
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">Start Free</Link>
            </div>
            <div className="card text-center border-2" style={{ borderColor: 'var(--accent)' }}>
              <h3>Professional</h3>
              <div className="text-3xl font-bold my-4">$19<span className="text-base font-normal">/mo</span></div>
              <ul className="text-left space-y-2 mb-6" style={{ color: 'var(--muted)' }}>
                <li>• Unlimited projects</li>
                <li>• Advanced collaboration</li>
                <li>• 100GB storage</li>
                <li>• Priority support</li>
              </ul>
              <Link href="/auth?signup=true" className="button w-full">Start Free</Link>
            </div>
            <div className="card text-center">
              <h3>Studio Pro</h3>
              <div className="text-3xl font-bold my-4">$49<span className="text-base font-normal">/mo</span></div>
              <ul className="text-left space-y-2 mb-6" style={{ color: 'var(--muted)' }}>
                <li>• Everything in Pro</li>
                <li>• 500GB storage</li>
                <li>• Advanced analytics</li>
                <li>• White-glove support</li>
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">Contact Sales</Link>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="#faq" className="button secondary">Common Questions →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="page-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="faq-item">
              <h3 className="faq-question">Who owns my music?</h3>
              <p className="faq-answer">You do. Always. We never claim any rights to your work.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is my data private?</h3>
              <p className="faq-answer">Yes. End-to-end encryption for all your projects and communications.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I export my work?</h3>
              <p className="faq-answer">Export anytime in standard formats. Your music, your choice.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How does collaboration work?</h3>
              <p className="faq-answer">Invite by email, set permissions, work together in real-time.</p>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              © 2024 Rock N' Roll Basement. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="nav-link">About</Link>
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
