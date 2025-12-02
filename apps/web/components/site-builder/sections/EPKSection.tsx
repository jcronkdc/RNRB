'use client';

import {
  Download,
  FileText,
  Image,
  Music,
  Calendar,
  Mail,
  MapPin,
  Users,
  Mic,
  Loader2,
  Check,
  ExternalLink,
  Play,
  Share2,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface EPKSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    // Artist Info
    artistName?: string;
    genre?: string;
    location?: string;
    bio?: string;
    shortBio?: string;
    // Stats
    monthlyListeners?: string;
    socialFollowers?: string;
    showsPlayed?: string;
    // Media
    heroImage?: string;
    pressPhotos?: string[];
    logoUrl?: string;
    // Music
    topTracks?: Array<{ name: string; streams?: string; url?: string }>;
    latestRelease?: { name: string; type: string; date: string; coverUrl?: string };
    // Contact
    bookingEmail?: string;
    pressEmail?: string;
    managementName?: string;
    managementEmail?: string;
    // Social
    spotify?: string;
    instagram?: string;
    youtube?: string;
    // Press
    pressQuotes?: Array<{ quote: string; source: string }>;
    // Tech
    techRiderUrl?: string;
    stageplotUrl?: string;
    // PDF
    pdfDownloadUrl?: string;
  };
  theme?: Record<string, unknown>;
  siteId?: string;
}

