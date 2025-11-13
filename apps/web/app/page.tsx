'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Music, 
  Users, 
  BarChart3, 
  FolderOpen, 
  Building2, 
  Heart,
  Mic2,
  FileText,
  Share2,
  Sparkles,
  PlayCircle,
  Upload,
  DollarSign,
  Shield,
  Globe,
  Zap,
  ChevronRight,
  ArrowRight,
  Crown,
  Check
} from 'lucide-react';

const features = [
  {
    title: 'Music Projects',
    description: 'Create, manage, and collaborate on music projects with your team in real-time.',
    icon: Music,
    href: '/projects',
    color: 'from-purple-500 to-pink-500',
    demo: true,
    highlights: ['Unlimited projects', 'Version control', 'Team collaboration', 'Public/private modes']
  },
  {
    title: 'Song Management',
    description: 'Upload, organize, and refine your tracks with AI-powered tools and metadata.',
    icon: Mic2,
    href: '/projects',
    color: 'from-blue-500 to-cyan-500',
    demo: true,
    highlights: ['Audio uploads', 'AI lyrics generation', 'Metadata tracking', 'Remix collaboration']
  },
  {
    title: 'Revenue Splits',
    description: 'Manage royalty splits transparently with automated percentage tracking.',
    icon: Share2,
    href: '/splits',
    color: 'from-green-500 to-emerald-500',
    demo: true,
    highlights: ['Percentage tracking', 'PRO export', 'CSV/PDF reports', 'Automated confirmations']
  },
  {
    title: 'Analytics Dashboard',
    description: 'Real-time insights into your music performance, revenue, and engagement.',
    icon: BarChart3,
    href: '/analytics',
    color: 'from-orange-500 to-red-500',
    demo: true,
    highlights: ['Real-time data', 'Revenue tracking', 'Genre analytics', 'Engagement metrics']
  },
  {
    title: 'Asset Library',
    description: 'Centralized storage for all your music assets, stems, and project files.',
    icon: FolderOpen,
    href: '/assets',
    color: 'from-indigo-500 to-purple-500',
    demo: true,
    highlights: ['Cloud storage', 'Version history', 'Quick preview', 'Shareable links']
  },
  {
    title: 'Organizations',
    description: 'Create teams, manage permissions, and collaborate across labels and collectives.',
    icon: Building2,
    href: '/onboarding/organization',
    color: 'from-pink-500 to-rose-500',
    demo: true,
    highlights: ['Team management', 'Role permissions', 'Invite system', 'Multi-org support']
  },
  {
    title: 'Live Sessions',
    description: 'Host interactive music sessions with real-time audience engagement.',
    icon: PlayCircle,
    href: '/sessions',
    color: 'from-teal-500 to-cyan-500',
    demo: true,
    highlights: ['Live streaming', 'Audience voting', 'Real-time chat', 'Session recording']
  },
  {
    title: 'Fan Donations',
    description: 'Accept support from fans with integrated donation and crowdfunding tools.',
    icon: Heart,
    href: '/donate',
    color: 'from-red-500 to-pink-500',
    demo: true,
    highlights: ['One-time/recurring', 'Goal tracking', 'Donor recognition', 'Tax receipts']
  }
];

const stats = [
  { label: 'Active Artists', value: '10K+', icon: Users },
  { label: 'Songs Created', value: '50K+', icon: Music },
  { label: 'Revenue Distributed', value: '$2M+', icon: DollarSign },
  { label: 'Organizations', value: '500+', icon: Building2 }
];

