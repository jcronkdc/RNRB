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
  Youtube,
  ChevronDown,
  MapPin,
  Ticket,
  Star,
} from '@/components/ui/custom-icons';
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
}

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: Template | null;
  currentTemplateId: string;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

// Sample content for preview
const PREVIEW_CONTENT = {
  artistName: 'The Midnight Echoes',
  tagline: 'Rock & Soul Since 2018',
  bio: 'From the heart of Nashville to stages across the world, The Midnight Echoes blend classic rock energy with modern soul influences. Our sound is raw, authentic, and built for live performance.',
  tourDates: [
    { date: 'Dec 15', venue: 'The Ryman Auditorium', city: 'Nashville, TN', soldOut: false },
    { date: 'Dec 18', venue: 'House of Blues', city: 'Chicago, IL', soldOut: true },
    { date: 'Dec 22', venue: 'The Fillmore', city: 'San Francisco, CA', soldOut: false },
  ],
  albums: [
    { title: 'Electric Dreams', year: '2024', tracks: 12 },
    { title: 'Neon Nights', year: '2022', tracks: 10 },
    { title: 'First Light', year: '2020', tracks: 8 },
  ],
  stats: { followers: '125K', streams: '2.4M', shows: '340+' },
};

// Template-specific configurations
const TEMPLATE_CONFIGS: Record<
  string,
  {
    fonts: { heading: string; body: string };
    heroStyle: string;
    decorations: string;
    buttonStyle: string;
    cardStyle: string;
  }
