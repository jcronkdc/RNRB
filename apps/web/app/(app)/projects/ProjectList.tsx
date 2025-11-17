'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Music, Calendar, Users } from 'lucide-react';
import { Button, Card } from '@cronkwaters/ui';
import type { Project } from '@prisma/client';

interface ProjectListProps {
  initialProjects: Project[];
  organizationId: string;
}

export default function ProjectList({ initialProjects, organizationId }: ProjectListProps) {
  const [projects] = useState(initialProjects);

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Music className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first project to start collaborating on music
        </p>
        <Link href="/projects/new" className="mt-6 inline-block">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <Card className="p-6 transition-colors hover:border-brand-primary">
              <h3 className="font-semibold">{project.name}</h3>
              {project.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Members
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}


