'use client';

import { cn } from '@songforge/ui';
import { useEffect, type ReactNode } from 'react';

type BackgroundProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  backgroundColor?: string;
  foregroundColor?: string;
};

const DEFAULT_BACKGROUND = '#f7efe4';
const DEFAULT_FOREGROUND = '#1f1612';

const HEX_REGEX = /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/;

function normalizeHex(hex: string) {
  const cleaned = hex.trim();
  if (!HEX_REGEX.test(cleaned)) {
    return null;
  }

  const stripped = cleaned.replace('#', '');
  if (stripped.length === 3) {
    return `#${stripped
      .split('')
      .map((char) => char + char)
      .join('')}`;
  }

  return `#${stripped.toLowerCase()}`;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }

  const bigint = parseInt(normalized.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b] as const;
}

function relativeLuminance(rgb: readonly [number, number, number]) {
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string) {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return null;
  }

  const fgL = relativeLuminance(fgRgb);
  const bgL = relativeLuminance(bgRgb);

  const lighter = Math.max(fgL, bgL);
  const darker = Math.min(fgL, bgL);

  return (lighter + 0.05) / (darker + 0.05);
}

export function Background({
  children,
  className,
  contentClassName,
  backgroundColor = DEFAULT_BACKGROUND,
  foregroundColor = DEFAULT_FOREGROUND
}: BackgroundProps) {
  useEffect(() => {
    const ratio = contrastRatio(foregroundColor, backgroundColor);
    if (ratio !== null && ratio < 4.5) {
      console.warn(
        `[SongForge] Background contrast ratio ${ratio.toFixed(
          2
        )} is below 4.5:1. Consider adjusting token values for improved readability.`
      );
    }
  }, [backgroundColor, foregroundColor]);

  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      <div aria-hidden className="sf-bg-gradient" />
      <div aria-hidden className="sf-film-grain" />
      <div className={cn('relative z-10 flex min-h-full flex-col', contentClassName)}>{children}</div>
    </div>
  );
}

