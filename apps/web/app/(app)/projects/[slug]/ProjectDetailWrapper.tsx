'use client';

import type { LicenseTemplate } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import type { AssetListItem } from '../../../../components/app/AssetList';
import { Comments } from '../../../../components/app/Comments';
import { ExportMenu } from '../../../../components/app/ExportMenu';
import type { LicenseListItem } from '../../../../components/app/LicenseList';
import { ProjectDetailClient, type SongListItem } from '../../../../components/app/SongList';
import type { SplitListItem } from '../../../../components/app/SplitList';
import { useToast } from '../../../../components/ui/Toast';
import { createCommentAction } from '../../../../lib/actions/comments';
import { createLicenseAction } from '../../../../lib/actions/licenses';
import { createSongAction } from '../../../../lib/actions/songs';
import { createSplitSheetAction } from '../../../../lib/actions/splits';
import { announce } from '../../../../lib/announce';

interface ProjectDetailWrapperProps {
  projectSlug: string;
  project: {
    name: string;
    visibility: 'private' | 'org' | 'public';
    createdAt: string;
    description: string;
  };
  initialSongs: SongListItem[];
  initialAssets: AssetListItem[];
  initialSplits: SplitListItem[];
  initialLicenses: LicenseListItem[];
}

export function ProjectDetailWrapper({
  projectSlug,
  project,
  initialSongs,
  initialAssets,
  initialSplits,
  initialLicenses
}: ProjectDetailWrapperProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const toast = useToast();

  const handleCreateSong = async (song: { title: string; key?: string; tempo?: number }) => {
    startTransition(async () => {
      const result = await createSongAction({
        projectSlug: projectSlug,
        title: song.title,
        key: song.key,
        tempo: song.tempo
      });

      if (result.success && result.data) {
        announce(`Song "${song.title}" created`);
        toast.push(`"${song.title}" created`, { tone: 'success' });
        router.refresh();
      } else {
        toast.push(result.error || 'Failed to create song', { tone: 'error' });
        announce(`Failed to create song: ${result.error || 'Unknown error'}`);
      }
    });
  };

  const handleCreateSplit = async (split: {
    title: string;
    contributors: Array<{ name: string; pct: number; role?: string }>;
  }) => {
    startTransition(async () => {
      const result = await createSplitSheetAction({
        projectSlug: projectSlug,
        title: split.title,
        contributors: split.contributors
      });

      if (result.success && result.data) {
        announce(`Split "${split.title}" created`);
        toast.push(`"${split.title}" created`, { tone: 'success' });
        router.refresh();
      } else {
        toast.push(result.error || 'Failed to create split', { tone: 'error' });
        announce(`Failed to create split: ${result.error || 'Unknown error'}`);
      }
    });
  };

  const handleCreateLicense = async (license: {
    template: string;
    title: string;
    notes?: string;
  }) => {
    startTransition(async () => {
      const templateKey = license.template.replace(/\s+/g, '_').toUpperCase() as LicenseTemplate;
      const result = await createLicenseAction(projectSlug, {
        template: templateKey,
        title: license.title,
        notes: license.notes
      });

      if (result.success && result.data) {
        announce(`License "${license.title}" created`);
        toast.push(`"${license.title}" created`, { tone: 'success' });
        router.refresh();
      } else {
        toast.push(result.error || 'Failed to create license', { tone: 'error' });
        announce(`Failed to create license: ${result.error || 'Unknown error'}`);
      }
    });
  };

  return (
    <div className="space-y-10">
      <ProjectDetailClient
        project={project}
        initialSongs={initialSongs}
        initialAssets={initialAssets}
        initialSplits={initialSplits}
        initialLicenses={initialLicenses}
        onCreateSong={handleCreateSong}
        onCreateSplit={handleCreateSplit}
        onCreateLicense={handleCreateLicense}
      />
      <div className="rounded-3xl border border-border/60 bg-surface/80 p-8 shadow-soft">
        <ExportMenu projectSlug={projectSlug} projectName={project.name} />
        <div className="mt-8">
          <Comments
            entityId={projectSlug}
            entityType="project"
            onCreate={async (text) => {
              startTransition(async () => {
                const result = await createCommentAction(projectSlug, 'project', text);
                
                if (result.success) {
                  announce('Comment posted');
                  toast.push('Comment posted', { tone: 'success' });
                  router.refresh();
                } else {
                  toast.push(result.error || 'Failed to post comment', { tone: 'error' });
                  announce(`Failed to post comment: ${result.error || 'Unknown error'}`);
                }
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

