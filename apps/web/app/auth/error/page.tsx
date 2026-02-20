'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  Configuration: {
    title: 'Server error',
    message: 'There is a problem with the server configuration. Please try again later.',
  },
  AccessDenied: {
    title: 'Access denied',
    message: 'You do not have permission to sign in. If you think this is a mistake, please contact support.',
  },
  Verification: {
    title: 'Verification failed',
    message: 'The verification link may have expired or already been used. Please request a new one.',
  },
  OAuthSignin: {
    title: 'Sign-in error',
    message: 'There was a problem connecting to your account provider. Please try again.',
  },
  OAuthCallback: {
    title: 'Callback error',
    message: 'There was a problem completing sign-in with your account provider.',
  },
  OAuthCreateAccount: {
    title: 'Account creation failed',
    message: 'Could not create your account. This email may already be registered with a different sign-in method.',
  },
  EmailCreateAccount: {
    title: 'Account creation failed',
    message: 'Could not create your account with this email address.',
  },
  Callback: {
    title: 'Callback error',
    message: 'There was a problem during sign-in. Please try again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account already exists',
    message: 'This email is already associated with another sign-in method. Please sign in using your original method.',
  },
  CredentialsSignin: {
    title: 'Sign-in failed',
    message: 'Invalid email or password. Please check your credentials and try again.',
  },
  SessionRequired: {
    title: 'Session expired',
    message: 'Your session has expired. Please sign in again to continue.',
  },
  Default: {
    title: 'Authentication error',
    message: 'An unexpected error occurred during authentication. Please try again.',
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error') || 'Default';
  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(220, 38, 38, 0.1)' }}
          >
            <svg
              className="h-7 w-7"
              style={{ color: 'var(--error)' }}
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
        </div>

        <h1 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
          {errorInfo.title}
        </h1>
        <p className="mb-8 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {errorInfo.message}
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth"
            className="w-full rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{ background: 'var(--accent)' }}
          >
            Try again
          </Link>
          <Link
            href="/"
            className="w-full rounded-lg border px-5 py-2.5 text-center text-sm font-medium transition-colors hover:bg-white/[0.03] sm:w-auto"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Go home
          </Link>
        </div>

        {errorCode !== 'Default' && (
          <p className="mt-6 text-xs" style={{ color: 'var(--muted-soft)' }}>
            Error code: {errorCode}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
