/**
 * Create Service Provider Profile
 *
 * Creates a new provider profile and optionally initiates Stripe Connect onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a provider profile
    const existing = await prisma.serviceProvider.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({
        slug: existing.slug,
        message: 'Profile already exists',
      });
    }

    const body = await request.json();
    const { displayName, tagline, category } = body;

    if (!displayName || displayName.length < 2) {
      return NextResponse.json(
        { error: 'Display name is required (min 2 characters)' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let attempts = 0;
    while (attempts < 10) {
      const exists = await prisma.serviceProvider.findUnique({ where: { slug } });
      if (!exists) break;
      slug = `${baseSlug}-${nanoid(4)}`;
      attempts++;
    }

    // Create provider profile
    const provider = await prisma.serviceProvider.create({
      data: {
        userId: session.user.id,
        slug,
        displayName,
        tagline: tagline || null,
        isActive: false, // Start inactive until setup is complete
      },
    });

    // If category provided, create initial service listing
    if (category) {
      const categoryRecord = await prisma.serviceCategory.findUnique({
        where: { slug: category },
      });

      if (categoryRecord) {
        await prisma.service.create({
          data: {
            providerId: provider.id,
            categoryId: categoryRecord.id,
            title: `${displayName} - ${categoryRecord.name}`,
            isActive: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      slug: provider.slug,
      id: provider.id,
    });
  } catch (error) {
    console.error('[CREATE_PROVIDER] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
