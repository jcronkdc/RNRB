'use client';

import { Button } from '@songforge/ui';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <section
        role="alert"
        className="motion-safe:animate-fade-in w-full max-w-xl rounded-3xl border border-border/60 bg-surface/95 p-10 text-center shadow-soft"
      >
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Something went sideways.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We hit an unexpected snag while loading this page. You can try again, head back home, or open your
          projects.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="ghost">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/app/projects">Open Projects</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
