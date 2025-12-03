/**
 * VERIFY OWNER API
 *
 * Checks if the current authenticated user is the platform owner.
 * Used by the admin layout to enforce access control.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@cronkwaters/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ isOwner: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is the platform owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOwner: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ isOwner: false, error: 'User not found' }, { status: 404 });
    }

    // Log access attempt for security auditing
    if (!user.isOwner) {
      console.warn(`[Security] Non-owner attempted admin access: ${user.email}`);
    }

    return NextResponse.json({ isOwner: user.isOwner === true });
  } catch (error) {
    console.error('[Verify Owner API] Error:', error);
    return NextResponse.json({ isOwner: false, error: 'Internal error' }, { status: 500 });
  }
}
