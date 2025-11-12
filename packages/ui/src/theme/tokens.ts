export const brandColors = {
  background: '35 45% 97%',
  surface: '33 38% 94%',
  surfaceMuted: '30 32% 90%',
  surfaceElevated: '28 26% 86%',
  foreground: '26 28% 18%',
  border: '28 18% 70%',
  overlay: '26 18% 12%',
  brandForeground: '26 28% 18%',
  brandPrimary: '17 80% 48%',
  brandPrimaryForeground: '33 48% 98%',
  brandSecondary: '23 32% 32%',
  brandSecondaryForeground: '36 58% 92%',
  brandMuted: '26 28% 80%',
  brandMutedForeground: '27 20% 34%',
  accent: '35 96% 54%',
  accentForeground: '28 30% 14%',
  accentSubtle: '35 85% 88%',
  muted: '27 16% 42%',
  mutedForeground: '27 12% 32%',
  success: '142 42% 42%',
  successForeground: '36 56% 96%',
  warning: '36 94% 56%',
  warningForeground: '34 40% 16%',
  danger: '5 78% 50%',
  dangerForeground: '24 62% 96%'
};

export const radii = {
  none: '0px',
  xs: '6px',
  sm: '12px',
  md: '18px',
  lg: '28px',
  xl: '40px',
  full: '9999px'
};

export const spacing = {
  '2xs': '0.25rem',
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem'
};

export const fonts = {
  sans: 'var(--font-geist-sans, "Manrope", "Inter", "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif)',
  serif: '"Fraunces", "Playfair Display", "Georgia", serif',
  mono: 'var(--font-geist-mono, "JetBrains Mono", "IBM Plex Mono", monospace)'
};

export const shadows = {
  soft: '0 28px 60px -32px rgb(70 48 32 / 0.4)',
  elevated: '0 22px 48px -28px rgb(64 42 32 / 0.38)',
  outline: '0 0 0 1px rgb(70 48 32 / 0.16)'
};

export const transitions = {
  fast: '140ms ease-out',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  emphasized: '280ms cubic-bezier(0.65, 0, 0.35, 1)'
};

export const cssVariables = {
  '--sf-color-background': brandColors.background,
  '--sf-color-surface': brandColors.surface,
  '--sf-color-surface-muted': brandColors.surfaceMuted,
  '--sf-color-surface-elevated': brandColors.surfaceElevated,
  '--sf-color-foreground': brandColors.foreground,
  '--sf-color-border': brandColors.border,
  '--sf-color-overlay': brandColors.overlay,
  '--sf-color-brand-foreground': brandColors.brandForeground,
  '--sf-color-brand-primary': brandColors.brandPrimary,
  '--sf-color-brand-primary-foreground': brandColors.brandPrimaryForeground,
  '--sf-color-brand-secondary': brandColors.brandSecondary,
  '--sf-color-brand-secondary-foreground': brandColors.brandSecondaryForeground,
  '--sf-color-brand-muted': brandColors.brandMuted,
  '--sf-color-brand-muted-foreground': brandColors.brandMutedForeground,
  '--sf-color-accent': brandColors.accent,
  '--sf-color-accent-foreground': brandColors.accentForeground,
  '--sf-color-accent-subtle': brandColors.accentSubtle,
  '--sf-color-muted': brandColors.muted,
  '--sf-color-muted-foreground': brandColors.mutedForeground,
  '--sf-color-success': brandColors.success,
  '--sf-color-success-foreground': brandColors.successForeground,
  '--sf-color-warning': brandColors.warning,
  '--sf-color-warning-foreground': brandColors.warningForeground,
  '--sf-color-danger': brandColors.danger,
  '--sf-color-danger-foreground': brandColors.dangerForeground,
  '--sf-font-sans': fonts.sans,
  '--sf-font-mono': fonts.mono,
  '--sf-font-serif': fonts.serif,
  '--sf-radius-none': radii.none,
  '--sf-radius-xs': radii.xs,
  '--sf-radius-sm': radii.sm,
  '--sf-radius-md': radii.md,
  '--sf-radius-lg': radii.lg,
  '--sf-radius-xl': radii.xl,
  '--sf-radius-full': radii.full,
  '--sf-space-2xs': spacing['2xs'],
  '--sf-space-xs': spacing.xs,
  '--sf-space-sm': spacing.sm,
  '--sf-space-md': spacing.md,
  '--sf-space-lg': spacing.lg,
  '--sf-space-xl': spacing.xl,
  '--sf-space-2xl': spacing['2xl'],
  '--sf-space-3xl': spacing['3xl'],
  '--sf-shadow-soft': shadows.soft,
  '--sf-shadow-elevated': shadows.elevated,
  '--sf-shadow-outline': shadows.outline,
  '--sf-transition-fast': transitions.fast,
  '--sf-transition-base': transitions.base,
  '--sf-transition-emphasized': transitions.emphasized
} as const;

export const songForgeTheme = {
  colors: brandColors,
  radii,
  spacing,
  fonts,
  shadows,
  transitions,
  cssVariables
};

export type CronkWaterTheme = typeof songForgeTheme;
