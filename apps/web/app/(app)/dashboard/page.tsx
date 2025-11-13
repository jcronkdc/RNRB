import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@cronkwaters/ui";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

import { LeaseDialog } from "./LeaseDialog";
import { NewSongDialog } from "./NewSongDialog";
import { RemixQrModal } from "./RemixQrModal";

export const dynamic = "force-dynamic";

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

// Removed createServerSupabaseClient - using NextAuth for authentication

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
    .join(" ");
}

function createRoomId(songId: string) {
  return `${songId}-${crypto.randomUUID().slice(0, 8)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

async function loadSongs(userId: string): Promise<SongSummary[]> {
  const accessibleProjects = await prisma.project.findMany({
    where: {
      org: {
        memberships: {
          some: { userId },
        },
      },
    },
    select: { id: true, name: true },
  });

  if (!accessibleProjects.length) {
    return [];
  }

  const projectIdToName = new Map(
    accessibleProjects.map(
      (project: { id: string; name: string }) => [project.id, project.name] as const,
    ),
  );

  const songs = await prisma.song.findMany({
    where: { projectId: { in: accessibleProjects.map((project: { id: string }) => project.id) } },
    select: {
      id: true,
      title: true,
      createdAt: true,
      description: true,
      projectId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return songs.map(
    (song: {
      id: string;
      title: string;
      createdAt: Date;
      description: string | null;
      projectId: string;
    }) => {
      const metadata = parseMetadata(song.description);
      return {
        id: song.id,
        title: song.title,
        createdAt: song.createdAt,
        projectName: projectIdToName.get(song.projectId) ?? "Untitled Project",
        status: (typeof metadata.status === "string" ? metadata.status : undefined) ?? "ready",
        stems: (metadata.stems as Array<{ type: string; url: string }> | undefined) ?? [],
      } satisfies SongSummary;
    },
  );
}

// eslint-disable-next-line import/no-default-export
export default async function DashboardPage() {
  // Use NextAuth for authentication
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const songs = await loadSongs(session.user.id);

  return (
    <section className="space-y-10">
      <header className="border-border/50 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-brand-foreground text-2xl font-semibold sm:text-3xl">Your songs</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Every composition you have access to lives here. Open a project, continue a stem, or
            drop a new idea with the prompt-first CronkWaters flow.
          </p>
        </div>
        <div className="flex-shrink-0">
          <NewSongDialog />
        </div>
      </header>

      {songs.length === 0 ? (
        <Card className="border-border/60 bg-surface/70 rounded-3xl border-dashed">
          <CardHeader>
            <CardTitle className="text-brand-foreground text-xl">No songs yet</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>Kick off your first track by launching the New Song prompt modal.</p>
            <p>Invite collaborators and keep every stem and split aligned from the start.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {songs.map((song) => (
            <details
              key={song.id}
              className="border-border/60 bg-surface shadow-soft hover:shadow-elevated group rounded-3xl border p-6 transition hover:-translate-y-0.5"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-brand-foreground text-lg font-semibold sm:text-xl">
                    {song.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">Project · {song.projectName}</p>
                </div>
                <div className="text-muted-foreground flex items-center justify-between gap-3 text-sm sm:justify-end">
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <Badge variant="outline" className="text-xs">
                      {song.status}
                    </Badge>
                    <span className="text-xs sm:text-sm">{formatDate(song.createdAt)}</span>
                  </div>
                  <span className="text-muted-foreground text-xs uppercase tracking-[0.35em] transition-transform duration-200 group-open:-rotate-180">
                    ▼
                  </span>
                </div>
              </summary>
              <div className="border-border/30 mt-6 space-y-4 border-t pt-6">
                {song.stems.length > 0 ? (
                  song.stems.map((stem) => (
                    <div
                      key={`${song.id}-${stem.type}`}
                      className="border-border/60 bg-surface/70 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:gap-5"
                    >
                      <div className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.25em] sm:w-32 sm:text-sm">
                        {formatStemLabel(stem.type)}
                      </div>
                      <div className="flex flex-1 flex-col gap-3">
                        <audio controls preload="metadata" className="w-full rounded-lg">
                          <track kind="captions" />
                          <source src={stem.url} type="audio/mpeg" />
                          Your browser does not support audio playback.
                        </audio>
                        <div
                          className="border-border/40 bg-surface/80 relative h-8 overflow-hidden rounded-lg border sm:h-12"
                          aria-hidden="true"
                        >
                          <div className="absolute inset-0 animate-pulse bg-[repeating-linear-gradient(90deg,rgba(139,92,246,0.18)_0,rgba(139,92,246,0.18)_6px,transparent_6px,transparent_12px)]" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="border-border/50 bg-surface/60 text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                    Stems are processing. You will see preview players here once generation
                    finishes.
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
