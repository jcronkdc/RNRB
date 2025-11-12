'use client';

import { Button } from '@cronkwater/ui';
import Link from 'next/link';
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'An unknown error occurred';
      const errorStack = this.state.error?.stack;

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20" role="alert" aria-labelledby="error-heading">
          <div className="w-full max-w-xl rounded-3xl border border-danger/40 bg-surface/95 p-10 text-center shadow-soft">
            <h1 className="mb-4 text-2xl font-bold text-brand-foreground" id="error-heading">
              Something went wrong
            </h1>
            <p className="mb-6 text-base text-muted-foreground">
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 rounded-xl border border-border/60 bg-surface-muted p-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-brand-foreground">
                  Error details (development only)
                </summary>
                <pre className="mt-3 overflow-auto text-xs text-muted-foreground" aria-label="Error stack trace">
                  {errorMessage}
                  {errorStack && `\n\n${errorStack}`}
                </pre>
              </details>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={this.handleReset} variant="solid" aria-label="Retry loading the page">
                Try again
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Go home</Link>
              </Button>
              {process.env.NODE_ENV === 'production' && (
                <Button asChild variant="ghost">
                  <Link href="/app/projects">Back to Projects</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

