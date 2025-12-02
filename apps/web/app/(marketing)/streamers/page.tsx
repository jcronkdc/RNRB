'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  Zap,
  Crown,
  Video,
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  Mic,
  Star,
  ArrowRight,
  Play,
  Shield,
  Clock,
  Target,
} from 'lucide-react';

// Tier data
const tiers = [
  {
    name: 'Starter',
    commission: '10%',
    minReferrals: 0,
    icon: Star,
    color: 'var(--muted)',
    benefits: [
      '10% commission on all sales',
      'Basic promotional materials',
      'Affiliate dashboard access',
      'Unique referral code',
    ],
  },
  {
    name: 'Bronze',
    commission: '12%',
    minReferrals: 10,
    icon: Shield,
    color: '#CD7F32',
    benefits: [
      '12% commission on all sales',
      'Extended promotional materials',
      'Priority support',
      'Monthly performance reports',
    ],
  },
  {
    name: 'Silver',
    commission: '15%',
    minReferrals: 25,
    icon: Shield,
    color: '#C0C0C0',
    benefits: [
      '15% commission on all sales',
      'Custom branded overlays',
      'Early access to features',
      'Quarterly strategy calls',
    ],
  },
  {
    name: 'Gold',
    commission: '18%',
    minReferrals: 50,
    icon: Crown,
    color: 'var(--gold)',
    benefits: [
      '18% commission on all sales',
      'Custom landing page',
      'Co-marketing opportunities',
      'Dedicated account manager',
    ],
  },
  {
    name: 'Platinum',
    commission: '22%',
    minReferrals: 100,
    icon: Crown,
    color: '#E5E4E2',
    benefits: [
      '22% commission on all sales',
      'Revenue share on referred affiliates',
      'Speaking opportunities',
      'Product input sessions',
    ],
  },
  {
    name: 'Ambassador',
    commission: '25%',
    minReferrals: 250,
    icon: Zap,
    color: 'var(--accent)',
    benefits: [
      '25% commission on all sales',
      'Equity consideration',
      'Direct line to founders',
      'Exclusive events access',
    ],
  },
];

const features = [
  {
    icon: DollarSign,
    title: 'Earn Real Money',
    description:
      'Up to 25% commission on every subscription your audience signs up for. Monthly payouts via PayPal, Stripe, or bank transfer.',
  },
  {
    icon: Video,
    title: 'One-Click Stream Setup',
    description:
      'Get a unique room code, branded overlays, and everything you need to start streaming about RNRB in minutes.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description:
      "Track clicks, conversions, and earnings in your personal dashboard. Know exactly what's working.",
  },
  {
    icon: Gift,
    title: 'Exclusive Perks',
    description:
      'Free Studio subscription, early access to features, and exclusive swag for top performers.',
  },
  {
    icon: Users,
    title: 'Community Support',
    description:
      'Join our private Discord for affiliates. Share tips, get support, and connect with fellow creators.',
  },
  {
    icon: Target,
    title: 'Promotional Assets',
    description:
      'Banners, overlays, video clips, and social graphics ready to use. We make promotion easy.',
  },
];

