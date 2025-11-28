import { Resend } from 'resend';

/**
 * Email service using Resend
 * Handles all email sending with proper error handling and fallbacks
 */

/**
 * Extract Resend API key from environment
 * Checks RESEND_API_KEY first, then extracts from EMAIL_SERVER_URL if available
 */
function getResendApiKey(): string | null {
  // First, check for direct RESEND_API_KEY
  if (process.env.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY;
  }

  // Otherwise, try to extract from EMAIL_SERVER_URL (SMTP format)
  // Format: smtp://resend:API_KEY@smtp.resend.com:587
  const emailServerUrl = process.env.EMAIL_SERVER_URL;
  if (emailServerUrl?.includes('resend')) {
    try {
      const url = new URL(emailServerUrl.replace('smtp://', 'http://'));
      const password = url.password; // API key is in the password part
      if (password && password.startsWith('re_')) {
        return password;
      }
    } catch (error) {
      // Invalid URL format, ignore
    }
  }

  return null;
}

const resendApiKey = getResendApiKey();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM = process.env.EMAIL_FROM || 'CronkWaters <onboarding@resend.dev>';
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Resend test mode: can only send to verified emails when using onboarding@resend.dev
const RESEND_TEST_MODE =
  !process.env.EMAIL_FROM?.includes('@') || process.env.EMAIL_FROM?.includes('@resend.dev');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 * Falls back gracefully if Resend is not configured
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Check if Resend is configured
  if (!resend || !resendApiKey) {
    console.warn('📧 Email not sent - Resend API key not configured');
    console.log('Email would be sent:', {
      to: options.to,
      subject: options.subject,
      from: options.from || DEFAULT_FROM,
    });
    console.log('💡 Tip: Set RESEND_API_KEY or configure EMAIL_SERVER_URL with Resend');
    return {
      success: false,
      error: 'Email service not configured. Set RESEND_API_KEY or EMAIL_SERVER_URL with Resend.',
    };
  }

  // Warn about Resend test mode limitations
  if (RESEND_TEST_MODE) {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const testModeWarning =
      '⚠️ Resend test mode: Can only send to verified email addresses. Verify a domain at resend.com/domains to send to any address.';
    console.warn(testModeWarning);
  }

  try {
    const result = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      attachments: options.attachments?.map((att) => ({
        filename: att.filename,
        content:
          typeof att.content === 'string'
            ? att.content
            : Buffer.from(att.content).toString('base64'),
        content_type: att.contentType,
      })),
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    console.log('✅ Email sent successfully:', result.data?.id);
    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

/**
 * Strip HTML tags to create plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Email templates
 */
export const emailTemplates = {
  /**
   * Project invitation email
   */
  projectInvite: (params: {
    inviteEmail: string;
    projectName: string;
    inviterName?: string;
    inviterEmail: string;
    inviteLink: string;
  }) => ({
    to: params.inviteEmail,
    subject: `You've been invited to collaborate on "${params.projectName}"`,
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
            <p><strong>${params.inviterName || params.inviterEmail}</strong> has invited you to collaborate on their project:</p>
            <p style="font-size: 24px; font-weight: bold; color: #FF6347; margin: 20px 0;">"${params.projectName}"</p>
            <p>Rock N' Roll Basement is a collaborative platform where musicians create together in real-time with:</p>
            <ul>
              <li>Real-time chat powered by Ably</li>
              <li>HD video collaboration with Daily.co</li>
              <li>Collaborative songwriting tools</li>
              <li>Audio file sharing with Supabase Storage</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${params.inviteLink}" class="button">Accept Invitation</a>
            </p>
            <p style="font-size: 12px; color: #666;">Or copy this link: <br>${params.inviteLink}</p>
          </div>
          <div class="footer">
            <p>This invitation was sent to ${params.inviteEmail}</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
You've been invited to collaborate on "${params.projectName}"!

${params.inviterName || params.inviterEmail} has invited you to join their music project on Rock N' Roll Basement.

Accept the invitation here: ${params.inviteLink}

Rock N' Roll Basement is a collaborative platform for musicians with:
- Real-time chat powered by Ably
- HD video collaboration with Daily.co
- Collaborative songwriting tools
- Audio file sharing

If you didn't expect this invitation, you can safely ignore this email.
    `,
  }),

  /**
   * Split sheet email
   */
  splitSheet: (params: {
    recipientEmail: string;
    recipientName: string;
    songTitle: string;
    percentage: number;
    pdfData: string; // base64 encoded PDF
  }) => ({
    to: params.recipientEmail,
    subject: `Split Sheet for "${params.songTitle}"`,
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
          .percentage { font-size: 32px; font-weight: bold; color: #FF6347; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Split Sheet</h1>
          </div>
          <div class="content">
            <h2>Split Sheet for "${params.songTitle}"</h2>
            <p>Hi ${params.recipientName},</p>
            <p>Please find attached the ownership split sheet for <strong>"${params.songTitle}"</strong>.</p>
            <div class="percentage">Your Share: ${params.percentage}%</div>
            <p>Please review and sign the attached PDF document.</p>
            <p>If you have any questions or concerns about the split, please contact the project owner.</p>
            <br>
            <p>Best regards,<br>CronkWaters Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Split Sheet for "${params.songTitle}"

Hi ${params.recipientName},

Please find attached the ownership split sheet for "${params.songTitle}".

Your Share: ${params.percentage}%

Please review and sign the attached PDF document.

If you have any questions or concerns about the split, please contact the project owner.

Best regards,
CronkWaters Team
    `,
    attachments: [
      {
        filename: `${params.songTitle.replace(/[^a-z0-9]/gi, '_')}_Split_Sheet.pdf`,
        content: params.pdfData,
        contentType: 'application/pdf',
      },
    ],
  }),

  /**
   * General invitation email
   */
  invitation: (params: {
    email: string;
    inviterName?: string;
    inviteUrl: string;
    orgName?: string;
    projectName?: string;
  }) => ({
    to: params.email,
    subject: params.orgName
      ? `Invitation to join ${params.orgName}`
      : params.projectName
        ? `Invitation to join ${params.projectName}`
        : "You've been invited to CronkWaters",
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 CronkWaters</h1>
          </div>
          <div class="content">
            <h2>You've Been Invited!</h2>
            <p>Hi there,</p>
            ${params.inviterName ? `<p><strong>${params.inviterName}</strong> has invited you to join:` : "<p>You've been invited to join:"}
            ${params.orgName ? `<p style="font-size: 24px; font-weight: bold; color: #FF6347; margin: 20px 0;">${params.orgName}</p>` : ''}
            ${params.projectName ? `<p style="font-size: 24px; font-weight: bold; color: #FF6347; margin: 20px 0;">${params.projectName}</p>` : ''}
            <p style="text-align: center; margin: 30px 0;">
              <a href="${params.inviteUrl}" class="button">Accept Invitation</a>
            </p>
            <p style="font-size: 12px; color: #666;">Or copy this link: <br>${params.inviteUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
You've Been Invited!

${params.inviterName ? `${params.inviterName} has invited you to join:` : "You've been invited to join:"}
${params.orgName || params.projectName || 'CronkWaters'}

Accept the invitation here: ${params.inviteUrl}
    `,
  }),

  /**
   * Booking request notification
   */
  bookingRequest: (params: {
    musicianEmail: string;
    musicianName: string;
    venueName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    eventDate: string;
    eventType: string;
    location: string;
    budget?: string;
    message?: string;
    siteUrl: string;
  }) => ({
    to: params.musicianEmail,
    subject: `New Booking Request: ${params.venueName}`,
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
          .info-row { margin: 10px 0; }
          .info-label { font-weight: bold; color: #666; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #FF6347 0%, #FF4500 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎤 New Booking Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.musicianName},</h2>
            <p>You've received a new booking request!</p>
            <div class="info-row">
              <span class="info-label">Venue:</span> ${params.venueName}
            </div>
            <div class="info-row">
              <span class="info-label">Contact:</span> ${params.contactName} (${params.contactEmail})
            </div>
            ${params.contactPhone ? `<div class="info-row"><span class="info-label">Phone:</span> ${params.contactPhone}</div>` : ''}
            <div class="info-row">
              <span class="info-label">Event Date:</span> ${params.eventDate}
            </div>
            <div class="info-row">
              <span class="info-label">Event Type:</span> ${params.eventType}
            </div>
            <div class="info-row">
              <span class="info-label">Location:</span> ${params.location}
            </div>
            ${params.budget ? `<div class="info-row"><span class="info-label">Budget:</span> ${params.budget}</div>` : ''}
            ${params.message ? `<div class="info-row"><p><span class="info-label">Message:</span><br>${params.message}</p></div>` : ''}
            <p style="text-align: center;">
              <a href="${params.siteUrl}" class="button">View Booking Details</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Booking Request

Hi ${params.musicianName},

You've received a new booking request!

Venue: ${params.venueName}
Contact: ${params.contactName} (${params.contactEmail})
${params.contactPhone ? `Phone: ${params.contactPhone}` : ''}
Event Date: ${params.eventDate}
Event Type: ${params.eventType}
Location: ${params.location}
${params.budget ? `Budget: ${params.budget}` : ''}
${params.message ? `Message: ${params.message}` : ''}

View booking details: ${params.siteUrl}
    `,
  }),

  /**
   * Payment success notification
   */
  paymentSuccess: (params: {
    email: string;
    userName: string;
    amount: string;
    subscriptionTier: string;
    nextBillingDate?: string;
  }) => ({
    to: params.email,
    subject: 'Payment Successful - CronkWaters',
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
          .amount { font-size: 32px; font-weight: bold; color: #22c55e; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.userName},</h2>
            <p>Your payment has been processed successfully!</p>
            <div class="amount">$${params.amount}</div>
            <p><strong>Subscription:</strong> ${params.subscriptionTier}</p>
            ${params.nextBillingDate ? `<p><strong>Next billing date:</strong> ${params.nextBillingDate}</p>` : ''}
            <p>Thank you for your subscription to CronkWaters!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Payment Successful

Hi ${params.userName},

Your payment has been processed successfully!

Amount: $${params.amount}
Subscription: ${params.subscriptionTier}
${params.nextBillingDate ? `Next billing date: ${params.nextBillingDate}` : ''}

Thank you for your subscription to CronkWaters!
    `,
  }),

  /**
   * Payment failed notification
   */
  paymentFailed: (params: {
    email: string;
    userName: string;
    amount: string;
    subscriptionTier: string;
    retryDate?: string;
  }) => ({
    to: params.email,
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #FF6347 0%, #FF4500 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.userName},</h2>
            <p>We were unable to process your payment for your <strong>${params.subscriptionTier}</strong> subscription.</p>
            <p><strong>Amount:</strong> $${params.amount}</p>
            ${params.retryDate ? `<p>We'll automatically retry on: <strong>${params.retryDate}</strong></p>` : ''}
            <p>Please update your payment method to avoid service interruption.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/settings/billing" class="button">Update Payment Method</a>
            </p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Payment Failed - Action Required

Hi ${params.userName},

We were unable to process your payment for your ${params.subscriptionTier} subscription.

Amount: $${params.amount}
${params.retryDate ? `We'll automatically retry on: ${params.retryDate}` : ''}

Please update your payment method to avoid service interruption.

Update payment method: ${APP_URL}/settings/billing
    `,
  }),

  /**
   * Trial ending notification
   */
  trialEnding: (params: {
    email: string;
    userName: string;
    trialEndDate: string;
    subscriptionTier: string;
  }) => ({
    to: params.email,
    subject: 'Your Trial is Ending Soon',
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Trial Ending Soon</h1>
          </div>
          <div class="content">
            <h2>Hi ${params.userName},</h2>
            <p>Your <strong>${params.subscriptionTier}</strong> trial is ending on <strong>${params.trialEndDate}</strong>.</p>
            <p>To continue enjoying all the features of CronkWaters, please subscribe before your trial ends.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/settings/billing" class="button">Subscribe Now</a>
            </p>
            <p>Thank you for trying CronkWaters!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Trial Ending Soon

Hi ${params.userName},

Your ${params.subscriptionTier} trial is ending on ${params.trialEndDate}.

To continue enjoying all the features of CronkWaters, please subscribe before your trial ends.

Subscribe now: ${APP_URL}/settings/billing

Thank you for trying CronkWaters!
    `,
  }),
};
