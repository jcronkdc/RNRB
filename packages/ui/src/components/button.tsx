import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background',
  {
    variants: {
      variant: {
        solid: 'bg-brand-primary text-brand-primary-foreground shadow-soft hover:bg-brand-primary/92 hover:shadow-elevated motion-safe:active:scale-[0.99]',
        outline:
          'border border-border bg-transparent text-brand-foreground shadow-outline hover:bg-brand-muted/70 hover:text-brand-primary motion-safe:active:scale-[0.99]',
        ghost:
          'bg-transparent text-brand-foreground hover:bg-brand-muted/60 motion-safe:active:scale-[0.99]',
        subtle:
          'bg-brand-muted text-brand-muted-foreground shadow-soft hover:bg-brand-muted/90 hover:shadow-elevated motion-safe:active:scale-[0.99]',
        destructive:
          'bg-danger text-danger-foreground shadow-soft hover:bg-danger/90 hover:shadow-elevated motion-safe:active:scale-[0.99]',
        link: 'text-brand-secondary underline-offset-4 hover:underline motion-safe:active:scale-100',
        default:
          'bg-brand-primary text-brand-primary-foreground shadow-soft hover:bg-brand-primary/92 hover:shadow-elevated motion-safe:active:scale-[0.99]'
      },
      size: {
        sm: 'h-9 rounded-lg px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 rounded-full p-0'
      }
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md'
    }
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  iconClassName?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      iconClassName,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const showLeading = Boolean(LeadingIcon);
    const showTrailing = Boolean(TrailingIcon);

    const content = (
      <>
        {showLeading && LeadingIcon && (
          <span
            className={cn('inline-flex items-center justify-center', size === 'icon' ? 'mx-auto' : '')}
            aria-hidden="true"
          >
            {React.createElement(LeadingIcon as React.ComponentType<{ className?: string }>, { className: cn('h-4 w-4', iconClassName) })}
          </span>
        )}
        {children && <span className="whitespace-nowrap">{children}</span>}
        {showTrailing && TrailingIcon && (
          <span
            className={cn('inline-flex items-center justify-center', size === 'icon' ? 'mx-auto' : '')}
            aria-hidden="true"
          >
            {React.createElement(TrailingIcon as React.ComponentType<{ className?: string }>, { className: cn('h-4 w-4', iconClassName) })}
          </span>
        )}
      </>
    );

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          size === 'icon' && 'gap-0',
          className
        )}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {asChild ? children : content}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

interface IconButtonProps
  extends Omit<ButtonProps, 'children' | 'size' | 'leadingIcon' | 'trailingIcon'> {
  icon: LucideIcon;
  srLabel: string;
  asChild?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, srLabel, variant = 'ghost', iconClassName, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      leadingIcon={Icon}
      iconClassName={iconClassName}
      className={cn('rounded-full', className)}
      aria-label={srLabel}
      {...props}
    >
      <span className="sr-only">{srLabel}</span>
    </Button>
  )
);
IconButton.displayName = 'IconButton';

export { Button, IconButton, buttonVariants };
export type { ButtonProps, IconButtonProps };
