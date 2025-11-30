/**
 * Practice Goals API - Mycelial Integration
 * Set and track practice goals
 */

import { NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';
import { requireAuth } from '@/lib/session';

// GET - Fetch user's practice goals
export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: Record<string, unknown> = { userId: user.id };
    if (activeOnly) {
      where.isActive = true;
    }

    const goals = await prisma.practiceGoal.findMany({
      where,
      include: {
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 5,
          select: {
            id: true,
            startTime: true,
            durationMinutes: true,
            rating: true,
          },
        },
        _count: {
          select: { sessions: true },
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching practice goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST - Create new practice goal
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, description, targetMinutes, period, startDate, endDate } = body;

    if (!title || !targetMinutes) {
      return NextResponse.json({ error: 'Title and target minutes are required' }, { status: 400 });
    }

    const goal = await prisma.practiceGoal.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        targetMinutes: parseInt(targetMinutes),
        period: period || 'weekly',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
        currentMinutes: 0,
        streak: 0,
        longestStreak: 0,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating practice goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// PUT - Update practice goal
export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.practiceGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Process date fields
    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    // Check if goal completed
    if (updates.isActive === false && existing.isActive) {
      updates.completedAt = new Date();
    }

    const goal = await prisma.practiceGoal.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating practice goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

// DELETE - Delete practice goal
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.practiceGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Unlink sessions before deleting
    await prisma.practiceSession.updateMany({
      where: { goalId: id },
      data: { goalId: null },
    });

    await prisma.practiceGoal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting practice goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
