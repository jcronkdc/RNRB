'use client';

import { EmptyState } from '@/components/empty-states';
import { Users2 } from 'lucide-react';

export default function CollabPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collaboration Hub</h1>
        <p className="text-foreground-muted mt-1">
          Connect and work with other musicians
        </p>
      </div>
      
      <EmptyState
        type="collaborations"
        title="No active collaborations"
        description="Start a project and invite others to collaborate on your music"
        actionLabel="Browse Projects"
        actionHref="/projects"
      />
    </div>
  );
}
