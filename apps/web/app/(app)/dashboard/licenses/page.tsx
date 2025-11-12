import { Button } from '@cronkwater/ui';

export const dynamic = 'force-dynamic';

const placements = [
  {
    placement: 'Cedar & Rust — indie film trailer',
    partner: 'Northwave Pictures',
    window: 'June — Sept 2025',
    status: 'Pending approval'
  },
  {
    placement: 'Honey Bloom — boutique retail playlist',
    partner: 'Evening & Co.',
    window: 'May 2025 — May 2026',
    status: 'Active'
  },
  {
    placement: 'Glass Rivers — documentary sync',
    partner: 'Atlas Studios',
    window: 'Optioned through 2025',
    status: 'Negotiating'
  }
] as const;

export default function LicensesPage() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface p-8 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand-foreground">Licensing desk</h2>
          <p className="text-sm text-muted-foreground">
            Manage sync requests, track usage windows, and share clean deliverables with partners.
          </p>
        </div>
        <Button size="sm" variant="outline">
          Add placement
        </Button>
      </header>
      <div className="grid gap-6">
        {placements.map((placement) => (
          <article
            key={placement.placement}
            className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-surface-muted/70 p-6 shadow-soft md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-foreground">{placement.placement}</h3>
              <p className="text-sm text-muted-foreground">
                Partner: <span className="font-medium text-brand-secondary">{placement.partner}</span>
              </p>
            </div>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
              <div>
                <span className="block text-xs uppercase tracking-[0.3em] text-muted-foreground/80">Window</span>
                <span>{placement.window}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.3em] text-muted-foreground/80">Status</span>
                <span className="text-brand-primary">{placement.status}</span>
              </div>
              <Button variant="ghost" className="self-start px-0 text-brand-primary">
                Open dossier
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

