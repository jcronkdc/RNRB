interface CreditListItem {
  name: string;
  role: string;
  pct?: number;
}

interface CreditListProps {
  items: readonly CreditListItem[];
}

export default function CreditList({ items }: CreditListProps) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No credits to display yet.</p>;
  }

  return (
    <ul className="space-y-3" aria-label="Project credits">
      {items.map((credit) => (
        <li key={`${credit.name}-${credit.role}`} className="flex flex-col gap-1 rounded-2xl border border-border/40 bg-surface/80 px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-foreground">{credit.name}</p>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">{credit.role}</p>
          </div>
          {typeof credit.pct === 'number' ? (
            <span className="text-xs text-muted-foreground">{credit.pct}%</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
