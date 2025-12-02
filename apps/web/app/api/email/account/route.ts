import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Stalwart Mail Server API configuration
const STALWART_API_URL = process.env.STALWART_API_URL || 'http://localhost:8080';
const STALWART_API_KEY = process.env.STALWART_API_KEY;

// Email domains we support
const SUPPORTED_DOMAINS = ['rnrb.me', 'rnrb.band', 'rnrb.app'];
const DEFAULT_DOMAIN = 'rnrb.me';

// Storage quotas by tier (in bytes)
const STORAGE_QUOTAS = {
  free: 1 * 1024 * 1024 * 1024, // 1GB
  creator: 10 * 1024 * 1024 * 1024, // 10GB
  studio: 50 * 1024 * 1024 * 1024, // 50GB
  pro: 100 * 1024 * 1024 * 1024, // 100GB
};

/**
 * GET /api/email/account
 * Get current user's email account
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emailAccount = await prisma.emailAccount.findUnique({
      where: { userId: session.user.id },
      include: {
        labels: {
          orderBy: { order: 'asc' },
        },
        appPasswords: {
          select: {
            id: true,
            name: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!emailAccount) {
      return NextResponse.json({
        hasAccount: false,
        availableDomains: SUPPORTED_DOMAINS,
      });
    }

    return NextResponse.json({
      hasAccount: true,
      account: {
        id: emailAccount.id,
        emailAddress: emailAccount.emailAddress,
        username: emailAccount.username,
        domain: emailAccount.domain,
        status: emailAccount.status,
        displayName: emailAccount.displayName,
        signature: emailAccount.signature,
        signatureHtml: emailAccount.signatureHtml,
        autoReplyEnabled: emailAccount.autoReplyEnabled,
        autoReplyMessage: emailAccount.autoReplyMessage,
        autoReplySubject: emailAccount.autoReplySubject,
        forwardingEnabled: emailAccount.forwardingEnabled,
        forwardingAddress: emailAccount.forwardingAddress,
        keepCopy: emailAccount.keepCopy,
        spamFilterLevel: emailAccount.spamFilterLevel,
        imapEnabled: emailAccount.imapEnabled,
        smtpEnabled: emailAccount.smtpEnabled,
        storageUsedBytes: emailAccount.storageUsedBytes.toString(),
        storageQuotaBytes: emailAccount.storageQuotaBytes.toString(),
        emailsSent: emailAccount.emailsSent,
        emailsReceived: emailAccount.emailsReceived,
        labels: emailAccount.labels,
        appPasswords: emailAccount.appPasswords,
        createdAt: emailAccount.createdAt,
      },
      // Connection settings for mail apps
      connectionSettings: {
        imap: {
          server: 'mail.rnrb.me',
          port: 993,
          security: 'SSL/TLS',
          username: emailAccount.emailAddress,
        },
        smtp: {
          server: 'mail.rnrb.me',
          port: 465,
          security: 'SSL/TLS',
          username: emailAccount.emailAddress,
        },
        jmap: {
          url: 'https://mail.rnrb.me/jmap',
        },
      },
    });
  } catch (error) {
    console.error('[EMAIL-API] Error fetching account:', error);
    return NextResponse.json({ error: 'Failed to fetch email account' }, { status: 500 });
  }
}

/**
 * POST /api/email/account
 * Create a new email account
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an email account
    const existingAccount = await prisma.emailAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (existingAccount) {
      return NextResponse.json({ error: 'You already have an email account' }, { status: 400 });
    }

    const body = await request.json();
    const { username, domain = DEFAULT_DOMAIN, displayName } = body;

    // Validate username
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Username validation rules
    const usernameRegex = /^[a-z0-9][a-z0-9._-]{2,29}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return NextResponse.json(
        {
          error:
            'Username must be 3-30 characters, start with a letter or number, and contain only letters, numbers, dots, underscores, or hyphens',
        },
        { status: 400 }
      );
    }

    // Check reserved usernames
    const reservedUsernames = [
      'admin',
      'administrator',
      'support',
      'help',
      'info',
      'contact',
      'noreply',
      'no-reply',
      'postmaster',
      'webmaster',
      'abuse',
      'security',
      'root',
      'system',
      'mail',
      'email',
      'rnrb',
      'rocknroll',
      'rock',
      'roll',
      'basement',
      'team',
      'staff',
      'hello',
      'hi',
      'sales',
      'billing',
      'legal',
      'press',
      'media',
      'news',
      'newsletter',
      'marketing',
      'api',
      'www',
      'ftp',
      'smtp',
      'imap',
      'pop',
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      return NextResponse.json({ error: 'This username is reserved' }, { status: 400 });
    }

    // Validate domain
    if (!SUPPORTED_DOMAINS.includes(domain)) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
    }

    // Check if username is already taken
    const existingUsername = await prisma.emailAccount.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUsername) {
      return NextResponse.json({ error: 'This username is already taken' }, { status: 400 });
    }

    // Get user's subscription tier for quota
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true, name: true },
    });

    const tier = (user?.subscriptionTier || 'free') as keyof typeof STORAGE_QUOTAS;
    const storageQuota = STORAGE_QUOTAS[tier] || STORAGE_QUOTAS.free;

    const emailAddress = `${username.toLowerCase()}@${domain}`;

    // Create account in database
    const emailAccount = await prisma.emailAccount.create({
      data: {
        userId: session.user.id,
        emailAddress,
        username: username.toLowerCase(),
        domain,
        displayName: displayName || user?.name || username,
        storageQuotaBytes: BigInt(storageQuota),
        status: 'PENDING',
      },
    });

    // Create default labels
    const defaultLabels = [
      { name: 'Inbox', isSystem: true, systemType: 'INBOX', order: 0 },
      { name: 'Sent', isSystem: true, systemType: 'SENT', order: 1 },
      { name: 'Drafts', isSystem: true, systemType: 'DRAFTS', order: 2 },
      { name: 'Starred', isSystem: true, systemType: 'STARRED', order: 3 },
      { name: 'Important', isSystem: true, systemType: 'IMPORTANT', order: 4 },
      { name: 'Spam', isSystem: true, systemType: 'SPAM', order: 5 },
      { name: 'Trash', isSystem: true, systemType: 'TRASH', order: 6 },
      // Musician-specific labels
      { name: 'Booking', isSystem: true, systemType: 'BOOKING', order: 7, color: '#22c55e' },
      { name: 'Fan Mail', isSystem: true, systemType: 'FAN_MAIL', order: 8, color: '#ec4899' },
      { name: 'Press', isSystem: true, systemType: 'PRESS', order: 9, color: '#3b82f6' },
      {
        name: 'Collaborations',
        isSystem: true,
        systemType: 'COLLABORATIONS',
        order: 10,
        color: '#f59e0b',
      },
    ];

    await prisma.emailLabel.createMany({
      data: defaultLabels.map((label) => ({
        emailAccountId: emailAccount.id,
        ...label,
        systemType: label.systemType as any,
      })),
    });

    // TODO: Provision account on Stalwart mail server
    // This will be implemented when the mail server is set up
    // await provisionMailAccount(emailAccount);

    // For now, mark as active (in production, wait for mail server confirmation)
    await prisma.emailAccount.update({
      where: { id: emailAccount.id },
      data: { status: 'ACTIVE', verifiedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      emailAddress,
      message: `Your email ${emailAddress} is ready!`,
    });
  } catch (error) {
    console.error('[EMAIL-API] Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create email account' }, { status: 500 });
  }
}

/**
 * PATCH /api/email/account
 * Update email account settings
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emailAccount = await prisma.emailAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!emailAccount) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      displayName,
      signature,
      signatureHtml,
      autoReplyEnabled,
      autoReplyMessage,
      autoReplySubject,
      forwardingEnabled,
      forwardingAddress,
      keepCopy,
      spamFilterLevel,
    } = body;

    // Validate forwarding address if provided
    if (forwardingEnabled && forwardingAddress) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(forwardingAddress)) {
        return NextResponse.json({ error: 'Invalid forwarding email address' }, { status: 400 });
      }
    }

    const updatedAccount = await prisma.emailAccount.update({
      where: { id: emailAccount.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(signature !== undefined && { signature }),
        ...(signatureHtml !== undefined && { signatureHtml }),
        ...(autoReplyEnabled !== undefined && { autoReplyEnabled }),
        ...(autoReplyMessage !== undefined && { autoReplyMessage }),
        ...(autoReplySubject !== undefined && { autoReplySubject }),
        ...(forwardingEnabled !== undefined && { forwardingEnabled }),
        ...(forwardingAddress !== undefined && { forwardingAddress }),
        ...(keepCopy !== undefined && { keepCopy }),
        ...(spamFilterLevel !== undefined && { spamFilterLevel }),
      },
    });

    // TODO: Sync settings to Stalwart mail server
    // await syncMailSettings(updatedAccount);

    return NextResponse.json({
      success: true,
      account: {
        displayName: updatedAccount.displayName,
        signature: updatedAccount.signature,
        signatureHtml: updatedAccount.signatureHtml,
        autoReplyEnabled: updatedAccount.autoReplyEnabled,
        autoReplyMessage: updatedAccount.autoReplyMessage,
        autoReplySubject: updatedAccount.autoReplySubject,
        forwardingEnabled: updatedAccount.forwardingEnabled,
        forwardingAddress: updatedAccount.forwardingAddress,
        keepCopy: updatedAccount.keepCopy,
        spamFilterLevel: updatedAccount.spamFilterLevel,
      },
    });
  } catch (error) {
    console.error('[EMAIL-API] Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update email account' }, { status: 500 });
  }
}

/**
 * Helper: Generate a secure app password
 */
function generateAppPassword(): string {
  // Generate 16-character password in groups of 4
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let password = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) password += '-';
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

/**
 * Helper: Hash password for storage
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
