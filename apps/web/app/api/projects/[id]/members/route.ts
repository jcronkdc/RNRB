import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/projects/[id]/members
 * List all members of a project
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = id;

    // Check if user has access to this project
    const membership = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all project members
    const members = await db.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Owners first
        { joinedAt: 'asc' },
      ],
    });

    const formattedMembers = members.map((m) => ({
      userId: m.user.id,
      userName: m.user.name || m.user.email?.split('@')[0] || 'User',
      userEmail: m.user.email,
      avatar: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      status: m.status,
    }));

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error('Error loading team members:', error);
    return NextResponse.json({ error: 'Failed to load team members' }, { status: 500 });
  }
}
