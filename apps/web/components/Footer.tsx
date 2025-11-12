import Link from 'next/link';

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-surface/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">
          © {year} CronkWaters Studios
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition-colors hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Terms
              </Link>
            </li>
            <li className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-muted-foreground/80">
              <span aria-hidden="true">Social</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60" aria-hidden="true" />
              <span aria-hidden="true">Soon</span>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

