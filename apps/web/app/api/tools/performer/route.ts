/**
 * Performer Mode API - Mycelial Integration
 * Fetch songs from library, setlists, and projects for live performance
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/session';

// GET - Fetch songs for performer mode
export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'library'; // library, setlist, project
    const setlistId = searchParams.get('setlistId');
    const projectId = searchParams.get('projectId');

    let songs: {
      id: string;
      title: string;
      key?: string | null;
      tempo?: number | null;
      lyrics?: string | null;
      notes?: string | null;
      status?: string;
      position?: number;
      isEncore?: boolean;
    }[] = [];

    if (source === 'setlist' && setlistId) {
      // Get songs from a specific setlist (in order)
      const setlist = await db.setlist.findFirst({
        where: {
          id: setlistId,
          show: {
            org: {
              memberships: {
                some: { userId: user.id },
              },
            },
          },
        },
        include: {
          items: {
            orderBy: { position: 'asc' },
            include: {
              song: {
                select: {
                  id: true,
                  title: true,
                  key: true,
                  tempo: true,
                  lyrics: true,
                  description: true,
                  status: true,
                },
              },
            },
          },
          show: {
            select: { name: true, date: true },
          },
        },
      });

      if (setlist) {
        songs = setlist.items
          .filter((item) => item.song)
          .map((item) => ({
            id: item.song!.id,
            title: item.customTitle || item.song!.title,
            key: item.song!.key,
            tempo: item.song!.tempo,
            lyrics: item.song!.lyrics,
            notes: item.notes || item.song!.description,
            status: item.song!.status,
            position: item.position,
            isEncore: item.isEncore,
          }));
      }
    } else if (source === 'project' && projectId) {
      // Get songs from a specific project
      const projectSongs = await db.song.findMany({
        where: {
          projectId,
          project: {
            members: {
              some: { userId: user.id },
            },
          },
          archived: false,
        },
        select: {
          id: true,
          title: true,
          key: true,
          tempo: true,
          lyrics: true,
          description: true,
          status: true,
        },
        orderBy: { title: 'asc' },
      });

      songs = projectSongs.map((s) => ({
        ...s,
        notes: s.description,
      }));
    } else {
      // Get all user's songs (library)
      const userSongs = await db.song.findMany({
        where: {
          userId: user.id,
          archived: false,
          status: { in: ['complete', 'in_progress'] }, // Only ready songs
        },
        select: {
          id: true,
          title: true,
          key: true,
          tempo: true,
          lyrics: true,
          description: true,
          status: true,
        },
        orderBy: { title: 'asc' },
      });

      songs = userSongs.map((s) => ({
        ...s,
        notes: s.description,
      }));
    }

    // Also get available setlists and projects for the selector
    const [setlists, projects] = await Promise.all([
      db.setlist.findMany({
        where: {
          show: {
            org: {
              memberships: {
                some: { userId: user.id },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          show: {
            select: {
              name: true,
              date: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { show: { date: 'desc' } },
        take: 20,
      }),
      db.project.findMany({
        where: {
          members: {
            some: { userId: user.id },
          },
          status: 'active',
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: { songs: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      songs,
      sources: {
        setlists: setlists.map((s) => ({
          id: s.id,
          name: s.name || s.show.name,
          showName: s.show.name,
          date: s.show.date,
          songCount: s._count.items,
        })),
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          songCount: p._count.songs,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching performer data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
