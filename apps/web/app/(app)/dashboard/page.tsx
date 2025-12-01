'use client';

import { motion } from 'framer-motion';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Music4,
  Users,
  Target,
  Briefcase,
  Mic2,
  Guitar,
  Calendar,
  Radio,
  Globe,
  Wrench,
  Library,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import { ErrorBoundary } from '@/components/error-boundary';
import { useRequireAuth } from '@/hooks/use-require-auth';

// Workshop components - the soul of the experience
import {
  WorkshopWelcome,
  ContinueWhereYouLeftOff,
  YourJourney,
  DailySpark,
  CommunityPulse,
  EmptyState,
} from '@/components/workshop';

// ============================================
// YOUR WORKSHOP - The Heart of the Experience
// ============================================

// Quick action cards - organized by intent
const quickActions = [
  {
    id: 'write',
    label: 'Write',
    description: 'Start a new song',
    icon: Music4,
    href: '/songwriting',
    color: 'var(--accent)',
  },
  {
    id: 'practice',
    label: 'Practice',
    description: 'Track your growth',
    icon: Target,
    href: '/tools?tool=practice-logger',
    color: 'var(--sage)',
  },
  {
    id: 'connect',
    label: 'Connect',
    description: 'Find musicians',
    icon: Users,
    href: '/discover',
    color: 'var(--sky)',
  },
  {
    id: 'opportunities',
    label: 'Earn',
    description: 'Find gigs',
    icon: Briefcase,
    href: '/opportunities',
    color: 'var(--gold)',
  },
];

// The full toolbox - everything at their fingertips
const toolboxItems = [
  { icon: Music4, label: 'Songs', href: '/songs', color: 'var(--accent)' },
  { icon: Guitar, label: 'Toolbox', href: '/tools', color: 'var(--gold)' },
  { icon: Calendar, label: 'Shows', href: '/shows', color: 'var(--sky)' },
  { icon: Radio, label: 'Tours', href: '/tours', color: 'var(--clay)' },
  { icon: Mic2, label: 'Studio', href: '/studio', color: 'var(--sage)' },
  { icon: Globe, label: 'My Site', href: '/sites', color: 'var(--accent)' },
  { icon: Library, label: 'Library', href: '/library', color: 'var(--gold)' },
  { icon: Wrench, label: 'Settings', href: '/settings', color: 'var(--muted)' },
];

function DashboardContent() {
  const { status } = useSession();
  useRequireAuth();

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="absolute inset-0 animate-ping rounded-full opacity-20"
              style={{ background: 'var(--accent)' }}
            />
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
          <p style={{ color: 'var(--muted)' }}>Opening your workshop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Subtle ambient background - workshop feel */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full blur-[150px]"
          style={{ background: 'var(--accent-glow)', opacity: 0.3 }}
        />
        <div
          className="absolute -right-64 top-1/3 h-[400px] w-[400px] rounded-full blur-[150px]"
          style={{ background: 'var(--gold-dim)', opacity: 0.2 }}
        />
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-7xl px-4 py-6">
        {/* Welcome Header */}
        <WorkshopWelcome className="mb-8" />

        {/* Continue Where You Left Off - Top priority */}
        <ContinueWhereYouLeftOff className="mb-8" />

        {/* Quick Actions - What do you want to do? */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link href={action.href}>
                  <div
                    className="group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-lg"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--panel)',
                    }}
                  >
                    {/* Subtle glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at center, ${action.color}15, transparent 70%)`,
                      }}
                    />

                    <div className="relative">
                      {/* Icon */}
                      <div
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                        style={{
                          background: `${action.color}20`,
                          color: action.color,
                        }}
                      >
                        <action.icon className="h-5 w-5" />
                      </div>

                      {/* Label */}
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                        {action.label}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main Grid - Three columns on desktop */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Your Journey */}
          <div className="space-y-6 lg:col-span-4">
            <YourJourney />
            <DailySpark />
          </div>

          {/* Center Column - Community & Opportunities */}
          <div className="space-y-6 lg:col-span-4">
            <CommunityPulse />

            {/* Quick Opportunities Preview */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Briefcase className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                  Opportunities
                </h3>
                <Link
                  href="/opportunities"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Browse all →
                </Link>
              </div>

              {/* Empty state for now - will be populated with real data */}
              <EmptyState type="noOpportunities" size="sm" />
            </motion.section>
          </div>

          {/* Right Column - Toolbox */}
          <div className="space-y-6 lg:col-span-4">
            {/* Your Toolbox */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              <h3
                className="mb-4 flex items-center gap-2 font-semibold"
                style={{ color: 'var(--text)' }}
              >
                <Wrench className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                Your Toolbox
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {toolboxItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-[var(--panel-hover)]"
                    style={{ border: '1px solid var(--border-subtle)' }}
                  >
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Pro Tip */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border p-5"
              style={{
                borderColor: 'var(--accent)',
                borderStyle: 'dashed',
                background: 'var(--accent-glow)',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                    Workshop Tip
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Musicians who share their works-in-progress get 3x more collaborators. Don't
                    wait until it's perfect—show your process.
                  </p>
                  <Link
                    href="/feed"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    Share to the feed
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        {/* Footer encouragement */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 py-8 text-center"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            "The only way to do great work is to love what you do." — Keep creating. 🎸
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div
            className="flex min-h-screen items-center justify-center"
            style={{ background: 'var(--bg)' }}
          >
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
}
