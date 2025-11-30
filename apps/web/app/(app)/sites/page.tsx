'use client';

import { motion } from 'framer-motion';
import {
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
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

// Floating music notes for atmosphere
const MusicNotes = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {['♪', '♫', '♬', '♩', '♪', '♫'].map((note, i) => (
      <motion.div
        key={i}
        className="absolute text-2xl opacity-20"
        style={{
          left: `${10 + i * 15}%`,
          color: '#ff6347',
        }}
        initial={{ y: '100vh', rotate: 0, opacity: 0 }}
        animate={{
          y: '-100px',
          rotate: 360,
          opacity: [0, 0.4, 0.4, 0],
        }}
        transition={{
          duration: 12 + i * 2,
          repeat: Infinity,
          delay: i * 1.5,
          ease: 'linear',
        }}
      >
        {note}
      </motion.div>
    ))}
  </div>
);

// Warm gradient orbs matching landing page
const WarmGradientOrbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    {/* Tomato red orb - top left */}
    <motion.div
      className="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full opacity-40 blur-[100px]"
      style={{
        background: 'radial-gradient(circle, #ff6347, transparent)',
      }}
      animate={{
        x: [0, 80, 0],
        y: [0, 40, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    {/* Gold orb - bottom right */}
    <motion.div
      className="absolute -bottom-64 -right-64 h-[600px] w-[600px] rounded-full opacity-30 blur-[100px]"
      style={{
        background: 'radial-gradient(circle, #ffd700, transparent)',
      }}
      animate={{
        x: [0, -60, 0],
        y: [0, -40, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    {/* Orange orb - center */}
    <motion.div
      className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[100px]"
      style={{
        background: 'radial-gradient(circle, #ff4500, transparent)',
      }}
      animate={{
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
);

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1e1e1e]">
        <WarmGradientOrbs />
        <MusicNotes />
        <div className="relative text-center">
          {/* RR Logo with pulse animation */}
          <motion.div
            className="mx-auto mb-6"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={80}
              height={80}
              className="mx-auto"
              priority
            />
          </motion.div>
          <p className="text-lg font-medium text-white">Loading your website...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if site exists
  if (hasWebsite && site) {
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Floating Music Notes */}
        <div className="music-notes-container pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="music-note"
              style={{
                left: `${5 + i * 8}%`,
                animationDelay: `${i * 0.7}s`,
                fontSize: `${18 + (i % 4) * 8}px`,
              }}
            >
              {['♪', '♫', '♬', '♩'][i % 4]}
            </div>
          ))}
        </div>

        {/* Animated Background Gradient Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
          <div className="gradient-orb gradient-orb-3"></div>
          <div className="gradient-orb-accent"></div>
        </div>

        {/* Hero Grid Pattern */}
        <div className="hero-grid-pattern"></div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
          {/* White RR Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col items-center"
          >
            <Link href="/" className="group relative inline-block">
              <Image
                src="/logo-light.png"
                alt="Rock N' Roll Basement"
                width={160}
                height={65}
                priority
                className="transition-all duration-300 group-hover:scale-105"
                style={{
                  filter:
                    'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(255, 99, 71, 0.3))',
                }}
              />
              <div
                className="absolute inset-0 -z-10 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'rgba(255, 99, 71, 0.2)' }}
              />
            </Link>
            <h1 className="hero-title mt-4 text-center">
              <span className="hero-text-gradient text-2xl font-bold md:text-3xl">
                Rock N' Roll Basement
              </span>
            </h1>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
              My Website
            </p>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              {/* Accent bar - warm gradient */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--accent), #ffd700)',
                }}
              />
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 99, 71, 0.2)',
                    border: '1px solid rgba(255, 99, 71, 0.3)',
                  }}
                >
                  <Globe className="h-7 w-7" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    My Website
                  </h2>
                  <p style={{ color: 'var(--muted)' }}>Manage your musician website</p>
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
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:border-orange-500/30 hover:bg-white/10"
              >
                <Eye size={18} />
                Preview
                <ExternalLink size={14} />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/sites/edit')}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ff6347, #ff4500)',
                  boxShadow: '0 4px 20px rgba(255, 99, 71, 0.3)',
                }}
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
            className="mb-6 overflow-hidden rounded-2xl border border-white/10 p-6 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9), rgba(30, 30, 30, 0.9))',
            }}
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
                  className="flex items-center gap-1 text-sm text-orange-400 hover:underline"
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
                    : 'bg-amber-500/20 text-amber-400'
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
                  <div className="mb-2 flex items-center gap-2 text-white/70">
                    <stat.icon size={16} className="text-orange-400" />
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
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm transition-all hover:border-orange-500/30 hover:bg-white/10"
            >
              <h3 className="mb-2 font-semibold text-white group-hover:text-orange-400">
                Edit Sections
              </h3>
              <p className="text-sm text-white/70">Add, remove, or reorder content blocks</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/sites/edit?tab=theme')}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm transition-all hover:border-orange-500/30 hover:bg-white/10"
            >
              <h3 className="mb-2 font-semibold text-white group-hover:text-orange-400">
                Customize Theme
              </h3>
              <p className="text-sm text-white/70">Change colors, fonts, and styling</p>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show Quick Start if no site
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Floating Music Notes */}
      <div className="music-notes-container pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="music-note"
            style={{
              left: `${5 + i * 8}%`,
              animationDelay: `${i * 0.7}s`,
              fontSize: `${18 + (i % 4) * 8}px`,
            }}
          >
            {['♪', '♫', '♬', '♩'][i % 4]}
          </div>
        ))}
      </div>

      {/* Animated Background Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="gradient-orb-accent"></div>
      </div>

      {/* Hero Grid Pattern */}
      <div className="hero-grid-pattern"></div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* White RR Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          <Link href="/" className="group relative inline-block">
            <Image
              src="/logo-light.png"
              alt="Rock N' Roll Basement"
              width={160}
              height={65}
              priority
              className="transition-all duration-300 group-hover:scale-105"
              style={{
                filter:
                  'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(255, 99, 71, 0.3))',
              }}
            />
            <div
              className="absolute inset-0 -z-10 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'rgba(255, 99, 71, 0.2)' }}
            />
          </Link>
          <h1 className="hero-title mt-4 text-center">
            <span className="hero-text-gradient text-2xl font-bold md:text-3xl">
              Rock N' Roll Basement
            </span>
          </h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            My Website
          </p>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          {/* Title */}
          <h2 className="mb-4 text-3xl font-bold md:text-4xl" style={{ color: 'var(--text)' }}>
            Build Your Website
          </h2>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--muted)' }}>
            Create a stunning website in seconds. We'll automatically import your songs, tour dates,
            and profile info.
          </p>
        </motion.div>

        {/* Quick Start Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 overflow-hidden rounded-2xl border border-white/10 p-8 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9), rgba(30, 30, 30, 0.9))',
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.1))',
                border: '1px solid rgba(255, 99, 71, 0.3)',
              }}
            >
              <Sparkles className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Quick Start</h2>
              <p className="text-sm text-white/70">Choose a template to get started</p>
            </div>
          </div>

          <p className="mb-6 text-white/80">
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
                    ? 'border-orange-500/50 bg-orange-500/10 ring-2 ring-orange-500/30'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <h3
                  className={`mb-1 text-sm font-bold ${
                    selectedTemplate === template.id ? 'text-orange-400' : 'text-white'
                  }`}
                >
                  {template.name}
                </h3>
                <p className="text-xs text-white/60">{template.description}</p>
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
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #ff6347, #ff4500)',
              boxShadow: '0 4px 20px rgba(255, 99, 71, 0.3)',
            }}
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
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all hover:border-orange-500/30"
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 99, 71, 0.15), rgba(255, 215, 0, 0.1))',
                }}
              >
                <feature.icon className="h-7 w-7 text-orange-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-white/70">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}
