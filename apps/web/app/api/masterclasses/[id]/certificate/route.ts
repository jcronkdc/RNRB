import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Generate certificate for completed course
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masterclassId = params.id;

    // Get enrollment with completion status
    const enrollment = await prisma.masterclassEnrollment.findFirst({
      where: {
        masterclassId,
        userId: session.user.id,
        status: 'active',
      },
      include: {
        masterclass: {
          include: {
            instructor: true,
            lessons: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this course' }, { status: 403 });
    }

    // Check if course is completed
    const totalLessons = enrollment.masterclass.lessons.length;

    const completedLessons = await prisma.masterclassProgress.count({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
    });

    if (completedLessons < totalLessons) {
      return NextResponse.json(
        {
          error: 'Course not completed',
          progress: {
            completed: completedLessons,
            total: totalLessons,
            percentage: Math.round((completedLessons / totalLessons) * 100),
          },
        },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    if (enrollment.certificateIssuedAt && enrollment.certificateUrl) {
      // Certificate already generated
      const certificateNumber = enrollment.certificateUrl.split('/').pop() || `MC-${enrollment.id}`;

      return NextResponse.json({
        certificate: {
          certificateNumber,
          issuedAt: enrollment.certificateIssuedAt,
          courseName: enrollment.masterclass.title,
          studentName: enrollment.user.name || 'Student',
          instructorName: enrollment.masterclass.instructor.displayName,
          instructorHeadline: enrollment.masterclass.instructor.headline,
          duration: enrollment.masterclass.totalDuration,
          lessonsCompleted: totalLessons,
          verificationUrl: enrollment.certificateUrl,
        },
      });
    }

    // Generate new certificate
    const certificateNumber = `MC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/${certificateNumber}`;

    // Update enrollment with certificate info
    await prisma.masterclassEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedAt: enrollment.completedAt || new Date(),
        certificateIssuedAt: new Date(),
        certificateUrl: verificationUrl,
      },
    });

    // Return certificate data
    return NextResponse.json({
      certificate: {
        certificateNumber,
        issuedAt: new Date(),
        courseName: enrollment.masterclass.title,
        studentName: enrollment.user.name || 'Student',
        instructorName: enrollment.masterclass.instructor.displayName,
        instructorHeadline: enrollment.masterclass.instructor.headline,
        duration: enrollment.masterclass.totalDuration,
        lessonsCompleted: totalLessons,
        verificationUrl,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
