/**
 * Support Ticket Detail API
 *
 * Get, update, and reply to specific tickets.
 * Supports both session auth and MCP server authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getTicket,
  replyToTicket,
  updateTicketStatus,
  submitSatisfactionRating,
} from '@/lib/email/support-ticket-service';
import { handleApiError, AppError } from '@/lib/errors';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { validateMCPRequest, isMCPRequest } from '@/lib/mcp-auth';

/**
 * Get authenticated user - supports both session and MCP auth
 *
 * SECURITY: MCP auth is only used if header is present AND validation succeeds.
 * Session auth is always attempted as a fallback to prevent auth bypass attacks.
 */
async function getAuthenticatedUser(request: NextRequest): Promise<{
  userId: string;
  email?: string;
  name?: string;
  isAdmin: boolean;
} | null> {
  // Check for MCP server authentication first
  if (isMCPRequest(request)) {
    const mcpAuth = await validateMCPRequest(request);
    if (mcpAuth.valid && mcpAuth.userId) {
      const user = await prisma.user.findUnique({
        where: { id: mcpAuth.userId },
        select: { isOwner: true, name: true, email: true },
      });
      return {
        userId: mcpAuth.userId,
        email: user?.email || mcpAuth.email,
        name: user?.name || undefined,
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
      name: session.user.name || undefined,
      isAdmin: (session.user as any).isOwner === true,
    };
  }

  return null;
}

const replySchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  isInternal: z.boolean().optional(),
});

const updateSchema = z.object({
  status: z
    .enum([
      'OPEN',
      'IN_PROGRESS',
      'WAITING_ON_USER',
      'WAITING_ON_THIRD_PARTY',
      'RESOLVED',
      'CLOSED',
      'WONT_FIX',
    ])
    .optional(),
  resolution: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  satisfactionRating: z.number().min(1).max(5).optional(),
  satisfactionFeedback: z.string().optional(),
});

interface Params {
  params: { ticketId: string };
}

/**
 * GET - Get ticket details
 * Supports both session auth and MCP server authentication.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
    }

    const { ticketId } = params;

    // Try to find by ticket number or ID
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: ticketId }, { ticketNumber: ticketId }],
      },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 'NOT_FOUND', 404);
    }

    // Check access - must be owner or admin
    if (!authUser.isAdmin && ticket.userId !== authUser.userId) {
      throw new AppError('Access denied', 'FORBIDDEN', 403);
    }

    const result = await getTicket(ticket.id, authUser.isAdmin ? undefined : authUser.userId);

    if (!result.success) {
      throw new AppError(result.message || 'Failed to fetch ticket', 'FETCH_FAILED', 400);
    }

    return NextResponse.json(result.ticket);
  } catch (error) {
    return handleApiError(error, { route: '/api/support/tickets/[ticketId]', method: 'GET' });
  }
}

/**
 * POST - Reply to ticket
 * Supports both session auth and MCP server authentication.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
    }

    const { ticketId } = params;
    const body = await request.json();
    const validated = replySchema.parse(body);

    // Find ticket
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: ticketId }, { ticketNumber: ticketId }],
      },
      select: { id: true, userId: true, email: true },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 'NOT_FOUND', 404);
    }

    // Check access
    if (!authUser.isAdmin && ticket.userId !== authUser.userId) {
      throw new AppError('Access denied', 'FORBIDDEN', 403);
    }

    const result = await replyToTicket({
      ticketId: ticket.id,
      senderId: authUser.userId,
      senderName: authUser.name,
      senderEmail: authUser.email,
      senderType: authUser.isAdmin ? 'AGENT' : 'USER',
      content: validated.content,
      isInternal: authUser.isAdmin ? validated.isInternal : false, // Only admins can make internal notes
    });

    if (!result.success) {
      throw new AppError(result.message, 'REPLY_FAILED', 400);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, { route: '/api/support/tickets/[ticketId]', method: 'POST' });
  }
}

/**
 * PATCH - Update ticket (status, assignment, etc.)
 * Supports both session auth and MCP server authentication.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
    }

    const { ticketId } = params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    // Find ticket
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [{ id: ticketId }, { ticketNumber: ticketId }],
      },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 'NOT_FOUND', 404);
    }

    // Check access
    const isOwner = ticket.userId === authUser.userId;

    // Users can only submit satisfaction ratings on their own tickets
    if (!authUser.isAdmin && !isOwner) {
      throw new AppError('Access denied', 'FORBIDDEN', 403);
    }

    // Handle satisfaction rating (users can submit this)
    if (validated.satisfactionRating !== undefined && isOwner) {
      const result = await submitSatisfactionRating(
        ticket.id,
        validated.satisfactionRating,
        validated.satisfactionFeedback
      );
      return NextResponse.json(result);
    }

    // Other updates require admin
    if (!authUser.isAdmin) {
      throw new AppError('Only support staff can update ticket status', 'FORBIDDEN', 403);
    }

    // Handle status update
    if (validated.status) {
      const result = await updateTicketStatus(
        ticket.id,
        validated.status,
        validated.resolution,
        authUser.userId
      );

      if (!result.success) {
        throw new AppError(result.message, 'UPDATE_FAILED', 400);
      }
    }

    // Handle other admin updates
    if (validated.assignedTo !== undefined || validated.priority !== undefined) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          ...(validated.assignedTo !== undefined && { assignedTo: validated.assignedTo }),
          ...(validated.priority !== undefined && { priority: validated.priority }),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Ticket updated' });
  } catch (error) {
    return handleApiError(error, { route: '/api/support/tickets/[ticketId]', method: 'PATCH' });
  }
}
