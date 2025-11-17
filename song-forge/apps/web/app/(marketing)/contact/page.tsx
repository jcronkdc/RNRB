export const dynamic = 'force-static';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="rnrb-section border-b border-border/50">
        <div className="rnrb-container max-w-4xl space-y-4">
          <p className="rnrb-badge mb-2">Contact</p>
          <h1 className="text-4xl md:text-5xl font-display">
            Reach out about Rock N&apos; Roll Basement
          </h1>
          <p className="text-lg text-muted-foreground">
            Questions, ideas, or feedback about using the platform — especially if you&apos;re
            just getting started with music — are welcome. This project is actively
            evolving, and real-world input matters more than any marketing copy.
          </p>
          <p className="text-muted-foreground">
            For now, the best way to get in touch is via the email addresses listed on the
            Privacy and Terms pages (for legal or data questions), or through whichever
            direct channel you&apos;ve already been using with the team behind this site.
          </p>
        </div>
      </section>
    </main>
  );
}




