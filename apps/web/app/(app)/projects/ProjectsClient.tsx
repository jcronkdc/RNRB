'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import NewProjectDialog, { type ProjectVisibility } from '../../../components/app/NewProjectDialog';
import { createProjectAction } from '../../../lib/actions/projects';
import { useToast } from '../../../components/ui/Toast';
import { announce } from '../../../lib/announce';
import { SuccessModal } from '../../../components/ui/SuccessModal';

export function ProjectsClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdProject, setCreatedProject] = useState<{ name: string; slug: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('ui:new-project', handler as EventListener);
    return () => window.removeEventListener('ui:new-project', handler as EventListener);
  }, []);

  const handleCreate = async (payload: { name: string; visibility: ProjectVisibility }) => {
    startTransition(async () => {
      const result = await createProjectAction({
        name: payload.name,
        visibility: payload.visibility,
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });

      if (result.success && result.data) {
        setCreatedProject({ name: payload.name, slug: result.data.slug });
        setSuccessOpen(true);
        announce(`Project "${payload.name}" created`);
        toast.push(`"${payload.name}" created`, { tone: 'success' });
        setOpen(false);
        router.refresh();
      } else {
        toast.push(result.error || 'Failed to create project', { tone: 'error' });
        announce(`Failed to create project: ${result.error || 'Unknown error'}`);
      }
    });
  };

  return (
    <>
      {children}
      <NewProjectDialog open={open} onOpenChange={setOpen} onCreate={handleCreate} />
      <SuccessModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          if (createdProject) {
            router.push(`/app/projects/${createdProject.slug}`);
            setCreatedProject(null);
          }
        }}
        title="Project Created!"
        message={`"${createdProject?.name}" is ready. Let's start building something beautiful.`}
        action={
          createdProject
            ? {
                label: 'Open Project',
                onClick: () => router.push(`/app/projects/${createdProject.slug}`)
              }
            : undefined
        }
      />
    </>
  );
}

