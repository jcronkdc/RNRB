import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getBlockedUserIds } from '@/lib/social';

/**
 * GET /api/collaboration
 * List the current user's active collaborations (projects they're a member of).
 * Used by the MCP server's list_collaborations tool.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get blocked users to exclude
    const blockedIds = await getBlockedUserIds(userId);

    // Get projects where user is a member
    const memberships = await prisma.projectMember.findMany({
      where: {
        userId,
        status: 'active',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            members: {
              where: {
                userId: { notIn: [userId, ...Array.from(blockedIds)] },
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const collaborations = memberships.map((m) => {
      const partners = m.project.members.map((pm) => pm.user);
      return {
        id: m.project.id,
        projectName: m.project.name,
        projectSlug: m.project.slug,
        status: m.project.status || 'active',
        partnerName: partners.map((p) => p.name || 'Anonymous').join(', ') || 'Solo project',
        partners,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      };
    });

    return NextResponse.json({ collaborations });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return NextResponse.json({ error: 'Failed to fetch collaborations' }, { status: 500 });
  }
}
