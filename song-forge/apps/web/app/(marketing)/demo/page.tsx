export const dynamic = 'force-static';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="rnrb-section border-b border-border/50">
        <div className="rnrb-container max-w-4xl space-y-4">
          <p className="rnrb-badge mb-2">Demo</p>
          <h1 className="text-4xl md:text-5xl font-display">
            See Rock N&apos; Roll Basement in action
          </h1>
          <p className="text-lg text-muted-foreground">
            The &quot;command center&quot; you see on the homepage is a real direction for the
            product, but not a fake dashboard. It&apos;s an honest preview of how projects,
            sessions, and stats will come together as the platform matures.
          </p>
          <p className="text-muted-foreground">
            A full interactive demo flow isn&apos;t public yet. Until it is, the best way to
            understand the product is to explore the homepage, the guide, and the feature
            pages — or to sign in and see what&apos;s currently live. As new pieces ship,
            this page will point to real, recorded walkthroughs rather than mock numbers.
          </p>
        </div>
      </section>
    </main>
  );
}




