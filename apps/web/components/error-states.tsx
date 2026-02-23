/**
 * Enhanced Error States with Actionable Guidance
 *
 * Provides context-aware error messages that help users understand what went wrong
 * and what they can do about it. Much better than generic "Something went wrong"!
 */

'use client';

import { motion } from 'motion/react';
import {
  AlertCircle,
  WifiOff,
  Shield,
  Clock,
  Server,
  RefreshCw,
  HelpCircle,
  Zap,
  Ban,
  File,
  Home,
  ArrowLeft,
} from '@/components/ui/custom-icons';

// Aliases for backwards compatibility
const ShieldAlert = Shield;
const FileQuestion = File;
import Link from 'next/link';

export type ErrorType =
  | 'generic' // Unknown error
  | 'network' // No internet connection
  | 'timeout' // Request timed out
  | 'server' // Server error (500)
  | 'not-found' // Resource not found (404)
  | 'forbidden' // Permission denied (403)
  | 'unauthorized' // Not logged in (401)
  | 'rate-limit' // Too many requests (429)
  | 'validation' // Bad input data
  | 'maintenance'; // Site under maintenance

interface ErrorConfig {
  icon: React.ElementType;
  title: string;
  description: string;
  suggestion: string;
  primaryAction: {
    label: string;
    action: 'retry' | 'home' | 'back' | 'login' | 'refresh';
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  color: string;
}

const errorConfigs: Record<ErrorType, ErrorConfig> = {
  generic: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We hit an unexpected snag while processing your request.',
    suggestion: 'This is usually temporary. Give it another shot!',
    primaryAction: { label: 'Try Again', action: 'retry' },
    secondaryAction: { label: 'Go Home', href: '/' },
    color: 'from-red-500 to-orange-500',
  },
  network: {
    icon: WifiOff,
    title: "You're offline",
    description: "Can't reach our servers right now.",
    suggestion: 'Check your Wi-Fi or mobile data, then try again.',
    primaryAction: { label: 'Retry Connection', action: 'retry' },
    color: 'from-gray-500 to-slate-500',
  },
  timeout: {
    icon: Clock,
    title: 'Request timed out',
    description: 'The server is taking too long to respond.',
    suggestion: 'This might be due to heavy traffic. Wait a moment and retry.',
    primaryAction: { label: 'Try Again', action: 'retry' },
    color: 'from-amber-500 to-orange-500',
  },
  server: {
    icon: Server,
    title: 'Server hiccup',
    description: "Our servers ran into a problem they couldn't handle.",
    suggestion: "We're probably already working on it. Try again in a minute!",
    primaryAction: { label: 'Refresh Page', action: 'refresh' },
    secondaryAction: { label: 'Check Status', href: '/status' },
    color: 'from-red-600 to-red-500',
  },
  'not-found': {
    icon: FileQuestion,
    title: "Can't find that",
    description: "The page or resource you're looking for doesn't exist.",
    suggestion: 'It may have been moved or deleted. Try searching for it!',
    primaryAction: { label: 'Go Home', action: 'home' },
    secondaryAction: { label: 'Search', href: '/search' },
    color: 'from-purple-500 to-indigo-500',
  },
  forbidden: {
    icon: Ban,
    title: 'Access denied',
    description: "You don't have permission to access this content.",
    suggestion: 'This might be restricted to certain users or subscription tiers.',
    primaryAction: { label: 'Go Back', action: 'back' },
    secondaryAction: { label: 'View Plans', href: '/pricing' },
    color: 'from-red-500 to-pink-500',
  },
  unauthorized: {
    icon: ShieldAlert,
    title: 'Sign in required',
    description: 'You need to be logged in to view this content.',
    suggestion: 'Your session may have expired. Sign in to continue.',
    primaryAction: { label: 'Sign In', action: 'login' },
    secondaryAction: { label: 'Create Account', href: '/signup' },
    color: 'from-blue-500 to-cyan-500',
  },
  'rate-limit': {
    icon: Zap,
    title: 'Slow down there!',
    description: "You've made too many requests in a short time.",
    suggestion: 'Wait a few minutes before trying again. We need to catch up!',
    primaryAction: { label: 'Wait & Retry', action: 'retry' },
    color: 'from-yellow-500 to-amber-500',
  },
  validation: {
    icon: AlertCircle,
    title: 'Invalid input',
    description: 'Some of the data you provided needs attention.',
    suggestion: 'Check your inputs and make sure everything looks correct.',
    primaryAction: { label: 'Try Again', action: 'retry' },
    color: 'from-orange-500 to-amber-500',
  },
  maintenance: {
    icon: Server,
    title: "We're upgrading",
    description: "Rock N' Roll Basement is getting some improvements.",
    suggestion: "We'll be back shortly with new features and fixes!",
    primaryAction: { label: 'Refresh Page', action: 'refresh' },
    color: 'from-purple-500 to-blue-500',
  },
};

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  suggestion?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
  className?: string;
}

