'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { NewProjectDialog } from '../../../components/app/NewProjectDialog';
import { createProjectAction } from '../../actions/createProject';


export function ProjectsClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateProject = async (name: string) => {
    // Use server action instead of Supabase client
    const result = await createProjectAction(name);

    if (!result.success) {
      console.error('Failed to create project:', result.error);
      return;
    }

    router.refresh();
    setDialogOpen(false);
  };

  return (
    <>
      {children}
      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={handleCreateProject} />
    </>
  );
}
