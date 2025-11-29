import { type NextRequest, NextResponse } from 'next/server';

import { sendEmail, emailTemplates } from '@/lib/email';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Require authentication to prevent spam
    await requireAuth();

    const { inviteEmail, projectName, projectSlug, inviterName, inviterEmail } =
      await request.json();

    if (!inviteEmail || !projectName || !projectSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invites/${projectSlug}?email=${encodeURIComponent(inviteEmail)}`;

    // Send invitation email
    const emailOptions = emailTemplates.projectInvite({
      inviteEmail,
      projectName,
      inviterName,
      inviterEmail: inviterEmail || 'CronkWaters Team',
      inviteLink,
    });

    const emailResult = await sendEmail(emailOptions);

    if (!emailResult.success) {
      // Email failed but still return success with warning
      console.warn('Failed to send invite email:', emailResult.error);
      return NextResponse.json({
        success: true,
        warning: 'Invite created but email could not be sent',
        emailSent: false,
        inviteLink,
        message: 'Invite created. Share the link with your collaborator.',
      });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      inviteLink,
      message: 'Invitation email sent successfully!',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/invites/send', method: 'POST' });
  }
}
