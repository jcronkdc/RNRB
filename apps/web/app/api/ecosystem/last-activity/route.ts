import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ecosystem/last-activity
 *
 * Returns the user's most recent activity so they can pick up where they left off
 * This creates continuity and the feeling of "we remember you"
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ activity: null });
    }

    const userId = session.user.id;

    // Try to find the most recent song the user was working on
    let lastActivity = null;

    try {
      // Check for recently edited songs
      const recentSong = await prisma.song.findFirst({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          status: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              collaborators: true,
            },
          },
        },
      });

      if (recentSong) {
        // Calculate rough progress based on status
        let progress = 0;
        switch (recentSong.status) {
          case 'draft':
            progress = 25;
            break;
          case 'in_progress':
            progress = 50;
            break;
          case 'review':
            progress = 75;
            break;
          case 'completed':
            progress = 100;
            break;
          default:
            progress = 10;
        }

        lastActivity = {
          type: 'song',
          id: recentSong.id,
          title: recentSong.title,
          subtitle: recentSong.project ? `Part of "${recentSong.project.name}"` : 'Solo work',
          href: recentSong.project
            ? `/projects/${recentSong.project.slug}/songs/${recentSong.id}`
            : `/songwriting?song=${recentSong.id}`,
          lastEditedAt: recentSong.updatedAt,
          progress,
          collaborators: recentSong._count.collaborators,
        };
      }

      // If no song, check for recent project activity
      if (!lastActivity) {
        const recentProject = await prisma.project.findFirst({
          where: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
          orderBy: {
            updatedAt: 'desc',
          },
          select: {
            id: true,
            name: true,
            slug: true,
            updatedAt: true,
            _count: {
              select: {
                members: true,
                songs: true,
              },
            },
          },
        });

        if (recentProject) {
          lastActivity = {
            type: 'project',
            id: recentProject.id,
            title: recentProject.name,
            subtitle: `${recentProject._count.songs} songs`,
            href: `/projects/${recentProject.slug}`,
            lastEditedAt: recentProject.updatedAt,
            collaborators: recentProject._count.members,
          };
        }
      }
    } catch (dbError) {
      console.error('Database error in last-activity:', dbError);
      // Return null activity on error - component will handle gracefully
    }

    return NextResponse.json({ activity: lastActivity });
  } catch (error) {
    console.error('Error in /api/ecosystem/last-activity:', error);
    return NextResponse.json({ activity: null });
  }
}
