'use client';

import { forwardRef, SVGProps } from 'react';

// Custom SVG Icon Library for Rock N' Roll Basement
// All icons are custom-designed, no stock or boilerplate icons

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
}

/**
 * Type for icon components (compatible with Lucide icon type)
 * Use this when you need to pass icons as props
 */
export type LucideIcon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

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

// Activity - pulse monitor with musical wave
export const Activity = createIcon(
  <>
    <path d="M2 12h3l3-9 4 18 4-9h6" />
  </>,
  'Activity'
);

// AlertCircle - warning with inner exclamation
export const AlertCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.5" fill="currentColor" />
  </>,
  'AlertCircle'
);

// AlertTriangle - caution triangle
export const AlertTriangle = createIcon(
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </>,
  'AlertTriangle'
);

// Flag - report/flag content
export const Flag = createIcon(
  <>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </>,
  'Flag'
);

// ThumbsUp - helpful/like
export const ThumbsUp = createIcon(
  <>
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </>,
  'ThumbsUp'
);

// ThumbsDown - not helpful/dislike
export const ThumbsDown = createIcon(
  <>
    <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
  </>,
  'ThumbsDown'
);

// ArrowUpRight - trending up arrow
export const ArrowUpRight = createIcon(
  <>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </>,
  'ArrowUpRight'
);

// ArrowDownRight - trending down arrow
export const ArrowDownRight = createIcon(
  <>
    <line x1="7" y1="7" x2="17" y2="17" />
    <polyline points="17 7 17 17 7 17" />
  </>,
  'ArrowDownRight'
);

// ArrowDown
export const ArrowDown = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </>,
  'ArrowDown'
);

// ArrowLeft
export const ArrowLeft = createIcon(
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>,
  'ArrowLeft'
);

// ArrowRight
export const ArrowRight = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>,
  'ArrowRight'
);

// ArrowUp
export const ArrowUp = createIcon(
  <>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </>,
  'ArrowUp'
);

// Award - rock trophy/medal
export const Award = createIcon(
  <>
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    <path d="M12 2v2" />
    <path d="M12 6l2 2-2 2-2-2z" fill="currentColor" />
  </>,
  'Award'
);

// BarChart3 - analytics bars
export const BarChart3 = createIcon(
  <>
    <path d="M3 3v18h18" />
    <rect x="7" y="13" width="3" height="6" rx="0.5" />
    <rect x="12" y="9" width="3" height="10" rx="0.5" />
    <rect x="17" y="5" width="3" height="14" rx="0.5" />
  </>,
  'BarChart3'
);

// Bell - notification bell
export const Bell = createIcon(
  <>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </>,
  'Bell'
);

// Bookmark - save/favorite items
export const Bookmark = createIcon(
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  'Bookmark'
);

// Book - songbook/manual
export const Book = createIcon(
  <>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h6" />
  </>,
  'Book'
);

// Brain - AI/creative thinking
export const Brain = createIcon(
  <>
    <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44" />
    <path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44" />
    <path d="M4.5 10a2.5 2.5 0 000 5" />
    <path d="M19.5 10a2.5 2.5 0 010 5" />
    <path d="M8.5 8.5a2.5 2.5 0 00-2-2.45" />
    <path d="M15.5 8.5a2.5 2.5 0 012-2.45" />
    <path d="M8.5 15.5a2.5 2.5 0 01-2 2.45" />
    <path d="M15.5 15.5a2.5 2.5 0 002 2.45" />
  </>,
  'Brain'
);

// Briefcase - professional/gigs
export const Briefcase = createIcon(
  <>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    <path d="M2 12h20" />
  </>,
  'Briefcase'
);

// Building2 - venue/studio
export const Building2 = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
    <path d="M6 6h.01" />
    <path d="M9 6h.01" />
    <path d="M12 6h.01" />
  </>,
  'Building2'
);

// Building - alias for Building2
export const Building = Building2;

// Bot - AI assistant
export const Bot = createIcon(
  <>
    <path d="M12 8V4H8" />
    <rect x="8" y="8" width="8" height="12" rx="2" />
    <path d="M12 8a4 4 0 0 0-4 4" />
    <circle cx="10" cy="13" r="1" />
    <circle cx="14" cy="13" r="1" />
    <path d="M10 17h4" />
  </>,
  'Bot'
);

// Camera - photo/media
export const Camera = createIcon(
  <>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </>,
  'Camera'
);

// Tv - broadcast/media
export const Tv = createIcon(
  <>
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </>,
  'Tv'
);

// Newspaper - press/EPK
export const Newspaper = createIcon(
  <>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </>,
  'Newspaper'
);

// PlayCircle - play in circle
export const PlayCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </>,
  'PlayCircle'
);

// Repeat2 - repost/share
export const Repeat2 = createIcon(
  <>
    <path d="m2 9 3-3 3 3" />
    <path d="M13 18H7a2 2 0 0 1-2-2V6" />
    <path d="m22 15-3 3-3-3" />
    <path d="M11 6h6a2 2 0 0 1 2 2v10" />
  </>,
  'Repeat2'
);

// Link - link/chain
export const Link = createIcon(
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>,
  'Link'
);

// Instagram - social media
export const Instagram = createIcon(
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>,
  'Instagram'
);

// Facebook - social media
export const Facebook = createIcon(
  <>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </>,
  'Facebook'
);

// Twitter - social media
export const Twitter = createIcon(
  <>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </>,
  'Twitter'
);

// Unplug - disconnect
export const Unplug = createIcon(
  <>
    <path d="m19 5 3-3" />
    <path d="m2 22 3-3" />
    <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" />
    <path d="M7.5 13.5 10 11" />
    <path d="M10.5 16.5 13 14" />
    <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z" />
  </>,
  'Unplug'
);

// History - history/timeline
export const History = createIcon(
  <>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </>,
  'History'
);

// SlidersHorizontal - horizontal sliders
export const SlidersHorizontal = createIcon(
  <>
    <line x1="21" x2="14" y1="4" y2="4" />
    <line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" />
    <line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" />
    <line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="16" x2="16" y1="18" y2="22" />
  </>,
  'SlidersHorizontal'
);

// Image - photo/image (alias for ImageIcon)
export const Image = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </>,
  'Image'
);

// Youtube - video platform
export const Youtube = createIcon(
  <>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </>,
  'Youtube'
);

// ZoomIn - zoom in
export const ZoomIn = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </>,
  'ZoomIn'
);

// Utensils - food/catering
export const Utensils = createIcon(
  <>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </>,
  'Utensils'
);

// Car - transportation
export const Car = createIcon(
  <>
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
    <circle cx="6.5" cy="16.5" r="2.5" />
    <circle cx="16.5" cy="16.5" r="2.5" />
  </>,
  'Car'
);

// Bed - accommodation
export const Bed = createIcon(
  <>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </>,
  'Bed'
);

// Calendar - tour/gig calendar with music theme
export const Calendar = createIcon(
  <>
    {/* Calendar frame */}
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Binding rings */}
    <line x1="7" y1="2" x2="7" y2="6" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="12" y1="2" x2="12" y2="6" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="17" y1="2" x2="17" y2="6" strokeWidth="1.8" strokeLinecap="round" />
    {/* Header separator */}
    <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1.5" />
    {/* Date markers with music notes */}
    <circle cx="8" cy="13" r="0.8" fill="currentColor" opacity="0.4" />
    <circle cx="12" cy="13" r="0.8" fill="currentColor" opacity="0.4" />
    <circle cx="16" cy="13" r="0.8" fill="currentColor" opacity="0.4" />
    {/* Featured show date (music note) */}
    <circle cx="12" cy="17" r="1.2" fill="currentColor" />
    <line x1="13.2" y1="17" x2="13.2" y2="14" strokeWidth="1.2" />
    {/* Venue marker (pin shape) */}
    <path
      d="M16 17.5c0 1-.7 1.5-1 1.5s-1-.5-1-1.5c0-.8.5-1.2 1-1.5.5.3 1 .7 1 1.5z"
      fill="currentColor"
      opacity="0.6"
    />
  </>,
  'Calendar'
);

// Check - confirmation
export const Check = createIcon(
  <>
    <polyline points="20 6 9 17 4 12" />
  </>,
  'Check'
);

// CheckCheck - double check/verified
export const CheckCheck = createIcon(
  <>
    <polyline points="9 11 12 14 22 4" />
    <polyline points="2 11 5 14 15 4" opacity="0.5" />
  </>,
  'CheckCheck'
);

// CheckCircle - success circle
export const CheckCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="16 9 11 15 8 12" />
  </>,
  'CheckCircle'
);

// CheckCircle2 - filled success
export const CheckCircle2 = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </>,
  'CheckCircle2'
);

// ChevronDown
export const ChevronDown = createIcon(
  <>
    <polyline points="6 9 12 15 18 9" />
  </>,
  'ChevronDown'
);

// ChevronLeft
export const ChevronLeft = createIcon(
  <>
    <polyline points="15 18 9 12 15 6" />
  </>,
  'ChevronLeft'
);

// ChevronRight
export const ChevronRight = createIcon(
  <>
    <polyline points="9 18 15 12 9 6" />
  </>,
  'ChevronRight'
);

// ChevronUp
export const ChevronUp = createIcon(
  <>
    <polyline points="18 15 12 9 6 15" />
  </>,
  'ChevronUp'
);

// Circle - simple circle
export const Circle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
  </>,
  'Circle'
);

// ClipboardList - checklist/notes
export const ClipboardList = createIcon(
  <>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </>,
  'ClipboardList'
);

// Clock - time
export const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>,
  'Clock'
);

// Coffee - break/support
export const Coffee = createIcon(
  <>
    <path d="M17 8h1a4 4 0 010 8h-1" />
    <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </>,
  'Coffee'
);

// Command - keyboard shortcut
export const Command = createIcon(
  <>
    <path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z" />
  </>,
  'Command'
);

// Compass - explore/discover
export const Compass = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </>,
  'Compass'
);

// Copy - duplicate
export const Copy = createIcon(
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </>,
  'Copy'
);

// Coins - currency/money
export const Coins = createIcon(
  <>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h2v4" />
    <circle cx="16" cy="16" r="6" />
    <path d="M15 14h2v4" />
  </>,
  'Coins'
);

// CreditCard - payment
export const CreditCard = createIcon(
  <>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <path d="M5 15h4" />
  </>,
  'CreditCard'
);

// Crown - premium/VIP
export const Crown = createIcon(
  <>
    <path d="M2 17l3-6 4 4 3-8 3 8 4-4 3 6" />
    <path d="M2 17h20v4H2z" />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
  </>,
  'Crown'
);

// Disc - detailed vinyl record with grooves
export const Disc = createIcon(
  <>
    {/* Outer edge of vinyl */}
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Groove rings (visible grooves on vinyl) */}
    <circle
      cx="12"
      cy="12"
      r="8.5"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.5"
    />
    <circle
      cx="12"
      cy="12"
      r="7.5"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.5"
    />
    <circle
      cx="12"
      cy="12"
      r="6.5"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.5"
    />
    <circle
      cx="12"
      cy="12"
      r="5.5"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.5"
    />
    {/* Label area */}
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.2" fill="none" />
    {/* Center spindle hole */}
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    {/* Label text marks (simulated) */}
    <line x1="10" y1="9.5" x2="14" y2="9.5" strokeWidth="0.4" opacity="0.4" />
    <line x1="10.5" y1="11" x2="13.5" y2="11" strokeWidth="0.4" opacity="0.4" />
    <line x1="10" y1="14.5" x2="14" y2="14.5" strokeWidth="0.4" opacity="0.4" />
    {/* Side highlight (gives depth) */}
    <path d="M3 12c0-4 2.5-7.5 6-8.5" strokeWidth="0.8" opacity="0.3" fill="none" />
  </>,
  'Disc'
);

// Disc3 - circle of fifths
export const Disc3 = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </>,
  'Disc3'
);

// DollarSign - money/revenue
export const DollarSign = createIcon(
  <>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </>,
  'DollarSign'
);

// Download - download file
export const Download = createIcon(
  <>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>,
  'Download'
);

