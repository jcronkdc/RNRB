'use client';

/**
 * WorkshopPageHeader Component
 *
 * Standardized header for all feature pages in Rock N' Roll Basement.
 * Includes the white RR logo, page title, description, and optional actions.
 *
 * Usage:
 * <WorkshopPageHeader
 *   icon={Music}
 *   label="Create"
 *   title="Songwriting Studio"
 *   description="Build songs from scratch or import your ideas"
 * />
 */

import { motion } from 'motion/react';
import { LucideIcon } from '@/components/ui/custom-icons';
import { ThemeLogo } from '@/components/theme';
import React from 'react';

interface WorkshopPageHeaderProps {
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Small label above the title (e.g., "Create", "Connect", "Grow") */
  label?: string;
  /** Main page title */
  title: string;
  /** Page description */
  description?: string;
  /** Right-side content (buttons, status indicators, etc.) */
  actions?: React.ReactNode;
  /** Whether to show the logo (default true) */
  showLogo?: boolean;
  /** Custom logo size */
  logoSize?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether this is a hero section with more padding */
  isHero?: boolean;
}

export function WorkshopPageHeader({
  icon: Icon,
  label,
  title,
  description,
  actions,
  showLogo = true,
  logoSize = 'md',
  className = '',
  isHero = false,
}: WorkshopPageHeaderProps) {
  const logoSizes = {
    sm: { width: 100, height: 40 },
    md: { width: 140, height: 57 },
    lg: { width: 180, height: 73 },
  };

  const size = logoSizes[logoSize];

  return (
    <div className={className}>
      {/* Theme-Aware RR Logo - Centered at top [[memory:11700420]] */}
      {showLogo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex flex-col items-center ${isHero ? 'mb-8' : 'mb-6'}`}
        >
          <ThemeLogo
            size={logoSize}
            priority
            className="transition-opacity duration-200 hover:opacity-80"
          />
        </motion.div>
      )}

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={isHero ? 'text-center' : ''}
      >
        <div className={`flex ${isHero ? 'flex-col items-center' : 'items-start justify-between'}`}>
          <div className={isHero ? 'max-w-2xl' : ''}>
            {/* Accent bar - only on non-hero headers */}
            {!isHero && (
              <div className="mb-4 h-1 w-12 rounded-full" style={{ background: 'var(--accent)' }} />
            )}

            {/* Title section */}
            <div className={`${isHero ? '' : 'flex items-center gap-4'}`}>
              {Icon && (
                <div
                  className={`flex items-center justify-center rounded-xl ${
                    isHero ? 'mx-auto mb-4 h-14 w-14' : 'h-12 w-12'
                  }`}
                  style={{
                    background: isHero
                      ? 'linear-gradient(135deg, rgba(255, 99, 71, 0.2), rgba(255, 215, 0, 0.15))'
                      : 'var(--panel)',
                    border: isHero ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <Icon
                    className={isHero ? 'h-7 w-7' : 'h-6 w-6'}
                    style={{ color: 'var(--accent)' }}
                  />
                </div>
              )}
              <div>
                {label && (
                  <p
                    className={`text-xs font-medium uppercase tracking-wide ${
                      isHero ? 'mb-2' : ''
                    }`}
                    style={{ color: 'var(--accent)' }}
                  >
                    {label}
                  </p>
                )}
                <h1
                  className={`font-bold ${isHero ? 'text-3xl md:text-4xl' : 'text-2xl'}`}
                  style={{ color: 'var(--text)' }}
                >
                  {title}
                </h1>
              </div>
            </div>

            {/* Description */}
            {description && (
              <p
                className={`mt-3 ${isHero ? 'text-lg' : 'text-base'}`}
                style={{ color: 'var(--muted)' }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && !isHero && <div className="flex items-center gap-3">{actions}</div>}
        </div>

        {/* Hero actions - centered below */}
        {actions && isHero && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{actions}</div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * WorkshopPageLoading Component
 *
 * Standardized loading state for feature pages.
 */
export function WorkshopPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="absolute inset-0 animate-ping rounded-full opacity-20"
            style={{ background: 'var(--accent)' }}
          />
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default WorkshopPageHeader;
