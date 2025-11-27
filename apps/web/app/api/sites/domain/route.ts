import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import dns from 'dns/promises';

// POST /api/sites/domain - Add a custom domain
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await request.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Clean and validate domain
    const cleanDomain = domain
      .toLowerCase()
      .trim()
      .replace(/^(https?:\/\/)?(www\.)?/, '');

    // Basic domain validation
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Check if domain is already in use
    const existingDomain = await prisma.musicianSite.findFirst({
      where: {
        customDomain: cleanDomain,
        userId: { not: session.user.id },
      },
    });

    if (existingDomain) {
      return NextResponse.json({ error: 'Domain is already in use' }, { status: 409 });
    }

    // Get user's site
    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Generate verification token (based on site ID)
    const verificationToken = `cronkwaters-verify-${site.id.slice(0, 8)}`;

    // Update site with pending domain
    const updatedSite = await prisma.musicianSite.update({
      where: { id: site.id },
      data: {
        customDomain: cleanDomain,
        domainVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verified: false,
      verificationToken,
      instructions: {
        step1: {
          title: 'Add TXT Record',
          description: 'Add this TXT record to verify domain ownership:',
          record: {
            type: 'TXT',
            name: '_cronkwaters',
            value: verificationToken,
          },
        },
        step2: {
          title: 'Add CNAME Record',
          description: 'Point your domain to CronkWaters:',
          record: {
            type: 'CNAME',
            name: '@',
            value: 'sites.cronkwaters.com',
          },
          alternative: {
            description: 'Or use an A record if CNAME on root is not supported:',
            type: 'A',
            name: '@',
            value: '76.76.21.21', // Vercel's IP
          },
        },
      },
      site: updatedSite,
    });
  } catch (error) {
    console.error('[DOMAIN] POST Error:', error);
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}

// GET /api/sites/domain - Get domain status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        customDomain: true,
        domainVerified: true,
        subdomain: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Generate verification token for display
    const verificationToken = site.customDomain
      ? `cronkwaters-verify-${site.id.slice(0, 8)}`
      : null;

    return NextResponse.json({
      customDomain: site.customDomain,
      domainVerified: site.domainVerified,
      subdomain: site.subdomain,
      verificationToken,
      defaultUrl: `https://cronkwaters.com/s/${site.subdomain}`,
      customUrl: site.customDomain && site.domainVerified ? `https://${site.customDomain}` : null,
    });
  } catch (error) {
    console.error('[DOMAIN] GET Error:', error);
    return NextResponse.json({ error: 'Failed to get domain status' }, { status: 500 });
  }
}

// DELETE /api/sites/domain - Remove custom domain
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    await prisma.musicianSite.update({
      where: { id: site.id },
      data: {
        customDomain: null,
        domainVerified: false,
      },
    });

    return NextResponse.json({ success: true, message: 'Domain removed' });
  } catch (error) {
    console.error('[DOMAIN] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to remove domain' }, { status: 500 });
  }
}
