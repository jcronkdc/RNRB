import { Resend } from 'resend';

import { FileSharedEmail } from './templates/file-shared';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendFileSharedEmailParams {
  to: string;
  recipientName: string;
  senderName: string;
  senderEmail: string;
  fileNames: string[];
  message?: string;
  canDownload: boolean;
  expiresAt?: Date | null;
}

export async function sendFileSharedEmail({
  to,
  recipientName,
  senderName,
  senderEmail,
  fileNames,
  message,
  canDownload,
  expiresAt,
}: SendFileSharedEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: "Rock N' Roll Basement <notifications@cronkwaters.com>",
      to,
      subject: `${senderName} shared ${fileNames.length === 1 ? 'a file' : `${fileNames.length} files`} with you`,
      react: FileSharedEmail({
        recipientName,
        senderName,
        senderEmail,
        fileNames,
        message,
        canDownload,
        expiresAt: expiresAt?.toISOString(),
        viewUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com'}/library?tab=shared`,
      }),
    });

    return result;
  } catch (error) {
    console.error('Failed to send file shared email:', error);
    return null;
  }
}
