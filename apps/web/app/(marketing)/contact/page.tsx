import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact & Support - Rock N' Roll Basement",
  description:
    "Get help with Rock N' Roll Basement. Email support, AI assistant for paid members, and community resources. We're here to help musicians succeed.",
  keywords: [
    'rnrb support',
    'music platform help',
    'contact rock n roll basement',
    'music software support',
  ],
  canonical: 'https://cronkwaters.com/contact',
});

// Custom icons to avoid emojis
const EmailIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

const AIIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);

const TicketIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
    />
  </svg>
);

const NewsletterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
    />
  </svg>
);

const QuestionIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
    />
  </svg>
);

const BusinessIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero Section */}
      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <Link href="/" className="mb-8 inline-block transition-opacity hover:opacity-80">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={180}
                height={60}
                className="mx-auto"
              />
            </Link>
            <h1 className="mb-4 text-5xl font-bold">Contact & Support</h1>
            <p className="section-subtitle">
              We're here to help you make great music. Choose the best way to reach us.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="page-section pt-0">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {/* AI Assistant - Premium Feature */}
            <div
              className="card relative overflow-hidden border-2"
              style={{ borderColor: 'var(--accent)' }}
            >
              <div
                className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                Paid Members
              </div>
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                <AIIcon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">GODLIKE AI Assistant</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>
                Get instant help from our AI assistant. It can create support tickets, answer
                questions, troubleshoot issues, and guide you through any feature.
              </p>
              <ul className="mb-6 space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                <li className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Instant response, 24/7
                </li>
                <li className="flex items-center gap-2">
                  <TicketIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Can create tickets on your behalf
                </li>
                <li className="flex items-center gap-2">
                  <QuestionIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  IT troubleshooting & guidance
                </li>
              </ul>
              <Link
                href="/assistant"
                className="btn-primary inline-flex w-full items-center justify-center gap-2"
              >
                <AIIcon className="h-5 w-5" />
                Open AI Assistant
              </Link>
              <p className="mt-3 text-center text-xs" style={{ color: 'var(--muted)' }}>
                Available for Creator & Studio plan members
              </p>
            </div>

            {/* Email Support */}
            <div className="card">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}
              >
                <EmailIcon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Email Support</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>
                Send us an email and we'll get back to you as soon as possible. Support tickets are
                automatically created and tracked.
              </p>
              <div className="mb-6 space-y-3">
                <a
                  href="mailto:support@rnrb.me"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-purple-500/50"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <TicketIcon className="h-5 w-5 flex-shrink-0" style={{ color: '#8b5cf6' }} />
                  <div>
                    <div className="font-medium">support@rnrb.me</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      Technical issues, bugs, account help
                    </div>
                  </div>
                </a>
                <a
                  href="mailto:info@rnrb.me"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-purple-500/50"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <QuestionIcon className="h-5 w-5 flex-shrink-0" style={{ color: '#8b5cf6' }} />
                  <div>
                    <div className="font-medium">info@rnrb.me</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      General questions, features, feedback
                    </div>
                  </div>
                </a>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                <ClockIcon className="mr-1 inline-block h-4 w-4" />
                Response time: Usually within 24 hours
              </p>
            </div>

            {/* Business Inquiries */}
            <div className="card">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}
              >
                <BusinessIcon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Business & Partnerships</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>
                Interested in partnering with us? Studios, record labels, and music educators
                welcome.
              </p>
              <a
                href="mailto:business@rnrb.me"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-green-500/50"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <EmailIcon className="h-5 w-5 flex-shrink-0" style={{ color: '#22c55e' }} />
                <div>
                  <div className="font-medium">business@rnrb.me</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    Partnerships, enterprise, bulk licensing
                  </div>
                </div>
              </a>
            </div>

            {/* Newsletter */}
            <div className="card">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}
              >
                <NewsletterIcon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Newsletter</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>
                Stay updated with new features, tips for musicians, and exclusive content.
              </p>
              <a
                href="mailto:newsletter@rnrb.me"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-pink-500/50"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <NewsletterIcon className="h-5 w-5 flex-shrink-0" style={{ color: '#ec4899' }} />
                <div>
                  <div className="font-medium">newsletter@rnrb.me</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    Subscribe or manage preferences
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="page-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold">Common Questions</h2>
            <div className="space-y-4">
              <details
                className="group rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  How do I upgrade my subscription?
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3" style={{ color: 'var(--muted)' }}>
                  Go to Settings → Billing in your dashboard. You can upgrade, downgrade, or manage
                  your plan at any time. Changes take effect immediately.
                </p>
              </details>

              <details
                className="group rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  What's included in the free plan?
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3" style={{ color: 'var(--muted)' }}>
                  The Explorer (free) plan includes 3 projects, 1GB storage, basic songwriting
                  tools, and 10 AI assistant conversations per month. Perfect for getting started!
                </p>
              </details>

              <details
                className="group rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  How do I use the AI assistant for support?
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3" style={{ color: 'var(--muted)' }}>
                  Creator and Studio plan members can access the GODLIKE AI assistant from their
                  dashboard. Just tell it your issue and it can troubleshoot, create tickets, or
                  guide you through any feature. It's like having a tech support expert on call
                  24/7.
                </p>
              </details>

              <details
                className="group rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  Can I cancel my subscription anytime?
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3" style={{ color: 'var(--muted)' }}>
                  Yes! You can cancel anytime from Settings → Billing. Your access continues until
                  the end of your billing period. No questions asked.
                </p>
              </details>

              <details
                className="group rounded-lg border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  What are stem credits?
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3" style={{ color: 'var(--muted)' }}>
                  Stem credits are used for AI-powered audio separation. Separate vocals, drums,
                  bass, and more from any song. Creator plan includes 5/month, Studio includes
                  50/month. You can also buy credit packs anytime.
                </p>
              </details>
            </div>

            <div className="mt-8 text-center">
              <Link href="/pricing" className="btn-secondary">
                View All Plans & Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="page-section">
        <div className="container">
          <div
            className="mx-auto max-w-2xl rounded-2xl p-8 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="mb-4 text-2xl font-bold">Ready to Make Music?</h2>
            <p className="mb-6" style={{ color: 'var(--muted)' }}>
              Join thousands of musicians using Rock N' Roll Basement to create, collaborate, and
              manage their music careers.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signin" className="btn-primary">
                Get Started Free
              </Link>
              <Link href="/pricing" className="btn-secondary">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="container">
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/features" className="hover:text-white">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>
          <p className="mt-4 text-center text-xs" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} Rock N' Roll Basement. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
