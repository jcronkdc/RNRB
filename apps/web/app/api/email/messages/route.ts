import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

// Stalwart Mail Server API configuration
const STALWART_API_URL = process.env.STALWART_API_URL || 'http://mail.rnrb.me:8080';

/**
 * GET /api/email/messages
 * Get messages from user's mailbox
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mailbox = searchParams.get('mailbox') || 'inbox';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's email account
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { userId: session.user.id },
      include: {
        appPasswords: {
          select: {
            passwordHash: true,
          },
          take: 1,
        },
      },
    });

    if (!emailAccount || emailAccount.status !== 'ACTIVE') {
      return NextResponse.json({ messages: [] });
    }

    // Try to fetch from Stalwart mail server via JMAP
    try {
      // For now, return empty since we need proper JMAP session auth
      // The full implementation would use the stalwart-client.ts getMessages function
      // with proper user credentials stored in the email account

      // Return empty messages array - user will see "No messages yet" empty state
      return NextResponse.json({
        messages: [],
        mailbox,
        total: 0,
      });
    } catch (mailError) {
      console.error('[EMAIL-API] Error fetching from mail server:', mailError);
      return NextResponse.json({ messages: [] });
    }
  } catch (error) {
    console.error('[EMAIL-API] Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
