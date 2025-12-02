/**
 * AI Assistant Email & Support Tools
 *
 * Enables the AI assistant to:
 * - Create and manage support tickets
 * - Send emails (with approval)
 * - Help with technical issues
 * - Provide IT support
 */

import { prisma } from '@cronkwaters/db';
import {
  createSupportTicket,
  replyToTicket,
  getUserTickets,
  getTicket,
  updateTicketStatus,
} from '@/lib/email/support-ticket-service';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateSubscriberPreferences,
} from '@/lib/email/newsletter-service';

// ============================================
// AI FUNCTION DEFINITIONS (OpenAI Format)
// ============================================

export const EMAIL_SUPPORT_AI_FUNCTIONS = [
  // Support Ticket Functions
  {
    name: 'createSupportTicket',
    description: `Create a support ticket on behalf of the user. Use this when the user reports a bug, has an issue, requests help with technical problems, or wants to contact support. The AI should gather: 1) Clear subject line 2) Detailed description 3) Category for proper routing. Be empathetic and reassure the user that help is on the way.`,
    parameters: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description:
            'A clear, concise subject line for the ticket (e.g., "Video call keeps disconnecting")',
        },
        description: {
          type: 'string',
          description:
            'Detailed description of the issue including any error messages, steps to reproduce, and what the user was trying to do',
        },
        category: {
          type: 'string',
          enum: [
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
          ],
          description: 'Category for proper ticket routing',
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
          description:
            'Priority level. Use HIGH for blocking issues, URGENT only if user explicitly indicates urgency or mentions deadlines',
        },
      },
      required: ['subject', 'description', 'category'],
    },
  },
  {
    name: 'viewMyTickets',
    description: `View the user's support tickets. Use this when the user wants to check on their open tickets, see ticket history, or track ticket status.`,
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'],
          },
          description: 'Filter by status. If not specified, shows all non-closed tickets.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of tickets to return (default: 10)',
        },
      },
    },
  },
  {
    name: 'viewTicketDetails',
    description: `View details of a specific support ticket including the conversation history. Use this when the user wants to see updates on a specific ticket.`,
    parameters: {
      type: 'object',
      properties: {
        ticketNumber: {
          type: 'string',
          description: 'The ticket number (e.g., RNRB-1234) or ticket ID',
        },
      },
      required: ['ticketNumber'],
    },
  },
  {
    name: 'replyToTicket',
    description: `Add a reply to an existing support ticket. Use this when the user wants to add more information to their ticket or respond to a support agent's question.`,
    parameters: {
      type: 'object',
      properties: {
        ticketNumber: {
          type: 'string',
          description: 'The ticket number (e.g., RNRB-1234)',
        },
        message: {
          type: 'string',
          description: 'The message to add to the ticket',
        },
      },
      required: ['ticketNumber', 'message'],
    },
  },

  // Newsletter Functions
  {
    name: 'subscribeToNewsletter',
    description: `Subscribe the user to the RNRB newsletter. Use when user expresses interest in receiving updates, tips, or news.`,
    parameters: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: "User's first name for personalization",
        },
        preferences: {
          type: 'object',
          properties: {
            productUpdates: { type: 'boolean', description: 'Receive product update emails' },
            tips: { type: 'boolean', description: 'Receive tips and tutorials' },
            events: { type: 'boolean', description: 'Receive event announcements' },
            community: { type: 'boolean', description: 'Receive community highlights' },
          },
          description: 'Email preferences',
        },
        frequency: {
          type: 'string',
          enum: ['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY'],
          description: 'How often to receive emails',
        },
      },
    },
  },
  {
    name: 'unsubscribeFromNewsletter',
    description: `Unsubscribe the user from the newsletter. Use when user wants to stop receiving newsletter emails.`,
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Optional reason for unsubscribing (for feedback)',
        },
      },
    },
  },
  {
    name: 'updateNewsletterPreferences',
    description: `Update the user's newsletter preferences. Use when user wants to change email frequency or types of emails received.`,
    parameters: {
      type: 'object',
      properties: {
        preferences: {
          type: 'object',
          properties: {
            productUpdates: { type: 'boolean' },
            tips: { type: 'boolean' },
            events: { type: 'boolean' },
            community: { type: 'boolean' },
          },
        },
        frequency: {
          type: 'string',
          enum: ['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY'],
        },
      },
    },
  },

  // IT Support / Troubleshooting Functions
  {
    name: 'troubleshootIssue',
    description: `Provide intelligent troubleshooting assistance for technical issues. The AI will analyze the problem and provide step-by-step guidance. Use this for issues like: audio/video problems, browser compatibility, login issues, sync problems, performance issues, etc.`,
    parameters: {
      type: 'object',
      properties: {
        issueType: {
          type: 'string',
          enum: [
            'AUDIO',
            'VIDEO',
            'LOGIN',
            'PERFORMANCE',
            'SYNC',
            'BROWSER',
            'STORAGE',
            'COLLABORATION',
            'OTHER',
          ],
          description: 'Type of technical issue',
        },
        description: {
          type: 'string',
          description: 'Description of the problem the user is experiencing',
        },
        browserInfo: {
          type: 'string',
          description: 'Browser and version if known (e.g., Chrome 120)',
        },
        deviceInfo: {
          type: 'string',
          description: 'Device type if relevant (e.g., MacBook Pro M2, iPhone 15)',
        },
      },
      required: ['issueType', 'description'],
    },
  },
  {
    name: 'checkSystemStatus',
    description: `Check the status of RNRB services to see if there are any known issues. Use this when users report problems that might be platform-wide.`,
    parameters: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          enum: ['ALL', 'VIDEO_CALLS', 'AI_ASSISTANT', 'STORAGE', 'AUTH', 'COLLABORATION'],
          description: 'Specific service to check, or ALL for general status',
        },
      },
    },
  },
  {
    name: 'sendFeedback',
    description: `Send feedback or a feature request to the RNRB team. Use when users share ideas, suggestions, or general feedback that isn't a support issue.`,
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['FEEDBACK', 'FEATURE_REQUEST', 'PRAISE', 'SUGGESTION'],
          description: 'Type of feedback',
        },
        message: {
          type: 'string',
          description: 'The feedback message',
        },
        area: {
          type: 'string',
          description:
            'Which area of the app this relates to (e.g., songwriting, collaboration, video calls)',
        },
      },
      required: ['type', 'message'],
    },
  },
];

