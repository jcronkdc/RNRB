import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

// Default tools for new users
const DEFAULT_TOOLS = [
  'songwriting',
  'songs',
  'library',
  'studio',
  'discover',
  'shows',
  'opportunities',
  'messages',
  'mail',
  'tools',
  'sites',
  'masterclasses',
  'tours',
  'settings',
];

/**
 * GET /api/workspaces
 * Get all workspaces and preferences for the current user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get workspaces with tools
    const workspaces = await prisma.userWorkspace.findMany({
      where: { userId },
      include: {
        tools: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Get user preferences
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      workspaces,
      preferences,
    });
  } catch (error) {
    console.error('[WORKSPACES GET] ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

/**
 * POST /api/workspaces
 * Create a new workspace
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();
    const { workspace } = data;

    if (!workspace?.name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    // Get current max order
    const maxOrder = await prisma.userWorkspace.aggregate({
      where: { userId },
      _max: { order: true },
    });

    // Create workspace
    const newWorkspace = await prisma.userWorkspace.create({
      data: {
        userId,
        name: workspace.name,
        icon: workspace.icon || 'layout',
        order: (maxOrder._max.order ?? -1) + 1,
        isDefault: workspace.isDefault ?? false,
      },
      include: {
        tools: true,
      },
    });

    // If this is a default workspace, add default tools
    if (workspace.isDefault && workspace.tools?.length > 0) {
      const toolsData = workspace.tools.map(
        (tool: { toolKey: string; order: number; size?: string }) => ({
          workspaceId: newWorkspace.id,
          toolKey: tool.toolKey,
          order: tool.order,
          size: tool.size || 'normal',
        })
      );

      await prisma.workspaceTool.createMany({
        data: toolsData,
      });

      // Refetch with tools
      const updatedWorkspace = await prisma.userWorkspace.findUnique({
        where: { id: newWorkspace.id },
        include: { tools: { orderBy: { order: 'asc' } } },
      });

      return NextResponse.json({ workspace: updatedWorkspace });
    }

    return NextResponse.json({ workspace: newWorkspace });
  } catch (error) {
    console.error('[WORKSPACES POST] ERROR:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}

/**
 * DELETE /api/workspaces
 * Reset all workspaces to default (called from reset endpoint)
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete all existing workspaces (cascades to tools)
    await prisma.userWorkspace.deleteMany({
      where: { userId },
    });

    // Delete preferences
    await prisma.userPreferences.deleteMany({
      where: { userId },
    });

    // Create default workspace
    const defaultWorkspace = await prisma.userWorkspace.create({
      data: {
        userId,
        name: 'Home',
        icon: 'home',
        order: 0,
        isDefault: true,
      },
    });

    // Add default tools
    const toolsData = DEFAULT_TOOLS.map((toolKey, index) => ({
      workspaceId: defaultWorkspace.id,
      toolKey,
      order: index,
      size: 'normal',
    }));

    await prisma.workspaceTool.createMany({
      data: toolsData,
    });

    // Create default preferences
    const preferences = await prisma.userPreferences.create({
      data: {
        userId,
        theme: 'system',
        accentColor: 'default',
        colorScheme: 'midnight',
        compactMode: false,
        showWelcome: true,
        editModeHintSeen: false,
      },
    });

    // Fetch complete workspace with tools
    const workspace = await prisma.userWorkspace.findUnique({
      where: { id: defaultWorkspace.id },
      include: { tools: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({
      message: 'Workspaces reset to default',
      workspaces: [workspace],
      preferences,
    });
  } catch (error) {
    console.error('[WORKSPACES DELETE] ERROR:', error);
    return NextResponse.json({ error: 'Failed to reset workspaces' }, { status: 500 });
  }
}
