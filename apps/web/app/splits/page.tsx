'use client';

import { motion } from 'framer-motion';
import { Coins, ArrowRight, TrendingUp, FileText, Shield } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: TrendingUp,
    title: 'Automated Splits',
    description: 'Set up royalty splits once, distribute automatically forever.'
  },
  {
    icon: FileText,
    title: 'PRO Integration',
    description: 'Connect with ASCAP, BMI, and SESAC for seamless royalty tracking.'
  },
  {
    icon: Shield,
    title: 'Smart Contracts',
    description: 'Blockchain-powered agreements that protect everyone involved.'
  }
];

export default function SplitsMarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface overflow-hidden">
      <section className="relative z-10 px-6 pt-32 pb-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Coins className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Revenue Symphony
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Orchestrate your earnings with transparent split management and royalty tracking.
          </p>
          <Link
            href="/auth"
            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl font-semibold text-lg text-white overflow-hidden shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Earning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"
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
              <feature.icon className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}


