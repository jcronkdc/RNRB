export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <header>
        <h1 className="mb-4 text-3xl font-bold text-brand-foreground">Privacy Policy (Placeholder)</h1>
        <p className="text-sm text-muted-foreground">
          This is a placeholder Privacy Policy for Song Forge. It is not legal advice and will be replaced before launch.
        </p>
      </header>
      <section>
        <h2 className="mb-2 text-xl font-semibold text-brand-foreground">Data We Collect</h2>
        <p className="text-base text-muted-foreground">We collect your name, email, login info, and usage data. We never sell your data to third parties.</p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold text-brand-foreground">How We Use Data</h2>
        <p className="text-base text-muted-foreground">We use your information to provide collaborative music creation and to improve our service. All storage and processing is subject to industry-standard security.</p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold text-brand-foreground">Contact</h2>
        <p className="text-base text-muted-foreground">
          To learn more or request deletion of your data, email us at <a href="mailto:support@example.com" className="underline text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">support@example.com</a>.
        </p>
      </section>
    </main>);
}
