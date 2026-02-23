'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(220, 38, 38, 0.1)' }}
          >
            <AlertTriangle className="h-7 w-7" style={{ color: 'var(--error)' }} />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
          Something went wrong
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
          An unexpected error occurred. Please try again.
        </p>

        {error.digest && (
          <p className="mb-4 text-xs" style={{ color: 'var(--muted-soft)' }}>
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/3"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
