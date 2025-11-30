import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Check if Prisma is imported
    console.log('[TEST] Prisma imported:', !!prisma);

    // Test 2: Check database connection
    const userCount = await prisma.user.count();
    console.log('[TEST] User count:', userCount);

    // Test 3: Check if password field exists in Prisma client
    const prismaFields = Object.keys((prisma.user as any).fields || {});
    console.log('[TEST] User model fields:', prismaFields);

    // Test 4: Try to create a test user
    const testEmail = `test-${Date.now()}@test.com`;
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: 'test_hash_123',
        name: 'Test User',
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    console.log('[TEST] User created:', testUser.id);

    // Clean up
    await prisma.user.delete({ where: { id: testUser.id } });

    return NextResponse.json({
      success: true,
      tests: {
        prismaImported: true,
        userCount,
        fields: prismaFields,
        passwordFieldExists: prismaFields.includes('password'),
        userCreated: true,
      },
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
