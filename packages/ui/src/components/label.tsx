import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

import { cn } from '../lib/utils';

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  hint?: React.ReactNode;
  required?: boolean;
}

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, children, hint, required, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'flex flex-col text-sm font-medium text-brand-foreground motion-safe:transition-colors motion-safe:duration-200',
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {required && (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {hint ? <span className="mt-1 text-xs text-muted-foreground">{hint}</span> : null}
    </LabelPrimitive.Root>
  )
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
export type { LabelProps };
