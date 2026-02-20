'use client';

import Image from 'next/image';
import { useThemeSafe } from '@/components/theme';

/**
 * Theme-aware Hero Logo for the landing page
 */
export function HeroLogo() {
  const { resolvedTheme } = useThemeSafe();
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <Image
      src={logoSrc}
      alt="Rock N' Roll Basement"
      className="h-8 w-auto sm:h-9"
      width={160}
      height={36}
      priority
      quality={90}
    />
  );
}

/**
 * Theme-aware Footer Logo for the landing page
 */
export function FooterLogo() {
  const { resolvedTheme } = useThemeSafe();
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <Image
      src={logoSrc}
      alt="Rock N' Roll Basement"
      className="h-6 w-auto"
      width={120}
      height={28}
      loading="lazy"
    />
  );
}
