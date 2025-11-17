import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function BlockedPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-border/60 bg-surface/95 p-10 text-center shadow-soft">
        <h1 className="mb-4 text-3xl font-bold text-brand-foreground">Access temporarily restricted</h1>
        <p className="mb-6 text-base text-muted-foreground">
          This CronkWaterss environment is temporarily disabled for maintenance or security reasons.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          If you believe this is an error, please return to the home page or contact support for assistance.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/" className="sf-btn-outline">Home</Link>
          <a href="mailto:support@example.com" className="sf-btn-ghost">Contact</a>
        </div>
      </div>
    </main>
  );
}
