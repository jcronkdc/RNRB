/**
 * Message Requests API
 *
 * GET - Get message requests (messages from non-friends)
 *
 * Message requests are messages from users you haven't connected with.
 * You can accept (which adds them as a connection) or delete them.
 */

import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all users who have DMed this user
    const dmChannelPattern = `dm:%${userId}%`;

    // Find messages where the user is a recipient but sender is not connected
    const messages = await prisma.chatMessage.findMany({
      where: {
        channelId: {
          contains: userId,
        },
        channelType: 'direct',
        senderId: {
          not: userId,
        },
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['senderId'],
      take: 50,
    });

    // Get the user's connections (following and followers)
    const [following, followers] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      }),
      prisma.userFollow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      }),
    ]);

    const connectedUserIds = new Set([
      ...following.map((f) => f.followingId),
      ...followers.map((f) => f.followerId),
    ]);

    // Filter to only messages from non-connected users
    const requestSenderIds = messages
      .filter((m) => !connectedUserIds.has(m.senderId))
      .map((m) => m.senderId);

    if (requestSenderIds.length === 0) {
      return NextResponse.json({ requests: [], count: 0 });
    }

    // Get sender details and latest message for each
    const senders = await prisma.user.findMany({
      where: { id: { in: requestSenderIds } },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
    });

    const senderMap = new Map(senders.map((s) => [s.id, s]));

    // Get the latest message from each sender
    const requests = await Promise.all(
      requestSenderIds.map(async (senderId) => {
        const latestMessage = await prisma.chatMessage.findFirst({
          where: {
            channelId: {
              contains: userId,
            },
            channelType: 'direct',
            senderId,
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            channelId: true,
          },
        });

        const messageCount = await prisma.chatMessage.count({
          where: {
            channelId: latestMessage?.channelId,
            channelType: 'direct',
            senderId,
            isDeleted: false,
          },
        });

        const sender = senderMap.get(senderId);

        return {
          id: latestMessage?.channelId || `request:${senderId}`,
          sender: {
            id: senderId,
            name: sender?.name || 'Unknown',
            image: sender?.image,
            email: sender?.email,
          },
          latestMessage: {
            id: latestMessage?.id,
            content: latestMessage?.content || '',
            createdAt: latestMessage?.createdAt?.toISOString(),
          },
          messageCount,
          channelId: latestMessage?.channelId,
        };
      })
    );

    return NextResponse.json({
      requests: requests.filter((r) => r.latestMessage.content),
      count: requests.filter((r) => r.latestMessage.content).length,
    });
  } catch (error) {
    console.error('Error fetching message requests:', error);
    return NextResponse.json({ error: 'Failed to fetch message requests' }, { status: 500 });
  }
}
