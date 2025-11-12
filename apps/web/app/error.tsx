'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, log to error reporting service without exposing details
    if (process.env.NODE_ENV === 'production') {
      console.error('Application error:', error.digest || 'Unknown error');
      // TODO: Send to error monitoring service (e.g., Sentry)
    } else {
      // Only log full error in development
      console.error(error);
    }
  }, [error]);

  // Never expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isEnvError = isDevelopment && error.message?.includes('environment variable');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold">
          {isEnvError ? '⚠️ Configuration Error' : '❌ Something went wrong'}
        </h1>
        
        {isEnvError ? (
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              The application is missing required environment variables.
            </p>
            <div className="rounded-lg bg-destructive/10 p-4 text-left">
              <p className="font-mono text-sm">{error.message}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              If you're the site owner, please check the VERCEL_ENV_VARS.md file
              for setup instructions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            {/* Only show error details in development */}
            {isDevelopment && error.message && (
              <p className="text-sm text-muted-foreground">{error.message}</p>
            )}
            {/* Show error ID in production for support reference */}
            {!isDevelopment && error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <button
          onClick={reset}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}