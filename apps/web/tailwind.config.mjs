import tailwindcssAnimate from 'tailwindcss-animate';

const withAlpha = (variable) => `hsl(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        background: withAlpha('--sf-color-background'),
        foreground: {
          DEFAULT: withAlpha('--sf-color-foreground'),
          muted: withAlpha('--sf-color-muted-foreground'),
          subtle: withAlpha('--color-foreground-subtle'),
        },
        border: {
          DEFAULT: withAlpha('--sf-color-border'),
          strong: withAlpha('--color-border-strong'),
        },
        ring: withAlpha('--sf-color-brand-primary'),
        surface: {
          DEFAULT: withAlpha('--sf-color-surface'),
          muted: withAlpha('--sf-color-surface-muted'),
          elevated: withAlpha('--sf-color-surface-elevated'),
          hover: withAlpha('--sf-color-surface-hover'),
        },
        brand: {
          foreground: withAlpha('--sf-color-brand-foreground'),
          primary: withAlpha('--sf-color-brand-primary'),
          'primary-foreground': withAlpha('--sf-color-brand-primary-foreground'),
          secondary: withAlpha('--sf-color-brand-secondary'),
          'secondary-foreground': withAlpha('--sf-color-brand-secondary-foreground'),
          muted: withAlpha('--sf-color-brand-muted'),
          'muted-foreground': withAlpha('--sf-color-brand-muted-foreground'),
        },
        accent: {
          DEFAULT: withAlpha('--sf-color-accent'),
          foreground: withAlpha('--sf-color-accent-foreground'),
          subtle: withAlpha('--sf-color-accent-subtle'),
        },
        muted: {
          DEFAULT: withAlpha('--sf-color-muted'),
          foreground: withAlpha('--sf-color-muted-foreground'),
        },
        card: {
          DEFAULT: withAlpha('--sf-color-surface'),
          foreground: withAlpha('--sf-color-foreground'),
        },
        popover: {
          DEFAULT: withAlpha('--sf-color-surface'),
          foreground: withAlpha('--sf-color-foreground'),
        },
        success: withAlpha('--color-success'),
        warning: withAlpha('--color-warning'),
        error: withAlpha('--color-error'),
        info: withAlpha('--color-info'),
        waveform: {
          inactive: withAlpha('--color-waveform-inactive'),
          active: withAlpha('--color-waveform-active'),
          progress: withAlpha('--color-waveform-progress'),
        },
      },
      borderRadius: {
        none: 'var(--sf-radius-none)',
        xs: 'var(--sf-radius-xs)',
        sm: 'var(--sf-radius-sm)',
        md: 'var(--sf-radius-md)',
        lg: 'var(--sf-radius-lg)',
        xl: 'var(--sf-radius-xl)',
        full: 'var(--sf-radius-full)',
      },
      boxShadow: {
        soft: 'var(--sf-shadow-soft)',
        elevated: 'var(--sf-shadow-elevated)',
        outline: 'var(--sf-shadow-outline)',
        glow: 'var(--sf-shadow-glow)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
        topbar: 'var(--topbar-height)',
      },
      maxWidth: {
        narrow: 'var(--maxw-narrow)',
        content: 'var(--maxw)',
        wide: 'var(--maxw-wide)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        default: 'var(--ease-default)',
        bounce: 'var(--ease-bounce)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-normal) var(--ease-out)',
        'fade-up': 'fade-up var(--duration-slow) var(--ease-out)',
        'scale-in': 'scale-in var(--duration-normal) var(--ease-out)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
