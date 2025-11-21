export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="relative h-24 w-24 opacity-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">You're Offline</h1>
        <p className="text-lg text-muted-foreground">
          No internet connection detected. Check your network and try again.
        </p>
      </div>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => window.location.reload()}
          className="rnrb-button-primary px-6 py-3 rounded-md text-sm font-medium"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rnrb-button-secondary px-6 py-3 rounded-md text-sm font-medium"
        >
          Go Home
        </a>
      </div>
      
      <div className="mt-8 text-xs text-muted-foreground">
        <p>Some cached pages may still be available while offline.</p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Offline - Rock N\' Roll Basement',
  description: 'You are currently offline. Check your internet connection.',
};