export default function StreamersPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    streamPlatform: '',
    streamUrl: '',
    followers: '',
    why: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Animated background gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(212, 168, 75, 0.1) 0%, transparent 40%)',
          }}
        />

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              <Mic className="h-4 w-4" />
              Partner Program Now Open
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight lg:text-7xl">
              Stream Music. <span style={{ color: 'var(--accent)' }}>Earn Money.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl" style={{ color: 'var(--muted)' }}>
              Join the Rock N' Roll Basement affiliate program and earn up to{' '}
              <strong style={{ color: 'var(--gold)' }}>25% commission</strong> on every
              subscription. Get exclusive tools, overlays, and support to grow your stream.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#apply" className="button flex items-center gap-2 px-8 py-4 text-lg">
                Apply Now <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#how-it-works"
                className="button secondary flex items-center gap-2 px-8 py-4 text-lg"
              >
                <Play className="h-5 w-5" /> See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                  25%
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Max Commission
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>
                  $50
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Min Payout
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: 'var(--sage)' }}>
                  30 Days
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  Cookie Duration
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Everything You Need to Succeed</h2>
            <p className="mx-auto max-w-2xl" style={{ color: 'var(--muted)' }}>
              We provide all the tools, resources, and support to help you earn while doing what you
              love.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group transition-all duration-300 hover:scale-[1.02]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--panel)',
                }}
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'var(--accent-dim)' }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p style={{ color: 'var(--muted)' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
            <p className="mx-auto max-w-2xl" style={{ color: 'var(--muted)' }}>
              Getting started is easy. Here's how to begin earning.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  step: 1,
                  title: 'Apply',
                  desc: 'Fill out the application form below',
                  icon: '📝',
                },
                {
                  step: 2,
                  title: 'Get Approved',
                  desc: 'We review applications within 48 hours',
                  icon: '✅',
                },
                { step: 3, title: 'Share', desc: 'Use your unique code and materials', icon: '📢' },
                {
                  step: 4,
                  title: 'Earn',
                  desc: 'Get paid monthly for every conversion',
                  icon: '💰',
                },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  {index < 3 && (
                    <div
                      className="absolute left-1/2 top-8 hidden h-0.5 w-full md:block"
                      style={{ background: 'var(--border)' }}
                    />
                  )}
                  <div
                    className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                    style={{ background: 'var(--panel)', border: '2px solid var(--accent)' }}
                  >
                    {item.icon}
                  </div>
                  <div className="mb-2 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                    Step {item.step}
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-20" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Commission Tiers</h2>
            <p className="mx-auto max-w-2xl" style={{ color: 'var(--muted)' }}>
              The more you refer, the more you earn. Climb the tiers and unlock exclusive benefits.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="card relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  borderColor: tier.name === 'Gold' ? 'var(--gold)' : 'var(--border)',
                  borderWidth: tier.name === 'Gold' ? '2px' : '1px',
                }}
              >
                {tier.name === 'Gold' && (
                  <div
                    className="absolute -right-8 top-4 rotate-45 px-10 py-1 text-xs font-bold"
                    style={{ background: 'var(--gold)', color: '#000' }}
                  >
                    POPULAR
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${tier.color}20` }}
                  >
                    <tier.icon className="h-5 w-5" style={{ color: tier.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>
                      {tier.minReferrals}+ referrals
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold" style={{ color: tier.color }}>
                    {tier.commission}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>
                    {' '}
                    commission
                  </span>
                </div>

                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: tier.color }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Streamer Tools Preview */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-4 text-4xl font-bold">One-Click Stream Setup</h2>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                Get everything you need to start streaming about Rock N' Roll Basement instantly:
              </p>

              <ul className="space-y-4">
                {[
                  {
                    title: 'Unique Room Codes',
                    desc: 'Share your personal stream room with viewers',
                  },
                  {
                    title: 'Branded Overlays',
                    desc: 'Professional overlays that match your style',
                  },
                  { title: 'Promo Videos', desc: 'Ready-to-use clips showcasing RNRB features' },
                  { title: 'Social Graphics', desc: 'Eye-catching images for all platforms' },
                  { title: 'Talking Points', desc: 'Key features and benefits to highlight' },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div
                      className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--accent-dim)' }}
                    >
                      <Check className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock Dashboard Preview */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Your Affiliate Dashboard</h3>
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}
                >
                  Gold Partner
                </span>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                {[
                  { label: 'This Month', value: '$1,247.50', change: '+23%' },
                  { label: 'Conversions', value: '47', change: '+12%' },
                  { label: 'Clicks', value: '2,341', change: '+45%' },
                  { label: 'Conv. Rate', value: '2.01%', change: '+0.3%' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      {stat.label}
                    </div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs" style={{ color: 'var(--sage)' }}>
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)' }}>
                <div className="mb-2 text-sm font-medium">Your Referral Code</div>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 rounded px-3 py-2 font-mono text-lg"
                    style={{ background: 'var(--bg)', color: 'var(--accent)' }}
                  >
                    ROCK2024
                  </code>
                  <button
                    className="rounded-lg px-4 py-2 text-sm font-medium"
                    style={{ background: 'var(--accent)', color: '#000' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-4xl font-bold">Apply to Become a Partner</h2>
              <p style={{ color: 'var(--muted)' }}>
                Fill out the form below and we'll review your application within 48 hours.
              </p>
            </div>

            {submitted ? (
              <div
                className="card text-center"
                style={{ background: 'var(--sage-dim)', borderColor: 'var(--sage)' }}
              >
                <div className="mb-4 text-5xl">🎉</div>
                <h3 className="mb-2 text-2xl font-bold" style={{ color: 'var(--sage)' }}>
                  Application Submitted!
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Thanks for applying! We'll review your application and get back to you within 48
                  hours. Check your email for updates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card">
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Full Name <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input w-full"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Email <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input w-full"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Streaming Platform <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <select
                        required
                        value={formData.streamPlatform}
                        onChange={(e) =>
                          setFormData({ ...formData, streamPlatform: e.target.value })
                        }
                        className="input w-full"
                      >
                        <option value="">Select platform</option>
                        <option value="twitch">Twitch</option>
                        <option value="youtube">YouTube</option>
                        <option value="kick">Kick</option>
                        <option value="tiktok">TikTok Live</option>
                        <option value="instagram">Instagram Live</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Channel/Profile URL <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.streamUrl}
                        onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                        className="input w-full"
                        placeholder="https://twitch.tv/yourchannel"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Approximate Followers/Subscribers
                    </label>
                    <select
                      value={formData.followers}
                      onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Select range</option>
                      <option value="0-1000">0 - 1,000</option>
                      <option value="1000-5000">1,000 - 5,000</option>
                      <option value="5000-10000">5,000 - 10,000</option>
                      <option value="10000-50000">10,000 - 50,000</option>
                      <option value="50000-100000">50,000 - 100,000</option>
                      <option value="100000+">100,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Why do you want to partner with Rock N' Roll Basement?
                    </label>
                    <textarea
                      value={formData.why}
                      onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                      className="input min-h-[120px] w-full"
                      placeholder="Tell us about your content, audience, and why you're excited about RNRB..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input type="checkbox" required id="terms" className="mt-1 h-4 w-4 rounded" />
                    <label htmlFor="terms" className="text-sm" style={{ color: 'var(--muted)' }}>
                      I agree to the{' '}
                      <Link href="/terms" className="underline" style={{ color: 'var(--accent)' }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/streamers/terms"
                        className="underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        Affiliate Program Terms
                      </Link>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="button w-full py-4 text-lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                q: 'How do I get paid?',
                a: 'We pay out monthly via PayPal, Stripe, or direct bank transfer. Minimum payout is $50. You can track all your earnings in your affiliate dashboard.',
              },
              {
                q: 'How long do cookies last?',
                a: 'Our cookies last 30 days. If someone clicks your link and signs up within 30 days, you get credit for the referral.',
              },
              {
                q: 'What counts as a conversion?',
                a: "You earn commission when someone signs up for a paid plan (Creator or Studio) using your referral link or code. Free signups don't count, but if they upgrade later within the cookie window, you still get credit.",
              },
              {
                q: 'Can I promote on multiple platforms?',
                a: 'Absolutely! Use your unique code across Twitch, YouTube, TikTok, Instagram, Twitter, or anywhere else you have an audience.',
              },
              {
                q: 'Do I need to be a musician to join?',
                a: 'Not at all! We welcome content creators, music educators, tech reviewers, and anyone passionate about helping musicians succeed.',
              },
              {
                q: 'How do I climb the tiers?',
                a: 'Tiers are based on total active referrals. As you refer more paying users, you automatically unlock higher commission rates and better perks.',
              },
            ].map((faq, index) => (
              <div key={index} className="card" style={{ background: 'var(--panel)' }}>
                <h3 className="mb-2 font-semibold">{faq.q}</h3>
                <p style={{ color: 'var(--muted)' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20"
        style={{
          background: 'linear-gradient(to bottom, var(--accent-dim), var(--bg))',
        }}
      >
        <div className="container text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Start Earning?</h2>
          <p className="mx-auto mb-8 max-w-xl" style={{ color: 'var(--muted)' }}>
            Join hundreds of creators already earning with Rock N' Roll Basement.
          </p>
          <a href="#apply" className="button inline-flex items-center gap-2 px-8 py-4 text-lg">
            Apply Now <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6) 0' }}>
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              © 2024 Rock N' Roll Basement. All rights reserved.
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="nav-link">
                Home
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
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
