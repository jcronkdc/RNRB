'use client';

import { Music, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface StreamingLink {
  platform: string;
  url: string;
  embedId?: string;
}

interface StreamingSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    links?: StreamingLink[];
    featuredEmbed?: {
      platform: 'spotify' | 'apple' | 'soundcloud' | 'bandcamp';
      embedUrl: string;
      embedType: 'track' | 'album' | 'playlist' | 'artist';
    };
    layout?: 'featured' | 'grid' | 'list';
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

const platformConfig: Record<
  string,
  { name: string; color: string; icon: string; embedHeight: Record<string, number> }
> = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    icon: '🎵',
    embedHeight: { track: 152, album: 352, playlist: 380, artist: 352 },
  },
  apple: {
    name: 'Apple Music',
    color: '#FA243C',
    icon: '🍎',
    embedHeight: { track: 175, album: 450, playlist: 450, artist: 450 },
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF5500',
    icon: '☁️',
    embedHeight: { track: 166, album: 400, playlist: 400, artist: 400 },
  },
  bandcamp: {
    name: 'Bandcamp',
    color: '#629AA9',
    icon: '🎸',
    embedHeight: { track: 120, album: 470, playlist: 470, artist: 470 },
  },
  youtube: {
    name: 'YouTube Music',
    color: '#FF0000',
    icon: '▶️',
    embedHeight: { track: 315, album: 315, playlist: 315, artist: 315 },
  },
  tidal: {
    name: 'Tidal',
    color: '#000000',
    icon: '🌊',
    embedHeight: { track: 150, album: 350, playlist: 350, artist: 350 },
  },
};

// Helper to extract embed URL from regular URL
function getSpotifyEmbedUrl(url: string): string | null {
  // Match spotify URLs like:
  // https://open.spotify.com/track/xxx
  // https://open.spotify.com/album/xxx
  // https://open.spotify.com/playlist/xxx
  const match = url.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  return null;
}

function getAppleMusicEmbedUrl(url: string): string | null {
  // Match Apple Music URLs and convert to embed format
  // https://music.apple.com/us/album/xxx
  const match = url.match(/music\.apple\.com\/([a-z]{2})\/(album|playlist|artist)\/[^\/]+\/(\d+)/);
  if (match) {
    return `https://embed.music.apple.com/${match[1]}/${match[2]}/${match[3]}`;
  }
  return null;
}

function getSoundCloudEmbedUrl(url: string): string | null {
  // SoundCloud uses their own embed API, need to fetch oembed
  // For now return a basic embed URL structure
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
  }
  return null;
}

