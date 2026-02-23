'use client';

import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Building,
  ArrowRight,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useState } from 'react';

interface PricingTier {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: { name: string; included: boolean; highlight?: boolean }[];
  cta: string;
  popular?: boolean;
  gradient?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter',
    icon: Sparkles,
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: 'CronkWaters subdomain', included: true },
      { name: 'Up to 3 sections', included: true },
      { name: 'Basic themes (3)', included: true },
      { name: 'Music embeds', included: true },
      { name: 'Mobile responsive', included: true },
      { name: 'Basic SEO', included: true },
      { name: 'Community support', included: true },
      { name: 'Custom domain', included: false },
      { name: 'AI Assistant', included: false },
      { name: 'AI Content Generator', included: false },
      { name: 'Mailing list', included: false },
      { name: 'Analytics', included: false },
      { name: 'Merch store', included: false },
    ],
    cta: 'Start Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    description: 'Everything you need to grow',
    monthlyPrice: 15,
    yearlyPrice: 12,
    features: [
      { name: 'Custom domain', included: true, highlight: true },
      { name: 'Unlimited sections', included: true, highlight: true },
      { name: 'All 8 premium themes', included: true },
      { name: 'AI Website Assistant', included: true, highlight: true },
      { name: 'AI Content Generator', included: true, highlight: true },
      { name: 'Mailing list (1,000 subs)', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Remove CronkWaters branding', included: true },
      { name: 'SSL certificate', included: true },
      { name: 'Merch store', included: false },
      { name: 'Multiple websites', included: false },
      { name: 'Advanced AI features', included: false },
    ],
    cta: 'Start Pro Trial',
    popular: true,
    gradient: 'from-orange-500 to-pink-500',
  },
  {
    id: 'studio',
    name: 'Studio',
    icon: Crown,
    description: 'For serious artists & labels',
    monthlyPrice: 35,
    yearlyPrice: 29,
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Multiple websites (up to 5)', included: true, highlight: true },
      { name: 'Advanced AI features', included: true, highlight: true },
      { name: 'AI Website Wizard', included: true, highlight: true },
      { name: 'Merch store (0% fees)', included: true, highlight: true },
      { name: 'Unlimited mailing list', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom CSS/code', included: true },
      { name: 'White-label option', included: true },
      { name: 'API access', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Early access to features', included: true },
      { name: 'Custom integrations', included: true },
    ],
    cta: 'Start Studio Trial',
    gradient: 'from-purple-500 to-blue-500',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    description: 'For labels & management',
    monthlyPrice: -1, // Custom pricing
    yearlyPrice: -1,
    features: [
      { name: 'Everything in Studio', included: true },
      { name: 'Unlimited websites', included: true, highlight: true },
      { name: 'Dedicated account manager', included: true, highlight: true },
      { name: 'Custom AI training', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'Priority feature requests', included: true },
      { name: 'Custom contracts', included: true },
      { name: 'On-boarding assistance', included: true },
      { name: 'Bulk management tools', included: true },
      { name: 'Advanced security', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated infrastructure', included: true },
      { name: 'Volume discounts', included: true },
    ],
    cta: 'Contact Sales',
  },
];

const FAQS = [
  {
    question: 'Can I try before I buy?',
    answer:
      'Absolutely! Start with our free plan to explore the basics. When you upgrade to Pro or Studio, you get a 14-day free trial with full access to all features. No credit card required to start.',
  },
  {
    question: 'What happens to my website if I cancel?',
    answer:
      "Your website stays live on our subdomain (yourname.cronkwaters.com) even if you cancel. You'll lose access to premium features like custom domains and advanced AI, but your content is always yours.",
  },
  {
    question: 'Can I change plans later?',
    answer:
      "Yes! You can upgrade or downgrade at any time. When upgrading, you'll get immediate access to new features. When downgrading, you'll keep your current features until the end of your billing period.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied for any reason, contact us within 30 days for a full refund.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual Enterprise plans.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer:
      'No long-term contracts! Monthly plans are billed monthly and can be cancelled anytime. Annual plans are billed yearly and offer significant savings.',
  },
  {
    question: 'What makes the AI features special?',
    answer:
      'Our AI is specifically trained for the music industry. It understands genre-specific terminology, music marketing best practices, and what makes artist websites successful. It can write bios, suggest sections, optimize SEO, and even generate entire website structures.',
  },
  {
    question: 'Can I use my own domain?',
    answer:
      'Yes! Pro and Studio plans include custom domain support. You can connect any domain you own, and we provide free SSL certificates for security.',
  },
];

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-xl transition-colors"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <span className="font-semibold" style={{ color: 'var(--text)' }}>
          {question}
        </span>
        {isOpen ? (
          <ChevronUp size={20} style={{ color: 'var(--muted)' }} />
        ) : (
          <ChevronDown size={20} style={{ color: 'var(--muted)' }} />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p style={{ color: 'var(--muted)' }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-pink-500/10" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-orange-500/20 blur-[128px]" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-pink-500/20 blur-[128px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-6xl" style={{ color: 'var(--text)' }}>
            Simple,{' '}
            <span className="bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-xl" style={{ color: 'var(--muted)' }}>
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="mb-12 flex items-center justify-center gap-4">
            <span
              className={`text-sm font-medium ${billingPeriod === 'monthly' ? '' : 'opacity-50'}`}
              style={{ color: 'var(--text)' }}
            >
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative h-8 w-14 rounded-full transition-colors"
              style={{
                background:
                  billingPeriod === 'yearly'
                    ? 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)'
                    : 'var(--panel)',
              }}
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
                  billingPeriod === 'yearly' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${billingPeriod === 'yearly' ? '' : 'opacity-50'}`}
              style={{ color: 'var(--text)' }}
            >
              Yearly
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                Save 25%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative overflow-hidden rounded-2xl p-8 transition-all hover:scale-[1.02] ${
                  tier.popular ? 'ring-2 ring-orange-500' : ''
                }`}
                style={{
                  background: tier.popular
                    ? 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(236,72,153,0.1) 100%)'
                    : 'var(--panel)',
                  border: tier.popular ? 'none' : '1px solid var(--border)',
                }}
              >
                {tier.popular && (
                  <div className="absolute top-4 right-4 rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                      tier.gradient ? `bg-linear-to-br ${tier.gradient}` : ''
                    }`}
                    style={{
                      background: tier.gradient ? undefined : 'var(--bg)',
                    }}
                  >
                    <tier.icon
                      size={24}
                      style={{ color: tier.gradient ? '#fff' : 'var(--accent)' }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {tier.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {tier.monthlyPrice === -1 ? (
                    <div>
                      <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                        Custom
                      </span>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Contact us for pricing
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                        ${billingPeriod === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>/month</span>
                      {billingPeriod === 'yearly' && tier.monthlyPrice > 0 && (
                        <p className="text-sm text-green-400">
                          Billed ${tier.yearlyPrice * 12}/year
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check
                          size={18}
                          className={`mt-0.5 shrink-0 ${
                            feature.highlight ? 'text-orange-500' : 'text-green-500'
                          }`}
                        />
                      ) : (
                        <X size={18} className="mt-0.5 shrink-0 text-gray-600" />
                      )}
                      <span
                        className={feature.included ? '' : 'opacity-50'}
                        style={{ color: 'var(--text)' }}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.id === 'enterprise' ? '/contact' : '/sites'}
                  className={`block w-full rounded-xl py-4 text-center font-semibold transition-all hover:scale-[1.02] ${
                    tier.popular ? 'bg-linear-to-r from-orange-500 to-pink-500 text-white' : ''
                  }`}
                  style={{
                    background: tier.popular ? undefined : 'var(--bg)',
                    color: tier.popular ? undefined : 'var(--text)',
                    border: tier.popular ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div
            className="flex flex-col items-center gap-6 rounded-2xl p-8 text-center md:flex-row md:text-left"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500/20">
              <Shield size={32} className="text-green-500" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
                30-Day Money-Back Guarantee
              </h3>
              <p style={{ color: 'var(--muted)' }}>
                Try any paid plan risk-free. If you&apos;re not completely satisfied within 30 days,
                we&apos;ll give you a full refund. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--muted)' }}>Got questions? We&apos;ve got answers.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FAQ key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          {/* More Questions */}
          <div className="mt-12 text-center">
            <p className="mb-4" style={{ color: 'var(--muted)' }}>
              Still have questions?
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
              style={{
                background: 'var(--panel)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              <HelpCircle size={18} />
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl" style={{ color: 'var(--text)' }}>
            Ready to Build Your Website?
          </h2>
          <p className="mb-8 text-xl" style={{ color: 'var(--muted)' }}>
            Join 10,000+ musicians who&apos;ve already made the switch.
          </p>
          <Link
            href="/sites"
            className="group inline-flex items-center gap-3 rounded-xl bg-linear-to-r from-orange-500 to-pink-500 px-10 py-5 text-xl font-semibold text-white transition-all hover:scale-105"
          >
            Start Building Free
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
