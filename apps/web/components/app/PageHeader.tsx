import type { ReactNode } from 'react';
import { cn } from '@songforge/ui';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative flex flex-col gap-6 border-b border-border/60 pb-8 motion-safe:animate-fade-in md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-brand-foreground md:text-5xl">{title}</h1>
        {subtitle ? (
          <p className="text-base leading-relaxed text-muted-foreground md:max-w-2xl md:text-lg">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  );
}
