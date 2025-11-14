'use client';

import { cn } from "@cronkwaters/ui";

interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <div className={cn("font-bold text-xl tracking-tight", className)}>
      CronkWaters
    </div>
  );
}
