'use client';

import { Sun, Moon, Monitor } from '@/components/ui/custom-icons';
import { useThemeSafe } from './theme-provider';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  /** Show expanded dropdown with system option */
  showMenu?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional classes */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 p-1.5',
  md: 'h-10 w-10 p-2',
  lg: 'h-12 w-12 p-2.5',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

/**
 * Theme toggle button with optional dropdown menu.
 *
 * Simple mode: Toggles between light/dark
 * Menu mode: Shows dropdown with Light/Dark/System options
 */
export function ThemeToggle({ showMenu = false, size = 'md', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeSafe();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu || !menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, menuOpen]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={`${sizeClasses[size]} rounded-xl bg-surface/50`} />;
  }

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

  // Simple toggle mode
  if (!showMenu) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${className} ${sizeClasses[size]} `}
        style={{
          background:
            resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className={`${iconSizes[size]} text-amber-400 transition-colors`} />
          ) : (
            <Moon className={`${iconSizes[size]} text-indigo-500 transition-colors`} />
          )}
        </motion.div>

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              resolvedTheme === 'dark'
                ? 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15), transparent 70%)'
                : 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15), transparent 70%)',
          }}
        />
      </motion.button>
    );
  }

  // Menu mode with dropdown
  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setMenuOpen(!menuOpen)}
        className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300`}
        style={{
          background:
            resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
        aria-label="Theme options"
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        <ThemeIcon
          className={`${iconSizes[size]} ${
            resolvedTheme === 'dark' ? 'text-amber-400' : 'text-indigo-500'
          }`}
        />
        <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-secondary)' }}>
          {theme}
        </span>
      </motion.button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl"
            style={{
              background:
                resolvedTheme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-1">
              {(
                [
                  { value: 'light', label: 'Light', Icon: Sun, color: 'text-amber-500' },
                  { value: 'dark', label: 'Dark', Icon: Moon, color: 'text-indigo-400' },
                  { value: 'system', label: 'System', Icon: Monitor, color: 'text-gray-400' },
                ] as const
              ).map(({ value, label, Icon, color }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${theme === value ? 'bg-accent/10' : 'hover:bg-white/5'} `}
                >
                  <Icon className={`h-4 w-4 ${theme === value ? 'text-accent' : color}`} />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: theme === value ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {label}
                  </span>
                  {theme === value && (
                    <motion.div layoutId="theme-check" className="ml-auto">
                      <svg
                        className="h-4 w-4 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
