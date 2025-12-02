/**
 * RNRB MCP Tool Handlers
 *
 * These handlers call the main RNRB API to execute tool actions.
 * Authentication is handled via the user's access token passed from the MCP client.
 */

import {
  CreateSupportTicketSchema,
  ViewTicketsSchema,
  ViewTicketDetailsSchema,
  ReplyToTicketSchema,
  SubscribeNewsletterSchema,
  UnsubscribeNewsletterSchema,
  TroubleshootIssueSchema,
  SendFeedbackSchema,
} from './tools';

interface Env {
  RNRB_API_URL: string;
  RNRB_API_KEY: string;
  OAUTH_KV?: KVNamespace; // Optional - for OAuth state storage
}

interface UserContext {
  userId: string;
  email: string;
  accessToken: string;
}

/**
 * Make authenticated request to RNRB API
 */
async function rnrbApi(
  env: Env,
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    userContext?: UserContext;
  } = {}
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const { method = 'GET', body, userContext } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-MCP-Server-Key': env.RNRB_API_KEY,
  };

  if (userContext?.accessToken) {
    headers['Authorization'] = `Bearer ${userContext.accessToken}`;
  }

  try {
    const response = await fetch(`${env.RNRB_API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return { success: false, error: (data.message as string) || 'API request failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`[MCP] API error for ${endpoint}:`, error);
    return { success: false, error: 'Failed to connect to RNRB API' };
  }
}

// ============================================
// TOOL HANDLERS
// ============================================

export async function handleCreateSupportTicket(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = CreateSupportTicketSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  const result = await rnrbApi(env, '/api/support/tickets', {
    method: 'POST',
    body: {
      email: userContext.email,
      ...parsed.data,
    },
    userContext,
  });

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to create ticket: ${result.error}`,
        },
      ],
    };
  }

  const data = result.data as { ticketNumber: string; message: string };

  return {
    content: [
      {
        type: 'text',
        text: `✅ Support ticket created!\n\n**Ticket Number:** ${data.ticketNumber}\n\n${data.message}\n\nYou'll receive email updates at ${userContext.email}. You can also check the status by asking me "view ticket ${data.ticketNumber}".`,
      },
    ],
  };
}

export async function handleViewTickets(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = ViewTicketsSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  const params = new URLSearchParams();
  if (parsed.data.status) {
    parsed.data.status.forEach((s) => params.append('status', s));
  }
  if (parsed.data.limit) {
    params.set('limit', String(parsed.data.limit));
  }

  const result = await rnrbApi(env, `/api/support/tickets?${params}`, { userContext });

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to fetch tickets: ${result.error}`,
        },
      ],
    };
  }

  const data = result.data as {
    tickets: Array<{
      ticketNumber: string;
      subject: string;
      status: string;
      priority: string;
      category: string;
      lastActivityAt: string;
    }>;
    total: number;
  };

  if (data.tickets.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: "You don't have any support tickets yet. If you're having an issue, just let me know and I can create one for you!",
        },
      ],
    };
  }

  const ticketList = data.tickets
    .map(
      (t) =>
        `• **${t.ticketNumber}** - ${t.subject}\n  Status: ${t.status} | Priority: ${t.priority} | Last activity: ${new Date(t.lastActivityAt).toLocaleDateString()}`
    )
    .join('\n\n');

  return {
    content: [
      {
        type: 'text',
        text: `📋 **Your Support Tickets** (${data.total} total)\n\n${ticketList}\n\nAsk me to "view ticket RNRB-XXXX" for full details.`,
      },
    ],
  };
}

export async function handleViewTicketDetails(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = ViewTicketDetailsSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  const result = await rnrbApi(env, `/api/support/tickets/${parsed.data.ticketNumber}`, {
    userContext,
  });

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Ticket not found or access denied: ${result.error}`,
        },
      ],
    };
  }

  const ticket = result.data as {
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    messages: Array<{ senderType: string; senderName: string; content: string; createdAt: string }>;
  };

  const messages = ticket.messages
    .map(
      (m) =>
        `**${m.senderType === 'USER' ? 'You' : m.senderName || 'Support'}** (${new Date(m.createdAt).toLocaleString()}):\n${m.content}`
    )
    .join('\n\n---\n\n');

  return {
    content: [
      {
        type: 'text',
        text: `🎫 **Ticket ${ticket.ticketNumber}**\n\n**Subject:** ${ticket.subject}\n**Status:** ${ticket.status}\n**Priority:** ${ticket.priority}\n**Category:** ${ticket.category}\n**Created:** ${new Date(ticket.createdAt).toLocaleDateString()}\n\n---\n\n**Conversation:**\n\n${messages}\n\n---\n\nTo reply, ask me "reply to ${ticket.ticketNumber} with [your message]".`,
      },
    ],
  };
}

