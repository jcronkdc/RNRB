import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * DELETE /api/workspaces/[id]/tools/[toolKey]
 * Remove a tool from a workspace
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; toolKey: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId, toolKey } = await params;
    const userId = session.user.id;

    // Verify workspace ownership
    const workspace = await prisma.userWorkspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Delete tool
    await prisma.workspaceTool.deleteMany({
      where: {
        workspaceId,
        toolKey,
      },
    });

    return NextResponse.json({ message: 'Tool removed' });
  } catch (error) {
    console.error('[WORKSPACE TOOL DELETE] ERROR:', error);
    return NextResponse.json({ error: 'Failed to remove tool' }, { status: 500 });
  }
}
