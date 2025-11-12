import { prisma } from '@cronkwaters/db';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@cronkwaters/ui';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'node:crypto';

import { LeaseDialog } from './LeaseDialog';
import { NewSongDialog } from './NewSongDialog';
import { RemixQrModal } from './RemixQrModal';

export const dynamic = 'force-dynamic';

type SongMetadata = {
  status?: string;
  prompt?: string;
  mood?: string | null;
  vocalUrl?: string | null;
  stems?: Array<{ type: string; url: string }>;
};

type SongSummary = {
  id: string;
  title: string;
  createdAt: Date;
  projectName: string;
  status: string;
  stems: Array<{ type: string; url: string }>;
};

async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // setAll can be ignored during SSR
          }
        }
      }
    }
  );
}

function parseMetadata(raw: string | null | undefined): SongMetadata {
  if (!raw) return {};
  try {
    const decoded = JSON.parse(raw) as SongMetadata;
    return decoded ?? {};
  } catch {
    return {};
  }
}

function formatStemLabel(value: string) {
  return value
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function createRoomId(songId: string) {
  return `${songId}-${crypto.randomUUID().slice(0, 8)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

async function loadSongs(userId: string): Promise<SongSummary[]> {
  const accessibleProjects = await prisma.project.findMany({
    where: {
      org: {
        memberships: {
          some: { userId }
        }
      }
    },
    select: { id: true, name: true }
  });

  if (!accessibleProjects.length) {
    return [];
  }

  const projectIdToName = new Map(accessibleProjects.map((project: { id: string; name: string }) => [project.id, project.name] as const));

  const songs = await prisma.song.findMany({
    where: { projectId: { in: accessibleProjects.map((project: { id: string }) => project.id) } },
    select: {
      id: true,
      title: true,
      createdAt: true,
      description: true,
      projectId: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return songs.map((song: { id: string; title: string; createdAt: Date; description: string | null; projectId: string }) => {
    const metadata = parseMetadata(song.description);
    return {
      id: song.id,
      title: song.title,
      createdAt: song.createdAt,
      projectName: projectIdToName.get(song.projectId) ?? 'Untitled Project',
      status: (typeof metadata.status === 'string' ? metadata.status : undefined) ?? 'ready',
      stems: (metadata.stems as Array<{ type: string; url: string }> | undefined) ?? []
    } satisfies SongSummary;
  });
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const songs = await loadSongs(session.user.id);

  return (
    <section className="space-y-10">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-brand-foreground">Your songs</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Every composition you have access to lives here. Open a project, continue a stem, or drop a new idea with the prompt-first CronkWaters flow.
          </p>
        </div>
        <NewSongDialog />
      </header>

      {songs.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-border/60 bg-surface/70">
          <CardHeader>
            <CardTitle className="text-xl text-brand-foreground">No songs yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Kick off your first track by launching the New Song prompt modal.</p>
            <p>Invite collaborators and keep every stem and split aligned from the start.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {songs.map((song) => (
            <details
              key={song.id}
              className="group rounded-3xl border border-border/60 bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-brand-foreground">{song.title}</h3>
                  <p className="text-sm text-muted-foreground">Project · {song.projectName}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <Badge variant="outline">{song.status}</Badge>
                    <span>{formatDate(song.createdAt)}</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground transition-transform duration-200 group-open:-rotate-180">
                    ▼
                  </span>
                </div>
              </summary>
              <div className="mt-6 space-y-4 border-t border-border/30 pt-6">
                {song.stems.length > 0 ? (
                  song.stems.map((stem) => (
                    <div
                      key={`${song.id}-${stem.type}`}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface/70 p-4 sm:flex-row sm:items-center sm:gap-5"
                    >
                      <div className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground sm:w-32">
                        {formatStemLabel(stem.type)}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative hidden h-12 flex-1 overflow-hidden rounded-xl border border-border/40 bg-surface/80 sm:block" aria-hidden="true">
                          <div className="absolute inset-0 animate-pulse bg-[repeating-linear-gradient(90deg,rgba(139,92,246,0.18)_0,rgba(139,92,246,0.18)_6px,transparent_6px,transparent_12px)]" />
                        </div>
                        <audio controls preload="metadata" className="w-full max-w-xs rounded-xl">
                          <track kind="captions" />
                          <source src={stem.url} type="audio/mpeg" />
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-border/50 bg-surface/60 p-4 text-sm text-muted-foreground">
                    Stems are processing. You will see preview players here once generation finishes.
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <RemixQrModal roomId={createRoomId(song.id)} songTitle={song.title} />
                  <LeaseDialog songId={song.id} songTitle={song.title} />
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

