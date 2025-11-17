"use client";

import { Button, cn } from "@cronkwaters/ui";

import { useTheme } from "../../app/providers";

const OPTIONS = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "warm", label: "Warm" },
] as const;

type ThemeOptionId = (typeof OPTIONS)[number]["id"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className="border-border/60 bg-surface/70 shadow-soft flex items-center gap-1 rounded-full border p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = option.id === theme;
        return (
          <Button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(option.id as ThemeOptionId)}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 flex-1 rounded-full text-xs font-medium uppercase tracking-[0.28em] transition-colors motion-safe:duration-150",
              isActive
                ? "bg-brand-primary/20 text-brand-foreground hover:bg-brand-primary/25"
                : "text-muted-foreground hover:text-brand-foreground",
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
