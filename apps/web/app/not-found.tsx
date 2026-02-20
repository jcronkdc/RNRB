import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="mb-6">
          <span
            className="text-7xl font-bold tracking-tighter"
            style={{ color: 'var(--border-strong)' }}
          >
            404
          </span>
        </div>

        <h1 className="mb-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
          Page not found
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--muted)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="w-full rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{ background: 'var(--accent)' }}
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="w-full rounded-lg border px-5 py-2.5 text-center text-sm font-medium transition-colors hover:bg-white/[0.03] sm:w-auto"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
