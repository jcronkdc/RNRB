import { NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import dns from 'dns/promises';

// POST /api/sites/domain/verify - Verify domain ownership via DNS TXT record
export async function POST() {
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

    if (!site.customDomain) {
      return NextResponse.json({ error: 'No custom domain configured' }, { status: 400 });
    }

    if (site.domainVerified) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Domain already verified',
      });
    }

    // Expected verification token
    const expectedToken = `cronkwaters-verify-${site.id.slice(0, 8)}`;

    // Check TXT record on _cronkwaters subdomain
    const txtRecordHost = `_cronkwaters.${site.customDomain}`;

    let txtRecords: string[][] = [];
    let txtVerified = false;

    try {
      txtRecords = await dns.resolveTxt(txtRecordHost);
      // TXT records come as arrays of strings that need to be joined
      const flatRecords = txtRecords.map((r) => r.join(''));
      txtVerified = flatRecords.some((record) => record === expectedToken);
    } catch (dnsError: unknown) {
      // ENODATA or ENOTFOUND means no TXT record found
      const errorCode = (dnsError as { code?: string }).code;
      if (errorCode !== 'ENODATA' && errorCode !== 'ENOTFOUND') {
        console.error('[DOMAIN-VERIFY] DNS lookup error:', dnsError);
      }
    }

    if (!txtVerified) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: 'TXT record not found or incorrect',
        expected: {
          host: txtRecordHost,
          type: 'TXT',
          value: expectedToken,
        },
        found: txtRecords.length > 0 ? txtRecords.map((r) => r.join('')) : null,
        help: 'Please add the TXT record and wait a few minutes for DNS propagation (can take up to 48 hours)',
      });
    }

    // Check CNAME or A record points to us
    let dnsPointsToUs = false;
    let dnsInfo: { type: string; value: string } | null = null;

    // First try CNAME
    try {
      const cnameRecords = await dns.resolveCname(site.customDomain);
      const pointsToUs = cnameRecords.some(
        (cname) =>
          cname.toLowerCase().includes('cronkwaters.com') ||
          cname.toLowerCase().includes('vercel') ||
          cname.toLowerCase().includes('76.76.21.21')
      );
      if (pointsToUs) {
        dnsPointsToUs = true;
        dnsInfo = { type: 'CNAME', value: cnameRecords[0] };
      }
    } catch {
      // No CNAME, try A record
      try {
        const aRecords = await dns.resolve4(site.customDomain);
        // Vercel IPs
        const vercelIps = ['76.76.21.21', '76.76.21.164'];
        const pointsToUs = aRecords.some((ip) => vercelIps.includes(ip));
        if (pointsToUs) {
          dnsPointsToUs = true;
          dnsInfo = { type: 'A', value: aRecords[0] };
        }
      } catch {
        // No A record either
      }
    }

    // TXT is verified, update database
    // We'll mark as verified even if CNAME/A isn't set yet
    // The site will only work once CNAME/A is properly configured
    await prisma.musicianSite.update({
      where: { id: site.id },
      data: { domainVerified: true },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      txtVerified: true,
      dnsPointsToUs,
      dnsInfo,
      message: dnsPointsToUs
        ? 'Domain fully verified and configured!'
        : 'Domain ownership verified! Now add a CNAME or A record to point to cronkwaters.com',
      nextSteps: dnsPointsToUs
        ? null
        : {
            description: 'Add one of these DNS records to make your domain work:',
            cname: {
              type: 'CNAME',
              name: '@',
              value: 'cname.vercel-dns.com',
            },
            a: {
              type: 'A',
              name: '@',
              value: '76.76.21.21',
            },
          },
    });
  } catch (error) {
    console.error('[DOMAIN-VERIFY] Error:', error);
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 });
  }
}
