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

const DEFAULT_FROM = process.env.EMAIL_FROM || "Rock N' Roll Basement <onboarding@resend.dev>";
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
 * Rock N' Roll Basement Email Design System
 * Dark theme with warm accent colors matching the website
 */
const emailStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #e9e9ec;
    background: #0b0b0c;
    margin: 0;
    padding: 0;
  }
  
  .email-wrapper {
    background: #0b0b0c;
    padding: 40px 20px;
  }
  
  .email-container {
    max-width: 560px;
    margin: 0 auto;
    background: linear-gradient(180deg, #1e1e1e 0%, #161616 100%);
    border-radius: 16px;
    border: 1px solid #2f2f34;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  
  .email-header {
    background: linear-gradient(135deg, rgba(255, 99, 71, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%);
    border-bottom: 1px solid #2f2f34;
    padding: 32px;
    text-align: center;
  }
  
  .logo-container {
    margin-bottom: 16px;
  }
  
  .logo-text {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #ff6347 0%, #ffd700 50%, #ff6347 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }
  
  .tagline {
    font-size: 13px;
    color: #9c9ca5;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin: 8px 0 0;
  }
  
  .email-content {
    padding: 40px 32px;
  }
  
  .greeting {
    font-size: 15px;
    color: #b5b5c2;
    margin-bottom: 8px;
  }
  
  .main-heading {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
  }
  
  .highlight-box {
    background: rgba(255, 99, 71, 0.08);
    border: 1px solid rgba(255, 99, 71, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
    text-align: center;
  }
  
  .highlight-text {
    font-size: 20px;
    font-weight: 700;
    color: #ff6347;
    margin: 0;
  }
  
  .body-text {
    font-size: 15px;
    color: #b5b5c2;
    margin: 16px 0;
    line-height: 1.7;
  }
  
  .feature-list {
    list-style: none;
    padding: 0;
    margin: 20px 0;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    font-size: 14px;
    color: #e9e9ec;
    border-bottom: 1px solid #2f2f34;
  }
  
  .feature-item:last-child {
    border-bottom: none;
  }
  
  .feature-icon {
    color: #ff6347;
    margin-right: 12px;
    font-size: 16px;
  }
  
  .button-container {
    text-align: center;
    margin: 32px 0;
  }
  
  .primary-button {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #ff6347 0%, #ff4500 100%);
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
    border-radius: 999px;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 14px rgba(255, 99, 71, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .secondary-button {
    display: inline-block;
    padding: 12px 24px;
    background: transparent;
    border: 2px solid #ff6347;
    color: #ff6347 !important;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    border-radius: 999px;
    margin-left: 12px;
  }
  
  .link-fallback {
    font-size: 12px;
    color: #6b6b75;
    word-break: break-all;
    margin-top: 16px;
  }
  
  .link-fallback a {
    color: #ff6347;
  }
  
  .info-card {
    background: #1a1a1a;
    border: 1px solid #2f2f34;
    border-radius: 12px;
    padding: 16px 20px;
    margin: 16px 0;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #2f2f34;
  }
  
  .info-row:last-child {
    border-bottom: none;
  }
  
  .info-label {
    font-size: 13px;
    color: #6b6b75;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .info-value {
    font-size: 14px;
    color: #e9e9ec;
    font-weight: 500;
  }
  
  .amount-display {
    font-size: 36px;
    font-weight: 800;
    text-align: center;
    margin: 24px 0;
    letter-spacing: -0.02em;
  }
  
  .amount-success {
    color: #4ade80;
  }
  
  .amount-error {
    color: #ef4444;
  }
  
  .email-footer {
    background: #141414;
    border-top: 1px solid #2f2f34;
    padding: 24px 32px;
    text-align: center;
  }
  
  .footer-text {
    font-size: 12px;
    color: #6b6b75;
    margin: 4px 0;
  }
  
  .footer-brand {
    font-size: 13px;
    font-weight: 600;
    color: #9c9ca5;
    margin-bottom: 8px;
  }
  
  .social-links {
    margin: 16px 0;
  }
  
  .social-link {
    display: inline-block;
    margin: 0 8px;
    color: #6b6b75;
    text-decoration: none;
    font-size: 12px;
  }
  
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #2f2f34, transparent);
    margin: 24px 0;
  }
  
  .warning-box {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 12px;
    padding: 16px 20px;
    margin: 20px 0;
  }
  
  .warning-text {
    color: #fbbf24;
    font-size: 14px;
    margin: 0;
  }
  
  .success-box {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 12px;
    padding: 16px 20px;
    margin: 20px 0;
  }
  
  .success-text {
    color: #4ade80;
    font-size: 14px;
    margin: 0;
  }
`;

/**
 * Base email template wrapper
 */
function emailWrapper(content: string, footerNote?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="dark">
      <meta name="supported-color-schemes" content="dark">
      <title>Rock N' Roll Basement</title>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          ${content}
          <div class="email-footer">
            <div class="footer-brand">Rock N' Roll Basement</div>
            ${footerNote ? `<p class="footer-text">${footerNote}</p>` : ''}
            <p class="footer-text">Los Angeles, CA • The All-In-One Platform for Modern Musicians</p>
            <p class="footer-text" style="margin-top: 12px;">
              <a href="${APP_URL}" style="color: #ff6347; text-decoration: none;">Visit Website</a>
              &nbsp;•&nbsp;
              <a href="mailto:support@cronkwaters.com" style="color: #6b6b75; text-decoration: none;">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
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
    subject: `🎸 You've been invited to collaborate on "${params.projectName}"`,
    html: emailWrapper(
      `
      <div class="email-header">
        <div class="logo-container">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
        </div>
        <p class="tagline">Collaborative Music Creation</p>
      </div>
      <div class="email-content">
        <p class="greeting">Hey there,</p>
        <h2 class="main-heading">You've Been Invited to Collaborate!</h2>
        
        <p class="body-text">
          <strong style="color: #ffffff;">${params.inviterName || params.inviterEmail}</strong> 
          has invited you to join their music project:
        </p>
        
        <div class="highlight-box">
          <p class="highlight-text">"${params.projectName}"</p>
        </div>
        
        <p class="body-text">Join the session and start creating together with:</p>
        
        <ul class="feature-list">
          <li class="feature-item">
            <span class="feature-icon">🎹</span>
            Real-time collaborative songwriting
          </li>
          <li class="feature-item">
            <span class="feature-icon">📹</span>
            HD video sessions with up to 50 people
          </li>
          <li class="feature-item">
            <span class="feature-icon">💬</span>
            Instant messaging & voice notes
          </li>
          <li class="feature-item">
            <span class="feature-icon">🎵</span>
            Audio file sharing & version control
          </li>
        </ul>
        
        <div class="button-container">
          <a href="${params.inviteLink}" class="primary-button">Accept Invitation</a>
        </div>
        
        <p class="link-fallback">
          Or copy this link: <a href="${params.inviteLink}">${params.inviteLink}</a>
        </p>
      </div>
    `,
      `This invitation was sent to ${params.inviteEmail}`
    ),
    text: `
You've been invited to collaborate on "${params.projectName}"!

${params.inviterName || params.inviterEmail} has invited you to join their music project on Rock N' Roll Basement.

Accept the invitation here: ${params.inviteLink}

Rock N' Roll Basement is a collaborative platform for musicians with:
- Real-time collaborative songwriting
- HD video sessions with up to 50 people
- Instant messaging & voice notes
- Audio file sharing & version control

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
    subject: `📜 Split Sheet for "${params.songTitle}"`,
    html: emailWrapper(
      `
      <div class="email-header">
        <div class="logo-container">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
        </div>
        <p class="tagline">Split Sheet Document</p>
      </div>
      <div class="email-content">
        <p class="greeting">Hi ${params.recipientName},</p>
        <h2 class="main-heading">Your Split Sheet is Ready</h2>
        
        <p class="body-text">
          Please find attached the ownership split sheet for:
        </p>
        
        <div class="highlight-box">
          <p class="highlight-text">"${params.songTitle}"</p>
        </div>
        
        <div class="amount-display" style="color: #ff6347;">
          ${params.percentage}%
        </div>
        <p style="text-align: center; color: #6b6b75; font-size: 13px; margin-top: -12px;">Your Ownership Share</p>
        
        <div class="divider"></div>
        
        <p class="body-text">
          Please review and sign the attached PDF document. This split sheet documents your ownership 
          percentage and is important for royalty distribution and copyright registration.
        </p>
        
        <div class="info-card">
          <p style="color: #9c9ca5; font-size: 13px; margin: 0;">
            💡 <strong>Tip:</strong> Keep this document in a safe place. You'll need it for 
            PRO registration and any future licensing deals.
          </p>
        </div>
      </div>
    `,
      `Questions about this split? Contact the project owner directly.`
    ),
    text: `
Split Sheet for "${params.songTitle}"

Hi ${params.recipientName},

Please find attached the ownership split sheet for "${params.songTitle}".

Your Share: ${params.percentage}%

Please review and sign the attached PDF document. This split sheet documents your ownership percentage and is important for royalty distribution and copyright registration.

If you have any questions or concerns about the split, please contact the project owner.

Best regards,
Rock N' Roll Basement Team
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
      ? `🎸 Invitation to join ${params.orgName}`
      : params.projectName
        ? `🎸 Invitation to join ${params.projectName}`
        : "🎸 You've been invited to Rock N' Roll Basement",
    html: emailWrapper(
      `
      <div class="email-header">
        <div class="logo-container">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
        </div>
        <p class="tagline">You're Invited</p>
      </div>
      <div class="email-content">
        <p class="greeting">Hey there,</p>
        <h2 class="main-heading">You've Been Invited!</h2>
        
        ${params.inviterName ? `<p class="body-text"><strong style="color: #ffffff;">${params.inviterName}</strong> has invited you to join:</p>` : '<p class="body-text">You\'ve been invited to join:</p>'}
        
        ${
          params.orgName || params.projectName
            ? `
        <div class="highlight-box">
          <p class="highlight-text">${params.orgName || params.projectName}</p>
        </div>
        `
            : ''
        }
        
        <div class="button-container">
          <a href="${params.inviteUrl}" class="primary-button">Accept Invitation</a>
        </div>
        
        <p class="link-fallback">
          Or copy this link: <a href="${params.inviteUrl}">${params.inviteUrl}</a>
        </p>
      </div>
    `,
      `If you didn't expect this invitation, you can safely ignore this email.`
    ),
    text: `
You've Been Invited!

${params.inviterName ? `${params.inviterName} has invited you to join:` : "You've been invited to join:"}
${params.orgName || params.projectName || "Rock N' Roll Basement"}

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
    subject: `🎤 New Booking Request from ${params.venueName}`,
    html: emailWrapper(
      `
      <div class="email-header">
        <div class="logo-container">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
        </div>
        <p class="tagline">New Booking Request</p>
      </div>
      <div class="email-content">
        <p class="greeting">Hi ${params.musicianName},</p>
        <h2 class="main-heading">You've Got a Gig Request! 🎉</h2>
        
        <p class="body-text">A venue has reached out to book you for an event:</p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Venue</span>
            <span class="info-value" style="color: #ff6347;">${params.venueName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Event Date</span>
            <span class="info-value">${params.eventDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Event Type</span>
            <span class="info-value">${params.eventType}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location</span>
            <span class="info-value">${params.location}</span>
          </div>
          ${params.budget ? `<div class="info-row"><span class="info-label">Budget</span><span class="info-value" style="color: #4ade80;">${params.budget}</span></div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">Contact Information</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">${params.contactName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value"><a href="mailto:${params.contactEmail}" style="color: #ff6347;">${params.contactEmail}</a></span>
          </div>
          ${params.contactPhone ? `<div class="info-row"><span class="info-label">Phone</span><span class="info-value">${params.contactPhone}</span></div>` : ''}
        </div>
        
        ${params.message ? `<div class="info-card" style="margin-top: 16px;"><p style="color: #9c9ca5; font-size: 13px; margin: 0 0 8px;">Message from venue:</p><p style="color: #e9e9ec; font-size: 14px; margin: 0; font-style: italic;">"${params.message}"</p></div>` : ''}
        
        <div class="button-container">
          <a href="${params.siteUrl}" class="primary-button">View Details</a>
        </div>
      </div>
    `,
      `Respond quickly to secure the gig!`
    ),
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
    subject: `✅ Payment Successful - Rock N' Roll Basement`,
    html: emailWrapper(
      `
      <div class="email-header">
        <div class="logo-container">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
        </div>
        <p class="tagline">Payment Confirmed</p>
      </div>
      <div class="email-content">
        <p class="greeting">Hi ${params.userName},</p>
        <h2 class="main-heading">Payment Successful! 🎉</h2>
        
        <div class="success-box">
          <p class="success-text">Your payment has been processed successfully.</p>
        </div>
        
        <div class="amount-display amount-success">$${params.amount}</div>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Plan</span>
            <span class="info-value" style="color: #ff6347;">${params.subscriptionTier}</span>
          </div>
          ${params.nextBillingDate ? `<div class="info-row"><span class="info-label">Next Billing</span><span class="info-value">${params.nextBillingDate}</span></div>` : ''}
        </div>
        
        <p class="body-text">
          Thank you for subscribing to Rock N' Roll Basement! Your creative journey continues 
          with full access to all ${params.subscriptionTier} features.
        </p>
        
        <div class="button-container">
          <a href="${APP_URL}/dashboard" class="primary-button">Go to Dashboard</a>
        </div>
      </div>
    `,
      `Questions about your subscription? Contact support@cronkwaters.com`
    ),
    text: `
Payment Successful

Hi ${params.userName},

Your payment has been processed successfully!

Amount: $${params.amount}
Subscription: ${params.subscriptionTier}
${params.nextBillingDate ? `Next billing date: ${params.nextBillingDate}` : ''}

Thank you for your subscription to Rock N' Roll Basement!
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
    subject: `⚠️ Payment Failed - Action Required`,
    html: emailWrapper(
      `
      <div class="email-header" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);">
        <div class="logo-container">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
        </div>
        <p class="tagline">Payment Issue</p>
      </div>
      <div class="email-content">
        <p class="greeting">Hi ${params.userName},</p>
        <h2 class="main-heading">Payment Failed</h2>
        
        <div class="warning-box" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);">
          <p class="warning-text" style="color: #ef4444;">
            We were unable to process your payment for your ${params.subscriptionTier} subscription.
          </p>
        </div>
        
        <div class="amount-display amount-error">$${params.amount}</div>
        
        ${
          params.retryDate
            ? `
        <div class="info-card">
          <p style="color: #9c9ca5; font-size: 13px; margin: 0;">
            We'll automatically retry the payment on <strong style="color: #e9e9ec;">${params.retryDate}</strong>
          </p>
        </div>
        `
            : ''
        }
        
        <p class="body-text">
          To avoid any interruption to your service, please update your payment method as soon as possible.
        </p>
        
        <div class="button-container">
          <a href="${APP_URL}/settings/billing" class="primary-button">Update Payment Method</a>
        </div>
      </div>
    `,
      `Need help? Contact support@cronkwaters.com`
    ),
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
    subject: `⏰ Your ${params.subscriptionTier} Trial Ends Soon`,
    html: emailWrapper(
      `
      <div class="email-header">
        <div class="logo-container">
          <h1 class="logo-text">Rock N' Roll Basement</h1>
        </div>
        <p class="tagline">Trial Reminder</p>
      </div>
      <div class="email-content">
        <p class="greeting">Hi ${params.userName},</p>
        <h2 class="main-heading">Your Trial is Ending Soon</h2>
        
        <div class="warning-box">
          <p class="warning-text">
            Your <strong>${params.subscriptionTier}</strong> trial ends on <strong>${params.trialEndDate}</strong>
          </p>
        </div>
        
        <p class="body-text">
          Don't lose access to all the features you've been enjoying! Subscribe now to keep creating amazing music.
        </p>
        
        <ul class="feature-list">
          <li class="feature-item">
            <span class="feature-icon">✨</span>
            Keep all your projects and songs
          </li>
          <li class="feature-item">
            <span class="feature-icon">🎹</span>
            Continue using AI songwriting tools
          </li>
          <li class="feature-item">
            <span class="feature-icon">👥</span>
            Maintain your collaborations
          </li>
          <li class="feature-item">
            <span class="feature-icon">📹</span>
            HD video sessions & screen sharing
          </li>
        </ul>
        
        <div class="button-container">
          <a href="${APP_URL}/settings/billing" class="primary-button">Subscribe Now</a>
        </div>
        
        <p style="text-align: center; color: #6b6b75; font-size: 13px;">
          Thank you for trying Rock N' Roll Basement!
        </p>
      </div>
    `,
      `Questions? Contact support@cronkwaters.com`
    ),
    text: `
Trial Ending Soon

Hi ${params.userName},

Your ${params.subscriptionTier} trial is ending on ${params.trialEndDate}.

To continue enjoying all the features of Rock N' Roll Basement, please subscribe before your trial ends.

Subscribe now: ${APP_URL}/settings/billing

Thank you for trying Rock N' Roll Basement!
    `,
  }),
};