// Drum - percussion instrument
export const Drum = createIcon(
  <>
    <ellipse cx="12" cy="8" rx="9" ry="4" />
    <path d="M3 8v8c0 2.2 4 4 9 4s9-1.8 9-4V8" />
    <path d="M3 12c0 2.2 4 4 9 4s9-1.8 9-4" />
    <line x1="6" y1="4" x2="3" y2="8" />
    <line x1="18" y1="4" x2="21" y2="8" />
  </>,
  'Drum'
);

// Edit - edit/pencil
export const Edit = createIcon(
  <>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>,
  'Edit'
);

// Edit2 - pencil only
export const Edit2 = createIcon(
  <>
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </>,
  'Edit2'
);

// Edit3 - edit with line
export const Edit3 = createIcon(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </>,
  'Edit3'
);

// ExternalLink - open in new tab
export const ExternalLink = createIcon(
  <>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </>,
  'ExternalLink'
);

// Eye - view/visible
export const Eye = createIcon(
  <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  'Eye'
);

// File - generic file
export const File = createIcon(
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </>,
  'File'
);

// FileAudio - audio file
export const FileAudio = createIcon(
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 12v6" />
    <path d="M14 14v4" />
    <path d="M8 15v2" />
    <path d="M16 13v4" />
  </>,
  'FileAudio'
);

// FileCheck - verified file
export const FileCheck = createIcon(
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="9 15 11 17 15 13" />
  </>,
  'FileCheck'
);

// FileText - document
export const FileText = createIcon(
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </>,
  'FileText'
);

// Flame - hot/trending
export const Flame = createIcon(
  <>
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
  </>,
  'Flame'
);

// Folder - directory/project
export const Folder = createIcon(
  <>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </>,
  'Folder'
);

// Gauge - speed/performance
export const Gauge = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8l3 4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </>,
  'Gauge'
);

// Gift - present/bonus
export const Gift = createIcon(
  <>
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </>,
  'Gift'
);

// GitBranch - version control
export const GitBranch = createIcon(
  <>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 01-9 9" />
  </>,
  'GitBranch'
);

// Globe - public/world
export const Globe = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </>,
  'Globe'
);

// Grid - grid view
export const Grid = createIcon(
  <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </>,
  'Grid'
);

// Grid3x3 - 3x3 grid
export const Grid3x3 = createIcon(
  <>
    <rect x="3" y="3" width="5" height="5" />
    <rect x="10" y="3" width="5" height="5" />
    <rect x="17" y="3" width="5" height="5" />
    <rect x="3" y="10" width="5" height="5" />
    <rect x="10" y="10" width="5" height="5" />
    <rect x="17" y="10" width="5" height="5" />
    <rect x="3" y="17" width="5" height="5" />
    <rect x="10" y="17" width="5" height="5" />
    <rect x="17" y="17" width="5" height="5" />
  </>,
  'Grid3x3'
);

// GripVertical - drag handle
export const GripVertical = createIcon(
  <>
    <circle cx="9" cy="6" r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="18" r="1" fill="currentColor" />
    <circle cx="15" cy="6" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="18" r="1" fill="currentColor" />
  </>,
  'GripVertical'
);

// Guitar - electric guitar
export const Guitar = createIcon(
  <>
    <path d="M19.5 4.5l-2 2" />
    <path d="M17 7l-3.5-1.5L12 7l-1.5 1.5L9 7 7.5 8.5 9 12l-4 4a2.83 2.83 0 004 4l4-4 3.5 1.5L18 16l1.5-1.5L18 13l1.5-1.5L21 13l1.5-1.5-6-6z" />
    <circle cx="7" cy="17" r="1" />
  </>,
  'Guitar'
);

// HardDrive - storage
export const HardDrive = createIcon(
  <>
    <line x1="22" y1="12" x2="2" y2="12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    <line x1="6" y1="16" x2="6.01" y2="16" />
    <line x1="10" y1="16" x2="10.01" y2="16" />
  </>,
  'HardDrive'
);

// Hash - hashtag/tag
export const Hash = createIcon(
  <>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </>,
  'Hash'
);

// Heart - like/favorite
export const Heart = createIcon(
  <>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </>,
  'Heart'
);

// HelpCircle - help/info
export const HelpCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </>,
  'HelpCircle'
);

// Home - homepage
export const Home = createIcon(
  <>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>,
  'Home'
);

// ImageIcon - image/photo
export const ImageIcon = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </>,
  'ImageIcon'
);

// Info - information
export const Info = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </>,
  'Info'
);

// Keyboard - keyboard
export const Keyboard = createIcon(
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <path d="M6 8h.001" />
    <path d="M10 8h.001" />
    <path d="M14 8h.001" />
    <path d="M18 8h.001" />
    <path d="M8 12h.001" />
    <path d="M12 12h.001" />
    <path d="M16 12h.001" />
    <path d="M7 16h10" />
  </>,
  'Keyboard'
);

// Layers - stacked elements
export const Layers = createIcon(
  <>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </>,
  'Layers'
);

// LayoutDashboard - dashboard
export const LayoutDashboard = createIcon(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </>,
  'LayoutDashboard'
);

// Link (exported as LinkIcon)
export const LinkIcon = createIcon(
  <>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </>,
  'LinkIcon'
);

// List - list view
export const List = createIcon(
  <>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" fill="currentColor" />
    <circle cx="4" cy="12" r="1" fill="currentColor" />
    <circle cx="4" cy="18" r="1" fill="currentColor" />
  </>,
  'List'
);

// ListMusic - music list
export const ListMusic = createIcon(
  <>
    <path d="M21 15V6" />
    <path d="M18.5 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path d="M12 12H3" />
    <path d="M16 6H3" />
    <path d="M12 18H3" />
  </>,
  'ListMusic'
);

// Loader2 - spinning loader
export const Loader2 = createIcon(
  <>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </>,
  'Loader2'
);

// Lock - private/locked
export const Lock = createIcon(
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </>,
  'Lock'
);

// Unlock - unlocked padlock
export const Unlock = createIcon(
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 019.9-1" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </>,
  'Unlock'
);

// LogOut - sign out
export const LogOut = createIcon(
  <>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>,
  'LogOut'
);

// Mail - email
export const Mail = createIcon(
  <>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </>,
  'Mail'
);

// MapPin - location
export const MapPin = createIcon(
  <>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </>,
  'MapPin'
);

// Maximize2 - fullscreen
export const Maximize2 = createIcon(
  <>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </>,
  'Maximize2'
);

// Medal - achievement
export const Medal = createIcon(
  <>
    <path d="M7.21 15L2.66 7.14a2 2 0 01.13-2.2L4.4 2.8A2 2 0 016 2h12a2 2 0 011.6.8l1.6 2.14a2 2 0 01.14 2.2L16.79 15" />
    <path d="M11 12L5.12 2.2" />
    <path d="M13 12l5.88-9.8" />
    <circle cx="12" cy="17" r="5" />
    <path d="M12 14v4" />
    <path d="M10 16h4" />
  </>,
  'Medal'
);

// Megaphone - announcements/wanted
export const Megaphone = createIcon(
  <>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </>,
  'Megaphone'
);

// Menu - hamburger menu
export const Menu = createIcon(
  <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>,
  'Menu'
);

// MessageCircle - chat bubble
export const MessageCircle = createIcon(
  <>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </>,
  'MessageCircle'
);

// MessageSquare - message box
export const MessageSquare = createIcon(
  <>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </>,
  'MessageSquare'
);

// Mic - microphone
export const Mic = createIcon(
  <>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </>,
  'Mic'
);

// Mic2 - vintage condenser studio microphone (detailed)
export const Mic2 = createIcon(
  <>
    {/* Microphone capsule (top) */}
    <ellipse cx="12" cy="6" rx="3.5" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Capsule grille lines */}
    <line x1="9" y1="4" x2="15" y2="4" strokeWidth="0.3" opacity="0.6" />
    <line x1="9" y1="6" x2="15" y2="6" strokeWidth="0.3" opacity="0.6" />
    <line x1="9" y1="8" x2="15" y2="8" strokeWidth="0.3" opacity="0.6" />
    {/* Microphone body */}
    <rect
      x="10.5"
      y="10"
      width="3"
      height="8"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Body accent ring */}
    <line x1="10" y1="14" x2="14" y2="14" strokeWidth="0.8" />
    {/* XLR connection at bottom */}
    <circle cx="12" cy="19" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="11" cy="19.5" r="0.3" fill="currentColor" />
    <circle cx="13" cy="19.5" r="0.3" fill="currentColor" />
    <circle cx="12" cy="18.5" r="0.3" fill="currentColor" />
    {/* Mic stand mount */}
    <path d="M12 20.5v1.5" strokeWidth="1.5" />
    <line x1="10" y1="22" x2="14" y2="22" strokeWidth="1.5" strokeLinecap="round" />
  </>,
  'Mic2'
);

// MicOff - muted mic
export const MicOff = createIcon(
  <>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </>,
  'MicOff'
);

// Minus - subtract
export const Minus = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
  'Minus'
);

// Monitor - screen/display
export const Monitor = createIcon(
  <>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </>,
  'Monitor'
);

// MonitorOff - display off
export const MonitorOff = createIcon(
  <>
    <path d="M17 17H4a2 2 0 01-2-2V5c0-1.5 1-2 1-2" />
    <path d="M22 15V5a2 2 0 00-2-2H9" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>,
  'MonitorOff'
);

// MonitorSpeaker - screen share/display with sound
export const MonitorSpeaker = createIcon(
  <>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M8 8l2 2 2-2 2 2" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" />
  </>,
  'MonitorSpeaker'
);

// MonitorUp - screenshare/cast
export const MonitorUp = createIcon(
  <>
    <rect x="2" y="5" width="20" height="12" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="12 8 15 11 12 14 9 11 12 8" />
  </>,
  'MonitorUp'
);

// MonitorX - stop screenshare
export const MonitorX = createIcon(
  <>
    <rect x="2" y="5" width="20" height="12" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <line x1="9" y1="8" x2="15" y2="14" />
    <line x1="15" y1="8" x2="9" y2="14" />
  </>,
  'MonitorX'
);

// Presentation - presenter/stage mode display
export const Presentation = createIcon(
  <>
    <path d="M2 3h20" />
    <path d="M21 3v11a2 2 0 01-2 2H5a2 2 0 01-2-2V3" />
    <path d="M7 21l5-5 5 5" />
    <path d="M12 16v-5" />
    <path d="M8 8h.01" />
    <path d="M12 8h.01" />
    <path d="M16 8h.01" />
  </>,
  'Presentation'
);

// Moon - dark mode
export const Moon = createIcon(
  <>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </>,
  'Moon'
);

// MoreHorizontal - horizontal dots menu
export const MoreHorizontal = createIcon(
  <>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
  </>,
  'MoreHorizontal'
);

// MoreVertical - vertical dots menu
export const MoreVertical = createIcon(
  <>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </>,
  'MoreVertical'
);

// Mouse - mouse device
export const Mouse = createIcon(
  <>
    <rect x="6" y="3" width="12" height="18" rx="6" />
    <line x1="12" y1="7" x2="12" y2="11" />
  </>,
  'Mouse'
);

// MousePointer2 - cursor
export const MousePointer2 = createIcon(
  <>
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
  </>,
  'MousePointer2'
);

// Music - music note
export const Music = createIcon(
  <>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </>,
  'Music'
);

// Music2 - double music note
export const Music2 = createIcon(
  <>
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="14" r="3" />
    <path d="M9 18V5l12-2v11" />
    <path d="M9 9l12-2" />
  </>,
  'Music2'
);

// Navigation - direction
export const Navigation = createIcon(
  <>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </>,
  'Navigation'
);

// Palette - colors/design
export const Palette = createIcon(
  <>
    <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </>,
  'Palette'
);

// Paperclip - attachment
export const Paperclip = createIcon(
  <>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </>,
  'Paperclip'
);

// Package - box/package
export const Package = createIcon(
  <>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </>,
  'Package'
);

// Pause - pause playback
export const Pause = createIcon(
  <>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </>,
  'Pause'
);

