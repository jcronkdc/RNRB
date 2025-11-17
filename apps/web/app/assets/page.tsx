'use client';

import { motion } from 'framer-motion';
import { Archive, ArrowRight, Cloud, Download, FileAudio, FileText, HardDrive, Image, Search, Shield, Video } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Cloud,
    title: 'Unlimited Storage',
    description: 'Never worry about space. Upload everything, keep it forever.'
  },
  {
    icon: Search,
    title: 'Smart Organization',
    description: 'Find any file instantly with AI-powered search and tags.'
  },
  {
    icon: Shield,
    title: 'Secure Backup',
    description: 'Your creative work is safe with enterprise-grade encryption.'
  }
];

const fileTypes = [
  { icon: FileAudio, label: 'Audio Files', count: 'All Formats' },
  { icon: Video, label: 'Video Files', count: '4K Support' },
  { icon: Image, label: 'Images', count: 'High Res' },
  { icon: FileText, label: 'Documents', count: 'Unlimited' }
];

export default function AssetsMarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface overflow-hidden">
      <section className="relative z-10 px-6 pt-32 pb-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Archive className="w-20 h-20 text-purple-500 mx-auto mb-6" />
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Sound Vault
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Your creative archive. Every stem, sample, and session preserved in crystal clarity.
          </p>
          <Link
            href="/auth"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-lg text-white overflow-hidden shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              Access Your Vault
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-surface/80 backdrop-blur border border-border/50 rounded-3xl p-8 text-center"
            >
              <feature.icon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {fileTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-surface/60 backdrop-blur border border-border/30 rounded-2xl p-6 text-center"
            >
              <type.icon className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <div className="font-semibold mb-1">{type.label}</div>
              <div className="text-xs text-muted-foreground">{type.count}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}


