import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError, AppError } from '@/lib/errors';

/**
 * POST /api/share/[token]
 * Access a shared file via token (handles password verification)
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    // Find the share link
    const shareLink = await prisma.libraryShareLink.findUnique({
      where: { token },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            originalName: true,
            type: true,
            mimeType: true,
            size: true,
            url: true,
            duration: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!shareLink) {
      throw AppError.notFound('Share link not found or expired');
    }

    // Check if link is active
    if (!shareLink.isActive) {
      throw AppError.notFound('This share link has been deactivated');
    }

    // Check expiration
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      throw AppError.notFound('This share link has expired');
    }

    // Check max views
    if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
      throw AppError.notFound('This share link has reached its view limit');
    }

    // Check password if required
    if (shareLink.password) {
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 });
      }

      const hashedPassword = await hashPassword(password);
      if (hashedPassword !== shareLink.password) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
    }

    // Increment view count
    await prisma.libraryShareLink.update({
      where: { id: shareLink.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      file: {
        id: shareLink.file.id,
        name: shareLink.file.name,
        originalName: shareLink.file.originalName,
        type: shareLink.file.type,
        mimeType: shareLink.file.mimeType,
        size: shareLink.file.size.toString(),
        url: shareLink.file.url,
        duration: shareLink.file.duration,
        ownerName: shareLink.user.name || shareLink.user.email?.split('@')[0] || 'Anonymous',
      },
      canDownload: shareLink.canDownload,
      expiresAt: shareLink.expiresAt,
      linkName: shareLink.name,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/share/[token]', method: 'POST' });
  }
}

// Simple password hashing (matches the one in share-link route)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.NEXTAUTH_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
