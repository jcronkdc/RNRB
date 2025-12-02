/**
 * RNRB MCP Server Tool Definitions
 *
 * These tools are exposed via the Model Context Protocol and can be called
 * by any MCP-compatible client (Claude Desktop, AI Playground, etc.)
 */

import { z } from 'zod';

// ============================================
// TOOL SCHEMAS (for validation)
// ============================================

export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(5).describe('A clear, concise subject line for the ticket'),
  description: z.string().min(20).describe('Detailed description of the issue'),
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
    .describe('Category for proper ticket routing'),
  priority: z
    .enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
    .optional()
    .describe('Priority level (default: NORMAL)'),
});

export const ViewTicketsSchema = z.object({
  status: z
    .array(z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED']))
    .optional()
    .describe('Filter by status'),
  limit: z.number().min(1).max(50).optional().describe('Max tickets to return'),
});

export const ViewTicketDetailsSchema = z.object({
  ticketNumber: z.string().describe('Ticket number (e.g., RNRB-1234) or ticket ID'),
});

export const ReplyToTicketSchema = z.object({
  ticketNumber: z.string().describe('Ticket number (e.g., RNRB-1234)'),
  message: z.string().min(1).describe('Message to add to the ticket'),
});

export const SubscribeNewsletterSchema = z.object({
  firstName: z.string().optional().describe('First name for personalization'),
  preferences: z
    .object({
      productUpdates: z.boolean().optional(),
      tips: z.boolean().optional(),
      events: z.boolean().optional(),
      community: z.boolean().optional(),
    })
    .optional()
    .describe('Email preferences'),
  frequency: z
    .enum(['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY'])
    .optional()
    .describe('How often to receive emails'),
});

export const UnsubscribeNewsletterSchema = z.object({
  reason: z.string().optional().describe('Optional reason for unsubscribing'),
});

export const TroubleshootIssueSchema = z.object({
  issueType: z
    .enum([
      'AUDIO',
      'VIDEO',
      'LOGIN',
      'PERFORMANCE',
      'SYNC',
      'BROWSER',
      'STORAGE',
      'COLLABORATION',
      'OTHER',
    ])
    .describe('Type of technical issue'),
  description: z.string().describe('Description of the problem'),
  browserInfo: z.string().optional().describe('Browser and version if known'),
  deviceInfo: z.string().optional().describe('Device type if relevant'),
});

export const SendFeedbackSchema = z.object({
  type: z
    .enum(['FEEDBACK', 'FEATURE_REQUEST', 'PRAISE', 'SUGGESTION'])
    .describe('Type of feedback'),
  message: z.string().min(10).describe('The feedback message'),
  area: z.string().optional().describe('Which area of the app this relates to'),
});

// ============================================
// TOOL DEFINITIONS (MCP Format)
// ============================================

export const RNRB_TOOLS = [
  {
    name: 'create_support_ticket',
    description: `Create a support ticket for Rock N' Roll Basement. Use this when reporting bugs, requesting help, or having technical issues. The ticket will be assigned a tracking number and you'll receive email updates.`,
    inputSchema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'Clear subject line (e.g., "Video call keeps disconnecting")',
        },
        description: {
          type: 'string',
          description: 'Detailed description including error messages and steps to reproduce',
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
          description: 'Category for routing',
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
          description: 'Priority level',
        },
      },
      required: ['subject', 'description', 'category'],
    },
  },
  {
    name: 'view_my_tickets',
    description: `View your support tickets. Shows ticket numbers, status, and last activity.`,
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'],
          },
          description: 'Filter by status',
        },
        limit: {
          type: 'number',
          description: 'Maximum tickets to return (default: 10)',
        },
      },
    },
  },
  {
    name: 'view_ticket_details',
    description: `View full details of a specific support ticket including the conversation history.`,
    inputSchema: {
      type: 'object',
      properties: {
        ticketNumber: {
          type: 'string',
          description: 'Ticket number (e.g., RNRB-1234)',
        },
      },
      required: ['ticketNumber'],
    },
  },
  {
    name: 'reply_to_ticket',
    description: `Add a reply to an existing support ticket. Use to provide more information or respond to support agent questions.`,
    inputSchema: {
      type: 'object',
      properties: {
        ticketNumber: {
          type: 'string',
          description: 'Ticket number (e.g., RNRB-1234)',
        },
        message: {
          type: 'string',
          description: 'Message to add',
        },
      },
      required: ['ticketNumber', 'message'],
    },
  },
  {
    name: 'subscribe_newsletter',
    description: `Subscribe to the Rock N' Roll Basement newsletter for product updates, tips, and community news.`,
    inputSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'First name for personalization',
        },
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
  {
    name: 'unsubscribe_newsletter',
    description: `Unsubscribe from the Rock N' Roll Basement newsletter.`,
    inputSchema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Optional reason for unsubscribing',
        },
      },
    },
  },
  {
    name: 'troubleshoot_issue',
    description: `Get intelligent troubleshooting help for technical issues like audio/video problems, login issues, sync problems, etc.`,
    inputSchema: {
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
          description: 'Type of issue',
        },
        description: {
          type: 'string',
          description: 'Description of the problem',
        },
        browserInfo: {
          type: 'string',
          description: 'Browser info if known',
        },
        deviceInfo: {
          type: 'string',
          description: 'Device info if relevant',
        },
      },
      required: ['issueType', 'description'],
    },
  },
  {
    name: 'check_system_status',
    description: `Check the status of Rock N' Roll Basement services to see if there are known issues.`,
    inputSchema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          enum: ['ALL', 'VIDEO_CALLS', 'AI_ASSISTANT', 'STORAGE', 'AUTH', 'COLLABORATION'],
          description: 'Service to check',
        },
      },
    },
  },
  {
    name: 'send_feedback',
    description: `Send feedback, feature requests, or suggestions to the RNRB team.`,
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['FEEDBACK', 'FEATURE_REQUEST', 'PRAISE', 'SUGGESTION'],
        },
        message: {
          type: 'string',
          description: 'Your feedback',
        },
        area: {
          type: 'string',
          description: 'Area of the app (e.g., songwriting, collaboration)',
        },
      },
      required: ['type', 'message'],
    },
  },
];

export type ToolName = (typeof RNRB_TOOLS)[number]['name'];
