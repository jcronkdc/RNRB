import { getOrgSession } from '@cronkwater/auth';
import { redirect } from 'next/navigation';
import { MusicPageClient } from './MusicPageClient';
import { prisma } from '@cronkwater/db';

export const dynamic = 'force-dynamic';

export default async function MusicPage() {
  const session = await getOrgSession();
  if (!session) {
    redirect('/auth');
  }

  // Get all public songs from the organization
  const publicSongs = await prisma.song.findMany({
    where: {
      project: {
        orgId: session.orgId,
        visibility: 'public',
        status: 'active',
      },
    },
    include: {
      project: {
        select: {
          name: true,
          slug: true,
          coverImage: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get public projects for albums/releases
  const publicProjects = await prisma.project.findMany({
    where: {
      orgId: session.orgId,
      visibility: 'public',
      status: 'active',
    },
    include: {
      _count: {
        select: { songs: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get featured assets (audio files)
  const audioAssets = await prisma.asset.findMany({
    where: {
      project: {
        orgId: session.orgId,
        visibility: 'public',
      },
      assetType: 'audio',
    },
    include: {
      project: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  return (
    <MusicPageClient 
      songs={publicSongs}
      projects={publicProjects}
      audioAssets={audioAssets}
    />
  );
}