export function StreamingSection({ content, styles }: StreamingSectionProps) {
  const {
    title = 'Listen Now',
    subtitle = 'Stream on your favorite platform',
    links = [],
    featuredEmbed,
    layout = 'featured',
  } = content;

  const bgColor = styles?.backgroundColor || 'transparent';
  const textColor = styles?.textColor || 'var(--text)';
  const accentColor = styles?.accentColor || 'var(--accent)';

  // Generate embed URL if not provided
  const getEmbedUrl = (platform: string, url: string): string | null => {
    switch (platform) {
      case 'spotify':
        return getSpotifyEmbedUrl(url);
      case 'apple':
        return getAppleMusicEmbedUrl(url);
      case 'soundcloud':
        return getSoundCloudEmbedUrl(url);
      default:
        return null;
    }
  };

  return (
    <section className="px-4 py-16 md:px-8 lg:py-24" style={{ background: bgColor }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
            style={{ color: textColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg opacity-70" style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Featured Embed */}
        {featuredEmbed && layout === 'featured' && (
          <div className="mb-12">
            <div
              className="mx-auto max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              {featuredEmbed.platform === 'spotify' && (
                <iframe
                  src={featuredEmbed.embedUrl}
                  width="100%"
                  height={platformConfig.spotify.embedHeight[featuredEmbed.embedType]}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                />
              )}
              {featuredEmbed.platform === 'apple' && (
                <iframe
                  src={featuredEmbed.embedUrl}
                  width="100%"
                  height={platformConfig.apple.embedHeight[featuredEmbed.embedType]}
                  frameBorder="0"
                  allow="autoplay *; encrypted-media *; fullscreen *"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  loading="lazy"
                  className="rounded-xl"
                />
              )}
              {featuredEmbed.platform === 'soundcloud' && (
                <iframe
                  src={featuredEmbed.embedUrl}
                  width="100%"
                  height={platformConfig.soundcloud.embedHeight[featuredEmbed.embedType]}
                  frameBorder="0"
                  allow="autoplay"
                  loading="lazy"
                  className="rounded-xl"
                />
              )}
            </div>
          </div>
        )}

        {/* Streaming Platform Links */}
        {links.length > 0 && (
          <div
            className={`grid gap-4 ${
              layout === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'mx-auto max-w-xl grid-cols-1'
            }`}
          >
            {links.map((link, index) => {
              const platform = platformConfig[link.platform] || {
                name: link.platform,
                color: accentColor,
                icon: '🎵',
              };

              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.02]"
                  style={{
                    background: `${platform.color}20`,
                    border: `1px solid ${platform.color}40`,
                  }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                    style={{ background: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold" style={{ color: textColor }}>
                      {platform.name}
                    </span>
                    <p className="text-sm opacity-60" style={{ color: textColor }}>
                      Listen now
                    </p>
                  </div>
                  <ExternalLink
                    size={18}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: platform.color }}
                  />
                </a>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {links.length === 0 && !featuredEmbed && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-12"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '2px dashed rgba(255,255,255,0.2)',
            }}
          >
            <Music size={48} className="mb-4 opacity-40" style={{ color: textColor }} />
            <p className="font-medium" style={{ color: textColor }}>
              Add streaming links to your music
            </p>
            <p className="text-sm opacity-60" style={{ color: textColor }}>
              Connect Spotify, Apple Music, SoundCloud & more
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Editor component for the section
export function StreamingSectionEditor({
  content,
  onChange,
}: {
  content: StreamingSectionProps['content'];
  onChange: (content: StreamingSectionProps['content']) => void;
}) {
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkPlatform, setNewLinkPlatform] = useState('spotify');

  const addLink = () => {
    if (!newLinkUrl.trim()) return;

    const newLinks = [
      ...(content.links || []),
      { platform: newLinkPlatform, url: newLinkUrl.trim() },
    ];
    onChange({ ...content, links: newLinks });
    setNewLinkUrl('');
  };

  const removeLink = (index: number) => {
    const newLinks = (content.links || []).filter((_, i) => i !== index);
    onChange({ ...content, links: newLinks });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Section Title
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="Listen Now"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Subtitle
        </label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="Stream on your favorite platform"
        />
      </div>

      {/* Featured Embed */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Featured Embed URL
        </label>
        <div className="flex gap-2">
          <select
            value={content.featuredEmbed?.platform || 'spotify'}
            onChange={(e) =>
              onChange({
                ...content,
                featuredEmbed: {
                  ...content.featuredEmbed,
                  platform: e.target.value as 'spotify' | 'apple' | 'soundcloud' | 'bandcamp',
                  embedUrl: content.featuredEmbed?.embedUrl || '',
                  embedType: content.featuredEmbed?.embedType || 'album',
                },
              })
            }
            className="rounded-lg px-3 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            <option value="spotify">Spotify</option>
            <option value="apple">Apple Music</option>
            <option value="soundcloud">SoundCloud</option>
          </select>
          <input
            type="text"
            value={content.featuredEmbed?.embedUrl || ''}
            onChange={(e) =>
              onChange({
                ...content,
                featuredEmbed: {
                  platform: content.featuredEmbed?.platform || 'spotify',
                  embedUrl: e.target.value,
                  embedType: content.featuredEmbed?.embedType || 'album',
                },
              })
            }
            className="flex-1 rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="Paste Spotify/Apple Music embed URL"
          />
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          Tip: Go to Spotify → Share → Embed → Copy embed code, then paste the URL
        </p>
      </div>

      {/* Add New Link */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Add Streaming Link
        </label>
        <div className="flex gap-2">
          <select
            value={newLinkPlatform}
            onChange={(e) => setNewLinkPlatform(e.target.value)}
            className="rounded-lg px-3 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {Object.entries(platformConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="https://open.spotify.com/artist/..."
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <button
            onClick={addLink}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Current Links */}
      {(content.links || []).length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Current Links
          </label>
          <div className="space-y-2">
            {(content.links || []).map((link, index) => {
              const platform = platformConfig[link.platform];
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg p-3"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <span className="text-xl">{platform?.icon || '🎵'}</span>
                  <span className="flex-1 truncate text-sm" style={{ color: 'var(--text)' }}>
                    {link.url}
                  </span>
                  <button
                    onClick={() => removeLink(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Layout */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Layout
        </label>
        <div className="flex gap-2">
          {(['featured', 'grid', 'list'] as const).map((layoutOption) => (
            <button
              key={layoutOption}
              onClick={() => onChange({ ...content, layout: layoutOption })}
              className={`rounded-lg px-4 py-2 capitalize ${
                content.layout === layoutOption ? 'ring-2 ring-[var(--accent)]' : ''
              }`}
              style={{
                background: content.layout === layoutOption ? 'var(--accent)' : 'var(--bg)',
                color: content.layout === layoutOption ? '#fff' : 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              {layoutOption}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
