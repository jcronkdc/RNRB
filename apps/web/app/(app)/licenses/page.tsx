export default function LicensesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">Licenses</p>
        <h1 className="text-3xl font-semibold text-brand-foreground">Sync requests &amp; approvals</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Track incoming briefs, negotiate terms, and generate delivery kits for supervisors in a single shared workspace.
        </p>
      </header>
      <div className="rounded-3xl border border-border/60 bg-surface p-8 text-sm text-muted-foreground shadow-soft">
        Workflow automations with DocuSign and Mediabase reporting will land in Q3. Join the early cohort from Settings &gt;
        Labs.
      </div>
    </div>
  );
}

