import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Stalwart Mail Server API configuration
const STALWART_API_URL = process.env.STALWART_API_URL || 'http://mail.rnrb.me:8080';
const STALWART_ADMIN_USER = process.env.STALWART_ADMIN_USER || 'admin';
const STALWART_ADMIN_PASSWORD = process.env.STALWART_ADMIN_PASSWORD;

// Helper to call Stalwart API
async function stalwartFetch(endpoint: string, options: RequestInit = {}) {
  const auth = Buffer.from(`${STALWART_ADMIN_USER}:${STALWART_ADMIN_PASSWORD}`).toString('base64');
  const response = await fetch(`${STALWART_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
}

// Provision account on Stalwart mail server
async function provisionMailAccount(emailAddress: string, displayName: string, password: string) {
  try {
    const username = emailAddress.split('@')[0];
    const domain = emailAddress.split('@')[1];

    // First ensure domain exists
    await stalwartFetch('/api/principal', {
      method: 'POST',
      body: JSON.stringify({
        type: 'domain',
        name: domain,
      }),
    });

    // Create the user account
    const response = await stalwartFetch('/api/principal', {
      method: 'POST',
      body: JSON.stringify({
        type: 'individual',
        name: username,
        secrets: [password],
        emails: [emailAddress],
        description: displayName,
        quota: 1073741824, // 1GB default
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[STALWART] Failed to create account:', error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, mailServerId: data.data?.toString() };
  } catch (error) {
    console.error('[STALWART] Error provisioning account:', error);
    return { success: false, error };
  }
}

// Email domains we support
const SUPPORTED_DOMAINS = ['rnrb.me', 'rnrb.band', 'rnrb.app'];
const DEFAULT_DOMAIN = 'rnrb.me';

// Storage quotas by email tier (in bytes)
const EMAIL_TIER_CONFIG = {
  NONE: {
    accountLimit: 0,
    storageQuota: 0,
    canCreate: false,
    upgradeCta: 'Upgrade to a paid membership to get your @rnrb.me email',
  },
  BASIC: {
    accountLimit: 1,
    storageQuota: 1 * 1024 * 1024 * 1024, // 1GB
    canCreate: true,
    upgradeCta: 'Upgrade to Email Pro for unlimited accounts and 10GB storage',
  },
  PRO: {
    accountLimit: -1, // Unlimited
    storageQuota: 10 * 1024 * 1024 * 1024, // 10GB
    canCreate: true,
    upgradeCta: null,
  },
};

// Legacy storage quotas (for backwards compatibility)
const STORAGE_QUOTAS = {
  free: 0, // No email for free tier
  creator: 1 * 1024 * 1024 * 1024, // 1GB (Basic email included)
  studio: 10 * 1024 * 1024 * 1024, // 10GB (Pro email included)
  pro: 10 * 1024 * 1024 * 1024, // 10GB
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

    console.log('[EMAIL-API] Fetching email account for user:', session.user.id);

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

    // Get user's email tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        emailTier: true,
        emailProStatus: true,
        isOwner: true,
      },
    });

    console.log('[EMAIL-API] User tier info:', {
      subscriptionTier: user?.subscriptionTier,
      subscriptionStatus: user?.subscriptionStatus,
      emailTier: user?.emailTier,
      emailProStatus: user?.emailProStatus,
      isOwner: user?.isOwner,
    });

    // Determine effective email tier
    let effectiveEmailTier = user?.emailTier || 'NONE';
    if (user?.isOwner) {
      effectiveEmailTier = 'PRO';
    } else if (
      ['creator', 'studio'].includes(user?.subscriptionTier || '') &&
      user?.subscriptionStatus === 'active' &&
      effectiveEmailTier === 'NONE'
    ) {
      effectiveEmailTier = 'BASIC';
    } else if (user?.emailProStatus === 'active') {
      effectiveEmailTier = 'PRO';
    }

    const tierConfig = EMAIL_TIER_CONFIG[effectiveEmailTier as keyof typeof EMAIL_TIER_CONFIG];

    console.log('[EMAIL-API] Effective email tier:', effectiveEmailTier, 'Config:', tierConfig);

    if (!emailAccount) {
      console.log('[EMAIL-API] No email account found, returning creation info');
      return NextResponse.json({
        hasAccount: false,
        canCreate: tierConfig.canCreate,
        emailTier: effectiveEmailTier,
        upgradeCta: tierConfig.upgradeCta,
        availableDomains: SUPPORTED_DOMAINS,
      });
    }

    console.log('[EMAIL-API] Email account found:', emailAccount.emailAddress);
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
        recoveryEmail: emailAccount.recoveryEmail,
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

    // Get user with email tier info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        emailTier: true,
        emailProStatus: true,
        name: true,
        isOwner: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine email tier based on subscription
    let effectiveEmailTier = user.emailTier || 'NONE';

    // Platform owner gets PRO automatically
    if (user.isOwner) {
      effectiveEmailTier = 'PRO';
    }
    // Paid members (creator, studio) get BASIC if they don't have PRO
    else if (
      ['creator', 'studio'].includes(user.subscriptionTier) &&
      user.subscriptionStatus === 'active' &&
      effectiveEmailTier === 'NONE'
    ) {
      effectiveEmailTier = 'BASIC';
    }
    // Email Pro subscribers get PRO tier
    else if (user.emailProStatus === 'active') {
      effectiveEmailTier = 'PRO';
    }

    const tierConfig = EMAIL_TIER_CONFIG[effectiveEmailTier as keyof typeof EMAIL_TIER_CONFIG];

    // Check if user can create email accounts
    if (!tierConfig.canCreate) {
      return NextResponse.json(
        {
          error: 'Email not available on your plan',
          upgradeRequired: true,
          message: tierConfig.upgradeCta,
        },
        { status: 403 }
      );
    }

    // Check if user already has an email account
    const existingAccount = await prisma.emailAccount.findUnique({
      where: { userId: session.user.id },
    });

    // For BASIC tier, only 1 account allowed
    if (existingAccount && tierConfig.accountLimit === 1) {
      return NextResponse.json(
        {
          error: 'You already have an email account. Upgrade to Email Pro for unlimited accounts.',
        },
        { status: 400 }
      );
    }

    // For PRO tier, unlimited accounts allowed (but we still store only one per user in current model)
    if (existingAccount) {
      return NextResponse.json({ error: 'You already have an email account' }, { status: 400 });
    }

    const body = await request.json();
    const { username, domain = DEFAULT_DOMAIN, displayName, password, recoveryEmail } = body;

    // Validate recovery email (optional - falls back to platform email for password resets)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (recoveryEmail && typeof recoveryEmail === 'string') {
      // Validate recovery email format if provided
      if (!emailRegex.test(recoveryEmail)) {
        return NextResponse.json({ error: 'Invalid recovery email address' }, { status: 400 });
      }

      // Recovery email cannot be an @rnrb.me email (chicken/egg problem)
      if (recoveryEmail.toLowerCase().endsWith('@rnrb.me')) {
        return NextResponse.json(
          {
            error: 'Recovery email cannot be an @rnrb.me address. Use a different email provider.',
          },
          { status: 400 }
        );
      }
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Password requirements: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

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

    // Get storage quota from tier config
    const storageQuota = tierConfig.storageQuota;

    const emailAddress = `${username.toLowerCase()}@${domain}`;

    // Create account in database with optional recovery email
    // If not provided, password resets will fall back to the user's platform email
    const emailAccount = await prisma.emailAccount.create({
      data: {
        userId: session.user.id,
        emailAddress,
        username: username.toLowerCase(),
        domain,
        displayName: displayName || user.name || username,
        storageQuotaBytes: BigInt(storageQuota),
        status: 'PENDING',
        recoveryEmail: recoveryEmail ? recoveryEmail.toLowerCase() : null,
        recoveryEmailVerified: false, // Will be verified via confirmation email if recovery email is set
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

    // Use user-provided password for the mail server
    const mailPassword = password;

    // Provision account on Stalwart mail server
    const stalwartResult = await provisionMailAccount(
      emailAddress,
      displayName || user.name || username,
      mailPassword
    );

    if (!stalwartResult.success) {
      // If Stalwart fails, still create the account but mark as pending
      console.error('[EMAIL-API] Stalwart provisioning failed, account created locally');
    }

    // Update account status based on Stalwart result
    await prisma.emailAccount.update({
      where: { id: emailAccount.id },
      data: {
        status: stalwartResult.success ? 'ACTIVE' : 'PENDING',
        verifiedAt: stalwartResult.success ? new Date() : null,
        mailServerId: stalwartResult.mailServerId || null,
      },
    });

    // Store the password securely as an app password so user can log in
    if (stalwartResult.success) {
      await prisma.emailAppPassword.create({
        data: {
          emailAccountId: emailAccount.id,
          name: 'Primary Password',
          passwordHash: hashPassword(mailPassword),
        },
      });
    }

    return NextResponse.json({
      success: true,
      emailAddress,
      message: `Your email ${emailAddress} is ready! Use the password you chose to sign in.`,
      connectionSettings: {
        imap: { server: 'mail.rnrb.me', port: 993, security: 'SSL/TLS' },
        smtp: { server: 'mail.rnrb.me', port: 587, security: 'STARTTLS' },
      },
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
      recoveryEmail,
    } = body;

    // Validate forwarding address if provided
    if (forwardingEnabled && forwardingAddress) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(forwardingAddress)) {
        return NextResponse.json({ error: 'Invalid forwarding email address' }, { status: 400 });
      }
    }

    // Validate recovery email if provided
    if (recoveryEmail !== undefined && recoveryEmail !== null && recoveryEmail !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recoveryEmail)) {
        return NextResponse.json({ error: 'Invalid recovery email address' }, { status: 400 });
      }
      // Recovery email cannot be an @rnrb.me email
      if (recoveryEmail.toLowerCase().endsWith('@rnrb.me')) {
        return NextResponse.json(
          { error: 'Recovery email cannot be an @rnrb.me address' },
          { status: 400 }
        );
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
        ...(recoveryEmail !== undefined && {
          recoveryEmail: recoveryEmail || null,
          recoveryEmailVerified: false, // Reset verification when email changes
        }),
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
        recoveryEmail: updatedAccount.recoveryEmail,
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
