/**
 * ERROR REPORTS API
 *
 * POST - Submit a new error report
 * GET - Retrieve error reports (admin only)
 * PATCH - Update error report (mark resolved, add notes)
 */

import { auth } from '@/lib/auth';
import { publicLimiter, rateLimitRequest } from '@/lib/rate-limit';
import { prisma } from '@cronkwaters/db';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Generate fingerprint for deduplication
function generateFingerprint(message: string, stack?: string, url?: string): string {
  const content = `${message}|${stack?.split('\n')[0] || ''}|${url || ''}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * POST /api/admin/error-reports
 * Submit a new error report (public - errors can occur before auth)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit unauthenticated error submissions to prevent DB flooding
    const rateLimited = await rateLimitRequest(publicLimiter, request);
    if (rateLimited) return rateLimited;

    const body = await request.json();

    const {
      timestamp,
      severity,
      category,
      message,
      stack,
      componentStack,
      url,
      route,
      userAgent,
      userId,
      userEmail,
      userTier,
      sessionId,
      metadata,
      breadcrumbs,
    } = body;

    // Validate required fields
    if (!message || !severity || !category || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate fingerprint
    const fingerprint = generateFingerprint(message, stack, route || url);

    // Check for existing report with same fingerprint (deduplication)
    const existingReport = (await prisma.$queryRaw`
      SELECT id, "occurrenceCount"
      FROM "ErrorReport"
      WHERE fingerprint = ${fingerprint}
        AND resolved = false
        AND "createdAt" > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `) as Array<{ id: string; occurrenceCount: number }>;

    if (existingReport && existingReport.length > 0) {
      // Update occurrence count instead of creating new report
      await prisma.$executeRaw`
        UPDATE "ErrorReport"
        SET "occurrenceCount" = "occurrenceCount" + 1,
            "lastOccurredAt" = NOW(),
            "updatedAt" = NOW()
        WHERE id = ${existingReport[0].id}
      `;

      return NextResponse.json({
        success: true,
        deduplicated: true,
        reportId: existingReport[0].id,
        occurrences: existingReport[0].occurrenceCount + 1,
      });
    }

    // Create new error report
    const result = (await prisma.$queryRaw`
      INSERT INTO "ErrorReport" (
        "id",
        "timestamp",
        "severity",
        "category",
        "message",
        "stack",
        "componentStack",
        "url",
        "route",
        "userAgent",
        "userId",
        "userEmail",
        "userTier",
        "sessionId",
        "metadata",
        "breadcrumbs",
        "fingerprint",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${timestamp ? new Date(timestamp) : new Date()},
        ${severity},
        ${category},
        ${message.slice(0, 2000)},
        ${stack?.slice(0, 5000) || null},
        ${componentStack?.slice(0, 5000) || null},
        ${url.slice(0, 500)},
        ${route?.slice(0, 200) || null},
        ${userAgent?.slice(0, 500) || null},
        ${userId || null},
        ${userEmail?.slice(0, 255) || null},
        ${userTier || null},
        ${sessionId || null},
        ${JSON.stringify(metadata || {})}::jsonb,
        ${JSON.stringify((breadcrumbs || []).slice(-20))}::jsonb,
        ${fingerprint},
        NOW(),
        NOW()
      )
      RETURNING id
    `) as Array<{ id: string }>;

    const reportId = result[0]?.id;

    // For critical/high severity, create admin alert
    if (severity === 'critical' || severity === 'high') {
      await prisma.$executeRaw`
        INSERT INTO "AdminErrorAlert" (
          "id",
          "errorReportId",
          "type",
          "title",
          "message",
          "url",
          "createdAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${reportId},
          ${`error_${severity}`},
          ${`${severity.toUpperCase()}: ${category} Error`},
          ${message.slice(0, 500)},
          ${url},
          NOW()
        )
      `;
    }

    return NextResponse.json({
      success: true,
      reportId,
    });
  } catch (error) {
    console.error('[Error Reports API] Error:', error);
    return NextResponse.json({ error: 'Failed to save error report' }, { status: 500 });
  }
}

/**
 * GET /api/admin/error-reports
 * Retrieve error reports (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if ErrorReport table exists FIRST (before auth to avoid unnecessary queries)
    let tableExists = true;
    try {
      await prisma.$queryRaw`SELECT 1 FROM "ErrorReport" LIMIT 1`;
    } catch (tableError) {
      tableExists = false;
    }

    if (!tableExists) {
      // Table doesn't exist yet, return empty results without requiring auth
      return NextResponse.json({
        reports: [],
        counts: {
          unresolved: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          total: 0,
        },
        pagination: {
          limit: 50,
          offset: 0,
          hasMore: false,
        },
      });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOwner: true },
    });

    if (!user?.isOwner) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const resolved = searchParams.get('resolved');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    // Validate enum inputs to prevent SQL injection
    const validSeverities = ['critical', 'high', 'medium', 'low'];
    const validCategories = ['runtime', 'network', 'render', 'auth', 'api', 'other'];

    const safeSeverity = severity && validSeverities.includes(severity) ? severity : null;
    const safeCategory = category && validCategories.includes(category) ? category : null;
    const safeResolved = resolved === 'true' ? true : resolved === 'false' ? false : null;

    // Build parameterized query
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (safeSeverity) {
      conditions.push(`severity = $${paramIdx++}`);
      params.push(safeSeverity);
    }
    if (safeCategory) {
      conditions.push(`category = $${paramIdx++}`);
      params.push(safeCategory);
    }
    if (safeResolved !== null) {
      conditions.push(`resolved = $${paramIdx++}`);
      params.push(safeResolved);
    }

    params.push(limit, offset);

    const reports = await prisma.$queryRawUnsafe(
      `
      SELECT
        id,
        timestamp,
        severity,
        category,
        message,
        stack,
        "componentStack",
        url,
        route,
        "userAgent",
        "userId",
        "userEmail",
        "userTier",
        "sessionId",
        metadata,
        breadcrumbs,
        resolved,
        "resolvedAt",
        "resolvedBy",
        notes,
        "occurrenceCount",
        "lastOccurredAt",
        "createdAt"
      FROM "ErrorReport"
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END,
        "lastOccurredAt" DESC
      LIMIT $${paramIdx++}
      OFFSET $${paramIdx}
    `,
      ...params
    );

    // Get counts
    const counts = (await prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE resolved = false) as unresolved,
        COUNT(*) FILTER (WHERE severity = 'critical' AND resolved = false) as critical,
        COUNT(*) FILTER (WHERE severity = 'high' AND resolved = false) as high,
        COUNT(*) FILTER (WHERE severity = 'medium' AND resolved = false) as medium,
        COUNT(*) FILTER (WHERE severity = 'low' AND resolved = false) as low,
        COUNT(*) as total
      FROM "ErrorReport"
    `) as Array<{
      unresolved: bigint;
      critical: bigint;
      high: bigint;
      medium: bigint;
      low: bigint;
      total: bigint;
    }>;

    return NextResponse.json({
      reports,
      counts: {
        unresolved: Number(counts[0].unresolved),
        critical: Number(counts[0].critical),
        high: Number(counts[0].high),
        medium: Number(counts[0].medium),
        low: Number(counts[0].low),
        total: Number(counts[0].total),
      },
      pagination: {
        limit,
        offset,
        hasMore: (reports as unknown[]).length === limit,
      },
    });
  } catch (error) {
    console.error('[Error Reports API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch error reports' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/error-reports
 * Update error report (mark resolved, add notes)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOwner: true },
    });

    if (!user?.isOwner) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, resolved, notes } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE "ErrorReport"
      SET
        resolved = COALESCE(${resolved}, resolved),
        "resolvedAt" = CASE WHEN ${resolved} = true THEN NOW() ELSE "resolvedAt" END,
        "resolvedBy" = CASE WHEN ${resolved} = true THEN ${session.user.id} ELSE "resolvedBy" END,
        notes = COALESCE(${notes}, notes),
        "updatedAt" = NOW()
      WHERE id = ${reportId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Error Reports API] Error:', error);
    return NextResponse.json({ error: 'Failed to update error report' }, { status: 500 });
  }
}
