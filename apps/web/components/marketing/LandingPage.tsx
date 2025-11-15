'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Shield, 
  Music, 
  Heart,
  Sparkles,
  Crown,
  Zap,
  FolderOpen,
  FileAudio,
  BarChart,
  PlayCircle,
  Building2,
  Users,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    title: 'Music Projects',
    description: 'Create, manage, and collaborate on music projects with your team in real-time.',
    href: '/projects',
    icon: FolderOpen,
    color: 'from-blue-500 to-indigo-500',
    membershipRequired: 'Free',
    highlights: ['Unlimited projects', 'Version control', 'Team collaboration', 'Public/private modes']
  },
  {
    title: 'Song Management',
    description: 'Upload, organize, and refine your tracks with AI-powered tools and metadata.',
    href: '/projects',
    icon: Music,
    color: 'from-purple-500 to-pink-500',
    membershipRequired: 'All Plans',
    highlights: ['Audio uploads', 'AI lyrics generation', 'Metadata tracking', 'Remix collaboration']
  },
  {
    title: 'Revenue Splits',
    description: 'Manage royalty splits transparently with automated percentage tracking.',
    href: '/splits',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    membershipRequired: 'Creator',
    highlights: ['Percentage tracking', 'PRO export', 'CSV/PDF reports', 'Automated confirmations']
  },
  {
    title: 'Analytics Dashboard',
    description: 'Real-time insights into your music performance, revenue, and engagement.',
    href: '/analytics',
    icon: BarChart,
    color: 'from-orange-500 to-red-500',
    membershipRequired: 'All Plans',
    highlights: ['Real-time data', 'Revenue tracking', 'Genre analytics', 'Engagement metrics']
  },
  {
    title: 'Asset Library',
    description: 'Centralized storage for all your music assets, stems, and project files.',
    href: '/assets',
    icon: FileAudio,
    color: 'from-indigo-500 to-purple-500',
    membershipRequired: 'Creator',
    highlights: ['Cloud storage', 'Version history', 'Quick preview', 'Shareable links']
  },
  {
    title: 'Organizations',
    description: 'Create teams, manage permissions, and collaborate across labels and collectives.',
    href: '/onboarding/organization',
    icon: Building2,
    color: 'from-pink-500 to-rose-500',
    membershipRequired: 'All Plans',
    highlights: ['Team management', 'Role permissions', 'Invite system', 'Multi-org support']
  },
  {
    title: 'Live Sessions',
    description: 'Host interactive music sessions with real-time audience engagement.',
    href: '/sessions',
    icon: PlayCircle,
    color: 'from-teal-500 to-cyan-500',
    membershipRequired: 'Creator',
    highlights: ['Live streaming', 'Audience voting', 'Real-time chat', 'Session recording']
  },
  {
    title: 'Fan Donations',
    description: 'Accept support from fans with integrated donation and crowdfunding tools.',
    href: '/donate',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    membershipRequired: 'Public Feature',
    highlights: ['One-time/recurring', 'Goal tracking', 'Donor recognition', 'Tax receipts']
  }
];

const membershipPlans = [
  {
    name: 'Explorer',
    price: 'Free',
    description: 'Perfect for trying out CronkWaters',
    features: ['1 Active Project', 'Basic Features', '10 AI Credits/month'],
    icon: Sparkles
  },
  {
    name: 'Creator',
    price: '$9.99/mo',
    description: 'For serious musicians',
    features: ['Unlimited Projects', 'Revenue Splits', '500 AI Credits/month'],
    icon: Crown,
    popular: true
  },
  {
    name: 'Studio',
    price: '$29.99/mo',
    description: 'For labels & power users',
    features: ['Everything in Creator', 'White-label Options', 'Unlimited AI Credits'],
    icon: Zap
  }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
            Where Music Lives & Breathes
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            The complete ecosystem for modern music creation, collaboration, and distribution. 
            From first note to final master, we grow with your vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#features"
              className="group px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl text-white font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              Explore Features
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/vision"
              className="px-8 py-4 border-2 border-border hover:border-brand-primary bg-surface/50 backdrop-blur rounded-2xl font-semibold text-lg transition-all"
            >
              Learn Our Story
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Demo mode enabled • No credit card required</span>
          </div>
        </motion.div>
      </section>

      {/* Real Stats Section - No fake numbers */}
      <section className="relative z-10 px-6 py-16 border-y border-border/50 bg-surface/30 backdrop-blur">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-6">Experience CronkWaters Today</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every feature is available to explore in demo mode. No sign-up required. 
            Join our community when you're ready to create.
          </p>
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
                The CronkWaters Project is the vision of Josh Waters and Justin Cronk — two friends with over 20 years 
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
              <div className="rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-8 backdrop-blur">
                <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6">
                  We're pursuing 501(c) nonprofit status to formalize our commitment to:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Supporting independent musicians</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Providing free & low-cost creative tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Promoting arts education</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Offering grants for emerging artists</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything You Need to Create</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A complete suite of tools designed for the modern music creator
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={feature.title} href={feature.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative h-full rounded-3xl bg-surface/80 backdrop-blur border border-border/50 p-8 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <feature.icon className="w-12 h-12 mb-4 text-brand-primary" />
                  
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{feature.membershipRequired}</span>
                    <span className="text-sm font-semibold text-brand-primary group-hover:gap-2 flex items-center gap-1 transition-all">
                      Try Demo
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative z-10 px-6 py-24 bg-surface/30 backdrop-blur">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for the Future</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Powered by cutting-edge technology for reliability and scale
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="rounded-2xl bg-surface/80 backdrop-blur border border-border/50 p-6">
              <Shield className="w-10 h-10 mb-4 mx-auto text-brand-primary" />
              <h3 className="font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground">Your data protected 24/7</p>
            </div>
            <div className="rounded-2xl bg-surface/80 backdrop-blur border border-border/50 p-6">
              <Zap className="w-10 h-10 mb-4 mx-auto text-brand-primary" />
              <h3 className="font-semibold mb-2">Edge Functions</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast global performance</p>
            </div>
            <div className="rounded-2xl bg-surface/80 backdrop-blur border border-border/50 p-6">
              <Building2 className="w-10 h-10 mb-4 mx-auto text-brand-primary" />
              <h3 className="font-semibold mb-2">Global CDN</h3>
              <p className="text-sm text-muted-foreground">Stream anywhere, anytime</p>
            </div>
            <div className="rounded-2xl bg-surface/80 backdrop-blur border border-border/50 p-6">
              <FileAudio className="w-10 h-10 mb-4 mx-auto text-brand-primary" />
              <h3 className="font-semibold mb-2">Unlimited Storage</h3>
              <p className="text-sm text-muted-foreground">Scale without limits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-12 backdrop-blur border border-border/50"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Music?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are building the future of music together. 
            Explore all our features - no sign-in required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/membership"
              className="group px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl text-white font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              View Membership Options
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/vision"
              className="px-8 py-4 border-2 border-brand-primary/50 hover:border-brand-primary bg-transparent rounded-2xl font-semibold text-lg transition-all"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Membership Plans */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Flexible Membership Options</h2>
          <p className="text-xl text-muted-foreground">
            Start free, grow at your pace. Every plan supports our nonprofit mission.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {membershipPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl bg-surface/80 backdrop-blur border ${
                plan.popular ? 'border-brand-primary shadow-lg scale-105' : 'border-border/50'
              } p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <plan.icon className="w-12 h-12 mb-4 text-brand-primary" />
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4 text-brand-primary">{plan.price}</div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/membership"
            className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:gap-3 transition-all"
          >
            View All Membership Details
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

