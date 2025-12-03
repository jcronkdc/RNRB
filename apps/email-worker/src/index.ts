/**
 * RNRB Email Worker
 *
 * Receives emails to support@rnrb.me and automatically:
 * 1. Creates a support ticket via the RNRB API
 * 2. Sends an auto-reply with the ticket number
 * 3. Forwards the original email to admin
 */

import PostalMime from 'postal-mime';

export interface Env {
  RNRB_API_URL: string;
  RNRB_API_KEY: string;
  ADMIN_EMAIL: string;
  SUPPORT_EMAIL: string;
}

interface TicketResponse {
  success: boolean;
  ticket?: {
    id: string;
    ticketNumber: string;
    subject: string;
  };
  error?: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[Email Worker] Received email from: ${message.from}`);
    console.log(`[Email Worker] To: ${message.to}`);
    console.log(`[Email Worker] Subject: ${message.headers.get('subject')}`);

    try {
      // Parse the email
      const parser = new PostalMime();
      const rawEmail = await new Response(message.raw).arrayBuffer();
      const parsed = await parser.parse(rawEmail);

      const fromEmail = message.from;
      const fromName = parsed.from?.name || fromEmail.split('@')[0];
      const subject = parsed.subject || 'No Subject';
      const textBody = parsed.text || '';
      const htmlBody = parsed.html || '';

      // Extract the plain text content (prefer text over HTML)
      let description = textBody;
      if (!description && htmlBody) {
        // Simple HTML to text conversion
        description = htmlBody
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
      }

      if (!description) {
        description = '(No message body)';
      }

      // Determine category from subject/content
      const category = categorizeEmail(subject, description);

      console.log(`[Email Worker] Creating ticket - Category: ${category}`);

      // Create support ticket via RNRB API
      const ticketResult = await createSupportTicket(env, {
        email: fromEmail,
        name: fromName,
        subject: subject,
        description: description,
        category: category,
        source: 'email',
      });

      if (ticketResult.success && ticketResult.ticket) {
        console.log(`[Email Worker] Ticket created: ${ticketResult.ticket.ticketNumber}`);

        // Send auto-reply
        await sendAutoReply(env, {
          to: fromEmail,
          toName: fromName,
          ticketNumber: ticketResult.ticket.ticketNumber,
          subject: subject,
        });

        console.log(`[Email Worker] Auto-reply sent to ${fromEmail}`);
      } else {
        console.error(`[Email Worker] Failed to create ticket: ${ticketResult.error}`);
      }

      // Always forward to admin
      await message.forward(env.ADMIN_EMAIL);
      console.log(`[Email Worker] Forwarded to admin: ${env.ADMIN_EMAIL}`);
    } catch (error) {
      console.error('[Email Worker] Error processing email:', error);

      // Still try to forward to admin on error
      try {
        await message.forward(env.ADMIN_EMAIL);
      } catch (forwardError) {
        console.error('[Email Worker] Failed to forward email:', forwardError);
      }
    }
  },
};

/**
 * Categorize the email based on subject and content
 */
function categorizeEmail(subject: string, body: string): string {
  const text = `${subject} ${body}`.toLowerCase();

  if (
    text.includes('bug') ||
    text.includes('error') ||
    text.includes('broken') ||
    text.includes('crash') ||
    text.includes('not working')
  ) {
    return 'BUG';
  }
  if (
    text.includes('feature') ||
    text.includes('request') ||
    text.includes('suggestion') ||
    text.includes('would be nice') ||
    text.includes('add')
  ) {
    return 'FEATURE_REQUEST';
  }
  if (
    text.includes('billing') ||
    text.includes('payment') ||
    text.includes('subscription') ||
    text.includes('charge') ||
    text.includes('refund')
  ) {
    return 'BILLING';
  }
  if (
    text.includes('account') ||
    text.includes('login') ||
    text.includes('password') ||
    text.includes('access') ||
    text.includes('sign in')
  ) {
    return 'ACCOUNT';
  }
  if (
    text.includes('how') ||
    text.includes('help') ||
    text.includes('question') ||
    text.includes('confused') ||
    text.includes('where')
  ) {
    return 'QUESTION';
  }

  return 'GENERAL';
}

/**
 * Create a support ticket via the RNRB API
 */
async function createSupportTicket(
  env: Env,
  data: {
    email: string;
    name: string;
    subject: string;
    description: string;
    category: string;
    source: string;
  }
): Promise<TicketResponse> {
  try {
    const response = await fetch(`${env.RNRB_API_URL}/api/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MCP-Server-Key': env.RNRB_API_KEY,
        'X-Email-Worker': 'true',
      },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: 'MEDIUM',
        metadata: {
          source: 'email-worker',
          originalSource: data.source,
        },
      }),
    });

    const result = (await response.json()) as TicketResponse;

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send an auto-reply email using MailChannels (free on Cloudflare Workers)
 */
