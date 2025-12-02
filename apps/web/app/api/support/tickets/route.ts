/**
 * Support Tickets API
 *
 * CRUD operations for support tickets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSupportTicket,
  getUserTickets,
  searchTickets,
  getSupportStats,
} from '@/lib/email/support-ticket-service';
import { handleApiError, AppError } from '@/lib/errors';
import { publicLimiter, checkRateLimit } from '@/lib/rate-limit';
import { auth } from '@cronkwaters/auth';

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
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
    }

    // Check if admin (for now, just check isOwner)
    const isAdmin = (session.user as any).isOwner === true;

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
    const result = await getUserTickets(session.user.id, {
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
 * POST - Create a new ticket
 */
export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Rate limit: 5 tickets per IP per hour
    await checkRateLimit(publicLimiter, `support:${ip}`);

    // Parse body
    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    // Check if user is authenticated
    const session = await auth();
    const userId = session?.user?.id;

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
      throw new AppError(result.message, 'TICKET_CREATION_FAILED', 400);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/support/tickets', method: 'POST' });
  }
}
