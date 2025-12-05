import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { requireAuth } from '@/lib/session';

// POST /api/ecosystem/opportunities/[id]/apply - Apply to an opportunity
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();

    if (!session?.id) {
      return NextResponse.json({ error: 'You must be logged in to apply' }, { status: 401 });
    }

    const opportunity = await db.opportunity.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        allowApplications: true,
        postedById: true,
        title: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (opportunity.status !== 'open') {
      return NextResponse.json(
        { error: 'This opportunity is no longer accepting applications' },
        { status: 400 }
      );
    }

    if (!opportunity.allowApplications) {
      return NextResponse.json(
        { error: 'This opportunity does not accept applications' },
        { status: 400 }
      );
    }

    if (opportunity.postedById === session.id) {
      return NextResponse.json(
        { error: 'You cannot apply to your own opportunity' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await db.opportunityApplication.findFirst({
      where: {
        opportunityId: id,
        applicantId: session.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this opportunity' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Create application
    const application = await db.opportunityApplication.create({
      data: {
        opportunityId: id,
        applicantId: session.id,
        coverLetter: body.coverLetter || null,
        portfolioUrls: body.portfolioUrls || [],
        audioSamples: body.audioSamples || [],
        availability: body.availability || null,
        expectedPay: body.expectedPay ? parseFloat(body.expectedPay) : null,
        status: 'pending',
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get user info for notification
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    });

    // Create notification for opportunity poster
    await db.notification.create({
      data: {
        userId: opportunity.postedById,
        type: 'collab_invite',
        title: 'New Application',
        message: `${user?.name || 'Someone'} applied to your opportunity: ${opportunity.title}`,
        link: `/opportunities/${id}`,
        metadata: {
          opportunityId: id,
          applicationId: application.id,
          applicantId: session.id,
        },
      },
    });

    // Create activity event
    await db.activityEvent.create({
      data: {
        userId: session.id,
        type: 'opportunity_applied',
        title: 'Applied to Opportunity',
        opportunityId: id,
        metadata: {
          opportunityTitle: opportunity.title,
          applicationId: application.id,
        },
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

// GET /api/ecosystem/opportunities/[id]/apply - Get user's application status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth().catch(() => null);

    if (!session?.id) {
      return NextResponse.json({ hasApplied: false });
    }

    const application = await db.opportunityApplication.findFirst({
      where: {
        opportunityId: params.id,
        applicantId: session.id,
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json({ error: 'Failed to check application status' }, { status: 500 });
  }
}
