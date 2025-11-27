'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save,
  Eye,
  Globe,
  Loader2,
  ArrowLeft,
  Layers,
  Palette,
  Settings as SettingsIcon,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  ExternalLink,
  Check,
  Link,
} from 'lucide-react';
import { DomainSettings } from '@/components/site-builder/DomainSettings';

interface SiteSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  isVisible: boolean;
  animation?: string | null;
}

interface Site {
  id: string;
  subdomain: string;
  siteName: string | null;
  tagline: string | null;
  templateId: string;
  theme: Record<string, unknown> | null;
  socialLinks: Record<string, string> | null;
  status: string;
  siteTitle: string | null;
  metaDescription: string | null;
  bookingEmail: string | null;
  publicEmail: string | null;
  sections: SiteSection[];
}

function SiteEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'sections';

  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSite();
  }, []);

  const fetchSite = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      if (data.site) {
        setSite(data.site);
      } else {
        router.push('/sites');
      }
    } catch {
      router.push('/sites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!site) return;
    setIsSaving(true);

    try {
      const response = await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: site.siteName,
          tagline: site.tagline,
          siteTitle: site.siteTitle,
          metaDescription: site.metaDescription,
          socialLinks: site.socialLinks,
          bookingEmail: site.bookingEmail,
          publicEmail: site.publicEmail,
          theme: site.theme,
        }),
      });

      if (response.ok) {
        setHasChanges(false);
        setSaveMessage('Saved!');
        setTimeout(() => setSaveMessage(''), 2000);
      }
    } catch {
      setSaveMessage('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!site) return;
    setIsPublishing(true);

    try {
      const response = await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: site.status === 'published' ? 'draft' : 'published',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSite(data.site);
      }
    } catch {
      // Handle error
    } finally {
      setIsPublishing(false);
    }
  };

  const updateSite = (updates: Partial<Site>) => {
    if (!site) return;
    setSite({ ...site, ...updates });
    setHasChanges(true);
  };

  const moveSectionUp = async (sectionId: string) => {
    if (!site) return;
    const sections = [...site.sections];
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index > 0) {
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
      sections[index - 1].order = index - 1;
      sections[index].order = index;
      setSite({ ...site, sections });

      // Save to server
      await fetch('/api/sites/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sectionId, order: index - 1 }),
      });
    }
  };

  const moveSectionDown = async (sectionId: string) => {
    if (!site) return;
    const sections = [...site.sections];
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      sections[index].order = index;
      sections[index + 1].order = index + 1;
      setSite({ ...site, sections });

      // Save to server
      await fetch('/api/sites/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sectionId, order: index + 1 }),
      });
    }
  };

  const toggleSectionVisibility = async (sectionId: string) => {
    if (!site) return;
    const sections = site.sections.map((s) =>
      s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
    );
    setSite({ ...site, sections });

    const section = sections.find((s) => s.id === sectionId);
    await fetch('/api/sites/sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sectionId, isVisible: section?.isVisible }),
    });
  };

  const deleteSection = async (sectionId: string) => {
    if (!site || !confirm('Delete this section?')) return;

    const sections = site.sections.filter((s) => s.id !== sectionId);
    setSite({ ...site, sections });

    await fetch(`/api/sites/sections?id=${sectionId}`, {
      method: 'DELETE',
    });
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

  if (!site) {
    return null;
  }

  const tabs = [
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'domain', label: 'Domain', icon: Link },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/sites')}
            className="rounded-lg p-2 transition-colors hover:bg-white/5"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-semibold" style={{ color: 'var(--text)' }}>
              {site.siteName || 'My Website'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {site.subdomain}.cronkwaters.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <Check size={14} />
              {saveMessage}
            </span>
          )}

          <a
            href={`/s/${site.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            <Eye size={16} />
            Preview
            <ExternalLink size={12} />
          </a>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              background: hasChanges ? 'var(--accent)' : 'var(--bg)',
              color: hasChanges ? '#fff' : 'var(--muted)',
              border: hasChanges ? 'none' : '1px solid var(--border)',
            }}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              site.status === 'published'
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            {site.status === 'published' ? 'Published' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2 px-4 py-2"
        style={{
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl p-6">
        {activeTab === 'sections' && (
          <SectionsTab
            sections={site.sections}
            onMoveUp={moveSectionUp}
            onMoveDown={moveSectionDown}
            onToggleVisibility={toggleSectionVisibility}
            onDelete={deleteSection}
          />
        )}

        {activeTab === 'theme' && (
          <ThemeTab
            theme={(site.theme || {}) as Record<string, unknown>}
            templateId={site.templateId}
            onChange={(theme) => updateSite({ theme })}
          />
        )}

        {activeTab === 'domain' && <DomainSettings />}

        {activeTab === 'settings' && <SettingsTab site={site} onChange={updateSite} />}
      </div>
    </div>
  );
}

// Sections Tab Component
function SectionsTab({
  sections,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onDelete,
}: {
  sections: SiteSection[];
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sectionLabels: Record<string, string> = {
    header: 'Header',
    footer: 'Footer',
    hero_image: 'Hero Image',
    hero_video: 'Hero Video',
    music_player: 'Music Player',
    tour_dates: 'Tour Dates',
    bio_split: 'Bio (Split Layout)',
    bio_full: 'Bio (Full Width)',
    band_members: 'Band Members',
    achievements: 'Achievements',
    contact_form: 'Contact Form',
    mailing_list: 'Mailing List',
    social_links: 'Social Links',
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          Page Sections
        </h2>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          style={{
            background: 'var(--accent)',
            color: '#fff',
          }}
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      <div className="space-y-3">
        {sortedSections.map((section, index) => (
          <div
            key={section.id}
            className={`flex items-center justify-between rounded-xl p-4 transition-all ${
              section.isVisible ? '' : 'opacity-50'
            }`}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onMoveUp(section.id)}
                  disabled={index === 0}
                  className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                  style={{ color: 'var(--muted)' }}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => onMoveDown(section.id)}
                  disabled={index === sortedSections.length - 1}
                  className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                  style={{ color: 'var(--muted)' }}
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div>
                <h3 className="font-medium" style={{ color: 'var(--text)' }}>
                  {sectionLabels[section.type] || section.type}
                </h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {section.isVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleVisibility(section.id)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                style={{ color: section.isVisible ? 'var(--accent)' : 'var(--muted)' }}
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => onDelete(section.id)}
                className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Theme Tab Component
function ThemeTab({
  theme,
  templateId,
  onChange,
}: {
  theme: Record<string, unknown>;
  templateId: string;
  onChange: (theme: Record<string, unknown>) => void;
}) {
  const colorFields = [
    { key: 'primaryColor', label: 'Primary Color' },
    { key: 'secondaryColor', label: 'Secondary Color' },
    { key: 'accentColor', label: 'Accent Color' },
    { key: 'textColor', label: 'Text Color' },
    { key: 'mutedColor', label: 'Muted Text' },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--text)' }}>
        Theme Customization
      </h2>

      <div className="space-y-6">
        {/* Current Template */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Template
          </label>
          <p className="text-lg font-bold uppercase" style={{ color: 'var(--text)' }}>
            {templateId}
          </p>
        </div>

        {/* Colors */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
            Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(theme[key] as string) || '#000000'}
                    onChange={(e) => onChange({ ...theme, [key]: e.target.value })}
                    className="h-10 w-10 cursor-pointer rounded"
                  />
                  <input
                    type="text"
                    value={(theme[key] as string) || ''}
                    onChange={(e) => onChange({ ...theme, [key]: e.target.value })}
                    className="flex-1 rounded-lg px-3 py-2 text-sm"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
            Typography
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
                Heading Font
              </label>
              <input
                type="text"
                value={(theme.fontHeading as string) || ''}
                onChange={(e) => onChange({ ...theme, fontHeading: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                placeholder="Playfair Display"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
                Body Font
              </label>
              <input
                type="text"
                value={(theme.fontBody as string) || ''}
                onChange={(e) => onChange({ ...theme, fontBody: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                placeholder="Inter"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({
  site,
  onChange,
}: {
  site: Site;
  onChange: (updates: Partial<Site>) => void;
}) {
  const socialPlatforms = [
    'spotify',
    'apple',
    'youtube',
    'instagram',
    'twitter',
    'tiktok',
    'facebook',
    'bandcamp',
    'soundcloud',
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        Site Settings
      </h2>

      {/* Basic Info */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Site Name
            </label>
            <input
              type="text"
              value={site.siteName || ''}
              onChange={(e) => onChange({ siteName: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Your Band Name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Tagline
            </label>
            <input
              type="text"
              value={site.tagline || ''}
              onChange={(e) => onChange({ tagline: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Rock & Roll Since 2015"
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          SEO Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Page Title (for Google)
            </label>
            <input
              type="text"
              value={site.siteTitle || ''}
              onChange={(e) => onChange({ siteTitle: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Band Name | Official Website"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Meta Description
            </label>
            <textarea
              value={site.metaDescription || ''}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="A brief description for search engines..."
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          Social Links
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => (
            <div key={platform}>
              <label className="mb-2 block text-sm capitalize" style={{ color: 'var(--muted)' }}>
                {platform}
              </label>
              <input
                type="url"
                value={(site.socialLinks as Record<string, string>)?.[platform] || ''}
                onChange={(e) =>
                  onChange({
                    socialLinks: {
                      ...(site.socialLinks || {}),
                      [platform]: e.target.value,
                    },
                  })
                }
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Booking Email
            </label>
            <input
              type="email"
              value={site.bookingEmail || ''}
              onChange={(e) => onChange({ bookingEmail: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="booking@yourband.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Public Email
            </label>
            <input
              type="email"
              value={site.publicEmail || ''}
              onChange={(e) => onChange({ publicEmail: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="info@yourband.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteEditorPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      }
    >
      <SiteEditorContent />
    </Suspense>
  );
}
