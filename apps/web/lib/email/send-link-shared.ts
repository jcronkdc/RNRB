import { Resend } from 'resend';

import { LinkSharedEmail } from './templates/link-shared';

// Only initialize Resend if API key is available (prevents build errors)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendLinkSharedEmailParams {
  to: string;
  senderName: string;
  fileName: string;
  shareUrl: string;
  hasPassword: boolean;
  canDownload: boolean;
  expiresAt?: string | null;
  message?: string;
}

export async function sendLinkSharedEmail({
  to,
  senderName,
  fileName,
  shareUrl,
  hasPassword,
  canDownload,
  expiresAt,
  message,
}: SendLinkSharedEmailParams) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: "Rock N' Roll Basement <notifications@rnrb.app>",
      to,
      subject: `${senderName} shared "${fileName}" with you`,
      react: LinkSharedEmail({
        recipientEmail: to,
        senderName,
        fileName,
        shareUrl,
        hasPassword,
        canDownload,
        expiresAt,
        message,
      }),
    });

    return { success: true, result };
  } catch (error) {
    console.error('Failed to send link shared email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
