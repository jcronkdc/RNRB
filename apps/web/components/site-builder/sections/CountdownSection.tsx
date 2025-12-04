'use client';

import { Calendar, Bell, Music, Play, Share2, Check } from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

interface CountdownSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    targetDate: string;
    // What's being released
    releaseType?: 'album' | 'single' | 'ep' | 'tour' | 'merch' | 'announcement' | 'custom';
    releaseName?: string;
    releaseDescription?: string;
    // Media
    coverImage?: string;
    backgroundImage?: string;
    previewUrl?: string;
    // Links
    presaveUrl?: string;
    spotifyPresave?: string;
    appleMusicPresave?: string;
    youtubePresave?: string;
    deezerPresave?: string;
    // Notification
    showNotifyButton?: boolean;
    notifyEmail?: boolean;
    // Styling
    showSeconds?: boolean;
    compactMode?: boolean;
  };
  theme?: Record<string, unknown>;
  siteId?: string;
}

export function CountdownSection({ content, theme, siteId }: CountdownSectionProps) {
  const {
    headline = '',
    subheadline = '',
    targetDate,
    releaseType = 'single',
    releaseName = 'New Release',
    releaseDescription = '',
    coverImage = '',
    backgroundImage = '',
    previewUrl = '',
    presaveUrl = '',
    spotifyPresave = '',
    appleMusicPresave = '',
    youtubePresave = '',
    deezerPresave = '',
    showNotifyButton = true,
    notifyEmail = true,
    showSeconds = true,
    compactMode = false,
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();

      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch('/api/sites/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          email,
          source: 'countdown',
          releaseName,
        }),
      });
      setIsSubscribed(true);
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: releaseName,
          text: `${releaseName} - Coming ${formatDate(targetDate)}`,
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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const presaveLinks = [
    { id: 'spotify', label: 'Spotify', url: spotifyPresave, color: '#1DB954' },
    { id: 'apple', label: 'Apple Music', url: appleMusicPresave, color: '#FA243C' },
    { id: 'youtube', label: 'YouTube', url: youtubePresave, color: '#FF0000' },
    { id: 'deezer', label: 'Deezer', url: deezerPresave, color: '#FEAA2D' },
  ].filter((link) => link.url);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="mb-2 rounded-xl p-4 md:p-6" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <span className="text-4xl font-bold text-white md:text-6xl">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-sm uppercase tracking-wider text-white/70">{label}</span>
    </div>
  );

  return (
    <section
      className="relative min-h-[600px] py-20"
      style={{
        background: backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage}) center/cover`
          : `linear-gradient(135deg, ${accentColor}40 0%, rgba(0,0,0,0.9) 100%)`,
      }}
    >
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Cover Image */}
        {coverImage && (
          <div className="mx-auto mb-8 w-64 md:w-80">
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl">
              <img src={coverImage} alt={releaseName} className="h-full w-full object-cover" />
              {previewUrl && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/50"
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
          </div>
        )}

        {/* Release Type Badge */}
        <div className="mb-4">
          <span
            className="inline-block rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wider"
            style={{ background: accentColor, color: '#fff' }}
          >
            New {releaseType}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
          {headline || releaseName}
        </h1>
        {(subheadline || releaseDescription) && (
          <p className="mb-8 text-xl text-white/80">{subheadline || releaseDescription}</p>
        )}

        {/* Countdown */}
        {!isExpired ? (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-center gap-2 text-white/70">
              <Calendar size={18} />
              <span>{formatDate(targetDate)}</span>
            </div>
            <div
              className={`flex justify-center gap-4 ${compactMode ? 'gap-2' : 'gap-4 md:gap-6'}`}
            >
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              {showSeconds && <TimeUnit value={timeLeft.seconds} label="Seconds" />}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div
              className="inline-block rounded-full px-8 py-4 text-2xl font-bold"
              style={{ background: accentColor, color: '#fff' }}
            >
              Out Now!
            </div>
          </div>
        )}

        {/* Pre-save Links */}
        {!isExpired && presaveLinks.length > 0 && (
          <div className="mb-8">
            <p className="mb-4 text-sm uppercase tracking-wider text-white/70">Pre-save Now</p>
            <div className="flex flex-wrap justify-center gap-3">
              {presaveLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                  style={{ background: link.color, color: '#fff' }}
                >
                  <Music size={18} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Generic Pre-save Link */}
        {!isExpired && presaveUrl && presaveLinks.length === 0 && (
          <div className="mb-8">
            <a
              href={presaveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all hover:scale-105"
              style={{ background: accentColor, color: '#fff' }}
            >
              <Music size={20} />
              Pre-save Now
            </a>
          </div>
        )}

        {/* Notify Form */}
        {showNotifyButton && notifyEmail && !isExpired && (
          <div className="mb-8">
            {isSubscribed ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-green-500/20 px-6 py-3 text-green-400">
                <Check size={20} />
                You&apos;ll be notified when it drops!
              </div>
            ) : (
              <form onSubmit={handleNotify} className="mx-auto flex max-w-md gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-xl px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  <Bell size={18} />
                  Notify Me
                </button>
              </form>
            )}
          </div>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          {copied ? 'Link Copied!' : 'Share'}
        </button>

        {/* Audio Preview */}
        {isPlaying && previewUrl && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={previewUrl} autoPlay onEnded={() => setIsPlaying(false)} className="hidden" />
        )}
      </div>
    </section>
  );
}