// ============================================
// TOOL IMPLEMENTATION FUNCTIONS
// ============================================

/**
 * Create a support ticket for the user
 */
export async function aiCreateSupportTicket(
  userId: string,
  args: {
    subject: string;
    description: string;
    category: string;
    priority?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  ticketNumber?: string;
  ticketUrl?: string;
}> {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    return { success: false, message: 'Unable to create ticket - user email not found.' };
  }

  const result = await createSupportTicket({
    userId,
    email: user.email,
    name: user.name || undefined,
    subject: args.subject,
    description: args.description,
    category: args.category as any,
    priority: (args.priority || 'NORMAL') as any,
    aiSuggested: true,
  });

  if (result.success && result.ticketNumber) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com';
    return {
      ...result,
      ticketUrl: `${appUrl}/support/ticket/${result.ticketNumber}`,
    };
  }

  return result;
}

/**
 * View user's support tickets
 */
export async function aiViewUserTickets(
  userId: string,
  args: {
    status?: string[];
    limit?: number;
  }
): Promise<{
  success: boolean;
  tickets: Array<{
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    lastActivity: string;
    messageCount: number;
  }>;
  message: string;
}> {
  const result = await getUserTickets(userId, {
    status: args.status,
    limit: args.limit || 10,
  });

  const tickets = result.tickets.map((t: any) => ({
    ticketNumber: t.ticketNumber,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    category: t.category,
    createdAt: new Date(t.createdAt).toLocaleDateString(),
    lastActivity: new Date(t.lastActivityAt).toLocaleDateString(),
    messageCount: t._count.messages,
  }));

  if (tickets.length === 0) {
    return {
      success: true,
      tickets: [],
      message: "You don't have any support tickets yet.",
    };
  }

  return {
    success: true,
    tickets,
    message: `Found ${tickets.length} ticket(s).`,
  };
}

/**
 * View details of a specific ticket
 */
