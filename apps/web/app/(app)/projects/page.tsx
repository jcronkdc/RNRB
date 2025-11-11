import { Suspense } from 'react';
import { getOrgSession } from '@songforge/auth';
import { listProjects } from '@songforge/db';
import { redirect } from 'next/navigation';
import PageHeader from '../../../components/app/PageHeader';
import ProjectList from '../../../components/app/ProjectList';
import { ProjectsClient } from './ProjectsClient';
import { PageHeaderSkeleton, CardGridSkeleton } from '../../../components/app/Skeletons';
import { ProjectsPageClient } from './ProjectsPageClient';

const SUBTITLE = 'Your works in progress. Start something new or continue where you left off.';

async function ProjectsData() {
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let orgId: string | null = null;

  try {
    const session = await getOrgSession();
    orgId = session.orgId;
  } catch (error) {
    if (enableBypass) {
      // In demo mode, use a mock org ID
      orgId = 'demo-org';
    } else {
      redirect('/signin');
    }
  }

  if (!orgId) {
    return { projects: [], total: 0 };
  }

  try {
    const result = await listProjects(orgId, { status: 'active' });
    return {
      projects: result.projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        visibility: p.visibility.toLowerCase() as 'private' | 'org' | 'public',
        createdAt: p.createdAt.toISOString()
      })),
      total: result.total
    };
  } catch (error) {
    console.error('Failed to load projects:', error);
    return { projects: [], total: 0 };
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
            <button className="sf-btn-primary min-w-[9rem]" data-command="new-project" data-tour="new-project">
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
  const { projects } = await ProjectsData();

  return (
    <ProjectsPageClient projects={projects}>
      {(filteredProjects) => (
        <>
          <ProjectList items={filteredProjects} />
          <ProjectsClient>
            <NewProjectDialogWrapper />
          </ProjectsClient>
        </>
      )}
    </ProjectsPageClient>
  );
}

// Client wrapper for dialog and interactions
function NewProjectDialogWrapper() {
  return null; // Will be handled by ProjectsClient
}
