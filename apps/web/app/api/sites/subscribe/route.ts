import { prisma } from '@cronkwaters/db';
import { randomBytes } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/sites/subscribe - Subscribe to mailing list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, email, name } = body;

    if (!siteId || !email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Verify site exists
    const site = await prisma.musicianSite.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if already subscribed
    const existing = await prisma.siteSubscriber.findUnique({
      where: {
        siteId_email: { siteId, email: email.toLowerCase() },
      },
    });

    if (existing) {
      if (existing.unsubscribed) {
        // Resubscribe
        await prisma.siteSubscriber.update({
          where: { id: existing.id },
          data: {
            unsubscribed: false,
            unsubscribedAt: null,
            confirmed: false,
            confirmToken: randomBytes(32).toString('hex'),
          },
        });
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Please check your email to confirm.',
        });
      }
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!',
      });
    }

    // Create new subscriber
    const confirmToken = randomBytes(32).toString('hex');
    await prisma.siteSubscriber.create({
      data: {
        siteId,
        email: email.toLowerCase(),
        name: name || null,
        confirmToken,
        confirmed: true, // For now, auto-confirm. In production, send confirmation email
        source: 'website',
      },
    });

    // Track mailing list signup in analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.siteAnalytics.upsert({
      where: {
        siteId_date: { siteId, date: today },
      },
      update: {
        mailingListSignups: { increment: 1 },
      },
      create: {
        siteId,
        date: today,
        mailingListSignups: 1,
      },
    });

    // In production, you would send a confirmation email here

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
    });
  } catch (error) {
    console.error('[SITE-SUBSCRIBE] Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
