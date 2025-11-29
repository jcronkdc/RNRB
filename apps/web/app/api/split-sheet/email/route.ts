import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { sendEmail, emailTemplates } from '@/lib/email';

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

    // Extract base64 data (remove data:application/pdf;base64, prefix if present)
    const base64Data = pdfData.includes(',') ? pdfData.split(',')[1] : pdfData;

    // Send emails to all recipients
    const emailResults = await Promise.allSettled(
      recipients.map(
        async (recipient: { email: string; contributorName: string; percentage: number }) => {
          const emailOptions = emailTemplates.splitSheet({
            recipientEmail: recipient.email,
            recipientName: recipient.contributorName,
            songTitle,
            percentage: recipient.percentage,
            pdfData: base64Data,
          });

          return sendEmail(emailOptions);
        }
      )
    );

    // Count successes and failures
    const successful = emailResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failed = emailResults.length - successful;

    // Log results
    emailResults.forEach((result, index) => {
      const recipient = recipients[index];
      if (result.status === 'fulfilled' && result.value.success) {
        console.log(`✅ Split sheet sent to ${recipient.email}`);
      } else {
        const error = result.status === 'rejected' ? result.reason : result.value.error;
        console.error(`❌ Failed to send split sheet to ${recipient.email}:`, error);
      }
    });

    return NextResponse.json({
      success: true,
      message: `Split sheets sent to ${successful} recipient(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      sent: successful,
      failed,
      recipients: recipients.map((r: any, index: number) => {
        const result = emailResults[index];
        const wasSuccessful = result.status === 'fulfilled' && result.value.success;
        return {
          email: r.email,
          status: wasSuccessful ? 'sent' : 'failed',
        };
      }),
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
