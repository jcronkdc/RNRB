import { prisma } from '@cronkwater/db';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@cronkwater/ui';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { requestPayoutAction } from '../../../actions/requestPayout';

interface LeaseMetadata {
  amount?: number;
  currency?: string;
  transactionId?: string;
  pdfUrl?: string;
  splitSheetId?: string;
  collaborators?: Array<{ name: string; email: string; percentage: number }>;
  payouts?: Array<{ requestedAt: string; amount: number; status: string }>;
}

interface SongLeaseSummary {
  id: string;
  title: string;
  projectName: string;
  lease: LeaseMetadata | null;
  createdAt: Date;
}

function parseMetadata(raw: string | null | undefined): LeaseMetadata | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'lease' in parsed) {
      return (parsed as { lease?: LeaseMetadata }).lease ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

async function getSupabaseSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // no-op in RSC
        }
      }
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
}

async function loadLeasedSongs(userId: string): Promise<SongLeaseSummary[]> {
  const projects = await prisma.project.findMany({
    where: {
      org: {
        memberships: {
          some: { userId }
        }
      }
    },
    include: {
      songs: true
    }
  });

  const summaries: SongLeaseSummary[] = [];

  for (const project of projects) {
    for (const song of project.songs) {
      const lease = parseMetadata(song.description);
      if (lease) {
        summaries.push({
          id: song.id,
          title: song.title,
          projectName: project.name,
          lease,
          createdAt: song.createdAt
        });
      }
    }
  }

  return summaries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function summarizeEarnings(songs: SongLeaseSummary[]) {
  const total = songs.reduce((sum, song) => sum + (song.lease?.amount ?? 0), 0);
  const pendingPayouts = songs.reduce((sum, song) => {
    const payouts = song.lease?.payouts ?? [];
    const pending = payouts.filter((payout) => payout.status === 'pending').reduce((acc, payout) => acc + (payout.amount ?? 0), 0);
    return sum + pending;
  }, 0);

  return { total, pendingPayouts };
}

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

function formatDate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

async function handlePayout(formData: FormData) {
  'use server';

  const songId = formData.get('songId');
  if (typeof songId !== 'string' || !songId) {
    return;
  }

  const payload = new FormData();
  payload.append('payload', JSON.stringify({ songId }));
  await requestPayoutAction(payload);
}

export const dynamic = 'force-dynamic';

export default async function DistributePage() {
  const session = await getSupabaseSession();

  if (!session?.user) {
    redirect('/login');
  }

  const songs = await loadLeasedSongs(session.user.id);
  const { total, pendingPayouts } = summarizeEarnings(songs);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand-foreground">Distribution & Royalties</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Track leased titles, collaborator splits, and pending payouts. Stripe Connect handles the heavy lifting—this dashboard keeps you aligned.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border border-border/60 bg-surface">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total lease revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-brand-foreground">{formatCurrency(total)}</CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/60 bg-surface">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Pending payouts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-brand-foreground">{formatCurrency(pendingPayouts)}</CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/60 bg-surface">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Leased titles</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-brand-foreground">{songs.length}</CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {songs.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-border/60 bg-surface/80">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No leased songs yet. Close a lease via the Songs tab to populate this dashboard.
            </CardContent>
          </Card>
        ) : (
          songs.map((song) => {
            const lease = song.lease;
            const payouts = lease?.payouts ?? [];
            return (
              <Card key={song.id} className="rounded-3xl border border-border/60 bg-surface">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg text-brand-foreground">{song.title}</CardTitle>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Project · {song.projectName}</p>
                  </div>
                  <Badge variant="outline">
                    Leased {formatDate(song.createdAt)} · {formatCurrency(lease?.amount ?? 0, lease?.currency ?? 'USD')}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-foreground">Collaborator splits</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(lease?.collaborators ?? []).map((collaborator) => (
                        <div
                          key={`${song.id}-${collaborator.email}`}
                          className="rounded-2xl border border-border/50 bg-surface-muted/60 p-3 text-sm text-muted-foreground"
                        >
                          <p className="font-medium text-brand-foreground">{collaborator.name}</p>
                          <p className="text-xs uppercase tracking-[0.3em]">{collaborator.percentage.toFixed(2)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-brand-foreground">Payout history</h3>
                    {payouts.length ? (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {payouts.map((payout, index) => (
                          <li key={`${song.id}-payout-${index}`} className="flex items-center justify-between rounded-xl border border-border/40 bg-surface/70 px-3 py-2">
                            <span>{formatDate(payout.requestedAt)}</span>
                            <span>{formatCurrency(payout.amount ?? lease?.amount ?? 0)}</span>
                            <Badge variant={payout.status === 'pending' ? 'outline' : 'solid'}>{payout.status}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No payout requests yet.</p>
                    )}
                  </div>

                  <form action={handlePayout} className="flex justify-end">
                    <input type="hidden" name="songId" value={song.id} />
                    <Button type="submit" size="sm" className="rounded-full shadow-soft hover:shadow-elevated">
                      Request payout
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