export async function aiViewTicketDetails(
  userId: string,
  args: { ticketNumber: string }
): Promise<{
  success: boolean;
  message: string;
  ticket?: any;
}> {
  // Find ticket by number or ID
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      OR: [{ ticketNumber: args.ticketNumber }, { id: args.ticketNumber }],
      userId,
    },
    include: {
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: 'asc' },
        select: {
          senderType: true,
          senderName: true,
          content: true,
          createdAt: true,
          isAiGenerated: true,
        },
      },
    },
  });

  if (!ticket) {
    return {
      success: false,
      message: 'Ticket not found. Please check the ticket number and try again.',
    };
  }

  return {
    success: true,
    message: `Ticket ${ticket.ticketNumber} details retrieved.`,
    ticket: {
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      lastActivity: ticket.lastActivityAt,
      messages: ticket.messages.map((m) => ({
        from: m.senderType === 'USER' ? 'You' : m.senderName || 'Support',
        content: m.content,
        date: new Date(m.createdAt).toLocaleString(),
        isAi: m.isAiGenerated,
      })),
    },
  };
}

/**
 * Reply to a ticket
 */
export async function aiReplyToTicket(
  userId: string,
  args: { ticketNumber: string; message: string }
): Promise<{ success: boolean; message: string }> {
  // Find ticket
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      OR: [{ ticketNumber: args.ticketNumber }, { id: args.ticketNumber }],
      userId,
    },
    select: { id: true, email: true },
  });

  if (!ticket) {
    return {
      success: false,
      message: 'Ticket not found. Please check the ticket number.',
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const result = await replyToTicket({
    ticketId: ticket.id,
    senderId: userId,
    senderName: user?.name || undefined,
    senderEmail: user?.email,
    senderType: 'USER',
    content: args.message,
  });

  return result;
}

/**
 * Subscribe to newsletter
 */
export async function aiSubscribeNewsletter(
  userId: string,
  args: {
    firstName?: string;
    preferences?: {
      productUpdates?: boolean;
      tips?: boolean;
      events?: boolean;
      community?: boolean;
    };
    frequency?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    return { success: false, message: 'Unable to subscribe - user email not found.' };
  }

  return subscribeToNewsletter({
    email: user.email,
    firstName: args.firstName || user.name?.split(' ')[0] || undefined,
    userId,
    preferences: args.preferences,
    frequency: (args.frequency as any) || 'WEEKLY',
    source: 'ai-assistant',
  });
}

/**
 * Unsubscribe from newsletter
 */
export async function aiUnsubscribeNewsletter(
  userId: string,
  args: { reason?: string }
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    return { success: false, message: 'Unable to unsubscribe - user email not found.' };
  }

  return unsubscribeFromNewsletter(user.email, args.reason);
}

/**
 * Update newsletter preferences
 */
export async function aiUpdateNewsletterPreferences(
  userId: string,
  args: {
    preferences?: {
      productUpdates?: boolean;
      tips?: boolean;
      events?: boolean;
      community?: boolean;
    };
    frequency?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    return { success: false, message: 'Unable to update preferences - user email not found.' };
  }

  return updateSubscriberPreferences(user.email, args.preferences || {}, args.frequency as any);
}

/**
 * Troubleshoot a technical issue
 */
