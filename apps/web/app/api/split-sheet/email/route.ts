import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Split Sheet Email API
 * Sends PDF split sheets to all contributors via email
 */

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { songTitle, songId, recipients, pdfData } = await request.json();

    if (!songTitle || !recipients || !pdfData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }

    // Extract base64 data (remove data:application/pdf;base64, prefix)
    const base64Data = pdfData.split(',')[1] || pdfData;

    // In a production app, you would:
    // 1. Use a service like SendGrid, AWS SES, or Resend
    // 2. Store the PDF in S3/Cloudflare R2
    // 3. Send personalized emails to each recipient

    // For now, we'll simulate the email sending
    console.log('Split sheet email request:', {
      songTitle,
      songId,
      recipientCount: recipients.length,
      recipients: recipients.map((r: any) => ({
        name: r.contributorName,
        email: r.email,
        percentage: r.percentage,
      })),
    });

    // TODO: Implement actual email sending
    // Example with Resend (once configured):
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    for (const recipient of recipients) {
      await resend.emails.send({
        from: 'CronkWaters <noreply@cronkwaters.com>',
        to: recipient.email,
        subject: `Split Sheet for "${songTitle}"`,
        html: `
          <h2>Split Sheet for "${songTitle}"</h2>
          <p>Hi ${recipient.contributorName},</p>
          <p>Please find attached the ownership split sheet for "${songTitle}".</p>
          <p>Your share: <strong>${recipient.percentage}%</strong></p>
          <p>Please review and sign the attached document.</p>
          <br>
          <p>Best regards,<br>CronkWaters Team</p>
        `,
        attachments: [
          {
            filename: `${songTitle}_Split_Sheet.pdf`,
            content: base64Data,
          },
        ],
      });
    }
    */

    // For now, return success (development mode)
    return NextResponse.json({
      success: true,
      message: `Split sheet would be sent to ${recipients.length} recipient(s)`,
      recipients: recipients.map((r: any) => r.email),
      note: 'Email integration not yet configured. Configure RESEND_API_KEY to enable.',
    });
  } catch (error) {
    console.error('Split sheet email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send split sheet emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
