'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Script to run before React hydration to prevent flash
// This gets injected into the HTML head
// Default to dark theme for first-time visitors
export const themeScript = `
  (function() {
    function getTheme() {
      const stored = localStorage.getItem('rnrb-theme');
      if (stored === 'light' || stored === 'dark') return stored;
      if (stored === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      // No stored preference = default to dark
      return 'dark';
    }
    const theme = getTheme();
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  })();
`;

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'rnrb-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Resolve actual theme based on system preference if needed
  const resolveTheme = useCallback((t: Theme): ResolvedTheme => {
    if (t === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark';
    }
    return t;
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((resolvedT: ResolvedTheme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedT);
    root.setAttribute('data-theme', resolvedT);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedT === 'dark' ? '#1c1915' : '#faf8f5');
    }
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      const initialTheme = stored || defaultTheme;
      setThemeState(initialTheme);

      const resolved = resolveTheme(initialTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
      const resolved = resolveTheme(defaultTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
  }, [defaultTheme, storageKey, resolveTheme, applyTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Set theme function
  const setTheme = useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn('Failed to save theme:', error);
      }

      setThemeState(newTheme);
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    [storageKey, resolveTheme, applyTheme]
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  // The themeScript handles initial theme before React hydrates
  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook that's safe to use outside ThemeProvider (returns defaults)
export function useThemeSafe() {
  const context = useContext(ThemeContext);
  return (
    context ?? {
      theme: 'dark' as Theme,
      resolvedTheme: 'dark' as ResolvedTheme,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  );
}
