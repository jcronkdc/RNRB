'use client';

import { forwardRef, SVGProps } from 'react';

// Custom SVG Icons for the UI Package
// All icons are custom-designed, no stock or boilerplate icons

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
}

const createIcon = (path: React.ReactNode, displayName: string, defaultStrokeWidth = 2) => {
  const Icon = forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth = defaultStrokeWidth, className = '', ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {path}
      </svg>
    )
  );
  Icon.displayName = displayName;
  return Icon;
};

// Check - confirmation checkmark
export const Check = createIcon(
  <>
    <polyline points="20 6 9 17 4 12" />
  </>,
  'Check'
);

// ChevronDown - expand indicator
export const ChevronDown = createIcon(
  <>
    <polyline points="6 9 12 15 18 9" />
  </>,
  'ChevronDown'
);

// ChevronUp - collapse indicator
export const ChevronUp = createIcon(
  <>
    <polyline points="18 15 12 9 6 15" />
  </>,
  'ChevronUp'
);

// ChevronRight - navigation indicator
export const ChevronRight = createIcon(
  <>
    <polyline points="9 18 15 12 9 6" />
  </>,
  'ChevronRight'
);

// Circle - dot/bullet
export const Circle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
  </>,
  'Circle'
);

// X - close/dismiss
export const X = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
  'X'
);

// Type alias for LucideIcon compatibility
export type LucideIcon = typeof Check;

export default {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Circle,
  X,
};
