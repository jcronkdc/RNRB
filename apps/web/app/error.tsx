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
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  // Check if this is an environment variable error
  const isEnvError = error.message?.includes('environment variable');

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
            {error.message && (
              <p className="text-sm text-muted-foreground">{error.message}</p>
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