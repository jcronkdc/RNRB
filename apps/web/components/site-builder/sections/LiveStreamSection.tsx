'use client';

import {
  Play,
  Radio,
  Calendar,
  Bell,
  BellOff,
  ExternalLink,
  Youtube,
  Users,
  MessageSquare,
  Share2,
  Check,
} from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  platform: 'youtube' | 'twitch' | 'instagram' | 'facebook' | 'custom';
  embedUrl?: string;
  externalUrl?: string;
  thumbnail?: string;
  scheduledDate?: string;
  isLive?: boolean;
  viewerCount?: number;
  chatEnabled?: boolean;
}

interface PastStream {
  id: string;
  title: string;
  date: string;
  platform: string;
  watchUrl: string;
  thumbnail?: string;
  duration?: string;
  viewCount?: number;
}

interface LiveStreamSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    currentStream?: LiveStream;
    upcomingStreams?: LiveStream[];
    pastStreams?: PastStream[];
    showChat?: boolean;
    showNotifyButton?: boolean;
    showPastStreams?: boolean;
    maxPastStreams?: number;
    // Social
    twitchChannel?: string;
    youtubeChannel?: string;
    instagramHandle?: string;
  };
  theme?: Record<string, unknown>;
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  twitch: '#9146FF',
  instagram: '#E4405F',
  facebook: '#1877F2',
  custom: '#f97316',
};

