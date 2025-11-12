import { Button } from '@cronkwater/ui';
import { ArrowRight, Music, Users, HeartHandshake, Sparkles, Mic, FileText, TrendingUp } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { AnimatedBackground } from '@/components/animations/AnimatedBackground';
import { WaveformAnimation } from '@/components/animations/WaveformAnimation';
import { MusicNotes } from '@/components/animations/MusicNotes';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Home',
  description: 'CronkWaters — craft, community, stewardship.'
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10">
          <AnimatedBackground variant="gradient" intensity="medium" />
          <div className="sf-bg-gradient" />
          <div className="sf-film-grain" />
        </div>
        <MusicNotes />
        
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-brand-primary backdrop-blur-sm">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>For Musicians, By Musicians</span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-brand-foreground sm:text-6xl lg:text-7xl">
            <span className="block">Where Songs</span>
            <span className="block bg-gradient-to-r from-brand-primary via-accent to-brand-primary bg-clip-text text-transparent">
              Come to Life
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            A beautiful ecosystem for collaborative songwriting, recording, and community. 
            Track splits, manage licenses, organize sessions—all in one place built for the way musicians actually work.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="group min-w-[12rem] text-base">
              <Link href="/signin">
                <span className="inline-flex items-center gap-2">
                  Start Creating
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[12rem] text-base">
              <Link href="#what-we-make">See How It Works</Link>
            </Button>
          </div>
          
          <div className="mt-16 flex justify-center">
            <WaveformAnimation 
              className="h-32 w-full max-w-2xl" 
              color="rgb(248 113 113 / 0.3)"
              bars={80}
            />
          </div>
        </div>
      </section>

      {/* What We Make */}
      <section id="what-we-make" className="relative border-t border-border/40 bg-surface/50 px-6 py-20 sm:px-10 sm:py-28" tabIndex={-1}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-brand-foreground sm:text-5xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Built from the ground up for musicians, producers, and collaborators who care about craft.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Music,
                title: 'Project Management',
                description: 'Organize songs, sessions, and releases. Track progress, manage collaborators, and keep everything in sync.',
                color: 'text-brand-primary'
              },
              {
                icon: FileText,
                title: 'Split Sheets',
                description: 'Track revenue splits with PRO/IPI integration. Finalize agreements and generate PDFs with confidence.',
                color: 'text-accent'
              },
              {
                icon: Mic,
                title: 'Asset Library',
                description: 'Upload audio files, lyrics, charts, and more. Everything organized, searchable, and ready when you need it.',
                color: 'text-brand-primary'
              },
              {
                icon: TrendingUp,
                title: 'Licensing',
                description: 'Manage collaboration agreements, NDAs, and licenses. Templates built for the music industry.',
                color: 'text-accent'
              },
              {
                icon: Users,
                title: 'Collaboration',
                description: 'Invite contributors, track changes, and keep everyone aligned. Built for remote and in-studio workflows.',
                color: 'text-brand-primary'
              },
              {
                icon: HeartHandshake,
                title: 'Community',
                description: 'Support the ecosystem. Donate to the foundation, join the community, and help build the future of music tools.',
                color: 'text-accent'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl border border-border/60 bg-surface/80 p-8 shadow-soft transition-all hover:border-brand-primary/40 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-2xl bg-brand-primary/10 p-3 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-brand-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="values" className="relative border-t border-border/40 bg-background px-6 py-20 sm:px-10 sm:py-28" tabIndex={-1}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-brand-foreground sm:text-5xl">
              Built on Values
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We believe music tools should serve artists, not the other way around.
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                title: 'Craft',
                description: 'Every feature is designed with intention. No bloat, no shortcuts—just tools that respect your process and elevate your work.'
              },
              {
                title: 'Community',
                description: 'Built for collaboration, designed for connection. Whether you\'re working solo or with a team, CronkWaters brings people together around the music.'
              },
              {
                title: 'Stewardship',
                description: 'We\'re here for the long haul. This isn\'t a startup chasing exits—it\'s a foundation committed to serving musicians for generations.'
              }
            ].map((value, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-4 top-0 h-full w-1 rounded-full bg-gradient-to-b from-brand-primary/60 to-transparent" />
                <h3 className="mb-3 text-2xl font-bold text-brand-foreground">{value.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border/40 bg-surface/50 px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-brand-foreground sm:text-5xl">
            Ready to Build Something Beautiful?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Join musicians who are already using CronkWaters to organize their work, collaborate better, and focus on what matters: the music.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="outline" size="lg" className="min-w-[12rem] text-base">
              <Link href="/discover">Discover Artists</Link>
            </Button>
            <Button asChild size="lg" className="group min-w-[12rem] text-base">
              <Link href="/signin">
                <span className="inline-flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[12rem] text-base">
              <Link href="/donate">Support the Foundation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
