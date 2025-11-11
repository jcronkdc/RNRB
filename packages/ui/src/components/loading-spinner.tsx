import * as React from 'react';
import { cn } from '../lib/utils';

export interface LoadingSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  label?: string;
}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, label = 'Loading', ...props }, ref) => (
    <svg
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn('h-5 w-5 animate-spin text-brand-primary motion-safe:transition-colors', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
);
LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
export type { LoadingSpinnerProps };

