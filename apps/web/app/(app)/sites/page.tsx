'use client';

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
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  // Show dashboard if site exists
  if (hasWebsite && site) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                My Website
              </h1>
              <p style={{ color: 'var(--muted)' }}>Manage your musician website</p>
            </div>
            <div className="flex gap-3">
              <a
                href={`/s/${site.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                <Eye size={18} />
                Preview
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => router.push('/sites/edit')}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                }}
              >
                <Settings size={18} />
                Edit Site
              </button>
            </div>
          </div>

          {/* Site Card */}
          <div
            className="mb-6 rounded-xl p-6"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {site.siteName || 'My Website'}
                </h2>
                <a
                  href={`/s/${site.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  <Globe size={14} />
                  {site.subdomain}.cronkwaters.com
                  <ExternalLink size={12} />
                </a>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  site.status === 'published'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {site.status === 'published' ? 'Published' : 'Draft'}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                  <Eye size={16} />
                  <span className="text-sm">Total Views</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {site.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                  <Palette size={16} />
                  <span className="text-sm">Template</span>
                </div>
                <p className="text-2xl font-bold uppercase" style={{ color: 'var(--text)' }}>
                  {site.templateId}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                  <BarChart3 size={16} />
                  <span className="text-sm">Created</span>
                </div>
                <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                  {new Date(site.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/sites/edit?tab=sections')}
              className="rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
                Edit Sections
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Add, remove, or reorder content blocks
              </p>
            </button>
            <button
              onClick={() => router.push('/sites/edit?tab=theme')}
              className="rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
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
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'var(--accent)', opacity: 0.2 }}
          >
            <Globe size={32} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="mb-4 text-4xl font-bold" style={{ color: 'var(--text)' }}>
            Build Your Website
          </h1>
          <p className="mx-auto max-w-2xl text-xl" style={{ color: 'var(--muted)' }}>
            Create a stunning website in seconds. We&apos;ll automatically import your songs, tour
            dates, and profile info.
          </p>
        </div>

        {/* Quick Start Card */}
        <div
          className="mb-8 rounded-xl p-8"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <Sparkles style={{ color: 'var(--accent)' }} />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Quick Start
            </h2>
          </div>

          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            Choose a template and we&apos;ll create your website using your existing CronkWaters
            data. You can customize everything after.
          </p>

          {/* Template Selection */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`rounded-lg p-4 text-left transition-all ${
                  selectedTemplate === template.id ? 'ring-2' : ''
                }`}
                style={
                  {
                    background:
                      selectedTemplate === template.id ? 'var(--accent)' + '20' : 'var(--bg)',
                    borderColor: selectedTemplate === template.id ? 'var(--accent)' : 'transparent',
                    '--tw-ring-color': 'var(--accent)',
                  } as React.CSSProperties
                }
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
            <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}

          <button
            onClick={handleQuickStart}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-4 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: 'var(--accent)',
              color: '#fff',
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
          </button>
        </div>

        {/* Features List */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 text-center">
            <div className="mb-3 text-4xl">🎵</div>
            <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
              Auto-Sync Music
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Your songs automatically appear on your website
            </p>
          </div>
          <div className="p-6 text-center">
            <div className="mb-3 text-4xl">📅</div>
            <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
              Tour Dates
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Shows sync from your tour management
            </p>
          </div>
          <div className="p-6 text-center">
            <div className="mb-3 text-4xl">✨</div>
            <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
              Pro Design
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              World-class templates designed for musicians
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
