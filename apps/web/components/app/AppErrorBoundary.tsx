'use client';

import { Button } from '@songforge/ui';
import Link from 'next/link';

import { ErrorBoundary } from '../ErrorBoundary';

/**
 * Error boundary specifically for the authenticated app area.
 * Provides app-specific recovery options.
 */
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20">
          <div className="w-full max-w-xl rounded-3xl border border-danger/40 bg-surface/95 p-10 text-center shadow-soft">
            <h1 className="mb-4 text-2xl font-bold text-brand-foreground" id="error-heading">
              App error
            </h1>
            <p className="mb-6 text-base text-muted-foreground">
              Something went wrong in the app. You can try refreshing or navigating away.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => window.location.reload()} variant="solid">
                Refresh page
              </Button>
              <Button asChild variant="outline">
                <Link href="/app/projects">Go to Projects</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

