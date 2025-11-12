import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

import { ProjectsClient } from './ProjectsClient';
import { ProjectsDashboardTabs } from './ProjectsDashboardTabs';
import PageHeader from '../../../components/app/PageHeader';
import { CardGridSkeleton } from '../../../components/app/Skeletons';

export const dynamic = 'force-dynamic';

const SUBTITLE = 'Your works in progress. Start something new or continue where you left off.';

async function ProjectsData() {
  // Use NextAuth for authentication
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth');
  }

  const userId = session.user.id;

  try {
    // Use Prisma for data fetching
    const projects = await prisma.project.findMany({
      where: {
        org: {
          memberships: {
            some: { userId }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const projectIds = projects.map(p => p.id);
    const songs = await prisma.song.findMany({
      where: {
        projectId: {
          in: projectIds
        }
      }
    });

    return {
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        visibility: 'private' as const,
        createdAt: p.createdAt.toISOString(),
      })),
      songs: songs || [],
    };
  } catch (error) {
    console.error('Failed to load projects:', error);
    return { projects: [], songs: [] };
  }
}

export default async function ProjectsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Projects"
        subtitle={SUBTITLE}
        actions={
          <ProjectsClient>
            <button className="sf-btn-primary min-w-[9rem]" data-command="new-project">
              New Project
            </button>
          </ProjectsClient>
        }
      />
      <Suspense fallback={<CardGridSkeleton count={6} />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}

async function ProjectsContent() {
  const { projects, songs } = await ProjectsData();

  return <ProjectsDashboardTabs projects={projects} songs={songs} />;
}
