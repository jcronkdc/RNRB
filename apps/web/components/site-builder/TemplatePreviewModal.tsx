'use client';

import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Sparkles,
  Play,
  Calendar,
  Mail,
  Music,
  Instagram,
  Twitter,
  Facebook,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'dark' | 'light';
  colors: {
    primary: string;
    accent: string;
    text: string;
    muted?: string;
    border?: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
}

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: Template | null;
  currentTemplateId: string;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceType, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

// Sample content for preview
const PREVIEW_CONTENT = {
  artistName: 'The Midnight Echoes',
  tagline: 'Rock & Soul Since 2018',
  bio: 'From the heart of Nashville to stages across the world, The Midnight Echoes blend classic rock energy with modern soul influences. Our sound is raw, authentic, and built for live performance.',
  tourDates: [
    { date: 'Dec 15', venue: 'The Ryman', city: 'Nashville, TN' },
    { date: 'Dec 18', venue: 'House of Blues', city: 'Chicago, IL' },
    { date: 'Dec 22', venue: 'The Fillmore', city: 'San Francisco, CA' },
  ],
  albums: [
    { title: 'Electric Dreams', year: '2024' },
    { title: 'Neon Nights', year: '2022' },
    { title: 'First Light', year: '2020' },
  ],
};

export function TemplatePreviewModal({
  isOpen,
  template,
  currentTemplateId,
  onClose,
  onSelect,
}: TemplatePreviewModalProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const isCurrentTemplate = template.id === currentTemplateId;
  const colors = {
    ...template.colors,
    muted: template.colors.muted || (template.category === 'dark' ? '#888888' : '#666666'),
    border: template.colors.border || (template.category === 'dark' ? '#333333' : '#e5e5e5'),
  };

  // Get fonts based on template
  const fonts = getTemplateFonts(template.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)' }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className={`relative flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: template.colors.primary }}
            >
              <div
                className="h-5 w-5 rounded-full"
                style={{ background: template.colors.accent }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {template.name}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {template.description}
              </p>
            </div>
            {isCurrentTemplate && (
              <span
                className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Check size={14} />
                Current
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Device Toggle */}
            <div
              className="flex rounded-lg p-1"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((d) => {
                const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`rounded-md p-2 transition-colors ${
                      device === d ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    style={{ color: device === d ? 'var(--accent)' : 'var(--muted)' }}
                    title={d.charAt(0).toUpperCase() + d.slice(1)}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>

            {/* Select Button */}
            {!isCurrentTemplate && (
              <button
                onClick={() => onSelect(template.id)}
                className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Sparkles size={16} />
                Use This Template
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              style={{ color: 'var(--muted)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
          {/* Device Frame */}
          <div
            className="h-full w-full overflow-hidden rounded-lg shadow-2xl transition-all duration-500"
            style={{
              maxWidth: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px',
              background: colors.primary,
              border: device !== 'desktop' ? '8px solid #1a1a1a' : 'none',
              borderRadius: device === 'mobile' ? '32px' : device === 'tablet' ? '24px' : '12px',
            }}
          >
            {/* Live Template Preview */}
            <div className="h-full overflow-y-auto" style={{ fontFamily: fonts.body }}>
              {/* Navigation Bar */}
              <nav
                className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md"
                style={{
                  background: `${colors.primary}ee`,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span
                  className="text-lg font-bold tracking-wider"
                  style={{ fontFamily: fonts.heading, color: colors.text }}
                >
                  {PREVIEW_CONTENT.artistName.toUpperCase()}
                </span>
                <div className="flex items-center gap-6">
                  {['Home', 'Music', 'Tour', 'About', 'Contact'].map((item) => (
                    <span
                      key={item}
                      className="cursor-pointer text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: colors.muted }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </nav>

              {/* Hero Section */}
              <section
                className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center"
                style={{
                  background: getHeroBackground(template.id, colors),
                }}
              >
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  {getDecorativeElements(template.id, colors)}
                </div>

                <div className="relative z-10">
                  <h1
                    className="mb-4 text-6xl font-bold tracking-tight"
                    style={{
                      fontFamily: fonts.heading,
                      color: colors.text,
                      textShadow:
                        template.category === 'dark' ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
                    }}
                  >
                    {PREVIEW_CONTENT.artistName}
                  </h1>
                  <p
                    className="mb-8 text-xl uppercase tracking-widest"
                    style={{ color: colors.accent }}
                  >
                    {PREVIEW_CONTENT.tagline}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      className="flex items-center gap-2 rounded-full px-8 py-3 font-semibold transition-all hover:scale-105"
                      style={{ background: colors.accent, color: colors.primary }}
                    >
                      <Play size={18} fill="currentColor" />
                      Listen Now
                    </button>
                    <button
                      className="flex items-center gap-2 rounded-full px-8 py-3 font-semibold transition-all hover:scale-105"
                      style={{
                        background: 'transparent',
                        color: colors.text,
                        border: `2px solid ${colors.text}`,
                      }}
                    >
                      <Calendar size={18} />
                      Tour Dates
                    </button>
                  </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                  <ChevronDown size={24} style={{ color: colors.muted }} />
                </div>
              </section>

              {/* Music Section */}
              <section className="px-6 py-16" style={{ background: colors.primary }}>
                <h2
                  className="mb-8 text-center text-3xl font-bold"
                  style={{ fontFamily: fonts.heading, color: colors.text }}
                >
                  Latest Releases
                </h2>
                <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6">
                  {PREVIEW_CONTENT.albums.map((album) => (
                    <div
                      key={album.title}
                      className="group overflow-hidden rounded-lg transition-all hover:scale-105"
                      style={{ background: colors.border }}
                    >
                      <div
                        className="aspect-square"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accent}40 0%, ${colors.primary} 100%)`,
                        }}
                      >
                        <div className="flex h-full items-center justify-center">
                          <Music size={48} style={{ color: colors.accent }} />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold" style={{ color: colors.text }}>
                          {album.title}
                        </h3>
                        <p className="text-sm" style={{ color: colors.muted }}>
                          {album.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tour Section */}
              <section
                className="px-6 py-16"
                style={{
                  background:
                    template.category === 'dark'
                      ? `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent}10 100%)`
                      : `linear-gradient(180deg, ${colors.accent}10 0%, ${colors.primary} 100%)`,
                }}
              >
                <h2
                  className="mb-8 text-center text-3xl font-bold"
                  style={{ fontFamily: fonts.heading, color: colors.text }}
                >
                  Upcoming Shows
                </h2>
                <div className="mx-auto max-w-2xl space-y-4">
                  {PREVIEW_CONTENT.tourDates.map((show) => (
                    <div
                      key={show.date}
                      className="flex items-center justify-between rounded-xl p-4 transition-all hover:scale-[1.02]"
                      style={{
                        background: `${colors.primary}`,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                          style={{ background: colors.accent }}
                        >
                          <span className="text-xs font-bold" style={{ color: colors.primary }}>
                            {show.date.split(' ')[0]}
                          </span>
                          <span className="text-lg font-bold" style={{ color: colors.primary }}>
                            {show.date.split(' ')[1]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: colors.text }}>
                            {show.venue}
                          </h3>
                          <p className="text-sm" style={{ color: colors.muted }}>
                            {show.city}
                          </p>
                        </div>
                      </div>
                      <button
                        className="rounded-full px-6 py-2 text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'transparent',
                          color: colors.accent,
                          border: `1px solid ${colors.accent}`,
                        }}
                      >
                        Tickets
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* About Section */}
              <section className="px-6 py-16" style={{ background: colors.primary }}>
                <div className="mx-auto max-w-3xl text-center">
                  <h2
                    className="mb-6 text-3xl font-bold"
                    style={{ fontFamily: fonts.heading, color: colors.text }}
                  >
                    About the Band
                  </h2>
                  <p className="text-lg leading-relaxed" style={{ color: colors.muted }}>
                    {PREVIEW_CONTENT.bio}
                  </p>
                </div>
              </section>

              {/* Newsletter Section */}
              <section
                className="px-6 py-16"
                style={{
                  background:
                    template.category === 'dark'
                      ? `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.primary} 100%)`
                      : colors.accent + '10',
                }}
              >
                <div className="mx-auto max-w-xl text-center">
                  <Mail size={32} style={{ color: colors.accent }} className="mx-auto mb-4" />
                  <h2
                    className="mb-4 text-2xl font-bold"
                    style={{ fontFamily: fonts.heading, color: colors.text }}
                  >
                    Stay in the Loop
                  </h2>
                  <p className="mb-6" style={{ color: colors.muted }}>
                    Get exclusive updates, early access to tickets, and behind-the-scenes content.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 rounded-full px-6 py-3"
                      style={{
                        background: colors.primary,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <button
                      className="rounded-full px-8 py-3 font-semibold"
                      style={{ background: colors.accent, color: colors.primary }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer
                className="px-6 py-12"
                style={{
                  background: colors.primary,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div className="mx-auto max-w-4xl">
                  <div className="mb-8 flex items-center justify-center gap-6">
                    {[Instagram, Twitter, Facebook].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="rounded-full p-3 transition-all hover:scale-110"
                        style={{ background: colors.border }}
                      >
                        <Icon size={20} style={{ color: colors.accent }} />
                      </a>
                    ))}
                  </div>
                  <p className="text-center text-sm" style={{ color: colors.muted }}>
                    © 2024 {PREVIEW_CONTENT.artistName}. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>

        {/* Footer with Template Info */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                Color Palette:
              </span>
              <div className="flex -space-x-1">
                {[colors.primary, colors.accent, colors.text].map((color, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2"
                    style={{ backgroundColor: color, borderColor: 'var(--bg)' }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {template.category === 'dark' ? '🌙 Dark Theme' : '☀️ Light Theme'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <ExternalLink size={14} />
            <span>Preview shows sample content</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for template-specific styling
function getTemplateFonts(templateId: string): { heading: string; body: string } {
  const fontMap: Record<string, { heading: string; body: string }> = {
    noir: { heading: "'Playfair Display', serif", body: "'Inter', sans-serif" },
    vinyl: { heading: "'Righteous', cursive", body: "'Lato', sans-serif" },
    neon: { heading: "'Orbitron', sans-serif", body: "'Rajdhani', sans-serif" },
    acoustic: { heading: "'Merriweather', serif", body: "'Source Sans Pro', sans-serif" },
    arena: { heading: "'Bebas Neue', sans-serif", body: "'Open Sans', sans-serif" },
    editorial: { heading: "'Cormorant Garamond', serif", body: "'Nunito Sans', sans-serif" },
    outlaw: { heading: "'Rye', cursive", body: "'Josefin Sans', sans-serif" },
    futura: { heading: "'Audiowide', cursive", body: "'Exo 2', sans-serif" },
  };
  return fontMap[templateId] || fontMap.noir;
}

function getHeroBackground(
  templateId: string,
  colors: { primary: string; accent: string }
): string {
  const backgrounds: Record<string, string> = {
    noir: `linear-gradient(180deg, ${colors.primary} 0%, #1a0000 100%)`,
    vinyl: `linear-gradient(135deg, ${colors.primary} 0%, #3d2914 100%)`,
    neon: `radial-gradient(ellipse at center, #0a0a0a 0%, ${colors.primary} 100%)`,
    acoustic: `linear-gradient(180deg, ${colors.primary} 0%, #e8e0d5 100%)`,
    arena: `linear-gradient(135deg, ${colors.primary} 0%, #2d1b3d 100%)`,
    editorial: `linear-gradient(180deg, ${colors.primary} 0%, #f5f5f5 100%)`,
    outlaw: `linear-gradient(180deg, ${colors.primary} 0%, #2a1f14 100%)`,
    futura: `linear-gradient(135deg, ${colors.primary} 0%, #1a1a1a 100%)`,
  };
  return backgrounds[templateId] || backgrounds.noir;
}

function getDecorativeElements(templateId: string, colors: { accent: string; text: string }) {
  switch (templateId) {
    case 'neon':
      return (
        <>
          <div
            className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-[120px]"
            style={{ background: colors.accent, opacity: 0.3 }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"
            style={{ background: '#ff00ff', opacity: 0.2 }}
          />
        </>
      );
    case 'arena':
      return (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at bottom, ${colors.accent}30 0%, transparent 70%)`,
          }}
        />
      );
    case 'vinyl':
      return (
        <div
          className="absolute right-10 top-10 h-48 w-48 rounded-full opacity-10"
          style={{ background: colors.text }}
        >
          <div className="absolute inset-4 rounded-full" style={{ background: colors.accent }} />
          <div className="absolute inset-[40%] rounded-full" style={{ background: colors.text }} />
        </div>
      );
    default:
      return null;
  }
}