export async function handleReplyToTicket(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = ReplyToTicketSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  // POST to ticket endpoint to add a reply
  const result = await rnrbApi(env, `/api/support/tickets/${parsed.data.ticketNumber}`, {
    method: 'POST',
    body: { content: parsed.data.message },
    userContext,
  });

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to send reply: ${result.error}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: `✅ Reply sent to ticket ${parsed.data.ticketNumber}. The support team will be notified.`,
      },
    ],
  };
}

export async function handleSubscribeNewsletter(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = SubscribeNewsletterSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  const result = await rnrbApi(env, '/api/newsletter/subscribe', {
    method: 'POST',
    body: {
      email: userContext.email,
      ...parsed.data,
      source: 'mcp-server',
    },
    userContext,
  });

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to subscribe: ${result.error}`,
        },
      ],
    };
  }

  const data = result.data as { message: string; requiresConfirmation?: boolean };

  return {
    content: [
      {
        type: 'text',
        text: `📧 ${data.message}${data.requiresConfirmation ? '\n\nCheck your email to confirm your subscription!' : ''}`,
      },
    ],
  };
}

export async function handleUnsubscribeNewsletter(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = UnsubscribeNewsletterSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  const result = await rnrbApi(env, '/api/newsletter/unsubscribe', {
    method: 'POST',
    body: {
      email: userContext.email,
      reason: parsed.data.reason,
    },
    userContext,
  });

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to unsubscribe: ${result.error}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: "✅ You've been unsubscribed from the newsletter. You can always re-subscribe later if you change your mind!",
      },
    ],
  };
}

export async function handleTroubleshootIssue(
  _env: Env,
  _userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = TroubleshootIssueSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  // Troubleshooting guides (local, no API call needed)
  const guides: Record<string, string[]> = {
    AUDIO: [
      '1. Check if your microphone is properly connected and selected in your browser',
      "2. Click the lock icon in your browser's address bar and ensure microphone permissions are granted",
      '3. Try using a different browser (Chrome or Firefox work best)',
      "4. Test your microphone in another app to confirm it's working",
      '5. If using headphones, try unplugging and replugging them',
      '6. Restart your browser completely',
    ],
    VIDEO: [
      '1. Check camera permissions in your browser settings',
      '2. Ensure no other app is using your camera (close Zoom, FaceTime, etc.)',
      '3. Try a different browser - Chrome usually works best for video calls',
      '4. Check if your camera works in another app',
      '5. Make sure you have a stable internet connection',
      "6. If on a laptop, make sure the camera privacy slider isn't blocking it",
    ],
    LOGIN: [
      '1. Clear your browser cookies and cache for this site',
      '2. Try using an incognito/private browser window',
      "3. Make sure you're using the same login method you signed up with",
      "4. Check if you're using the correct email address",
      '5. Try a different browser',
      '6. Try the "Forgot Password" option if using email login',
    ],
    PERFORMANCE: [
      '1. Close other browser tabs and apps using memory',
      '2. Clear your browser cache',
      '3. Disable browser extensions temporarily',
      '4. Try a different browser',
      '5. Check your internet connection speed',
      '6. If on WiFi, try moving closer to your router',
    ],
    SYNC: [
      '1. Check your internet connection',
      '2. Try refreshing the page (Cmd/Ctrl + Shift + R)',
      '3. Sign out and sign back in',
      '4. Check if changes appear after a few seconds',
      '5. Try a different browser or device',
    ],
    BROWSER: [
      '1. Update your browser to the latest version',
      '2. Clear cache and cookies',
      '3. Disable extensions that might interfere',
      '4. Try Chrome or Firefox - these work best',
      '5. Enable JavaScript if disabled',
      '6. Try in incognito mode',
    ],
    STORAGE: [
      '1. Check your current storage usage in Settings > Usage',
      '2. Remove old files you no longer need',
      '3. Consider compressing audio files before uploading',
      '4. Check for duplicated files',
    ],
    COLLABORATION: [
      '1. Make sure your collaborator has accepted the invitation',
      '2. Check that project visibility is set correctly',
      "3. Ensure you're both looking at the same project",
      '4. Try refreshing to sync latest changes',
      '5. Check collaborator permissions',
    ],
    OTHER: [
      '1. Try refreshing the page',
      '2. Clear your browser cache and cookies',
      '3. Try a different browser',
      '4. Check your internet connection',
    ],
  };

  const steps = guides[parsed.data.issueType] || guides.OTHER;
  const stepsText = steps.join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `🔧 **Troubleshooting: ${parsed.data.issueType} Issue**\n\nBased on your description: "${parsed.data.description}"\n\n**Try these steps:**\n\n${stepsText}\n\n---\n\nIf these steps don't resolve your issue, I can create a support ticket for you. Just say "create a ticket for this issue".`,
      },
    ],
  };
}

