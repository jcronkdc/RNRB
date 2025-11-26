import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * PATCH /api/projects/[slug]/members/[userId]/role
 * Update a team member's role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const { slug, userId: targetUserId } = await params;
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find project by slug
    const project = await db.project.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectId = project.id;
    const body = await request.json();
    const { role } = body;

    if (!role || !['owner', 'admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if requester has permission to change roles
    const requesterMembership = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can change roles' },
        { status: 403 }
      );
    }

    // Owners cannot be changed by admins
    const targetMembership = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: targetUserId,
          projectId,
        },
      },
    });

    if (targetMembership?.role === 'owner' && requesterMembership.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can change owner roles' }, { status: 403 });
    }

    // Update role
    await db.projectMember.update({
      where: {
        userId_projectId: {
          userId: targetUserId,
          projectId,
        },
      },
      data: { role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[slug]/members/[userId]
 * Remove a team member from project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const { slug, userId: targetUserId } = await params;
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find project by slug
    const project = await db.project.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectId = project.id;

    // Check if requester has permission
    const requesterMembership = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can remove members' },
        { status: 403 }
      );
    }

    // Cannot remove owners (unless you're the owner removing yourself)
    const targetMembership = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: targetUserId,
          projectId,
        },
      },
    });

    if (targetMembership?.role === 'owner' && user.id !== targetUserId) {
      return NextResponse.json({ error: 'Cannot remove project owner' }, { status: 403 });
    }

    // Remove member
    await db.projectMember.delete({
      where: {
        userId_projectId: {
          userId: targetUserId,
          projectId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
