export const dynamic = 'force-dynamic';

import { prisma } from '@cronkwaters/db';
import { auth } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { RemixRoomClient } from './RemixRoomClient';

// Removed getSession - using NextAuth directly

async function loadSong(roomId: string) {
  const [songId] = roomId.split('-');
  const song = await prisma.song.findUnique({ where: { id: songId } });

  if (!song) {
    redirect('/dashboard');
  }

  return {
    id: song.id,
    title: song.title,
    stems: (() => {
      try {
        const metadata = song.description ? JSON.parse(song.description) : {};
        return Array.isArray(metadata?.stems) ? metadata.stems : [];
      } catch {
        return [];
      }
    })()
  };
}

interface RemixPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RemixPage({ params }: RemixPageProps) {
  // Use NextAuth for authentication
  const session = await auth();

  if (!session?.user) {
    redirect('/auth');
  }

  const { roomId } = await params;
  const song = await loadSong(roomId);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-brand-foreground">Remix “{song.title}”</h1>
        <p className="text-sm text-muted-foreground">
          Adjust stem levels live. Audience phones can join via QR to submit prompts and vote on the mix direction in real time.
        </p>
      </header>

      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading mixer…</p>}>
        <RemixRoomClient roomId={roomId} song={song} />
      </Suspense>
    </section>
  );
}
