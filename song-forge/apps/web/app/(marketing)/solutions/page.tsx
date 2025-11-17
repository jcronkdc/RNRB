import Link from 'next/link';

export const dynamic = 'force-static';

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="rnrb-section border-b border-border/50">
        <div className="rnrb-container max-w-5xl">
          <p className="rnrb-badge mb-4">Solutions</p>
          <h1 className="text-4xl md:text-5xl font-display mb-4">
            Solutions for every kind of musician
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Rock N&apos; Roll Basement is built for the full spectrum—from first-song
            hobbyists to touring professionals. Pick the path that feels most like you.
          </p>
        </div>
      </section>

      <section className="rnrb-section">
        <div className="rnrb-container grid gap-8 md:grid-cols-2">
          <SolutionCard
            title="For Artists"
            href="/solutions/artists"
            body="Organize songs, lyrics, demos, and splits in one place. Stay focused on
            writing and finishing music instead of chasing files."
          />
          <SolutionCard
            title="For Studios"
            href="/solutions/studios"
            body="Manage sessions, assets, and deliverables for multiple clients with a
            clear, repeatable workflow."
          />
          <SolutionCard
            title="For Labels & Teams"
            href="/solutions/labels"
            body="Keep releases, rights, and revenue organized across a roster of artists
            without resorting to spreadsheets."
          />
          <SolutionCard
            title="For Serious Hobbyists"
            href="/guide"
            body="Even if you&apos;re just experimenting, you get the same pro-grade tools—
            projects, splits, and sessions—without pressure."
          />
        </div>
      </section>
    </main>
  );
}

function SolutionCard(props: { title: string; body: string; href: string }) {
  return (
    <Link
      href={props.href}
      className="rnrb-card rnrb-edge rnrb-grunge p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform"
    >
      <h2 className="text-xl font-semibold">{props.title}</h2>
      <p className="text-sm text-muted-foreground">{props.body}</p>
      <span className="text-sm font-medium text-brand-primary mt-2">
        Explore {props.title.toLowerCase()}
      </span>
    </Link>
  );
}


