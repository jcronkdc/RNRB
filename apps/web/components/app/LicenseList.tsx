import { cn } from '@songforge/ui';
import { FileText } from 'lucide-react';

import { EmptyState } from './EmptyState';

export interface LicenseListItem {
  id: string;
  template: string;
  title: string;
  createdAt?: string;
}

interface LicenseListProps {
  items: LicenseListItem[];
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
};

export default function LicenseList({ items, onCreate }: LicenseListProps & { onCreate?: () => void }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" aria-hidden="true" />}
        title="Protect Your Work"
        description="Draft collaboration agreements, NDAs, and licenses to keep everyone aligned and protected. Start with a template or create your own."
        action={onCreate ? { label: 'Create License', onClick: onCreate } : undefined}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface/80 shadow-soft">
      <div className="grid grid-cols-[3fr_2fr_1fr] items-center border-b border-border/50 px-5 py-3 text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">
        <span>Title</span>
        <span>Template</span>
        <span>Created</span>
      </div>
      <ul>
        {items.map((license) => (
          <li key={license.id}>
            <button
              type="button"
              className={cn(
                'grid w-full grid-cols-[3fr_2fr_1fr] items-center gap-3 px-5 py-4 text-left text-sm transition hover:bg-brand-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary'
              )}
              aria-label={`Open license ${license.title}`}
            >
              <span className="truncate font-medium text-brand-foreground">{license.title}</span>
              <span className="truncate text-xs text-muted-foreground">{license.template}</span>
              <span className="text-xs text-muted-foreground">{formatDate(license.createdAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
