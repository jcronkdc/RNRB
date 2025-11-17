export const dynamic = 'force-static';

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="rnrb-section border-b border-border/50">
        <div className="rnrb-container max-w-4xl">
          <p className="rnrb-badge mb-4">Team</p>
          <h1 className="text-4xl md:text-5xl font-display mb-4">
            A small crew, focused on getting the foundations right
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            There&apos;s no giant org chart here, and we&apos;re not going to pretend there is.
            Rock N&apos; Roll Basement is being built by a small, focused team that cares
            about music, clarity, and honest tools.
          </p>
          <p className="text-muted-foreground">
            As the product grows, this page will showcase more of the people shaping it.
            For now, the most important thing is that musicians of every level feel
            seen in the product — from first riff to full release.
          </p>
        </div>
      </section>
    </main>
  );
}


