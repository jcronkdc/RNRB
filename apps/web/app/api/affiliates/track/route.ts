import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, action } = body;

    if (!code) {
      return NextResponse.json({ error: 'Affiliate code required' }, { status: 400 });
    }

    // Find affiliate by code
    const affiliate = await prisma.affiliate.findUnique({
      where: { code },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });
    }

    // Track click
    if (action === 'click') {
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          totalClicks: { increment: 1 },
        },
      });

      // Log click event
      await prisma.affiliateClick.create({
        data: {
          affiliateId: affiliate.id,
          ipHash: hashIP(request.headers.get('x-forwarded-for') || 'unknown'),
          userAgent: request.headers.get('user-agent') || 'unknown',
          referrer: request.headers.get('referer') || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking affiliate:', error);
    return NextResponse.json({ error: 'Failed to track affiliate' }, { status: 500 });
  }
}

function hashIP(ip: string): string {
  // Simple hash for privacy - in production use crypto
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
