import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { DashboardContent } from './dashboard-client';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth');
  }

  const userId = session.user.id;
  const firstName = session.user.name?.split(' ')[0] || 'there';
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    songs,
    projects,
    totalSongs,
    totalProjects,
    collaboratorCount,
    songsThisWeek,
    unreadNotifications,
    user,
  ] = await Promise.all([
    db.song.findMany({
      where: { userId, archived: false },
      orderBy: { updatedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        project: {
          select: { name: true, slug: true },
        },
      },
    }),
    db.project.findMany({
      where: { members: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: {
        _count: { select: { songs: true, members: true } },
      },
    }),
    db.song.count({
      where: { OR: [{ userId }, { collaborators: { some: { userId } } }], archived: false },
    }),
    db.project.count({
      where: { members: { some: { userId } } },
    }),
    db.songCollaborator.count({
      where: { song: { userId }, userId: { not: userId } },
    }),
    db.song.count({
      where: { userId, createdAt: { gte: oneWeekAgo } },
    }),
    db.notification.count({
      where: { userId, readAt: null },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        isOwner: true,
        aiRequestsUsed: true,
        storageUsedGB: true,
      },
    }),
  ]);

  const tier = user?.isOwner ? 'studio' : (user?.subscriptionTier ?? 'free');

  const serializedSongs = songs.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    updatedAt: s.updatedAt.toISOString(),
    project: s.project ? { name: s.project.name, slug: s.project.slug } : null,
  }));

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    _count: p._count,
  }));

  return (
    <DashboardContent
      firstName={firstName}
      songs={serializedSongs}
      projects={serializedProjects}
      stats={{
        totalSongs,
        totalProjects,
        collaborators: collaboratorCount,
        songsThisWeek,
        unreadNotifications,
        tier,
      }}
    />
  );
}
