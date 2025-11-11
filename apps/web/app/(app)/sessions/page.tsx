export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">Sessions</p>
        <h1 className="text-3xl font-semibold text-brand-foreground">Studio calendar</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Schedule writing rooms, rehearsals, and listening parties. Syncs with shared calendars and surfaces prep notes
          automatically.
        </p>
      </header>
      <div className="rounded-3xl border border-border/60 bg-surface p-8 text-sm text-muted-foreground shadow-soft">
        Timeline tooling coming soon—meanwhile, sessions can be managed directly from Projects &gt; Calendar.
      </div>
    </div>
  );
}

