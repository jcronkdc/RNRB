'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Sparkles,
  ArrowRight,
  Loader2,
  Eye,
  Settings,
  ExternalLink,
  Palette,
  BarChart3,
  Music2,
  Calendar,
  Zap,
} from 'lucide-react';

interface Site {
  id: string;
  subdomain: string;
  siteName: string | null;
  templateId: string;
  status: string;
  totalViews: number;
  publishedAt: string | null;
  createdAt: string;
}

const templates = [
  { id: 'noir', name: 'NOIR', description: 'Cinematic dark theme', category: 'dark' },
  { id: 'vinyl', name: 'VINYL', description: 'Retro record store vibe', category: 'dark' },
  { id: 'neon', name: 'NEON', description: 'Cyberpunk glow', category: 'dark' },
  { id: 'acoustic', name: 'ACOUSTIC', description: 'Warm, organic feel', category: 'light' },
  { id: 'arena', name: 'ARENA', description: 'Stadium energy', category: 'dark' },
  { id: 'editorial', name: 'EDITORIAL', description: 'Gallery minimal', category: 'light' },
  { id: 'outlaw', name: 'OUTLAW', description: 'Weathered americana', category: 'dark' },
  { id: 'futura', name: 'FUTURA', description: 'Chrome & glass', category: 'dark' },
];

export default function SitesPage() {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('noir');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSite();
  }, []);

  const fetchSite = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSite(data.site);
      setHasWebsite(data.hasWebsite);
    } catch {
      setError('Failed to load site');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = async () => {
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/sites/quick-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create site');
      }

      // Redirect to editor
      router.push('/sites/edit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
        {/* Animated background while loading */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          </div>
          <p className="text-gray-400">Loading your website...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if site exists
  if (hasWebsite && site) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Animated Background Gradient Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <motion.div
            className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-600/15 to-transparent blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-cyan-600/10 to-transparent blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              {/* Accent bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 h-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
              />
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm">
                  <Globe className="h-7 w-7 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Website</h1>
                  <p className="text-gray-400">Manage your musician website</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`/s/${site.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                <Eye size={18} />
                Preview
                <ExternalLink size={14} />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/sites/edit')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25"
              >
                <Settings size={18} />
                Edit Site
              </motion.button>
            </div>
          </motion.div>

          {/* Site Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  {site.siteName || 'My Website'}
                </h2>
                <a
                  href={`/s/${site.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-purple-400 hover:underline"
                >
                  <Globe size={14} />
                  {site.subdomain}.cronkwaters.com
                  <ExternalLink size={12} />
                </a>
              </div>
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  site.status === 'published'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {site.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: Eye, label: 'Total Views', value: site.totalViews.toLocaleString() },
                { icon: Palette, label: 'Template', value: site.templateId.toUpperCase() },
                {
                  icon: BarChart3,
                  label: 'Created',
                  value: new Date(site.createdAt).toLocaleDateString(),
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-center gap-2 text-gray-400">
                    <stat.icon size={16} />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/sites/edit?tab=sections')}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-white/10"
            >
              <h3 className="mb-2 font-semibold text-white group-hover:text-purple-400">
                Edit Sections
              </h3>
              <p className="text-sm text-gray-400">Add, remove, or reorder content blocks</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/sites/edit?tab=theme')}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-white/10"
            >
              <h3 className="mb-2 font-semibold text-white group-hover:text-purple-400">
                Customize Theme
              </h3>
              <p className="text-sm text-gray-400">Change colors, fonts, and styling</p>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show Quick Start if no site
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-600/20 to-transparent blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-cyan-600/15 to-transparent blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-pink-600/10 to-transparent blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Globe size={40} className="text-purple-400" />
          </motion.div>
          <h1 className="mb-4 bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Build Your Website
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Create a stunning website in seconds. We'll automatically import your songs, tour dates,
            and profile info.
          </p>
        </motion.div>

        {/* Quick Start Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Quick Start</h2>
              <p className="text-sm text-gray-400">Choose a template to get started</p>
            </div>
          </div>

          <p className="mb-6 text-gray-400">
            Choose a template and we'll create your website using your existing CronkWaters data.
            You can customize everything after.
          </p>

          {/* Template Selection */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {templates.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTemplate(template.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/30'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <h3
                  className={`mb-1 text-sm font-bold ${
                    selectedTemplate === template.id ? 'text-purple-400' : 'text-white'
                  }`}
                >
                  {template.name}
                </h3>
                <p className="text-xs text-gray-500">{template.description}</p>
              </motion.button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQuickStart}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating your website...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Create My Website
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {[
            {
              icon: Music2,
              title: 'Auto-Sync Music',
              desc: 'Your songs automatically appear on your website',
            },
            { icon: Calendar, title: 'Tour Dates', desc: 'Shows sync from your tour management' },
            {
              icon: Zap,
              title: 'Pro Design',
              desc: 'World-class templates designed for musicians',
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ scale: 1.02, y: -2 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <feature.icon className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
