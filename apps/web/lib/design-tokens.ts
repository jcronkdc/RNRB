// Design tokens for Rock N' Roll Basement AI Music Creator Workspace
// Dark-first design inspired by Suno/Udio/Mubert patterns

export const designTokens = {
  // Color Palette - Dark-first with high contrast
  colors: {
    // Base colors - Dark canvas
    background: {
      DEFAULT: '#0B0B0C', // Deep black background
      secondary: '#141416', // Slightly lighter for sections
      tertiary: '#1C1C1F', // Card backgrounds
    },
    surface: {
      DEFAULT: '#1C1C1F', // Card/panel surface
      hover: '#242428', // Hover state
      active: '#2A2A2F', // Active/pressed state
      muted: '#141416', // Subdued surface
    },
    border: {
      DEFAULT: '#2A2A2F', // Default borders (1px hairline)
      strong: '#3A3A3F', // Emphasized borders
      subtle: '#1C1C1F', // Very subtle borders
    },
    // Text hierarchy
    text: {
      DEFAULT: '#F2F2F3', // Primary text
      secondary: '#A8A8B0', // Secondary text
      muted: '#6B6B74', // Muted/placeholder text
      inverse: '#0B0B0C', // Text on light backgrounds
    },
    // Brand colors
    brand: {
      primary: '#FF6B6B', // Vibrant red accent (Rock N' Roll energy)
      secondary: '#4ECDC4', // Teal complement
      tertiary: '#FFD93D', // Gold/yellow for premium feel
    },
    // Semantic colors
    success: '#4ADE80',
    warning: '#FFC107',
    error: '#FF5252',
    info: '#3B82F6',
    // Special UI elements
    waveform: {
      inactive: '#2A2A2F',
      active: '#4ECDC4',
      progress: '#FF6B6B',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      mono: '"JetBrains Mono", "SF Mono", Consolas, monospace',
      display: '"Instrument Serif", Georgia, serif', // For headings
    },
    fontSize: {
      '2xs': '10px',
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.1',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing (8pt grid)
  spacing: {
    0: '0',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    8: '64px',
    10: '80px',
    12: '96px',
    16: '128px',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // Shadows (subtle for dark theme)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    md: '0 8px 12px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 12px 24px -4px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 40px -8px rgba(0, 0, 0, 0.7)',
    glow: '0 0 20px rgba(255, 107, 107, 0.3)', // Brand color glow
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      DEFAULT: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Layout
  layout: {
    sidebarWidth: {
      collapsed: '64px',
      expanded: '240px',
    },
    topBarHeight: '56px',
    transportBarHeight: '72px',
    containerMaxWidth: '1440px',
  },
};

// Tailwind config extension
export const tailwindExtend = {
  colors: {
    // Map to Tailwind color system
    background: designTokens.colors.background,
    surface: designTokens.colors.surface,
    border: designTokens.colors.border,
    brand: designTokens.colors.brand,
    // Semantic colors
    success: designTokens.colors.success,
    warning: designTokens.colors.warning,
    error: designTokens.colors.error,
    info: designTokens.colors.info,
    // Text colors
    foreground: designTokens.colors.text.DEFAULT,
    'muted-foreground': designTokens.colors.text.muted,
  },
  fontFamily: designTokens.typography.fontFamily,
  fontSize: Object.entries(designTokens.typography.fontSize).reduce(
    (acc, [key, value]) => {
      acc[key] = [value, { lineHeight: designTokens.typography.lineHeight.normal }];
      return acc;
    },
    {} as Record<string, [string, { lineHeight: string }]>
  ),
  spacing: designTokens.spacing,
  borderRadius: designTokens.borderRadius,
  boxShadow: designTokens.shadows,
  animation: {
    shimmer: 'shimmer 2s ease-in-out infinite',
    float: 'float 6s ease-in-out infinite',
    pulse: 'pulse 2s ease-in-out infinite',
  },
  keyframes: {
    shimmer: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
  },
};
