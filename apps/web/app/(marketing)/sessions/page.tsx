'use client';

import { motion } from 'framer-motion';
import { 
  Mic,
  Radio,
  MessageSquare,
  Heart,
  Users,
  Wifi,
  Video,
  Music,
  Sparkles,
  ArrowRight,
  Headphones
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Radio,
    title: 'HD Streaming',
    description: 'Crystal clear audio quality for professional performances.'
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Real-time interaction with your audience during sessions.'
  },
  {
    icon: Heart,
    title: 'Fan Engagement',
    description: 'Polls, Q&A, and virtual applause to connect deeper.'
  },
  {
    icon: Video,
    title: 'Multi-Camera',
    description: 'Switch between angles for dynamic performances.'
  }
];

const sessionTypes = [
  {
    title: 'Live Performances',
    description: 'Stream concerts from your studio or stage.',
    attendees: '500+',
    icon: Mic,
    color: 'from-cyan-600 to-teal-600'
  },
  {
    title: 'Studio Sessions',
    description: 'Behind-the-scenes creation process.',
    attendees: '100+',
    icon: Headphones,
    color: 'from-purple-600 to-pink-600'
  },
  {
    title: 'Q&A Sessions',
    description: 'Connect directly with your fanbase.',
    attendees: '250+',
    icon: MessageSquare,
    color: 'from-blue-600 to-indigo-600'
  },
  {
    title: 'Listening Parties',
    description: 'Preview new releases with superfans.',
    attendees: '1000+',
    icon: Music,
    color: 'from-green-600 to-emerald-600'
  }
];

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface">
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-teal-600/20">
              <Mic className="w-12 h-12 text-cyan-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Live Stage
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Connect with your audience in real-time. Stream, interact, and create moments
            that bring your music to life.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
            >
              Host Your First Session
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-border hover:border-cyan-600/50 rounded-2xl font-semibold transition-all"
            >
              Watch Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Indicator */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full">
              <Wifi className="w-4 h-4 text-red-600 animate-pulse" />
              <span className="text-sm font-medium">247 Artists Live Now</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">18.5K Viewers</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Professional Streaming Made Simple
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for engaging live sessions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-surface border border-border hover:border-cyan-600/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-cyan-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Session Types */}
      <section className="px-6 py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Any Type of Live Experience
            </h2>
            <p className="text-xl text-muted-foreground">
              From intimate sessions to massive events
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {sessionTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface to-background p-8 hover:shadow-2xl transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <type.icon className="w-10 h-10 text-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{type.attendees}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
                  <p className="text-muted-foreground">{type.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Turn Streams Into Revenue
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Multiple monetization options to earn from your live sessions.
                Tickets, tips, and exclusive content all built-in.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                  <span>Ticketed events with flexible pricing</span>
                </li>
                <li className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-cyan-600" />
                  <span>Real-time tips and donations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-cyan-600" />
                  <span>Recorded sessions for replay sales</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-cyan-600/10 to-teal-600/10 flex items-center justify-center">
                <Radio className="w-32 h-32 text-cyan-600/20" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-cyan-600/10 to-teal-600/10 border border-cyan-600/20"
        >
          <h2 className="text-4xl font-bold mb-4">
            Go Live in Minutes
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your audience is waiting. Start streaming today.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
          >
            Schedule Your First Session
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

