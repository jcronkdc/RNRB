import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@cronkwaters/db';

// GET - Get instructor analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get instructor profile
    const instructor = await prisma.masterclassInstructor.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Not an instructor' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Get all courses
    const courses = await prisma.masterclass.findMany({
      where: { instructorId: instructor.id },
      include: {
        enrollments: {
          where: {
            enrolledAt: { gte: startDate },
          },
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        reviews: true,
        lessons: true,
      },
    });

    // Calculate overview stats
    const totalRevenue = courses.reduce((sum, course) => {
      return (
        sum +
        course.enrollments.reduce((enrollSum, enrollment) => {
          return enrollSum + Number(enrollment.pricePaid || 0);
        }, 0)
      );
    }, 0);

    const totalStudents = courses.reduce((sum, course) => sum + course.enrollments.length, 0);
    const totalCourses = courses.filter((c) => c.status === 'published').length;

    // Average rating
    const allReviews = courses.flatMap((c) => c.reviews);
    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    // Completion rate (would need lesson progress tracking)
    const completionRate = 68.5; // Placeholder

    // Revenue by month
    const revenueByMonth: Record<string, { revenue: number; enrollments: number }> = {};
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = months[d.getMonth()];
      revenueByMonth[key] = { revenue: 0, enrollments: 0 };
    }

    // Aggregate revenue by month
    courses.forEach((course) => {
      course.enrollments.forEach((enrollment) => {
        const month = months[new Date(enrollment.enrolledAt).getMonth()];
        if (revenueByMonth[month]) {
          revenueByMonth[month].revenue += Number(enrollment.pricePaid || 0);
          revenueByMonth[month].enrollments += 1;
        }
      });
    });

    // Top courses
    const topCourses = courses
      .map((course) => ({
        id: course.id,
        title: course.title,
        students: course.enrollments.length,
        revenue: course.enrollments.reduce((sum, e) => sum + Number(e.pricePaid || 0), 0),
        rating:
          course.reviews.length > 0
            ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
            : 0,
        completionRate: Number(course.completionRate) || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent enrollments
    const recentEnrollments = courses
      .flatMap((course) =>
        course.enrollments.map((enrollment) => ({
          id: enrollment.id,
          studentName: enrollment.user.name || 'Anonymous',
          courseName: course.title,
          amount: Number(enrollment.pricePaid || 0),
          enrolledAt: enrollment.enrolledAt.toISOString(),
        }))
      )
      .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
      .slice(0, 10);

    // Calculate change percentages (compare to previous period)
    const previousStart = new Date(startDate);
    const periodLength = now.getTime() - startDate.getTime();
    previousStart.setTime(previousStart.getTime() - periodLength);

    const previousCourses = await prisma.masterclass.findMany({
      where: { instructorId: instructor.id },
      include: {
        enrollments: {
          where: {
            enrolledAt: {
              gte: previousStart,
              lt: startDate,
            },
          },
        },
      },
    });

    const previousRevenue = previousCourses.reduce((sum, course) => {
      return (
        sum +
        course.enrollments.reduce((enrollSum, enrollment) => {
          return enrollSum + Number(enrollment.pricePaid || 0);
        }, 0)
      );
    }, 0);

    const previousStudents = previousCourses.reduce(
      (sum, course) => sum + course.enrollments.length,
      0
    );

    const revenueChange =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const studentsChange =
      previousStudents > 0 ? ((totalStudents - previousStudents) / previousStudents) * 100 : 0;

    return NextResponse.json({
      overview: {
        totalRevenue,
        totalStudents,
        totalCourses,
        averageRating,
        completionRate,
        revenueChange: Math.round(revenueChange * 10) / 10,
        studentsChange: Math.round(studentsChange * 10) / 10,
      },
      revenueByMonth: Object.entries(revenueByMonth).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        enrollments: data.enrollments,
      })),
      topCourses,
      recentEnrollments,
      studentActivity: [],
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
