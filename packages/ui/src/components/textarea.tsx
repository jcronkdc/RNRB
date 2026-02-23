import * as React from 'react';

import { cn } from '../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxRows, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'shadow-xs focus-visible:outline-hidden flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:transition-all motion-safe:duration-200',
        maxRows && 'resize-y',
        className
      )}
      {...(maxRows ? { style: { maxHeight: `${maxRows * 1.5}rem` } } : {})}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
