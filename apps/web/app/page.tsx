import { Button, Input } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Compass, Disc3, Mail, Sparkles, Users, Waves } from 'lucide-react';
import Link from 'next/link';

const heroStats = [
  { label: 'songs arranged using CronkWaters beta', value: '312', tone: 'text-brand-primary' },
  { label: 'artists in residence this season', value: '48', tone: 'text-brand-secondary' },
  { label: 'global showcases announced for 2025', value: '6', tone: 'text-accent' }
] as const;

const offerings = [
  {
    title: 'CronkWaterss',
    description:
      'A collaborative studio for chart-ready lyrics, stems, and split agreements—kept in sync across every org.',
    icon: Sparkles
  },
  {
    title: 'CronkWaterss Podcast',
    description:
      'Weekly tapes with producers, composers, and poets sharing the rituals, risks, and rights behind the mix.',
    icon: Disc3
  },
  {
    title: 'CronkWaterss Festival',
    description:
      'Three evenings of immersive listening rooms, community dinners, and multi-sensory performances at dusk.',
    icon: Waves
  }
] as const;

const values = [
  {
    title: 'Craft with warmth',
    description: 'Every screen, stage, and story should feel handwritten—never over-produced.',
    icon: Compass
  },
  {
    title: 'Share the stage',
    description: 'We design for clarity so writers, producers, and partners stay aligned and credited.',
    icon: Users
  },
  {
    title: 'Steward the work',
    description: 'We preserve drafts, stems, and context so the journey is as valued as the release.',
    icon: Sparkles
  }
] as const;

const sectionMotion = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
  viewport: { once: true, margin: '-100px' }
} as const;

function EmailCaptureForm() {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="group flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-border/60 bg-surface/80 p-5 shadow-soft backdrop-blur"
    >
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium text-brand-foreground">Be first to the beta</span>
        <Mail className="h-4 w-4 opacity-70" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          required
          placeholder="you@collective.fm"
          aria-label="Email address"
          className="h-12 flex-1 bg-surface-elevated placeholder:text-muted-foreground/80 focus-visible:ring-brand-primary"
        />
        <Button type="submit" className="h-12 rounded-lg px-6 font-semibold shadow-soft hover:shadow-elevated">
          Notify me
        </Button>
      </div>
      <span className="text-[11px] text-muted-foreground">No spam—just music and invitations.</span>
    </form>
  );
}

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <main className="relative flex flex-col gap-24 pb-24 pt-20 sm:gap-28">
      <motion.section
        className="px-6 sm:px-12"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground shadow-outline">
            CronkWaters Studios
          </span>
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-balance font-serif text-4xl font-semibold leading-tight text-brand-foreground sm:text-5xl lg:text-6xl">
              Minimal tools for expansive sound.
            </h1>
            <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              We craft software, broadcasts, and gatherings for musicians who prize intention over noise. Warm neutrals,
              tactile typography, and generous space keep focus on the art.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Enter the studio</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="https://github.com/jcronkdc/CronkWaters" target="_blank" rel="noreferrer">
                View the monorepo
              </Link>
            </Button>
          </div>
          <EmailCaptureForm />
          <div className="grid w-full gap-6 text-left text-sm text-muted-foreground/80 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/40 bg-surface/80 p-5 shadow-soft">
                <p className={`text-3xl font-semibold ${stat.tone}`}>{stat.value}</p>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="what-we-make" className="px-6 sm:px-12" {...sectionMotion}>
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex flex-col gap-3 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Offerings
            </span>
            <h2 className="text-3xl font-semibold text-brand-foreground sm:text-4xl">What we make</h2>
            <p className="max-w-3xl text-base text-muted-foreground">
              Software, podcasts, and festivals that keep collaborators aligned while preserving the warmth of analog ritual.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {offerings.map(({ title, description, icon: Icon }) => (
              <motion.article
                key={title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-surface p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-elevated"
                whileHover={{ y: -6 }}
              >
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-brand-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {title}
                </span>
                <p className="text-sm text-brand-foreground">{description}</p>
                <Button asChild variant="ghost" className="mt-auto self-start text-brand-primary">
                  <Link href="/dashboard/style-guide">Explore</Link>
                </Button>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="values" className="px-6 sm:px-12" {...sectionMotion}>
        <div className="mx-auto flex max-w-5xl flex-col gap-10 rounded-3xl border border-border/40 bg-surface-elevated/90 p-10 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Values</span>
            <h2 className="text-3xl font-semibold text-brand-foreground sm:text-4xl">
              Guided by resonance, grounded in craft.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Whether shipping a feature, cutting a live session, or curating a stage, these pillars set the tempo.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-surface p-5 shadow-outline"
              >
                <span className="flex items-center gap-2 text-brand-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{title}</span>
                </span>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="newsletter" className="px-6 sm:px-12" {...sectionMotion}>
        <div className="mx-auto flex max-w-5xl flex-col gap-6 overflow-hidden rounded-3xl border border-border/50 bg-surface-elevated p-10 shadow-elevated">
          <div className="relative flex flex-col gap-3 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Email capture</span>
            <h2 className="text-3xl font-semibold text-brand-foreground sm:text-4xl">
              Keep a pulse on CronkWaters releases, gatherings, and field notes.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Subscribe for monthly stories, early feature previews, and invitations to the next festival wave.
            </p>
          </div>
          <EmailCaptureForm />
        </div>
      </motion.section>
    </main>
  );
}

