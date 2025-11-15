'use client';

import { motion } from 'framer-motion';
import { 
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Clock,
  Music,
  Play,
  Eye,
  ArrowRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const metrics = [
  {
    icon: Play,
    title: 'Stream Analytics',
    description: 'Track plays across all platforms in real-time.'
  },
  {
    icon: Users,
    title: 'Audience Insights',
    description: 'Understand who listens, where, and when.'
  },
  {
    icon: TrendingUp,
    title: 'Growth Tracking',
    description: 'Monitor your fanbase expansion over time.'
  },
  {
    icon: Globe,
    title: 'Geographic Data',
    description: 'See where your music resonates globally.'
  }
];

const dataPoints = [
  { label: 'Total Plays', value: '2.4M+', change: '+23%' },
  { label: 'Monthly Listeners', value: '847K', change: '+15%' },
  { label: 'Countries Reached', value: '127', change: '+8' },
  { label: 'Playlist Adds', value: '3.2K', change: '+42%' }
];

export default function AnalyticsPage() {
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-600/20 to-red-600/20">
              <Activity className="w-12 h-12 text-orange-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Performance Pulse
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Feel the rhythm of your success with live analytics and audience insights.
            Make data-driven decisions to grow your career.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
            >
              View Your Analytics
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-border hover:border-orange-600/50 rounded-2xl font-semibold transition-all"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Stats */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Your Music in Numbers
            </h2>
            <p className="text-xl text-muted-foreground">
              Real-time data from all major platforms
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {dataPoints.map((point, index) => (
              <motion.div
                key={point.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-surface border border-border text-center"
              >
                <div className="text-3xl font-bold mb-2">{point.value}</div>
                <div className="text-sm text-muted-foreground mb-1">{point.label}</div>
                <div className="text-sm text-green-600 font-medium">{point.change}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Deep Insights at Your Fingertips
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to understand your audience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-gradient-to-br from-surface to-background hover:shadow-xl transition-all"
              >
                <metric.icon className="w-10 h-10 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{metric.title}</h3>
                <p className="text-muted-foreground">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
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
                Beautiful Dashboards
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Visualize your data with stunning charts and graphs.
                Export reports for labels, managers, or your own records.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Customizable chart types</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>Historical data comparison</span>
                </li>
                <li className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span>Real-time updates</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-orange-600/10 to-red-600/10 flex items-center justify-center">
                <BarChart3 className="w-32 h-32 text-orange-600/20" />
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
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-orange-600/10 to-red-600/10 border border-orange-600/20"
        >
          <h2 className="text-4xl font-bold mb-4">
            Turn Data Into Decisions
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start making smarter moves with comprehensive analytics
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
          >
            Access Analytics Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

