import { ReactNode } from 'react';
import { Button } from '@songforge/ui';
import { cn } from '@songforge/ui';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-gradient-to-br from-surface/70 to-surface-muted/50 p-16 text-center shadow-soft',
        className
      )}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="sf-bg-gradient" />
      </div>
      <div className="relative">
        <div className="mb-4 inline-flex rounded-full bg-brand-primary/10 p-3 text-brand-primary">
          {icon}
        </div>
        <p className="text-xl font-semibold text-brand-foreground">{title}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {action && (
          <div className="mt-6">
            <Button onClick={action.onClick} className="sf-btn-primary">
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

