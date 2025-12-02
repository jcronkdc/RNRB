/**
 * RNRB Support Ticket Service
 *
 * Handles support ticket creation, management, and AI-assisted responses.
 * Integrates with AI assistant for intelligent support.
 */

import { Resend } from 'resend';
import { prisma } from '@cronkwaters/db';

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email addresses
const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "Rock N' Roll Basement Support <support@rnrb.me>";
const SUPPORT_REPLY_TO = process.env.SUPPORT_REPLY_TO || 'support@rnrb.me';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com';

// Types
export interface CreateTicketParams {
  userId?: string;
  email: string;
  name?: string;
  subject: string;
  description: string;
  category?:
    | 'GENERAL'
    | 'ACCOUNT'
    | 'BILLING'
    | 'TECHNICAL'
    | 'FEATURE_REQUEST'
    | 'COLLABORATION'
    | 'VIDEO_CALLS'
    | 'AI_ASSISTANT'
    | 'SECURITY'
    | 'FEEDBACK';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';
  currentPage?: string;
  userAgent?: string;
  attachments?: Array<{ url: string; filename: string; size: number; type: string }>;
  aiSuggested?: boolean;
}

export interface TicketReplyParams {
  ticketId: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  senderType: 'USER' | 'AGENT' | 'AI' | 'SYSTEM';
  content: string;
  htmlContent?: string;
  isInternal?: boolean;
  isAiGenerated?: boolean;
  attachments?: Array<{ url: string; filename: string; size: number; type: string }>;
}

export interface TicketSearchParams {
  userId?: string;
  email?: string;
  status?: string[];
  category?: string[];
  priority?: string[];
  assignedTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'lastActivityAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generate ticket number (RNRB-XXXX format)
 */
async function generateTicketNumber(): Promise<string> {
  const count = await prisma.supportTicket.count();
  const number = count + 1000; // Start at 1000
  return `RNRB-${number.toString().padStart(4, '0')}`;
}

/**
 * Create a new support ticket
 */
export async function createSupportTicket(params: CreateTicketParams): Promise<{
  success: boolean;
  message: string;
  ticketId?: string;
  ticketNumber?: string;
}> {
  const {
    userId,
    email,
    name,
    subject,
    description,
    category = 'GENERAL',
    priority = 'NORMAL',
    currentPage,
    userAgent,
    attachments,
    aiSuggested = false,
  } = params;

  try {
    // Get user's subscription tier if logged in
    let subscriptionTier: string | undefined;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true },
      });
      subscriptionTier = user?.subscriptionTier;
    }

    // Auto-escalate priority for paying customers
    let finalPriority = priority;
    if (subscriptionTier === 'studio' && priority === 'NORMAL') {
      finalPriority = 'HIGH';
    }

    // Create the ticket
    const ticketNumber = await generateTicketNumber();
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        email: email.toLowerCase().trim(),
        name,
        subject,
        description,
        category,
        priority: finalPriority,
        status: 'OPEN',
        currentPage,
        userAgent,
        subscriptionTier,
        attachments,
        aiSuggested,
        lastActivityAt: new Date(),
        // Create the initial message
        messages: {
          create: {
            senderType: 'USER',
            senderId: userId,
            senderName: name,
            senderEmail: email,
            content: description,
            messageType: 'INITIAL',
            attachments,
          },
        },
      },
    });

    // Send confirmation email to user
    await sendTicketConfirmationEmail(email, ticketNumber, subject, name);

    // Notify support team
    await notifySupportTeam(ticket.id, ticketNumber, subject, category, finalPriority);

    return {
      success: true,
      message: `Support ticket ${ticketNumber} created. We'll respond as soon as possible.`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
    };
  } catch (error) {
    console.error('[Support] Create ticket error:', error);
    return {
      success: false,
      message: 'Failed to create support ticket. Please try again.',
    };
  }
}

/**
 * Add a reply to a ticket
 */
