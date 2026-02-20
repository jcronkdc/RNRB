'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface FeaturePageWrapperProps {
  children: ReactNode;
  featureTitle?: string;
  showLogo?: boolean;
  showMusicNotes?: boolean;
  showGradientOrbs?: boolean;
  showGridPattern?: boolean;
}

/**
 * Consistent wrapper for all feature pages in the (app) directory.
 * Provides:
 * - White RR logo at top (centered, linking to home)
 * - Floating music notes animation
 * - Orange/tomato gradient orbs background
 * - Hero grid pattern overlay
 */
export function FeaturePageWrapper({
  children,
  featureTitle,
  showLogo = true,
  showMusicNotes = true,
  showGradientOrbs = true,
  showGridPattern = true,
}: FeaturePageWrapperProps) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Floating Music Notes */}
      {showMusicNotes && (
        <div className="music-notes-container pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="music-note"
              style={{
                left: `${5 + i * 8}%`,
                animationDelay: `${i * 0.7}s`,
                fontSize: `${18 + (i % 4) * 8}px`,
              }}
            >
              {['♪', '♫', '♬', '♩'][i % 4]}
            </div>
          ))}
        </div>
      )}

      {/* Animated Background Gradient Orbs - Orange/Tomato Theme */}
      {showGradientOrbs && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
          <div className="gradient-orb gradient-orb-3"></div>
          <div className="gradient-orb-accent"></div>
        </div>
      )}

      {/* Hero Grid Pattern */}
      {showGridPattern && <div className="hero-grid-pattern"></div>}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* White RR Logo & Title - Centered at top */}
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col items-center"
          >
            <Link href="/" className="group relative inline-block">
              <Image
                src="/logo-light.png"
                alt="Rock N' Roll Basement"
                width={160}
                height={65}
                priority
                className="transition-all duration-300 group-hover:scale-105"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.15)) drop-shadow(0 0 40px var(--accent-glow))',
                }}
              />
              {/* Subtle glow on hover */}
              <div
                className="absolute inset-0 -z-10 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--accent-muted)' }}
              />
            </Link>
            <h1 className="hero-title mt-4 text-center">
              <span className="hero-text-gradient text-2xl font-bold md:text-3xl">
                Rock N' Roll Basement
              </span>
            </h1>
            {featureTitle && (
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                {featureTitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

/**
 * Premium accent bar component for section headers
 */
export function AccentBar({ width = 60, delay = 0.2 }: { width?: number; delay?: number }) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width }}
      transition={{ duration: 0.8, delay }}
      className="mb-4 h-1 rounded-full"
      style={{ background: 'linear-gradient(90deg, var(--accent), var(--gold))' }}
    />
  );
}

/**
 * Page title with icon component
 */
export function PageTitle({
  icon: Icon,
  subtitle,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  subtitle?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-4">
      {Icon && (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--accent-muted), var(--gold-muted))',
          }}
        >
          <Icon className="h-7 w-7" style={{ color: 'var(--accent)' }} />
        </div>
      )}
      <div>
        {subtitle && (
          <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            {subtitle}
          </p>
        )}
        {children || (
          <h1 className="text-3xl font-bold lg:text-4xl" style={{ color: 'var(--text)' }}>
            {title}
          </h1>
        )}
      </div>
    </div>
  );
}
