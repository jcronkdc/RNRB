'use client';

import { useState, useMemo } from 'react';
import { ProjectFilters } from '../../../components/app/ProjectFilters';
import { ActivityFeed } from '../../../components/app/ActivityFeed';
import type { ProjectListItem } from '../../../components/app/ProjectList';

interface ProjectsPageClientProps {
  projects: ProjectListItem[];
  children: (filteredProjects: ProjectListItem[]) => React.ReactNode;
}

export function ProjectsPageClient({ projects: initialProjects, children }: ProjectsPageClientProps) {
  const [visibility, setVisibility] = useState<'all' | 'private' | 'org' | 'public'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');

  const filteredAndSorted = useMemo(() => {
    let result = [...initialProjects];

    // Filter by visibility
    if (visibility !== 'all') {
      result = result.filter((p) => p.visibility === visibility);
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [initialProjects, visibility, sort]);

  // Mock activity data - in production, fetch from database
  const activityItems = useMemo(() => {
    return initialProjects.slice(0, 3).map((p, i) => ({
      id: `activity-${i}`,
      type: 'project_created' as const,
      title: `Created "${p.name}"`,
      description: 'New project',
      timestamp: new Date(p.createdAt || Date.now()),
      user: 'You'
    }));
  }, [initialProjects]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'project' : 'projects'}
          </p>
          <ProjectFilters
            visibility={visibility}
            sort={sort}
            onVisibilityChange={setVisibility}
            onSortChange={setSort}
            onReset={() => {
              setVisibility('all');
              setSort('newest');
            }}
          />
        </div>
        <div data-tour="projects">
          {children(filteredAndSorted)}
        </div>
      </div>
      <aside className="hidden lg:block">
        <ActivityFeed items={activityItems} />
      </aside>
    </div>
  );
}