export async function replyToTicket(params: TicketReplyParams): Promise<{
  success: boolean;
  message: string;
  messageId?: string;
}> {
  const {
    ticketId,
    senderId,
    senderName,
    senderEmail,
    senderType,
    content,
    htmlContent,
    isInternal = false,
    isAiGenerated = false,
    attachments,
  } = params;

  try {
    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        ticketNumber: true,
        email: true,
        name: true,
        status: true,
        userId: true,
      },
    });

    if (!ticket) {
      return { success: false, message: 'Ticket not found.' };
    }

    // Create the message
    const ticketMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        senderType,
        senderId,
        senderName,
        senderEmail,
        content,
        htmlContent,
        isInternal,
        isAiGenerated,
        attachments,
        messageType: 'REPLY',
      },
    });

    // Update ticket
    const updateData: any = {
      lastActivityAt: new Date(),
    };

    // Track first response time for agent replies
    if (senderType === 'AGENT' || senderType === 'AI') {
      const existingFirstResponse = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        select: { firstResponseAt: true },
      });

      if (!existingFirstResponse?.firstResponseAt) {
        updateData.firstResponseAt = new Date();
      }

      // Update status if replying
      if (ticket.status === 'OPEN') {
        updateData.status = 'IN_PROGRESS';
      }
    }

    // If user replied while waiting on user, move to in progress
    if (senderType === 'USER' && ticket.status === 'WAITING_ON_USER') {
      updateData.status = 'IN_PROGRESS';
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Send email notification (unless internal note)
    if (!isInternal) {
      if (senderType === 'AGENT' || senderType === 'AI') {
        // Notify user of reply
        await sendTicketReplyNotification(
          ticket.email,
          ticket.ticketNumber,
          ticket.name,
          content,
          senderName || 'RNRB Support'
        );
      } else if (senderType === 'USER') {
        // Notify support team of user reply
        await notifyAgentOfReply(ticketId, ticket.ticketNumber, content);
      }
    }

    return {
      success: true,
      message: 'Reply sent successfully.',
      messageId: ticketMessage.id,
    };
  } catch (error) {
    console.error('[Support] Reply error:', error);
    return {
      success: false,
      message: 'Failed to send reply.',
    };
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status:
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'WAITING_ON_USER'
    | 'WAITING_ON_THIRD_PARTY'
    | 'RESOLVED'
    | 'CLOSED'
    | 'WONT_FIX',
  resolution?: string,
  resolvedBy?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const updateData: any = {
      status,
      lastActivityAt: new Date(),
    };

    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = resolvedBy;
      if (resolution) {
        updateData.resolution = resolution;
      }
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      select: { ticketNumber: true, email: true, name: true },
    });

    // Notify user of status change
    if (status === 'RESOLVED') {
      await sendTicketResolvedEmail(ticket.email, ticket.ticketNumber, ticket.name, resolution);
    }

    // Add system message about status change
    await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        senderType: 'SYSTEM',
        content: `Ticket status changed to ${status.replace(/_/g, ' ').toLowerCase()}.`,
        messageType: 'STATUS',
        isInternal: true,
      },
    });

    return {
      success: true,
      message: `Ticket status updated to ${status}.`,
    };
  } catch (error) {
    console.error('[Support] Update status error:', error);
    return {
      success: false,
      message: 'Failed to update ticket status.',
    };
  }
}

/**
 * Get ticket by ID
 */
export async function getTicket(
  ticketId: string,
  userId?: string
): Promise<{
  success: boolean;
  ticket?: any;
  message?: string;
}> {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          where: userId ? { isInternal: false } : undefined, // Hide internal notes from users
        },
        tags: true,
      },
    });

    if (!ticket) {
      return { success: false, message: 'Ticket not found.' };
    }

    // Security check - users can only see their own tickets
    if (userId && ticket.userId !== userId) {
      return { success: false, message: 'Access denied.' };
    }

    // Increment view count
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { viewCount: { increment: 1 } },
    });

    return { success: true, ticket };
  } catch (error) {
    console.error('[Support] Get ticket error:', error);
    return { success: false, message: 'Failed to fetch ticket.' };
  }
}

/**
 * Get user's tickets
 */
