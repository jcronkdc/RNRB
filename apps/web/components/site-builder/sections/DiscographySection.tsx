'use client';

import { Play, Calendar, Disc, ChevronDown, ChevronUp } from '@/components/ui/custom-icons';
import { useState } from 'react';

interface Track {
  id: string;
  title: string;
  duration?: string;
  featuring?: string[];
  producers?: string[];
  spotifyUrl?: string;
  previewUrl?: string;
}

interface Release {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single' | 'compilation' | 'live';
  releaseDate: string;
  coverUrl?: string;
  tracks?: Track[];
  label?: string;
  description?: string;
  // Streaming links
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  bandcampUrl?: string;
  soundcloudUrl?: string;
  tidalUrl?: string;
  amazonUrl?: string;
  deezerUrl?: string;
}

interface DiscographySectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    releases?: Release[];
    showTrackLists?: boolean;
    filterByType?: boolean;
    sortOrder?: 'newest' | 'oldest';
  };
  theme?: Record<string, unknown>;
}

const RELEASE_TYPE_LABELS: Record<string, string> = {
  album: 'Album',
  ep: 'EP',
  single: 'Single',
  compilation: 'Compilation',
  live: 'Live',
};

const STREAMING_PLATFORMS = [
  { id: 'spotify', label: 'Spotify', color: '#1DB954' },
  { id: 'appleMusic', label: 'Apple Music', color: '#FA243C' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000' },
  { id: 'bandcamp', label: 'Bandcamp', color: '#629AA9' },
  { id: 'soundcloud', label: 'SoundCloud', color: '#FF5500' },
  { id: 'tidal', label: 'Tidal', color: '#000000' },
  { id: 'amazon', label: 'Amazon', color: '#FF9900' },
  { id: 'deezer', label: 'Deezer', color: '#FEAA2D' },
];

export function DiscographySection({ content, theme }: DiscographySectionProps) {
  const {
    headline = 'Discography',
    subheadline = 'Our complete catalog',
    releases = [],
    showTrackLists = true,
    filterByType = true,
    sortOrder = 'newest',
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [expandedRelease, setExpandedRelease] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Get unique release types
  const releaseTypes = [...new Set(releases.map((r) => r.type))];

  // Filter and sort releases
  let filteredReleases = activeFilter ? releases.filter((r) => r.type === activeFilter) : releases;

  filteredReleases = [...filteredReleases].sort((a, b) => {
    const dateA = new Date(a.releaseDate).getTime();
    const dateB = new Date(b.releaseDate).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getStreamingLinks = (release: Release) => {
    return STREAMING_PLATFORMS.filter((platform) => {
      const key = `${platform.id}Url` as keyof Release;
      return release[key];
    }).map((platform) => ({
      ...platform,
      url: release[`${platform.id}Url` as keyof Release] as string,
    }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        </div>

        {/* Filters */}
        {filterByType && releaseTypes.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                !activeFilter ? 'scale-105' : 'hover:bg-white/5'
              }`}
              style={{
                background: !activeFilter ? accentColor : 'var(--panel)',
                color: !activeFilter ? '#fff' : 'var(--text)',
              }}
            >
              All ({releases.length})
            </button>
            {releaseTypes.map((type) => {
              const count = releases.filter((r) => r.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeFilter === type ? 'scale-105' : 'hover:bg-white/5'
                  }`}
                  style={{
                    background: activeFilter === type ? accentColor : 'var(--panel)',
                    color: activeFilter === type ? '#fff' : 'var(--text)',
                  }}
                >
                  {RELEASE_TYPE_LABELS[type] || type} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Releases Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredReleases.map((release) => (
            <div
              key={release.id}
              className="group overflow-hidden rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              {/* Cover Art */}
              <div className="relative aspect-square overflow-hidden">
                {release.coverUrl ? (
                  <img
                    src={release.coverUrl}
                    alt={release.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: 'var(--bg)' }}
                  >
                    <Disc size={64} style={{ color: 'var(--muted)' }} />
                  </div>
                )}

                {/* Type Badge */}
                <div
                  className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  {RELEASE_TYPE_LABELS[release.type] || release.type}
                </div>

                {/* Play Overlay */}
                {release.spotifyUrl && (
                  <a
                    href={release.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full"
                      style={{ background: accentColor }}
                    >
                      <Play size={32} className="ml-1 text-white" />
                    </div>
                  </a>
                )}
              </div>

              {/* Release Info */}
              <div className="p-4">
                <h3 className="mb-1 text-lg font-bold" style={{ color: 'var(--text)' }}>
                  {release.title}
                </h3>
                <div
                  className="mb-3 flex items-center gap-2 text-sm"
                  style={{ color: 'var(--muted)' }}
                >
                  <Calendar size={14} />
                  {formatDate(release.releaseDate)}
                </div>

                {release.label && (
                  <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                    {release.label}
                  </p>
                )}

                {/* Streaming Links */}
                <div className="flex flex-wrap gap-2">
                  {getStreamingLinks(release)
                    .slice(0, 4)
                    .map((platform) => (
                      <a
                        key={platform.id}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg px-3 py-1.5 text-xs transition-colors hover:bg-white/10"
                        style={{ background: 'var(--bg)', color: 'var(--text)' }}
                      >
                        {platform.label}
                      </a>
                    ))}
                </div>

                {/* Track List Toggle */}
                {showTrackLists && release.tracks && release.tracks.length > 0 && (
                  <button
                    onClick={() =>
                      setExpandedRelease(expandedRelease === release.id ? null : release.id)
                    }
                    className="mt-4 flex w-full items-center justify-between rounded-lg p-2 text-sm transition-colors hover:bg-white/5"
                    style={{ color: 'var(--muted)' }}
                  >
                    <span>{release.tracks.length} tracks</span>
                    {expandedRelease === release.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}

                {/* Track List */}
                {showTrackLists &&
                  expandedRelease === release.id &&
                  release.tracks &&
                  release.tracks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {release.tracks.map((track, i) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 rounded-lg p-2 text-sm transition-colors hover:bg-white/5"
                        >
                          <span
                            className="w-6 text-center font-mono"
                            style={{ color: 'var(--muted)' }}
                          >
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="truncate" style={{ color: 'var(--text)' }}>
                              {track.title}
                            </span>
                            {track.featuring && track.featuring.length > 0 && (
                              <span style={{ color: 'var(--muted)' }}>
                                {' '}
                                ft. {track.featuring.join(', ')}
                              </span>
                            )}
                          </div>
                          {track.duration && (
                            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                              {track.duration}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReleases.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Disc size={48} className="mx-auto mb-4 opacity-50" />
            {activeFilter ? (
              <p>No {RELEASE_TYPE_LABELS[activeFilter] || activeFilter}s found</p>
            ) : (
              <p>No releases available yet</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
