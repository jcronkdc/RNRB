"use client";

import { Button } from "@cronkwaters/ui";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

// Next.js error boundaries require default export
// eslint-disable-next-line import/no-default-export
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-foreground mb-2 text-3xl font-bold">Something went wrong!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          We encountered an unexpected error. This might be a temporary issue. Please try refreshing
          the page or contact support if the problem persists.
        </p>
        {error.digest && (
          <p className="text-muted-foreground mb-6 font-mono text-xs">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => reset()} variant="solid" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go to homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
