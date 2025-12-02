import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, streamPlatform, streamUrl, followers, why } = body;

    // Validate required fields
    if (!name || !email || !streamPlatform || !streamUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if application already exists
    const existingApplication = await prisma.affiliateApplication.findUnique({
      where: { email },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique affiliate code
    const affiliateCode = `RNRB-${nanoid(8).toUpperCase()}`;

    // Create the application
    const application = await prisma.affiliateApplication.create({
      data: {
        name,
        email,
        streamPlatform,
        streamUrl,
        followers: followers || null,
        motivation: why || null,
        affiliateCode,
        status: 'PENDING',
      },
    });

    // TODO: Send confirmation email to applicant
    // TODO: Send notification to admin

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id,
    });
  } catch (error) {
    console.error('Error creating affiliate application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
