import { Suspense } from 'react';
import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import PageHeader from '../../../components/app/PageHeader';
import ProjectList from '../../../components/app/ProjectList';
import { ProjectsClient } from './ProjectsClient';
import { CardGridSkeleton } from '../../../components/app/Skeletons';
import { ProjectsDashboardTabs } from './ProjectsDashboardTabs';

const SUBTITLE = 'Your works in progress. Start something new or continue where you left off.';

async function ProjectsData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load projects:', error);
    return { projects: [], songs: [] };
  }

  const { data: songs } = await supabase
    .from('songs')
    .select('*')
    .in('project_id', projects?.map((p: { id: string }) => p.id) || []);

  return {
    projects:
      projects?.map((p: { id: string; name: string; slug: string; created_at: string }) => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        visibility: 'private' as const,
        createdAt: p.created_at,
      })) || [],
    songs: songs || [],
  };
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
