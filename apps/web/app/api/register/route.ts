import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { authLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, logSecurityEvent } from '@/lib/security';

const OWNER_EMAIL = 'justincronk@pm.me';

export async function POST(request: Request) {
  try {
    // 🔒 RATE LIMITING: Prevent brute-force account creation (5 attempts per minute per IP)
    const clientIp = getClientIp(request);
    try {
      await checkRateLimit(authLimiter, `register:${clientIp}`);
    } catch {
      logSecurityEvent('rate_limit', {
        action: 'register',
        ip: clientIp,
      });
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Security: Limit request body size to prevent DoS attacks (max 1MB)
    const MAX_BODY_SIZE = 1024 * 1024; // 1MB
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    const body = await request.json();

    // Security: Validate body is an object and not too large
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { email: rawEmail, password, name } = body;

    // Validation
    if (!rawEmail || typeof rawEmail !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Normalize email: trim whitespace and lowercase
    const email = rawEmail.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json({ error: 'Password is too long' }, { status: 400 });
    }

    // Sanitize name
    const sanitizedName = name && typeof name === 'string' ? name.trim().substring(0, 100) : null;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (cost factor 12 for better security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (auto-flag platform owner)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: sanitizedName,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        profileCompleted: false,
        isOwner: email === OWNER_EMAIL,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'Account created successfully', user }, { status: 201 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[REGISTER] Error:', errMsg);
    if (error instanceof Error && error.stack) {
      console.error('[REGISTER] Stack:', error.stack);
    }

    let dbHost = 'PARSE_FAILED';
    try {
      dbHost = process.env.DATABASE_URL
        ? new URL(process.env.DATABASE_URL).host
        : 'NOT_SET';
    } catch { /* ignore */ }

    const actualUrl =
      process.env.NEON_DATABASE_URL_UNPOOLED ||
      process.env.NEON_DATABASE_URL ||
      process.env.DATABASE_URL || '';
    let actualHost = 'N/A';
    try { actualHost = new URL(actualUrl).host; } catch { /* */ }
    const src = process.env.NEON_DATABASE_URL_UNPOOLED ? 'UNPOOLED' :
      process.env.NEON_DATABASE_URL ? 'NEON' : 'DB_URL';

    return NextResponse.json(
      {
        error: 'Failed to create account. Please try again.',
        code: 'INTERNAL_ERROR',
        _dbg: `${errMsg} [src=${src}] [host=${actualHost}]`,
      },
      { status: 500 }
    );
  }
}