> = {
  noir: {
    fonts: { heading: "'Playfair Display', serif", body: "'Inter', sans-serif" },
    heroStyle: 'cinematic',
    decorations: 'film-grain',
    buttonStyle: 'sharp',
    cardStyle: 'glass',
  },
  vinyl: {
    fonts: { heading: "'Righteous', cursive", body: "'Lato', sans-serif" },
    heroStyle: 'retro',
    decorations: 'vinyl-grooves',
    buttonStyle: 'rounded',
    cardStyle: 'warm',
  },
  neon: {
    fonts: { heading: "'Orbitron', sans-serif", body: "'Rajdhani', sans-serif" },
    heroStyle: 'cyber',
    decorations: 'glow-lines',
    buttonStyle: 'neon-border',
    cardStyle: 'holographic',
  },
  acoustic: {
    fonts: { heading: "'Merriweather', serif", body: "'Source Sans Pro', sans-serif" },
    heroStyle: 'organic',
    decorations: 'leaves',
    buttonStyle: 'soft',
    cardStyle: 'paper',
  },
  arena: {
    fonts: { heading: "'Bebas Neue', sans-serif", body: "'Open Sans', sans-serif" },
    heroStyle: 'stadium',
    decorations: 'spotlights',
    buttonStyle: 'bold',
    cardStyle: 'elevated',
  },
  editorial: {
    fonts: { heading: "'Cormorant Garamond', serif", body: "'Nunito Sans', sans-serif" },
    heroStyle: 'minimal',
    decorations: 'geometric',
    buttonStyle: 'underline',
    cardStyle: 'bordered',
  },
  outlaw: {
    fonts: { heading: "'Rye', cursive", body: "'Josefin Sans', sans-serif" },
    heroStyle: 'western',
    decorations: 'dust',
    buttonStyle: 'rustic',
    cardStyle: 'weathered',
  },
  futura: {
    fonts: { heading: "'Audiowide', cursive", body: "'Exo 2', sans-serif" },
    heroStyle: 'chrome',
    decorations: 'grid',
    buttonStyle: 'metallic',
    cardStyle: 'chrome',
  },
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
    border: template.colors.border || (template.category === 'dark' ? '#333333' : '#e0e0e0'),
  };
  const config = TEMPLATE_CONFIGS[template.id] || TEMPLATE_CONFIGS.noir;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&family=Righteous&family=Lato:wght@400;700&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600&family=Merriweather:wght@400;700&family=Source+Sans+Pro:wght@400;600&family=Bebas+Neue&family=Open+Sans:wght@400;600&family=Cormorant+Garamond:wght@400;600;700&family=Nunito+Sans:wght@400;600&family=Rye&family=Josefin+Sans:wght@400;600&family=Audiowide&family=Exo+2:wght@400;500;600&display=swap');
      `}</style>

      {/* Modal Container */}
      <div
        className={`relative flex h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ background: '#0a0a0a', border: '1px solid #222' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #222' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: template.colors.primary, border: `2px solid ${colors.accent}` }}
            >
              <div
                className="h-6 w-6 rounded-full"
                style={{
                  background: template.colors.accent,
                  boxShadow: `0 0 20px ${template.colors.accent}60`,
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{template.name}</h2>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
            {isCurrentTemplate && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                <Check size={14} />
                Current Template
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Device Toggle */}
            <div className="flex rounded-lg bg-black/50 p-1" style={{ border: '1px solid #333' }}>
              {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((d) => {
                const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`rounded-md p-2 transition-all ${
                      device === d ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
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
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}cc 100%)`,
                  boxShadow: `0 4px 20px ${colors.accent}40`,
                }}
              >
                <Sparkles size={16} />
                Use This Template
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#111] p-6">
          {/* Device Frame */}
          <div
            className="h-full overflow-hidden shadow-2xl transition-all duration-500"
            style={{
              width: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px',
              maxWidth: '100%',
              borderRadius: device === 'mobile' ? '40px' : device === 'tablet' ? '24px' : '12px',
              border: device !== 'desktop' ? '8px solid #1a1a1a' : 'none',
              boxShadow: `0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px ${colors.accent}20`,
            }}
          >
            {/* Notch for mobile */}
            {device === 'mobile' && (
              <div className="absolute top-0 left-1/2 z-50 h-7 w-36 -translate-x-1/2 rounded-b-3xl bg-[#1a1a1a]" />
            )}

            {/* Live Template Preview */}
            <div
              className="h-full overflow-y-auto"
              style={{
                fontFamily: config.fonts.body,
                background: colors.primary,
                color: colors.text,
              }}
            >
              {/* ========== NAVIGATION ========== */}
              <nav
                className="sticky top-0 z-40"
                style={{
                  background: `${colors.primary}ee`,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                  <span
                    className="text-lg font-bold tracking-wider"
                    style={{ fontFamily: config.fonts.heading, color: colors.accent }}
                  >
                    {PREVIEW_CONTENT.artistName.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-8">
                    {['Music', 'Tour', 'About', 'Merch', 'Contact'].map((item) => (
                      <span
                        key={item}
                        className="cursor-pointer text-sm font-medium transition-colors hover:opacity-80"
                        style={{ color: colors.muted }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </nav>

              {/* ========== HERO SECTION - Template Specific ========== */}
              <section className="relative min-h-[80vh] overflow-hidden">
                {/* Animated Background Elements */}
                <TemplateBackground templateId={template.id} colors={colors} />

                {/* Hero Content */}
                <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
                  {/* Stats Bar */}
                  <div
                    className="mb-8 flex items-center gap-8 rounded-full px-8 py-3"
                    style={{
                      background: `${colors.primary}80`,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {Object.entries(PREVIEW_CONTENT.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div
                          className="text-lg font-bold"
                          style={{ fontFamily: config.fonts.heading, color: colors.accent }}
                        >
                          {value}
                        </div>
                        <div className="text-xs uppercase" style={{ color: colors.muted }}>
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Title */}
                  <h1
                    className="mb-4 text-7xl font-bold tracking-tight"
                    style={{
                      fontFamily: config.fonts.heading,
                      color: colors.text,
                      textShadow:
                        template.category === 'dark'
                          ? `0 0 80px ${colors.accent}40, 0 4px 30px rgba(0,0,0,0.8)`
                          : 'none',
                    }}
                  >
                    {PREVIEW_CONTENT.artistName}
                  </h1>

                  {/* Animated Tagline */}
                  <div className="relative mb-10">
                    <p
                      className="text-2xl font-medium tracking-[0.3em] uppercase"
                      style={{ color: colors.accent }}
                    >
                      {PREVIEW_CONTENT.tagline}
                    </p>
                    <div
                      className="mx-auto mt-4 h-0.5 w-24"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
                      }}
                    />
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-4">
                    <TemplateButton
                      templateId={template.id}
                      colors={colors}
                      primary
                      icon={<Play size={18} fill="currentColor" />}
                    >
                      Listen Now
                    </TemplateButton>
                    <TemplateButton
                      templateId={template.id}
                      colors={colors}
                      icon={<Calendar size={18} />}
                    >
                      Tour Dates
                    </TemplateButton>
                  </div>

                  {/* Scroll Indicator */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div
                      className="animate-bounce rounded-full p-2"
                      style={{ border: `1px solid ${colors.border}` }}
                    >
                      <ChevronDown size={20} style={{ color: colors.muted }} />
                    </div>
                  </div>
                </div>
              </section>

              {/* ========== MUSIC SECTION ========== */}
              <section className="relative px-6 py-20" style={{ background: colors.primary }}>
                <div className="mx-auto max-w-5xl">
                  <SectionHeader
                    title="Latest Releases"
                    subtitle="Stream everywhere"
                    colors={colors}
                    config={config}
                  />

                  <div className="grid grid-cols-3 gap-6">
                    {PREVIEW_CONTENT.albums.map((album, i) => (
                      <TemplateCard key={album.title} templateId={template.id} colors={colors}>
                        {/* Album Art */}
                        <div
                          className="relative aspect-square overflow-hidden rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${colors.accent}30 0%, ${colors.primary} 100%)`,
                          }}
                        >
                          {/* Vinyl/CD effect for certain templates */}
                          {template.id === 'vinyl' && (
                            <div
                              className="absolute inset-4 rounded-full"
                              style={{
                                background: `radial-gradient(circle, ${colors.primary} 30%, ${colors.accent}40 100%)`,
                                border: `2px solid ${colors.accent}60`,
                              }}
                            >
                              <div
                                className="absolute inset-[35%] rounded-full"
                                style={{ background: colors.accent }}
                              />
                            </div>
                          )}
                          {template.id !== 'vinyl' && (
                            <div className="flex h-full items-center justify-center">
                              <Music
                                size={48}
                                style={{ color: colors.accent }}
                                className="opacity-60"
                              />
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100"
                            style={{ background: `${colors.primary}90` }}
                          >
                            <Play size={48} fill={colors.accent} style={{ color: colors.accent }} />
                          </div>
                          {/* New badge for first album */}
                          {i === 0 && (
                            <div
                              className="absolute top-2 left-2 rounded-full px-3 py-1 text-xs font-bold"
                              style={{ background: colors.accent, color: colors.primary }}
                            >
                              NEW
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <h3
                            className="text-lg font-bold"
                            style={{ fontFamily: config.fonts.heading, color: colors.text }}
                          >
                            {album.title}
                          </h3>
                          <p className="text-sm" style={{ color: colors.muted }}>
                            {album.year} • {album.tracks} tracks
                          </p>
                        </div>
                      </TemplateCard>
                    ))}
                  </div>

                  {/* Streaming Links */}
                  <div className="mt-10 flex items-center justify-center gap-4">
                    {['Spotify', 'Apple Music', 'YouTube Music'].map((platform) => (
                      <div
                        key={platform}
                        className="flex items-center gap-2 rounded-full px-5 py-2 text-sm transition-all hover:scale-105"
                        style={{
                          background: `${colors.border}`,
                          color: colors.text,
                        }}
                      >
                        <Music size={14} />
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ========== TOUR SECTION ========== */}
              <section
                className="relative px-6 py-20"
                style={{
                  background:
                    template.category === 'dark'
                      ? `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent}08 50%, ${colors.primary} 100%)`
                      : `linear-gradient(180deg, ${colors.accent}08 0%, ${colors.primary} 100%)`,
                }}
              >
                <div className="mx-auto max-w-4xl">
                  <SectionHeader
                    title="On Tour Now"
                    subtitle="Catch us live"
                    colors={colors}
                    config={config}
                  />

                  <div className="space-y-4">
                    {PREVIEW_CONTENT.tourDates.map((show) => (
                      <TemplateCard
                        key={show.date}
                        templateId={template.id}
                        colors={colors}
                        className="flex items-center justify-between p-5"
                      >
                        {/* Date */}
                        <div className="flex items-center gap-6">
                          <div
                            className="flex h-16 w-16 flex-col items-center justify-center rounded-xl"
                            style={{
                              background: show.soldOut
                                ? `${colors.muted}40`
                                : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}cc 100%)`,
                            }}
                          >
                            <span
                              className="text-xs font-bold uppercase"
                              style={{ color: show.soldOut ? colors.muted : colors.primary }}
                            >
                              {show.date.split(' ')[0]}
                            </span>
                            <span
                              className="text-2xl font-bold"
                              style={{
                                fontFamily: config.fonts.heading,
                                color: show.soldOut ? colors.muted : colors.primary,
                              }}
                            >
                              {show.date.split(' ')[1]}
                            </span>
                          </div>

                          {/* Venue Info */}
                          <div>
                            <h3
                              className="text-lg font-semibold"
                              style={{ color: show.soldOut ? colors.muted : colors.text }}
                            >
                              {show.venue}
                            </h3>
                            <div
                              className="flex items-center gap-1 text-sm"
                              style={{ color: colors.muted }}
                            >
                              <MapPin size={12} />
                              {show.city}
                            </div>
                          </div>
                        </div>

                        {/* Ticket Button */}
                        {show.soldOut ? (
                          <span
                            className="rounded-full px-6 py-2 text-sm font-semibold"
                            style={{
                              background: `${colors.muted}20`,
                              color: colors.muted,
                            }}
                          >
                            SOLD OUT
                          </span>
                        ) : (
                          <button
                            className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition-all hover:scale-105"
                            style={{
                              background: 'transparent',
                              color: colors.accent,
                              border: `2px solid ${colors.accent}`,
                            }}
                          >
                            <Ticket size={14} />
                            Get Tickets
                          </button>
                        )}
                      </TemplateCard>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <button
                      className="text-sm font-medium underline underline-offset-4"
                      style={{ color: colors.accent }}
                    >
                      View All Dates →
                    </button>
                  </div>
                </div>
              </section>

              {/* ========== ABOUT SECTION ========== */}
              <section className="px-6 py-20" style={{ background: colors.primary }}>
                <div className="mx-auto max-w-4xl">
                  <div className="grid gap-12 md:grid-cols-2">
                    {/* Image placeholder */}
                    <div
                      className="aspect-4/5 rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.primary} 100%)`,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex h-full items-center justify-center">
                        <Star size={64} style={{ color: colors.accent }} className="opacity-30" />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col justify-center">
                      <h2
                        className="mb-6 text-4xl font-bold"
                        style={{ fontFamily: config.fonts.heading, color: colors.text }}
                      >
                        Our Story
                      </h2>
                      <p className="mb-6 text-lg leading-relaxed" style={{ color: colors.muted }}>
                        {PREVIEW_CONTENT.bio}
                      </p>
                      <p className="mb-8 leading-relaxed" style={{ color: colors.muted }}>
                        Every night on stage is a conversation with the audience. We don&apos;t just
                        play songs—we share moments. Join us on this journey.
                      </p>
                      <TemplateButton templateId={template.id} colors={colors}>
                        Read Full Bio
                      </TemplateButton>
                    </div>
                  </div>
                </div>
              </section>

              {/* ========== NEWSLETTER SECTION ========== */}
              <section
                className="px-6 py-20"
                style={{
                  background:
                    template.category === 'dark'
                      ? `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.primary} 100%)`
                      : `${colors.accent}10`,
                }}
              >
                <div className="mx-auto max-w-xl text-center">
                  <div
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: `${colors.accent}20`,
                      border: `1px solid ${colors.accent}40`,
                    }}
                  >
                    <Mail size={28} style={{ color: colors.accent }} />
                  </div>
                  <h2
                    className="mb-4 text-3xl font-bold"
                    style={{ fontFamily: config.fonts.heading, color: colors.text }}
                  >
                    Join the Inner Circle
                  </h2>
                  <p className="mb-8" style={{ color: colors.muted }}>
                    Exclusive updates, early access to tickets, behind-the-scenes content, and more.
                  </p>
                  <div
                    className="flex overflow-hidden rounded-full"
                    style={{
                      background: colors.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 bg-transparent px-6 py-4 outline-hidden"
                      style={{ color: colors.text }}
                    />
                    <button
                      className="px-8 py-4 font-semibold transition-all hover:opacity-90"
                      style={{ background: colors.accent, color: colors.primary }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </section>

              {/* ========== FOOTER ========== */}
              <footer
                className="px-6 py-16"
                style={{
                  background: colors.primary,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div className="mx-auto max-w-5xl">
                  {/* Social Links */}
                  <div className="mb-10 flex items-center justify-center gap-4">
                    {[Instagram, Twitter, Youtube].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-110"
                        style={{
                          background: colors.border,
                          color: colors.accent,
                        }}
                      >
                        <Icon size={20} />
                      </a>
                    ))}
                  </div>

                  {/* Logo */}
                  <div className="mb-6 text-center">
                    <span
                      className="text-2xl font-bold tracking-wider"
                      style={{ fontFamily: config.fonts.heading, color: colors.accent }}
                    >
                      {PREVIEW_CONTENT.artistName.toUpperCase()}
                    </span>
                  </div>

                  {/* Links */}
                  <div
                    className="mb-8 flex flex-wrap items-center justify-center gap-8 text-sm"
                    style={{ color: colors.muted }}
                  >
                    {['Privacy Policy', 'Terms of Service', 'Press Kit', 'Contact'].map((link) => (
                      <span
                        key={link}
                        className="cursor-pointer transition-colors hover:opacity-80"
                      >
                        {link}
                      </span>
                    ))}
                  </div>

                  {/* Copyright */}
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
          className="flex shrink-0 items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid #222', background: '#0a0a0a' }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Colors:</span>
              <div className="flex -space-x-1">
                {[colors.primary, colors.accent, colors.text].map((color, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-[#0a0a0a]"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {template.category === 'dark' ? '🌙 Dark Theme' : '☀️ Light Theme'}
            </span>
            <span className="text-sm text-gray-500">
              Font: {config.fonts.heading.split(',')[0].replace(/'/g, '')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Preview shows sample content • Your data will be different</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function SectionHeader({
  title,
  subtitle,
  colors,
  config,
}: {
  title: string;
  subtitle: string;
  colors: { text: string; accent: string; muted: string };
  config: { fonts: { heading: string } };
}) {
  return (
    <div className="mb-12 text-center">
      <h2
        className="mb-2 text-4xl font-bold"
        style={{ fontFamily: config.fonts.heading, color: colors.text }}
      >
        {title}
      </h2>
      <p className="text-lg" style={{ color: colors.muted }}>
        {subtitle}
      </p>
      <div className="mx-auto mt-4 h-1 w-16 rounded-full" style={{ background: colors.accent }} />
    </div>
  );
}

function TemplateButton({
  templateId,
  colors,
  primary,
  icon,
  children,
}: {
  templateId: string;
  colors: { accent: string; text: string; primary: string; border: string };
  primary?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const baseStyles =
    'flex items-center gap-2 rounded-full px-8 py-3 font-semibold transition-all hover:scale-105';

  if (primary) {
    return (
      <button
        className={baseStyles}
        style={{
          background:
            templateId === 'neon'
              ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}cc 100%)`
              : colors.accent,
          color: colors.primary,
          boxShadow: templateId === 'neon' ? `0 0 30px ${colors.accent}60` : 'none',
        }}
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <button
      className={baseStyles}
      style={{
        background: 'transparent',
        color: colors.text,
        border: `2px solid ${colors.border}`,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function TemplateCard({
  templateId,
  colors,
  className = '',
  children,
}: {
  templateId: string;
  colors: { primary: string; border: string; accent: string };
  className?: string;
  children: React.ReactNode;
}) {
  const cardStyles: React.CSSProperties = {
    background: colors.primary,
    border: `1px solid ${colors.border}`,
    borderRadius: templateId === 'arena' ? '16px' : templateId === 'editorial' ? '0' : '12px',
  };

  // Template-specific enhancements
  if (templateId === 'neon') {
    cardStyles.boxShadow = `0 0 20px ${colors.accent}10, inset 0 0 20px ${colors.accent}05`;
  }
  if (templateId === 'arena') {
    cardStyles.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
  }

  return (
    <div
      className={`overflow-hidden transition-all hover:scale-[1.02] ${className}`}
      style={cardStyles}
    >
      {children}
    </div>
  );
}

function TemplateBackground({
  templateId,
  colors,
}: {
  templateId: string;
  colors: { accent: string; primary: string; text: string };
}) {
  // Base gradient
  const baseGradient = (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse at center top, ${colors.accent}15 0%, transparent 60%)`,
      }}
    />
  );

  switch (templateId) {
    case 'noir':
      return (
        <>
          {baseGradient}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          <div
            className="absolute top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full blur-[150px]"
            style={{ background: colors.accent, opacity: 0.1 }}
          />
        </>
      );

    case 'neon':
      return (
        <>
          <div className="absolute inset-0" style={{ background: '#000' }} />
          <div
            className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[150px]"
            style={{ background: colors.accent, opacity: 0.4 }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full blur-[120px]"
            style={{ background: '#ff00ff', opacity: 0.3 }}
          />
          <div
            className="absolute bottom-1/3 left-1/3 h-48 w-48 rounded-full blur-[100px]"
            style={{ background: '#00ff00', opacity: 0.2 }}
          />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(${colors.accent}20 1px, transparent 1px), linear-gradient(90deg, ${colors.accent}20 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </>
      );

    case 'arena':
      return (
        <>
          {baseGradient}
          {/* Stadium lights effect */}
          <div
            className="absolute top-0 left-1/4 h-[500px] w-[300px] opacity-30"
            style={{
              background: `linear-gradient(180deg, ${colors.accent} 0%, transparent 100%)`,
              transform: 'rotate(-15deg)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute top-0 right-1/4 h-[500px] w-[300px] opacity-30"
            style={{
              background: `linear-gradient(180deg, ${colors.accent} 0%, transparent 100%)`,
              transform: 'rotate(15deg)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background: `radial-gradient(ellipse at bottom, ${colors.accent}20 0%, transparent 70%)`,
            }}
          />
        </>
      );

    case 'vinyl':
      return (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, #1a0f08 100%)`,
            }}
          />
          {/* Vinyl record decoration */}
          <div
            className="absolute top-20 -right-20 h-80 w-80 rounded-full opacity-20"
            style={{ border: `40px solid ${colors.accent}` }}
          >
            <div className="absolute inset-8 rounded-full" style={{ background: colors.primary }} />
            <div
              className="absolute inset-[35%] rounded-full"
              style={{ background: colors.accent }}
            />
          </div>
          <div
            className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full blur-[100px]"
            style={{ background: colors.accent, opacity: 0.2 }}
          />
        </>
      );

    case 'acoustic':
      return (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${colors.primary} 0%, #e8e0d5 100%)`,
            }}
          />
          {/* Soft organic shapes */}
          <div
            className="absolute top-0 right-0 h-full w-1/2 opacity-10"
            style={{
              background: `radial-gradient(ellipse at right top, ${colors.accent} 0%, transparent 70%)`,
            }}
          />
        </>
      );

    case 'editorial':
      return (
        <>
          <div className="absolute inset-0" style={{ background: colors.primary }} />
          {/* Minimal geometric shapes */}
          <div
            className="absolute top-20 right-20 h-40 w-40 rotate-45 opacity-10"
            style={{ border: `2px solid ${colors.text}` }}
          />
          <div
            className="absolute bottom-40 left-20 h-20 w-20 rounded-full opacity-10"
            style={{ background: colors.text }}
          />
        </>
      );

    case 'outlaw':
      return (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${colors.primary} 0%, #1a1410 100%)`,
            }}
          />
          {/* Dust particles effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, ${colors.accent} 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at bottom, ${colors.accent}20 0%, transparent 50%)`,
            }}
          />
        </>
      );

    case 'futura':
      return (
        <>
          <div className="absolute inset-0" style={{ background: '#0a0a0a' }} />
          {/* Chrome/metallic gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, transparent 0%, ${colors.accent}10 50%, transparent 100%)`,
            }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(${colors.accent} 1px, transparent 1px), linear-gradient(90deg, ${colors.accent} 1px, transparent 1px)`,
              backgroundSize: '100px 100px',
            }}
          />
          <div
            className="absolute right-0 bottom-0 left-0 h-1/2"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${colors.accent}10 100%)`,
            }}
          />
        </>
      );

    default:
      return baseGradient;
  }
}