export async function getUserTickets(
  userId: string,
  options?: {
    status?: string[];
    limit?: number;
    offset?: number;
  }
): Promise<{
  tickets: any[];
  total: number;
}> {
  const where: any = { userId };

  if (options?.status?.length) {
    where.status = { in: options.status };
  }

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        lastActivityAt: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastActivityAt: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return { tickets, total };
}

/**
 * Search tickets (admin)
 */
export async function searchTickets(params: TicketSearchParams): Promise<{
  tickets: any[];
  total: number;
}> {
  const where: any = {};

  if (params.userId) where.userId = params.userId;
  if (params.email) where.email = params.email.toLowerCase();
  if (params.status?.length) where.status = { in: params.status };
  if (params.category?.length) where.category = { in: params.category };
  if (params.priority?.length) where.priority = { in: params.priority };
  if (params.assignedTo) where.assignedTo = params.assignedTo;

  if (params.search) {
    where.OR = [
      { ticketNumber: { contains: params.search, mode: 'insensitive' } },
      { subject: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const orderBy: any = {};
  orderBy[params.sortBy || 'lastActivityAt'] = params.sortOrder || 'desc';

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        _count: { select: { messages: true } },
      },
      orderBy,
      take: params.limit || 20,
      skip: params.offset || 0,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return { tickets, total };
}

/**
 * Get support statistics
 */
export async function getSupportStats(): Promise<{
  openTickets: number;
  inProgressTickets: number;
  avgResponseTime: number; // in minutes
  avgResolutionTime: number; // in minutes
  ticketsToday: number;
  ticketsThisWeek: number;
  satisfactionRating: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    openTickets,
    inProgressTickets,
    ticketsToday,
    ticketsThisWeek,
    responseTimeData,
    satisfactionData,
  ] = await Promise.all([
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.supportTicket.count({ where: { createdAt: { gte: today } } }),
    prisma.supportTicket.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.supportTicket.findMany({
      where: { firstResponseAt: { not: null } },
      select: { createdAt: true, firstResponseAt: true, resolvedAt: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supportTicket.aggregate({
      where: { satisfactionRating: { not: null } },
      _avg: { satisfactionRating: true },
    }),
  ]);

  // Calculate average response time
  const responseTimes = responseTimeData
    .filter((t) => t.firstResponseAt)
    .map((t) => (t.firstResponseAt!.getTime() - t.createdAt.getTime()) / (1000 * 60));
  const avgResponseTime =
    responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

  // Calculate average resolution time
  const resolutionTimes = responseTimeData
    .filter((t) => t.resolvedAt)
    .map((t) => (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60));
  const avgResolutionTime =
    resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

  return {
    openTickets,
    inProgressTickets,
    avgResponseTime: Math.round(avgResponseTime),
    avgResolutionTime: Math.round(avgResolutionTime),
    ticketsToday,
    ticketsThisWeek,
    satisfactionRating: satisfactionData._avg.satisfactionRating || 0,
  };
}

/**
 * Submit satisfaction rating
 */
export async function submitSatisfactionRating(
  ticketId: string,
  rating: number,
  feedback?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        satisfactionRating: rating,
        satisfactionFeedback: feedback,
      },
    });

    return {
      success: true,
      message: 'Thank you for your feedback!',
    };
  } catch (error) {
    console.error('[Support] Rating error:', error);
    return {
      success: false,
      message: 'Failed to submit rating.',
    };
  }
}

// Email notification functions