export function EPKSection({ content, theme, siteId }: EPKSectionProps) {
  const {
    headline = 'Electronic Press Kit',
    subheadline = 'Everything you need to know',
    artistName = '',
    genre = '',
    location = '',
    bio = '',
    shortBio = '',
    monthlyListeners = '',
    socialFollowers = '',
    showsPlayed = '',
    heroImage = '',
    pressPhotos = [],
    logoUrl = '',
    topTracks = [],
    latestRelease,
    bookingEmail = '',
    pressEmail = '',
    managementName = '',
    managementEmail = '',
    spotify = '',
    instagram = '',
    youtube = '',
    pressQuotes = [],
    techRiderUrl = '',
    stageplotUrl = '',
    pdfDownloadUrl = '',
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/sites/epk/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, content }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${artistName || 'artist'}-epk.pdf`;
        a.click();
        setDownloadReady(true);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = [
    { label: 'Monthly Listeners', value: monthlyListeners, icon: Music },
    { label: 'Social Followers', value: socialFollowers, icon: Users },
    { label: 'Shows Played', value: showsPlayed, icon: Calendar },
  ].filter((s) => s.value);

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>

          {/* Download Button */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all hover:scale-105"
              style={{ background: accentColor, color: '#fff' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating PDF...
                </>
              ) : downloadReady ? (
                <>
                  <Check size={20} />
                  Download Again
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download Full EPK
                </>
              )}
            </button>
            {pdfDownloadUrl && (
              <a
                href={pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all hover:scale-105"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                <ExternalLink size={20} />
                View Online
              </a>
            )}
          </div>
        </div>

        {/* Hero Image */}
        {heroImage && (
          <div className="mb-12 overflow-hidden rounded-2xl">
            <img
              src={heroImage}
              alt={artistName}
              className="h-auto w-full object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}

        {/* Artist Info Card */}
        <div className="mb-12 rounded-2xl p-8" style={{ background: 'var(--panel)' }}>
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Logo */}
            {logoUrl && (
              <div className="flex-shrink-0">
                <img
                  src={logoUrl}
                  alt={`${artistName} logo`}
                  className="h-32 w-32 rounded-xl object-contain"
                  style={{ background: 'var(--bg)' }}
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h2 className="mb-2 text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {artistName}
              </h2>
              <div className="mb-4 flex flex-wrap gap-4" style={{ color: 'var(--muted)' }}>
                {genre && (
                  <span className="flex items-center gap-1">
                    <Music size={16} style={{ color: accentColor }} />
                    {genre}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={16} style={{ color: accentColor }} />
                    {location}
                  </span>
                )}
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text)' }}>
                {shortBio || bio?.substring(0, 300)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-xl p-6 text-center"
                style={{ background: 'var(--panel)' }}
              >
                <stat.icon size={32} className="mx-auto mb-3" style={{ color: accentColor }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Latest Release */}
            {latestRelease && (
              <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
                <h3
                  className="mb-4 flex items-center gap-2 text-xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Play size={20} style={{ color: accentColor }} />
                  Latest Release
                </h3>
                <div className="flex gap-4">
                  {latestRelease.coverUrl && (
                    <img
                      src={latestRelease.coverUrl}
                      alt={latestRelease.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>
                      {latestRelease.name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {latestRelease.type} • {latestRelease.date}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Tracks */}
            {topTracks.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
                <h3
                  className="mb-4 flex items-center gap-2 text-xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Music size={20} style={{ color: accentColor }} />
                  Top Tracks
                </h3>
                <div className="space-y-3">
                  {topTracks.map((track, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg p-3"
                      style={{ background: 'var(--bg)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
                          {i + 1}
                        </span>
                        <span style={{ color: 'var(--text)' }}>{track.name}</span>
                      </div>
                      {track.streams && (
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>
                          {track.streams} streams
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Press Quotes */}
            {pressQuotes.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
                <h3
                  className="mb-4 flex items-center gap-2 text-xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <FileText size={20} style={{ color: accentColor }} />
                  Press
                </h3>
                <div className="space-y-4">
                  {pressQuotes.map((item, i) => (
                    <blockquote
                      key={i}
                      className="border-l-2 pl-4"
                      style={{ borderColor: accentColor }}
                    >
                      <p className="italic" style={{ color: 'var(--text)' }}>
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <cite
                        className="mt-1 block text-sm not-italic"
                        style={{ color: 'var(--muted)' }}
                      >
                        — {item.source}
                      </cite>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Contact */}
            <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
              <h3
                className="mb-4 flex items-center gap-2 text-xl font-semibold"
                style={{ color: 'var(--text)' }}
              >
                <Mail size={20} style={{ color: accentColor }} />
                Contact
              </h3>
              <div className="space-y-4">
                {bookingEmail && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Booking
                    </p>
                    <a
                      href={`mailto:${bookingEmail}`}
                      style={{ color: accentColor }}
                      className="hover:underline"
                    >
                      {bookingEmail}
                    </a>
                  </div>
                )}
                {pressEmail && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Press
                    </p>
                    <a
                      href={`mailto:${pressEmail}`}
                      style={{ color: accentColor }}
                      className="hover:underline"
                    >
                      {pressEmail}
                    </a>
                  </div>
                )}
                {managementName && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Management
                    </p>
                    <p style={{ color: 'var(--text)' }}>{managementName}</p>
                    {managementEmail && (
                      <a
                        href={`mailto:${managementEmail}`}
                        style={{ color: accentColor }}
                        className="hover:underline"
                      >
                        {managementEmail}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
              <h3
                className="mb-4 flex items-center gap-2 text-xl font-semibold"
                style={{ color: 'var(--text)' }}
              >
                <Share2 size={20} style={{ color: accentColor }} />
                Connect
              </h3>
              <div className="flex flex-wrap gap-3">
                {spotify && (
                  <a
                    href={spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-4 py-2 transition-colors hover:bg-white/5"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    Spotify
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-4 py-2 transition-colors hover:bg-white/5"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    Instagram
                  </a>
                )}
                {youtube && (
                  <a
                    href={youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-4 py-2 transition-colors hover:bg-white/5"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Technical Documents */}
            {(techRiderUrl || stageplotUrl) && (
              <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
                <h3
                  className="mb-4 flex items-center gap-2 text-xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Mic size={20} style={{ color: accentColor }} />
                  Technical
                </h3>
                <div className="flex flex-wrap gap-3">
                  {techRiderUrl && (
                    <a
                      href={techRiderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-white/5"
                      style={{ background: 'var(--bg)', color: 'var(--text)' }}
                    >
                      <Download size={16} />
                      Tech Rider
                    </a>
                  )}
                  {stageplotUrl && (
                    <a
                      href={stageplotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-white/5"
                      style={{ background: 'var(--bg)', color: 'var(--text)' }}
                    >
                      <Download size={16} />
                      Stage Plot
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Press Photos */}
            {pressPhotos.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
                <h3
                  className="mb-4 flex items-center gap-2 text-xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Image size={20} style={{ color: accentColor }} />
                  Press Photos
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {pressPhotos.slice(0, 6).map((photo, i) => (
                    <a
                      key={i}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={photo}
                        alt={`Press ${i + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </a>
                  ))}
                </div>
                {pressPhotos.length > 6 && (
                  <p className="mt-3 text-center text-sm" style={{ color: 'var(--muted)' }}>
                    +{pressPhotos.length - 6} more in full EPK
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Full Bio */}
        {bio && (
          <div className="mt-12 rounded-xl p-8" style={{ background: 'var(--panel)' }}>
            <h3 className="mb-4 text-xl font-semibold" style={{ color: 'var(--text)' }}>
              Biography
            </h3>
            <div
              className="prose max-w-none leading-relaxed"
              style={{ color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: bio.replace(/\n/g, '<br/>') }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
