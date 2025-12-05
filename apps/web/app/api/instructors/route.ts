import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { checkStrictLimit } from '@/lib/rate-limit';
import { requireAuth, getCurrentUser } from '@/lib/session';

// GET - List instructors or get current user's instructor profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const verified = searchParams.get('verified') === 'true';
    const specialty = searchParams.get('specialty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const me = searchParams.get('me') === 'true';

    // If requesting own profile
    if (me) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ instructor: null });
      }

      const instructor = await prisma.masterclassInstructor.findUnique({
        where: { userId: user.id },
        include: {
          masterclasses: {
            orderBy: { createdAt: 'desc' },
            include: {
              _count: {
                select: { enrollments: true, reviews: true },
              },
            },
          },
          payouts: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      return NextResponse.json({ instructor });
    }

    // Build where clause for listing
    const where: any = {
      status: 'active',
    };

    if (featured) {
      where.featured = true;
    }

    if (verified) {
      where.verified = true;
    }

    if (specialty) {
      where.specialties = { has: specialty };
    }

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { headline: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [instructors, total] = await Promise.all([
      prisma.masterclassInstructor.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          headline: true,
          profileImage: true,
          coverImage: true,
          specialties: true,
          verified: true,
          featured: true,
          totalStudents: true,
          averageRating: true,
          reviewCount: true,
          _count: {
            select: { masterclasses: true },
          },
        },
        orderBy: featured
          ? [{ featured: 'desc' }, { totalStudents: 'desc' }]
          : { totalStudents: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.masterclassInstructor.count({ where }),
    ]);

    return NextResponse.json({
      instructors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/instructors', method: 'GET' });
  }
}

// POST - Become an instructor
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkStrictLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const user = await requireAuth();

    // Check if already an instructor
    const existing = await prisma.masterclassInstructor.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You are already registered as an instructor', instructor: existing },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      headline,
      bio,
      profileImage,
      coverImage,
      credentials,
      specialties,
      website,
      instagram,
      youtube,
      tiktok,
      spotify,
    } = body;

    // Validate required fields
    if (!displayName) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    // Create instructor profile
    const instructor = await prisma.masterclassInstructor.create({
      data: {
        userId: user.id,
        displayName,
        headline,
        bio,
        profileImage: profileImage || user.image,
        coverImage,
        credentials: credentials || [],
        specialties: specialties || [],
        website,
        instagram,
        youtube,
        tiktok,
        spotify,
        status: 'active',
      },
    });

    return NextResponse.json({ instructor }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/instructors', method: 'POST' });
  }
}

// PATCH - Update instructor profile
export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResult = await checkStrictLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const user = await requireAuth();

    const instructor = await prisma.masterclassInstructor.findUnique({
      where: { userId: user.id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'You are not registered as an instructor' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      headline,
      bio,
      profileImage,
      coverImage,
      credentials,
      specialties,
      website,
      instagram,
      youtube,
      tiktok,
      spotify,
    } = body;

    const updated = await prisma.masterclassInstructor.update({
      where: { id: instructor.id },
      data: {
        displayName,
        headline,
        bio,
        profileImage,
        coverImage,
        credentials,
        specialties,
        website,
        instagram,
        youtube,
        tiktok,
        spotify,
      },
    });

    return NextResponse.json({ instructor: updated });
  } catch (error) {
    return handleApiError(error, { route: '/api/instructors', method: 'PATCH' });
  }
}
