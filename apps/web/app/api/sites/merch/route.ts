import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - List products for a site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    const category = searchParams.get('category');

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 });
    }

    const site = await prisma.musicianSite.findUnique({
      where: { subdomain },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const products = await prisma.merchProduct.findMany({
      where: {
        siteId: site.id,
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    // Transform for frontend
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      images: (p.images as string[]) || [],
      category: p.category,
      variants: p.variants as { name: string; options: string[] }[] | undefined,
      inStock: !p.trackInventory || p.quantity > 0,
      isFeatured: p.isFeatured,
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      images,
      category,
      variants,
      trackInventory,
      quantity,
      productType,
      sku,
    } = body;

    // Get user's site
    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for existing slug and make unique if needed
    let slug = baseSlug;
    let counter = 1;
    while (
      await prisma.merchProduct.findUnique({ where: { siteId_slug: { siteId: site.id, slug } } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.merchProduct.create({
      data: {
        siteId: site.id,
        name,
        description,
        slug,
        price,
        comparePrice,
        images: images || [],
        category,
        hasVariants: Boolean(variants?.length),
        variants,
        trackInventory: trackInventory || false,
        quantity: quantity || 0,
        productType: productType || 'physical',
        sku,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PATCH - Update a product
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify ownership
    const product = await prisma.merchProduct.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!product || product.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updated = await prisma.merchProduct.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Remove a product
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify ownership
    const product = await prisma.merchProduct.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!product || product.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.merchProduct.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