// Phone - telephone
export const Phone = createIcon(
  <>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </>,
  'Phone'
);

// PhoneOff - end call
export const PhoneOff = createIcon(
  <>
    <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67m-2.67-3.34a19.79 19.79 0 01-3.07-8.63A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </>,
  'PhoneOff'
);

// Piano - keyboard instrument
export const Piano = createIcon(
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="6" y1="12" x2="6" y2="20" />
    <line x1="10" y1="12" x2="10" y2="20" />
    <line x1="14" y1="12" x2="14" y2="20" />
    <line x1="18" y1="12" x2="18" y2="20" />
    <rect x="5" y="4" width="2" height="8" fill="currentColor" />
    <rect x="9" y="4" width="2" height="8" fill="currentColor" />
    <rect x="13" y="4" width="2" height="8" fill="currentColor" />
    <rect x="17" y="4" width="2" height="8" fill="currentColor" />
  </>,
  'Piano'
);

// Pin - pinned item
export const Pin = createIcon(
  <>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z" />
  </>,
  'Pin'
);

// Play - play button
export const Play = createIcon(
  <>
    <polygon points="5 3 19 12 5 21 5 3" />
  </>,
  'Play'
);

// Plus - add
export const Plus = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
  'Plus'
);

// Printer - print
export const Printer = createIcon(
  <>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </>,
  'Printer'
);

// Quote - quotation
export const Quote = createIcon(
  <>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4z" />
  </>,
  'Quote'
);

// Radio - broadcast tower with sound waves (live streaming)
export const Radio = createIcon(
  <>
    {/* Broadcast tower structure */}
    <path d="M12 2v8" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 4l2-2 2 2" strokeWidth="1.2" fill="none" />
    {/* Tower top antenna */}
    <circle cx="12" cy="2" r="1" fill="currentColor" />
    <line x1="11" y1="2" x2="10" y2="1" strokeWidth="0.8" />
    <line x1="13" y1="2" x2="14" y2="1" strokeWidth="0.8" />
    {/* Tower cross beams */}
    <line x1="10" y1="6" x2="14" y2="6" strokeWidth="1" opacity="0.6" />
    <line x1="10.5" y1="8" x2="13.5" y2="8" strokeWidth="1" opacity="0.6" />
    {/* Transmitter pod */}
    <rect x="10" y="9" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.8" />
    {/* Base platform */}
    <path d="M8 12l4 2 4-2" strokeWidth="1.5" fill="none" />
    <rect
      x="9"
      y="14"
      width="6"
      height="8"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Control panel details */}
    <circle cx="11" cy="17" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="13" cy="17" r="0.8" fill="currentColor" opacity="0.5" />
    <line x1="10" y1="20" x2="14" y2="20" strokeWidth="0.8" opacity="0.4" />
    {/* Broadcast waves (left) */}
    <path d="M6 10c-1.5 1-2 2.5-2 4s.5 3 2 4" strokeWidth="1.2" fill="none" opacity="0.6" />
    <path d="M3 8c-2 1.5-3 3.5-3 6s1 4.5 3 6" strokeWidth="1" fill="none" opacity="0.4" />
    {/* Broadcast waves (right) */}
    <path d="M18 10c1.5 1 2 2.5 2 4s-.5 3-2 4" strokeWidth="1.2" fill="none" opacity="0.6" />
    <path d="M21 8c2 1.5 3 3.5 3 6s-1 4.5-3 6" strokeWidth="1" fill="none" opacity="0.4" />
  </>,
  'Radio'
);

// RefreshCw - refresh/sync
export const RefreshCw = createIcon(
  <>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </>,
  'RefreshCw'
);

// Reply - reply to message
export const Reply = createIcon(
  <>
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 00-4-4H4" />
  </>,
  'Reply'
);

// RotateCcw - rotate counter-clockwise
export const RotateCcw = createIcon(
  <>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </>,
  'RotateCcw'
);

// RotateCw - rotate clockwise
export const RotateCw = createIcon(
  <>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </>,
  'RotateCw'
);

// Ruler - measurement
export const Ruler = createIcon(
  <>
    <path d="M21.9 8.9l-6.8-6.8a.7.7 0 00-1 0L2.1 14.1a.7.7 0 000 1l6.8 6.8a.7.7 0 001 0l12-12a.7.7 0 000-1z" />
    <line x1="7" y1="17" x2="11" y2="13" />
    <line x1="11" y1="17" x2="15" y2="13" />
    <line x1="15" y1="17" x2="19" y2="13" />
  </>,
  'Ruler'
);

// Save - save/disk
export const Save = createIcon(
  <>
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </>,
  'Save'
);

// Search - magnifying glass
export const Search = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>,
  'Search'
);

// Send - send message
export const Send = createIcon(
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </>,
  'Send'
);

// Settings - gear/cog
export const Settings = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </>,
  'Settings'
);

// Sliders - mixer/controls
export const Sliders = createIcon(
  <>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </>,
  'Sliders'
);

// Share2 - share network
export const Share2 = createIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>,
  'Share2'
);

// Shield - security
export const Shield = createIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </>,
  'Shield'
);

// ShieldCheck - verified security
export const ShieldCheck = createIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </>,
  'ShieldCheck'
);

// ShoppingBag - merchandise
export const ShoppingBag = createIcon(
  <>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </>,
  'ShoppingBag'
);

// ShoppingCart - cart
export const ShoppingCart = createIcon(
  <>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </>,
  'ShoppingCart'
);

// SkipBack - previous track
export const SkipBack = createIcon(
  <>
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </>,
  'SkipBack'
);

// SkipForward - next track
export const SkipForward = createIcon(
  <>
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </>,
  'SkipForward'
);

// Forward - email forward arrow
export const Forward = createIcon(
  <>
    <polyline points="15 17 20 12 15 7" />
    <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
  </>,
  'Forward'
);

// Smartphone - mobile device
export const Smartphone = createIcon(
  <>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </>,
  'Smartphone'
);

// Smile - emoji/happy
export const Smile = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </>,
  'Smile'
);

// Sparkles - AI/magic
export const Sparkles = createIcon(
  <>
    <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </>,
  'Sparkles'
);

// Speaker - audio output
export const Speaker = createIcon(
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <circle cx="12" cy="14" r="4" />
    <line x1="12" y1="6" x2="12.01" y2="6" />
  </>,
  'Speaker'
);

// Square - stop/shape
export const Square = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </>,
  'Square'
);

// Star - favorite/rating
export const Star = createIcon(
  <>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </>,
  'Star'
);

// StickyNote - note
export const StickyNote = createIcon(
  <>
    <path d="M15.5 3H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2V8.5L15.5 3z" />
    <path d="M15 3v6h6" />
  </>,
  'StickyNote'
);

// Sun - light mode
export const Sun = createIcon(
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>,
  'Sun'
);

// Tag - label/tag
export const Tag = createIcon(
  <>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </>,
  'Tag'
);

// Tablet - tablet device
export const Tablet = createIcon(
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </>,
  'Tablet'
);

// Ticket - ticket/pass
export const Ticket = createIcon(
  <>
    <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3" />
    <path d="M2 15a3 3 0 003 3h14a3 3 0 003-3" />
    <path d="M2 9a3 3 0 003 3 3 3 0 00-3 3" />
    <path d="M22 9a3 3 0 01-3 3 3 3 0 003 3" />
    <line x1="9" y1="12" x2="9" y2="12.01" />
    <line x1="15" y1="12" x2="15" y2="12.01" />
  </>,
  'Ticket'
);

// Timer - countdown
export const Timer = createIcon(
  <>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M5 3L2 6" />
    <path d="M22 6l-3-3" />
    <path d="M12 2v2" />
  </>,
  'Timer'
);

// Trash2 - delete
export const Trash2 = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>,
  'Trash2'
);

// TrendingDown - decrease
export const TrendingDown = createIcon(
  <>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </>,
  'TrendingDown'
);

// TrendingUp - increase
export const TrendingUp = createIcon(
  <>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </>,
  'TrendingUp'
);

// Type - text/typography
export const Type = createIcon(
  <>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </>,
  'Type'
);

// Trophy - winner
export const Trophy = createIcon(
  <>
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0012 0V2z" />
  </>,
  'Trophy'
);

// Upload - upload file
export const Upload = createIcon(
  <>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </>,
  'Upload'
);

// User - single user
export const User = createIcon(
  <>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
  'User'
);

// UserCheck - verified user
export const UserCheck = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </>,
  'UserCheck'
);

// UserPlus - add user
export const UserPlus = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </>,
  'UserPlus'
);

// Users - band members with instruments (musician-specific)
export const Users = createIcon(
  <>
    {/* Left musician with guitar */}
    <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 21v-3c0-1.5 1-2.5 3-2.5s3 1 3 2.5v3" strokeWidth="1.5" strokeLinecap="round" />
    {/* Guitar shape */}
    <path
      d="M6 15.5c-.5.3-.8.8-.8 1.2 0 .5.4.8.8.8s.8-.3.8-.8c0-.4-.3-.9-.8-1.2z"
      fill="currentColor"
      opacity="0.7"
    />

    {/* Right musician with headphones */}
    <circle cx="17" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M14 21v-3c0-1.5 1-2.5 3-2.5s3 1 3 2.5v3" strokeWidth="1.5" strokeLinecap="round" />
    {/* Headphones arc */}
    <path
      d="M15 5.5c.5-.8 1.2-1.2 2-1.2s1.5.4 2 1.2"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.7"
    />

    {/* Center musician (vocalist/frontperson) - slightly forward */}
    <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M10 21v-4c0-1 .8-1.5 2-1.5s2 .5 2 1.5v4" strokeWidth="1.5" strokeLinecap="round" />
    {/* Microphone in hand */}
    <line x1="12" y1="13" x2="12" y2="15.5" strokeWidth="1.2" opacity="0.7" />
    <circle cx="12" cy="13" r="0.8" fill="currentColor" opacity="0.7" />
  </>,
  'Users'
);

// Video - video camera
export const Video = createIcon(
  <>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </>,
  'Video'
);

// VideoOff - video disabled
export const VideoOff = createIcon(
  <>
    <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>,
  'VideoOff'
);

// Volume2 - volume on
export const Volume2 = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
  </>,
  'Volume2'
);

// VolumeX - muted
export const VolumeX = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </>,
  'VolumeX'
);

// Wand2 - magic wand
export const Wand2 = createIcon(
  <>
    <path d="M15 4V2" />
    <path d="M15 16v-2" />
    <path d="M8 9h2" />
    <path d="M20 9h2" />
    <path d="M17.8 11.8L19 13" />
    <path d="M15 9h0" />
    <path d="M17.8 6.2L19 5" />
    <path d="M3 21l9-9" />
    <path d="M12.2 6.2L11 5" />
  </>,
  'Wand2'
);

// Wifi - connected
export const Wifi = createIcon(
  <>
    <path d="M5 12.55a11 11 0 0114.08 0" />
    <path d="M1.42 9a16 16 0 0121.16 0" />
    <path d="M8.53 16.11a6 6 0 016.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </>,
  'Wifi'
);

// WifiOff - disconnected
export const WifiOff = createIcon(
  <>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
    <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0122.58 9" />
    <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
    <path d="M8.53 16.11a6 6 0 016.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </>,
  'WifiOff'
);

// X - close
export const X = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
  'X'
);

// XCircle - error/close circle
export const XCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </>,
  'XCircle'
);

// Zap - energy/power
export const Zap = createIcon(
  <>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </>,
  'Zap'
);

// Hand - raised hand
export const Hand = createIcon(
  <>
    <path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0" />
    <path d="M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v2" />
    <path d="M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v8" />
    <path d="M18 8a2 2 0 114 0v6a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15" />
  </>,
  'Hand'
);

// Minimize2 - minimize window
export const Minimize2 = createIcon(
  <>
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </>,
  'Minimize2'
);

// Link2 - chain link (alias for LinkIcon)
export const Link2 = createIcon(
  <>
    <path d="M9 17H7A5 5 0 017 7h2" />
    <path d="M15 7h2a5 5 0 110 10h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </>,
  'Link2'
);

