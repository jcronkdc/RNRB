'use client';

import Link from 'next/link';
import { 
  Guitar, Piano, Drum, Headphones, Radio, Music,
  Check, ArrowRight, Sparkles, HeartHandshake, 
  Users, AudioLines, Lock, Rocket, Cpu, CloudLightning
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="rnrb-venue min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="rnrb-stage-light absolute inset-0" />
        <div className="absolute top-1/4 -left-20 opacity-10">
          <div className="rnrb-vinyl" style={{ transform: 'scale(4) rotate(15deg)' }} />
        </div>
        <div className="absolute top-3/4 -right-20 opacity-10">
          <div className="rnrb-vinyl" style={{ transform: 'scale(5) rotate(-45deg)' }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-rnrb-smoke-haze/20 via-transparent to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-32 pb-20 max-w-7xl mx-auto">
        <div className="text-center">
          {/* Icons */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {[Piano, Guitar, Drum, Headphones, Radio].map((Icon, i) => (
              <div key={i} className="relative">
                <div>
                  <Icon className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-br from-brand-primary to-accent bg-clip-text text-transparent">
              Where Musicians
            </span>
            <br />
            <span className="text-foreground">Build Their Future</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            The creative sanctuary for artists who dare to dream. Build, collaborate, and share your sound with the world.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth"
              className="rnrb-btn rnrb-btn-primary text-lg px-8 py-4"
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a
              href="#features"
              className="rnrb-btn rnrb-btn-secondary text-lg px-8 py-4"
            >
              <span className="flex items-center gap-2">
                Explore Features
                <Sparkles className="w-5 h-5" />
              </span>
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur border border-brand-primary/20 rounded-full">
              <Lock className="w-4 h-4 text-brand-primary" />
              <span className="text-muted-foreground">Secure platform</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-brand-primary font-medium">Free tier available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-surface/50 backdrop-blur border border-border/50 rounded-3xl">
            {[
              { icon: Users, number: 'Join First', label: 'Artists Creating' },
              { icon: AudioLines, number: 'Be Pioneer', label: 'Songs Crafted' },
              { icon: Radio, number: '100+', label: 'Cities Ready' },
              { icon: Sparkles, number: '∞', label: 'Dreams Supported' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div>
                  <stat.icon className="w-10 h-10 mx-auto mb-3 text-brand-primary group-hover:text-brand-secondary transition-colors" />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Who It's For</h2>
          <p className="text-xl text-muted-foreground">Built for creators at every stage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Songwriters', items: ['Track versions and ideas', 'Collaborate in real-time', 'Protect your work'] },
            { title: 'Bands & Producers', items: ['Manage sessions remotely', 'Share stems and mixes', 'Coordinate schedules'] },
            { title: 'Emerging Artists', items: ['Find collaborators', 'Book and plan tours', 'Build your catalog'] }
          ].map((category, i) => (
            <div key={i} className="rnrb-card p-6">
              <h3 className="text-xl font-bold mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <span>• {item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">Three steps to better music creation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create', desc: 'Start projects, upload tracks, organize your work in one secure space.' },
            { step: '2', title: 'Collaborate', desc: 'Invite bandmates, work in real-time, share feedback instantly.' },
            { step: '3', title: 'Share', desc: 'Export finished tracks, manage rights, distribute your music.' }
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Feature Highlights</h2>
          <p className="text-xl text-muted-foreground">Tools built for real musicians</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'HD Video Calls', desc: 'Crystal-clear video sessions powered by Daily.co for remote collaboration.', badge: 'Up to 50 participants' },
            { title: 'Screen Sharing', desc: 'Share your DAW, lyrics, or any app in real-time during sessions.', badge: 'Low latency streaming' },
            { title: 'Instant Messaging', desc: 'Real-time chat powered by Ably with read receipts and typing indicators.', badge: 'End-to-end encrypted' },
            { title: 'AI Songwriting Studio', desc: 'AI-powered chord progressions, lyrics suggestions, and melody ideas.', badge: 'GPT-4 powered' },
            { title: 'Smart Project Organization', desc: 'Organize songs into albums, EPs, and manage versions effortlessly.', badge: 'Version control included' },
            { title: 'AI Music Generation BETA', desc: 'Create full tracks with AI, then replace stems with your recordings.', badge: 'Coming soon' }
          ].map((feature, i) => (
            <div key={i} className="rnrb-card p-6">
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{feature.desc}</p>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-brand-primary/20 text-brand-primary">
                {feature.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Powered by Innovation */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powered by Innovation</h2>
            <p className="text-xl text-muted-foreground">Enterprise-grade technology meets artistic creativity</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: CloudLightning, title: 'Lightning Fast', desc: 'Edge computing for instant response' },
              { icon: Lock, title: 'Fort Knox Security', desc: 'Your art, protected 24/7' },
              { icon: Rocket, title: 'Infinite Scale', desc: 'Grow without limits' },
              { icon: Cpu, title: 'AI-Powered', desc: 'Smart tools that understand you' }
            ].map((tech, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center group-hover:from-brand-primary/20 group-hover:to-brand-secondary/20 transition-all">
                  <tech.icon className="w-10 h-10 text-brand-primary" />
                </div>
                <h3 className="font-bold mb-2">{tech.title}</h3>
                <p className="text-sm text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-br from-surface to-background">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-purple-600/10 p-16 border border-brand-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5" />
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-foreground mb-6">Start Free, Grow at Your Pace</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Begin your journey with our Explorer tier. Upgrade when you're ready to unlock advanced features and AI credits.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/membership"
                  className="px-8 py-4 bg-white dark:bg-background text-brand-primary border-2 border-brand-primary rounded-2xl font-semibold hover:shadow-xl transition-all"
                >
                  View All Plans
                </Link>
                <Link
                  href="/auth"
                  className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-semibold hover:shadow-xl transition-all"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Your Music Deserves
            <br />
            <span className="bg-gradient-to-r from-brand-primary via-purple-500 to-brand-secondary bg-clip-text text-transparent">
              A Stage This Grand
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the revolution. Be part of something bigger than music.
          </p>
          <div>
            <Link
              href="/auth"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-3xl font-bold text-xl shadow-2xl shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all"
            >
              <Sparkles className="w-6 h-6" />
              Begin Your Journey
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <AudioLines className="w-8 h-8 text-brand-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Rock N' Roll Basement
            </span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-4">© 2024 Rock N' Roll Basement. Crafted with ❤️ for the creative souls.</p>
            <div className="flex items-center justify-center gap-6">
              <Link href="/privacy" className="hover:text-brand-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-brand-primary transition-colors">Terms</Link>
              <Link href="/why" className="hover:text-brand-primary transition-colors">Why</Link>
              <Link href="/vision" className="hover:text-brand-primary transition-colors">Our Vision</Link>
              <Link href="/community" className="hover:text-brand-primary transition-colors">Community</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
