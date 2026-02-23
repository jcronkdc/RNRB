'use client';

import { Play, Pause, Volume2, VolumeX } from '@/components/ui/custom-icons';
import { useState, useRef, useEffect } from 'react';

interface VideoHeroSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    videoUrl?: string; // Direct video URL (mp4, webm)
    youtubeId?: string; // YouTube video ID
    vimeoId?: string; // Vimeo video ID
    posterImage?: string;
    ctaText?: string;
    ctaLink?: string;
    overlayOpacity?: number; // 0-100
    textAlignment?: 'left' | 'center' | 'right';
    autoplay?: boolean;
    loop?: boolean;
    showControls?: boolean;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    overlayColor?: string;
  };
}

export function VideoHeroSection({ content, styles }: VideoHeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(content.autoplay !== false);
  const [isMuted, setIsMuted] = useState(true);

  const {
    headline = 'Your Name Here',
    subheadline,
    videoUrl,
    youtubeId,
    vimeoId,
    posterImage,
    ctaText,
    ctaLink,
    overlayOpacity = 40,
    textAlignment = 'center',
    autoplay = true,
    loop = true,
    showControls = false,
  } = content;

  const textColor = styles?.textColor || '#ffffff';
  const accentColor = styles?.accentColor || 'var(--accent)';
  const overlayColor = styles?.overlayColor || '#000000';

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser, that's ok
      });
    }
  }, [autoplay]);

  const alignmentClass =
    textAlignment === 'left'
      ? 'items-start text-left'
      : textAlignment === 'right'
        ? 'items-end text-right'
        : 'items-center text-center';

  // Get YouTube embed URL
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`
    : null;

  // Get Vimeo embed URL
  const vimeoEmbedUrl = vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1&quality=auto`
    : null;

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Video Background */}
      {videoUrl && !youtubeId && !vimeoId && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={autoplay}
          muted={isMuted}
          loop={loop}
          playsInline
          poster={posterImage}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* YouTube Background */}
      {youtubeEmbedUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={youtubeEmbedUrl}
            className="absolute h-[300%] w-[300%] -translate-x-1/3 -translate-y-1/3"
            allow="autoplay; encrypted-media"
            frameBorder="0"
            title="Video Background"
          />
        </div>
      )}

      {/* Vimeo Background */}
      {vimeoEmbedUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={vimeoEmbedUrl}
            className="absolute h-[300%] w-[300%] -translate-x-1/3 -translate-y-1/3"
            allow="autoplay; fullscreen"
            frameBorder="0"
            title="Video Background"
          />
        </div>
      )}

      {/* Fallback Image */}
      {!videoUrl && !youtubeId && !vimeoId && posterImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${posterImage})` }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${overlayColor}${Math.round(overlayOpacity * 2.55)
            .toString(16)
            .padStart(2, '0')}, ${overlayColor}${Math.round(overlayOpacity * 2.55 * 0.8)
            .toString(16)
            .padStart(2, '0')})`,
        }}
      />

      {/* Content */}
      <div className={`relative z-10 flex max-w-5xl flex-col px-8 py-24 ${alignmentClass}`}>
        <h1
          className="mb-6 text-5xl leading-tight font-bold md:text-6xl lg:text-7xl xl:text-8xl"
          style={{ color: textColor }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p
            className="mb-8 max-w-2xl text-xl md:text-2xl"
            style={{ color: textColor, opacity: 0.9 }}
          >
            {subheadline}
          </p>
        )}

        {ctaText && ctaLink && (
          <a
            href={ctaLink}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold transition-transform hover:scale-105"
            style={{ background: accentColor, color: '#fff' }}
          >
            {ctaText}
          </a>
        )}
      </div>

      {/* Video Controls (if enabled) */}
      {showControls && videoUrl && (
        <div className="absolute bottom-6 left-6 z-10 flex gap-2">
          <button
            onClick={togglePlay}
            className="rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={toggleMute}
            className="rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-8 w-5 justify-center rounded-full border-2 border-white/50">
          <div className="mt-1 h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
}

// Editor component
export function VideoHeroSectionEditor({
  content,
  onChange,
}: {
  content: VideoHeroSectionProps['content'];
  onChange: (content: VideoHeroSectionProps['content']) => void;
}) {
  const [videoSource, setVideoSource] = useState<'file' | 'youtube' | 'vimeo'>(
    content.youtubeId ? 'youtube' : content.vimeoId ? 'vimeo' : 'file'
  );

  return (
    <div className="space-y-6">
      {/* Headline */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Headline
        </label>
        <input
          type="text"
          value={content.headline || ''}
          onChange={(e) => onChange({ ...content, headline: e.target.value })}
          className="w-full rounded-lg px-4 py-2 text-lg"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="Your Band Name"
        />
      </div>

      {/* Subheadline */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Subheadline
        </label>
        <input
          type="text"
          value={content.subheadline || ''}
          onChange={(e) => onChange({ ...content, subheadline: e.target.value })}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="Rock & Roll Since 2015"
        />
      </div>

      {/* Video Source Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Video Source
        </label>
        <div className="flex gap-2">
          {(['file', 'youtube', 'vimeo'] as const).map((source) => (
            <button
              key={source}
              onClick={() => setVideoSource(source)}
              className={`rounded-lg px-4 py-2 capitalize ${
                videoSource === source ? 'ring-2 ring-(--accent)' : ''
              }`}
              style={{
                background: videoSource === source ? 'var(--accent)' : 'var(--bg)',
                color: videoSource === source ? '#fff' : 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              {source === 'file' ? 'Video URL' : source}
            </button>
          ))}
        </div>
      </div>

      {/* Video URL Input */}
      {videoSource === 'file' && (
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Video URL (MP4/WebM)
          </label>
          <input
            type="text"
            value={content.videoUrl || ''}
            onChange={(e) =>
              onChange({
                ...content,
                videoUrl: e.target.value,
                youtubeId: undefined,
                vimeoId: undefined,
              })
            }
            className="w-full rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="https://example.com/video.mp4"
          />
        </div>
      )}

      {/* YouTube ID Input */}
      {videoSource === 'youtube' && (
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            YouTube Video ID
          </label>
          <input
            type="text"
            value={content.youtubeId || ''}
            onChange={(e) =>
              onChange({
                ...content,
                youtubeId: e.target.value,
                videoUrl: undefined,
                vimeoId: undefined,
              })
            }
            className="w-full rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="dQw4w9WgXcQ"
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
            The ID is the part after v= in the YouTube URL
          </p>
        </div>
      )}

      {/* Vimeo ID Input */}
      {videoSource === 'vimeo' && (
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Vimeo Video ID
          </label>
          <input
            type="text"
            value={content.vimeoId || ''}
            onChange={(e) =>
              onChange({
                ...content,
                vimeoId: e.target.value,
                videoUrl: undefined,
                youtubeId: undefined,
              })
            }
            className="w-full rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="123456789"
          />
        </div>
      )}

      {/* Poster Image */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Poster/Fallback Image URL
        </label>
        <input
          type="text"
          value={content.posterImage || ''}
          onChange={(e) => onChange({ ...content, posterImage: e.target.value })}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="https://example.com/poster.jpg"
        />
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Button Text
          </label>
          <input
            type="text"
            value={content.ctaText || ''}
            onChange={(e) => onChange({ ...content, ctaText: e.target.value })}
            className="w-full rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="Listen Now"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Button Link
          </label>
          <input
            type="text"
            value={content.ctaLink || ''}
            onChange={(e) => onChange({ ...content, ctaLink: e.target.value })}
            className="w-full rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="#music"
          />
        </div>
      </div>

      {/* Overlay Opacity */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Overlay Darkness: {content.overlayOpacity || 40}%
        </label>
        <input
          type="range"
          min="0"
          max="90"
          value={content.overlayOpacity || 40}
          onChange={(e) => onChange({ ...content, overlayOpacity: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Text Alignment */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Text Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onChange({ ...content, textAlignment: align })}
              className={`rounded-lg px-4 py-2 capitalize ${
                content.textAlignment === align ? 'ring-2 ring-(--accent)' : ''
              }`}
              style={{
                background: content.textAlignment === align ? 'var(--accent)' : 'var(--bg)',
                color: content.textAlignment === align ? '#fff' : 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={content.autoplay !== false}
            onChange={(e) => onChange({ ...content, autoplay: e.target.checked })}
            className="h-4 w-4 rounded"
          />
          <span style={{ color: 'var(--text)' }}>Autoplay</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={content.loop !== false}
            onChange={(e) => onChange({ ...content, loop: e.target.checked })}
            className="h-4 w-4 rounded"
          />
          <span style={{ color: 'var(--text)' }}>Loop</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={content.showControls === true}
            onChange={(e) => onChange({ ...content, showControls: e.target.checked })}
            className="h-4 w-4 rounded"
          />
          <span style={{ color: 'var(--text)' }}>Show Controls</span>
        </label>
      </div>
    </div>
  );
}