// CalendarPlus - add to calendar
export const CalendarPlus = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="12" y1="14" x2="12" y2="18" />
    <line x1="10" y1="16" x2="14" y2="16" />
  </>,
  'CalendarPlus'
);

// EyeOff - hidden/invisible
export const EyeOff = createIcon(
  <>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>,
  'EyeOff'
);

// StopCircle - stop/end
export const StopCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <rect x="9" y="9" width="6" height="6" />
  </>,
  'StopCircle'
);

// BellOff - notifications off
export const BellOff = createIcon(
  <>
    <path d="M13.73 21a2 2 0 01-3.46 0" />
    <path d="M18.63 13A17.89 17.89 0 0118 8" />
    <path d="M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14" />
    <path d="M18 8a6 6 0 00-9.33-5" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>,
  'BellOff'
);

// Maximize - fullscreen (simple)
export const Maximize = createIcon(
  <>
    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
  </>,
  'Maximize'
);

// FolderOpen - session folder with waveform (project folder)
export const FolderOpen = createIcon(
  <>
    {/* Folder back flap */}
    <path
      d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Folder tab */}
    <path d="M9 3l2 3" strokeWidth="1.5" strokeLinecap="round" />
    {/* Folder opening line */}
    <path d="M2 11h20" strokeWidth="1.2" opacity="0.6" />
    {/* Waveform inside folder (audio session indicator) */}
    <path
      d="M6 15v2 M8 14v4 M10 15v2 M12 13v5 M14 14v4 M16 15v2 M18 14v4"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.7"
    />
    {/* File count indicator dots */}
    <circle cx="5" cy="8" r="0.5" fill="currentColor" opacity="0.5" />
    <circle cx="7" cy="8" r="0.5" fill="currentColor" opacity="0.5" />
    <circle cx="9" cy="8" r="0.5" fill="currentColor" opacity="0.5" />
  </>,
  'FolderOpen'
);

// FolderPlus - add folder
export const FolderPlus = createIcon(
  <>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v12z" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </>,
  'FolderPlus'
);

// Rocket - launch/deploy
export const Rocket = createIcon(
  <>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </>,
  'Rocket'
);

// Cpu - processor
export const Cpu = createIcon(
  <>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </>,
  'Cpu'
);

// CircuitBoard - electronics
export const CircuitBoard = createIcon(
  <>
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <path d="M6.5 6.5h.01M6.5 17.5h.01M17.5 6.5h.01M17.5 17.5h.01" />
    <path d="M6.5 6.5v4h4v-4h-4zM13.5 6.5v4h4v-4h-4zM6.5 13.5v4h4v-4h-4z" />
  </>,
  'CircuitBoard'
);

// RefreshCcw - counter-clockwise refresh (alias)
export const RefreshCcw = createIcon(
  <>
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </>,
  'RefreshCcw'
);

// CheckSquare - checkbox checked
export const CheckSquare = createIcon(
  <>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </>,
  'CheckSquare'
);

// FileMusic - music file
export const FileMusic = createIcon(
  <>
    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="10" cy="16" r="2" />
    <path d="M12 14V8l4 2" />
  </>,
  'FileMusic'
);

// ScrollText - document with text
export const ScrollText = createIcon(
  <>
    <path d="M8 21h12a2 2 0 002-2v-2H10v2a2 2 0 11-4 0V5a2 2 0 10-4 0v3h4" />
    <path d="M19 17V5a2 2 0 00-2-2H4" />
    <path d="M15 8h-5M15 12h-5" />
  </>,
  'ScrollText'
);

// FileType - file with type indicator
export const FileType = createIcon(
  <>
    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 13v-1h6v1M11 17h2M12 13v4" />
  </>,
  'FileType'
);

// Library - book collection
export const Library = createIcon(
  <>
    <path d="M3 3h18" />
    <path d="M3 21h18" />
    <path d="M5 3v18" />
    <path d="M9 3v18" />
    <path d="M13 3v18" />
    <path d="M17 3v18" />
    <path d="M21 3v18" />
  </>,
  'Library'
);

// Lightbulb - idea/suggestion
export const Lightbulb = createIcon(
  <>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </>,
  'Lightbulb'
);

// UserSearch - find user
export const UserSearch = createIcon(
  <>
    <circle cx="10" cy="7" r="4" />
    <path d="M10.3 15H7a4 4 0 00-4 4v2" />
    <circle cx="17" cy="17" r="3" />
    <path d="M21 21l-1.9-1.9" />
  </>,
  'UserSearch'
);

// Music4 - detailed song manuscript with musical staff
export const Music4 = createIcon(
  <>
    {/* Sheet music paper */}
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Musical staff lines */}
    <line x1="5" y1="8" x2="19" y2="8" strokeWidth="0.5" />
    <line x1="5" y1="10" x2="19" y2="10" strokeWidth="0.5" />
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="0.5" />
    <line x1="5" y1="14" x2="19" y2="14" strokeWidth="0.5" />
    <line x1="5" y1="16" x2="19" y2="16" strokeWidth="0.5" />
    {/* Treble clef shape */}
    <path
      d="M7 14c0-2 1-3.5 1.5-4.5.3-.6.5-1 .5-1.5 0-.8-.5-1-1-1-.3 0-.5.1-.7.3"
      strokeWidth="1.2"
      fill="none"
    />
    {/* Music notes */}
    <circle cx="11" cy="12" r="1" fill="currentColor" />
    <line x1="12" y1="12" x2="12" y2="8" strokeWidth="1" />
    <circle cx="14" cy="14" r="1" fill="currentColor" />
    <line x1="15" y1="14" x2="15" y2="10" strokeWidth="1" />
    <circle cx="17" cy="11" r="1" fill="currentColor" />
    <line x1="18" y1="11" x2="18" y2="7" strokeWidth="1" />
  </>,
  'Music4'
);

// Headphones - audio listening
export const Headphones = createIcon(
  <>
    <path d="M3 18v-6a9 9 0 0118 0v6" />
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
    <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
  </>,
  'Headphones'
);

// FlaskConical - lab/experiment
export const FlaskConical = createIcon(
  <>
    <path d="M10 2v7.31" />
    <path d="M14 9.3V2" />
    <path d="M8.5 2h7" />
    <path d="M14 9.3a6.5 6.5 0 11-4 0" />
    <path d="M5.58 16.5h12.85" />
  </>,
  'FlaskConical'
);

// Wrench - musician's multi-tool (tuner, picks, tools)
export const Wrench = createIcon(
  <>
    {/* Main wrench body */}
    <path
      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Guitar pick overlay (multi-tool theme) */}
    <path
      d="M19 3c.5 0 1 .3 1.3.7.2.3.2.6 0 .8-.3.4-.8.7-1.3.7s-1-.3-1.3-.7c-.2-.2-.2-.5 0-.8.3-.4.8-.7 1.3-.7z"
      fill="currentColor"
      opacity="0.6"
    />
    {/* Tuning peg detail */}
    <circle
      cx="6"
      cy="18"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    />
    <line x1="5" y1="17" x2="7" y2="19" strokeWidth="0.8" opacity="0.5" />
  </>,
  'Wrench'
);

// Target - goal/focus
export const Target = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </>,
  'Target'
);

// BookOpen - open book
export const BookOpen = createIcon(
  <>
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </>,
  'BookOpen'
);

// GraduationCap - education/masterclass
export const GraduationCap = createIcon(
  <>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </>,
  'GraduationCap'
);

// BadgeCheck - verified badge
export const BadgeCheck = createIcon(
  <>
    <path d="M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76z" />
    <path d="M9 12l2 2 4-4" />
  </>,
  'BadgeCheck'
);

// Filter - filtering
export const Filter = createIcon(
  <>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </>,
  'Filter'
);

// LayoutGrid - grid layout
export const LayoutGrid = createIcon(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </>,
  'LayoutGrid'
);

// PieChart - pie chart/analytics
export const PieChart = createIcon(
  <>
    <path d="M21.21 15.89A10 10 0 118 2.83" />
    <path d="M22 12A10 10 0 0012 2v10z" />
  </>,
  'PieChart'
);

// Undo - undo action
export const Undo = createIcon(
  <>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
  </>,
  'Undo'
);

// Redo - redo action
export const Redo = createIcon(
  <>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
  </>,
  'Redo'
);

// Shuffle - shuffle/randomize
export const Shuffle = createIcon(
  <>
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </>,
  'Shuffle'
);

// Repeat - repeat/loop
export const Repeat = createIcon(
  <>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </>,
  'Repeat'
);

// AtSign icon - for social handles
export const AtSign = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" />
  </>,
  'AtSign'
);

// Linkedin icon
export const Linkedin = createIcon(
  <>
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>,
  'Linkedin'
);

// Database icon
export const Database = createIcon(
  <>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </>,
  'Database'
);

// Settings2 icon (gear alternative)
export const Settings2 = createIcon(
  <>
    <path d="M20 7h-9" />
    <path d="M14 17H5" />
    <circle cx="17" cy="17" r="3" />
    <circle cx="7" cy="7" r="3" />
  </>,
  'Settings2'
);

// Link2Off icon (broken link)
export const Link2Off = createIcon(
  <>
    <path d="M9 17H7A5 5 0 017 7" />
    <path d="M15 7h2a5 5 0 014 8" />
    <line x1="8" y1="12" x2="12" y2="12" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </>,
  'Link2Off'
);

// BarChart icon
export const BarChart = createIcon(
  <>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </>,
  'BarChart'
);

// Layout icon
export const Layout = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </>,
  'Layout'
);

// =====================
// STUDIO EQUIPMENT ICONS
// Professional recording studio gear
// =====================

// MixingConsole - studio mixing board/desk
export const MixingConsole = createIcon(
  <>
    {/* Console body/frame */}
    <rect
      x="2"
      y="6"
      width="20"
      height="14"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Top meter bridge */}
    <rect
      x="3"
      y="3"
      width="18"
      height="3"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.7"
    />
    {/* VU meter displays */}
    <rect x="5" y="3.5" width="3" height="2" rx="0.3" fill="currentColor" opacity="0.4" />
    <rect x="10" y="3.5" width="3" height="2" rx="0.3" fill="currentColor" opacity="0.4" />
    <rect x="16" y="3.5" width="3" height="2" rx="0.3" fill="currentColor" opacity="0.4" />
    {/* Channel strips - faders */}
    <line x1="5" y1="9" x2="5" y2="17" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="9" x2="8" y2="17" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="9" x2="11" y2="17" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="9" x2="14" y2="17" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="9" x2="17" y2="17" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="20" y1="9" x2="20" y2="17" strokeWidth="1.5" strokeLinecap="round" />
    {/* Fader caps at different positions */}
    <rect x="4" y="11" width="2" height="1.5" rx="0.3" fill="currentColor" />
    <rect x="7" y="14" width="2" height="1.5" rx="0.3" fill="currentColor" />
    <rect x="10" y="12" width="2" height="1.5" rx="0.3" fill="currentColor" />
    <rect x="13" y="15" width="2" height="1.5" rx="0.3" fill="currentColor" />
    <rect x="16" y="10" width="2" height="1.5" rx="0.3" fill="currentColor" />
    <rect x="19" y="13" width="2" height="1.5" rx="0.3" fill="currentColor" />
    {/* Knob row */}
    <circle cx="5" cy="8" r="0.6" fill="currentColor" opacity="0.6" />
    <circle cx="8" cy="8" r="0.6" fill="currentColor" opacity="0.6" />
    <circle cx="11" cy="8" r="0.6" fill="currentColor" opacity="0.6" />
    <circle cx="14" cy="8" r="0.6" fill="currentColor" opacity="0.6" />
    <circle cx="17" cy="8" r="0.6" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="8" r="0.6" fill="currentColor" opacity="0.6" />
  </>,
  'MixingConsole'
);

