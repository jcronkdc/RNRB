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
  Headphones,
  Mic,
  Video,
  MessageSquare,
  
  // UI Icons
  ArrowRight,
  Check,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { NavBar } from '@/components/NavBar';

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

const testimonials = [
  {
    quote: "The most comprehensive platform I've ever used for managing my music career.",
    author: "Sarah Chen",
    role: "Independent Artist",
    rating: 5
  },
  {
    quote: "Rock N' Roll Basement transformed how our label operates. It's a game-changer.",
    author: "Marcus Thompson",
    role: "Label Executive",
    rating: 5
  },
  {
    quote: "Finally, a platform that understands what musicians actually need.",
    author: "Alex Rivera",
    role: "Producer",
    rating: 5
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
      <NavBar />
      
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
              <Image
                src="/rnrdark.png"
                alt="Rock N' Roll Basement"
                width={120}
                height={120}
                className="dark:hidden"
              />
              <Image
                src="/rnrlight.png"
                alt="Rock N' Roll Basement"
                width={120}
                height={120}
                className="hidden dark:block"
              />
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6">
              <span className="font-display font-bold">Rock N' Roll Basement</span>
            </h1>

            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium">
                The World's First & Only All-in-One Music Platform
              </span>
            </motion.div>

            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed font-semibold">
              Stop Using 7 Different Apps
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Record HD video sessions. Stream live concerts. Manage tours. Track royalties. 
              <span className="text-brand-primary font-semibold"> All in one platform.</span>
              <br />
              <span className="font-semibold">No other platform in the world does this.</span>
            </p>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link 
                href="/auth"
                className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-medium"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 inline-block" />
              </Link>
              
              <Link 
                href="/why-rnrb"
                className="rnrb-button-secondary px-8 py-4 rounded-xl text-lg font-medium"
              >
                See Why We're Different
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

      {/* For Everyone Section */}
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
              Built for Everyone
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              From solo songwriters to full touring bands — Rock N' Roll Basement adapts to your journey
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <span className="text-brand-primary font-semibold">Collaboration is at the heart of everything we do.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Solo Songwriter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rnrb-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Mic className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Solo Artists</h3>
              <p className="text-muted-foreground text-sm">
                Write, record demos, and manage your music career from one place
              </p>
            </motion.div>

            {/* Duo/Collaboration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="rnrb-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Co-Writers</h3>
              <p className="text-muted-foreground text-sm">
                Real-time messaging, split sheets, and version control for collaborations
              </p>
            </motion.div>

            {/* Full Band */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="rnrb-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Users className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bands</h3>
              <p className="text-muted-foreground text-sm">
                Manage rehearsals, setlists, tours, and revenue splits with your bandmates
              </p>
            </motion.div>

            {/* Live Streaming */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="rnrb-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Video className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Performers</h3>
              <p className="text-muted-foreground text-sm">
                Stream concerts to YouTube, Twitch, and Facebook with HD video recording
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link 
              href="/why-rnrb"
              className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-medium inline-flex items-center gap-2"
            >
              See All Features
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

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
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete ecosystem designed for the modern music industry
            </p>
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
                <div className="rnrb-card h-full p-8 rnrb-hover-lift rnrb-hover-glow">
                  <div className="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-brand-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-brand-primary">
                      {feature.stats}
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary transition-colors" />
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

      {/* Testimonials */}
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
              Loved by the Industry
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of music professionals already using Rock N' Roll Basement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rnrb-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-primary text-brand-primary" />
                  ))}
                </div>
                
                <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join the platform that's revolutionizing the music industry. 
                Start your free account today.
              </p>
              
              <Link 
                href="/auth"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-6 h-6" />
              </Link>
              
              <p className="mt-6 text-sm text-white/60">
                No credit card required • Free forever plan available
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
                src="/rnrdark.png"
                alt="Rock N' Roll Basement"
                width={32}
                height={32}
                className="dark:hidden"
              />
              <Image
                src="/rnrlight.png"
                alt="Rock N' Roll Basement"
                width={32}
                height={32}
                className="hidden dark:block"
              />
              <span className="text-lg font-medium">Rock N' Roll Basement</span>
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