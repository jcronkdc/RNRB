import { cn, Button } from '@songforge/ui';
import { Users, Plus } from 'lucide-react';

import { EmptyState } from './EmptyState';

export interface SplitListItem {
  id: string;
  title: string;
  totalPct: number;
  contributors: { name: string; pct: number }[];
}

interface SplitListProps {
  items: SplitListItem[];
}

export default function SplitList({ items, onCreate }: SplitListProps & { onCreate?: () => void }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={Users}
        title="Document Your Splits"
        description="Track revenue splits with precision. Add your first split sheet to ensure everyone gets credited fairly and transparently."
        action={onCreate ? (
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Split Sheet
          </Button>
        ) : undefined}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface/80 shadow-soft">
      <div className="grid grid-cols-[2fr_3fr_1fr] items-center border-b border-border/50 px-5 py-3 text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">
        <span>Title</span>
        <span>Contributors</span>
        <span>Total</span>
      </div>
      <ul>
        {items.map((split) => (
          <li key={split.id}>
            <button
              type="button"
              className={cn(
                'grid w-full grid-cols-[2fr_3fr_1fr] items-center gap-3 px-5 py-4 text-left text-sm transition hover:bg-brand-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary'
              )}
              aria-label={`Open split ${split.title}`}
            >
              <span className="truncate font-medium text-brand-foreground">{split.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {split.contributors
                  .map((contributor) => `${contributor.name || 'Unknown'} (${Math.round(contributor.pct)}%)`)
                  .join(' • ')}
              </span>
              <span className="text-xs text-muted-foreground">{split.totalPct}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
