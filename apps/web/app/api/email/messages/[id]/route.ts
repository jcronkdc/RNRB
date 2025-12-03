import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/email/messages/[id]
 * Get a specific message by ID
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: messageId } = await params;

    // Get user's email account
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!emailAccount || emailAccount.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    // In production, fetch the full message from Stalwart via JMAP
    // For now, return 404 since we don't have the message
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  } catch (error) {
    console.error('[EMAIL-API] Error fetching message:', error);
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}
