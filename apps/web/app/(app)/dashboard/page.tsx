'use client';

import { motion } from 'framer-motion';
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
  Video,
  GraduationCap,
  MapPin,
  ShoppingBag,
  Download,
  Mail,
} from '@/components/ui/custom-icons';

import { InstallAppButton } from '@/components/install-app-button';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { WorkshopWelcome, DailySpark } from '@/components/workshop';

// Quick action cards - what musicians actually want to do
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
    id: 'meet',
    label: 'Meet',
    description: 'Video call your team',
    icon: Video,
    href: '/meet',
    color: 'var(--sky)',
  },
  {
    id: 'live',
    label: 'Go Live',
    description: 'Stream to fans',
    icon: Radio,
    href: '/live',
    color: '#ef4444',
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

// Tool access - all the tools available
const toolboxItems = [
  { icon: Music4, label: 'Songs', href: '/songs', color: 'var(--accent)' },
  { icon: Mail, label: 'Email', href: '/mail', color: '#38bdf8' },
  { icon: Video, label: 'Meet', href: '/meet', color: '#8b5cf6' },
  { icon: Radio, label: 'Go Live', href: '/live', color: '#ef4444' },
  { icon: GraduationCap, label: 'Classes', href: '/masterclasses', color: '#ec4899' },
  { icon: ShoppingBag, label: 'Gear Market', href: '/marketplace', color: '#f59e0b' },
  { icon: Mic2, label: 'Studio', href: '/studio', color: 'var(--sage)' },
  { icon: Calendar, label: 'Shows', href: '/shows', color: 'var(--sky)' },
  { icon: Globe, label: 'My Site', href: '/sites', color: 'var(--accent)' },
  { icon: Users, label: 'Connect', href: '/discover', color: 'var(--gold)' },
  { icon: Library, label: 'Library', href: '/library', color: 'var(--gold)' },
  { icon: Guitar, label: 'Toolbox', href: '/tools', color: 'var(--gold)' },
  { icon: MapPin, label: 'Tours', href: '/tours', color: 'var(--clay)' },
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

        {/* NEW: Merch Store Promotional Banner */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <Link href="/my-merch">
            <div
              className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
              style={{
                background:
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.2)',
              }}
            >
              {/* Decorative elements */}
              <div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                style={{ background: 'var(--gold)' }}
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <ShoppingBag className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                        Sell Your Own Merch
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ background: 'var(--gold)', color: '#000' }}
                      >
                        FREE
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Design custom T-shirts, hoodies, posters & more. Keep 85% of profits. Zero
                      upfront costs.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="whitespace-nowrap rounded-xl px-4 py-2 font-semibold transition-all group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#000',
                    }}
                  >
                    Start Selling →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

        {/* NEW: Professional Email Banner */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8"
        >
          <Link href="/settings/email">
            <div
              className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10"
              style={{
                background:
                  'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                borderColor: 'rgba(56, 189, 248, 0.2)',
              }}
            >
              {/* Decorative elements */}
              <div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                style={{ background: '#38bdf8' }}
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
                  >
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                        Get Your @rnrb.me Email
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ background: '#38bdf8', color: '#000' }}
                      >
                        INCLUDED
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Professional email for musicians. Works with any mail app. yourname@rnrb.me
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="whitespace-nowrap rounded-xl px-4 py-2 font-semibold transition-all group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                      color: '#000',
                    }}
                  >
                    Get Email →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

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
                    {/* Icon */}
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110"
                        style={{ background: 'var(--accent-glow)' }}
                      >
                        <action.icon
                          className="h-5 w-5 transition-colors"
                          style={{ color: action.color }}
                        />
                      </div>
                    </div>

                    {/* Label & Description */}
                    <h3
                      className="mb-1 font-semibold transition-colors group-hover:text-[var(--accent)]"
                      style={{ color: 'var(--text)' }}
                    >
                      {action.label}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {action.description}
                    </p>

                    {/* Hover arrow */}
                    <ChevronRight
                      className="absolute bottom-2 right-2 h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Daily Spark + Your Toolbox */}
          <div className="space-y-6">
            {/* Daily Spark */}
            <DailySpark />

            {/* Your Toolbox */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
              >
                <div
                  className="flex items-center gap-2 px-5 py-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <Guitar className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                  <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                    Your Toolbox
                  </h2>
                </div>

                <div className="grid grid-cols-4 gap-2 p-3 sm:grid-cols-6">
                  {toolboxItems.map((tool, index) => (
                    <motion.div
                      key={tool.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.03 }}
                    >
                      <Link href={tool.href}>
                        <div className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-[var(--panel-hover)]">
                          <div
                            className="rounded-lg p-2 transition-all group-hover:scale-110"
                            style={{ background: 'var(--surface)' }}
                          >
                            <tool.icon
                              className="h-4 w-4 transition-colors"
                              style={{ color: tool.color }}
                            />
                          </div>
                          <span
                            className="text-center text-xs font-medium"
                            style={{ color: 'var(--text)' }}
                          >
                            {tool.label}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right: Opportunities (Real call-to-action) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="h-fit"
          >
            <div
              className="overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                  <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                    Opportunities
                  </h2>
                </div>
                <Link
                  href="/opportunities"
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Browse all →
                </Link>
              </div>

              <div className="space-y-6 p-6 text-center">
                <div>
                  <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    Opportunities are everywhere
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                    Gigs, collaborations, sync placements—they're out there waiting.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                    Complete your profile to get matched.
                  </p>
                </div>

                <Link href="/settings/profile">
                  <button
                    className="w-full rounded-xl px-6 py-3 font-semibold transition-all hover:scale-[1.02]"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--text)',
                      boxShadow: '0 4px 20px var(--accent-glow)',
                    }}
                  >
                    Complete Your Profile
                  </button>
                </Link>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Install App Card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div
            className="overflow-hidden rounded-2xl border"
            style={{
              borderColor: 'rgba(34, 197, 94, 0.3)',
              background: 'linear-gradient(135deg, var(--panel) 0%, rgba(34, 197, 94, 0.05) 100%)',
            }}
          >
            <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                >
                  <Download className="h-6 w-6" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                    Install Rock N' Roll Basement
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Get the app on your device for quick access & offline use
                  </p>
                </div>
              </div>
              <InstallAppButton variant="prominent" />
            </div>
          </div>
        </motion.section>

        {/* Footer tip - honest, helpful */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm italic" style={{ color: 'var(--muted)' }}>
            "The only way to do great work is to love what you do." — Keep creating. 🎸
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