export async function aiTroubleshootIssue(
  userId: string,
  args: {
    issueType: string;
    description: string;
    browserInfo?: string;
    deviceInfo?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  steps: string[];
  createTicket?: boolean;
}> {
  // Common troubleshooting steps based on issue type
  const troubleshootingGuides: Record<string, { steps: string[]; escalate?: boolean }> = {
    AUDIO: {
      steps: [
        '1. Check if your microphone is properly connected and selected in your browser',
        "2. Click the lock icon in your browser's address bar and ensure microphone permissions are granted",
        '3. Try using a different browser (Chrome or Firefox work best)',
        "4. Test your microphone in another app to confirm it's working",
        '5. If using headphones, try unplugging and replugging them',
        '6. Restart your browser completely',
      ],
    },
    VIDEO: {
      steps: [
        '1. Check camera permissions in your browser settings',
        '2. Ensure no other app is using your camera (close Zoom, FaceTime, etc.)',
        '3. Try a different browser - Chrome usually works best for video calls',
        '4. Check if your camera works in another app',
        '5. Make sure you have a stable internet connection (try speed test)',
        "6. If on a laptop, make sure the camera privacy slider isn't blocking the camera",
      ],
    },
    LOGIN: {
      steps: [
        '1. Clear your browser cookies and cache for this site',
        '2. Try using an incognito/private browser window',
        "3. Make sure you're using the same login method (Google, email) you originally signed up with",
        "4. Check if you're using the correct email address",
        '5. Try a different browser',
        '6. If using a password, try the "Forgot Password" option',
      ],
    },
    PERFORMANCE: {
      steps: [
        '1. Close other browser tabs and apps using memory',
        '2. Clear your browser cache',
        '3. Disable browser extensions temporarily',
        '4. Try a different browser',
        '5. Check your internet connection speed',
        '6. If on WiFi, try moving closer to your router or switching to ethernet',
      ],
    },
    SYNC: {
      steps: [
        '1. Check your internet connection',
        '2. Try refreshing the page (Cmd/Ctrl + Shift + R for hard refresh)',
        '3. Sign out and sign back in',
        '4. Check if changes appear when you refresh after a few seconds',
        '5. Try a different browser or device to see if changes synced',
      ],
    },
    BROWSER: {
      steps: [
        '1. Update your browser to the latest version',
        '2. Clear cache and cookies',
        '3. Disable extensions that might interfere (ad blockers, etc.)',
        '4. Try Chrome or Firefox - these work best with our app',
        '5. Enable JavaScript if disabled',
        '6. Try in incognito mode to rule out extension issues',
      ],
    },
    STORAGE: {
      steps: [
        '1. Check your current storage usage in Settings > Usage',
        '2. Remove old files you no longer need from your Library',
        '3. Consider compressing audio files before uploading',
        '4. Check if files are duplicated',
        '5. If you need more storage, you can purchase add-on storage packs',
      ],
    },
    COLLABORATION: {
      steps: [
        '1. Make sure your collaborator has accepted the invitation',
        '2. Check that the project visibility is set correctly',
        "3. Ensure you're both looking at the same project",
        '4. Try refreshing the page to sync the latest changes',
        '5. Check if collaborator has the correct permissions',
      ],
    },
    OTHER: {
      steps: [
        '1. Try refreshing the page',
        '2. Clear your browser cache and cookies',
        '3. Try a different browser',
        '4. Check your internet connection',
        '5. If the issue persists, let me know more details and I can create a support ticket',
      ],
      escalate: true,
    },
  };

  const guide = troubleshootingGuides[args.issueType] || troubleshootingGuides.OTHER;

  return {
    success: true,
    message: `Here are some troubleshooting steps for your ${args.issueType.toLowerCase()} issue:`,
    steps: guide.steps,
    createTicket: guide.escalate,
  };
}

/**
 * Check system status
 */
export async function aiCheckSystemStatus(
  userId: string,
  args: { service?: string }
): Promise<{
  success: boolean;
  message: string;
  status: {
    overall: 'operational' | 'degraded' | 'outage';
    services: Array<{ name: string; status: string; message?: string }>;
  };
}> {
  // In production, this would check actual service status
  // For now, return healthy status
  const services = [
    { name: 'Video Calls', status: 'operational' },
    { name: 'AI Assistant', status: 'operational' },
    { name: 'File Storage', status: 'operational' },
    { name: 'Authentication', status: 'operational' },
    { name: 'Real-time Collaboration', status: 'operational' },
  ];

  return {
    success: true,
    message: 'All systems are operational.',
    status: {
      overall: 'operational',
      services,
    },
  };
}

/**
 * Send feedback
 */
export async function aiSendFeedback(
  userId: string,
  args: {
    type: string;
    message: string;
    area?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    return { success: false, message: 'Unable to send feedback - user not found.' };
  }

  // Create as a support ticket with FEEDBACK category
  const result = await createSupportTicket({
    userId,
    email: user.email,
    name: user.name || undefined,
    subject: `[${args.type}] ${args.area ? `${args.area}: ` : ''}${args.message.substring(0, 50)}...`,
    description: args.message,
    category: 'FEEDBACK',
    priority: 'LOW',
    aiSuggested: true,
  });

  if (result.success) {
    return {
      success: true,
      message: `Thank you for your feedback! We really appreciate you taking the time to share your thoughts. ${
        args.type === 'FEATURE_REQUEST'
          ? 'Our team reviews all feature requests and uses them to guide our roadmap.'
          : "Your feedback helps us make Rock N' Roll Basement better for everyone."
      }`,
    };
  }

  return result;
}

// Export all functions for use in main assistant
export const emailSupportTools = {
  aiCreateSupportTicket,
  aiViewUserTickets,
  aiViewTicketDetails,
  aiReplyToTicket,
  aiSubscribeNewsletter,
  aiUnsubscribeNewsletter,
  aiUpdateNewsletterPreferences,
  aiTroubleshootIssue,
  aiCheckSystemStatus,
  aiSendFeedback,
};
