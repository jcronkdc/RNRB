/**
 * Support Tickets API
 *
 * CRUD operations for support tickets.
 * Supports both session auth and MCP server authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

import {
  createSupportTicket,
  getUserTickets,
  searchTickets,
  getSupportStats,
} from '@/lib/email/support-ticket-service';
import { handleApiError, AppError } from '@/lib/errors';
import { publicLimiter, checkRateLimit } from '@/lib/rate-limit';
import { auth } from '@cronkwaters/auth';
import { validateMCPRequest, isMCPRequest } from '@/lib/mcp-auth';
import { prisma } from '@cronkwaters/db';

/**
 * Get authenticated user - supports both session and MCP auth
 *
 * SECURITY: MCP auth is only used if header is present AND validation succeeds.
 * Session auth is always attempted as a fallback to prevent auth bypass attacks.
 */
async function getAuthenticatedUser(request: NextRequest): Promise<{
  userId: string;
  email?: string;
  isAdmin: boolean;
} | null> {
  // Check for MCP server authentication first
  if (isMCPRequest(request)) {
    const mcpAuth = await validateMCPRequest(request);
    if (mcpAuth.valid && mcpAuth.userId) {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: mcpAuth.userId },
        select: { isOwner: true },
      });
      return {
        userId: mcpAuth.userId,
        email: mcpAuth.email,
        isAdmin: user?.isOwner === true,
      };
    }
    // SECURITY FIX: Don't return null here - fall through to session auth
    // Invalid MCP headers should not bypass normal authentication
  }

  // Fall back to session auth (always attempted if MCP auth fails or not present)
  const session = await auth();
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      email: session.user.email || undefined,
      isAdmin: (session.user as any).isOwner === true,
    };
  }

  return null;
}

const createTicketSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z
    .enum([
      'GENERAL',
      'ACCOUNT',
      'BILLING',
      'TECHNICAL',
      'FEATURE_REQUEST',
      'COLLABORATION',
      'VIDEO_CALLS',
      'AI_ASSISTANT',
      'SECURITY',
      'FEEDBACK',
    ])
    .optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
});

/**
 * GET - List user's tickets or search (admin)
 * Supports both session auth and MCP server authentication.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
    }

    const { userId, isAdmin } = authUser;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.getAll('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (isAdmin && searchParams.get('admin') === 'true') {
      // Admin search
      const category = searchParams.getAll('category');
      const priority = searchParams.getAll('priority');
      const search = searchParams.get('search') || undefined;
      const assignedTo = searchParams.get('assignedTo') || undefined;

      const result = await searchTickets({
        status: status.length > 0 ? status : undefined,
        category: category.length > 0 ? category : undefined,
        priority: priority.length > 0 ? priority : undefined,
        search,
        assignedTo,
        limit,
        offset,
      });

      // Also get stats for admin
      const stats = await getSupportStats();

      return NextResponse.json({ ...result, stats });
    }

    // User's own tickets
    const result = await getUserTickets(userId, {
      status: status.length > 0 ? status : undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, { route: '/api/support/tickets', method: 'GET' });
  }
}

/**
 * Check if request is from email worker
 */
function isEmailWorkerRequest(request: NextRequest): boolean {
  return request.headers.has('X-Email-Worker');
}

/**
 * Validate email worker request
 *
 * SECURITY: Uses timing-safe comparison to prevent timing attacks
 * where an attacker could measure comparison duration to infer key bytes.
 */
async function validateEmailWorkerRequest(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get('X-MCP-Server-Key');
  const mcpServerApiKey = process.env.MCP_SERVER_API_KEY;

  // Fail closed if either key is missing
  if (!apiKey || !mcpServerApiKey) {
    return false;
  }

  // Check length first to avoid Buffer.from issues and enable timing-safe comparison
  if (apiKey.length !== mcpServerApiKey.length) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(mcpServerApiKey));
}

/**
 * POST - Create a new ticket
 * Supports session auth, MCP server auth, and email worker auth.
 */
export async function POST(request: NextRequest) {
  try {
    // Skip rate limiting for MCP server and email worker requests
    const fromMCP = isMCPRequest(request);
    const fromEmailWorker = isEmailWorkerRequest(request);

    // Validate email worker requests
    if (fromEmailWorker) {
      const isValid = await validateEmailWorkerRequest(request);
      if (!isValid) {
        throw new AppError('Invalid email worker credentials', 'UNAUTHORIZED', 401);
      }
    }

    if (!fromMCP && !fromEmailWorker) {
      // Get IP for rate limiting
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

      // Rate limit: 5 tickets per IP per hour
      await checkRateLimit(publicLimiter, `support:${ip}`);
    }

    // Parse body
    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    // Check if user is authenticated (session or MCP)
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.userId;

    // Get context
    const userAgent = request.headers.get('user-agent') || undefined;
    const referer = request.headers.get('referer') || undefined;

    const result = await createSupportTicket({
      userId,
      email: validated.email,
      name: validated.name,
      subject: validated.subject,
      description: validated.description,
      category: validated.category,
      priority: validated.priority,
      currentPage: referer,
      userAgent,
    });

    if (!result.success) {
      throw new AppError(result.message, 'INTERNAL_ERROR', 400);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/support/tickets', method: 'POST' });
  }
}
