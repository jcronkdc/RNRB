'use client';

import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from '@/components/ui/custom-icons';
import { useState, useRef } from 'react';

interface Track {
  id: string;
  title: string;
  artist?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
}

interface MusicPlayerSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    tracks?: Track[];
    layout?: 'list' | 'grid' | 'featured';
    showWaveform?: boolean;
    autoSync?: boolean;
  };
  theme: Record<string, unknown>;
  animation?: string;
}

export function MusicPlayerSection({ content, theme, animation }: MusicPlayerSectionProps) {
  const { title = 'Music', subtitle = '', tracks = [], layout = 'list' } = content;

  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const accentColor = (theme.accentColor as string) || '#ff6347';

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % tracks.length;
    playTrack(next);
  };

  const prevTrack = () => {
    const prev = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
    playTrack(prev);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(prog || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  if (tracks.length === 0) {
    return (
      <section
        className="px-4 py-20"
        style={{ backgroundColor: (theme.secondaryColor as string) || '#1a1a1a' }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="mb-4 text-4xl font-bold"
            style={{
              fontFamily: (theme.fontHeading as string) || 'inherit',
              color: (theme.textColor as string) || '#fff',
            }}
          >
            {title}
          </h2>
          <p style={{ color: (theme.mutedColor as string) || '#888' }}>Music coming soon...</p>
        </div>
      </section>
    );
  }

  const activeTrack = tracks[currentTrack];

  return (
    <section
      id="music"
      className="px-4 py-20"
      style={{ backgroundColor: (theme.secondaryColor as string) || '#1a1a1a' }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={animation === 'slide-up' ? { opacity: 0, y: 40 } : {}}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{
              fontFamily: (theme.fontHeading as string) || 'inherit',
              color: (theme.textColor as string) || '#fff',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl" style={{ color: (theme.mutedColor as string) || '#888' }}>
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Featured Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 overflow-hidden rounded-xl"
          style={{
            backgroundColor: (theme.primaryColor as string) || '#000',
            borderRadius: (theme.borderRadius as string) || '12px',
          }}
        >
          <div className="p-6 md:p-8">
            {/* Now Playing */}
            <div className="mb-8 flex flex-col items-center gap-6 md:flex-row">
              {/* Album Art */}
              <div
                className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg"
                style={{
                  backgroundColor: accentColor + '20',
                  borderRadius: (theme.borderRadius as string) || '8px',
                }}
              >
                {activeTrack?.coverUrl ? (
                  <img
                    src={activeTrack.coverUrl}
                    alt={activeTrack.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-6xl">🎵</span>
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 text-center md:text-left">
                <h3
                  className="mb-2 text-2xl font-bold md:text-3xl"
                  style={{ color: (theme.textColor as string) || '#fff' }}
                >
                  {activeTrack?.title || 'No track selected'}
                </h3>
                {activeTrack?.artist && (
                  <p style={{ color: (theme.mutedColor as string) || '#888' }}>
                    {activeTrack.artist}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div
              className="mb-4 h-2 cursor-pointer rounded-full"
              style={{ backgroundColor: (theme.mutedColor as string) + '30' || '#888' }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>

            {/* Time */}
            <div
              className="mb-6 flex justify-between text-sm"
              style={{ color: (theme.mutedColor as string) || '#888' }}
            >
              <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
              <span>{audioRef.current ? formatTime(audioRef.current.duration || 0) : '0:00'}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={prevTrack}
                className="rounded-full p-3 transition-colors hover:bg-white/10"
                style={{ color: (theme.textColor as string) || '#fff' }}
              >
                <SkipBack size={24} />
              </button>

              <button
                onClick={togglePlay}
                className="rounded-full p-5 transition-transform hover:scale-105"
                style={{ backgroundColor: accentColor }}
              >
                {isPlaying ? (
                  <Pause size={32} fill="currentColor" />
                ) : (
                  <Play size={32} fill="currentColor" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="rounded-full p-3 transition-colors hover:bg-white/10"
                style={{ color: (theme.textColor as string) || '#fff' }}
              >
                <SkipForward size={24} />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-full p-3 transition-colors hover:bg-white/10"
                style={{ color: (theme.mutedColor as string) || '#888' }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Track List */}
        {layout === 'list' && tracks.length > 1 && (
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => playTrack(index)}
                className="flex w-full items-center gap-4 rounded-lg p-4 transition-all hover:bg-white/5"
                style={{
                  backgroundColor: currentTrack === index ? accentColor + '20' : 'transparent',
                  border:
                    currentTrack === index ? `2px solid ${accentColor}` : '2px solid transparent',
                }}
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: accentColor + '30' }}
                >
                  {currentTrack === index && isPlaying ? (
                    <div className="flex gap-1">
                      <span
                        className="h-4 w-1 animate-pulse bg-white"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="h-4 w-1 animate-pulse bg-white"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-4 w-1 animate-pulse bg-white"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  ) : (
                    <Play size={20} style={{ color: (theme.textColor as string) || '#fff' }} />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h4
                    className="font-semibold"
                    style={{ color: (theme.textColor as string) || '#fff' }}
                  >
                    {track.title}
                  </h4>
                  {track.artist && (
                    <p
                      className="text-sm"
                      style={{ color: (theme.mutedColor as string) || '#888' }}
                    >
                      {track.artist}
                    </p>
                  )}
                </div>

                {track.duration && (
                  <span
                    className="text-sm"
                    style={{ color: (theme.mutedColor as string) || '#888' }}
                  >
                    {formatTime(track.duration)}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Hidden Audio Element */}
        {activeTrack && (
          <audio
            ref={audioRef}
            src={activeTrack.audioUrl}
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={nextTrack}
          />
        )}
      </div>
    </section>
  );
}
