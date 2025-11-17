import type { Config } from "tailwindcss";
import { brandColors, neutralColors, radii, shadows, surfaceColors, fontStack } from "./src/theme/tokens";

const config: Config = {
  presets: [],
  content: ["./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        brand: brandColors,
        neutral: neutralColors,
        surface: surfaceColors
      },
      fontFamily: {
        sans: fontStack.sans,
        mono: fontStack.mono
      },
      borderRadius: {
        xs: radii.xs,
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl
      },
      boxShadow: {
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg
      }
    }
  },
  plugins: []
};

export default config;

