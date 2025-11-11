import Link from 'next/link';
import { Button } from '@songforge/ui';

const WHY_POINTS = [
  {
    title: 'Fuel emerging artists',
    copy: 'Help us fund residencies, mentorship, and studio time for creators pushing culture forward.'
  },
  {
    title: 'Expand community access',
    copy: 'Your support powers inclusive programming, workshops, and resources for underrepresented voices.'
  },
  {
    title: 'Keep tools open-source',
    copy: 'Donations sustain our open tooling so independent teams can build without compromise.'
  }
];

const FUND_USAGE = [
  '60%: Grants, residencies, and artist stipends',
  '25%: Community programming & accessibility initiatives',
  '10%: Open-source platform maintenance',
  '5%: Operational reserves & compliance'
];

export default function DonatePage() {
  return (
    <main id="main-content" className="bg-background">
      <section className="motion-safe:animate-fade-in mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col gap-10 px-6 py-20">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-brand-muted-foreground">SongForge Foundation</p>
          <h1 className="mt-4 text-4xl font-semibold text-brand-foreground">Support the Foundation</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Invest in the musicians, technologists, and storytellers who keep our creative future vibrant. Every
            contribution amplifies community-driven artistry.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" aria-label="Donate to SongForge Foundation">Donate now</Button>
            <Button asChild variant="ghost">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </header>

        <section aria-labelledby="why-donate" className="rounded-3xl border border-border/60 bg-surface/90 p-10 shadow-soft">
          <h2 id="why-donate" className="text-2xl font-semibold text-brand-foreground">
            Why donate
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {WHY_POINTS.map((point) => (
              <article
                key={point.title}
                className="rounded-2xl border border-border/50 bg-surface px-6 py-6 text-left shadow-soft"
              >
                <h3 className="text-lg font-semibold text-brand-foreground">{point.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{point.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="fund-usage" className="rounded-3xl border border-border/60 bg-surface/90 p-10 shadow-soft">
          <h2 id="fund-usage" className="text-2xl font-semibold text-brand-foreground">
            How funds are used
          </h2>
          <ul className="mt-4 space-y-3 text-left text-sm leading-relaxed text-muted-foreground">
            {FUND_USAGE.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-primary/70" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="donation-widget" className="rounded-3xl border border-dashed border-border/60 bg-surface/80 p-10 text-center shadow-soft">
          <h2 id="donation-widget" className="text-2xl font-semibold text-brand-foreground">
            Donation widget coming soon
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            We’re partnering with the SongForge Foundation and Give Lively to embed a seamless donation flow. Stay
            tuned—your generosity will be just a tap away.
          </p>
        </section>
      </section>
    </main>
  );
}
