'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">
              Something went wrong!
            </h1>
            <p className="mb-8 max-w-md text-gray-600">
              We encountered an unexpected error. This might be a temporary issue.
              Please try refreshing the page or contact support if the problem persists.
            </p>
            {error.digest && (
              <p className="mb-6 font-mono text-xs text-gray-500">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => reset()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                Go to homepage
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}