export default function BlockedPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-border/60 bg-surface/95 p-10 text-center shadow-soft">
        <h1 className="text-3xl font-bold text-brand-foreground mb-4">Access temporarily restricted</h1>
        <p className="text-base text-muted-foreground mb-6">
          This Song Forge demo environment is temporarily disabled. DEMO_BYPASS is enabled, which is only intended for local development.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          If you believe this is an error, please return to the home page or contact support for assistance.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <a href="/" className="sf-btn-outline">Home</a>
          <a href="mailto:support@example.com" className="sf-btn-ghost">Contact</a>
        </div>
      </div>
    </main>
  );
}
