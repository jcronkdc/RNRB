import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * This endpoint ensures the PasswordResetToken table exists.
 * It's a one-time initialization endpoint.
 */
export async function GET() {
  try {
    // Check if the table exists by trying to query it
    const tableCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PasswordResetToken'
      );
    `;

    const tableExists = tableCheck[0]?.exists;

    if (tableExists) {
      return NextResponse.json({
        success: true,
        message: 'PasswordResetToken table already exists',
      });
    }

    // Create the table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "tokenHash" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "usedAt" TIMESTAMP(3),
        "requestedIp" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
      )
    `;

    // Create indexes
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" 
      ON "PasswordResetToken"("tokenHash")
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" 
      ON "PasswordResetToken"("userId")
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" 
      ON "PasswordResetToken"("expiresAt")
    `;

    // Add foreign key constraint (check if it exists first)
    const fkCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PasswordResetToken_userId_fkey'
      )
    `;

    if (!fkCheck[0]?.exists) {
      await prisma.$executeRaw`
        ALTER TABLE "PasswordResetToken" 
        ADD CONSTRAINT "PasswordResetToken_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "User"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'PasswordResetToken table created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
