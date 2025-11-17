'use client';

import { motion } from 'framer-motion';
import { Activity, ArrowRight, BarChart3, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: BarChart3,
    title: 'Live Dashboards',
    description: 'Real-time insights into your music\'s performance across all platforms.'
  },
  {
    icon: Users,
    title: 'Fan Demographics',
    description: 'Understand who listens to your music and where they\'re from.'
  },
  {
    icon: TrendingUp,
    title: 'Growth Metrics',
    description: 'Track streams, downloads, and revenue trends over time.'
  }
];

export default function AnalyticsMarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface overflow-hidden">
      <section className="relative z-10 px-6 pt-32 pb-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Activity className="w-20 h-20 text-orange-500 mx-auto mb-6" />
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Performance Pulse
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Feel the rhythm of your success with live analytics and audience insights.
          </p>
          <Link
            href="/auth"
            className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-semibold text-lg text-white overflow-hidden shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              View Analytics
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-surface/80 backdrop-blur border border-border/50 rounded-3xl p-8 text-center"
            >
              <feature.icon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}


