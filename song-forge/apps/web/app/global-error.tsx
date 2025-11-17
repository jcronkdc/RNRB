'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error securely without exposing details
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical application error:', error.digest || 'Unknown');
    } else {
      console.error('Global error:', error);
    }
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="mx-auto max-w-md text-center">
            <h1 className="mb-4 text-4xl font-bold">⚠️ Application Error</h1>
            <p className="mb-4 text-lg">
              The application encountered a critical error.
            </p>
            {/* Only show error details in development */}
            {isDevelopment && error.message && (
              <p className="mb-4 text-sm text-gray-600">{error.message}</p>
            )}
            {/* Show error ID in production for support */}
            {!isDevelopment && error.digest && (
              <p className="mb-4 text-xs text-gray-500">
                Reference: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
