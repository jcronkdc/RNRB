export const dynamic = 'force-static';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="rnrb-section border-b border-border/50">
        <div className="rnrb-container max-w-4xl">
          <p className="rnrb-badge mb-4">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-display mb-4">
            Start free. Grow when you&apos;re ready.
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Rock N&apos; Roll Basement is being built for musicians at every level — from first
            demos to serious touring. The details of paid plans are still evolving, so we&apos;re
            keeping this page straightforward and free of hype.
          </p>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Right now, the focus is on giving you a solid core: projects, splits, sessions,
              and asset organization. The goal is to keep a generous free experience for
              individual musicians, with optional paid upgrades for heavier use or teams.
            </p>
            <p>
              As the product hardens, this page will be updated with clear, honest pricing
              — no fake discounts, no made-up &quot;original&quot; prices, and no pressure.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}




