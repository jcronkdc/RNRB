'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useThemeSafe } from './theme-provider';

interface ThemeLogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'mega';
  /** Whether to link to home page */
  linkToHome?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Alt text override */
  alt?: string;
  /** Priority loading (for above-the-fold logos) */
  priority?: boolean;
}

const sizeConfig = {
  sm: { width: 80, height: 27, className: 'h-7 w-auto' },
  md: { width: 120, height: 40, className: 'h-10 w-auto' },
  lg: { width: 160, height: 53, className: 'h-14 w-auto' },
  xl: { width: 200, height: 67, className: 'h-16 w-auto' },
  hero: { width: 240, height: 80, className: 'logo-hero' },
  mega: { width: 320, height: 107, className: 'logo-mega' },
};

/**
 * Theme-aware logo component that automatically swaps between
 * dark and light logo variants based on the current theme.
 *
 * Uses:
 * - `/logo-dark.png` for dark backgrounds (WHITE logo)
 * - `/logo-light.png` for light backgrounds (DARK logo)
 *
 * The naming convention refers to the BACKGROUND color, not the logo color.
 */
export function ThemeLogo({
  size = 'md',
  linkToHome = true,
  className = '',
  alt = "Rock N' Roll Basement",
  priority = false,
}: ThemeLogoProps) {
  const { resolvedTheme } = useThemeSafe();

  // logo-dark.png = white logo for dark backgrounds
  // logo-light.png = dark logo for light backgrounds
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  const config = sizeConfig[size];

  const logoImage = (
    <Image
      src={logoSrc}
      alt={alt}
      width={config.width}
      height={config.height}
      className={`${config.className} ${className} transition-all duration-300`}
      priority={priority}
    />
  );

  if (linkToHome) {
    return (
      <Link
        href="/"
        className="group flex items-center transition-all duration-300 hover:opacity-90"
        aria-label="Go to homepage"
      >
        {logoImage}
      </Link>
    );
  }

  return logoImage;
}

/**
 * Static logo component for cases where we know the background color
 * (e.g., dark hero sections that won't change with theme)
 */
export function StaticLogo({
  variant,
  size = 'md',
  linkToHome = true,
  className = '',
  alt = "Rock N' Roll Basement",
  priority = false,
}: ThemeLogoProps & { variant: 'dark' | 'light' }) {
  // logo-dark.png = white logo (for dark backgrounds)
  // logo-light.png = dark logo (for light backgrounds)
  const logoSrc = variant === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  const config = sizeConfig[size];

  const logoImage = (
    <Image
      src={logoSrc}
      alt={alt}
      width={config.width}
      height={config.height}
      className={`${config.className} ${className} transition-all duration-300`}
      priority={priority}
    />
  );

  if (linkToHome) {
    return (
      <Link
        href="/"
        className="group flex items-center transition-all duration-300 hover:opacity-90"
        aria-label="Go to homepage"
      >
        {logoImage}
      </Link>
    );
  }

  return logoImage;
}
