export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

import { SongPageClient } from './SongPageClient';

async function getSong(songId: string) {
  // Use NextAuth for authentication
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Use Prisma for data fetching
  const song = await prisma.song.findFirst({
    where: {
      id: songId,
      project: {
        org: {
          memberships: {
            some: { userId }
          }
        }
      }
    },
    include: {
      project: true
    }
  });

  return song;
}

export default async function SongPage({ params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params;
  const song = await getSong(songId);

  if (!song) {
    notFound();
  }

  return (
    <SongPageClient
      song={{
        id: song.id,
        title: song.title || 'Untitled',
        bpm: song.tempo ?? undefined,
        key: song.key ?? undefined,
        mood_tags: [],  // TODO: Add mood tags to Prisma schema if needed
        lyrics: song.lyrics ? { content: song.lyrics } : undefined,
        project_id: song.projectId,
      }}
    />
  );
}

