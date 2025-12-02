'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If we're back online, redirect to dashboard
  useEffect(() => {
    if (isOnline) {
      window.location.href = '/dashboard';
    }
  }, [isOnline]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-block">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={180}
            height={72}
            priority
          />
        </Link>

        {/* Offline Icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: '#ef4444' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m12.728 12.728L5.636 5.636"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text)' }}>
          You're Offline
        </h1>

        {/* Description */}
        <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
          It looks like you've lost your internet connection. Don't worry—your work is safe. We'll
          reconnect automatically when you're back online.
        </p>

        {/* Status Indicator */}
        <div
          className="mb-8 inline-flex items-center gap-3 rounded-full px-5 py-3"
          style={{
            background: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isOnline ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          <span
            className="h-3 w-3 animate-pulse rounded-full"
            style={{ background: isOnline ? '#22c55e' : '#ef4444' }}
          />
          <span style={{ color: isOnline ? '#22c55e' : '#ef4444' }}>
            {isOnline ? 'Back online! Redirecting...' : 'Waiting for connection...'}
          </span>
        </div>

        {/* What's Available Offline */}
        <div
          className="rounded-xl p-6 text-left"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h2
            className="mb-4 text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--muted)' }}
          >
            What you can still do offline:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3" style={{ color: 'var(--text-secondary)' }}>
              <svg
                className="mt-0.5 h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#22c55e' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>View cached projects and songs</span>
            </li>
            <li className="flex items-start gap-3" style={{ color: 'var(--text-secondary)' }}>
              <svg
                className="mt-0.5 h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#22c55e' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Draft new ideas—they'll sync when you reconnect</span>
            </li>
            <li className="flex items-start gap-3" style={{ color: 'var(--text-secondary)' }}>
              <svg
                className="mt-0.5 h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#22c55e' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Browse recently visited pages</span>
            </li>
          </ul>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-white transition-all hover:scale-105"
          style={{ background: 'var(--accent)' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
}
