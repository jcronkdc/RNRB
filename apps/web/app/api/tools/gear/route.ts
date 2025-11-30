/**
 * Gear Inventory API - Mycelial Integration
 * Full CRUD for musician gear with database persistence
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/session';

// GET - Fetch user's gear inventory
export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { userId: user.id };
    if (category && category !== 'all') {
      where.category = category;
    }

    const gear = await db.gearItem.findMany({
      where,
      orderBy: [{ isFavorite: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });

    // Calculate totals
    const totals = await db.gearItem.aggregate({
      where: { userId: user.id },
      _sum: {
        purchasePrice: true,
        currentValue: true,
        insuranceValue: true,
      },
      _count: { id: true },
    });

    return NextResponse.json({
      gear,
      stats: {
        totalItems: totals._count.id,
        totalPurchaseValue: totals._sum.purchasePrice || 0,
        totalCurrentValue: totals._sum.currentValue || 0,
        totalInsuranceValue: totals._sum.insuranceValue || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching gear:', error);
    return NextResponse.json({ error: 'Failed to fetch gear' }, { status: 500 });
  }
}

// POST - Create new gear item
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      name,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      currentValue,
      condition,
      location,
      notes,
      tags,
      imageUrl,
      insured,
      insurancePolicy,
      insuranceValue,
    } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const gear = await db.gearItem.create({
      data: {
        userId: user.id,
        name,
        category,
        brand: brand || null,
        model: model || null,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        currentValue: currentValue ? parseFloat(currentValue) : null,
        condition: condition || 'good',
        location: location || null,
        notes: notes || null,
        tags: tags || [],
        imageUrl: imageUrl || null,
        insured: insured || false,
        insurancePolicy: insurancePolicy || null,
        insuranceValue: insuranceValue ? parseFloat(insuranceValue) : null,
      },
    });

    return NextResponse.json(gear, { status: 201 });
  } catch (error) {
    console.error('Error creating gear:', error);
    return NextResponse.json({ error: 'Failed to create gear' }, { status: 500 });
  }
}

// PUT - Update gear item
export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.gearItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Gear not found' }, { status: 404 });
    }

    // Process date fields
    if (updates.purchaseDate) {
      updates.purchaseDate = new Date(updates.purchaseDate);
    }
    if (updates.lastMaintenanceDate) {
      updates.lastMaintenanceDate = new Date(updates.lastMaintenanceDate);
    }
    if (updates.nextMaintenanceDate) {
      updates.nextMaintenanceDate = new Date(updates.nextMaintenanceDate);
    }

    // Process numeric fields
    if (updates.purchasePrice !== undefined) {
      updates.purchasePrice = updates.purchasePrice ? parseFloat(updates.purchasePrice) : null;
    }
    if (updates.currentValue !== undefined) {
      updates.currentValue = updates.currentValue ? parseFloat(updates.currentValue) : null;
    }
    if (updates.insuranceValue !== undefined) {
      updates.insuranceValue = updates.insuranceValue ? parseFloat(updates.insuranceValue) : null;
    }

    const gear = await db.gearItem.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(gear);
  } catch (error) {
    console.error('Error updating gear:', error);
    return NextResponse.json({ error: 'Failed to update gear' }, { status: 500 });
  }
}

// DELETE - Delete gear item
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.gearItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Gear not found' }, { status: 404 });
    }

    await db.gearItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gear:', error);
    return NextResponse.json({ error: 'Failed to delete gear' }, { status: 500 });
  }
}
