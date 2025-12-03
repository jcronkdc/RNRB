import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

/**
 * ADMIN ENDPOINT - Create user or set password
 *
 * This endpoint handles accounts lost during database migration.
 * It will create the user if they don't exist, or update their password if they do.
 *
 * Protected by ADMIN_PASSWORD_RESET_KEY environment variable.
 *
 * Usage: POST /api/admin/set-password
 * Body: { email, password, name?, adminKey }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, adminKey, subscriptionTier } = body;

    // SECURITY: Require admin key from environment
    const expectedKey = process.env.ADMIN_PASSWORD_RESET_KEY;

    if (!expectedKey) {
      console.error('[ADMIN] ADMIN_PASSWORD_RESET_KEY not configured');
      return NextResponse.json(
        { error: 'Admin endpoint not configured. Set ADMIN_PASSWORD_RESET_KEY in Vercel.' },
        { status: 500 }
      );
    }

    if (adminKey !== expectedKey) {
      console.error('[ADMIN] Invalid admin key attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validation
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (!password && !subscriptionTier) {
      return NextResponse.json({ error: 'Password or subscriptionTier required' }, { status: 400 });
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, isOwner: true },
    });

    if (existingUser) {
      // User exists - update their password and/or subscription
      console.log('[ADMIN] Updating user:', {
        id: existingUser.id,
        email: existingUser.email,
        hadPassword: !!existingUser.password,
        newTier: subscriptionTier,
      });

      const updateData: Record<string, unknown> = {};
      if (password) {
        updateData.password = hashedPassword;
      }
      if (subscriptionTier) {
        updateData.subscriptionTier = subscriptionTier;
        updateData.subscriptionStatus = 'active';
      }

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
        select: { id: true, email: true, name: true, isOwner: true, subscriptionTier: true },
      });

      console.log('[ADMIN] User updated successfully:', existingUser.email);

      return NextResponse.json({
        success: true,
        action: 'updated',
        message: password ? 'Password updated successfully' : 'User updated successfully',
        user: updatedUser,
      });
    } else {
      // User doesn't exist - create them
      if (!password) {
        return NextResponse.json({ error: 'Password required for new user' }, { status: 400 });
      }

      console.log('[ADMIN] Creating new user:', email, 'with tier:', subscriptionTier || 'free');

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          subscriptionTier: subscriptionTier || 'free',
          subscriptionStatus: 'active',
          isOwner: email === 'justincronk@pm.me', // Platform owner
          profileCompleted: false,
        },
        select: { id: true, email: true, name: true, isOwner: true, subscriptionTier: true },
      });

      console.log('[ADMIN] User created successfully:', newUser.email);

      return NextResponse.json({
        success: true,
        action: 'created',
        message: 'User created with password',
        user: newUser,
      });
    }
  } catch (error) {
    console.error('[ADMIN] Error:', error);
    return NextResponse.json(
      {
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check user status and test password (for debugging)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const testPassword = url.searchParams.get('testPassword');
    const adminKey = url.searchParams.get('adminKey');

    // SECURITY: Require admin key
    const expectedKey = process.env.ADMIN_PASSWORD_RESET_KEY;

    if (!expectedKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isOwner: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        profileCompleted: true,
        createdAt: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'User not found in database',
      });
    }

    // If testPassword provided, verify it
    let passwordVerification = null;
    if (testPassword && user.password) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      passwordVerification = {
        tested: true,
        isValid,
        passwordHashLength: user.password.length,
        passwordHashPrefix: user.password.substring(0, 10) + '...',
      };
    }

    return NextResponse.json({
      exists: true,
      hasPassword: !!user.password,
      passwordVerification,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isOwner: user.isOwner,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Check user error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
