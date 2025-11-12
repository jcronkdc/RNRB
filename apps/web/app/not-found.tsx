import { Button } from '@cronkwaters/ui';
import { Compass } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <section className="motion-safe:animate-fade-in w-full max-w-xl rounded-3xl border border-border/60 bg-surface/95 p-10 text-center shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border/50 bg-brand-primary/10 text-brand-primary">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-brand-foreground">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We couldn’t find the page you were looking for. Try heading home or jump into your projects.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
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