// eslint-disable-next-line import/no-default-export
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            CronkWaters
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/vision" className="text-muted-foreground hover:text-foreground transition-colors">
            Our Vision
          </Link>
          <Link href="/membership" className="text-muted-foreground hover:text-foreground transition-colors">
            Membership
          </Link>
          <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
            Community
          </Link>
          <Link 
            href="/auth" 
            className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Where Music Lives & Breathes
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            The complete ecosystem for modern music creation, collaboration, and distribution. 
            From first note to final master, we grow with your vision.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/auth"
              className="group px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all flex items-center gap-2"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/tours"
              className="px-8 py-4 border-2 border-border hover:border-brand-primary bg-surface/50 backdrop-blur rounded-2xl font-semibold text-lg transition-all"
            >
              Take a Tour
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Demo mode enabled • No credit card required</span>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16 border-y border-border/50 bg-surface/30 backdrop-blur">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-brand-primary" />
              <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-br from-surface/80 to-surface/60 backdrop-blur border border-border/50 p-12"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built by Musicians, <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">For Musicians</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                CronkWaters is the vision of Josh Waters and Justin Cronk — two friends with over 20 years 
                of friendship and a shared passion for democratizing music creation.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Music className="w-6 h-6 text-brand-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Josh Waters</h3>
                    <p className="text-sm text-muted-foreground">
                      Grand Ole Opry performer, touring musician with Chris Janson, and dedicated mentor
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-brand-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Justin Cronk</h3>
                    <p className="text-sm text-muted-foreground">
                      Lifelong songwriter and visionary for accessible music creation tools
                    </p>
                  </div>
                </div>
              </div>
              <Link 
                href="/vision"
                className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:gap-3 transition-all"
              >
                Read Our Full Story
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-8">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6">
                  We&apos;re pursuing 501(c) nonprofit status to formalize our commitment to:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm">Supporting independent musicians</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm">Providing free & low-cost creative tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm">Promoting arts education</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm">Offering grants for emerging artists</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-xl text-muted-foreground">
            A complete suite of tools designed for the modern music creator
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link 
                href={feature.href}
                className="group block h-full relative overflow-hidden rounded-3xl border border-border/50 bg-surface/50 backdrop-blur p-6 hover:border-brand-primary/50 transition-all hover:shadow-xl"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${feature.color}`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-1 mb-4">
                  {feature.highlights.map((highlight, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-brand-primary" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  {feature.demo && (
                    <span className="text-xs px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full">
                      Try Demo
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all ml-auto" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Integration Section */}
      <section className="relative z-10 px-6 py-24 bg-surface/30 backdrop-blur border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Built for the Future</h2>
            <p className="text-xl text-muted-foreground">
              Powered by cutting-edge technology for reliability and scale
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <h3 className="font-semibold mb-1">Edge Functions</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast global performance</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold mb-1">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground">Your data protected 24/7</p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold mb-1">Global CDN</h3>
              <p className="text-sm text-muted-foreground">Stream anywhere, anytime</p>
            </div>
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-purple-500" />
              <h3 className="font-semibold mb-1">Unlimited Storage</h3>
              <p className="text-sm text-muted-foreground">Scale without limits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-brand-secondary to-pink-600 p-16"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Transform Your Music?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are building the future of music together.
              Start your journey today with our free demo.
            </p>
            <Link 
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-primary rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all"
            >
              Start Free Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Membership Preview Section */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Flexible Membership Options</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, grow at your pace. Every plan supports our nonprofit mission.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-8 text-center"
          >
            <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Explorer</h3>
            <p className="text-3xl font-bold mb-2">Free</p>
            <p className="text-sm text-muted-foreground mb-4">Perfect for trying out CronkWaters</p>
            <ul className="text-sm space-y-2 text-left mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>1 Active Project</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Basic Features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>10 AI Credits/month</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border-2 border-brand-primary bg-surface/80 backdrop-blur p-8 text-center shadow-xl scale-105"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm rounded-full font-medium">
                Most Popular
              </span>
            </div>
            <Zap className="w-12 h-12 text-brand-primary mx-auto mb-4 mt-2" />
            <h3 className="text-xl font-bold mb-2">Creator</h3>
            <p className="text-3xl font-bold mb-2">$9.99<span className="text-base font-normal">/mo</span></p>
            <p className="text-sm text-muted-foreground mb-4">For serious musicians</p>
            <ul className="text-sm space-y-2 text-left mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Unlimited Projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Revenue Splits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>500 AI Credits/month</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur p-8 text-center"
          >
            <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Studio</h3>
            <p className="text-3xl font-bold mb-2">$29.99<span className="text-base font-normal">/mo</span></p>
            <p className="text-sm text-muted-foreground mb-4">For labels & power users</p>
            <ul className="text-sm space-y-2 text-left mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Everything in Creator</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>White-label Options</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Unlimited AI Credits</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="text-center">
          <Link 
            href="/membership"
            className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:gap-3 transition-all"
          >
            View All Membership Details
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 CronkWaters. Built with passion for music creators.</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/learn" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link href="/community" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = "force-static";