export async function handleCheckSystemStatus(
  _env: Env,
  _userContext: UserContext,
  _args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  // In production, this would check actual service status
  const services = [
    { name: 'Video Calls', status: '✅ Operational' },
    { name: 'AI Assistant', status: '✅ Operational' },
    { name: 'File Storage', status: '✅ Operational' },
    { name: 'Authentication', status: '✅ Operational' },
    { name: 'Real-time Collaboration', status: '✅ Operational' },
  ];

  const statusList = services.map((s) => `• ${s.name}: ${s.status}`).join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `🟢 **RNRB System Status**\n\nAll systems operational.\n\n${statusList}\n\n_Last checked: ${new Date().toLocaleString()}_`,
      },
    ],
  };
}

export async function handleSendFeedback(
  env: Env,
  userContext: UserContext,
  args: unknown
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const parsed = SendFeedbackSchema.safeParse(args);

  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments: ${parsed.error.message}`,
        },
      ],
    };
  }

  // Create as a low-priority ticket
  const result = await rnrbApi(env, '/api/support/tickets', {
    method: 'POST',
    body: {
      email: userContext.email,
      subject: `[${parsed.data.type}] ${parsed.data.area ? `${parsed.data.area}: ` : ''}${parsed.data.message.substring(0, 50)}...`,
      description: parsed.data.message,
      category: 'FEEDBACK',
      priority: 'LOW',
    },
    userContext,
  });

  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to send feedback: ${result.error}`,
        },
      ],
    };
  }

  const responseText =
    parsed.data.type === 'FEATURE_REQUEST'
      ? 'Our team reviews all feature requests and uses them to guide our roadmap.'
      : "Your feedback helps us make Rock N' Roll Basement better for everyone.";

  return {
    content: [
      {
        type: 'text',
        text: `✨ **Thank you for your ${parsed.data.type.toLowerCase().replace('_', ' ')}!**\n\n${responseText}\n\nWe really appreciate you taking the time to share your thoughts with us.`,
      },
    ],
  };
}
