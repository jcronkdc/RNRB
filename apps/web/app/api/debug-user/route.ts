import { prisma } from '@cronkwaters/db';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const testToken = url.searchParams.get('testToken') === 'true';

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const steps: string[] = [];

  try {
    // Step 1: Test user lookup
    steps.push('Looking up user...');
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true },
    });
    steps.push(user ? `User found: ${user.id}` : 'User not found');

    if (user && testToken) {
      // Step 2: Delete existing tokens
      steps.push('Deleting existing tokens...');
      const deleted = await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      steps.push(`Deleted ${deleted.count} existing tokens`);

      // Step 3: Create new token
      steps.push('Creating new token...');
      const token = crypto.randomBytes(48).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      const newToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          requestedIp: 'debug-test',
        },
      });
      steps.push(`Token created: ${newToken.id}`);
    }

    return NextResponse.json({
      success: true,
      userFound: !!user,
      user: user || null,
      steps,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        steps,
      },
      { status: 500 }
    );
  }
}
