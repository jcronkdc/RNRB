/**
 * Service Bookings API
 *
 * Create and manage bookings between clients and providers
 * Handles payment via Stripe Connect with platform fee
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  });
}

const PLATFORM_FEE_PERCENT = 10;

/**
 * GET - List user's bookings (as client or provider)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'client'; // client or provider
    const status = searchParams.get('status');

    // Get provider ID if user is a provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    const where: any = {};

    if (role === 'provider' && provider) {
      where.providerId = provider.id;
    } else {
      where.clientId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.serviceBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: { title: true, categoryId: true },
        },
        provider: {
          select: { displayName: true, avatar: true, slug: true },
        },
        client: {
          select: { name: true, image: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('[BOOKINGS] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST - Create a new booking with payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, requirements, customPrice } = body;

    // Get service and provider
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: true,
      },
    });

    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (!service.provider.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: 'Provider has not completed payment setup' },
        { status: 400 }
      );
    }

    // Can't book your own service
    if (service.provider.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot book your own service' }, { status: 400 });
    }

    const price = customPrice || service.price;
    if (!price || price < 100) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const platformFee = Math.round(price * (PLATFORM_FEE_PERCENT / 100));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rocknrollbasement.com';

    // Create booking record
    const booking = await prisma.serviceBooking.create({
      data: {
        serviceId,
        providerId: service.providerId,
        clientId: session.user.id,
        price,
        platformFee,
        requirements,
        revisionsAllowed: service.revisions,
        deliveryDeadline: service.deliveryDays
          ? new Date(Date.now() + service.deliveryDays * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    // Create Stripe checkout session with Connect
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.title,
              description: `Service from ${service.provider.displayName}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: service.provider.stripeConnectId!,
        },
        metadata: {
          bookingId: booking.id,
          serviceId,
          providerId: service.providerId,
          clientId: session.user.id,
        },
      },
      success_url: `${baseUrl}/marketplace/bookings/${booking.id}?payment=success`,
      cancel_url: `${baseUrl}/marketplace/bookings/${booking.id}?payment=cancelled`,
      metadata: {
        bookingId: booking.id,
        type: 'marketplace_booking',
      },
    });

    // Update booking with payment intent
    await prisma.serviceBooking.update({
      where: { id: booking.id },
      data: {
        stripePaymentIntentId: checkoutSession.payment_intent as string,
      },
    });

    // Create initial system message
    await prisma.bookingMessage.create({
      data: {
        bookingId: booking.id,
        senderId: session.user.id,
        content: `Booking created for "${service.title}". ${requirements ? `Requirements: ${requirements}` : 'No specific requirements provided.'}`,
        isSystemMessage: true,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('[BOOKINGS] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
