import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Developer Console</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your CronkWaters developer console. From here you can navigate to analytics, projects, and
          other tools as they come online.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/analytics"
          className="rounded-2xl border border-border/70 bg-surface p-5 shadow-soft transition hover:border-primary hover:shadow-md"
        >
          <h2 className="text-base font-semibold text-foreground">Analytics</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor usage and activity once data is flowing through your account.
          </p>
        </Link>

        <Link
          href="/projects"
          className="rounded-2xl border border-border/70 bg-surface p-5 shadow-soft transition hover:border-primary hover:shadow-md"
        >
          <h2 className="text-base font-semibold text-foreground">Projects</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage projects associated with your account.
          </p>
        </Link>
      </section>
    </main>
  );
}


