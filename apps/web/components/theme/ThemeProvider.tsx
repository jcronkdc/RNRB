'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

const STORAGE_KEY = 'songforge-theme';
const THEMES = ['light', 'dark', 'warm'] as const;
type ThemeName = (typeof THEMES)[number];

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (next: ThemeName) => void;
  themes: ThemeName[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getPreferredTheme = (): ThemeName => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (stored && THEMES.includes(stored)) {
      return stored;
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const applyTheme = (value: ThemeName) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = value;
  root.style.colorScheme = value === 'dark' ? 'dark' : 'light';
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('light');

  useEffect(() => {
    const preferred = getPreferredTheme();
    setThemeState(preferred);
    applyTheme(preferred);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore write failures (private mode, etc.)
    }
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, themes: [...THEMES] }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
