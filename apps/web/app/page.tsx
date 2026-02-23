'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';

import { HeroLogo, FooterLogo } from './components/landing-logos';

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Section Component ───────────────────────────────────────────────────────

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
      className={`relative px-5 sm:px-8 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
}

// ─── Feature Card ────────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative rounded-xl border border-(--border) p-6 transition-all duration-300 hover:border-(--border-strong) hover:bg-(--surface)"
    >
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ background: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {description}
      </p>
    </motion.div>
  );
}

// ─── Step Card ───────────────────────────────────────────────────────────────

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={fadeUp} className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: 'var(--accent)' }}
        >
          {number}
        </div>
        <div className="mt-2 h-full w-px" style={{ background: 'var(--border)' }} />
      </div>
      <div className="pb-10">
        <h3 className="mb-1.5 text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Pricing Tier ────────────────────────────────────────────────────────────

function PricingTier({
  name,
  price,
  period,
  description,
  features,
  highlight,
  cta,
  href,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  href: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`relative flex flex-col rounded-xl border p-6 transition-all duration-300 ${
        highlight
          ? 'border-(--accent) bg-(--surface)'
          : 'border-(--border) hover:border-(--border-strong)'
      }`}
    >
      {highlight && (
        <span
          className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          Most popular
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          {name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{price}</span>
          {period && <span className="text-sm" style={{ color: 'var(--muted)' }}>/{period}</span>}
        </div>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{description}</p>
      </div>
      <ul className="mb-6 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: 'var(--sage)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
          highlight
            ? 'bg-(--accent) text-white hover:opacity-90'
            : 'border border-(--border) hover:border-(--border-strong) hover:bg-(--surface)'
        }`}
        style={!highlight ? { color: 'var(--text)' } : undefined}
      >
        {cta}
      </Link>
    </motion.div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const icons = {
  pen: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  sparkles: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  ),
  calendar: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  globe: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  shield: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -60]);

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        <HeroLogo />
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="hidden text-sm font-medium transition-colors hover:text-(--text) sm:block"
            style={{ color: 'var(--muted)' }}
          >
            Sign in
          </Link>
          <Link
            href="/auth?signup=true"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: '800px',
            height: '500px',
            background: 'radial-gradient(ellipse at center, var(--accent-muted) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative px-5 pb-20 pt-16 text-center sm:px-8 sm:pb-28 sm:pt-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--sage)' }} />
              Built by musicians, for musicians
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            className="mx-auto max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl"
            style={{ color: 'var(--text)' }}
          >
            Your creative home.{' '}
            <span style={{ color: 'var(--accent)' }}>Write, collaborate, perform.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--muted)' }}
          >
            The all-in-one workspace where songwriters and musicians create, organize,
            and build their careers — together or solo. No lock-in. Your music is always yours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              href="/auth?signup=true"
              className="w-full rounded-lg px-6 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 sm:w-auto"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
            >
              Start writing — it&apos;s free
            </Link>
            <Link
              href="/features"
              className="w-full rounded-lg border px-6 py-3 text-center text-sm font-medium transition-all duration-200 hover:border-(--border-strong) hover:bg-(--surface) sm:w-auto"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              See how it works
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs"
            style={{ color: 'var(--muted-soft)' }}
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              No rights grabs, ever
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export everything, anytime
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
              </svg>
              Free tier, forever
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Features ────────────────────────────────────────────────── */}
      <Section className="py-20 sm:py-28" id="features">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Built for the way musicians actually work. From first idea to final master.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={icons.pen}
            title="Songwriting Studio"
            description="Lyrics, chords, structure, and version history. Your ideas evolve — your tool should too. AI assists without replacing your voice."
            accent="var(--accent)"
          />
          <FeatureCard
            icon={icons.users}
            title="Real-Time Collaboration"
            description="Write together like you're in the same room. Live editing, video calls, screen sharing, and instant feedback. Distance disappears."
            accent="var(--gold)"
          />
          <FeatureCard
            icon={icons.sparkles}
            title="AI-Powered Tools"
            description="Rhyme suggestions, chord alternatives, arrangement ideas. AI that understands music and respects your creative direction."
            accent="var(--violet)"
          />
          <FeatureCard
            icon={icons.calendar}
            title="Shows & Touring"
            description="Manage gigs, build smart setlists, track venues, and plan tours. Your entire live career, organized in one place."
            accent="var(--sage)"
          />
          <FeatureCard
            icon={icons.globe}
            title="Your Website"
            description="Beautiful artist pages with your own domain. Music, merch, booking, EPK — all synced from your Basement account."
            accent="var(--sky)"
          />
          <FeatureCard
            icon={icons.shield}
            title="You Own Everything"
            description="Your music, your data, your way. No rights grabs. Export anytime. We're a tool, not a label. Your work belongs to you."
            accent="var(--accent)"
          />
        </div>
      </Section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <Section className="py-20 sm:py-28" id="how">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>
            Get started in minutes
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            No setup headaches. No learning curve. Just open it up and start making music.
          </p>
        </motion.div>

        <div className="mx-auto max-w-lg">
          <StepCard
            number="1"
            title="Create your space"
            description="Sign up free. Set up your profile, create your first project, and invite collaborators. Takes about 60 seconds."
          />
          <StepCard
            number="2"
            title="Start creating"
            description="Open the songwriting studio and pour out ideas. Lyrics, chords, structure — it's all there. Use AI tools when you want a nudge."
          />
          <StepCard
            number="3"
            title="Build from there"
            description="Organize shows, create setlists, launch your website, sell merch. Your entire music career, one home base."
          />
        </div>
      </Section>

      {/* ── Social Proof ────────────────────────────────────────────── */}
      <Section className="py-20 sm:py-28">
        <div
          className="rounded-xl border p-8 text-center sm:p-12"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <motion.div variants={fadeUp}>
            <p
              className="mx-auto max-w-2xl text-lg font-medium leading-relaxed sm:text-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              &ldquo;I&apos;ve tried every tool out there. This is the first one that actually feels like it was
              built by someone who writes songs. It stays out of your way and lets you create.&rdquo;
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                — A songwriter who gets it
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Pricing ─────────────────────────────────────────────────── */}
      <Section className="py-20 sm:py-28" id="pricing">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>
            Simple, honest pricing
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Start free, upgrade when you&apos;re ready. No surprises, no hidden fees.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          <PricingTier
            name="Explorer"
            price="$0"
            description="Perfect for getting started"
            features={[
              'Up to 3 projects',
              'Songwriting studio',
              'Basic collaboration',
              '1 GB storage',
              'Community access',
            ]}
            cta="Start free"
            href="/auth?signup=true"
          />
          <PricingTier
            name="Creator"
            price="$17.99"
            period="mo"
            description="For serious songwriters"
            features={[
              'Unlimited projects',
              'AI songwriting tools',
              'HD video sessions',
              'Tour management',
              'Copyright tools',
              '25 GB storage',
            ]}
            highlight
            cta="Start creating"
            href="/auth?signup=true&plan=creator"
          />
          <PricingTier
            name="Studio"
            price="$34.99"
            period="mo"
            description="For bands and studios"
            features={[
              'Everything in Creator',
              'Unlimited collaborators',
              'Custom artist website',
              'Merch store',
              'Priority support',
              '100 GB storage',
            ]}
            cta="Go Studio"
            href="/auth?signup=true&plan=studio"
          />
        </div>
      </Section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <Section className="py-20 sm:py-28">
        <motion.div variants={fadeUp} className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>
            Your music deserves a home
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Whether you&apos;re writing your first song or your thousandth, the Basement is here for you.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth?signup=true"
              className="w-full rounded-lg px-6 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 sm:w-auto"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
            >
              Start writing — it&apos;s free
            </Link>
          </div>
        </motion.div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t px-5 py-10 sm:px-8" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex items-center gap-6">
            <FooterLogo />
            <div className="flex gap-5 text-xs" style={{ color: 'var(--muted)' }}>
              <Link href="/terms" className="transition-colors hover:text-(--text)">Terms</Link>
              <Link href="/privacy" className="transition-colors hover:text-(--text)">Privacy</Link>
              <Link href="/contact" className="transition-colors hover:text-(--text)">Contact</Link>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-soft)' }}>
            &copy; {new Date().getFullYear()} Rock N&apos; Roll Basement. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
