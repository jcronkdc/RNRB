/**
 * Micro-Animation Utilities
 *
 * Reusable animation presets for Framer Motion that create
 * a consistent, premium feel across the app.
 */

import type { Variants, Transition } from 'framer-motion';

// =============================================================================
// BUTTON ANIMATIONS
// =============================================================================

/**
 * Standard button animation - subtle scale on hover/tap
 */
export const buttonAnimation = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

/**
 * Prominent button animation - more noticeable for CTAs
 */
export const prominentButtonAnimation = {
  whileHover: { scale: 1.05, y: -2 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

/**
 * Icon button animation - rotate slightly on hover
 */
export const iconButtonAnimation = {
  whileHover: { scale: 1.1, rotate: 5 },
  whileTap: { scale: 0.9 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

// =============================================================================
// CARD ANIMATIONS
// =============================================================================

/**
 * Card hover animation - subtle lift effect
 */
export const cardHoverAnimation = {
  whileHover: {
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    transition: { duration: 0.2 },
  },
};

/**
 * Interactive card - click feedback
 */
export const interactiveCardAnimation = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.99 },
  transition: { type: 'spring', stiffness: 400, damping: 25 },
};

// =============================================================================
// PAGE TRANSITIONS
// =============================================================================

/**
 * Fade in from bottom - standard page content
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/**
 * Fade in from left - sidebar content
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * Scale in - modals and popups
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// =============================================================================
// LIST ANIMATIONS (Staggered)
// =============================================================================

/**
 * Container for staggered children
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Individual list item
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Fast stagger for quick lists
 */
export const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// =============================================================================
// LOADING ANIMATIONS
// =============================================================================

/**
 * Pulse animation for loading states
 */
export const pulseAnimation = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [0.98, 1, 0.98],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Skeleton shimmer effect
 */
export const shimmerAnimation: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};

/**
 * Spinner rotation
 */
export const spinnerAnimation = {
  animate: { rotate: 360 },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

// =============================================================================
// NOTIFICATION ANIMATIONS
// =============================================================================

/**
 * Toast notification enter/exit
 */
export const toastAnimation: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

/**
 * Badge/pill bounce
 */
export const badgeBounce: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 15 },
  },
};

// =============================================================================
// SPECIAL EFFECTS
// =============================================================================

/**
 * Success checkmark animation
 */
export const successCheck: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * Attention pulse for important elements
 */
export const attentionPulse = {
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(255, 165, 0, 0)',
      '0 0 0 10px rgba(255, 165, 0, 0.3)',
      '0 0 0 0 rgba(255, 165, 0, 0)',
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Glow effect for premium features
 */
export const glowAnimation = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(255, 165, 0, 0.2)',
      '0 0 40px rgba(255, 165, 0, 0.4)',
      '0 0 20px rgba(255, 165, 0, 0.2)',
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a staggered delay for list items
 */
export function getStaggerDelay(index: number, baseDelay = 0.1, increment = 0.05): number {
  return baseDelay + index * increment;
}

/**
 * Generate spring transition with custom settings
 */
export function springTransition(stiffness = 400, damping = 25): Transition {
  return {
    type: 'spring',
    stiffness,
    damping,
  };
}

/**
 * Generate ease transition with custom duration
 */
export function easeTransition(duration = 0.3, ease = 'easeOut'): Transition {
  return {
    duration,
    ease,
  };
}

// =============================================================================
// PRESETS FOR COMMON USE CASES
// =============================================================================

export const animationPresets = {
  // Quick actions (buttons, toggles)
  quick: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 },
  },

  // Standard interactions
  standard: {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },

  // Emphasis (CTAs, important buttons)
  emphasis: {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },

  // Subtle (secondary actions)
  subtle: {
    whileHover: { opacity: 0.8 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15 },
  },

  // Icon buttons
  icon: {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9, rotate: -10 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },

  // Cards
  card: {
    whileHover: { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
    transition: { duration: 0.2 },
  },

  // Links
  link: {
    whileHover: { x: 2 },
    transition: { duration: 0.1 },
  },
} as const;
