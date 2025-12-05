'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Custom icons
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

const TicketIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
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

const BookIcon = ({ className }: { className?: string }) => (
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
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
    />
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
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
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
    />
  </svg>
);

const KeyboardIcon = ({ className }: { className?: string }) => (
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
      d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const QuestionIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    className={className}
    style={style}
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

const ExternalLinkIcon = ({ className }: { className?: string }) => (
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
      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
    />
  </svg>
);

const QUICK_LINKS = [
  {
    title: 'Getting Started',
    description: 'New to RNRB? Start here',
    icon: BookIcon,
    href: '/dashboard',
    color: '#10b981',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Work faster with hotkeys',
    icon: KeyboardIcon,
    href: '/tools',
    color: '#f59e0b',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch how-to guides',
    icon: VideoIcon,
    href: '/masterclasses',
    color: '#ec4899',
  },
  {
    title: 'Feature Requests',
    description: 'Suggest new features',
    icon: QuestionIcon,
    href: 'mailto:info@rnrb.me?subject=Feature%20Request',
    color: '#8b5cf6',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How do I create a new project?',
    answer:
      'Click the "+" button in the sidebar or go to Projects → Create New. You can choose from song, album, or tour project templates.',
  },
  {
    question: 'How do I invite collaborators?',
    answer:
      "Open your project, go to Settings → Collaborators, and enter their email. They'll receive an invite to join your project.",
  },
  {
    question: 'What are stem credits?',
    answer:
      'Stem credits let you separate audio into vocals, drums, bass, and instruments. 2 credits for karaoke (2-stem), 5 for full band (4-stem), 8 for pro (6-stem). Buy packs in Settings → Usage.',
  },
  {
    question: 'How do I upgrade my plan?',
    answer:
      'Go to Settings → Billing. You can upgrade to Creator ($17.99/mo) or Studio ($34.99/mo) at any time. Changes take effect immediately.',
  },
  {
    question: 'Can the AI assistant help with technical issues?',
    answer:
      'Yes! The GODLIKE AI assistant can troubleshoot issues, create support tickets, explain features, and guide you through any task. Available for paid members.',
  },
  {
    question: 'How do I get my @rnrb.me email address?',
    answer:
      'Go to Settings → Email to claim your custom @rnrb.me email address. Available for all paid members.',
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={47}
              className="mx-auto"
            />
          </Link>
          <h1 className="mb-2 text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Help & Support
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            Get help with Rock N' Roll Basement. We're here to help you make great music.
          </p>
        </div>

        {/* Primary Support Options */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* AI Assistant - Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/assistant"
              className="group flex h-full flex-col rounded-xl border-2 p-6 transition-all hover:shadow-lg"
              style={{
                borderColor: 'var(--accent)',
                background:
                  'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05))',
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                >
                  <AIIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                      GODLIKE AI Assistant
                    </h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                    >
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Instant help, 24/7
                  </p>
                </div>
              </div>
              <p className="mb-4 flex-1 text-sm" style={{ color: 'var(--muted)' }}>
                Ask anything! The AI can troubleshoot issues, create support tickets, explain
                features, guide you through tasks, and even help with songwriting.
              </p>
              <div
                className="flex items-center gap-2 text-sm font-medium transition-colors group-hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Open AI Assistant
                <ExternalLinkIcon className="h-4 w-4" />
              </div>
            </Link>
          </motion.div>

          {/* Email Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="flex h-full flex-col rounded-xl border p-6"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}
                >
                  <EmailIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                    Email Support
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Response within 24 hours
                  </p>
                </div>
              </div>
              <div className="mb-4 flex-1 space-y-2">
                <a
                  href="mailto:support@rnrb.me"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:border-purple-500/50"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                >
                  <TicketIcon className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    support@rnrb.me
                  </span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
                    Technical help
                  </span>
                </a>
                <a
                  href="mailto:info@rnrb.me"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:border-purple-500/50"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                >
                  <QuestionIcon className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    info@rnrb.me
                  </span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
                    General questions
                  </span>
                </a>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Emailing support@rnrb.me automatically creates a tracked ticket.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Quick Links
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 3) }}
              >
                <Link
                  href={link.href}
                  className="group flex items-center gap-3 rounded-lg border p-4 transition-all hover:border-white/30"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${link.color}20`, color: link.color }}
                  >
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="truncate font-medium group-hover:underline"
                      style={{ color: 'var(--text)' }}
                    >
                      {link.title}
                    </div>
                    <div className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                      {link.description}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full rounded-lg border p-4 text-left transition-all hover:border-white/30"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      {item.question}
                    </span>
                    <svg
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ color: 'var(--muted)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {openFaq === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      {item.answer}
                    </motion.p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Settings Links */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Account & Settings
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/settings/profile"
              className="rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors hover:border-white/30"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Edit Profile
            </Link>
            <Link
              href="/settings/billing"
              className="rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors hover:border-white/30"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Billing & Plans
            </Link>
            <Link
              href="/settings/usage"
              className="rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors hover:border-white/30"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Usage & Credits
            </Link>
            <Link
              href="/settings/email"
              className="rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors hover:border-white/30"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Email Settings
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
          <p>
            Can't find what you need?{' '}
            <a href="mailto:support@rnrb.me" className="underline hover:text-white">
              Contact us directly
            </a>{' '}
            or{' '}
            <Link href="/contact" className="underline hover:text-white">
              view all contact options
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
