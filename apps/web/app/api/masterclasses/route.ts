import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { strictLimiter } from '@/lib/rate-limit';
import { requireAuth, getCurrentUser } from '@/lib/session';

// GET - List masterclasses with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const format = searchParams.get('format');
    const level = searchParams.get('level');
    const isFree = searchParams.get('free') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const instructorId = searchParams.get('instructorId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build where clause
    const where: any = {
      status: 'published',
    };

    if (category) {
      where.category = category;
    }

    if (format) {
      where.format = format;
    }

    if (level && level !== 'all') {
      where.skillLevel = level;
    }

    if (isFree) {
      where.isFree = true;
    }

    if (featured) {
      where.featuredOrder = { not: null };
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    // Get masterclasses with pagination
    const [masterclasses, total] = await Promise.all([
      prisma.masterclass.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              displayName: true,
              headline: true,
              profileImage: true,
              verified: true,
              averageRating: true,
            },
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy: featured ? { featuredOrder: 'asc' } : { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.masterclass.count({ where }),
    ]);

    return NextResponse.json({
      masterclasses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses', method: 'GET' });
  }
}

// POST - Create a new masterclass (instructors only)
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rateLimitResult = await strictLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    // Auth required
    const user = await requireAuth();

    // Check if user is an instructor
    const instructor = await prisma.masterclassInstructor.findUnique({
      where: { userId: user.id },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'You must be a registered instructor to create masterclasses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      shortDesc,
      category,
      tags,
      skillLevel,
      format,
      isFree,
      price,
      originalPrice,
      accessDays,
      maxStudents,
      features,
      requirements,
      whatYouLearn,
      thumbnailUrl,
      promoVideoUrl,
      startDate,
      endDate,
      timezone,
    } = body;

    // Validate required fields
    if (!title || !description || !category || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, format' },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.masterclass.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create masterclass
    const masterclass = await prisma.masterclass.create({
      data: {
        instructorId: instructor.id,
        slug,
        title,
        subtitle,
        description,
        shortDesc,
        category,
        tags: tags || [],
        skillLevel: skillLevel || 'all',
        format,
        isFree: isFree || false,
        price: isFree ? null : price,
        originalPrice,
        accessDays,
        maxStudents,
        features: features || [],
        requirements: requirements || [],
        whatYouLearn: whatYouLearn || [],
        thumbnailUrl,
        promoVideoUrl,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        timezone,
        status: 'draft',
      },
      include: {
        instructor: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json({ masterclass }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/masterclasses', method: 'POST' });
  }
}
