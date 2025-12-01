'use client';

import { forwardRef, SVGProps } from 'react';

// Custom SVG Icon Library for Rock N' Roll Basement
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

// Calendar - gig calendar
export const Calendar = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
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

// Disc - record/vinyl
export const Disc = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
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

// Mic2 - studio mic
export const Mic2 = createIcon(
  <>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <path d="M12 19v4" />
    <path d="M8 23h8" />
    <rect x="10" y="1" width="4" height="3" rx="1" />
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

// Moon - dark mode
export const Moon = createIcon(
  <>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </>,
  'Moon'
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

// Radio - broadcast/live
export const Radio = createIcon(
  <>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
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

// Users - multiple users/team
export const Users = createIcon(
  <>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
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

// FolderOpen - open folder
export const FolderOpen = createIcon(
  <>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    <path d="M2 10h20" />
  </>,
  'FolderOpen'
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

// Music4 - music note with staff
export const Music4 = createIcon(
  <>
    <path d="M9 18V5l12-2v13" />
    <path d="M6 15H4c-1.1 0-2 .9-2 2s.9 2 2 2h2c1.1 0 2-.9 2-2s-.9-2-2-2z" />
    <circle cx="18" cy="16" r="3" />
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

// Wrench - tool/settings
export const Wrench = createIcon(
  <>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
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

// Type alias for LucideIcon compatibility
export type LucideIcon = typeof Activity;

// Export all icons for easy access
export const Icons = {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  BadgeCheck,
  Bell,
  BellOff,
  Book,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
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
  Clock,
  Coffee,
  Command,
  Compass,
  Copy,
  CreditCard,
  Crown,
  Disc,
  Disc3,
  DollarSign,
  Download,
  Drum,
  Edit,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  FileAudio,
  FileCheck,
  FileText,
  Filter,
  Flame,
  FlaskConical,
  Folder,
  FolderOpen,
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
  Home,
  ImageIcon,
  Info,
  Keyboard,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Lightbulb,
  Link2,
  LinkIcon,
  List,
  ListMusic,
  Loader2,
  Lock,
  LogOut,
  Mail,
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
  Minimize2,
  Minus,
  Monitor,
  MonitorOff,
  Moon,
  MoreVertical,
  Mouse,
  MousePointer2,
  Music,
  Music2,
  Music4,
  Navigation,
  Palette,
  Paperclip,
  Pause,
  Phone,
  PhoneOff,
  Piano,
  PieChart,
  Pin,
  Play,
  Plus,
  Printer,
  Quote,
  Radio,
  Redo,
  RefreshCw,
  Repeat,
  Reply,
  RotateCcw,
  RotateCw,
  Ruler,
  Save,
  Search,
  Send,
  Settings,
  Share2,
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
  Square,
  Star,
  StickyNote,
  StopCircle,
  Sun,
  Tablet,
  Target,
  Ticket,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Undo,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  UserSearch,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Wrench,
  X,
  XCircle,
  Zap,
} as const;

export default Icons;
