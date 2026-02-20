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

  // Fetch data at the server — no loading spinner, instant render
  const [songs, projects] = await Promise.all([
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
      where: {
        members: { some: { userId } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: {
        _count: {
          select: { songs: true, members: true },
        },
      },
    }),
  ]);

  // Serialize dates for client component
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
    />
  );
}
