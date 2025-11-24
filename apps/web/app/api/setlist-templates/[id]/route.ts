import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/setlist-templates/[id]
 * Get a specific template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = await db.setlistTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check access (built-in templates are public, custom templates require org membership)
    if (!template.isBuiltIn) {
      const membership = await db.membership.findUnique({
        where: {
          userId_orgId: {
            userId: user.id,
            orgId: template.orgId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

/**
 * PATCH /api/setlist-templates/[id]
 * Update a custom template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = await db.setlistTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Cannot edit built-in templates
    if (template.isBuiltIn) {
      return NextResponse.json({ error: 'Cannot edit built-in template' }, { status: 403 });
    }

    // Check access
    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: template.orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, targetDuration, energyLevel, filters, songIds } = body;

    const updated = await db.setlistTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(targetDuration !== undefined && { targetDuration }),
        ...(energyLevel !== undefined && { energyLevel }),
        ...(filters !== undefined && { filters }),
        ...(songIds !== undefined && { songIds }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

/**
 * DELETE /api/setlist-templates/[id]
 * Delete a custom template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = await db.setlistTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Cannot delete built-in templates
    if (template.isBuiltIn) {
      return NextResponse.json({ error: 'Cannot delete built-in template' }, { status: 403 });
    }

    // Check access
    const membership = await db.membership.findUnique({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: template.orgId,
        },
      },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await db.setlistTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}

