import nodemailer, { type SentMessageInfo, type Transporter } from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
};

type EmailResult = { sent: true; id: string } | { sent: false; reason: string };

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!process.env.EMAIL_SERVER_URL) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport(process.env.EMAIL_SERVER_URL);
  }

  return cachedTransporter;
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<EmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('[EMAIL] EMAIL_SERVER_URL not configured. Email would have been sent:', {
      to: payload.to,
      subject: payload.subject,
    });
    return { sent: false, reason: 'EMAIL_SERVER_URL not configured' };
  }

  const fromAddress = payload.from ?? process.env.EMAIL_FROM ?? 'support@cronkwaters.com';

  try {
    const info: SentMessageInfo = await transporter.sendMail({
      from: fromAddress,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { sent: true, id: info.messageId ?? 'email-sent' };
  } catch (error) {
    console.error('[EMAIL] Failed to send transactional email', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}
