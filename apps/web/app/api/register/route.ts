import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    console.log('[REGISTER] Request received:', { email: email?.substring(0, 3) + '***', hasPassword: !!password, hasName: !!name });
    console.log('[REGISTER] Environment check:', {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      prismaImported: !!prisma
    });

    // Validation
    if (!email || !password) {
      console.log('[REGISTER] Validation failed: missing email or password');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      console.log('[REGISTER] Validation failed: password too short');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    console.log('[REGISTER] Checking for existing user...');
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('[REGISTER] User already exists');
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    console.log('[REGISTER] Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[REGISTER] Password hashed successfully');

    console.log('[REGISTER] Creating user in database...');
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        subscriptionTier: 'free', // Start with free tier
        subscriptionStatus: 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    console.log('[REGISTER] User created successfully:', user.id);
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] ERROR:', error);
    console.error('[REGISTER] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[REGISTER] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[REGISTER] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to create account',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  }
}

