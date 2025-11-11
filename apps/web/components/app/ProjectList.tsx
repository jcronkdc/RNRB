import Link from 'next/link';
import { Lock, Users, Globe2, Music, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@songforge/ui';
import ProjectBadge from './ProjectBadge';
import type { ProjectVisibility } from './ProjectBadge';

const VISIBILITY_META: Record<ProjectVisibility, { label: string; icon: JSX.Element; tone?: 'outline' }> = {
  private: { label: 'Private', icon: <Lock className="h-4 w-4" aria-hidden="true" />, tone: 'outline' },
  org: { label: 'Organization', icon: <Users className="h-4 w-4" aria-hidden="true" /> },
  public: { label: 'Public', icon: <Globe2 className="h-4 w-4" aria-hidden="true" /> }
};

export interface ProjectListItem {
  id: string;
  name: string;
  slug?: string;
  visibility: ProjectVisibility;
  createdAt?: string;
}

export default function ProjectList({ items }: { items: ProjectListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-gradient-to-br from-surface/70 to-surface-muted/50 p-16 text-center shadow-soft">
        <div className="absolute inset-0 opacity-5">
          <div className="sf-bg-gradient" />
        </div>
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full bg-brand-primary/10 p-3 text-brand-primary">
            <Music className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-xl font-semibold text-brand-foreground">Start Your First Project</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every great song starts with an idea. Create a project to begin organizing your work, tracking collaborators, and bringing your vision to life.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((project) => {
        const meta = VISIBILITY_META[project.visibility];
        return (
          <Card key={project.id} role="article" className="group relative flex flex-col justify-between overflow-hidden border-border/60 bg-surface/80 shadow-soft transition-all hover:border-brand-primary/40 hover:shadow-lg hover:shadow-brand-primary/5">
            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="sf-bg-gradient" />
            </div>
            <CardHeader className="relative flex flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-brand-foreground">
                  <Link
                    href={`/app/projects/${(project as { slug?: string }).slug || project.id}`}
                    className="inline-flex items-center gap-2 rounded-md text-left font-bold text-brand-foreground transition-colors hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    {project.name}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </CardTitle>
                <CardDescription className="mt-3 text-xs uppercase tracking-[0.32em] text-muted-foreground">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently created'}
                </CardDescription>
              </div>
              <ProjectBadge visibility={project.visibility} />
            </CardHeader>
            <CardContent className="relative mt-auto pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Music className="h-4 w-4 opacity-60" aria-hidden="true" />
                <span>Ready for collaboration</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