// AudioInterface - USB/Thunderbolt audio interface
export const AudioInterface = createIcon(
  <>
    {/* Main unit body */}
    <rect
      x="2"
      y="7"
      width="20"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Input gain knobs */}
    <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <line x1="5" y1="10.5" x2="5" y2="11.5" strokeWidth="1" />
    <circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <line x1="10" y1="10.5" x2="10" y2="11.5" strokeWidth="1" />
    {/* Monitor knob (larger) */}
    <circle cx="16" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <line x1="16" y1="10" x2="16" y2="11.2" strokeWidth="1.2" />
    {/* LED meters */}
    <rect
      x="19"
      y="9"
      width="1.5"
      height="6"
      rx="0.3"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
    />
    <rect x="19.2" y="13" width="1.1" height="1" fill="currentColor" opacity="0.3" />
    <rect x="19.2" y="11.5" width="1.1" height="1" fill="currentColor" opacity="0.5" />
    <rect x="19.2" y="10" width="1.1" height="1" fill="currentColor" opacity="0.7" />
    {/* Input labels */}
    <text x="5" y="16" fontSize="2" fill="currentColor" textAnchor="middle" opacity="0.5">
      1
    </text>
    <text x="10" y="16" fontSize="2" fill="currentColor" textAnchor="middle" opacity="0.5">
      2
    </text>
    {/* USB indicator */}
    <rect
      x="3"
      y="4"
      width="4"
      height="2"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.6"
    />
    <line x1="5" y1="6" x2="5" y2="7" strokeWidth="0.8" opacity="0.6" />
    {/* Phantom power indicator */}
    <circle cx="7.5" cy="9" r="0.5" fill="currentColor" opacity="0.4" />
  </>,
  'AudioInterface'
);

// StudioMonitors - pair of studio monitor speakers
export const StudioMonitors = createIcon(
  <>
    {/* Left monitor cabinet */}
    <rect
      x="2"
      y="4"
      width="8"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Left tweeter */}
    <circle cx="6" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="6" cy="7.5" r="0.4" fill="currentColor" />
    {/* Left woofer */}
    <circle cx="6" cy="14" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="6" cy="14" r="1.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="6" cy="14" r="0.5" fill="currentColor" />
    {/* Left port (bass reflex) */}
    <rect x="4.5" y="18" width="3" height="1" rx="0.3" fill="currentColor" opacity="0.5" />

    {/* Right monitor cabinet */}
    <rect
      x="14"
      y="4"
      width="8"
      height="16"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Right tweeter */}
    <circle cx="18" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="18" cy="7.5" r="0.4" fill="currentColor" />
    {/* Right woofer */}
    <circle cx="18" cy="14" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="18" cy="14" r="1.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="18" cy="14" r="0.5" fill="currentColor" />
    {/* Right port */}
    <rect x="16.5" y="18" width="3" height="1" rx="0.3" fill="currentColor" opacity="0.5" />

    {/* Sound waves between monitors */}
    <path d="M10.5 10c.5 1 .5 4 0 5" strokeWidth="0.8" fill="none" opacity="0.4" />
    <path d="M13.5 10c-.5 1-.5 4 0 5" strokeWidth="0.8" fill="none" opacity="0.4" />
  </>,
  'StudioMonitors'
);

// BassGuitar - electric bass guitar
export const BassGuitar = createIcon(
  <>
    {/* Headstock */}
    <path d="M3 3v4c0 .5.5 1 1 1h1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Tuning pegs (4 for bass) */}
    <circle cx="2.5" cy="4" r="0.8" fill="currentColor" opacity="0.7" />
    <circle cx="2.5" cy="6" r="0.8" fill="currentColor" opacity="0.7" />
    {/* Neck */}
    <rect
      x="4"
      y="4"
      width="2"
      height="12"
      rx="0.3"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Fret markers */}
    <circle cx="5" cy="7" r="0.4" fill="currentColor" opacity="0.4" />
    <circle cx="5" cy="10" r="0.4" fill="currentColor" opacity="0.4" />
    <circle cx="5" cy="13" r="0.4" fill="currentColor" opacity="0.4" />
    {/* Body (jazz bass style) */}
    <path
      d="M6 16c0 3 2 5 6 5 5 0 9-2 9-6 0-3-2-5-4-5-1 0-2 .5-2.5 1.5-.3.5-.5 1-1.5 1-.8 0-1-.3-1.5-1S10 10 9 10c-2 0-3 3-3 6z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Pickups (split-coil jazz style) */}
    <rect x="10" y="13" width="3" height="1.5" rx="0.3" fill="currentColor" opacity="0.6" />
    <rect x="14" y="14" width="3" height="1.5" rx="0.3" fill="currentColor" opacity="0.6" />
    {/* Bridge */}
    <rect x="16" y="16" width="2" height="3" rx="0.3" fill="currentColor" opacity="0.5" />
    {/* Control knobs */}
    <circle cx="11" cy="18" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="13" cy="19" r="0.8" fill="currentColor" opacity="0.5" />
    {/* Strings (4) */}
    <line x1="4.5" y1="4" x2="17" y2="16" strokeWidth="0.3" opacity="0.3" />
    <line x1="5" y1="4" x2="17.5" y2="16.5" strokeWidth="0.3" opacity="0.3" />
    <line x1="5.5" y1="4" x2="18" y2="17" strokeWidth="0.3" opacity="0.3" />
    <line x1="6" y1="4" x2="18.5" y2="17.5" strokeWidth="0.3" opacity="0.3" />
  </>,
  'BassGuitar'
);

// DrumKit - detailed drum set
export const DrumKit = createIcon(
  <>
    {/* Bass drum (center) */}
    <ellipse cx="12" cy="16" rx="5" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <ellipse
      cx="12"
      cy="16"
      rx="3"
      ry="2.5"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.5"
    />
    {/* Bass drum logo area */}
    <circle cx="12" cy="16" r="1.5" fill="currentColor" opacity="0.3" />

    {/* Snare drum (left front) */}
    <ellipse cx="6" cy="12" rx="3" ry="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path
      d="M3 12v2c0 .8 1.3 1.5 3 1.5s3-.7 3-1.5v-2"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    />

    {/* Hi-hat (far left) */}
    <ellipse cx="3" cy="8" rx="2" ry="0.8" stroke="currentColor" strokeWidth="1" fill="none" />
    <ellipse cx="3" cy="8.5" rx="2" ry="0.8" stroke="currentColor" strokeWidth="1" fill="none" />
    <line x1="3" y1="9.3" x2="3" y2="14" strokeWidth="0.8" />

    {/* Floor tom (right) */}
    <ellipse cx="18" cy="14" rx="3" ry="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path
      d="M15 14v3c0 .8 1.3 1.5 3 1.5s3-.7 3-1.5v-3"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    />

    {/* Rack tom 1 (left top) */}
    <ellipse cx="8" cy="6" rx="2.5" ry="1.2" stroke="currentColor" strokeWidth="1" fill="none" />
    <path
      d="M5.5 6v2c0 .6 1.1 1.2 2.5 1.2s2.5-.6 2.5-1.2V6"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />

    {/* Rack tom 2 (right top) */}
    <ellipse cx="16" cy="6" rx="2.5" ry="1.2" stroke="currentColor" strokeWidth="1" fill="none" />
    <path
      d="M13.5 6v2c0 .6 1.1 1.2 2.5 1.2s2.5-.6 2.5-1.2V6"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />

    {/* Crash cymbal (right) */}
    <ellipse cx="20" cy="4" rx="2.5" ry="0.8" stroke="currentColor" strokeWidth="1" fill="none" />
    <line x1="20" y1="4.8" x2="20" y2="8" strokeWidth="0.8" />

    {/* Ride cymbal (far right) */}
    <ellipse
      cx="22"
      cy="9"
      rx="2"
      ry="0.7"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.7"
    />
  </>,
  'DrumKit'
);

// Amplifier - guitar/bass amp head
export const Amplifier = createIcon(
  <>
    {/* Amp head cabinet */}
    <rect
      x="2"
      y="3"
      width="20"
      height="10"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Tolex texture lines */}
    <line x1="3" y1="5" x2="21" y2="5" strokeWidth="0.3" opacity="0.3" />
    <line x1="3" y1="7" x2="21" y2="7" strokeWidth="0.3" opacity="0.3" />
    <line x1="3" y1="9" x2="21" y2="9" strokeWidth="0.3" opacity="0.3" />
    <line x1="3" y1="11" x2="21" y2="11" strokeWidth="0.3" opacity="0.3" />
    {/* Control panel (recessed) */}
    <rect
      x="3"
      y="4"
      width="18"
      height="4"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.8"
    />
    {/* Knobs row */}
    <circle cx="5" cy="6" r="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <line x1="5" y1="5.2" x2="5" y2="5.8" strokeWidth="0.6" />
    <circle cx="8" cy="6" r="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <line x1="8" y1="5.2" x2="8" y2="5.8" strokeWidth="0.6" />
    <circle cx="11" cy="6" r="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <line x1="11" y1="5.2" x2="11" y2="5.8" strokeWidth="0.6" />
    <circle cx="14" cy="6" r="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <line x1="14" y1="5.2" x2="14" y2="5.8" strokeWidth="0.6" />
    <circle cx="17" cy="6" r="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <line x1="17" y1="5.2" x2="17" y2="5.8" strokeWidth="0.6" />
    {/* Power/standby switches */}
    <rect x="19" y="5" width="1.5" height="2" rx="0.3" fill="currentColor" opacity="0.5" />
    {/* Handle */}
    <path d="M8 2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Vent slots */}
    <line x1="4" y1="10" x2="6" y2="10" strokeWidth="0.5" opacity="0.4" />
    <line x1="8" y1="10" x2="10" y2="10" strokeWidth="0.5" opacity="0.4" />
    <line x1="14" y1="10" x2="16" y2="10" strokeWidth="0.5" opacity="0.4" />
    <line x1="18" y1="10" x2="20" y2="10" strokeWidth="0.5" opacity="0.4" />
    {/* Speaker cabinet (below) */}
    <rect
      x="2"
      y="14"
      width="20"
      height="8"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Speaker grille pattern */}
    <rect
      x="3"
      y="15"
      width="18"
      height="6"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.6"
    />
    {/* Speaker cones visible through grille */}
    <circle
      cx="8"
      cy="18"
      r="2.5"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.5"
    />
    <circle cx="8" cy="18" r="1" fill="currentColor" opacity="0.3" />
    <circle
      cx="16"
      cy="18"
      r="2.5"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.5"
    />
    <circle cx="16" cy="18" r="1" fill="currentColor" opacity="0.3" />
    {/* Logo badge */}
    <rect x="10" y="10.5" width="4" height="1.5" rx="0.3" fill="currentColor" opacity="0.4" />
  </>,
  'Amplifier'
);

// KeyboardSynth - MIDI keyboard / synthesizer
export const KeyboardSynth = createIcon(
  <>
    {/* Main keyboard body */}
    <rect
      x="1"
      y="8"
      width="22"
      height="10"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Control panel section */}
    <rect
      x="2"
      y="9"
      width="20"
      height="3"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.7"
    />
    {/* Mod and pitch wheels */}
    <rect x="3" y="9.5" width="1.5" height="2" rx="0.3" fill="currentColor" opacity="0.5" />
    <rect x="5" y="9.5" width="1.5" height="2" rx="0.3" fill="currentColor" opacity="0.5" />
    {/* Knobs */}
    <circle cx="9" cy="10.5" r="0.7" fill="currentColor" opacity="0.4" />
    <circle cx="11" cy="10.5" r="0.7" fill="currentColor" opacity="0.4" />
    <circle cx="13" cy="10.5" r="0.7" fill="currentColor" opacity="0.4" />
    <circle cx="15" cy="10.5" r="0.7" fill="currentColor" opacity="0.4" />
    {/* Display screen */}
    <rect x="17" y="9.5" width="4" height="2" rx="0.3" fill="currentColor" opacity="0.3" />
    {/* White keys */}
    <rect
      x="2"
      y="13"
      width="2.5"
      height="4"
      rx="0.2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <rect
      x="5"
      y="13"
      width="2.5"
      height="4"
      rx="0.2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <rect
      x="8"
      y="13"
      width="2.5"
      height="4"
      rx="0.2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <rect
      x="11"
      y="13"
      width="2.5"
      height="4"
      rx="0.2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <rect
      x="14"
      y="13"
      width="2.5"
      height="4"
      rx="0.2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <rect
      x="17"
      y="13"
      width="2.5"
      height="4"
      rx="0.2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <rect
      x="20"
      y="13"
      width="2"
      height="4"
      rx="0.2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    {/* Black keys */}
    <rect x="4" y="13" width="1.5" height="2.5" rx="0.2" fill="currentColor" />
    <rect x="7" y="13" width="1.5" height="2.5" rx="0.2" fill="currentColor" />
    <rect x="13" y="13" width="1.5" height="2.5" rx="0.2" fill="currentColor" />
    <rect x="16" y="13" width="1.5" height="2.5" rx="0.2" fill="currentColor" />
    <rect x="19" y="13" width="1.5" height="2.5" rx="0.2" fill="currentColor" />
  </>,
  'KeyboardSynth'
);

