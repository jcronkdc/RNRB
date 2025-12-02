/**
 * Marketplace Providers API
 *
 * List and search service providers
 */

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@cronkwaters/db';

/**
 * GET - List providers with filtering/sorting
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'rating';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.services = {
        some: {
          category: {
            slug: category,
          },
          isActive: true,
        },
      };
    }

    // Build order by
    const orderBy: any = {};
    switch (sort) {
      case 'price':
        // Sort by lowest starting price
        orderBy.services = { _min: { price: 'asc' } };
        break;
      case 'reviews':
        orderBy.reviewCount = 'desc';
        break;
      case 'rating':
      default:
        orderBy.rating = 'desc';
        break;
    }

    const providers = await prisma.serviceProvider.findMany({
      where,
      orderBy: [orderBy, { completedJobs: 'desc' }],
      take: limit,
      skip: offset,
      include: {
        skills: {
          select: { skill: true },
        },
        services: {
          where: { isActive: true },
          select: {
            price: true,
            categoryId: true,
          },
          orderBy: { price: 'asc' },
          take: 1,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    const total = await prisma.serviceProvider.count({ where });

    // Transform response
    const transformed = providers.map((p) => ({
      id: p.id,
      slug: p.slug,
      displayName: p.displayName,
      tagline: p.tagline,
      avatar: p.avatar,
      location: p.location,
      isVerified: p.isVerified,
      isPro: p.isPro,
      rating: parseFloat(p.rating.toString()),
      reviewCount: p.reviewCount,
      completedJobs: p.completedJobs,
      responseTime: p.responseTime,
      skills: p.skills.map((s) => s.skill),
      startingPrice: p.services[0]?.price || null,
      categoryId: p.services[0]?.categoryId || null,
    }));

    return NextResponse.json({
      providers: transformed,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[MARKETPLACE_PROVIDERS] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
