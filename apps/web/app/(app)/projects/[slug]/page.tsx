import { notFound } from 'next/navigation';
import { getOrgSession } from '@songforge/auth';
import { getProjectBySlug, listSongs, listAssets, listSplitSheets, listLicenses } from '@songforge/db';
import type { SongListItem } from '../../../../components/app/SongList';
import type { AssetListItem } from '../../../../components/app/AssetList';
import type { SplitListItem } from '../../../../components/app/SplitList';
import type { LicenseListItem } from '../../../../components/app/LicenseList';
import { ProjectDetailWrapper } from './ProjectDetailWrapper';

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let orgId: string | null = null;

  try {
    const session = await getOrgSession();
    orgId = session.orgId;
  } catch (error) {
    if (enableBypass) {
      orgId = 'demo-org';
    } else {
      notFound();
    }
  }

  if (!orgId) {
    notFound();
  }

  // Fetch project from database
  const project = await getProjectBySlug(params.slug, orgId);

  if (!project) {
    notFound();
  }

  // Fetch related data
  const [songs, assets, splits, licenses] = await Promise.all([
    listSongs(project.id),
    listAssets(project.id),
    listSplitSheets(project.id),
    listLicenses(project.id)
  ]);

  // Transform to UI types
  const songsData: SongListItem[] = songs.map((s) => ({
    id: s.id,
    title: s.title,
    key: s.key ?? undefined,
    tempo: s.tempo ?? undefined
  }));

  const assetsData: AssetListItem[] = assets.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.assetType,
    bytes: Number(a.bytes)
  }));

  const splitsData: SplitListItem[] = splits.map((s) => ({
    id: s.id,
    title: s.title,
    totalPct: s.contributors.reduce((sum, c) => sum + c.percentage, 0),
    contributors: s.contributors.map((c) => ({
      name: c.name,
      pct: c.percentage
    }))
  }));

  const licensesData: LicenseListItem[] = licenses.map((l) => ({
    id: l.id,
    template: l.template.replace(/_/g, ' '),
    title: l.title,
    createdAt: l.createdAt.toISOString()
  }));

  return (
    <ProjectDetailWrapper
      projectSlug={params.slug}
      project={{
        name: project.name,
        visibility: project.visibility.toLowerCase() as 'private' | 'org' | 'public',
        createdAt: project.createdAt.toISOString(),
        description: project.description || 'No description yet.'
      }}
      initialSongs={songsData}
      initialAssets={assetsData}
      initialSplits={splitsData}
      initialLicenses={licensesData}
    />
  );
}
