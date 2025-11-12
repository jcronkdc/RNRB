'use client';

import { Button, cn } from '@songforge/ui';
import { Music, FileAudio, FolderOpen, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { EmptyState } from '../../../components/app/EmptyState';
import { searchAction } from '../../../lib/actions/search';
import type { SearchResult } from '../../../lib/actions/search';

export function SearchResults({ query, type }: { query: string; type: string }) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const result = await searchAction(query, type as 'all' | 'project' | 'song' | 'asset');
      if (result.success && result.data) {
        setResults(result.data);
      } else {
        setResults([]);
      }
    });
  }, [query, type]);

  if (!query.trim()) {
    return (
      <EmptyState
        icon={SearchIcon}
        title="Search Everything"
        description="Search across your projects, songs, assets, and more. Start typing to see results."
      />
    );
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface/50" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon={SearchIcon}
        title="No Results Found"
        description={`We couldn't find anything matching "${query}". Try different keywords or check your spelling.`}
      />
    );
  }

  const iconMap = {
    project: FolderOpen,
    song: Music,
    asset: FileAudio
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
        <div className="flex gap-2">
          <Button
            variant={type === 'all' ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => router.push(`/app/search?q=${encodeURIComponent(query)}&type=all`)}
          >
            All
          </Button>
          <Button
            variant={type === 'project' ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => router.push(`/app/search?q=${encodeURIComponent(query)}&type=project`)}
          >
            Projects
          </Button>
          <Button
            variant={type === 'song' ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => router.push(`/app/search?q=${encodeURIComponent(query)}&type=song`)}
          >
            Songs
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((result) => {
          const Icon = iconMap[result.type];
          return (
            <Link
              key={result.id}
              href={result.href}
              className={cn(
                'group flex items-center gap-4 rounded-2xl border border-border/60 bg-surface/80 p-5 shadow-soft transition-all hover:border-brand-primary/40 hover:shadow-lg'
              )}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-brand-foreground group-hover:text-brand-primary">
                  {result.title}
                </p>
                {result.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{result.subtitle}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

