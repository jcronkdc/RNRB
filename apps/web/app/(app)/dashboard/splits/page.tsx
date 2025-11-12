import { Button } from '@cronkwaters/ui';

const splits = [
  {
    project: 'Cedar & Rust',
    agreement: 'Draft v03',
    status: 'Awaiting signature',
    parties: ['Marlow', 'Jules', 'Ava']
  },
  {
    project: 'Glass Rivers',
    agreement: 'Signed',
    status: 'Complete',
    parties: ['Devon', 'Jun']
  },
  {
    project: 'Honey Bloom',
    agreement: 'In review',
    status: 'Negotiating',
    parties: ['Imani', 'Theo', 'Cleo']
  }
] as const;

export const dynamic = 'force-dynamic';

export default function SplitsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface p-8 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand-foreground">Splits & agreements</h2>
          <p className="text-sm text-muted-foreground">
            Keep ownership clear, auditable, and kind. Invitations track views and negotiations automatically.
          </p>
        </div>
        <Button size="sm" className="shadow-soft hover:shadow-elevated">
          Draft new split
        </Button>
      </header>
      <div className="grid gap-5 md:grid-cols-3">
        {splits.map((split) => (
          <article key={split.project} className="flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-surface-muted/70 p-6 shadow-soft">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{split.status}</p>
              <h3 className="mt-3 text-lg font-semibold text-brand-foreground">{split.project}</h3>
            </div>
            <p className="text-sm text-muted-foreground">Agreement: {split.agreement}</p>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground/90">
              {split.parties.map((party) => (
                <span key={party} className="rounded-full bg-surface px-3 py-1 shadow-outline">
                  {party}
                </span>
              ))}
            </div>
            <Button variant="ghost" className="mt-auto justify-start px-0 text-brand-primary">
              View timeline
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