// StudioHeadphones - professional closed-back headphones
export const StudioHeadphones = createIcon(
  <>
    {/* Headband */}
    <path
      d="M4 12a8 8 0 0116 0"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Headband padding */}
    <path
      d="M8 6a4 4 0 018 0"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      opacity="0.3"
    />
    {/* Left ear cup outer */}
    <rect
      x="2"
      y="11"
      width="5"
      height="7"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Left ear cup inner (cushion) */}
    <ellipse cx="4.5" cy="14.5" rx="1.5" ry="2" fill="currentColor" opacity="0.3" />
    {/* Left hinge */}
    <rect x="5" y="12" width="1.5" height="2" rx="0.3" fill="currentColor" opacity="0.5" />
    {/* Right ear cup outer */}
    <rect
      x="17"
      y="11"
      width="5"
      height="7"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Right ear cup inner (cushion) */}
    <ellipse cx="19.5" cy="14.5" rx="1.5" ry="2" fill="currentColor" opacity="0.3" />
    {/* Right hinge */}
    <rect x="17.5" y="12" width="1.5" height="2" rx="0.3" fill="currentColor" opacity="0.5" />
    {/* Cable from left ear cup */}
    <path
      d="M4.5 18v2c0 1 .5 2 1.5 2"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
    {/* Cable connector */}
    <rect x="5.5" y="21" width="2" height="1.5" rx="0.3" fill="currentColor" opacity="0.6" />
  </>,
  'StudioHeadphones'
);

// EffectsPedal - guitar effects pedal / stompbox
export const EffectsPedal = createIcon(
  <>
    {/* Pedal body */}
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Footswitch (main button) */}
    <circle cx="12" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" opacity="0.4" />
    {/* Knobs row */}
    <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <line x1="7" y1="5.8" x2="7" y2="6.5" strokeWidth="0.8" />
    <circle cx="12" cy="7" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <line x1="12" y1="5.8" x2="12" y2="6.5" strokeWidth="0.8" />
    <circle cx="17" cy="7" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <line x1="17" y1="5.8" x2="17" y2="6.5" strokeWidth="0.8" />
    {/* LED indicator */}
    <circle cx="12" cy="10.5" r="0.8" fill="currentColor" />
    {/* Input/output jacks (top) */}
    <circle cx="6" cy="3" r="1" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
    <circle
      cx="18"
      cy="3"
      r="1"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.6"
    />
    {/* Label area */}
    <rect x="8" y="11.5" width="8" height="1.5" rx="0.3" fill="currentColor" opacity="0.2" />
    {/* Rubber feet corners */}
    <circle cx="5.5" cy="18.5" r="0.5" fill="currentColor" opacity="0.4" />
    <circle cx="18.5" cy="18.5" r="0.5" fill="currentColor" opacity="0.4" />
  </>,
  'EffectsPedal'
);

// AcousticGuitar - acoustic guitar with sound hole and strings
export const AcousticGuitar = createIcon(
  <>
    {/* Headstock */}
    <path d="M4 2v3c0 .5.5 1 1 1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Tuning pegs */}
    <circle cx="3" cy="2.5" r="0.6" fill="currentColor" opacity="0.7" />
    <circle cx="3" cy="4" r="0.6" fill="currentColor" opacity="0.7" />
    <circle cx="5" cy="2.5" r="0.6" fill="currentColor" opacity="0.7" />
    <circle cx="5" cy="4" r="0.6" fill="currentColor" opacity="0.7" />
    {/* Nut */}
    <rect x="4.5" y="5" width="2" height="0.5" fill="currentColor" opacity="0.5" />
    {/* Neck */}
    <rect
      x="5"
      y="5"
      width="1.5"
      height="8"
      rx="0.3"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    />
    {/* Fret markers */}
    <circle cx="5.75" cy="7" r="0.3" fill="currentColor" opacity="0.4" />
    <circle cx="5.75" cy="9" r="0.3" fill="currentColor" opacity="0.4" />
    <circle cx="5.75" cy="11" r="0.3" fill="currentColor" opacity="0.4" />
    {/* Body (dreadnought shape) */}
    <path
      d="M6.5 13c0 2.5 1.5 4 4 5 3 1.2 6 1.5 7.5 0 1.5-1.5 2-3 2-5s-.5-3.5-2-4.5c-1.2-.8-3-1-4.5-.5-2 .7-3 1.5-4 2.5-1 1-3 1-3 2.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Sound hole */}
    <circle cx="13" cy="14" r="2.5" stroke="currentColor" strokeWidth="1" fill="none" />
    {/* Rosette pattern */}
    <circle
      cx="13"
      cy="14"
      r="3"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.4"
    />
    <circle
      cx="13"
      cy="14"
      r="2"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.4"
    />
    {/* Bridge */}
    <rect x="11" y="17.5" width="5" height="1" rx="0.3" fill="currentColor" opacity="0.6" />
    {/* Saddle */}
    <rect x="11.5" y="17" width="4" height="0.5" rx="0.2" fill="currentColor" opacity="0.8" />
    {/* Strings */}
    <line x1="5.2" y1="5.5" x2="12" y2="17.5" strokeWidth="0.2" opacity="0.3" />
    <line x1="5.5" y1="5.5" x2="12.5" y2="17.5" strokeWidth="0.2" opacity="0.3" />
    <line x1="5.8" y1="5.5" x2="13" y2="17.5" strokeWidth="0.2" opacity="0.3" />
    <line x1="6.1" y1="5.5" x2="13.5" y2="17.5" strokeWidth="0.2" opacity="0.3" />
    <line x1="6.4" y1="5.5" x2="14" y2="17.5" strokeWidth="0.2" opacity="0.3" />
    <line x1="6.7" y1="5.5" x2="14.5" y2="17.5" strokeWidth="0.2" opacity="0.3" />
    {/* Pickguard */}
    <path
      d="M10 12c1 0 2 1 2 2.5s0 3-1.5 3.5"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.4"
    />
  </>,
  'AcousticGuitar'
);

// StageLights - concert stage lighting rig
export const StageLights = createIcon(
  <>
    {/* Truss bar */}
    <rect
      x="2"
      y="2"
      width="20"
      height="2"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <line x1="3" y1="2" x2="3" y2="4" strokeWidth="0.5" opacity="0.5" />
    <line x1="6" y1="2" x2="6" y2="4" strokeWidth="0.5" opacity="0.5" />
    <line x1="9" y1="2" x2="9" y2="4" strokeWidth="0.5" opacity="0.5" />
    <line x1="15" y1="2" x2="15" y2="4" strokeWidth="0.5" opacity="0.5" />
    <line x1="18" y1="2" x2="18" y2="4" strokeWidth="0.5" opacity="0.5" />
    <line x1="21" y1="2" x2="21" y2="4" strokeWidth="0.5" opacity="0.5" />

    {/* Left PAR can */}
    <path d="M3 4v2" stroke="currentColor" strokeWidth="1" />
    <rect
      x="1"
      y="6"
      width="4"
      height="4"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    />
    <circle cx="3" cy="8" r="1.2" fill="currentColor" opacity="0.5" />
    {/* Left light beam */}
    <path d="M1.5 10L0 16M4.5 10L6 16" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

    {/* Center moving head */}
    <path d="M12 4v1" stroke="currentColor" strokeWidth="1.2" />
    <rect
      x="10"
      y="5"
      width="4"
      height="2"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <ellipse cx="12" cy="9" rx="2.5" ry="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="12" cy="9" r="1.5" fill="currentColor" opacity="0.6" />
    {/* Center beam (wide) */}
    <path d="M9.5 12L7 20M14.5 12L17 20" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
    <path d="M11 12L10 20M13 12L14 20" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />

    {/* Right PAR can */}
    <path d="M21 4v2" stroke="currentColor" strokeWidth="1" />
    <rect
      x="19"
      y="6"
      width="4"
      height="4"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    />
    <circle cx="21" cy="8" r="1.2" fill="currentColor" opacity="0.5" />
    {/* Right light beam */}
    <path d="M19.5 10L18 16M22.5 10L24 16" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

    {/* Floor/stage line */}
    <line x1="0" y1="22" x2="24" y2="22" strokeWidth="0.8" opacity="0.3" />
  </>,
  'StageLights'
);

// PatchCable - XLR/instrument cable
export const PatchCable = createIcon(
  <>
    {/* Left XLR connector body */}
    <rect
      x="2"
      y="9"
      width="4"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* XLR pins */}
    <circle cx="4" cy="11" r="0.5" fill="currentColor" />
    <circle cx="3.2" cy="13" r="0.5" fill="currentColor" />
    <circle cx="4.8" cy="13" r="0.5" fill="currentColor" />
    {/* Left strain relief */}
    <rect x="1" y="10" width="1" height="4" rx="0.3" fill="currentColor" opacity="0.5" />

    {/* Cable - curved path */}
    <path
      d="M6 12c2 0 3 4 6 4s4-4 6-4"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Cable highlight */}
    <path
      d="M6 11.5c2 0 3 4 6 4s4-4 6-4"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.3"
    />

    {/* Right XLR connector body */}
    <rect
      x="18"
      y="9"
      width="4"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* XLR socket holes */}
    <circle cx="20" cy="11" r="0.6" stroke="currentColor" strokeWidth="0.5" fill="none" />
    <circle cx="19.2" cy="13" r="0.6" stroke="currentColor" strokeWidth="0.5" fill="none" />
    <circle cx="20.8" cy="13" r="0.6" stroke="currentColor" strokeWidth="0.5" fill="none" />
    {/* Right strain relief */}
    <rect x="22" y="10" width="1" height="4" rx="0.3" fill="currentColor" opacity="0.5" />

    {/* Ground lug indicator on connector */}
    <line x1="3" y1="15.5" x2="5" y2="15.5" strokeWidth="0.8" opacity="0.4" />
    <line x1="19" y1="15.5" x2="21" y2="15.5" strokeWidth="0.8" opacity="0.4" />
  </>,
  'PatchCable'
);

// Metronome - timing/practice tool
export const Metronome = createIcon(
  <>
    {/* Main body (pyramid shape) */}
    <path d="M12 2L5 20h14L12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Base */}
    <rect
      x="4"
      y="19"
      width="16"
      height="3"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Pendulum arm */}
    <line
      x1="12"
      y1="18"
      x2="8"
      y2="6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Weight on pendulum */}
    <rect x="7" y="8" width="3" height="2" rx="0.5" fill="currentColor" />
    {/* Scale markings */}
    <line x1="9" y1="12" x2="10" y2="12" strokeWidth="0.8" opacity="0.5" />
    <line x1="9.5" y1="10" x2="10.5" y2="10" strokeWidth="0.8" opacity="0.5" />
    <line x1="10" y1="8" x2="11" y2="8" strokeWidth="0.8" opacity="0.5" />
    <line x1="14" y1="12" x2="15" y2="12" strokeWidth="0.8" opacity="0.5" />
    <line x1="13.5" y1="10" x2="14.5" y2="10" strokeWidth="0.8" opacity="0.5" />
    <line x1="13" y1="8" x2="14" y2="8" strokeWidth="0.8" opacity="0.5" />
    {/* Center pivot */}
    <circle cx="12" cy="18" r="0.8" fill="currentColor" />
    {/* Tempo indicator */}
    <rect x="10" y="14" width="4" height="2" rx="0.3" fill="currentColor" opacity="0.3" />
  </>,
  'Metronome'
);

