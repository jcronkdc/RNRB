'use client';

import { Button } from '@cronkwater/ui';
import { ArrowLeft, Music, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import PageHeader from '../../../../../../components/app/PageHeader';
import { LyricArchitect } from '../../../../../../components/lyric-architect/LyricArchitect';

interface SongPageClientProps {
  song: {
    id: string;
    title: string;
    bpm?: number;
    key?: string;
    mood_tags?: string[];
    lyrics?: Record<string, unknown>;
    project_id: string;
  };
}

export function SongPageClient({ song }: SongPageClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={song.title}
          subtitle={`${song.bpm ? `${song.bpm} BPM` : ''} ${song.key ? `• Key: ${song.key}` : ''}`}
          actions={
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
          }
        />
      </div>

      {song.mood_tags && song.mood_tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {song.mood_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {song.lyrics ? (
        <div className="rounded-xl border border-border/60 bg-surface/80 p-6 shadow-soft">
          <h3 className="mb-4 font-semibold">Lyrics</h3>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {JSON.stringify(song.lyrics, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 bg-surface/70 p-12 text-center">
          <Music className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No lyrics yet</p>
          <Button className="mt-4" onClick={() => setIsEditing(true)}>
            Generate with AI
          </Button>
        </div>
      )}

      {isEditing && (
        <LyricArchitect
          projectId={song.project_id}
          songId={song.id}
          onComplete={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}














