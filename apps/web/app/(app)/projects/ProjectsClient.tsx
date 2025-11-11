'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { Button } from '@songforge/ui';
import { NewProjectDialog } from '../../../components/app/NewProjectDialog';

export function ProjectsClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  const handleCreateProject = async (name: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { error } = await supabase.from('projects').insert({
      name,
      slug,
      user_id: user.id,
    });

    if (error) {
      console.error('Failed to create project:', error);
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
