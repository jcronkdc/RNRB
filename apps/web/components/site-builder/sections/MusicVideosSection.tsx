'use client';

import { Play, X, Calendar, Eye, Grid, List, ExternalLink } from '@/components/ui/custom-icons';
import { useState } from 'react';

interface MusicVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  embedUrl?: string;
  platform: 'youtube' | 'vimeo' | 'custom';
  releaseDate?: string;
  viewCount?: number;
  duration?: string;
  type?: 'official' | 'lyric' | 'live' | 'behind_the_scenes' | 'visualizer';
  album?: string;
  featured?: boolean;
}

interface MusicVideosSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    videos?: MusicVideo[];
    showFilters?: boolean;
    defaultView?: 'grid' | 'list';
    autoplay?: boolean;
    featuredVideo?: string;
  };
  theme?: Record<string, unknown>;
}

const VIDEO_TYPE_LABELS: Record<string, string> = {
  official: 'Official Video',
  lyric: 'Lyric Video',
  live: 'Live Performance',
  behind_the_scenes: 'Behind the Scenes',
  visualizer: 'Visualizer',
};

export function MusicVideosSection({ content, theme }: MusicVideosSectionProps) {
  const {
    headline = 'Music Videos',
    subheadline = 'Watch our latest videos',
    videos = [],
    showFilters = true,
    defaultView = 'grid',
    autoplay = false,
    featuredVideo,
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [playingVideo, setPlayingVideo] = useState<MusicVideo | null>(null);

  // Get unique video types
  const videoTypes = [...new Set(videos.map((v) => v.type).filter(Boolean))];

  // Filter videos
  const filteredVideos = activeFilter ? videos.filter((v) => v.type === activeFilter) : videos;

  // Get featured video
  const featured = featuredVideo
    ? videos.find((v) => v.id === featuredVideo)
    : videos.find((v) => v.featured) || videos[0];

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEmbedUrl = (video: MusicVideo) => {
    if (video.embedUrl) return video.embedUrl;

    // Extract YouTube video ID and create embed URL
    if (video.platform === 'youtube') {
      const match = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}${autoplay ? '?autoplay=1' : ''}`;
      }
    }

    // Vimeo
    if (video.platform === 'vimeo') {
      const match = video.videoUrl.match(/vimeo\.com\/(\d+)/);
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}${autoplay ? '?autoplay=1' : ''}`;
      }
    }

    return video.videoUrl;
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

        {/* Featured Video */}
        {featured && (
          <div className="mb-12">
            <button
              type="button"
              className="group relative w-full cursor-pointer overflow-hidden rounded-2xl text-left"
              onClick={() => setPlayingVideo(featured)}
            >
              <div className="aspect-video">
                <img
                  src={featured.thumbnail}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/50">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{ background: accentColor }}
                >
                  <Play size={40} className="ml-1 text-white" />
                </div>
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center gap-2">
                  {featured.type && (
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: accentColor, color: '#fff' }}
                    >
                      {VIDEO_TYPE_LABELS[featured.type] || featured.type}
                    </span>
                  )}
                  {featured.featured && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      Featured
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white">{featured.title}</h2>
                <div className="mt-2 flex items-center gap-4 text-sm text-white/70">
                  {featured.releaseDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(featured.releaseDate)}
                    </span>
                  )}
                  {featured.viewCount && (
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {formatViewCount(featured.viewCount)} views
                    </span>
                  )}
                  {featured.duration && <span>{featured.duration}</span>}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Filters & View Toggle */}
        {(showFilters || videos.length > 4) && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            {showFilters && videoTypes.length > 1 && (
              <div className="flex flex-wrap gap-2">
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
                  All
                </button>
                {videoTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type || null)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeFilter === type ? 'scale-105' : 'hover:bg-white/5'
                    }`}
                    style={{
                      background: activeFilter === type ? accentColor : 'var(--panel)',
                      color: activeFilter === type ? '#fff' : 'var(--text)',
                    }}
                  >
                    {VIDEO_TYPE_LABELS[type || ''] || type}
                  </button>
                ))}
              </div>
            )}

            {/* View Toggle */}
            <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--panel)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'grid' ? '' : 'hover:bg-white/5'
                }`}
                style={{
                  background: viewMode === 'grid' ? accentColor : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : 'var(--muted)',
                }}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'list' ? '' : 'hover:bg-white/5'
                }`}
                style={{
                  background: viewMode === 'list' ? accentColor : 'transparent',
                  color: viewMode === 'list' ? '#fff' : 'var(--muted)',
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Video Grid */}
        {viewMode === 'grid' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos
              .filter((v) => v.id !== featured?.id)
              .map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className="group cursor-pointer overflow-hidden rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                  onClick={() => setPlayingVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{ background: accentColor }}
                      >
                        <Play size={28} className="ml-1 text-white" />
                      </div>
                    </div>

                    {/* Duration */}
                    {video.duration && (
                      <div
                        className="absolute bottom-2 right-2 rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                      >
                        {video.duration}
                      </div>
                    )}

                    {/* Type Badge */}
                    {video.type && (
                      <div
                        className="absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: accentColor, color: '#fff' }}
                      >
                        {VIDEO_TYPE_LABELS[video.type] || video.type}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className="mb-2 line-clamp-2 font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      {video.title}
                    </h3>
                    <div
                      className="flex items-center gap-3 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      {video.releaseDate && <span>{formatDate(video.releaseDate)}</span>}
                      {video.viewCount && (
                        <>
                          {video.releaseDate && <span>•</span>}
                          <span>{formatViewCount(video.viewCount)} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* Video List */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredVideos
              .filter((v) => v.id !== featured?.id)
              .map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className="group flex w-full cursor-pointer gap-4 overflow-hidden rounded-xl p-4 text-left transition-all hover:bg-white/5"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                  onClick={() => setPlayingVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-48 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                    {video.duration && (
                      <div
                        className="absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-xs"
                        style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                      >
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                        {video.title}
                      </h3>
                      {video.type && (
                        <span
                          className="rounded px-2 py-0.5 text-xs"
                          style={{ background: `${accentColor}20`, color: accentColor }}
                        >
                          {VIDEO_TYPE_LABELS[video.type] || video.type}
                        </span>
                      )}
                    </div>
                    {video.description && (
                      <p className="mt-1 line-clamp-2 text-sm" style={{ color: 'var(--muted)' }}>
                        {video.description}
                      </p>
                    )}
                    <div
                      className="mt-2 flex items-center gap-3 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      {video.releaseDate && <span>{formatDate(video.releaseDate)}</span>}
                      {video.viewCount && (
                        <>
                          {video.releaseDate && <span>•</span>}
                          <span>{formatViewCount(video.viewCount)} views</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Play Icon */}
                  <div className="flex items-center">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ background: accentColor }}
                    >
                      <Play size={20} className="ml-0.5 text-white" />
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Play size={48} className="mx-auto mb-4 opacity-50" />
            {activeFilter ? (
              <p>No {VIDEO_TYPE_LABELS[activeFilter] || activeFilter} videos found</p>
            ) : (
              <p>No videos available yet</p>
            )}
          </div>
        )}

        {/* Video Modal */}
        {playingVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            role="presentation"
            onClick={() => setPlayingVideo(null)}
          >
            <div
              className="relative w-full max-w-5xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="video-modal-title"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Escape' && setPlayingVideo(null)}
            >
              {/* Close Button */}
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute -right-2 -top-12 rounded-full p-2 text-white transition-colors hover:bg-white/10"
              >
                <X size={24} />
              </button>

              {/* Video Player */}
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={getEmbedUrl(playingVideo)}
                  title={`Video: ${playingVideo.title}`}
                  className="h-full w-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                />
              </div>

              {/* Video Info */}
              <div className="mt-4">
                <h2 id="video-modal-title" className="text-xl font-bold text-white">
                  {playingVideo.title}
                </h2>
                {playingVideo.description && (
                  <p className="mt-2 text-white/70">{playingVideo.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4">
                  <a
                    href={playingVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    <ExternalLink size={16} />
                    Watch on{' '}
                    {playingVideo.platform.charAt(0).toUpperCase() + playingVideo.platform.slice(1)}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
