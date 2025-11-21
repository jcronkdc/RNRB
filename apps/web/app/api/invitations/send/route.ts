import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, orgId, projectId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!orgId && !projectId) {
      return NextResponse.json(
        { error: 'Either orgId or projectId is required' },
        { status: 400 }
      );
    }

    // Verify sender has permission to invite
    if (orgId) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_orgId: {
            userId: session.user.id,
            orgId,
          },
        },
      });

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return NextResponse.json(
          { error: 'You do not have permission to invite users to this organization' },
          { status: 403 }
        );
      }
    }

    if (projectId) {
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId,
          },
        },
      });

      if (!projectMember || (projectMember.role !== 'owner' && projectMember.role !== 'admin')) {
        return NextResponse.json(
          { error: 'You do not have permission to invite users to this project' },
          { status: 403 }
        );
      }
    }

    // Check if user is already a member
    if (orgId) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            where: { orgId },
          },
        },
      });

      if (existingUser?.memberships.length) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        );
      }
    }

    if (projectId) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          projectMemberships: {
            where: { projectId },
          },
        },
      });

      if (existingUser?.projectMemberships.length) {
        return NextResponse.json(
          { error: 'User is already a member of this project' },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        ...(orgId && { orgId }),
        ...(projectId && { projectId }),
        status: 'pending',
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    
    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        senderId: session.user.id,
        ...(orgId && { orgId }),
        ...(projectId && { projectId }),
      },
      include: {
        org: true,
        project: true,
      },
    });

    // TODO: Send email with invitation link
    // For now, return the invitation URL
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;
    
    console.log('Invitation created:', { inviteUrl, invitation });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteUrl,
      },
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}