export function LiveStreamSection({ content, theme }: LiveStreamSectionProps) {
  const {
    headline = 'Live',
    subheadline = 'Watch live performances and exclusive streams',
    currentStream,
    upcomingStreams = [],
    pastStreams = [],
    showChat = true,
    showNotifyButton = true,
    showPastStreams = true,
    maxPastStreams = 6,
    twitchChannel = '',
    youtubeChannel = '',
    instagramHandle = '',
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [isNotified, setIsNotified] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<Record<string, string>>({});

  // Countdown timer for upcoming streams
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {};

      upcomingStreams.forEach((stream) => {
        if (stream.scheduledDate) {
          const diff = new Date(stream.scheduledDate).getTime() - Date.now();
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
              newCountdowns[stream.id] = `${days}d ${hours}h`;
            } else if (hours > 0) {
              newCountdowns[stream.id] = `${hours}h ${minutes}m`;
            } else {
              newCountdowns[stream.id] = `${minutes}m`;
            }
          } else {
            newCountdowns[stream.id] = 'Starting soon';
          }
        }
      });

      setCountdown(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [upcomingStreams]);

  const handleNotify = (streamId: string) => {
    setIsNotified((prev) => ({ ...prev, [streamId]: !prev[streamId] }));
    // In production, this would trigger a notification subscription
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: headline, url });
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPlatformColor = (platform: string) => {
    return PLATFORM_COLORS[platform] || accentColor;
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

        {/* Current Live Stream */}
        {currentStream && currentStream.isLive && (
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
                <span className="font-semibold text-red-500">LIVE NOW</span>
              </div>
              {currentStream.viewerCount && (
                <span className="flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                  <Users size={16} />
                  {currentStream.viewerCount.toLocaleString()} watching
                </span>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Video Player */}
              <div className="lg:col-span-2">
                <div
                  className="aspect-video overflow-hidden rounded-xl"
                  style={{ background: '#000' }}
                >
                  {currentStream.embedUrl ? (
                    <iframe
                      src={currentStream.embedUrl}
                      title={`Live stream: ${currentStream.title}`}
                      className="h-full w-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                    />
                  ) : currentStream.thumbnail ? (
                    <img
                      src={currentStream.thumbnail}
                      alt={currentStream.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Radio size={64} style={{ color: 'var(--muted)' }} />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {currentStream.title}
                  </h2>
                  {currentStream.description && (
                    <p className="mt-2" style={{ color: 'var(--muted)' }}>
                      {currentStream.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {currentStream.externalUrl && (
                      <a
                        href={currentStream.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-white/10"
                        style={{
                          background: getPlatformColor(currentStream.platform),
                          color: '#fff',
                        }}
                      >
                        <ExternalLink size={16} />
                        Watch on{' '}
                        {currentStream.platform.charAt(0).toUpperCase() +
                          currentStream.platform.slice(1)}
                      </a>
                    )}
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-white/10"
                      style={{ background: 'var(--panel)', color: 'var(--text)' }}
                    >
                      {copied ? <Check size={16} /> : <Share2 size={16} />}
                      {copied ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat */}
              {showChat && currentStream.chatEnabled && (
                <div
                  className="flex flex-col rounded-xl"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="flex items-center gap-2 border-b p-4"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <MessageSquare size={18} style={{ color: accentColor }} />
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      Live Chat
                    </span>
                  </div>
                  <div className="flex-1 p-4" style={{ minHeight: '300px' }}>
                    <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
                      Chat is available on the stream platform
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Streams */}
        {upcomingStreams.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Upcoming Streams
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="overflow-hidden rounded-xl"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video">
                    {stream.thumbnail ? (
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{ background: 'var(--bg)' }}
                      >
                        <Radio size={48} style={{ color: 'var(--muted)' }} />
                      </div>
                    )}

                    {/* Countdown Badge */}
                    {countdown[stream.id] && (
                      <div
                        className="absolute top-3 right-3 rounded-lg px-3 py-1 text-sm font-semibold"
                        style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                      >
                        {countdown[stream.id]}
                      </div>
                    )}

                    {/* Platform Badge */}
                    <div
                      className="absolute top-3 left-3 rounded-lg px-2 py-1 text-xs font-semibold"
                      style={{ background: getPlatformColor(stream.platform), color: '#fff' }}
                    >
                      {stream.platform.charAt(0).toUpperCase() + stream.platform.slice(1)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>
                      {stream.title}
                    </h3>
                    {stream.scheduledDate && (
                      <div
                        className="mb-3 flex items-center gap-2 text-sm"
                        style={{ color: 'var(--muted)' }}
                      >
                        <Calendar size={14} />
                        {formatDate(stream.scheduledDate)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {showNotifyButton && (
                        <button
                          onClick={() => handleNotify(stream.id)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                            isNotified[stream.id] ? 'bg-green-500/20 text-green-400' : ''
                          }`}
                          style={{
                            background: isNotified[stream.id] ? undefined : 'var(--bg)',
                            color: isNotified[stream.id] ? undefined : 'var(--text)',
                          }}
                        >
                          {isNotified[stream.id] ? (
                            <>
                              <BellOff size={14} />
                              Notified
                            </>
                          ) : (
                            <>
                              <Bell size={14} />
                              Notify Me
                            </>
                          )}
                        </button>
                      )}
                      {stream.externalUrl && (
                        <a
                          href={stream.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center rounded-lg px-4 py-2"
                          style={{ background: 'var(--bg)', color: 'var(--text)' }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Streams */}
        {showPastStreams && pastStreams.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Past Streams
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastStreams.slice(0, maxPastStreams).map((stream) => (
                <a
                  key={stream.id}
                  href={stream.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video">
                    {stream.thumbnail ? (
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{ background: 'var(--bg)' }}
                      >
                        <Play size={48} style={{ color: 'var(--muted)' }} />
                      </div>
                    )}

                    {/* Duration */}
                    {stream.duration && (
                      <div
                        className="absolute right-2 bottom-2 rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                      >
                        {stream.duration}
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{ background: accentColor }}
                      >
                        <Play size={28} className="ml-1 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className="mb-2 line-clamp-2 font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      {stream.title}
                    </h3>
                    <div
                      className="flex items-center gap-3 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      <span>{stream.date}</span>
                      {stream.viewCount && (
                        <>
                          <span>•</span>
                          <span>{stream.viewCount.toLocaleString()} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Follow Links */}
        {(twitchChannel || youtubeChannel || instagramHandle) && (
          <div className="mt-12 text-center">
            <p className="mb-4" style={{ color: 'var(--muted)' }}>
              Follow to never miss a stream
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {youtubeChannel && (
                <a
                  href={youtubeChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                  style={{ background: PLATFORM_COLORS.youtube, color: '#fff' }}
                >
                  <Youtube size={20} />
                  Subscribe on YouTube
                </a>
              )}
              {twitchChannel && (
                <a
                  href={twitchChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                  style={{ background: PLATFORM_COLORS.twitch, color: '#fff' }}
                >
                  Follow on Twitch
                </a>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!currentStream && upcomingStreams.length === 0 && pastStreams.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Radio size={48} className="mx-auto mb-4 opacity-50" />
            <p>No streams scheduled yet</p>
            <p className="text-sm">Check back soon for upcoming live events</p>
          </div>
        )}
      </div>
    </section>
  );
}