export function ErrorState({
  type = 'generic',
  title,
  description,
  suggestion,
  onRetry,
  showHomeLink = true,
  className = '',
}: ErrorStateProps) {
  const config = errorConfigs[type];
  const Icon = config.icon;

  const handleAction = () => {
    switch (config.primaryAction.action) {
      case 'retry':
        onRetry?.();
        break;
      case 'home':
        window.location.href = '/';
        break;
      case 'back':
        window.history.back();
        break;
      case 'login':
        window.location.href = '/signin';
        break;
      case 'refresh':
        window.location.reload();
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center px-4 py-16 text-center ${className}`}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br ${config.color}`}
      >
        <Icon className="h-10 w-10 text-white" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-2xl font-bold text-white"
      >
        {title || config.title}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-2 max-w-md text-white/70"
      >
        {description || config.description}
      </motion.p>

      {/* Suggestion - The helpful part! */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2"
      >
        <HelpCircle className="h-4 w-4 text-white/50" />
        <p className="text-sm text-white/60">{suggestion || config.suggestion}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {/* Primary Action */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAction}
          className={`flex items-center gap-2 rounded-xl bg-linear-to-r ${config.color} px-6 py-3 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl`}
        >
          <RefreshCw className="h-4 w-4" />
          {config.primaryAction.label}
        </motion.button>

        {/* Secondary Action */}
        {config.secondaryAction && showHomeLink && (
          <Link href={config.secondaryAction.href}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              {config.secondaryAction.label === 'Go Home' ? (
                <Home className="h-4 w-4" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
              {config.secondaryAction.label}
            </motion.button>
          </Link>
        )}
      </motion.div>

      {/* Error Code (for debugging) */}
      {type !== 'generic' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs text-white/30"
        >
          Error type: {type.toUpperCase()}
        </motion.p>
      )}
    </motion.div>
  );
}

/**
 * Inline error message for form fields and small contexts
 */
interface InlineErrorProps {
  message: string;
  suggestion?: string;
  className?: string;
}

export function InlineError({ message, suggestion, className = '' }: InlineErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 ${className}`}
    >
      <p className="text-sm text-red-400">{message}</p>
      {suggestion && <p className="mt-1 text-xs text-red-400/70">{suggestion}</p>}
    </motion.div>
  );
}

/**
 * Toast-style error notification
 */
interface ErrorToastProps {
  type?: ErrorType;
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function ErrorToast({
  type = 'generic',
  message,
  onDismiss,
  autoHide = true,
  duration = 5000,
}: ErrorToastProps) {
  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-start gap-3 rounded-xl bg-linear-to-r ${config.color} p-4 shadow-xl`}
    >
      <Icon className="h-5 w-5 shrink-0 text-white" />
      <div className="flex-1">
        <p className="font-medium text-white">{message}</p>
        <p className="mt-1 text-sm text-white/80">{config.suggestion}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-white/60 hover:text-white">
          ✕
        </button>
      )}
    </motion.div>
  );
}

/**
 * Helper to determine error type from HTTP status code
 */
export function getErrorTypeFromStatus(status: number): ErrorType {
  switch (status) {
    case 400:
      return 'validation';
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'not-found';
    case 408:
      return 'timeout';
    case 429:
      return 'rate-limit';
    case 500:
    case 502:
    case 503:
      return 'server';
    case 504:
      return 'timeout';
    default:
      return 'generic';
  }
}

/**
 * Helper to determine error type from error message
 */
export function getErrorTypeFromMessage(message: string): ErrorType {
  const lower = message.toLowerCase();

  if (lower.includes('network') || lower.includes('offline') || lower.includes('fetch')) {
    return 'network';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'timeout';
  }
  if (lower.includes('unauthorized') || lower.includes('login') || lower.includes('sign in')) {
    return 'unauthorized';
  }
  if (
    lower.includes('permission') ||
    lower.includes('forbidden') ||
    lower.includes('access denied')
  ) {
    return 'forbidden';
  }
  if (lower.includes('not found') || lower.includes('404')) {
    return 'not-found';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'rate-limit';
  }
  if (lower.includes('server') || lower.includes('500') || lower.includes('internal')) {
    return 'server';
  }
  if (lower.includes('maintenance') || lower.includes('upgrade')) {
    return 'maintenance';
  }

  return 'generic';
}
