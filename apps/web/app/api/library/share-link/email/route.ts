import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';
import { sendLinkSharedEmail } from '@/lib/email/send-link-shared';

const sendEmailSchema = z.object({
  to: z.string().email(),
  fileName: z.string(),
  shareUrl: z.string().url(),
  hasPassword: z.boolean().default(false),
  canDownload: z.boolean().default(true),
  expiresAt: z.string().nullable().optional(),
  message: z.string().max(500).optional(),
});

/**
 * POST /api/library/share-link/email
 * Send an email with a share link
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { to, fileName, shareUrl, hasPassword, canDownload, expiresAt, message } =
      sendEmailSchema.parse(body);

    // Get sender name
    const senderName = user.name || user.email?.split('@')[0] || 'Someone';

    const result = await sendLinkSharedEmail({
      to,
      senderName,
      fileName,
      shareUrl,
      hasPassword,
      canDownload,
      expiresAt,
      message,
    });

    if (!result.success) {
      throw AppError.internal(result.error || 'Failed to send email');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/share-link/email', method: 'POST' });
  }
}
