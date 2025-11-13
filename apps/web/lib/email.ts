/**
 * Email Service
 * 
 * Complete email functionality that works with or without
 * external email providers configured.
 */

interface EmailConfig {
  serverUrl?: string;
  from?: string;
  provider?: 'sendgrid' | 'smtp' | 'resend';
}

interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Get email configuration from environment
 */
export function getEmailConfig(): EmailConfig {
  return {
    serverUrl: process.env.EMAIL_SERVER_URL,
    from: process.env.EMAIL_FROM || 'noreply@cronkwater.vercel.app',
    provider: process.env.EMAIL_SERVER_URL?.includes('sendgrid') ? 'sendgrid' : 
              process.env.EMAIL_SERVER_URL?.includes('resend') ? 'resend' : 
              'smtp'
  };
}

/**
 * Send an email
 * Gracefully handles missing email configuration by logging in development
 */
export async function sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getEmailConfig();
  
  if (!config.serverUrl) {
    // In development/testing, just log the email
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email (simulated):', {
        to: message.to,
        from: message.from || config.from,
        subject: message.subject,
        preview: message.text?.substring(0, 100)
      });
      
      return { 
        success: true, 
        messageId: `sim_${Date.now()}` 
      };
    }
    
    // In production, return error if email is not configured
    return { 
      success: false, 
      error: 'Email service not configured' 
    };
  }

  try {
    // Parse SMTP URL
    const url = new URL(config.serverUrl);
    const [username, password] = (url.username && url.password) 
      ? [decodeURIComponent(url.username), decodeURIComponent(url.password)]
      : ['', ''];
    
    // Dynamic import of nodemailer to avoid loading when not needed
    const nodemailer = await import('nodemailer').catch(() => null);
    
    if (!nodemailer) {
      return { 
        success: false, 
        error: 'Email service not available' 
      };
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: url.hostname,
      port: parseInt(url.port || '587'),
      secure: url.protocol === 'smtps:',
      auth: username && password ? { user: username, pass: password } : undefined
    });

    // Send email
    const info = await transporter.sendMail({
      from: message.from || config.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo
    });

    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (error) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name?: string) {
  const subject = 'Welcome to CronkWaters!';
  const text = `
Hi ${name || 'there'},

Welcome to CronkWaters! We're excited to have you join our creative community.

Here's what you can do now:
- Create your first project
- Upload and organize your music assets
- Collaborate with other artists
- Track splits and royalties

If you have any questions, feel free to reach out to our support team.

Rock on!
The CronkWaters Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to CronkWaters!</h1>
    </div>
    <div class="content">
      <p>Hi ${name || 'there'},</p>
      <p>We're excited to have you join our creative community!</p>
      
      <h2>Here's what you can do now:</h2>
      <ul>
        <li>Create your first project</li>
        <li>Upload and organize your music assets</li>
        <li>Collaborate with other artists</li>
        <li>Track splits and royalties</li>
      </ul>
      
      <center>
        <a href="https://cronkwater.vercel.app/dashboard" class="button">Go to Dashboard</a>
      </center>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Rock on!<br>The CronkWaters Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send donation confirmation email
 */
export async function sendDonationConfirmation(
  email: string, 
  name: string, 
  amount: number, 
  isRecurring: boolean = false
) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  const subject = `Thank you for your ${isRecurring ? 'monthly' : ''} donation to CronkWaters!`;
  
  const text = `
Dear ${name},

Thank you for your generous ${isRecurring ? 'monthly' : ''} donation of ${formattedAmount} to the CronkWaters Foundation!

Your support helps us:
- Provide music education to underserved communities
- Support emerging artists with resources and mentorship
- Preserve and promote musical heritage
- Build collaborative tools for the next generation of musicians

${isRecurring ? 'Your monthly donation will be automatically processed on the same day each month. You can manage your subscription at any time from your donor dashboard.' : ''}

You'll receive a tax receipt at the end of the year for your records.

With gratitude,
The CronkWaters Foundation Team

This donation is tax-deductible to the extent allowed by law.
CronkWaters Foundation is a 501(c)(3) nonprofit organization.
EIN: XX-XXXXXXX
  `.trim();

  return sendEmail({ to: email, subject, text });
}

/**
 * Send collaboration invite email
 */
export async function sendCollaborationInvite(
  inviterName: string,
  inviterEmail: string,
  recipientEmail: string,
  projectName: string,
  inviteCode: string
) {
  const subject = `${inviterName} invited you to collaborate on "${projectName}"`;
  
  const text = `
Hi there!

${inviterName} has invited you to collaborate on their project "${projectName}" on CronkWaters.

To join the project, use this invite code: ${inviteCode}

Or click here to accept the invitation:
https://cronkwater.vercel.app/join?code=${inviteCode}

About CronkWaters:
CronkWaters is a collaborative music creation platform where artists can work together on songs, share assets, track splits, and manage their creative projects.

See you in the studio!
The CronkWaters Team
  `.trim();

  return sendEmail({ 
    to: recipientEmail, 
    subject, 
    text,
    replyTo: inviterEmail 
  });
}

/**
 * Send split agreement notification
 */
export async function sendSplitNotification(
  recipientEmail: string,
  recipientName: string,
  songTitle: string,
  percentage: number,
  role: string
) {
  const subject = `You've been added to the splits for "${songTitle}"`;
  
  const text = `
Hi ${recipientName},

You've been added to the split agreement for "${songTitle}" with the following details:

- Your share: ${percentage}%
- Your role: ${role}

Please log in to CronkWaters to review and confirm this split agreement:
https://cronkwater.vercel.app/splits

Once all parties have confirmed, this agreement will be finalized and ready for PRO submission.

Best regards,
The CronkWaters Team
  `.trim();

  return sendEmail({ to: recipientEmail, subject, text });
}
