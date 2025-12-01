import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { handleApiError } from '@/lib/errors';
import { strictLimiter } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { createStripeCustomer } from '@/lib/stripe-subscriptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// POST - Enroll in masterclass (create checkout session or free enrollment)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rateLimitResult = await strictLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    const user = await requireAuth();
    const { id } = await params;

    // Get masterclass
    const masterclass = await prisma.masterclass.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            userId: true,
            payoutPercentage: true,
            stripeAccountId: true,
          },
        },
      },
    });

    if (!masterclass) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    if (masterclass.status !== 'published') {
      return NextResponse.json(
        { error: 'Masterclass is not available for enrollment' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.masterclassEnrollment.findUnique({
      where: {
        masterclassId_userId: {
          masterclassId: id,
          userId: user.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this masterclass', enrollment: existingEnrollment },
        { status: 400 }
      );
    }

    // Check capacity
    if (masterclass.maxStudents) {
      const enrollmentCount = await prisma.masterclassEnrollment.count({
        where: { masterclassId: id, status: 'active' },
      });
      if (enrollmentCount >= masterclass.maxStudents) {
        return NextResponse.json(
          { error: 'This masterclass is at full capacity' },
          { status: 400 }
        );
      }
    }

    // Get or create Stripe customer
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await createStripeCustomer(dbUser.email, dbUser.name);
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Handle FREE masterclass
    if (masterclass.isFree || !masterclass.price) {
      const enrollment = await prisma.masterclassEnrollment.create({
        data: {
          masterclassId: id,
          userId: user.id,
          status: 'active',
          pricePaid: 0,
          instructorShare: 0,
          platformShare: 0,
          accessStartsAt: new Date(),
          accessEndsAt: masterclass.accessDays
            ? new Date(Date.now() + masterclass.accessDays * 24 * 60 * 60 * 1000)
            : null,
          totalLessons: masterclass.lessonCount,
        },
      });

      // Update enrollment count
      await prisma.masterclass.update({
        where: { id },
        data: { enrollmentCount: { increment: 1 } },
      });

      // Update instructor stats
      await prisma.masterclassInstructor.update({
        where: { id: masterclass.instructorId },
        data: { totalStudents: { increment: 1 } },
      });

      return NextResponse.json({
        enrollment,
        message: 'Successfully enrolled in free masterclass',
      });
    }

    // Handle PAID masterclass - create Stripe checkout session
    const priceInCents = Math.round(Number(masterclass.price) * 100);
    const instructorSharePercent = masterclass.instructor.payoutPercentage || 70;
    const instructorShare = (priceInCents * instructorSharePercent) / 100;
    const platformShare = priceInCents - instructorShare;

    // Create or get Stripe product
    let stripeProductId = masterclass.stripeProductId;
    if (!stripeProductId) {
      const product = await stripe.products.create({
        name: masterclass.title,
        description: masterclass.shortDesc || masterclass.description?.substring(0, 500),
        images: masterclass.thumbnailUrl ? [masterclass.thumbnailUrl] : [],
        metadata: {
          masterclassId: id,
          instructorId: masterclass.instructorId,
        },
      });
      stripeProductId = product.id;
    }

    // Create or get Stripe price
    let stripePriceId = masterclass.stripePriceId;
    if (!stripePriceId) {
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceInCents,
        currency: masterclass.currency.toLowerCase(),
        metadata: {
          masterclassId: id,
        },
      });
      stripePriceId = price.id;

      // Save to masterclass
      await prisma.masterclass.update({
        where: { id },
        data: { stripeProductId, stripePriceId },
      });
    }

    // Create checkout session
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.cronkwaters.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/masterclasses/${masterclass.slug}?enrolled=true`,
      cancel_url: `${origin}/masterclasses/${masterclass.slug}?cancelled=true`,
      metadata: {
        type: 'masterclass_enrollment',
        masterclassId: id,
        userId: user.id,
        instructorId: masterclass.instructorId,
        instructorShare: instructorShare.toString(),
        platformShare: platformShare.toString(),
      },
      // If instructor has Stripe Connect, set up transfer
      ...(masterclass.instructor.stripeAccountId && {
        payment_intent_data: {
          transfer_data: {
            destination: masterclass.instructor.stripeAccountId,
            amount: Math.round(instructorShare), // Transfer instructor's share
          },
        },
      }),
    });

    // Create pending enrollment
    await prisma.masterclassEnrollment.create({
      data: {
        masterclassId: id,
        userId: user.id,
        status: 'pending',
        pricePaid: Number(masterclass.price),
        instructorShare: instructorShare / 100,
        platformShare: platformShare / 100,
        stripeSessionId: session.id,
        totalLessons: masterclass.lessonCount,
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses/[id]/enroll', method: 'POST' });
  }
}

// GET - Check enrollment status
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const enrollment = await prisma.masterclassEnrollment.findUnique({
      where: {
        masterclassId_userId: {
          masterclassId: id,
          userId: user.id,
        },
      },
      include: {
        progress: true,
        masterclass: {
          select: {
            id: true,
            title: true,
            slug: true,
            lessonCount: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ enrolled: false });
    }

    return NextResponse.json({
      enrolled: true,
      enrollment,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses/[id]/enroll', method: 'GET' });
  }
}
