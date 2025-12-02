import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Shared secret for standalone app authentication
// SECURITY: No fallback - require explicit configuration
const SYNC_SECRET = process.env.EMAIL_SYNC_SECRET;

// Verify the request is from our standalone mail app
function verifyRequest(request: Request): boolean {
  // SECURITY: Fail closed if secret is not configured
  if (!SYNC_SECRET) {
    console.error('[EMAIL-SYNC] EMAIL_SYNC_SECRET not configured - rejecting request');
    return false;
  }

  const authHeader = request.headers.get('X-Sync-Auth');
  if (!authHeader) return false;

  // Simple HMAC verification
  const [timestamp, signature] = authHeader.split(':');
  if (!timestamp || !signature) return false;

  // Check timestamp is within 5 minutes
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (isNaN(requestTime) || Math.abs(now - requestTime) > 5 * 60 * 1000) return false;

  // Verify signature using timing-safe comparison
  const expectedSignature = crypto
    .createHmac('sha256', SYNC_SECRET)
    .update(timestamp)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * POST /api/email/sync
 * Sync activity from standalone webmail app
 */
export async function POST(request: Request) {
  try {
    // Verify request authenticity
    if (!verifyRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, email, data } = body;

    if (!event || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the email account
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { emailAddress: email },
      include: { user: true },
    });

    if (!emailAccount) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    // Handle different event types
    switch (event) {
      case 'email_sent': {
        // Increment emails sent counter
        await prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: {
            emailsSent: { increment: 1 },
            updatedAt: new Date(),
          },
        });

        // Create activity entry if we have activity tracking
        // await createActivity(emailAccount.userId, 'email_sent', data);

        console.log(`[EMAIL-SYNC] Email sent from ${email}`);
        break;
      }

      case 'email_received': {
        // Increment emails received counter
        await prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: {
            emailsReceived: { increment: data?.count || 1 },
            updatedAt: new Date(),
          },
        });

        console.log(`[EMAIL-SYNC] ${data?.count || 1} email(s) received for ${email}`);
        break;
      }

      case 'login': {
        // Track login activity
        console.log(`[EMAIL-SYNC] User logged in: ${email} from standalone app`);
        break;
      }

      case 'storage_update': {
        // Update storage usage
        if (data?.storageUsedBytes !== undefined) {
          await prisma.emailAccount.update({
            where: { id: emailAccount.id },
            data: {
              storageUsedBytes: BigInt(data.storageUsedBytes),
              updatedAt: new Date(),
            },
          });
          console.log(`[EMAIL-SYNC] Storage updated for ${email}: ${data.storageUsedBytes} bytes`);
        }
        break;
      }

      default:
        console.log(`[EMAIL-SYNC] Unknown event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EMAIL-SYNC] Error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

/**
 * GET /api/email/sync
 * Get account info for standalone app
 */
export async function GET(request: Request) {
  try {
    // Verify request authenticity
    if (!verifyRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find the email account
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { emailAddress: email },
      select: {
        id: true,
        emailAddress: true,
        displayName: true,
        signature: true,
        signatureHtml: true,
        storageQuotaBytes: true,
        storageUsedBytes: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!emailAccount) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      account: {
        id: emailAccount.id,
        email: emailAccount.emailAddress,
        displayName: emailAccount.displayName || emailAccount.user?.name,
        signature: emailAccount.signature,
        signatureHtml: emailAccount.signatureHtml,
        avatar: emailAccount.user?.image,
        storageQuota: emailAccount.storageQuotaBytes.toString(),
        storageUsed: emailAccount.storageUsedBytes.toString(),
      },
    });
  } catch (error) {
    console.error('[EMAIL-SYNC] Error:', error);
    return NextResponse.json({ error: 'Failed to get account info' }, { status: 500 });
  }
}
