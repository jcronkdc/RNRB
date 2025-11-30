import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check actual table name in database
    const result = (await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE 'user'
      LIMIT 5;
    `) as any[];

    return NextResponse.json({
      tables: result,
      hint: 'Check if table is User vs user (case matters!)',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
