import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GET /api/email/app-password
 * List all app passwords for the user's email account
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
        appPasswords: {
          select: {
            id: true,
            name: true,
            lastUsedAt: true,
            lastUsedIp: true,
            lastUsedAgent: true,
            createdAt: true,
            expiresAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!emailAccount) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    return NextResponse.json({
      appPasswords: emailAccount.appPasswords,
    });
  } catch (error) {
    console.error('[EMAIL-API] Error fetching app passwords:', error);
    return NextResponse.json({ error: 'Failed to fetch app passwords' }, { status: 500 });
  }
}

/**
 * POST /api/email/app-password
 * Create a new app password for third-party mail apps
 */
export async function POST(request: Request) {
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
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'App name is required (e.g., "iPhone Mail", "Thunderbird")' },
        { status: 400 }
      );
    }

    // Limit number of app passwords
    const existingCount = await prisma.emailAppPassword.count({
      where: { emailAccountId: emailAccount.id },
    });

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 app passwords allowed. Please delete an existing one first.' },
        { status: 400 }
      );
    }

    // Generate a secure app password
    const password = generateAppPassword();
    const passwordHash = hashPassword(password);

    // Create the app password record
    const appPassword = await prisma.emailAppPassword.create({
      data: {
        emailAccountId: emailAccount.id,
        name: name.trim(),
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      appPassword: {
        id: appPassword.id,
        name: appPassword.name,
        // IMPORTANT: This is the only time the password is shown!
        password: password,
        createdAt: appPassword.createdAt,
      },
      connectionInfo: {
        email: emailAccount.emailAddress,
        password: password,
        imap: {
          server: 'mail.rnrb.me',
          port: 993,
          security: 'SSL/TLS',
        },
        smtp: {
          server: 'mail.rnrb.me',
          port: 465,
          security: 'SSL/TLS',
        },
      },
      message:
        'Save this password now! It will only be shown once. Use it to connect your mail app.',
    });
  } catch (error) {
    console.error('[EMAIL-API] Error creating app password:', error);
    return NextResponse.json({ error: 'Failed to create app password' }, { status: 500 });
  }
}

/**
 * DELETE /api/email/app-password
 * Delete an app password
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const passwordId = searchParams.get('id');

    if (!passwordId) {
      return NextResponse.json({ error: 'Password ID is required' }, { status: 400 });
    }

    const emailAccount = await prisma.emailAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!emailAccount) {
      return NextResponse.json({ error: 'Email account not found' }, { status: 404 });
    }

    // Verify the password belongs to this user
    const appPassword = await prisma.emailAppPassword.findFirst({
      where: {
        id: passwordId,
        emailAccountId: emailAccount.id,
      },
    });

    if (!appPassword) {
      return NextResponse.json({ error: 'App password not found' }, { status: 404 });
    }

    await prisma.emailAppPassword.delete({
      where: { id: passwordId },
    });

    return NextResponse.json({
      success: true,
      message:
        'App password deleted. The connected app will no longer be able to access your email.',
    });
  } catch (error) {
    console.error('[EMAIL-API] Error deleting app password:', error);
    return NextResponse.json({ error: 'Failed to delete app password' }, { status: 500 });
  }
}

/**
 * Generate a secure app password in the format: xxxx-xxxx-xxxx-xxxx
 */
function generateAppPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments: string[] = [];

  for (let s = 0; s < 4; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      const randomBytes = crypto.randomBytes(1);
      segment += chars[randomBytes[0] % chars.length];
    }
    segments.push(segment);
  }

  return segments.join('-');
}

/**
 * Hash password using bcrypt-like approach
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}
