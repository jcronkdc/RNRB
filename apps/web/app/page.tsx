'use client';

import { motion } from 'framer-motion';
import { 
  // Creative & Music Icons
  Palette,
  Waves,
  Radio,
  Headphones,
  Piano,
  Guitar,
  Drum,
  AudioLines,
  
  // Feature Icons
  Layers,
  Coins,
  Activity,
  Archive,
  Users2,
  Mic,
  HeartHandshake,
  
  // Tech Icons
  Cpu,
  CloudLightning,
  Lock,
  Rocket,
  
  // UI Icons
  Sparkles,
  Star,
  ArrowRight,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const features = [
  {
    title: 'Creative Studio',
    description: 'Your musical canvas awaits. Create, collaborate, and craft your sonic masterpieces.',
    icon: Palette,
    href: '/projects',
    color: 'from-violet-600 to-indigo-600',
    bgPattern: 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20',
    highlights: ['Multi-track workspace', 'Real-time collaboration', 'Version control', 'Cloud sync']
  },
  {
    title: 'Sonic Forge',
    description: 'Shape your sound with AI-powered tools that understand your artistic vision.',
    icon: Waves,
    href: '/music',
    color: 'from-blue-600 to-cyan-600',
    bgPattern: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    highlights: ['AI lyric generation', 'Voice synthesis', 'Stem separation', 'Audio mastering']
  },
  {
    title: 'Revenue Symphony',
    description: 'Orchestrate your earnings with transparent split management and royalty tracking.',
    icon: Coins,
    href: '/splits',
    color: 'from-emerald-600 to-green-600',
    bgPattern: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20',
    highlights: ['Automated splits', 'Real-time tracking', 'PRO integration', 'Smart contracts']
  },
  {
    title: 'Performance Pulse',
    description: 'Feel the rhythm of your success with live analytics and audience insights.',
    icon: Activity,
    href: '/analytics',
    color: 'from-orange-600 to-red-600',
    bgPattern: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    highlights: ['Live dashboards', 'Fan demographics', 'Revenue streams', 'Growth metrics']
  },
  {
    title: 'Sound Vault',
    description: 'Your creative archive. Every stem, sample, and session preserved in crystal clarity.',
    icon: Archive,
    href: '/assets',
    color: 'from-purple-600 to-pink-600',
    bgPattern: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    highlights: ['Unlimited storage', 'Instant preview', 'Smart organization', 'Secure backup']
  },
  {
    title: 'Artist Collective',
    description: 'Unite with fellow creators. Build your label, manage your crew, grow together.',
    icon: Users2,
    href: '/community',
    color: 'from-pink-600 to-rose-600',
    bgPattern: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
    highlights: ['Team workspaces', 'Role management', 'Project sharing', 'Collective goals']
  },
  {
    title: 'Live Stage',
    description: 'Connect with your audience in real-time. Stream, interact, and create moments.',
    icon: Mic,
    href: '/sessions',
    color: 'from-cyan-600 to-teal-600',
    bgPattern: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20',
    highlights: ['HD streaming', 'Interactive polls', 'Live chat', 'Recording capture']
  },
  {
    title: 'Fan Love',
    description: 'Transform listeners into supporters with integrated crowdfunding and donations.',
    icon: HeartHandshake,
    href: '/foundation',
    color: 'from-red-600 to-pink-600',
    bgPattern: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
    highlights: ['Tip jar', 'Crowdfunding', 'Perks system', 'Thank you notes']
  }
];

const instruments = [
  { Icon: Piano, delay: 0 },
  { Icon: Guitar, delay: 0.2 },
  { Icon: Drum, delay: 0.4 },
  { Icon: Headphones, delay: 0.6 },
  { Icon: Radio, delay: 0.8 }
];

// Honest platform stats
const stats = [
  { label: 'Artists Creating', value: 'Join First', icon: Users2 },
  { label: 'Songs Crafted', value: 'Be Pioneer', icon: AudioLines },
  { label: 'Cities Ready', value: '100+', icon: Radio },
  { label: 'Dreams Supported', value: '∞', icon: Star }
];

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Musical Wave Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 1000 1000">
          <pattern id="wave-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M0,100 Q50,50 100,100 T200,100" stroke="currentColor" strokeWidth="2" fill="none" className="text-brand-primary" />
            <path d="M0,150 Q50,100 100,150 T200,150" stroke="currentColor" strokeWidth="2" fill="none" className="text-brand-secondary" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#wave-pattern)" />
        </svg>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
        
        {/* Particle Effect */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-soft-light" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-32 pb-20 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Floating Instruments Animation */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {instruments.map(({ Icon, delay }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ delay, duration: 0.6 }}
                className="relative"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 + index, ease: "easeInOut" }}
                >
                  <Icon className="w-8 h-8 text-muted-foreground" />
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-br from-brand-primary to-accent bg-clip-text text-transparent">
              Where Musicians
            </span>
            <br />
            <span className="text-foreground">
              Build Their Future
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The creative sanctuary for artists who dare to dream. 
            Build, collaborate, and share your sound with the world.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link 
              href="/auth"
              className="rnrb-btn rnrb-btn-primary text-lg px-8 py-4"
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              href="#features"
              className="rnrb-btn rnrb-btn-secondary text-lg px-8 py-4"
            >
              <span className="flex items-center gap-2">
                Explore Features
                <Sparkles className="w-5 h-5" />
              </span>
            </Link>
          </motion.div>

          <motion.div 
            className="mt-8 flex items-center justify-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur border border-brand-primary/20 rounded-full">
              <Lock className="w-4 h-4 text-brand-primary" />
              <span className="text-muted-foreground">Secure platform</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-brand-primary font-medium">Free tier available</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Stats Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-surface/50 backdrop-blur border border-border/50 rounded-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="w-10 h-10 mx-auto mb-3 text-brand-primary group-hover:text-brand-secondary transition-colors" />
                </motion.div>
                <div className="text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Your Complete
            </span>
            <br />
            <span className="text-foreground">Creative Ecosystem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every tool crafted with artists in mind. No limits, just pure creative freedom.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative h-full"
              >
                <div className={`
                  rnrb-card h-full cursor-pointer transition-all duration-300
                  ${hoveredFeature === index ? 'rnrb-card-elevated transform scale-105' : ''}
                `}>
                {/* Background Pattern */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.bgPattern}`} />
                
                {/* Floating particles on hover */}
                {hoveredFeature === index && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-brand-primary/50 rounded-full"
                        initial={{ 
                          x: Math.random() * 100 + "%",
                          y: "100%",
                        }}
                        animate={{ 
                          y: "-10%",
                          x: `${Math.random() * 100}%`,
                        }}
                        transition={{ 
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </div>
                )}
                
                <div className="relative z-10 p-6">
                  {/* Icon with professional style */}
                  <motion.div 
                    className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} p-0.5 mb-4 group-hover:scale-110 transition-transform`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-full h-full rounded-lg bg-background/50 backdrop-blur flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-brand-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {feature.description}
                  </p>

                  {/* Feature highlights */}
                  <ul className="space-y-2 mb-6">
                    {feature.highlights.slice(0, 3).map((highlight, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + i * 0.1 }}
                      >
                        <Check className="w-3 h-3 text-brand-primary" />
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Action */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium bg-gradient-to-r ${feature.color} text-white`}>
                      Explore
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section className="relative z-10 px-6 py-24 bg-surface/30 backdrop-blur border-y border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built by Artists, for Artists
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Rock N' Roll Basement is the dream of Josh Waters and Justin Cronk — two friends united by 
              music and a vision to empower independent artists worldwide. We're building more 
              than software; we're creating a movement.
            </p>
            <Link 
              href="/vision"
              className="inline-flex items-center gap-2 text-brand-primary font-medium hover:text-brand-secondary transition-colors"
            >
              Read Our Story
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powered by Innovation
            </h2>
            <p className="text-xl text-muted-foreground">
              Enterprise-grade technology meets artistic creativity
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: CloudLightning, label: 'Lightning Fast', desc: 'Edge computing for instant response' },
              { icon: Lock, label: 'Fort Knox Security', desc: 'Your art, protected 24/7' },
              { icon: Rocket, label: 'Infinite Scale', desc: 'Grow without limits' },
              { icon: Cpu, label: 'AI-Powered', desc: 'Smart tools that understand you' }
            ].map((tech, index) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center group-hover:from-brand-primary/20 group-hover:to-brand-secondary/20 transition-all"
                >
                  <tech.icon className="w-10 h-10 text-brand-primary" />
                </motion.div>
                <h3 className="font-bold mb-2">{tech.label}</h3>
                <p className="text-sm text-muted-foreground">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Preview */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-br from-surface to-background">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-purple-600/10 p-16 border border-brand-primary/20"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-foreground mb-6">
                Start Free, Grow at Your Pace
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Begin your journey with our Explorer tier. Upgrade when you're ready to unlock 
                advanced features and AI credits.
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
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              href="/auth"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-3xl font-bold text-xl shadow-2xl shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all"
            >
              <Sparkles className="w-6 h-6" />
              Begin Your Journey
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </motion.div>
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
            <p className="mb-4">&copy; 2024 Rock N' Roll Basement. Crafted with ❤️ for the creative souls.</p>
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

export const dynamic = "force-static";