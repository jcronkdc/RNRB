import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { sendFileSharedEmail } from '@/lib/email/send-file-shared';
import { handleApiError, AppError } from '@/lib/errors';
import { publishToUser } from '@/lib/realtime';
import { requireAuth } from '@/lib/session';

// Share request schema
const shareRequestSchema = z.object({
  fileIds: z.array(z.string()).min(1).max(50),
  recipientIds: z.array(z.string()).min(1).max(20),
  canDownload: z.boolean().default(true),
  canReshare: z.boolean().default(false),
  message: z.string().max(500).optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
});

/**
 * POST /api/library/share
 * Share files with other users
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { fileIds, recipientIds, canDownload, canReshare, message, expiresInDays } =
      shareRequestSchema.parse(body);

    // Verify user owns all files
    const files = await prisma.libraryFile.findMany({
      where: {
        id: { in: fileIds },
        userId: user.id,
      },
      select: { id: true, name: true },
    });

    if (files.length !== fileIds.length) {
      throw AppError.forbidden('You can only share files you own');
    }

    // Verify all recipients exist
    const recipients = await prisma.user.findMany({
      where: {
        id: { in: recipientIds },
      },
      select: { id: true, name: true, email: true },
    });

    if (recipients.length !== recipientIds.length) {
      throw AppError.notFound('One or more recipients not found');
    }

    // Filter out self-shares
    const validRecipientIds = recipientIds.filter((id) => id !== user.id);
    if (validRecipientIds.length === 0) {
      throw AppError.badRequest('Cannot share files with yourself');
    }

    // Calculate expiration date
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create shares (upsert to handle duplicates)
    const shares = [];
    for (const fileId of fileIds) {
      for (const recipientId of validRecipientIds) {
        const share = await prisma.libraryFileShare.upsert({
          where: {
            fileId_sharedWithId: {
              fileId,
              sharedWithId: recipientId,
            },
          },
          create: {
            fileId,
            sharedById: user.id,
            sharedWithId: recipientId,
            canDownload,
            canReshare,
            message,
            expiresAt,
          },
          update: {
            canDownload,
            canReshare,
            message,
            expiresAt,
          },
          include: {
            file: {
              select: { name: true, type: true },
            },
            sharedWith: {
              select: { id: true, name: true, email: true },
            },
          },
        });
        shares.push(share);
      }
    }

    // Create notifications, send emails, and publish real-time updates for recipients
    const fileNames = files.map((f) => f.name);

    for (const recipientId of validRecipientIds) {
      const recipient = recipients.find((r) => r.id === recipientId);
      if (!recipient) continue;

      const displayFileNames = fileNames.slice(0, 3);
      const moreFiles = fileNames.length > 3 ? ` and ${fileNames.length - 3} more` : '';

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'collab_invite',
          title: 'Files shared with you',
          message: `${user.name || user.email} shared ${displayFileNames.join(', ')}${moreFiles} with you`,
          actorId: user.id,
          metadata: {
            fileIds,
            sharedById: user.id,
          },
        },
      });

      // Send email notification (async, don't wait)
      sendFileSharedEmail({
        to: recipient.email,
        recipientName: recipient.name || '',
        senderName: user.name || 'Someone',
        senderEmail: user.email!,
        fileNames,
        message,
        canDownload,
        expiresAt,
      }).catch((err) => console.error('Email send error:', err));

      // Publish real-time notification via Ably
      publishToUser(recipientId, 'library:file-shared', {
        type: 'file-shared',
        senderId: user.id,
        senderName: user.name || user.email,
        fileCount: fileNames.length,
        fileNames: displayFileNames,
        message,
        canDownload,
        timestamp: new Date().toISOString(),
      }).catch((err) => console.error('Ably publish error:', err));
    }

    return NextResponse.json({
      success: true,
      sharesCreated: shares.length,
      files: fileNames,
      recipients: recipients.filter((r) => validRecipientIds.includes(r.id)),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/share', method: 'POST' });
  }
}

/**
 * GET /api/library/share
 * Get files shared with the current user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type'); // 'received' or 'sent'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (type === 'sent') {
      // Files shared by current user
      const shares = await prisma.libraryFileShare.findMany({
        where: {
          sharedById: user.id,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
          file: {
            select: {
              id: true,
              name: true,
              type: true,
              mimeType: true,
              size: true,
              url: true,
            },
          },
          sharedWith: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.libraryFileShare.count({
        where: {
          sharedById: user.id,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      return NextResponse.json({
        shares: shares.map((s) => ({
          ...s,
          file: { ...s.file, size: s.file.size.toString() },
        })),
        pagination: { total, limit, offset, hasMore: offset + shares.length < total },
      });
    } else {
      // Files shared with current user (default)
      const shares = await prisma.libraryFileShare.findMany({
        where: {
          sharedWithId: user.id,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
          file: {
            select: {
              id: true,
              name: true,
              type: true,
              mimeType: true,
              size: true,
              url: true,
              duration: true,
              bpm: true,
              musicalKey: true,
            },
          },
          sharedBy: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.libraryFileShare.count({
        where: {
          sharedWithId: user.id,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      // Mark as viewed
      const unviewedIds = shares.filter((s) => !s.viewedAt).map((s) => s.id);
      if (unviewedIds.length > 0) {
        await prisma.libraryFileShare.updateMany({
          where: { id: { in: unviewedIds } },
          data: { viewedAt: new Date() },
        });
      }

      return NextResponse.json({
        shares: shares.map((s) => ({
          ...s,
          file: { ...s.file, size: s.file.size.toString() },
        })),
        pagination: { total, limit, offset, hasMore: offset + shares.length < total },
      });
    }
  } catch (error) {
    return handleApiError(error, { route: '/api/library/share', method: 'GET' });
  }
}

/**
 * DELETE /api/library/share
 * Remove a share (revoke access)
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('id');
    const fileId = searchParams.get('fileId');
    const recipientId = searchParams.get('recipientId');

    if (shareId) {
      // Delete specific share
      const share = await prisma.libraryFileShare.findFirst({
        where: {
          id: shareId,
          sharedById: user.id,
        },
      });

      if (!share) {
        throw AppError.notFound('Share not found');
      }

      await prisma.libraryFileShare.delete({
        where: { id: shareId },
      });

      return NextResponse.json({ success: true, deleted: 1 });
    } else if (fileId && recipientId) {
      // Delete share by file and recipient
      const result = await prisma.libraryFileShare.deleteMany({
        where: {
          fileId,
          sharedWithId: recipientId,
          sharedById: user.id,
        },
      });

      return NextResponse.json({ success: true, deleted: result.count });
    } else if (fileId) {
      // Revoke all shares for a file
      const result = await prisma.libraryFileShare.deleteMany({
        where: {
          fileId,
          sharedById: user.id,
        },
      });

      return NextResponse.json({ success: true, deleted: result.count });
    } else {
      throw AppError.badRequest('Must provide shareId, fileId, or fileId+recipientId');
    }
  } catch (error) {
    return handleApiError(error, { route: '/api/library/share', method: 'DELETE' });
  }
}