async function sendTicketConfirmationEmail(
  email: string,
  ticketNumber: string,
  subject: string,
  name?: string | null
): Promise<void> {
  if (!resend) return;

  const displayName = name || 'there';
  const ticketUrl = `${APP_URL}/support/ticket/${ticketNumber}`;

  await resend.emails.send({
    from: SUPPORT_EMAIL,
    replyTo: SUPPORT_REPLY_TO,
    to: email,
    subject: `[${ticketNumber}] We received your request: ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="${APP_URL}/logo-dark.png" alt="Rock N' Roll Basement" style="height: 60px; width: auto;">
    </div>
    
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 16px; padding: 40px;">
      <h1 style="margin: 0 0 20px; font-size: 24px; color: #C9A227;">Hey ${displayName}! 🎸</h1>
      
      <p style="margin: 0 0 20px; line-height: 1.6; color: #999;">
        We've received your support request and our team is on it. You can expect a response within 24 hours (usually much sooner!).
      </p>
      
      <div style="background: #0d0d0d; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 10px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Ticket Number</p>
        <p style="margin: 0; font-size: 20px; font-weight: 600; color: #C9A227;">${ticketNumber}</p>
      </div>
      
      <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Subject:</p>
      <p style="margin: 0 0 20px; color: #e5e5e5; font-size: 16px;">${subject}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A227 0%, #B8941D 100%); color: #0a0a0a; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
          View Ticket Status →
        </a>
      </div>
      
      <p style="margin: 20px 0 0; font-size: 14px; color: #666; text-align: center;">
        You can reply to this email to add more details to your ticket.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
      <p style="margin: 0; font-size: 12px; color: #666;">
        Rock N' Roll Basement Support
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });
}

async function sendTicketReplyNotification(
  email: string,
  ticketNumber: string,
  name: string | null,
  replyContent: string,
  agentName: string
): Promise<void> {
  if (!resend) return;

  const ticketUrl = `${APP_URL}/support/ticket/${ticketNumber}`;
  const displayName = name || 'there';

  await resend.emails.send({
    from: SUPPORT_EMAIL,
    replyTo: SUPPORT_REPLY_TO,
    to: email,
    subject: `[${ticketNumber}] New reply on your support ticket`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 16px; padding: 40px;">
      <p style="margin: 0 0 10px; color: #666; font-size: 14px;">${agentName} replied:</p>
      
      <div style="background: #0d0d0d; border-left: 3px solid #C9A227; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #e5e5e5; line-height: 1.6; white-space: pre-wrap;">${replyContent}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A227 0%, #B8941D 100%); color: #0a0a0a; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
          View Full Conversation →
        </a>
      </div>
      
      <p style="margin: 20px 0 0; font-size: 14px; color: #666; text-align: center;">
        Reply to this email to respond to ${agentName}.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });
}

async function sendTicketResolvedEmail(
  email: string,
  ticketNumber: string,
  name: string | null,
  resolution?: string | null
): Promise<void> {
  if (!resend) return;

  const ticketUrl = `${APP_URL}/support/ticket/${ticketNumber}`;
  const displayName = name || 'there';

  await resend.emails.send({
    from: SUPPORT_EMAIL,
    replyTo: SUPPORT_REPLY_TO,
    to: email,
    subject: `[${ticketNumber}] Your support ticket has been resolved`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 16px; padding: 40px;">
      <h1 style="margin: 0 0 20px; font-size: 24px; color: #22c55e;">✓ Issue Resolved</h1>
      
      <p style="margin: 0 0 20px; line-height: 1.6; color: #999;">
        Hey ${displayName}! Your support ticket ${ticketNumber} has been marked as resolved.
      </p>
      
      ${
        resolution
          ? `
      <div style="background: #0d0d0d; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Resolution:</p>
        <p style="margin: 0; color: #e5e5e5; line-height: 1.6;">${resolution}</p>
      </div>
      `
          : ''
      }
      
      <p style="margin: 20px 0; line-height: 1.6; color: #999;">
        If this didn't fully resolve your issue, just reply to this email and we'll reopen your ticket.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${ticketUrl}?rate=true" style="display: inline-block; background: linear-gradient(135deg, #C9A227 0%, #B8941D 100%); color: #0a0a0a; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Rate Your Experience →
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  });
}

async function notifySupportTeam(
  ticketId: string,
  ticketNumber: string,
  subject: string,
  category: string,
  priority: string
): Promise<void> {
  // In production, this would notify via Slack, email, or internal system
  console.log(`[Support] New ticket: ${ticketNumber} - ${subject} (${category}, ${priority})`);

  // Could add webhook notification here
  // await notifySlack({ ticketId, ticketNumber, subject, category, priority });
}

async function notifyAgentOfReply(
  ticketId: string,
  ticketNumber: string,
  content: string
): Promise<void> {
  // Notify assigned agent or support team of user reply
  console.log(`[Support] User replied to ${ticketNumber}`);
}

// Export for use in AI tools
export { generateTicketNumber };
