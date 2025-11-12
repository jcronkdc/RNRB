'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface ThemeProviderProps {
  /** Desired theme. Defaults to `light`. */
  theme?: 'light' | 'dark';
  /** Attribute applied to the root element for theming. */
  attribute?: string;
  /** Optional callback after theme is applied. */
  onThemeChange?: (theme: 'light' | 'dark') => void;
  children: ReactNode;
}

/**
 * Injects CronkWaters design tokens on the `documentElement` and toggles
 * between light/dark palettes using the configured data attribute.
 */
export function ThemeProvider({
  theme = 'light',
  attribute = 'data-theme',
  onThemeChange,
  children
}: ThemeProviderProps) {
  useEffect(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null;

    if (!root) {
      return;
    }

    root.setAttribute(attribute, theme);
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    onThemeChange?.(theme);

    return () => {
      root.removeAttribute(attribute);
      root.style.removeProperty('color-scheme');
    };
  }, [theme, attribute, onThemeChange]);

  return <>{children}</>;
}
