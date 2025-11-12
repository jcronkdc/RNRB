export const dynamic = 'force-dynamic';

import { prisma } from '@cronkwater/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { RemixRoomClient } from './RemixRoomClient';

async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // no-op for RSC
        }
      }
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
}

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
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
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
