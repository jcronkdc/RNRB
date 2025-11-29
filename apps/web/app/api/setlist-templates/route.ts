import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/setlist-templates
 * Get all templates for the user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      select: { orgId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Get all templates (built-in + user-created)
    const templates = await db.setlistTemplate.findMany({
      where: {
        OR: [
          { orgId: membership.orgId }, // User's org templates
          { isBuiltIn: true }, // Built-in templates
        ],
      },
      orderBy: [{ isBuiltIn: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

/**
 * POST /api/setlist-templates
 * Create a new custom template
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, targetDuration, energyLevel, filters, songIds } = body;

    // Validation
    if (!name || !targetDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's organization
    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      select: { orgId: true, role: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Ensure user.id exists
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create template
    const template = await db.setlistTemplate.create({
      data: {
        name,
        description: description || null,
        targetDuration,
        energyLevel: energyLevel || null,
        filters: filters || null,
        songIds: songIds || [],
        orgId: membership.orgId,
        createdById: user.id,
        isBuiltIn: false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
