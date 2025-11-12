import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent px-2.5 py-1 text-xs font-medium uppercase tracking-[0.32em] motion-safe:transition-colors motion-safe:duration-200',
  {
    variants: {
      variant: {
        solid: 'bg-brand-primary text-brand-primary-foreground shadow-soft',
        subtle: 'bg-brand-muted text-brand-muted-foreground',
        outline: 'border-border text-brand-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        danger: 'bg-danger text-danger-foreground',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      }
    },
    defaultVariants: {
      variant: 'subtle'
    }
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export type { BadgeProps };

