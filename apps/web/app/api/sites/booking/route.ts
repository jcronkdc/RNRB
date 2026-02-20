import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subdomain,
      venueName,
      contactName,
      email,
      phone,
      eventDate,
      eventType,
      location,
      budget,
      message,
    } = body;

    // Validate required fields
    if (
      !subdomain ||
      !venueName ||
      !contactName ||
      !email ||
      !eventDate ||
      !eventType ||
      !location
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the site
    const site = await prisma.musicianSite.findUnique({
      where: { subdomain },
      include: { user: true },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Store the booking request as a contact submission with type 'booking'
    await prisma.siteContactSubmission.create({
      data: {
        siteId: site.id,
        name: `${contactName} (${venueName})`,
        email,
        message: JSON.stringify({
          venueName,
          contactName,
          phone: phone || null,
          eventDate,
          eventType,
          location,
          budget: budget || 'Not specified',
          message: message || '',
          type: 'booking_request',
        }),
      },
    });

    // Send email notification to the musician
    const siteUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001'}/sites/${subdomain}`;

    const emailOptions = emailTemplates.bookingRequest({
      musicianEmail: site.user.email,
      musicianName: site.user.name || 'Musician',
      venueName,
      contactName,
      contactEmail: email,
      contactPhone: phone,
      eventDate,
      eventType,
      location,
      budget,
      message,
      siteUrl,
    });

    const emailResult = await sendEmail(emailOptions);

    if (!emailResult.success) {
      console.warn('Failed to send booking notification email:', emailResult.error);
      // Still return success since booking was saved
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Booking submission error:', error);
    return NextResponse.json({ error: 'Failed to submit booking request' }, { status: 500 });
  }
}

// GET - Retrieve booking requests for a site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID required' }, { status: 400 });
    }

    const submissions = await prisma.siteContactSubmission.findMany({
      where: {
        siteId,
        message: { contains: '"type":"booking_request"' },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse the JSON message for each submission
    const bookings = submissions.map((s) => {
      try {
        const data = JSON.parse(s.message || '{}');
        return {
          id: s.id,
          ...data,
          submittedAt: s.createdAt,
        };
      } catch {
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          message: s.message,
          submittedAt: s.createdAt,
        };
      }
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
