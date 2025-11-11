'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button, cn } from '@songforge/ui';

type VisibilityFilter = 'all' | 'private' | 'org' | 'public';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

interface ProjectFiltersProps {
  visibility: VisibilityFilter;
  sort: SortOption;
  onVisibilityChange: (v: VisibilityFilter) => void;
  onSortChange: (s: SortOption) => void;
  onReset: () => void;
  className?: string;
}

export function ProjectFilters({
  visibility,
  sort,
  onVisibilityChange,
  onSortChange,
  onReset,
  className
}: ProjectFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasFilters = visibility !== 'all' || sort !== 'newest';

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn('gap-2', hasFilters && 'border-brand-primary/40 bg-brand-primary/5')}
      >
        <Filter className="h-4 w-4" aria-hidden="true" />
        Filter & Sort
        {hasFilters && (
          <span className="ml-1 rounded-full bg-brand-primary px-2 py-0.5 text-xs font-bold text-brand-primary-foreground">
            {[visibility !== 'all' ? 1 : 0, sort !== 'newest' ? 1 : 0].reduce((a, b) => a + b, 0)}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border/60 bg-surface/95 p-4 shadow-lg backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">
                Filters
              </h3>
              {hasFilters && (
                <button
                  onClick={onReset}
                  className="text-xs text-muted-foreground transition hover:text-brand-foreground"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">
                  Visibility
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'private', 'org', 'public'] as VisibilityFilter[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => onVisibilityChange(v)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-medium transition',
                        visibility === v
                          ? 'bg-brand-primary text-brand-primary-foreground'
                          : 'bg-surface-muted text-muted-foreground hover:text-brand-foreground'
                      )}
                    >
                      {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.32em] text-brand-muted-foreground">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm text-brand-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

