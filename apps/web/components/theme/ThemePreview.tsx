import { Button, Input, Label, Textarea } from '@cronkwater/ui';

const pills = ['Draft', 'In review', 'Published'];

export default function ThemePreview() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-brand-foreground">Heading One</h1>
        <h2 className="text-2xl font-semibold text-brand-foreground">Heading Two</h2>
        <h3 className="text-xl font-semibold text-brand-foreground">Heading Three</h3>
        <p className="text-sm text-muted-foreground">
          This is a paragraph demonstrating body copy. Use the theme toggle to verify contrast and readability in light,
          dark, and warm modes.
        </p>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">Buttons</h4>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="sf-btn-primary">
            Primary
          </button>
          <button type="button" className="sf-btn-outline">
            Outline
          </button>
          <button type="button" className="sf-btn-ghost">
            Ghost
          </button>
          <Button variant="ghost" size="sm">
            Shadcn ghost
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">Badges</h4>
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span key={pill} className="sf-badge">
              {pill}
            </span>
          ))}
          <span className="sf-badge bg-brand-primary/15 text-brand-foreground">Accent</span>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">Cards</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((card) => (
            <div key={card} className="rounded-3xl border border-border/60 bg-surface/80 px-6 py-6 shadow-soft">
              <h5 className="text-lg font-semibold text-brand-foreground">Card {card}</h5>
              <p className="mt-2 text-sm text-muted-foreground">
                Verify background, border, and text contrast in the selected theme.
              </p>
              <button type="button" className="sf-btn-outline mt-4">
                Action
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">Form controls</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="qa-name" className="space-y-2">
            <Label htmlFor="qa-name">Display name</Label>
            <Input id="qa-name" placeholder="Riley Songwriter" />
          </label>
          <label htmlFor="qa-org-type" className="space-y-2">
            <span className="text-sm font-medium text-brand-foreground">Organization type</span>
            <select id="qa-org-type" className="w-full rounded-xl border border-border/60 bg-surface px-3 py-2 text-sm text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              <option>Foundation</option>
              <option>Studio</option>
              <option>Band</option>
            </select>
          </label>
          <label htmlFor="qa-notifications" className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
            <span className="text-sm text-brand-foreground">Enable notifications</span>
            <input
              id="qa-notifications"
              type="checkbox"
              className="h-4 w-4 rounded border-border/60 text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              defaultChecked
            />
          </label>
          <label htmlFor="qa-notes" className="space-y-2">
            <Label htmlFor="qa-notes">Notes</Label>
            <Textarea id="qa-notes" rows={3} placeholder="Leave yourself a note." />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">Focus states</h4>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="sf-btn-outline">
            Focusable link
          </button>
          <button type="button" className="sf-btn-primary">
            Focusable button
          </button>
        </div>
      </section>
    </div>
  );
}
