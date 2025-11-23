import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    return (
      <div
        className={cn(
          'group relative flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 motion-safe:transition-all motion-safe:duration-200',
          disabled && 'opacity-60',
          containerClassName
        )}
        aria-disabled={disabled ? 'true' : undefined}
      >
        {LeadingIcon &&
          React.createElement(
            LeadingIcon as React.ComponentType<{ className?: string; 'aria-hidden'?: string }>,
            {
              className:
                'h-4 w-4 flex-shrink-0 text-muted-foreground motion-safe:transition-colors group-focus-within:text-brand-primary',
              'aria-hidden': 'true',
            }
          )}
        <input
          ref={innerRef}
          type={type}
          disabled={disabled}
          className={cn(
            'flex h-6 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/80',
            className
          )}
          {...props}
        />
        {TrailingIcon &&
          React.createElement(
            TrailingIcon as React.ComponentType<{ className?: string; 'aria-hidden'?: string }>,
            {
              className:
                'h-4 w-4 flex-shrink-0 text-muted-foreground motion-safe:transition-colors group-focus-within:text-brand-primary',
              'aria-hidden': 'true',
            }
          )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
export type { InputProps };
