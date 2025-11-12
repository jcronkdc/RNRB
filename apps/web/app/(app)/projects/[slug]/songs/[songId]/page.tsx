export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';

import { SongPageClient } from './SongPageClient';
import { createClient } from '../../../../../../lib/supabase/server';

async function getSong(songId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: song } = await supabase
    .from('songs')
    .select('*, projects(*)')
    .eq('id', songId)
    .eq('created_by', user.id)
    .single();

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
        bpm: song.bpm,
        key: song.key,
        mood_tags: song.mood_tags || [],
        lyrics: song.lyrics,
        project_id: song.project_id,
      }}
    />
  );
}

