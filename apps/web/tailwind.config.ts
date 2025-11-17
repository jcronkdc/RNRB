import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const withAlpha = (variable: string) => `hsl(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: withAlpha('--sf-color-background'),
        foreground: withAlpha('--sf-color-foreground'),
        border: withAlpha('--sf-color-border'),
        ring: withAlpha('--sf-color-brand-primary'),
        surface: {
          DEFAULT: withAlpha('--sf-color-surface'),
          muted: withAlpha('--sf-color-surface-muted'),
          elevated: withAlpha('--sf-color-surface-elevated')
        },
        brand: {
          foreground: withAlpha('--sf-color-brand-foreground'),
          primary: withAlpha('--sf-color-brand-primary'),
          'primary-foreground': withAlpha('--sf-color-brand-primary-foreground'),
          secondary: withAlpha('--sf-color-brand-secondary'),
          'secondary-foreground': withAlpha('--sf-color-brand-secondary-foreground'),
          muted: withAlpha('--sf-color-brand-muted'),
          'muted-foreground': withAlpha('--sf-color-brand-muted-foreground')
        },
        accent: {
          DEFAULT: withAlpha('--sf-color-accent'),
          foreground: withAlpha('--sf-color-accent-foreground'),
          subtle: withAlpha('--sf-color-accent-subtle')
        },
        muted: {
          DEFAULT: withAlpha('--sf-color-muted'),
          foreground: withAlpha('--sf-color-muted-foreground')
        }
      },
      borderRadius: {
        none: 'var(--sf-radius-none)',
        xs: 'var(--sf-radius-xs)',
        sm: 'var(--sf-radius-sm)',
        md: 'var(--sf-radius-md)',
        lg: 'var(--sf-radius-lg)',
        xl: 'var(--sf-radius-xl)',
        full: 'var(--sf-radius-full)'
      },
      boxShadow: {
        soft: 'var(--sf-shadow-soft)',
        elevated: 'var(--sf-shadow-elevated)',
        outline: 'var(--sf-shadow-outline)'
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;

