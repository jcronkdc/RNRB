import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import { generateMetadata as generateSEOMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: "Donate - Kids Instruments Charity | Rock N' Roll Basement",
  description:
    'Help put musical instruments in the hands of children in need. 100% of your donation goes directly to buying instruments for kids. Every child deserves the gift of music.',
  keywords: [
    'music charity',
    'donate instruments',
    'kids music program',
    'instrument donation',
    'music education charity',
  ],
  canonical: 'https://cronkwaters.com/donate',
});

const donationSchema = {
  '@context': 'https://schema.org',
  '@type': 'DonateAction',
  name: 'Kids Instruments Charity',
  description: 'Donate to help buy musical instruments for children in need',
  recipient: {
    '@type': 'Organization',
    name: "Rock N' Roll Basement Kids Instruments Fund",
  },
};

// Donation tiers with Stripe payment links
const donationTiers = [
  {
    amount: 25,
    label: 'Starter Kit',
    description: 'Provides picks, strings, and basic accessories',
    impact: 'Equips a young guitarist with essentials',
    paymentLink: 'https://buy.stripe.com/eVqfZa9KKfvx2Mz0V07AI00',
  },
  {
    amount: 50,
    label: 'First Steps',
    description: 'Covers a beginner recorder or harmonica set',
    impact: 'Gives a child their first instrument',
    paymentLink: 'https://buy.stripe.com/bJe7sE5uuertevhavA7AI01',
    popular: true,
  },
  {
    amount: 100,
    label: 'Melody Maker',
    description: 'Provides a quality ukulele or keyboard',
    impact: 'Unlocks a world of musical possibilities',
    paymentLink: 'https://buy.stripe.com/6oU9AM6yyfvx4UH5bg7AI02',
  },
  {
    amount: 250,
    label: 'Band Builder',
    description: 'Funds a full acoustic guitar or drum kit',
    impact: 'Creates the foundation for a future band',
    paymentLink: 'https://buy.stripe.com/cNi6oAg986Z172PgTY7AI03',
  },
  {
    amount: 500,
    label: 'Studio Sponsor',
    description: 'Equips multiple children with instruments',
    impact: 'Transforms an entire classroom',
    paymentLink: 'https://buy.stripe.com/28E4gs1eeabd9aXdHM7AI04',
  },
];

export default function DonatePage() {
  return (
    <>
      <JsonLd data={donationSchema} />
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-12 pt-20">
          {/* Background gradient */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            }}
          />

          <div className="container relative">
            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <Link href="/" className="group inline-block">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={160}
                  height={64}
                  priority
                  className="transition-opacity duration-200 group-hover:opacity-80"
                />
              </Link>
            </div>

            <div className="mx-auto max-w-3xl text-center">
              <div
                className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                Kids Instruments Fund
              </div>

              <h1
                className="mb-6 text-5xl font-bold leading-tight md:text-6xl"
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                Every Child Deserves
                <br />
                <span
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  The Gift of Music
                </span>
              </h1>

              <p
                className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                Music changes lives. But not every child has access to an instrument. Your donation
                puts guitars, keyboards, drums, and more into the hands of kids who dream of making
                music.{' '}
                <strong style={{ color: 'var(--text)' }}>
                  100% of every dollar goes directly to buying instruments.
                </strong>
              </p>
            </div>
          </div>
        </section>

        {/* Donation Tiers */}
        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <h2
                className="mb-8 text-center text-2xl font-semibold"
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                Choose Your Impact
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {donationTiers.map((tier) => (
                  <a
                    key={tier.amount}
                    href={tier.paymentLink}
                    className="group relative block rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: tier.popular
                        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                        : 'var(--surface)',
                      border: tier.popular
                        ? '2px solid rgba(168, 85, 247, 0.5)'
                        : '1px solid var(--border)',
                    }}
                  >
                    {tier.popular && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          background: 'linear-gradient(to right, #a855f7, #ec4899)',
                          color: 'white',
                        }}
                      >
                        MOST POPULAR
                      </div>
                    )}

                    <div className="mb-4 flex items-baseline justify-between">
                      <span
                        className="text-3xl font-bold"
                        style={{ fontFamily: 'Oswald, sans-serif' }}
                      >
                        ${tier.amount}
                      </span>
                      <span
                        className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: tier.popular ? '#a855f7' : 'var(--muted)' }}
                      >
                        {tier.label}
                      </span>
                    </div>

                    <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                      {tier.description}
                    </p>

                    <div
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: '#22c55e' }}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {tier.impact}
                    </div>

                    <div
                      className="mt-4 w-full rounded-lg py-2.5 text-center text-sm font-semibold uppercase tracking-wider transition-all duration-200 group-hover:opacity-90"
                      style={{
                        background: tier.popular
                          ? 'linear-gradient(to right, #a855f7, #ec4899)'
                          : 'var(--accent)',
                        color: tier.popular ? 'white' : '#0B0B0C',
                      }}
                    >
                      Donate ${tier.amount}
                    </div>
                  </a>
                ))}
              </div>

              {/* Custom Amount Note */}
              <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
                Want to donate a custom amount? Contact us at{' '}
                <a
                  href="mailto:donate@rnrb.app"
                  className="underline transition-colors hover:text-white"
                >
                  donate@rnrb.app
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div
                className="rounded-2xl p-8 md:p-12"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <h2
                  className="mb-8 text-center text-3xl font-bold"
                  style={{ fontFamily: 'Oswald, sans-serif' }}
                >
                  Why Music Matters
                </h2>

                <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                      style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                    >
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold">Better Academic Performance</h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Students in music programs score 22% higher on standardized tests
                    </p>
                  </div>

                  <div className="text-center">
                    <div
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                      style={{ background: 'rgba(168, 85, 247, 0.1)' }}
                    >
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#a855f7"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold">Emotional Development</h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Music provides a healthy outlet for expression and builds confidence
                    </p>
                  </div>

                  <div className="text-center">
                    <div
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                      style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                    >
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#22c55e"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold">Community Connection</h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Music brings kids together and builds lasting friendships
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Section */}
        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                100% Transparency Promise
              </h2>
              <p className="mb-8" style={{ color: 'var(--muted)' }}>
                Every dollar you donate goes directly to purchasing instruments. We cover all
                administrative costs ourselves. You'll receive updates on how your donation made a
                difference.
              </p>

              <div
                className="grid gap-6 rounded-xl p-6 md:grid-cols-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div>
                  <div className="mb-2 text-3xl font-bold" style={{ color: '#22c55e' }}>
                    100%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    Goes to instruments
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold" style={{ color: '#3b82f6' }}>
                    0%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    Administrative fees
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold" style={{ color: '#a855f7' }}>
                    Tax Deductible
                  </div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    Receipt provided
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6) 0' }}
          role="contentinfo"
        >
          <div className="container">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                © 2024 Rock N' Roll Basement. All rights reserved.
              </div>
              <nav className="flex gap-6 text-sm" aria-label="Footer navigation">
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
                <Link href="/dmca" className="nav-link">
                  DMCA
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
