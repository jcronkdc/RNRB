'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  // Core Icons
  Zap,
  Shield,
  Globe,
  Layers,
  
  // Feature Icons
  Music,
  Users,
  DollarSign,
  BarChart3,
  Database,
  Radio,
  Award,
  
  // UI Icons
  ArrowRight,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

const features = [
  {
    title: 'Music Projects',
    description: 'Professional project management for your creative work',
    icon: Music,
    stats: '∞ Songs'
  },
  {
    title: 'Rights & Royalties',
    description: 'Transparent split sheets and automated revenue tracking',
    icon: DollarSign,
    stats: '100% Transparent'
  },
  {
    title: 'Live Performance',
    description: 'Tour management, venues, and setlist organization',
    icon: Radio,
    stats: '1000+ Venues'
  },
  {
    title: 'Analytics',
    description: 'Real-time insights into your music career',
    icon: BarChart3,
    stats: 'Live Data'
  },
  {
    title: 'Collaboration',
    description: 'Connect with musicians, producers, and industry pros',
    icon: Users,
    stats: 'Global Network'
  },
  {
    title: 'Asset Storage',
    description: 'Secure cloud storage for all your creative assets',
    icon: Database,
    stats: 'Unlimited'
  }
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-surface/20 to-background" />
          <motion.div 
            style={{ y, opacity }}
            className="absolute inset-0"
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary/3 rounded-full blur-3xl" />
          </motion.div>
        </div>

        <div className="rnrb-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-block"
            >
              <div className="relative">
                <Image
                  src="/rnrlight.png"
                  alt="Rock N' Roll Basement"
                  width={140}
                  height={140}
                  className="dark:hidden drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.8))' }}
                />
                <Image
                  src="/rnrlight.png"
                  alt="Rock N' Roll Basement"
                  width={140}
                  height={140}
                  className="hidden dark:block drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(255,255,255,0.2))' }}
                />
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl mb-6">
              <span className="font-display font-normal">From Bedroom to</span>
              <br />
              <span className="font-display font-black rnrb-gradient-text tracking-tight">
                Billboard
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              The ultimate playground for musicians at <span className="text-foreground font-semibold">every level</span>. 
              Whether you're writing your first song or planning your world tour.
            </p>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link 
                href="/auth"
                className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wider transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                style={{ boxShadow: '0 4px 20px rgba(201, 169, 97, 0.3)' }}
              >
                Start Jamming
                <ArrowRight className="ml-2 w-5 h-5 inline-block animate-pulse" />
              </Link>
              
              <Link 
                href="/demo"
                className="rnrb-button-secondary px-8 py-4 rounded-xl text-lg font-medium uppercase tracking-wide border-2"
              >
                Watch Demo
              </Link>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Global Infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Lightning Fast</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      {/* Features Grid */}
      <section className="py-24">
        <div className="rnrb-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              Your Journey, Your Way
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              From <span className="text-foreground font-semibold">bedroom producers</span> to <span className="text-foreground font-semibold">touring legends</span> - 
              tools that grow with your ambition
            </p>
            <div className="flex justify-center gap-4 flex-wrap text-sm">
              <span className="rnrb-badge border-green-500/30 text-green-400">🎸 Beginners Welcome</span>
              <span className="rnrb-badge border-blue-500/30 text-blue-400">🎤 Semi-Pro Tools</span>
              <span className="rnrb-badge border-purple-500/30 text-purple-400">🎹 Pro Features</span>
              <span className="rnrb-badge border-red-500/30 text-red-400">🥁 Industry Standard</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="rnrb-card h-full p-8 rnrb-hover-lift rnrb-hover-glow rnrb-edge rnrb-grunge">
                  <div className="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-all duration-300 group-hover:scale-110">
                    <feature.icon className="w-7 h-7 text-brand-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brand-primary uppercase tracking-wider">
                      {feature.stats}
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section className="py-24 bg-surface/30">
        <div className="rnrb-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A glimpse into your new command center
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video bg-surface rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
              {/* Dashboard Preview Placeholder */}
              <div className="p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <Layers className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive Dashboard Preview</p>
                </div>
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute -left-4 top-1/4 rnrb-card p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold">New Achievement</p>
                  <p className="text-xs text-muted-foreground">1M Streams Reached</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -right-4 bottom-1/4 rnrb-card p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-semibold">Revenue Up 32%</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-surface/30">
        <div className="rnrb-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              Start Free, Scale As You Grow
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              No credit card required. Upgrade when you're ready.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="rnrb-card p-6">
                <h3 className="text-lg font-semibold mb-2">Explorer</h3>
                <p className="text-3xl font-bold mb-4">Free</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>5 Active Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Basic Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Community Support</span>
                  </li>
                </ul>
              </div>
              
              <div className="rnrb-card p-6 border-2 border-brand-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-primary text-xs font-medium rounded-full text-brand-primary-foreground">
                  Most Popular
                </div>
                <h3 className="text-lg font-semibold mb-2">Professional</h3>
                <p className="text-3xl font-bold mb-4">$29/mo</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Unlimited Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </div>
              
              <div className="rnrb-card p-6">
                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                <p className="text-3xl font-bold mb-4">Custom</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Custom Integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Dedicated Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>SLA Guarantee</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link 
              href="/pricing"
              className="rnrb-button-secondary px-8 py-4 rounded-xl text-lg font-medium inline-flex items-center gap-2"
            >
              View All Features
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="rnrb-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl rnrb-gold-gradient p-16 text-center"
          >
            <div className="absolute inset-0 bg-black/50" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-display text-white mb-6">
                Ready to Rock?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Whether you're laying down your first track or booking your 50th tour, 
                <span className="text-white font-semibold"> we've got your back</span>.
              </p>
              
              <Link 
                href="/auth"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-xl font-bold text-lg hover:bg-white/90 transition-all duration-300 transform hover:scale-105 uppercase tracking-wider shadow-2xl"
              >
                Start Your Journey
                <ArrowRight className="w-6 h-6 animate-pulse" />
              </Link>
              
              <p className="mt-6 text-sm text-white/60">
                No credit card required • <span className="font-semibold">Always free for beginners</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="rnrb-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Image
                src="/rnrlight.png"
                alt="Rock N' Roll Basement"
                width={48}
                height={48}
                className="dark:hidden drop-shadow-md"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
              />
              <Image
                src="/rnrlight.png"
                alt="Rock N' Roll Basement"
                width={48}
                height={48}
                className="hidden dark:block"
              />
              <span className="text-lg font-bold tracking-tight">Rock N' Roll Basement</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Rock N' Roll Basement. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = "force-static";