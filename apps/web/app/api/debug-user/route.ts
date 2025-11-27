import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER TESTING
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const password = url.searchParams.get('password');

  if (!email) {
    return NextResponse.json({ error: 'Email param required' }, { status: 400 });
  }

  try {
    // Get database info
    const dbInfo = await prisma.$queryRaw<
      { current_database: string }[]
    >`SELECT current_database()`;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        createdAt: true,
      },
    });

    // Count total users
    const userCount = await prisma.user.count();

    // Test bcrypt comparison if password provided
    let bcryptTest = null;
    if (password && user?.password) {
      try {
        const isValid = await bcrypt.compare(password, user.password);
        bcryptTest = {
          passwordProvided: password,
          isValid,
          hashAlgorithm: user.password.substring(0, 4),
        };
      } catch (bcryptError) {
        bcryptTest = {
          error: bcryptError instanceof Error ? bcryptError.message : String(bcryptError),
        };
      }
    }

    return NextResponse.json({
      database: dbInfo[0]?.current_database,
      userCount,
      userFound: !!user,
      userDetails: user
        ? {
            id: user.id,
            email: user.email,
            hasPassword: !!user.password,
            passwordLength: user.password?.length,
            passwordPrefix: user.password?.substring(0, 10),
            createdAt: user.createdAt,
          }
        : null,
      bcryptTest,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Database query failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
