'use client';

import { EmptyState } from '@/components/empty-states';
import { Library } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-foreground-muted mt-1">
          Your music assets, stems, and resources
        </p>
      </div>
      
      <EmptyState
        type="library"
        title="Your library is empty"
        description="Create tracks and projects to build your library of music assets"
        actionLabel="Create Track"
        actionHref="/create"
      />
    </div>
  );
}
