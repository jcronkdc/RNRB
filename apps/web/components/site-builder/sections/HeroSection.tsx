'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string | null;
    backgroundVideo?: string | null;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    overlay?: number;
    alignment?: 'left' | 'center' | 'right';
  };
  theme: Record<string, unknown>;
  animation?: string;
}

export function HeroSection({ content, theme, animation }: HeroSectionProps) {
  const {
    title = 'Welcome',
    subtitle = '',
    backgroundImage,
    backgroundVideo,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
    overlay = 0.6,
    alignment = 'center',
  } = content;

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const accentColor = (theme.accentColor as string) || '#ff6347';

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Video */}
      {backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Background Image */}
      {backgroundImage && !backgroundVideo && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Gradient Fallback if no image/video */}
      {!backgroundImage && !backgroundVideo && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor || '#000'} 0%, ${theme.secondaryColor || '#1a1a1a'} 100%)`,
          }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${overlay})` }} />

      {/* Content */}
      <motion.div
        initial={animation === 'fade-in' ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`relative z-10 flex flex-col px-4 py-20 ${alignmentClasses[alignment]} mx-auto max-w-5xl`}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          style={{
            fontFamily: (theme.fontHeading as string) || 'inherit',
            color: (theme.textColor as string) || '#fff',
          }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-10 max-w-3xl text-xl sm:text-2xl md:text-3xl"
            style={{
              fontFamily: (theme.fontBody as string) || 'inherit',
              color: (theme.mutedColor as string) || '#888',
            }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {ctaText && ctaLink && (
            <a
              href={ctaLink}
              className="px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: accentColor,
                color: theme.darkMode ? '#fff' : '#000',
                borderRadius: (theme.borderRadius as string) || '0px',
              }}
            >
              {ctaText}
            </a>
          )}

          {secondaryCtaText && secondaryCtaLink && (
            <a
              href={secondaryCtaLink}
              className="border-2 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:bg-white/10"
              style={{
                borderColor: accentColor,
                color: (theme.textColor as string) || '#fff',
                borderRadius: (theme.borderRadius as string) || '0px',
              }}
            >
              {secondaryCtaText}
            </a>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown size={32} style={{ color: (theme.mutedColor as string) || '#888' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
