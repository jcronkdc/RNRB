/**
 * User Blocking API
 *
 * POST - Block a user
 * DELETE - Unblock a user
 *
 * Blocking prevents:
 * - The blocked user from sending you messages
 * - The blocked user from viewing your profile
 * - The blocked user from following you
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { blockUser, unblockUser } from '@/lib/spam-protection';

// POST - Block a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId } = await params;
    const currentUserId = session.user.id;

    // Can't block yourself
    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    await blockUser(currentUserId, targetUserId);

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully',
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
}

// DELETE - Unblock a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId } = await params;
    const currentUserId = session.user.id;

    await unblockUser(currentUserId, targetUserId);

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
  }
}
