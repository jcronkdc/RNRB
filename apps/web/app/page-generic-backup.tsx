'use client';

import {
  Guitar,
  Piano,
  Drum,
  Headphones,
  Radio,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  AudioLines,
  Lock,
  Rocket,
  Cpu,
  CloudLightning,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="rnrb-venue min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="rnrb-stage-light absolute inset-0" />
        <div className="absolute -left-20 top-1/4 opacity-10">
          <div className="rnrb-vinyl" style={{ transform: 'scale(4) rotate(15deg)' }} />
        </div>
        <div className="absolute -right-20 top-3/4 opacity-10">
          <div className="rnrb-vinyl" style={{ transform: 'scale(5) rotate(-45deg)' }} />
        </div>
        <div className="from-rnrb-smoke-haze/20 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-32">
        <div className="text-center">
          {/* Icons */}
          <div className="mb-8 flex items-center justify-center gap-6">
            {[Piano, Guitar, Drum, Headphones, Radio].map((Icon, i) => (
              <div key={i} className="relative">
                <div>
                  <Icon className="text-muted-foreground h-8 w-8" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>

          <h1 className="mb-6 text-6xl font-bold md:text-8xl">
            <span className="from-brand-primary to-accent bg-gradient-to-br bg-clip-text text-transparent">
              Where Musicians
            </span>
            <br />
            <span className="text-foreground">Build Their Future</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-12 max-w-3xl text-xl leading-relaxed md:text-2xl">
            The creative sanctuary for artists who dare to dream. Build, collaborate, and share your
            sound with the world.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth" className="rnrb-btn rnrb-btn-primary px-8 py-4 text-lg">
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <a href="#features" className="rnrb-btn rnrb-btn-secondary px-8 py-4 text-lg">
              <span className="flex items-center gap-2">
                Explore Features
                <Sparkles className="h-5 w-5" />
              </span>
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <div className="border-brand-primary/20 bg-surface/80 flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur">
              <Lock className="text-brand-primary h-4 w-4" />
              <span className="text-muted-foreground">Secure platform</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-brand-primary font-medium">Free tier available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="border-border/50 bg-surface/50 grid grid-cols-2 gap-8 rounded-3xl border p-8 backdrop-blur md:grid-cols-4">
            {[
              { icon: Users, number: 'Join First', label: 'Artists Creating' },
              { icon: AudioLines, number: 'Be Pioneer', label: 'Songs Crafted' },
              { icon: Radio, number: '100+', label: 'Cities Ready' },
              { icon: Sparkles, number: '∞', label: 'Dreams Supported' },
            ].map((stat, i) => (
              <div key={i} className="group text-center">
                <div>
                  <stat.icon className="text-brand-primary group-hover:text-brand-secondary mx-auto mb-3 h-10 w-10 transition-colors" />
                </div>
                <div className="from-foreground to-muted-foreground bg-gradient-to-br bg-clip-text text-2xl font-bold text-transparent">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">Who It's For</h2>
          <p className="text-muted-foreground text-xl">Built for creators at every stage</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: 'Songwriters',
              items: ['Track versions and ideas', 'Collaborate in real-time', 'Protect your work'],
            },
            {
              title: 'Bands & Producers',
              items: ['Manage sessions remotely', 'Share stems and mixes', 'Coordinate schedules'],
            },
            {
              title: 'Emerging Artists',
              items: ['Find collaborators', 'Book and plan tours', 'Build your catalog'],
            },
          ].map((category, i) => (
            <div key={i} className="rnrb-card p-6">
              <h3 className="mb-4 text-xl font-bold">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item, j) => (
                  <li key={j} className="text-muted-foreground flex items-start gap-2 text-sm">
                    <Check className="text-brand-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>• {item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">How It Works</h2>
          <p className="text-muted-foreground text-xl">Three steps to better music creation</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Create',
              desc: 'Start projects, upload tracks, organize your work in one secure space.',
            },
            {
              step: '2',
              title: 'Collaborate',
              desc: 'Invite bandmates, work in real-time, share feedback instantly.',
            },
            {
              step: '3',
              title: 'Share',
              desc: 'Export finished tracks, manage rights, distribute your music.',
            },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="from-brand-primary to-brand-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white">
                {step.step}
              </div>
              <h3 className="mb-2 text-2xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">Feature Highlights</h2>
          <p className="text-muted-foreground text-xl">Tools built for real musicians</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'HD Video Calls',
              desc: 'Crystal-clear video sessions powered by Daily.co for remote collaboration.',
              badge: 'Up to 50 participants',
            },
            {
              title: 'Screen Sharing',
              desc: 'Share your DAW, lyrics, or any app in real-time during sessions.',
              badge: 'Low latency streaming',
            },
            {
              title: 'Instant Messaging',
              desc: 'Real-time chat powered by Ably with read receipts and typing indicators.',
              badge: 'End-to-end encrypted',
            },
            {
              title: 'AI Songwriting Studio',
              desc: 'AI-powered chord progressions, lyrics suggestions, and melody ideas.',
              badge: 'GPT-4 powered',
            },
            {
              title: 'Smart Project Organization',
              desc: 'Organize songs into albums, EPs, and manage versions effortlessly.',
              badge: 'Version control included',
            },
            {
              title: 'AI Music Generation BETA',
              desc: 'Create full tracks with AI, then replace stems with your recordings.',
              badge: 'Coming soon',
            },
          ].map((feature, i) => (
            <div key={i} className="rnrb-card p-6">
              <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{feature.desc}</p>
              <span className="bg-brand-primary/20 text-brand-primary rounded-full px-3 py-1 text-xs font-medium">
                {feature.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Powered by Innovation */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Powered by Innovation</h2>
            <p className="text-muted-foreground text-xl">
              Enterprise-grade technology meets artistic creativity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              {
                icon: CloudLightning,
                title: 'Lightning Fast',
                desc: 'Edge computing for instant response',
              },
              { icon: Lock, title: 'Fort Knox Security', desc: 'Your art, protected 24/7' },
              { icon: Rocket, title: 'Infinite Scale', desc: 'Grow without limits' },
              { icon: Cpu, title: 'AI-Powered', desc: 'Smart tools that understand you' },
            ].map((tech, i) => (
              <div key={i} className="group text-center">
                <div className="from-brand-primary/10 to-brand-secondary/10 group-hover:from-brand-primary/20 group-hover:to-brand-secondary/20 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br transition-all">
                  <tech.icon className="text-brand-primary h-10 w-10" />
                </div>
                <h3 className="mb-2 font-bold">{tech.title}</h3>
                <p className="text-muted-foreground text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="from-surface to-background relative z-10 bg-gradient-to-br px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="border-brand-primary/20 from-brand-primary/10 via-brand-secondary/10 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-purple-600/10 p-16">
            <div className="from-brand-primary/5 to-brand-secondary/5 absolute inset-0 bg-gradient-to-br" />
            <div className="relative z-10">
              <h2 className="text-foreground mb-6 text-5xl font-bold">
                Start Free, Grow at Your Pace
              </h2>
              <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
                Begin your journey with our Explorer tier. Upgrade when you're ready to unlock
                advanced features and AI credits.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/membership"
                  className="border-brand-primary text-brand-primary dark:bg-background rounded-2xl border-2 bg-white px-8 py-4 font-semibold transition-all hover:shadow-xl"
                >
                  View All Plans
                </Link>
                <Link
                  href="/auth"
                  className="from-brand-primary to-brand-secondary rounded-2xl bg-gradient-to-r px-8 py-4 font-semibold text-white transition-all hover:shadow-xl"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <div className="text-center">
          <h2 className="mb-6 text-5xl font-bold md:text-6xl">
            Your Music Deserves
            <br />
            <span className="from-brand-primary to-brand-secondary bg-gradient-to-r via-purple-500 bg-clip-text text-transparent">
              A Stage This Grand
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-xl">
            Join the revolution. Be part of something bigger than music.
          </p>
          <div>
            <Link
              href="/auth"
              className="from-brand-primary to-brand-secondary shadow-brand-primary/30 hover:shadow-brand-primary/50 inline-flex items-center gap-3 rounded-3xl bg-gradient-to-r px-10 py-5 text-xl font-bold text-white shadow-2xl transition-all"
            >
              <Sparkles className="h-6 w-6" />
              Begin Your Journey
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/50 relative z-10 border-t px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-center gap-3">
            <AudioLines className="text-brand-primary h-8 w-8" />
            <span className="from-brand-primary to-brand-secondary bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
              Rock N' Roll Basement
            </span>
          </div>
          <div className="text-muted-foreground text-center text-sm">
            <p className="mb-4">
              © 2024 Rock N' Roll Basement. Crafted with ❤️ for the creative souls.
            </p>
            <div className="flex items-center justify-center gap-6">
              <Link href="/privacy" className="hover:text-brand-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-brand-primary transition-colors">
                Terms
              </Link>
              <Link href="/why" className="hover:text-brand-primary transition-colors">
                Why
              </Link>
              <Link href="/vision" className="hover:text-brand-primary transition-colors">
                Our Vision
              </Link>
              <Link href="/community" className="hover:text-brand-primary transition-colors">
                Community
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
