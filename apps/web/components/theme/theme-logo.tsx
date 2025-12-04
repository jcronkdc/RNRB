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

// Logo actual dimensions: 240x100 (aspect ratio 2.4:1)
// All size configs must maintain this 2.4:1 ratio to prevent CLS
// Note: Using explicit width/height in style to prevent CLS
const sizeConfig = {
  sm: { width: 65, height: 27, className: '' },
  md: { width: 96, height: 40, className: '' },
  lg: { width: 127, height: 53, className: '' },
  xl: { width: 161, height: 67, className: '' },
  hero: { width: 192, height: 80, className: '' },
  mega: { width: 257, height: 107, className: '' },
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
