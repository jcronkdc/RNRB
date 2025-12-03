import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/workspaces/[id]/tools
 * Add a tool to a workspace
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const userId = session.user.id;
    const { toolKey } = await request.json();

    if (!toolKey) {
      return NextResponse.json({ error: 'Tool key is required' }, { status: 400 });
    }

    // Verify workspace ownership
    const workspace = await prisma.userWorkspace.findFirst({
      where: { id: workspaceId, userId },
      include: { tools: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if tool already exists
    const existingTool = workspace.tools.find((t) => t.toolKey === toolKey);
    if (existingTool) {
      return NextResponse.json({ error: 'Tool already in workspace' }, { status: 400 });
    }

    // Get max order
    const maxOrder =
      workspace.tools.length > 0 ? Math.max(...workspace.tools.map((t) => t.order)) : -1;

    // Create tool
    const tool = await prisma.workspaceTool.create({
      data: {
        workspaceId,
        toolKey,
        order: maxOrder + 1,
        size: 'normal',
      },
    });

    return NextResponse.json({ tool });
  } catch (error) {
    console.error('[WORKSPACE TOOLS POST] ERROR:', error);
    return NextResponse.json({ error: 'Failed to add tool' }, { status: 500 });
  }
}
