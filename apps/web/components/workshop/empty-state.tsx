'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { getEmptyState, emptyStates } from '@/lib/workshop-voice';

interface EmptyStateProps {
  type: keyof typeof emptyStates;
  // Optional overrides
  customTitle?: string;
  customMessage?: string;
  customSubtext?: string;
  customAction?: string;
  customActionHref?: string;
  onAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * EmptyState Component
 *
 * Transforms "nothing here" into "this is where it begins"
 * Clean, understated, no emojis or cheesy elements
 */
export function EmptyState({
  type,
  customTitle,
  customMessage,
  customSubtext,
  customAction,
  customActionHref,
  onAction,
  className = '',
  size = 'md',
}: EmptyStateProps) {
  const state = getEmptyState(type);

  const title = customTitle || state.title;
  const message = customMessage || state.message;
  const subtext = customSubtext || state.subtext;
  const action = customAction || state.action;
  const actionHref = customActionHref || state.actionHref;

  const sizes = {
    sm: {
      container: 'py-8 px-6',
      title: 'text-base font-medium mb-2',
      message: 'text-sm mb-1',
      subtext: 'text-xs mb-4',
      button: 'px-4 py-2 text-sm',
    },
    md: {
      container: 'py-12 px-8',
      title: 'text-lg font-medium mb-3',
      message: 'text-sm mb-2',
      subtext: 'text-sm mb-6',
      button: 'px-5 py-2.5 text-sm',
    },
    lg: {
      container: 'py-16 px-12',
      title: 'text-xl font-medium mb-4',
      message: 'text-base mb-3',
      subtext: 'text-base mb-8',
      button: 'px-6 py-3 text-base',
    },
  };

  const s = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl text-center ${className} ${s.container} `}
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Title */}
      <h3 className={s.title} style={{ color: 'var(--text)' }}>
        {title}
      </h3>

      {/* Main message */}
      <p
        className={s.message}
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '380px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}
      >
        {message}
      </p>

      {/* Subtext */}
      {subtext && (
        <p className={s.subtext} style={{ color: 'var(--muted)' }}>
          {subtext}
        </p>
      )}

      {/* Action button */}
      {action && (
        <>
          {onAction ? (
            <button
              onClick={onAction}
              className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 hover:opacity-90 ${s.button} `}
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              {action}
            </button>
          ) : actionHref ? (
            <Link
              href={actionHref}
              className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 hover:opacity-90 ${s.button} `}
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              {action}
            </Link>
          ) : null}
        </>
      )}
    </motion.div>
  );
}

/**
 * Inline Empty State - for smaller contexts like cards or sidebars
 */
export function EmptyStateInline({
  text,
  action,
  actionHref,
  onAction,
}: {
  text: string;
  action?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
        {text}
      </p>
      {action &&
        (onAction ? (
          <button
            onClick={onAction}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            {action}
          </button>
        ) : actionHref ? (
          <Link
            href={actionHref}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            {action}
          </Link>
        ) : null)}
    </div>
  );
}
