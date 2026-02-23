import { Check, X } from '@/components/ui/custom-icons';
import type { Metadata } from 'next';
import Link from 'next/link';

import { generateMetadata as generateSEOMetadata, generateProductSchema, JsonLd } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: "Pricing - Rock N' Roll Basement Music Platform Plans",
  description:
    'Simple, affordable pricing for musicians. Free plan available. Creator plan $17.99/mo. Studio plan $34.99/mo with unlimited projects & HD video.',
  keywords: [
    'music software pricing',
    'band management software cost',
    'affordable music collaboration',
    'music platform subscription',
    'free music production tools',
  ],
  canonical: 'https://cronkwaters.com/pricing',
});

const pricingSchemas = [
  generateProductSchema({
    name: "Rock N' Roll Basement - Free Plan",
    description: 'Free music collaboration platform with 3 projects, 1GB storage, and basic songwriting tools.',
    price: '0',
  }),
  generateProductSchema({
    name: "Rock N' Roll Basement - Creator Plan",
    description: 'Music collaboration platform with AI assists, tour management, and copyright tools.',
    price: '17.99',
  }),
  generateProductSchema({
    name: "Rock N' Roll Basement - Studio Plan",
    description: 'Professional music platform with unlimited projects, HD video, and 100GB storage.',
    price: '34.99',
  }),
];

// ─── Feature Row ─────────────────────────────────────────────────────────────

function FeatureRow({
  feature,
  explorer,
  creator,
  studio,
}: {
  feature: string;
  explorer: React.ReactNode;
  creator: React.ReactNode;
  studio: React.ReactNode;
}) {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
      <td className="py-3 pr-6 text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</td>
      <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--muted)' }}>{explorer}</td>
      <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--muted)' }}>{creator}</td>
      <td className="py-3 pl-4 text-center text-sm" style={{ color: 'var(--muted)' }}>{studio}</td>
    </tr>
  );
}

