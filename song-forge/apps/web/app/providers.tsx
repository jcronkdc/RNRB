"use client";

import { TrpcProvider } from "@cronkwaters/trpc";
import { ThemeProvider, ToastProvider } from "@cronkwaters/ui";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { MotionProvider } from "../components/motion-provider";

type ThemeMode = "light" | "dark" | "warm";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (value: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "cronkwaters-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within Providers");
  }
  return context;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light" || attr === "warm") {
      return attr as ThemeMode;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "dark" || stored === "light" || stored === "warm") {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (!stored) {
      setThemeState(media.matches ? "dark" : "light");
    }

    const handleChange = (event: MediaQueryListEvent) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setThemeState(event.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((value: ThemeMode) => {
    setThemeState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : prev === "light" ? "warm" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <MotionProvider>
          <TrpcProvider>
            <ToastProvider>{children}</ToastProvider>
          </TrpcProvider>
        </MotionProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
