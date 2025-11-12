'use client';

import { Button } from '@songforge/ui';
import { Music, Plus } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '../../../components/app/EmptyState';

interface Song {
  id: string;
  project_id: string;
  title: string;
  bpm?: number;
  key?: string;
  mood_tags?: string[];
}

interface SongListProps {
  songs: Song[];
  projects: Array<{ id: string; slug: string; name: string }>;
}

export function SongList({ songs, projects }: SongListProps) {
  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || 'Unknown Project';
  };

  if (!songs.length) {
    return (
      <EmptyState
        icon={Music}
        title="No Songs Yet"
        description="Create your first song or use AI Lyric Architect to generate lyrics."
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Song
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Songs</h2>
        <Button>
          <Plus className="h-4 w-4" />
          New Song
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {songs.map((song) => (
          <Link
            key={song.id}
            href={`/projects/${song.project_id}/songs/${song.id}`}
            className="group rounded-xl border border-border/60 bg-surface/80 p-6 shadow-soft transition hover:border-brand-primary/40 hover:shadow-lg"
          >
            <h3 className="font-semibold text-brand-foreground group-hover:text-brand-primary">
              {song.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{getProjectName(song.project_id)}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {song.bpm && <span>{song.bpm} BPM</span>}
              {song.key && <span>Key: {song.key}</span>}
              {song.mood_tags && song.mood_tags.length > 0 && (
                <span className="flex flex-wrap gap-1">
                  {song.mood_tags.map((tag) => (
                    <span key={tag} className="rounded bg-brand-muted px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}














