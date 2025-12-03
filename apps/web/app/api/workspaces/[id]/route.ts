import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * PATCH /api/workspaces/[id]
 * Update a workspace
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const updates = await request.json();

    // Verify ownership
    const workspace = await prisma.userWorkspace.findFirst({
      where: { id, userId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Update workspace
    const updatedWorkspace = await prisma.userWorkspace.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.icon && { icon: updates.icon }),
        ...(typeof updates.order === 'number' && { order: updates.order }),
      },
      include: {
        tools: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error('[WORKSPACE PATCH] ERROR:', error);
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}

/**
 * DELETE /api/workspaces/[id]
 * Delete a workspace
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Verify ownership and that it's not the default workspace
    const workspace = await prisma.userWorkspace.findFirst({
      where: { id, userId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (workspace.isDefault) {
      return NextResponse.json({ error: 'Cannot delete the default workspace' }, { status: 400 });
    }

    // Delete workspace (tools cascade delete)
    await prisma.userWorkspace.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Workspace deleted' });
  } catch (error) {
    console.error('[WORKSPACE DELETE] ERROR:', error);
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
  }
}