function CheckIcon({ color = 'var(--sage)' }: { color?: string }) {
  return <Check className="mx-auto h-4 w-4" style={{ color }} aria-hidden="true" />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <>
      <JsonLd data={pricingSchemas} />
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <section className="px-5 pb-16 pt-28 text-center sm:px-8 sm:pb-20 sm:pt-32">
          <div className="mx-auto max-w-2xl">
            <h1
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: 'var(--text)' }}
            >
              Simple, honest pricing
            </h1>
            <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: 'var(--muted)' }}>
              Everything you need to create, collaborate, and manage your music career.
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
            {/* Explorer — Free */}
            <div
              className="flex flex-col rounded-xl border p-6"
              style={{ borderColor: 'var(--border)' }}
              itemScope
              itemType="https://schema.org/Offer"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }} itemProp="name">
                  Explorer
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }} itemProp="description">
                  Perfect for getting started
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text)' }} itemProp="price" content="0">$0</span>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>forever</span>
                </div>
                <meta itemProp="priceCurrency" content="USD" />
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {[
                  '3 active projects',
                  '1 GB storage',
                  'Basic songwriting tools',
                  'Community access',
                  '1 collaborator per project',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--sage)' }} />
                    {f}
                  </li>
                ))}
                {['No AI features', 'No video collaboration'].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--muted-soft)' }}>
                    <X className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--muted-soft)' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth?signup=true"
                className="rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition-colors hover:border-(--border-strong) hover:bg-(--surface)"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Get started free
              </Link>
            </div>

            {/* Creator — Popular */}
            <div
              className="relative flex flex-col rounded-xl border-2 p-6"
              style={{ borderColor: 'var(--accent)', background: 'var(--surface)' }}
              itemScope
              itemType="https://schema.org/Offer"
            >
              <span
                className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Most popular
              </span>

              <div className="mb-5">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }} itemProp="name">
                  Creator
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }} itemProp="description">
                  For serious musicians & songwriters
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text)' }} itemProp="price" content="17.99">$17.99</span>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>/month</span>
                </div>
                <meta itemProp="priceCurrency" content="USD" />
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {[
                  '10 active projects',
                  '10 GB storage',
                  { text: '100 AI assists/month', bold: true },
                  'Copyright split sheets',
                  'Tour & gig management',
                  '5 collaborators per project',
                  'Community publishing',
                  'Version control',
                ].map((f) => {
                  const text = typeof f === 'string' ? f : f.text;
                  const bold = typeof f === 'object' && f.bold;
                  return (
                    <li key={text} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--sage)' }} />
                      {bold ? <strong>{text}</strong> : text}
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/auth?signup=true"
                className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)' }}
              >
                Start free trial
              </Link>
            </div>

            {/* Studio */}
            <div
              className="flex flex-col rounded-xl border p-6"
              style={{ borderColor: 'var(--border)' }}
              itemScope
              itemType="https://schema.org/Offer"
            >
              <div className="mb-5">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }} itemProp="name">
                  Studio
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }} itemProp="description">
                  For bands, studios & professionals
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text)' }} itemProp="price" content="34.99">$34.99</span>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>/month</span>
                </div>
                <meta itemProp="priceCurrency" content="USD" />
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {[
                  { text: 'Unlimited projects', bold: true },
                  { text: '100 GB storage', bold: true },
                  { text: '500 AI assists/month', bold: true },
                  { text: '20+ hours HD video/month', bold: true },
                  'Real-time collaboration',
                  'Unlimited collaborators',
                  'Advanced analytics',
                  'Priority support',
                ].map((f) => {
                  const text = typeof f === 'string' ? f : f.text;
                  const bold = typeof f === 'object' && f.bold;
                  return (
                    <li key={text} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--violet)' }} />
                      {bold ? <strong>{text}</strong> : text}
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/auth?signup=true"
                className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--violet)' }}
              >
                Start free trial
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Feature comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="pb-3 pr-6 text-sm font-semibold" style={{ color: 'var(--text)' }}>Feature</th>
                    <th className="px-4 pb-3 text-center text-sm font-semibold" style={{ color: 'var(--muted)' }}>Explorer</th>
                    <th className="px-4 pb-3 text-center text-sm font-semibold" style={{ color: 'var(--accent)' }}>Creator</th>
                    <th className="pb-3 pl-4 text-center text-sm font-semibold" style={{ color: 'var(--violet)' }}>Studio</th>
                  </tr>
                </thead>
                <tbody>
                  <FeatureRow feature="Projects" explorer="3" creator="10" studio="Unlimited" />
                  <FeatureRow feature="Storage" explorer="1 GB" creator="10 GB" studio="100 GB" />
                  <FeatureRow feature="AI Assists" explorer="—" creator="100/mo" studio="500/mo" />
                  <FeatureRow feature="Video Collaboration" explorer="—" creator="—" studio="3,600 min" />
                  <FeatureRow feature="Collaborators" explorer="1" creator="5" studio="Unlimited" />
                  <FeatureRow feature="Copyright Sheets" explorer="—" creator={<CheckIcon />} studio={<CheckIcon color="var(--violet)" />} />
                  <FeatureRow feature="Tour Management" explorer="—" creator={<CheckIcon />} studio={<CheckIcon color="var(--violet)" />} />
                  <FeatureRow feature="Real-time Collab" explorer="—" creator="—" studio={<CheckIcon color="var(--violet)" />} />
                  <FeatureRow feature="Priority Support" explorer="—" creator="—" studio={<CheckIcon color="var(--violet)" />} />
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* All Plans Include */}
        <section className="border-t px-5 py-16 sm:px-8 sm:py-20" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Every plan includes
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: 'Secure storage',
                  desc: 'Your music is encrypted and backed up automatically.',
                },
                {
                  title: 'Full ownership',
                  desc: 'You retain 100% rights to all your creative work. Always.',
                },
                {
                  title: 'Export anytime',
                  desc: 'Download your projects in standard formats. No lock-in.',
                },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="border-t px-5 py-16 sm:px-8 sm:py-20"
          style={{ borderColor: 'var(--border)' }}
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Can I switch plans anytime?',
                  a: "Yes! Upgrade or downgrade at any time. When you upgrade, you get immediate access. When you downgrade, you keep features until the end of your billing period.",
                },
                {
                  q: 'What happens to my projects if I downgrade?',
                  a: "Your projects are safe. If you exceed the new plan's limits, you'll need to archive some projects before creating new ones, but nothing is ever deleted.",
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes! All paid plans come with a 14-day free trial. No credit card required.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards through Stripe. Annual billing coming soon with 2 months free.',
                },
                {
                  q: 'How does video time work?',
                  a: 'Video time is measured in participant-minutes. A 60-minute call with 3 people uses 180 minutes. Studio tier includes 3,600 participant-minutes/month — enough for 20+ hours of band rehearsals.',
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-lg border p-5"
                  style={{ borderColor: 'var(--border)' }}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }} itemProp="name">
                    {faq.q}
                  </h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }} itemProp="text">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t px-5 py-8 sm:px-8" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs" style={{ color: 'var(--muted-soft)' }}>
              &copy; {new Date().getFullYear()} Rock N&apos; Roll Basement. All rights reserved.
            </p>
            <nav className="flex flex-wrap gap-5 text-xs" style={{ color: 'var(--muted)' }}>
              {['About', 'Terms', 'Privacy', 'DMCA', 'Contact'].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase()}`}
                  className="transition-colors hover:text-(--text)"
                >
                  {link}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
