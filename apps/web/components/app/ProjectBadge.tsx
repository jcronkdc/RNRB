'use client';

import { Badge, cn } from '@songforge/ui';
import { Globe2, Lock, Users } from 'lucide-react';

export type ProjectVisibility = 'private' | 'org' | 'public';

const META: Record<ProjectVisibility, { label: string; icon: JSX.Element }> = {
  private: { label: 'Private', icon: <Lock className="h-4 w-4" aria-hidden="true" /> },
  org: { label: 'Organization', icon: <Users className="h-4 w-4" aria-hidden="true" /> },
  public: { label: 'Public', icon: <Globe2 className="h-4 w-4" aria-hidden="true" /> }
};

interface ProjectBadgeProps {
  visibility: ProjectVisibility;
  className?: string;
}

export default function ProjectBadge({ visibility, className }: ProjectBadgeProps) {
  const meta = META[visibility] ?? META.private;
  return (
    <Badge
      variant={visibility === 'private' ? 'outline' : 'solid'}
      className={cn('flex items-center gap-1', className)}
      aria-label={`${meta.label} visibility`}
    >
      {meta.icon}
      <span className="text-xs font-medium">{meta.label}</span>
    </Badge>
  );
}
