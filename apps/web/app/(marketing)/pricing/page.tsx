import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="mb-4 text-5xl font-bold">Simple Pricing</h1>
            <p className="section-subtitle">Start free, upgrade when you're ready</p>
          </div>

          <div className="feature-grid mx-auto max-w-5xl">
            <div className="card text-center">
              <h3 className="mb-2 text-2xl font-semibold">Free</h3>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                Perfect for getting started
              </p>
              <div className="mb-6 text-4xl font-bold">$0</div>
              <ul className="mb-8 space-y-3 text-left" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>3 active projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Basic collaboration tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>5GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Community support</span>
                </li>
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">
                Start Free
              </Link>
            </div>

            <div
              className="card relative text-center"
              style={{
                borderColor: 'var(--accent)',
                borderWidth: '2px',
              }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full px-4 py-1 text-sm font-semibold"
                style={{
                  background: 'var(--accent)',
                  color: '#0B0B0C',
                }}
              >
                MOST POPULAR
              </div>
              <h3 className="mb-2 text-2xl font-semibold">Professional</h3>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                For serious musicians
              </p>
              <div className="mb-6 text-4xl font-bold">
                $19<span className="text-base font-normal">/month</span>
              </div>
              <ul className="mb-8 space-y-3 text-left" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Advanced collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>100GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Real-time video sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/auth?signup=true" className="button w-full">
                Start Free Trial
              </Link>
            </div>

            <div className="card text-center">
              <h3 className="mb-2 text-2xl font-semibold">Studio Pro</h3>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                For studios & labels
              </p>
              <div className="mb-6 text-4xl font-bold">
                $49<span className="text-base font-normal">/month</span>
              </div>
              <ul className="mb-8 space-y-3 text-left" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>500GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>White-glove support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Team management</span>
                </li>
              </ul>
              <Link href="/contact" className="button secondary w-full">
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="mb-8 text-3xl font-semibold">All plans include</h2>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-2 text-xl font-semibold">Secure Storage</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Your music is encrypted and backed up automatically
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Full Ownership</h3>
                <p style={{ color: 'var(--muted)' }}>
                  You retain 100% rights to all your creative work
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Export Anytime</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Download your projects in industry-standard formats
                </p>
              </div>
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
