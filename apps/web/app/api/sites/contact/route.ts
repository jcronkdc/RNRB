import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/sites/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, name, email, subject, message, inquiryType } = body;

    if (!siteId || !name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify site exists
    const site = await prisma.musicianSite.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Save submission
    const submission = await prisma.siteContactSubmission.create({
      data: {
        siteId,
        name,
        email,
        subject: subject || null,
        message,
        inquiryType: inquiryType || null,
        status: 'new',
      },
    });

    // In production, you would also send an email notification here
    // For now, just save to database

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      id: submission.id,
    });
  } catch (error) {
    console.error('[SITE-CONTACT] Error:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