// MusicStand - sheet music stand
export const MusicStand = createIcon(
  <>
    {/* Music sheet holder (angled) */}
    <path
      d="M4 4h16v12H4z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      transform="rotate(-5 12 10)"
    />
    {/* Sheet music lines */}
    <line x1="6" y1="7" x2="18" y2="6.5" strokeWidth="0.5" opacity="0.4" />
    <line x1="6" y1="9" x2="18" y2="8.5" strokeWidth="0.5" opacity="0.4" />
    <line x1="6" y1="11" x2="18" y2="10.5" strokeWidth="0.5" opacity="0.4" />
    <line x1="6" y1="13" x2="18" y2="12.5" strokeWidth="0.5" opacity="0.4" />
    {/* Music notes on staff */}
    <ellipse
      cx="8"
      cy="8"
      rx="1"
      ry="0.7"
      fill="currentColor"
      opacity="0.6"
      transform="rotate(-10 8 8)"
    />
    <ellipse
      cx="12"
      cy="10.5"
      rx="1"
      ry="0.7"
      fill="currentColor"
      opacity="0.6"
      transform="rotate(-10 12 10.5)"
    />
    <ellipse
      cx="15"
      cy="7"
      rx="1"
      ry="0.7"
      fill="currentColor"
      opacity="0.6"
      transform="rotate(-10 15 7)"
    />
    {/* Note stems */}
    <line x1="9" y1="8" x2="9" y2="5" strokeWidth="0.6" opacity="0.6" />
    <line x1="13" y1="10.5" x2="13" y2="7.5" strokeWidth="0.6" opacity="0.6" />
    <line x1="16" y1="7" x2="16" y2="4" strokeWidth="0.6" opacity="0.6" />
    {/* Lip/edge at bottom of holder */}
    <path d="M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Main pole */}
    <line x1="12" y1="16" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
    {/* Tripod base */}
    <path
      d="M12 22L8 23M12 22L16 23M12 22L12 23.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </>,
  'MusicStand'
);

// Turntable - DJ turntable/deck
export const Turntable = createIcon(
  <>
    {/* Base/deck */}
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Platter */}
    <circle cx="10" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
    {/* Record grooves */}
    <circle
      cx="10"
      cy="12"
      r="5"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.3"
    />
    <circle
      cx="10"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.3"
    />
    <circle
      cx="10"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="0.3"
      fill="none"
      opacity="0.3"
    />
    {/* Label */}
    <circle cx="10" cy="12" r="2" fill="currentColor" opacity="0.4" />
    {/* Spindle */}
    <circle cx="10" cy="12" r="0.5" fill="currentColor" />
    {/* Tonearm base */}
    <circle cx="19" cy="7" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="19" cy="7" r="0.5" fill="currentColor" />
    {/* Tonearm */}
    <path d="M19 7L16 10L14 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    {/* Cartridge/stylus */}
    <rect x="13" y="10.5" width="1.5" height="2" rx="0.2" fill="currentColor" opacity="0.7" />
    {/* Pitch slider */}
    <rect
      x="18"
      y="11"
      width="2"
      height="6"
      rx="0.3"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <rect x="18.4" y="13" width="1.2" height="1.5" rx="0.2" fill="currentColor" opacity="0.5" />
    {/* Start/stop button */}
    <circle cx="19" cy="18" r="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="19" cy="18" r="0.4" fill="currentColor" opacity="0.6" />
  </>,
  'Turntable'
);

// Saxophone - wind instrument
export const Saxophone = createIcon(
  <>
    {/* Mouthpiece */}
    <path
      d="M6 2l2 1v2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Neck */}
    <path
      d="M8 5c0 1 1 2 2 3"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Body curve */}
    <path
      d="M10 8c1 1 2 3 2 5s-1 4-2 6c-1 2-2 3-4 3"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Bell */}
    <ellipse cx="6" cy="21" rx="3" ry="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 20c-1 0-2 .5-2 1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    {/* Keys */}
    <circle cx="11" cy="10" r="0.8" fill="currentColor" opacity="0.7" />
    <circle cx="11.5" cy="12" r="0.8" fill="currentColor" opacity="0.7" />
    <circle cx="11" cy="14" r="0.8" fill="currentColor" opacity="0.7" />
    <circle cx="10" cy="16" r="0.8" fill="currentColor" opacity="0.7" />
    <circle cx="9" cy="18" r="0.8" fill="currentColor" opacity="0.7" />
    {/* Side keys */}
    <ellipse cx="8" cy="11" rx="0.6" ry="1" fill="currentColor" opacity="0.5" />
    <ellipse cx="7" cy="14" rx="0.6" ry="1" fill="currentColor" opacity="0.5" />
    {/* Octave key */}
    <circle cx="9" cy="7" r="0.5" fill="currentColor" opacity="0.6" />
    {/* Bell rim highlight */}
    <ellipse
      cx="6"
      cy="20.5"
      rx="2"
      ry="0.8"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.5"
    />
  </>,
  'Saxophone'
);

// Violin - string instrument
export const Violin = createIcon(
  <>
    {/* Scroll */}
    <path
      d="M3 2c1 0 2 1 2 2s-1 1-1 2"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Pegbox */}
    <rect
      x="3"
      y="5"
      width="2"
      height="3"
      rx="0.3"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    {/* Tuning pegs */}
    <line x1="2" y1="5.5" x2="3" y2="5.5" strokeWidth="1" />
    <line x1="2" y1="7" x2="3" y2="7" strokeWidth="1" />
    <line x1="5" y1="5.5" x2="6" y2="5.5" strokeWidth="1" />
    <line x1="5" y1="7" x2="6" y2="7" strokeWidth="1" />
    {/* Neck */}
    <rect
      x="3.5"
      y="8"
      width="1.5"
      height="5"
      rx="0.3"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    {/* Body upper bout */}
    <ellipse cx="8" cy="14" rx="4" ry="2.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
    {/* Body lower bout */}
    <ellipse cx="8" cy="19" rx="5" ry="3" stroke="currentColor" strokeWidth="1.3" fill="none" />
    {/* Waist (C-bouts) */}
    <path d="M4 16c0 1 1 1.5 1 2" stroke="currentColor" strokeWidth="1" fill="none" />
    <path d="M12 16c0 1-1 1.5-1 2" stroke="currentColor" strokeWidth="1" fill="none" />
    {/* F-holes */}
    <path
      d="M6 15c-.5.5-.5 1.5 0 2s0 1.5-.5 2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    <path d="M10 15c.5.5.5 1.5 0 2s0 1.5.5 2" stroke="currentColor" strokeWidth="0.8" fill="none" />
    {/* Bridge */}
    <path d="M6 17.5h4" stroke="currentColor" strokeWidth="1" />
    <path d="M7 17.5v1M9 17.5v1" strokeWidth="0.6" />
    {/* Tailpiece */}
    <path d="M7 20h2v2H7z" stroke="currentColor" strokeWidth="0.8" fill="none" />
    {/* Chinrest */}
    <ellipse
      cx="11"
      cy="20"
      rx="1.5"
      ry="1"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.7"
    />
    {/* Strings */}
    <line x1="4" y1="8" x2="7" y2="20" strokeWidth="0.3" opacity="0.4" />
    <line x1="4.5" y1="8" x2="7.7" y2="20" strokeWidth="0.3" opacity="0.4" />
    <line x1="5" y1="8" x2="8.3" y2="20" strokeWidth="0.3" opacity="0.4" />
    <line x1="5.5" y1="8" x2="9" y2="20" strokeWidth="0.3" opacity="0.4" />
    {/* Bow (to the side) */}
    <path d="M16 4c0 5 1 10 1 15" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path
      d="M15.5 4h1.5M15.5 19h1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Bow hair */}
    <path
      d="M17 5c.5 4 .5 9 0 13"
      stroke="currentColor"
      strokeWidth="0.4"
      fill="none"
      opacity="0.5"
    />
  </>,
  'Violin'
);

// TapeReel - vintage recording tape reel
export const TapeReel = createIcon(
  <>
    {/* Left reel */}
    <circle cx="7" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle
      cx="7"
      cy="10"
      r="3"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.5"
    />
    <circle cx="7" cy="10" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    {/* Left reel center hole */}
    <circle cx="7" cy="10" r="0.5" fill="currentColor" />
    {/* Left reel spokes */}
    <line x1="7" y1="6.5" x2="7" y2="8" strokeWidth="0.8" opacity="0.4" />
    <line x1="7" y1="12" x2="7" y2="13.5" strokeWidth="0.8" opacity="0.4" />
    <line x1="3.5" y1="10" x2="5" y2="10" strokeWidth="0.8" opacity="0.4" />
    <line x1="9" y1="10" x2="10.5" y2="10" strokeWidth="0.8" opacity="0.4" />

    {/* Right reel (less tape) */}
    <circle cx="17" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle
      cx="17"
      cy="10"
      r="2"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.5"
    />
    <circle cx="17" cy="10" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
    {/* Right reel center hole */}
    <circle cx="17" cy="10" r="0.5" fill="currentColor" />
    {/* Right reel spokes */}
    <line x1="17" y1="6.5" x2="17" y2="8" strokeWidth="0.8" opacity="0.4" />
    <line x1="17" y1="12" x2="17" y2="13.5" strokeWidth="0.8" opacity="0.4" />
    <line x1="13.5" y1="10" x2="15" y2="10" strokeWidth="0.8" opacity="0.4" />
    <line x1="19" y1="10" x2="20.5" y2="10" strokeWidth="0.8" opacity="0.4" />

    {/* Tape path */}
    <path d="M12 10h0" stroke="currentColor" strokeWidth="0.8" />
    <path d="M7 5c2-2 8-2 10 0" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
    <path
      d="M7 15c2 2 8 2 10 0"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
      opacity="0.6"
    />

    {/* Tape heads */}
    <rect x="10" y="14" width="4" height="2" rx="0.3" fill="currentColor" opacity="0.5" />
    <line x1="11" y1="14" x2="11" y2="16" strokeWidth="0.5" opacity="0.3" />
    <line x1="12" y1="14" x2="12" y2="16" strokeWidth="0.5" opacity="0.3" />
    <line x1="13" y1="14" x2="13" y2="16" strokeWidth="0.5" opacity="0.3" />

    {/* Recording deck base */}
    <rect
      x="2"
      y="18"
      width="20"
      height="4"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
    />
    {/* Transport buttons */}
    <circle cx="6" cy="20" r="0.8" fill="currentColor" opacity="0.4" />
    <rect x="8" y="19.3" width="1.4" height="1.4" fill="currentColor" opacity="0.4" />
    <path d="M11 19.3l1.5.7-1.5.7z" fill="currentColor" opacity="0.4" />
    <path d="M14 19.3l1.5.7-1.5.7zM15.5 19.3l1.5.7-1.5.7z" fill="currentColor" opacity="0.4" />
    {/* VU meter */}
    <rect
      x="18"
      y="19"
      width="3"
      height="2"
      rx="0.3"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.6"
    />
  </>,
  'TapeReel'
);

// =====================
// MERCHANDISE PRODUCT ICONS
// Custom icons for merch designer
// =====================

// TShirt - apparel t-shirt
export const TShirt = createIcon(
  <>
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
  </>,
  'TShirt'
);

// Hoodie - hooded sweatshirt
export const Hoodie = createIcon(
  <>
    <path d="M20 3h-3.5L12 5 7.5 3H4l-2 6h3v13h14V9h3l-2-6z" />
    <path d="M12 5c-2 0-3.5 1.5-3.5 3.5v1c0 1.5 1.5 2.5 3.5 2.5s3.5-1 3.5-2.5v-1C15.5 6.5 14 5 12 5z" />
    <line x1="5" y1="9" x2="5" y2="22" />
    <line x1="19" y1="9" x2="19" y2="22" />
  </>,
  'Hoodie'
);

