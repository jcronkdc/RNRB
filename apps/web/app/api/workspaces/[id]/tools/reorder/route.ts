import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/workspaces/[id]/tools/reorder
 * Reorder tools within a workspace
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const userId = session.user.id;
    const { toolIds } = await request.json();

    if (!Array.isArray(toolIds)) {
      return NextResponse.json({ error: 'Tool IDs array is required' }, { status: 400 });
    }

    // Verify workspace ownership
    const workspace = await prisma.userWorkspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Update tool orders
    await Promise.all(
      toolIds.map((id, index) =>
        prisma.workspaceTool.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ message: 'Tools reordered' });
  } catch (error) {
    console.error('[WORKSPACE TOOLS REORDER] ERROR:', error);
    return NextResponse.json({ error: 'Failed to reorder tools' }, { status: 500 });
  }
}
