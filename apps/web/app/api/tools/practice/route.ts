/**
 * Practice Sessions API - Mycelial Integration
 * Track practice time with links to songs and goals
 */

import { NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';
import { requireAuth } from '@/lib/session';

// GET - Fetch user's practice sessions
export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const songId = searchParams.get('songId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { userId: user.id };

    if (songId) {
      where.songId = songId;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        (where.startTime as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.startTime as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const sessions = await prisma.practiceSession.findMany({
      where,
      include: {
        song: {
          select: { id: true, title: true, key: true, tempo: true },
        },
        goal: {
          select: { id: true, title: true, targetMinutes: true },
        },
      },
      orderBy: { startTime: 'desc' },
      take: limit,
    });

    // Calculate stats
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setDate(thisMonth.getDate() - 30);

    const [weekStats, monthStats, totalStats] = await Promise.all([
      prisma.practiceSession.aggregate({
        where: {
          userId: user.id,
          startTime: { gte: thisWeek },
        },
        _sum: { durationMinutes: true },
        _count: { id: true },
        _avg: { rating: true },
      }),
      prisma.practiceSession.aggregate({
        where: {
          userId: user.id,
          startTime: { gte: thisMonth },
        },
        _sum: { durationMinutes: true },
        _count: { id: true },
      }),
      prisma.practiceSession.aggregate({
        where: { userId: user.id },
        _sum: { durationMinutes: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      sessions,
      stats: {
        thisWeek: {
          totalMinutes: weekStats._sum.durationMinutes || 0,
          sessionCount: weekStats._count.id,
          avgRating: weekStats._avg.rating || 0,
        },
        thisMonth: {
          totalMinutes: monthStats._sum.durationMinutes || 0,
          sessionCount: monthStats._count.id,
        },
        allTime: {
          totalMinutes: totalStats._sum.durationMinutes || 0,
          sessionCount: totalStats._count.id,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching practice sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST - Create new practice session
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      startTime,
      endTime,
      songId,
      focusArea,
      instruments,
      rating,
      energyLevel,
      notes,
      goalId,
      goalProgress,
    } = body;

    if (!startTime) {
      return NextResponse.json({ error: 'Start time is required' }, { status: 400 });
    }

    // Calculate duration if end time provided
    let durationMinutes = null;
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: user.id,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        durationMinutes,
        songId: songId || null,
        focusArea: focusArea || null,
        instruments: instruments || [],
        rating: rating ? parseInt(rating) : null,
        energyLevel: energyLevel ? parseInt(energyLevel) : null,
        notes: notes || null,
        goalId: goalId || null,
        goalProgress: goalProgress ? parseInt(goalProgress) : null,
      },
      include: {
        song: {
          select: { id: true, title: true },
        },
        goal: {
          select: { id: true, title: true },
        },
      },
    });

    // Update goal progress if linked
    if (goalId && durationMinutes) {
      await prisma.practiceGoal.update({
        where: { id: goalId },
        data: {
          currentMinutes: {
            increment: durationMinutes,
          },
        },
      });
    }

    return NextResponse.json(practiceSession, { status: 201 });
  } catch (error) {
    console.error('Error creating practice session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// PUT - Update practice session (e.g., end session)
export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.practiceSession.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Process date fields
    if (updates.endTime) {
      updates.endTime = new Date(updates.endTime);
      // Calculate duration
      updates.durationMinutes = Math.round(
        (updates.endTime.getTime() - existing.startTime.getTime()) / 60000
      );
    }

    const practiceSession = await prisma.practiceSession.update({
      where: { id },
      data: updates,
      include: {
        song: {
          select: { id: true, title: true },
        },
        goal: {
          select: { id: true, title: true },
        },
      },
    });

    // Update goal progress if session was ended
    if (updates.durationMinutes && existing.goalId) {
      const oldDuration = existing.durationMinutes || 0;
      const diff = updates.durationMinutes - oldDuration;
      if (diff > 0) {
        await prisma.practiceGoal.update({
          where: { id: existing.goalId },
          data: {
            currentMinutes: {
              increment: diff,
            },
          },
        });
      }
    }

    return NextResponse.json(practiceSession);
  } catch (error) {
    console.error('Error updating practice session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// DELETE - Delete practice session
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.practiceSession.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update goal if linked
    if (existing.goalId && existing.durationMinutes) {
      await prisma.practiceGoal.update({
        where: { id: existing.goalId },
        data: {
          currentMinutes: {
            decrement: existing.durationMinutes,
          },
        },
      });
    }

    await prisma.practiceSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting practice session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
