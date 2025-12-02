'use client';

import {
  Music,
  Bell,
  Check,
  ExternalLink,
  Share2,
  Calendar,
  Play,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface PreSaveSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    // Release Info
    releaseName: string;
    releaseType?: 'album' | 'ep' | 'single';
    releaseDate?: string;
    coverImage?: string;
    previewUrl?: string;
    description?: string;
    // Pre-save Links
    smartLink?: string;
    spotifyUrl?: string;
    appleMusicUrl?: string;
    amazonUrl?: string;
    deezerUrl?: string;
    tidalUrl?: string;
    youtubeUrl?: string;
    soundcloudUrl?: string;
    bandcampUrl?: string;
    // Notifications
    showEmailNotify?: boolean;
    // Track List Preview
    trackList?: Array<{ title: string; featuring?: string; duration?: string }>;
  };
  theme?: Record<string, unknown>;
  siteId?: string;
}

const PLATFORMS = [
  { id: 'spotify', label: 'Spotify', color: '#1DB954', icon: '🎵' },
  { id: 'appleMusic', label: 'Apple Music', color: '#FA243C', icon: '🍎' },
  { id: 'amazon', label: 'Amazon Music', color: '#FF9900', icon: '📦' },
  { id: 'deezer', label: 'Deezer', color: '#FEAA2D', icon: '🎧' },
  { id: 'tidal', label: 'Tidal', color: '#000000', icon: '🌊' },
  { id: 'youtube', label: 'YouTube Music', color: '#FF0000', icon: '▶️' },
  { id: 'soundcloud', label: 'SoundCloud', color: '#FF5500', icon: '☁️' },
  { id: 'bandcamp', label: 'Bandcamp', color: '#629AA9', icon: '🎸' },
];

export function PreSaveSection({ content, theme, siteId }: PreSaveSectionProps) {
  const {
    headline = 'Pre-Save Now',
    subheadline = '',
    releaseName,
    releaseType = 'single',
    releaseDate = '',
    coverImage = '',
    previewUrl = '',
    description = '',
    smartLink = '',
    spotifyUrl = '',
    appleMusicUrl = '',
    amazonUrl = '',
    deezerUrl = '',
    tidalUrl = '',
    youtubeUrl = '',
    soundcloudUrl = '',
    bandcampUrl = '',
    showEmailNotify = true,
    trackList = [],
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const platformLinks = [
    { ...PLATFORMS[0], url: spotifyUrl },
    { ...PLATFORMS[1], url: appleMusicUrl },
    { ...PLATFORMS[2], url: amazonUrl },
    { ...PLATFORMS[3], url: deezerUrl },
    { ...PLATFORMS[4], url: tidalUrl },
    { ...PLATFORMS[5], url: youtubeUrl },
    { ...PLATFORMS[6], url: soundcloudUrl },
    { ...PLATFORMS[7], url: bandcampUrl },
  ].filter((p) => p.url);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch('/api/sites/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          email,
          source: 'presave',
          releaseName,
        }),
      });
      setIsSubscribed(true);
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  const handleShare = async () => {
    const url = smartLink || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pre-save ${releaseName}`,
          text: `Pre-save "${releaseName}" now!`,
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wider"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            New {releaseType}
          </span>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          {subheadline && (
            <p className="text-xl" style={{ color: 'var(--muted)' }}>
              {subheadline}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Cover Art */}
          <div className="mx-auto w-full max-w-sm md:mx-0 md:w-1/2">
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl">
              {coverImage ? (
                <img src={coverImage} alt={releaseName} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: 'var(--panel)' }}
                >
                  <Music size={64} style={{ color: 'var(--muted)' }} />
                </div>
              )}

              {/* Preview Button */}
              {previewUrl && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: accentColor }}
                  >
                    <Play size={32} className="ml-1 text-white" />
                  </div>
                </button>
              )}
            </div>

            {/* Release Date */}
            {releaseDate && (
              <div
                className="mt-4 flex items-center justify-center gap-2 rounded-xl p-3"
                style={{ background: 'var(--panel)' }}
              >
                <Calendar size={18} style={{ color: accentColor }} />
                <span style={{ color: 'var(--text)' }}>Out {formatDate(releaseDate)}</span>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex-1">
            {/* Release Name */}
            <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text)' }}>
              {releaseName}
            </h2>

            {description && (
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                {description}
              </p>
            )}

            {/* Smart Link */}
            {smartLink && (
              <a
                href={smartLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all hover:scale-[1.02]"
                style={{ background: accentColor, color: '#fff' }}
              >
                <Music size={20} />
                Pre-Save / Pre-Add
              </a>
            )}

            {/* Platform Links */}
            {platformLinks.length > 0 && !smartLink && (
              <div className="mb-6">
                <p className="mb-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Choose your platform
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {platformLinks.map((platform) => (
                    <a
                      key={platform.id}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.02]"
                      style={{ background: platform.color, color: '#fff' }}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <span className="font-medium">{platform.label}</span>
                      <ExternalLink size={16} className="ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Email Notify */}
            {showEmailNotify && (
              <div className="mb-6">
                {isSubscribed ? (
                  <div
                    className="flex items-center justify-center gap-2 rounded-xl p-4"
                    style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    <Check size={20} className="text-green-500" />
                    <span className="text-green-400">You&apos;ll be notified on release day!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe}>
                    <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                      Get notified when it drops
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-1 rounded-xl px-4 py-3"
                        style={{
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl px-4 py-3 font-medium"
                        style={{ background: 'var(--panel)', color: 'var(--text)' }}
                      >
                        <Bell size={18} />
                        Notify
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ background: 'var(--panel)', color: 'var(--text)' }}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Track List Preview */}
        {trackList.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-4 text-xl font-semibold" style={{ color: 'var(--text)' }}>
              Track List
            </h3>
            <div
              className="divide-y rounded-xl"
              style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
            >
              {trackList.map((track, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="w-8 text-center font-mono" style={{ color: 'var(--muted)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <span style={{ color: 'var(--text)' }}>{track.title}</span>
                    {track.featuring && (
                      <span style={{ color: 'var(--muted)' }}> ft. {track.featuring}</span>
                    )}
                  </div>
                  {track.duration && (
                    <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
                      {track.duration}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {isPlaying && previewUrl && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={previewUrl} autoPlay onEnded={() => setIsPlaying(false)} className="hidden" />
        )}
      </div>
    </section>
  );
}
