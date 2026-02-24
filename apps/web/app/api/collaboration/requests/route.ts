import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { isBlocked } from '@/lib/social';

/**
 * POST /api/collaboration/requests
 * Send a collaboration request to another user.
 * This creates a follow with an optional message (friend request with context).
 * Used by the MCP server's send_collab_request tool.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { userId: targetUserId, message, projectId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });
    }

    // Check target exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Block check
    const blocked = await isBlocked(userId, targetUserId);
    if (blocked) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Request already sent' }, { status: 409 });
    }

    // Create the follow with message context
    await prisma.userFollow.create({
      data: {
        followerId: userId,
        followingId: targetUserId,
        message: message || null,
      },
    });

    // If a projectId was specified, invite them to the project
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          members: { some: { userId, role: { in: ['owner', 'admin'] } } },
        },
      });

      if (project) {
        // Add as pending project member
        await prisma.projectMember.upsert({
          where: {
            userId_projectId: { userId: targetUserId, projectId },
          },
          update: {},
          create: {
            userId: targetUserId,
            projectId,
            role: 'member',
            status: 'invited',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Collaboration request sent to ${targetUser.name || 'user'}`,
    });
  } catch (error) {
    console.error('Error sending collaboration request:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}
