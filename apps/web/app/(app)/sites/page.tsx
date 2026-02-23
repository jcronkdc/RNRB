'use client';

import { motion } from 'motion/react';
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
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { microCopy } from '@/lib/workshop-voice';

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
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* White RR Logo [[memory:11700420]] */}
          <Link href="/" className="group mb-2">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={120}
              height={48}
              className="transition-transform group-hover:scale-105"
              priority
            />
          </Link>
          <div
            className="h-10 w-10 animate-spin rounded-full border-4"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <p style={{ color: 'var(--muted)' }}>{microCopy.loading.sites}</p>
        </div>
      </div>
    );
  }

  // Show dashboard if site exists
  if (hasWebsite && site) {
    return (
      <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex justify-center"
          >
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={56}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Globe className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  My Website
                </h2>
                <p style={{ color: 'var(--muted)' }}>Manage your musician website</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`/s/${site.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  background: 'var(--panel)',
                }}
              >
                <Eye size={18} />
                Preview
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => router.push('/sites/edit')}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                <Settings size={18} />
                Edit Site
              </button>
            </div>
          </motion.div>

          {/* Site Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-xl p-6"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
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
                <div
                  key={stat.label}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                    <stat.icon size={16} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => router.push('/sites/edit?tab=sections')}
              className="rounded-xl p-6 text-left transition-colors"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                Edit Sections
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Add, remove, or reorder content blocks
              </p>
            </button>
            <button
              onClick={() => router.push('/sites/edit?tab=theme')}
              className="rounded-xl p-6 text-left transition-colors"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                Customize Theme
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Change colors, fonts, and styling
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show Quick Start if no site
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex justify-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-10 text-center"
        >
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8 rounded-xl p-8"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255, 99, 71, 0.15)' }}
            >
              <Sparkles className="h-6 w-6" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Quick Start
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Choose a template to get started
              </p>
            </div>
          </div>

          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            Choose a template and we'll create your website using your existing CronkWaters data.
            You can customize everything after.
          </p>

          {/* Template Selection */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className="rounded-xl border p-4 text-left transition-all"
                style={{
                  borderColor: selectedTemplate === template.id ? 'var(--accent)' : 'var(--border)',
                  background:
                    selectedTemplate === template.id ? 'rgba(255, 99, 71, 0.1)' : 'var(--bg)',
                }}
              >
                <h3
                  className="mb-1 text-sm font-bold"
                  style={{
                    color: selectedTemplate === template.id ? 'var(--accent)' : 'var(--text)',
                  }}
                >
                  {template.name}
                </h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {template.description}
                </p>
              </button>
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

          <button
            onClick={handleQuickStart}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
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
          </button>
        </motion.div>

        {/* Features List */}
        <div className="grid gap-6 md:grid-cols-3">
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
            <div
              key={feature.title}
              className="rounded-xl p-6 text-center"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <feature.icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
