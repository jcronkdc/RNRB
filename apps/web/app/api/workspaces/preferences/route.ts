import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * PATCH /api/workspaces/preferences
 * Update user preferences for workspaces and theming
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const updates = await request.json();

    // Upsert preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        theme: updates.theme || 'system',
        accentColor: updates.accentColor || 'default',
        colorScheme: updates.colorScheme || 'midnight',
        compactMode: updates.compactMode ?? false,
        showWelcome: updates.showWelcome ?? true,
        editModeHintSeen: updates.editModeHintSeen ?? false,
      },
      update: {
        ...(updates.theme && { theme: updates.theme }),
        ...(updates.accentColor && { accentColor: updates.accentColor }),
        ...(updates.colorScheme && { colorScheme: updates.colorScheme }),
        ...(typeof updates.compactMode === 'boolean' && { compactMode: updates.compactMode }),
        ...(typeof updates.showWelcome === 'boolean' && { showWelcome: updates.showWelcome }),
        ...(typeof updates.editModeHintSeen === 'boolean' && {
          editModeHintSeen: updates.editModeHintSeen,
        }),
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('[PREFERENCES PATCH] ERROR:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

/**
 * GET /api/workspaces/preferences
 * Get user preferences
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('[PREFERENCES GET] ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}
