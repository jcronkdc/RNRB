'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard] Error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ background: 'var(--surface)', color: 'var(--muted)' }}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mb-1.5 text-lg font-bold" style={{ color: 'var(--text)' }}>
        Something went wrong
      </h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
        We couldn&apos;t load your dashboard. This is usually temporary.
      </p>
      <button
        onClick={reset}
        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent)' }}
      >
        Try again
      </button>
    </div>
  );
}
