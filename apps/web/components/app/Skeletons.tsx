
export function PageHeaderSkeleton() {
  return (
    <div className="animate-sf-skeleton mb-5 w-full space-y-3" aria-hidden="true">
      <div className="h-8 w-2/5 rounded-md bg-border/60" />
      <div className="h-5 w-3/6 rounded-md bg-border/40" />
      <div className="h-10 w-28 rounded-xl bg-border/30" />
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-sf-skeleton h-36 rounded-3xl bg-border/20 shadow-soft"
        />
      ))}
    </div>
  );
}

// Animation utility
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerText = `@media (prefers-reduced-motion: no-preference) {
    .animate-sf-skeleton { animation: sf-skeleton-pulse 1.6s linear infinite alternate;}
    @keyframes sf-skeleton-pulse {
      to { opacity: 0.7; }
    }
  }
  `;
  document.head.append(style);
}
