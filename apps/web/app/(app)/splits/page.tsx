export const dynamic = 'force-dynamic';

export default function SplitsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">Splits</p>
        <h1 className="text-3xl font-semibold text-brand-foreground">Rights &amp; contributions</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Draft, negotiate, and publish split sheets with built-in audit trails and integrations for PRO submissions.
        </p>
      </header>
      <div className="rounded-3xl border border-border/60 bg-surface p-8 text-sm text-muted-foreground shadow-soft">
        Automated consensus tracking and legal export formats are coming soon. Contact CronkWater Support to join the pilot.
      </div>
    </div>
  );
}

