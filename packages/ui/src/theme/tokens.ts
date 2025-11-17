export const brandColors = {
  50: "#f2f6ff",
  100: "#dce7ff",
  200: "#b4cfff",
  300: "#86b4ff",
  400: "#4d8bff",
  500: "#1f5fff",
  600: "#1448d8",
  700: "#1037a8",
  800: "#0d2a7e",
  900: "#081c52",
  DEFAULT: "#1f5fff"
} as const;

export const neutralColors = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5f5",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a"
} as const;

export const surfaceColors = {
  DEFAULT: "#0b1120",
  foreground: "#e2e8f0",
  muted: "#1f2937",
  mutedForeground: "#9ca3af"
} as const;

export const radii = {
  none: '0px',
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px'
};

export const fonts = {
  sans: [
    'var(--font-sans)',
    'Inter',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'sans-serif'
  ],
  mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace']
};

export const shadows = {
  xs: '0 1px 2px 0 rgb(15 23 42 / 0.08)',
  sm: '0 1px 3px 0 rgb(15 23 42 / 0.12), 0 1px 2px -1px rgb(15 23 42 / 0.06)',
  md: '0 4px 6px -1px rgb(15 23 42 / 0.12), 0 2px 4px -2px rgb(15 23 42 / 0.08)',
  lg: '0 10px 15px -3px rgb(15 23 42 / 0.18), 0 4px 6px -4px rgb(15 23 42 / 0.1)'
};

export const tokens = {
  colors: {
    brand: brandColors,
    neutral: neutralColors,
    surface: surfaceColors
  },
  radii,
  fonts: fonts,
  shadows
} as const;

export type SongForgeTokens = typeof tokens;