// CoffeeMug - mug/cup
export const CoffeeMug = createIcon(
  <>
    <path d="M17 8h1a4 4 0 110 8h-1" />
    <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </>,
  'CoffeeMug'
);

// Poster - wall art/poster frame
export const Poster = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 15l5-5c.6-.6 1.4-.6 2 0l7 7" />
    <path d="M14 14l1-1c.6-.6 1.4-.6 2 0l4 4" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </>,
  'Poster'
);

// BaseballCap - hat/cap
export const BaseballCap = createIcon(
  <>
    <path d="M12 3c-4.97 0-9 3.13-9 7h18c0-3.87-4.03-7-9-7z" />
    <path d="M3 10v2c0 1.66 4.03 3 9 3s9-1.34 9-3v-2" />
    <path d="M21 10c1.1 0 2 .9 2 2s-.9 2-2 2" />
    <path d="M5 15v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3" />
  </>,
  'BaseballCap'
);

// StickerIcon - die-cut sticker
export const StickerIcon = createIcon(
  <>
    <path d="M15.5 3H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2V8.5L15.5 3z" />
    <path d="M15 3v6h6" />
    <path d="M10 12a2 2 0 104 0 2 2 0 10-4 0" />
    <path d="M8 17c.5-1.5 2-2.5 4-2.5s3.5 1 4 2.5" />
  </>,
  'StickerIcon'
);

// TankTop - sleeveless shirt
export const TankTop = createIcon(
  <>
    <path d="M6 3l2 2v15a2 2 0 002 2h4a2 2 0 002-2V5l2-2" />
    <path d="M4 3h16" />
    <path d="M8 5c0 2 2 4 4 4s4-2 4-4" />
    <line x1="8" y1="5" x2="8" y2="20" />
    <line x1="16" y1="5" x2="16" y2="20" />
  </>,
  'TankTop'
);

// ToteBag - shopping/tote bag
export const ToteBag = createIcon(
  <>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </>,
  'ToteBag'
);

// =====================
// MISSING ICONS (Build Fix)
// =====================

// FileArchive - archived/compressed file
export const FileArchive = createIcon(
  <>
    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 12v-1" />
    <path d="M10 18v-2" />
    <path d="M10 15v-1" />
  </>,
  'FileArchive'
);

// Inbox - message inbox
export const Inbox = createIcon(
  <>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </>,
  'Inbox'
);

// ReplyAll - reply to all
export const ReplyAll = createIcon(
  <>
    <polyline points="7 17 2 12 7 7" />
    <polyline points="12 17 7 12 12 7" />
    <path d="M22 18v-2a4 4 0 00-4-4H7" />
  </>,
  'ReplyAll'
);

// Archive - archive item
export const Archive = createIcon(
  <>
    <rect x="2" y="3" width="20" height="5" rx="1" />
    <path d="M4 8v11a2 2 0 002 2h12a2 2 0 002-2V8" />
    <path d="M10 12h4" />
  </>,
  'Archive'
);

// Move - move/drag item
export const Move = createIcon(
  <>
    <polyline points="5 9 2 12 5 15" />
    <polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" />
    <polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </>,
  'Move'
);

// Truck - shipping/delivery
export const Truck = createIcon(
  <>
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </>,
  'Truck'
);

// Film - video/film reel
export const Film = createIcon(
  <>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </>,
  'Film'
);

// Banknote - paper money
export const Banknote = createIcon(
  <>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </>,
  'Banknote'
);

// PiggyBank - savings
export const PiggyBank = createIcon(
  <>
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z" />
    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
    <path d="M16 11h.01" />
  </>,
  'PiggyBank'
);

// Cloud - cloud storage
export const Cloud = createIcon(
  <>
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
  </>,
  'Cloud'
);

// CloudOff - disconnected from cloud
export const CloudOff = createIcon(
  <>
    <path d="M2 2l20 20" />
    <path d="M5.25 5.23A9 9 0 003 11.8 5.3 5.3 0 001 16a5 5 0 005 5h9" />
    <path d="M17 17h.8a5 5 0 00.6-9.97A9 9 0 008.8 4.8" />
  </>,
  'CloudOff'
);

// PanelLeftClose - close left panel
export const PanelLeftClose = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="M16 15l-3-3 3-3" />
  </>,
  'PanelLeftClose'
);

// PanelLeft - left panel
export const PanelLeft = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </>,
  'PanelLeft'
);

// PenTool - pen/design tool
export const PenTool = createIcon(
  <>
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </>,
  'PenTool'
);

// Server - server/hosting
export const Server = createIcon(
  <>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </>,
  'Server'
);

// FileEdit - edit file
export const FileEdit = createIcon(
  <>
    <path d="M4 13.5V4a2 2 0 012-2h8.5L20 7.5V20a2 2 0 01-2 2h-5.5" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10.42 12.61a2.1 2.1 0 112.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44z" />
  </>,
  'FileEdit'
);

// Map - map/navigation
export const Map = createIcon(
  <>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </>,
  'Map'
);

// Pen - writing pen
export const Pen = createIcon(
  <>
    <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </>,
  'Pen'
);

// Key - key/access
export const Key = createIcon(
  <>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </>,
  'Key'
);

// Copyright - copyright symbol
export const Copyright = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9.354a4 4 0 100 5.292" />
  </>,
  'Copyright'
);

// ZoomOut - zoom out
export const ZoomOut = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </>,
  'ZoomOut'
);

// QrCode - QR code
export const QrCode = createIcon(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="3" height="3" />
    <rect x="18" y="14" width="3" height="3" />
    <rect x="14" y="18" width="3" height="3" />
    <rect x="18" y="18" width="3" height="3" />
  </>,
  'QrCode'
);

// VideoIcon - video camera (alias)
export const VideoIcon = createIcon(
  <>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </>,
  'VideoIcon'
);

// Flag (additional export)
export const FlagIcon = Flag;

// UserX - blocked user
export const UserX = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </>,
  'UserX'
);

// Ban - block/prohibit
export const Ban = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </>,
  'Ban'
);

// Ghost - invisible/ignored user
export const Ghost = createIcon(
  <>
    <path d="M9 10h.01M15 10h.01M12 2a8 8 0 00-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 00-8-8z" />
  </>,
  'Ghost'
);

// MessageSquareOff - muted conversation
export const MessageSquareOff = createIcon(
  <>
    <path d="M21 15V5a2 2 0 00-2-2H9" />
    <path d="M3 3l18 18" />
    <path d="M3 7v8a2 2 0 002 2h14l-4 4" />
  </>,
  'MessageSquareOff'
);

// MousePointer - cursor pointer
export const MousePointer = createIcon(
  <>
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </>,
  'MousePointer'
);

// Scroll - scroll/document
export const Scroll = createIcon(
  <>
    <path d="M8 21h12a2 2 0 002-2v-2H10v2a2 2 0 11-4 0V5a2 2 0 10-4 0v3h4" />
    <path d="M19 17V5a2 2 0 00-2-2H4" />
  </>,
  'Scroll'
);

// Crop - crop/resize
export const Crop = createIcon(
  <>
    <path d="M6.13 1L6 16a2 2 0 002 2h15" />
    <path d="M1 6.13L16 6a2 2 0 012 2v15" />
  </>,
  'Crop'
);

// Contrast - contrast/adjustment
export const Contrast = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
  </>,
  'Contrast'
);

// Scissors - cut/trim
export const Scissors = createIcon(
  <>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </>,
  'Scissors'
);

// GitCompare - version comparison
export const GitCompare = createIcon(
  <>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 012 2v7" />
    <line x1="6" y1="9" x2="6" y2="21" />
  </>,
  'GitCompare'
);

// Type alias for LucideIcon compatibility
export type LucideIcon = typeof Activity;

// Export all icons for easy access
export const Icons = {
  Activity,
  AlertCircle,
  AlertTriangle,
  Amplifier,
  AcousticGuitar,
  Archive,
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  AtSign,
  AudioInterface,
  Award,
  Banknote,
  BarChart,
  BarChart3,
  BassGuitar,
  BadgeCheck,
  Bell,
  BellOff,
  Book,
  Bookmark,
  BookOpen,
  Brain,
  Briefcase,
  Bed,
  Bot,
  Building,
  Building2,
  Camera,
  Car,
  Calendar,
  CalendarPlus,
  Check,
  CheckCheck,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  ClipboardList,
  Clock,
  Cloud,
  CloudOff,
  Coffee,
  Command,
  Compass,
  Coins,
  Copy,
  Copyright,
  CreditCard,
  Crown,
  Disc,
  Disc3,
  Database,
  DollarSign,
  Download,
  Drum,
  DrumKit,
  EffectsPedal,
  Edit,
  Edit2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  File,
  FileArchive,
  FileAudio,
  FileCheck,
  FileEdit,
  FileMusic,
  FileText,
  FileType,
  Film,
  Filter,
  Flag,
  FlagIcon,
  Flame,
  FlaskConical,
  Folder,
  FolderOpen,
  FolderPlus,
  Rocket,
  Cpu,
  CircuitBoard,
  RefreshCcw,
  CheckSquare,
  ScrollText,
  Gauge,
  Gift,
  GitBranch,
  Globe,
  GraduationCap,
  Grid,
  Grid3x3,
  GripVertical,
  Guitar,
  Hand,
  HardDrive,
  Hash,
  Headphones,
  Heart,
  HelpCircle,
  History,
  Home,
  Image,
  ImageIcon,
  Inbox,
  Info,
  Instagram,
  Key,
  Keyboard,
  KeyboardSynth,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  Layout,
  Library,
  Lightbulb,
  Link,
  Link2,
  Link2Off,
  Linkedin,
  LinkIcon,
  List,
  ListMusic,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Map,
  MapPin,
  Maximize,
  Maximize2,
  Medal,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  Mic2,
  MicOff,
  MixingConsole,
  Minimize2,
  Minus,
  Monitor,
  MonitorOff,
  MonitorSpeaker,
  MonitorUp,
  MonitorX,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Mouse,
  MousePointer2,
  Move,
  Music,
  Music2,
  Music4,
  Navigation,
  Newspaper,
  Palette,
  PanelLeft,
  PanelLeftClose,
  Paperclip,
  PatchCable,
  Pause,
  Pen,
  PenTool,
  Phone,
  PhoneOff,
  Piano,
  PieChart,
  PiggyBank,
  Pin,
  Play,
  PlayCircle,
  Plus,
  Presentation,
  Printer,
  QrCode,
  Quote,
  Radio,
  Redo,
  RefreshCw,
  Repeat,
  Repeat2,
  Reply,
  ReplyAll,
  RotateCcw,
  RotateCw,
  Ruler,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Settings2,
  Share2,
  Sliders,
  SlidersHorizontal,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Shuffle,
  SkipBack,
  SkipForward,
  Smartphone,
  Smile,
  Sparkles,
  Speaker,
  Square,
  Star,
  StickyNote,
  StopCircle,
  StudioMonitors,
  StudioHeadphones,
  StageLights,
  Metronome,
  MusicStand,
  Saxophone,
  Sun,
  Tablet,
  Tag,
  Target,
  Package,
  Megaphone,
  Ticket,
  Timer,
  Turntable,
  TapeReel,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  Tv,
  Twitter,
  Type,
  Undo,
  Unplug,
  Upload,
  User,
  Utensils,
  UserCheck,
  UserPlus,
  Users,
  UserSearch,
  UserX,
  Video,
  VideoIcon,
  Violin,
  VideoOff,
  Ban,
  Ghost,
  MessageSquareOff,
  MousePointer,
  Scroll,
  Crop,
  Contrast,
  Scissors,
  GitCompare,
  Volume2,
  VolumeX,
  Wand2,
  Wifi,
  WifiOff,
  Wrench,
  X,
  XCircle,
  Youtube,
  Zap,
  ZoomIn,
  ZoomOut,
  // Merchandise Product Icons
  TShirt,
  Hoodie,
  CoffeeMug,
  Poster,
  BaseballCap,
  StickerIcon,
  TankTop,
  ToteBag,
} as const;

export default Icons;
