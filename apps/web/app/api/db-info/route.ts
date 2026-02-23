import { NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOwner: true },
  });

  if (!user?.isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const dbUrl = process.env.DATABASE_URL || '';
  const urlMatch = dbUrl.match(/@([^/]+)\/([^?]+)/);
  const host = urlMatch ? urlMatch[1] : 'unknown';
  const database = urlMatch ? urlMatch[2] : 'unknown';

  return NextResponse.json({
    host: host.substring(0, 30) + '...',
    database,
    hasPassword: dbUrl.includes('password') || dbUrl.includes('npg_'),
    urlLength: dbUrl.length,
  });
}
