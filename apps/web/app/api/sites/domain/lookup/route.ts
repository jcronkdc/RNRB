import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';

// Cache for domain lookups (reduces database calls)
const domainCache = new Map<string, { subdomain: string; expires: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

// GET /api/sites/domain/lookup?domain=example.com
// Used by middleware to route custom domains
export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
  }

  // Clean domain
  const cleanDomain = domain.toLowerCase().trim();

  // Check cache first
  const cached = domainCache.get(cleanDomain);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ subdomain: cached.subdomain });
  }

  try {
    // Look up site by custom domain
    const site = await prisma.musicianSite.findFirst({
      where: {
        customDomain: cleanDomain,
        domainVerified: true,
        status: 'published',
      },
      select: {
        subdomain: true,
      },
    });

    if (!site) {
      // Domain not found or not verified
      return NextResponse.json({ error: 'Domain not configured' }, { status: 404 });
    }

    // Cache the result
    domainCache.set(cleanDomain, {
      subdomain: site.subdomain,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json({ subdomain: site.subdomain });
  } catch (error) {
    console.error('[DOMAIN-LOOKUP] Error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
