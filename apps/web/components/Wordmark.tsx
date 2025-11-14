'use client';

import { cn } from "@cronkwaters/ui";

interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <div className={cn("font-serif font-bold text-2xl tracking-tighter", className)}>
      CronkWaters
    </div>
  );
}
