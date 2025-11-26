import Link from 'next/link';
import { Check, X, Zap, Crown, Music } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="mb-4 text-5xl font-bold">Simple, Transparent Pricing</h1>
            <p className="section-subtitle">
              Everything you need to create, collaborate, and manage your music career
            </p>
          </div>

          <div className="feature-grid mx-auto max-w-5xl">
            {/* FREE TIER */}
            <div className="card text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Music className="h-6 w-6" style={{ color: 'var(--muted)' }} />
                <h3 className="text-2xl font-semibold">Explorer</h3>
              </div>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                Perfect for getting started
              </p>
              <div className="mb-2 text-4xl font-bold">$0</div>
              <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Free forever
              </p>
              <ul className="mb-8 space-y-3 text-left" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>3 active projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>1 GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>Basic songwriting tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>Community access (view only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>1 collaborator per project</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-500">No AI features</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-500">No video collaboration</span>
                </li>
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">
                Start Free
              </Link>
            </div>

            {/* CREATOR TIER - MOST POPULAR */}
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
              <div className="mb-4 flex items-center justify-center gap-2">
                <Zap className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                <h3 className="text-2xl font-semibold">Creator</h3>
              </div>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                For serious musicians & songwriters
              </p>
              <div className="mb-2 text-4xl font-bold">
                $9.99<span className="text-base font-normal" style={{ color: 'var(--muted)' }}>/month</span>
              </div>
              <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Less than 2 lattes ☕
              </p>
              <ul className="mb-8 space-y-3 text-left" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>10 active projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>10 GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span><strong>100 AI assists/month</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>Copyright split sheets (PDF)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>Tour & gig management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>5 collaborators per project</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>Community publishing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span>Version control for music</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-500">No video collaboration</span>
                </li>
              </ul>
              <Link href="/auth?signup=true" className="button w-full">
                Start Free Trial
              </Link>
            </div>

            {/* STUDIO TIER */}
            <div className="card text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Crown className="h-6 w-6 text-purple-500" />
                <h3 className="text-2xl font-semibold">Studio</h3>
              </div>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                For bands, studios & professionals
              </p>
              <div className="mb-2 text-4xl font-bold">
                $29.99<span className="text-base font-normal" style={{ color: 'var(--muted)' }}>/month</span>
              </div>
              <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Price of 1 pizza 🍕
              </p>
              <ul className="mb-8 space-y-3 text-left" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span><strong>Unlimited projects</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span><strong>100 GB storage</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span><strong>500 AI assists/month</strong> (5×)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span><strong>20+ hours HD video/month</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Unlimited collaborators</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>API access (coming soon)</span>
                </li>
              </ul>
              <Link href="/auth?signup=true" className="button w-full" style={{ background: 'linear-gradient(to right, #8b5cf6, #ec4899)' }}>
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="mt-20">
            <h2 className="mb-8 text-center text-3xl font-semibold">Feature Comparison</h2>
            <div className="mx-auto max-w-4xl overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="pb-4 pr-8 font-semibold">Feature</th>
                    <th className="pb-4 px-4 text-center font-semibold">Explorer</th>
                    <th className="pb-4 px-4 text-center font-semibold" style={{ color: 'var(--accent)' }}>Creator</th>
                    <th className="pb-4 pl-4 text-center font-semibold text-purple-500">Studio</th>
                  </tr>
                </thead>
                <tbody className="text-sm" style={{ color: 'var(--muted)' }}>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Projects</td>
                    <td className="py-3 px-4 text-center">3</td>
                    <td className="py-3 px-4 text-center">10</td>
                    <td className="py-3 pl-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Storage</td>
                    <td className="py-3 px-4 text-center">1 GB</td>
                    <td className="py-3 px-4 text-center">10 GB</td>
                    <td className="py-3 pl-4 text-center">100 GB</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">AI Assists</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 px-4 text-center">100/mo</td>
                    <td className="py-3 pl-4 text-center">500/mo</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Video Collaboration</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 pl-4 text-center">3,600 min†</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Collaborators</td>
                    <td className="py-3 px-4 text-center">1</td>
                    <td className="py-3 px-4 text-center">5</td>
                    <td className="py-3 pl-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Copyright Split Sheets</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 px-4 text-center"><Check className="mx-auto h-4 w-4" style={{ color: 'var(--accent)' }} /></td>
                    <td className="py-3 pl-4 text-center"><Check className="mx-auto h-4 w-4 text-purple-500" /></td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Tour Management</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 px-4 text-center"><Check className="mx-auto h-4 w-4" style={{ color: 'var(--accent)' }} /></td>
                    <td className="py-3 pl-4 text-center"><Check className="mx-auto h-4 w-4 text-purple-500" /></td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Real-time Collaboration</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 pl-4 text-center"><Check className="mx-auto h-4 w-4 text-purple-500" /></td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-8">Priority Support</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 px-4 text-center">—</td>
                    <td className="py-3 pl-4 text-center"><Check className="mx-auto h-4 w-4 text-purple-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* All Plans Include */}
          <div className="mt-16 text-center">
            <h2 className="mb-8 text-3xl font-semibold">All plans include</h2>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-2 text-xl font-semibold">🔒 Secure Storage</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Your music is encrypted and backed up automatically
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">📝 Full Ownership</h3>
                <p style={{ color: 'var(--muted)' }}>
                  You retain 100% rights to all your creative work
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">📤 Export Anytime</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Download your projects in industry-standard formats
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="mb-8 text-center text-3xl font-semibold">Frequently Asked Questions</h2>
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="card">
                <h3 className="mb-2 font-semibold">Can I switch plans anytime?</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Yes! Upgrade or downgrade at any time. When you upgrade, you'll get immediate access to new features. When you downgrade, you'll keep your current features until the end of your billing period.
                </p>
              </div>
              <div className="card">
                <h3 className="mb-2 font-semibold">What happens to my projects if I downgrade?</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Your projects are safe. If you exceed the new plan's limits, you'll need to archive some projects before creating new ones, but nothing is deleted.
                </p>
              </div>
              <div className="card">
                <h3 className="mb-2 font-semibold">Is there a free trial?</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Yes! All paid plans come with a 14-day free trial. No credit card required to start exploring.
                </p>
              </div>
              <div className="card">
                <h3 className="mb-2 font-semibold">What payment methods do you accept?</h3>
                <p style={{ color: 'var(--muted)' }}>
                  We accept all major credit cards through Stripe. Annual billing options coming soon with 2 months free!
                </p>
              </div>
              <div className="card">
                <h3 className="mb-2 font-semibold">† How does video time work?</h3>
                <p style={{ color: 'var(--muted)' }}>
                  Video time is measured in participant-minutes. A 60-minute call with 3 people uses 180 minutes. 
                  Studio tier includes 3,600 participant-minutes/month — enough for 20+ hours of band rehearsals 
                  or 60 hours of 1-on-1 sessions. Need more? Contact us for custom plans.
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
