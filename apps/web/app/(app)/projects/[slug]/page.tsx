export const dynamic = 'force-dynamic';

import { getOrgSession } from '@cronkwater/auth';
import { getProjectBySlug, listSongs, listAssets, listSplitSheets, listLicenses } from '@cronkwater/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProjectDetailWrapper } from './ProjectDetailWrapper';
import type { AssetListItem } from '../../../../components/app/AssetList';
import type { LicenseListItem } from '../../../../components/app/LicenseList';
import type { SongListItem } from '../../../../components/app/SongList';
import type { SplitListItem } from '../../../../components/app/SplitList';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let orgId: string | null = null;

  try {
    const session = await getOrgSession();
    orgId = session.orgId;
  } catch {
    if (enableBypass) {
      orgId = 'demo-org';
    } else {
      return {
        title: 'Project Not Found',
        description: 'The requested project could not be found.'
      };
    }
  }

  if (!orgId) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.'
    };
  }

  const project = await getProjectBySlug(slug, orgId);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const description = project.description || `Project: ${project.name}`;
  const ogImage = project.coverImage 
    ? `${baseUrl}${project.coverImage}`
    : `${baseUrl}/og-default.jpg`;

  return {
    title: `${project.name} • Song Forge`,
    description,
    openGraph: {
      title: project.name,
      description,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: project.name
        }
      ],
      siteName: 'Song Forge'
    },
    twitter: {
      card: 'summary_large_image',
      title: project.name,
      description,
      images: [ogImage]
    }
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let orgId: string | null = null;

  try {
    const session = await getOrgSession();
    orgId = session.orgId;
  } catch {
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
  const project = await getProjectBySlug(slug, orgId);

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
  const songsData: SongListItem[] = songs.map((s: { id: string; title: string; key: string | null; tempo: number | null }) => ({
    id: s.id,
    title: s.title,
    key: s.key ?? undefined,
    tempo: s.tempo ?? undefined
  }));

  const assetsData: AssetListItem[] = assets.map((a: { id: string; name: string; assetType: string; bytes: bigint }) => ({
    id: a.id,
    name: a.name,
    type: a.assetType as 'audio' | 'image' | 'lyric' | 'pdf' | 'chart',
    bytes: Number(a.bytes)
  }));

  const splitsData: SplitListItem[] = splits.map((s: { id: string; title: string; contributors: Array<{ name: string; percentage: number }> }) => ({
    id: s.id,
    title: s.title,
    totalPct: s.contributors.reduce((sum: number, c: { percentage: number }) => sum + c.percentage, 0),
    contributors: s.contributors.map((c: { name: string; percentage: number }) => ({
      name: c.name,
      pct: c.percentage
    }))
  }));

  const licensesData: LicenseListItem[] = licenses.map((l: { id: string; template: string; title: string; createdAt: Date }) => ({
    id: l.id,
    template: l.template.replace(/_/g, ' '),
    title: l.title,
    createdAt: l.createdAt.toISOString()
  }));

  return (
    <ProjectDetailWrapper
      projectSlug={slug}
      project={{
        name: project.name,
        visibility: project.visibility as 'private' | 'org' | 'public',
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
