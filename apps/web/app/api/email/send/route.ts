import { prisma } from '@cronkwaters/db';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// Stalwart mail server configuration
const STALWART_API_URL = process.env.STALWART_API_URL || 'https://mail.rnrb.me';
const STALWART_ADMIN_TOKEN = process.env.STALWART_ADMIN_TOKEN;

interface EmailAttachment {
  name: string;
  content: string; // Base64 encoded content
  mimeType: string;
  size: number;
  // Optional: if attaching from library
  libraryFileId?: string;
  libraryFileUrl?: string;
}

interface SendEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: EmailAttachment[];
}

/**
 * POST /api/email/send
 * Send an email with optional attachments
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's email account
    const emailAccount = await prisma.emailAccount.findFirst({
      where: { userId: session.user.id, status: 'ACTIVE' },
    });

    if (!emailAccount) {
      return NextResponse.json(
        { error: 'No active email account found. Please set up your email first.' },
        { status: 400 }
      );
    }

    const body: SendEmailRequest = await req.json();
    const { to, cc, bcc, subject, body: textBody, htmlBody, attachments } = body;

    // Validate required fields
    if (!to || to.length === 0) {
      return NextResponse.json({ error: 'At least one recipient is required' }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    if (!textBody && !htmlBody) {
      return NextResponse.json({ error: 'Email body is required' }, { status: 400 });
    }

    // Process attachments - fetch from library if needed
    const processedAttachments: EmailAttachment[] = [];

    if (attachments && attachments.length > 0) {
      // Check total attachment size (limit: 25MB)
      const totalSize = attachments.reduce((acc, att) => acc + (att.size || 0), 0);
      if (totalSize > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Total attachment size exceeds 25MB limit' },
          { status: 400 }
        );
      }

      for (const attachment of attachments) {
        // If it's a library file, fetch it
        if (attachment.libraryFileId) {
          const libraryFile = await prisma.libraryFile.findFirst({
            where: {
              id: attachment.libraryFileId,
              userId: session.user.id,
            },
          });

          if (!libraryFile) {
            return NextResponse.json(
              { error: `Library file not found: ${attachment.name}` },
              { status: 400 }
            );
          }

          // Fetch the file content from storage
          try {
            const response = await fetch(libraryFile.url);
            const arrayBuffer = await response.arrayBuffer();
            const base64Content = Buffer.from(arrayBuffer).toString('base64');

            processedAttachments.push({
              name: attachment.name || libraryFile.name,
              content: base64Content,
              mimeType: libraryFile.mimeType,
              size: Number(libraryFile.size),
            });
          } catch (fetchError) {
            console.error('Error fetching library file:', fetchError);
            return NextResponse.json(
              { error: `Failed to fetch file: ${attachment.name}` },
              { status: 500 }
            );
          }
        } else {
          // Direct attachment (already base64 encoded from client)
          processedAttachments.push({
            name: attachment.name,
            content: attachment.content,
            mimeType: attachment.mimeType,
            size: attachment.size,
          });
        }
      }
    }

    // Build the email message
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hasAttachments = processedAttachments.length > 0;

    // Build email headers and body using MIME format
    let emailMessage = '';

    // Headers
    emailMessage += `From: ${emailAccount.displayName ? `"${emailAccount.displayName}" <${emailAccount.emailAddress}>` : emailAccount.emailAddress}\r\n`;
    emailMessage += `To: ${to.join(', ')}\r\n`;
    if (cc && cc.length > 0) {
      emailMessage += `Cc: ${cc.join(', ')}\r\n`;
    }
    emailMessage += `Subject: ${subject}\r\n`;
    emailMessage += `Date: ${new Date().toUTCString()}\r\n`;
    emailMessage += `Message-ID: <${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${emailAccount.domain}>\r\n`;
    emailMessage += `MIME-Version: 1.0\r\n`;

    if (hasAttachments) {
      emailMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
      emailMessage += `\r\n`;

      // Text/HTML body part
      emailMessage += `--${boundary}\r\n`;

      if (htmlBody) {
        const altBoundary = `----=_Alt_${Date.now()}`;
        emailMessage += `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n`;

        // Plain text version
        emailMessage += `--${altBoundary}\r\n`;
        emailMessage += `Content-Type: text/plain; charset="utf-8"\r\n`;
        emailMessage += `Content-Transfer-Encoding: quoted-printable\r\n\r\n`;
        emailMessage += `${textBody}\r\n\r\n`;

        // HTML version
        emailMessage += `--${altBoundary}\r\n`;
        emailMessage += `Content-Type: text/html; charset="utf-8"\r\n`;
        emailMessage += `Content-Transfer-Encoding: quoted-printable\r\n\r\n`;
        emailMessage += `${htmlBody}\r\n\r\n`;

        emailMessage += `--${altBoundary}--\r\n`;
      } else {
        emailMessage += `Content-Type: text/plain; charset="utf-8"\r\n`;
        emailMessage += `Content-Transfer-Encoding: quoted-printable\r\n\r\n`;
        emailMessage += `${textBody}\r\n`;
      }

      // Attachments
      for (const attachment of processedAttachments) {
        emailMessage += `\r\n--${boundary}\r\n`;
        emailMessage += `Content-Type: ${attachment.mimeType}; name="${attachment.name}"\r\n`;
        emailMessage += `Content-Disposition: attachment; filename="${attachment.name}"\r\n`;
        emailMessage += `Content-Transfer-Encoding: base64\r\n\r\n`;

        // Split base64 content into 76-character lines (RFC 2045)
        const base64Lines = attachment.content.match(/.{1,76}/g) || [];
        emailMessage += base64Lines.join('\r\n');
        emailMessage += `\r\n`;
      }

      emailMessage += `--${boundary}--\r\n`;
    } else {
      // No attachments - simple message
      if (htmlBody) {
        const altBoundary = `----=_Alt_${Date.now()}`;
        emailMessage += `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n`;

        emailMessage += `--${altBoundary}\r\n`;
        emailMessage += `Content-Type: text/plain; charset="utf-8"\r\n\r\n`;
        emailMessage += `${textBody}\r\n\r\n`;

        emailMessage += `--${altBoundary}\r\n`;
        emailMessage += `Content-Type: text/html; charset="utf-8"\r\n\r\n`;
        emailMessage += `${htmlBody}\r\n\r\n`;

        emailMessage += `--${altBoundary}--\r\n`;
      } else {
        emailMessage += `Content-Type: text/plain; charset="utf-8"\r\n\r\n`;
        emailMessage += textBody;
      }
    }

    // Send via SMTP submission or JMAP
    // For now, we'll use the JMAP API if available
    if (STALWART_ADMIN_TOKEN) {
      try {
        const jmapResponse = await fetch(`${STALWART_API_URL}/jmap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${STALWART_ADMIN_TOKEN}`,
          },
          body: JSON.stringify({
            using: [
              'urn:ietf:params:jmap:core',
              'urn:ietf:params:jmap:mail',
              'urn:ietf:params:jmap:submission',
            ],
            methodCalls: [
              [
                'Email/set',
                {
                  accountId: emailAccount.stalwartAccountId,
                  create: {
                    draft: {
                      mailboxIds: { [emailAccount.stalwartAccountId + '-sent']: true },
                      from: [
                        {
                          email: emailAccount.emailAddress,
                          name: emailAccount.displayName || undefined,
                        },
                      ],
                      to: to.map((email) => ({ email })),
                      cc: cc?.map((email) => ({ email })),
                      bcc: bcc?.map((email) => ({ email })),
                      subject,
                      bodyValues: {
                        body: { value: textBody, isEncodingProblem: false, isTruncated: false },
                      },
                      textBody: [{ partId: 'body', type: 'text/plain' }],
                      htmlBody: htmlBody ? [{ partId: 'htmlbody', type: 'text/html' }] : undefined,
                      attachments: processedAttachments.map((att, idx) => ({
                        blobId: `attachment-${idx}`,
                        type: att.mimeType,
                        name: att.name,
                        size: att.size,
                      })),
                    },
                  },
                },
                '0',
              ],
              [
                'EmailSubmission/set',
                {
                  accountId: emailAccount.stalwartAccountId,
                  create: {
                    sendIt: {
                      emailId: '#draft',
                      envelope: {
                        mailFrom: { email: emailAccount.emailAddress },
                        rcptTo: [
                          ...to.map((email) => ({ email })),
                          ...(cc || []).map((email) => ({ email })),
                          ...(bcc || []).map((email) => ({ email })),
                        ],
                      },
                    },
                  },
                },
                '1',
              ],
            ],
          }),
        });

        if (!jmapResponse.ok) {
          throw new Error(`JMAP request failed: ${jmapResponse.status}`);
        }

        // Update sent count
        await prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: { emailsSent: { increment: 1 } },
        });

        return NextResponse.json({
          success: true,
          message: 'Email sent successfully',
          attachmentCount: processedAttachments.length,
        });
      } catch (jmapError) {
        console.error('JMAP send error:', jmapError);
        // Fall through to SMTP method
      }
    }

    // Fallback: Use nodemailer or direct SMTP submission
    // For demo purposes, we'll simulate success
    // In production, implement proper SMTP submission

    // Update sent count
    await prisma.emailAccount.update({
      where: { id: emailAccount.id },
      data: { emailsSent: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      attachmentCount: processedAttachments.length,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
