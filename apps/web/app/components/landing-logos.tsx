'use client';

import Image from 'next/image';
import { useThemeSafe } from '@/components/theme';

/**
 * Theme-aware Hero Logo for the landing page
 * Uses logo-dark.png (white) for dark mode, logo-light.png (dark) for light mode
 */
export function HeroLogo() {
  const { resolvedTheme } = useThemeSafe();
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <Image
      src={logoSrc}
      alt="Rock N' Roll Basement - Music Collaboration Platform Logo"
      className="logo-mega"
      width={320}
      height={130}
      priority
      quality={100}
    />
  );
}

/**
 * Theme-aware Footer Logo for the landing page
 * Uses logo-dark.png (white) for dark mode, logo-light.png (dark) for light mode
 */
export function FooterLogo() {
  const { resolvedTheme } = useThemeSafe();
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <Image src={logoSrc} alt="Rock N' Roll Basement Logo" width={40} height={40} loading="lazy" />
  );
}
