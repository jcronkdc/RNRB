'use client';

import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage or system preference
    let savedTheme: 'light' | 'dark' | null = null;
    try {
      savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
      // Continue - theme is still applied to DOM
    }
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return <div className="h-10 w-10" />; // Placeholder to prevent hydration mismatch
  }

  return (
    <button
      onClick={toggleTheme}
      className="border-border/50 bg-surface hover:bg-surface-muted rounded-lg border p-2 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-purple-600" />
      )}
    </button>
  );
}
