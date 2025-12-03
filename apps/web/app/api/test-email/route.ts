import { NextResponse } from 'next/server';

import { sendEmail, emailTemplates } from '@/lib/email';

/**
 * Test endpoint for email integration
 * GET /api/test-email?email=your@email.com
 *
 * Note: This is a test endpoint. Consider removing or protecting it in production.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email');

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Please provide an email parameter: /api/test-email?email=your@email.com' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    console.log('🧪 Testing email to:', testEmail);

    // Send a test project invite email
    const emailOptions = emailTemplates.projectInvite({
      inviteEmail: testEmail,
      projectName: 'Test Project - Email Integration',
      inviterName: 'CronkWaters Team',
      inviterEmail: 'noreply@rnrb.app',
      inviteLink:
        'https://www.cronkwaters.com/invites/test-project?email=' + encodeURIComponent(testEmail),
    });

    const result = await sendEmail(emailOptions);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
        to: testEmail,
        note: 'Check your inbox (and spam folder). Also check Resend dashboard: https://resend.com/emails',
      });
    } else {
      // Provide helpful error messages for common Resend issues
      let helpfulNote = 'Check that RESEND_API_KEY or EMAIL_SERVER_URL is configured';

      if (result.error?.includes('testing emails') || result.error?.includes('verified email')) {
        helpfulNote =
          'Resend test mode: You can only send to verified email addresses. To send to any address, verify a domain at https://resend.com/domains and update EMAIL_FROM to use your domain (e.g., noreply@rnrb.app)';
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          note: helpfulNote,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
