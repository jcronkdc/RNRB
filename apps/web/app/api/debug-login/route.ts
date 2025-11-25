import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT - Creates a session token for testing
 * This endpoint creates a user and returns a session setup URL
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('[DEBUG-LOGIN] Attempting login for:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create a session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days from now

    // Create session in database
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    console.log('[DEBUG-LOGIN] Session created:', session.id);

    // Return the session token as a cookie-ready string
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      sessionToken,
      cookieValue: `next-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`,
    });
  } catch (error) {
    console.error('[DEBUG-LOGIN] Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

