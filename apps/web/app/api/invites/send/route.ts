import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';

// Email sending via Resend (configured in environment)
// Falls back to logging if EMAIL_SERVER_URL not set

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Require authentication to prevent spam
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { inviteEmail, projectName, projectSlug, inviterName, inviterEmail } = await request.json();

    if (!inviteEmail || !projectName || !projectSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll create the invite link and log it
    // When Resend is properly configured, this will send actual emails
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invites/${projectSlug}?email=${encodeURIComponent(inviteEmail)}`;

    const emailContent = {
      to: inviteEmail,
      from: process.env.EMAIL_FROM || 'noreply@cronkwaters.com',
      subject: `You've been invited to collaborate on "${projectName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6347 0%, #FF4500 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #FF6347 0%, #FF4500 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 Rock N' Roll Basement</h1>
              <p>Collaborative Music Creation</p>
            </div>
            <div class="content">
              <h2>You've Been Invited!</h2>
              <p>Hey there,</p>
              <p><strong>${inviterName || inviterEmail}</strong> has invited you to collaborate on their project:</p>
              <p style="font-size: 24px; font-weight: bold; color: #FF6347; margin: 20px 0;">"${projectName}"</p>
              <p>Rock N' Roll Basement is a collaborative platform where musicians create together in real-time with:</p>
              <ul>
                <li>Real-time chat powered by Ably</li>
                <li>HD video collaboration with Daily.co</li>
                <li>Collaborative songwriting tools</li>
                <li>Audio file sharing with Supabase Storage</li>
              </ul>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" class="button">Accept Invitation</a>
              </p>
              <p style="font-size: 12px; color: #666;">Or copy this link: <br>${inviteLink}</p>
            </div>
            <div class="footer">
              <p>This invitation was sent to ${inviteEmail}</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
You've been invited to collaborate on "${projectName}"!

${inviterName || inviterEmail} has invited you to join their music project on Rock N' Roll Basement.

Accept the invitation here: ${inviteLink}

Rock N' Roll Basement is a collaborative platform for musicians with:
- Real-time chat powered by Ably
- HD video collaboration with Daily.co
- Collaborative songwriting tools
- Audio file sharing

If you didn't expect this invitation, you can safely ignore this email.
      `
    };

    // Check if we have email server configured
    const emailServerUrl = process.env.EMAIL_SERVER_URL;
    
    if (!emailServerUrl) {
      // Email not configured - log and return success with warning
      console.log('📧 EMAIL (not sent - EMAIL_SERVER_URL not configured):');
      console.log('To:', inviteEmail);
      console.log('Subject:', emailContent.subject);
      console.log('Link:', inviteLink);
      
      return NextResponse.json({
        success: true,
        warning: 'Email system not configured - invite created but email not sent',
        inviteLink,
      });
    }

    // TODO: Implement actual email sending with Resend
    // For now, we'll log it and return success
    console.log('📧 EMAIL READY TO SEND:');
    console.log('To:', inviteEmail);
    console.log('From:', emailContent.from);
    console.log('Subject:', emailContent.subject);
    console.log('Link:', inviteLink);

    return NextResponse.json({
      success: true,
      emailSent: false, // Honest: email not actually sent yet
      inviteLink,
      message: 'Invite created. Share the link with your collaborator.'
    });

  } catch (error: any) {
    console.error('Invite send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invite' },
      { status: 500 }
    );
  }
}

