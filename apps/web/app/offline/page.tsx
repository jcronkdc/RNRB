/**
 * Offline Fallback Page
 *
 * Shown when the user is offline and the requested page isn't cached.
 * Provides a friendly UX with retry functionality.
 */

'use client';

import { useEffect } from 'react';

export default function OfflinePage() {
  // Auto-retry when connection is restored
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      }}
    >
      {/* Offline Icon */}
      <div className="mb-8 rounded-full bg-white/5 p-6">
        <svg
          className="h-16 w-16 text-orange-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
          />
          <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Message */}
      <h1 className="mb-4 text-center text-3xl font-bold" style={{ color: 'var(--text, #fff)' }}>
        You&apos;re Offline
      </h1>

      <p className="mb-8 max-w-md text-center text-lg" style={{ color: 'var(--muted, #888)' }}>
        Looks like you&apos;ve lost your internet connection. Don&apos;t worry—your work is saved
        locally.
      </p>

      {/* Features that work offline */}
      <div
        className="mb-8 rounded-lg border p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2
          className="mb-4 text-center text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--muted, #888)' }}
        >
          What still works
        </h2>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text, #fff)' }}>
          <li className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            View cached pages and projects
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Draft lyrics and notes (syncs when online)
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Play downloaded audio files
          </li>
        </ul>
      </div>

      {/* Retry Button */}
      <button
        onClick={() => window.location.reload()}
        className="group flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: '#fff',
        }}
      >
        <svg
          className="h-5 w-5 transition-transform group-hover:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try Again
      </button>

      {/* Connection status indicator */}
      <div className="mt-8 flex items-center gap-2 text-sm" style={{ color: 'var(--muted, #888)' }}>
        <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: '#ef4444' }} />
        Waiting for connection...
      </div>
    </div>
  );
}
