'use client';

import { motion } from 'framer-motion';
import { 
  Archive,
  Cloud,
  FileAudio,
  Image,
  FileText,
  Video,
  HardDrive,
  Shield,
  Search,
  ArrowRight,
  Download
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Cloud,
    title: 'Unlimited Storage',
    description: 'Never worry about space. Upload everything, keep it forever.'
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your creative assets protected with enterprise encryption.'
  },
  {
    icon: Search,
    title: 'Smart Organization',
    description: 'AI-powered tagging and instant search across all files.'
  },
  {
    icon: Download,
    title: 'Quick Access',
    description: 'Stream previews instantly, download originals anytime.'
  }
];

const assetTypes = [
  {
    icon: FileAudio,
    title: 'Audio Files',
    formats: 'WAV, AIFF, MP3, FLAC',
    color: 'text-purple-600'
  },
  {
    icon: Image,
    title: 'Artwork',
    formats: 'JPG, PNG, PSD, AI',
    color: 'text-pink-600'
  },
  {
    icon: Video,
    title: 'Videos',
    formats: 'MP4, MOV, AVI, ProRes',
    color: 'text-blue-600'
  },
  {
    icon: FileText,
    title: 'Documents',
    formats: 'PDF, DOC, TXT, XLSX',
    color: 'text-green-600'
  }
];

export default function AssetsPage() {
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20">
              <Archive className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sound Vault
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your creative archive. Every stem, sample, and session preserved in crystal clarity.
            Access your entire catalog from anywhere, anytime.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
            >
              Start Uploading
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-border hover:border-purple-600/50 rounded-2xl font-semibold transition-all"
            >
              See Features
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Storage Stats */}
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
              Built for Professional Creators
            </h2>
            <p className="text-xl text-muted-foreground">
              Store everything. Find anything. Share selectively.
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
                className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-600/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset Types */}
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
              Every File Type Supported
            </h2>
            <p className="text-xl text-muted-foreground">
              From raw recordings to final masters
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assetTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-gradient-to-br from-surface to-background text-center hover:shadow-xl transition-all"
              >
                <type.icon className={`w-16 h-16 mx-auto mb-4 ${type.color}`} />
                <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.formats}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
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
                Seamless Workflow Integration
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Upload directly from your DAW. Organize automatically.
                Share with collaborators instantly.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-purple-600" />
                  <span>Direct DAW integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-purple-600" />
                  <span>Automatic cloud backup</span>
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>Version control built-in</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 flex items-center justify-center">
                <HardDrive className="w-32 h-32 text-purple-600/20" />
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
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-600/20"
        >
          <h2 className="text-4xl font-bold mb-4">
            Never Lose a File Again
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Professional asset management for serious creators
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all"
          >
            Secure Your Assets
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
