import { prisma } from '@cronkwaters/db';
import { randomBytes } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

// Create share link schema
const createShareLinkSchema = z.object({
  fileId: z.string(),
  name: z.string().max(100).optional(),
  password: z.string().min(4).max(50).optional(),
  canDownload: z.boolean().default(true),
  maxViews: z.number().min(1).max(10000).optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
});

/**
 * POST /api/library/share-link
 * Create a shareable link for a file
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { fileId, name, password, canDownload, maxViews, expiresInDays } =
      createShareLinkSchema.parse(body);

    // Verify user owns the file
    const file = await prisma.libraryFile.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
    });

    if (!file) {
      throw AppError.notFound('File not found');
    }

    // Generate unique token
    const token = randomBytes(32).toString('base64url');

    // Calculate expiration
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create share link
    const shareLink = await prisma.libraryShareLink.create({
      data: {
        fileId,
        userId: user.id,
        token,
        name: name || file.name,
        password: password ? await hashPassword(password) : null,
        canDownload,
        maxViews,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com';
    const shareUrl = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      success: true,
      shareLink: {
        id: shareLink.id,
        token: shareLink.token,
        url: shareUrl,
        name: shareLink.name,
        hasPassword: !!password,
        canDownload: shareLink.canDownload,
        maxViews: shareLink.maxViews,
        expiresAt: shareLink.expiresAt,
        createdAt: shareLink.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/share-link', method: 'POST' });
  }
}

/**
 * GET /api/library/share-link
 * List all share links for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const fileId = searchParams.get('fileId');

    const where: { userId: string; fileId?: string } = { userId: user.id };
    if (fileId) {
      where.fileId = fileId;
    }

    const shareLinks = await prisma.libraryShareLink.findMany({
      where,
      include: {
        file: {
          select: {
            id: true,
            name: true,
            type: true,
            mimeType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com';

    return NextResponse.json({
      shareLinks: shareLinks.map((link) => ({
        id: link.id,
        token: link.token,
        url: `${baseUrl}/share/${link.token}`,
        name: link.name,
        hasPassword: !!link.password,
        canDownload: link.canDownload,
        maxViews: link.maxViews,
        viewCount: link.viewCount,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        createdAt: link.createdAt,
        file: link.file,
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/share-link', method: 'GET' });
  }
}

/**
 * DELETE /api/library/share-link
 * Delete a share link
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const linkId = searchParams.get('id');
    if (!linkId) {
      throw AppError.badRequest('Link ID required');
    }

    // Verify ownership
    const link = await prisma.libraryShareLink.findFirst({
      where: {
        id: linkId,
        userId: user.id,
      },
    });

    if (!link) {
      throw AppError.notFound('Share link not found');
    }

    await prisma.libraryShareLink.delete({
      where: { id: linkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/share-link', method: 'DELETE' });
  }
}

// Simple password hashing (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.NEXTAUTH_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