async function sendAutoReply(
  env: Env,
  data: {
    to: string;
    toName: string;
    ticketNumber: string;
    subject: string;
  }
): Promise<void> {
  const replySubject = `Re: ${data.subject} [Ticket #${data.ticketNumber}]`;

  const textContent = `Hi ${data.toName},

Thank you for contacting Rock N' Roll Basement support!

Your request has been received and assigned ticket number: #${data.ticketNumber}

We'll review your message and get back to you as soon as possible. You can expect a response within 24-48 hours.

In the meantime, you can:
- Check our help center at https://rnrb.app/help
- View your ticket status by logging in at https://rnrb.app/settings/support

Original Subject: ${data.subject}

Rock on! 🎸
The RNRB Team

---
This is an automated message. Please do not reply directly to this email.
For updates on your ticket, log in to your RNRB account.`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e9e9ec; background: #0b0b0c; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, rgba(255, 99, 71, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; border: 1px solid #2f2f34; border-bottom: none; }
    .header h1 { color: #ff6347; margin: 0; font-size: 24px; font-weight: 800; }
    .ticket-badge { display: inline-block; background: linear-gradient(135deg, #ff6347 0%, #ff4500 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 15px; }
    .content { background: linear-gradient(180deg, #1e1e1e 0%, #161616 100%); padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #2f2f34; border-top: none; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b6b75; }
    a { color: #ff6347; }
    p { color: #b5b5c2; }
    strong { color: #ffffff; }
    ul { color: #b5b5c2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://rnrb.app/logo-dark.png" alt="Rock N' Roll Basement" style="height: 50px; width: auto; margin-bottom: 12px;">
      <div class="ticket-badge">Ticket #${data.ticketNumber}</div>
    </div>
    <div class="content">
      <p>Hi ${data.toName},</p>
      <p>Thank you for contacting Rock N' Roll Basement support!</p>
      <p>Your request has been received and assigned ticket number: <strong>#${data.ticketNumber}</strong></p>
      <p>We'll review your message and get back to you as soon as possible. You can expect a response within 24-48 hours.</p>
      <p><strong>In the meantime, you can:</strong></p>
      <ul>
        <li>Check our <a href="https://rnrb.app/help">help center</a></li>
        <li><a href="https://rnrb.app/settings/support">View your ticket status</a> by logging in</li>
      </ul>
      <p style="color: #6b6b75; font-size: 14px;"><strong>Original Subject:</strong> ${data.subject}</p>
      <p>Rock on! 🎸<br>The RNRB Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply directly to this email.</p>
      <p>For updates on your ticket, <a href="https://rnrb.app/settings/support">log in to your RNRB account</a>.</p>
    </div>
  </div>
</body>
</html>`;

  // Use MailChannels API (free for Cloudflare Workers)
  const sendRequest = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: data.to, name: data.toName }],
        },
      ],
      from: {
        email: env.SUPPORT_EMAIL,
        name: "Rock N' Roll Basement Support",
      },
      subject: replySubject,
      content: [
        {
          type: 'text/plain',
          value: textContent,
        },
        {
          type: 'text/html',
          value: htmlContent,
        },
      ],
    }),
  });

  const response = await fetch(sendRequest);

  if (!response.ok) {
    const error = await response.text();
    console.error('[Email Worker] MailChannels error:', error);
    throw new Error(`Failed to send auto-reply: ${response.status}`);
  }
}
