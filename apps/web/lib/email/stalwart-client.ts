/**
 * Stalwart Mail Server Client
 *
 * This client handles all communication with the Stalwart mail server
 * for user provisioning, management, and mail operations.
 *
 * Stalwart uses JMAP (JSON Meta Application Protocol) for modern email access
 * and a REST API for administrative operations.
 */

const STALWART_API_URL = process.env.STALWART_API_URL || 'http://mail.rnrb.me:8080';
const STALWART_API_KEY = process.env.STALWART_API_KEY || '';
const STALWART_ADMIN_USER = process.env.STALWART_ADMIN_USER || 'admin';
const STALWART_ADMIN_PASSWORD = process.env.STALWART_ADMIN_PASSWORD || '';

// Storage quotas in bytes
export const STORAGE_QUOTAS = {
  free: 1 * 1024 * 1024 * 1024, // 1 GB
  creator: 10 * 1024 * 1024 * 1024, // 10 GB
  studio: 50 * 1024 * 1024 * 1024, // 50 GB
  pro: 100 * 1024 * 1024 * 1024, // 100 GB
} as const;

export interface StalwartUser {
  name: string; // username (without domain)
  email: string; // full email address
  displayName?: string;
  quota?: number; // storage quota in bytes
  enabled?: boolean;
  type?: 'individual' | 'group' | 'list';
}

export interface StalwartMailbox {
  id: string;
  name: string;
  role?: string; // inbox, sent, drafts, trash, spam, etc.
  totalMessages: number;
  unreadMessages: number;
  totalBytes: number;
}

export interface StalwartMessage {
  id: string;
  threadId: string;
  mailboxIds: string[];
  from: { name?: string; email: string }[];
  to: { name?: string; email: string }[];
  cc?: { name?: string; email: string }[];
  subject: string;
  preview: string;
  receivedAt: string;
  size: number;
  hasAttachment: boolean;
  isUnread: boolean;
  isFlagged: boolean;
}

export interface CreateUserOptions {
  username: string;
  domain: string;
  displayName?: string;
  password: string;
  quota?: number;
}

export interface SendEmailOptions {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  attachments?: {
    filename: string;
    contentType: string;
    content: string; // base64 encoded
  }[];
}

/**
 * Base fetch wrapper for Stalwart API calls
 */
async function stalwartFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // Use Basic Auth for admin API
    const authHeader = Buffer.from(`${STALWART_ADMIN_USER}:${STALWART_ADMIN_PASSWORD}`).toString(
      'base64'
    );

    const response = await fetch(`${STALWART_API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[STALWART] API error: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Stalwart API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[STALWART] Connection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check if Stalwart server is reachable
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await stalwartFetch('/api/health');
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Create a new email account on Stalwart
 */
export async function createUser(options: CreateUserOptions): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  const { username, domain, displayName, password, quota } = options;
  const email = `${username}@${domain}`;

  // Stalwart uses a specific format for creating accounts
  const userData = {
    type: 'individual',
    name: username,
    secrets: [password], // Stalwart will hash this
    emails: [email],
    quota: quota || STORAGE_QUOTAS.free,
    description: displayName || username,
    memberOf: [], // Groups/lists
    // Enable all mail protocols
    enabledPermissions: ['jmap', 'imap', 'smtp', 'sieve'],
  };

  const result = await stalwartFetch<{ id: string }>('/api/principal', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (result.success && result.data) {
    console.log(`[STALWART] Created user: ${email}`);
    return { success: true, userId: result.data.id };
  }

  return { success: false, error: result.error };
}

/**
 * Delete an email account
 */
export async function deleteUser(username: string): Promise<boolean> {
  const result = await stalwartFetch(`/api/principal/${username}`, {
    method: 'DELETE',
  });
  return result.success;
}

/**
 * Update user settings
 */
export async function updateUser(
  username: string,
  updates: Partial<{
    displayName: string;
    quota: number;
    enabled: boolean;
  }>
): Promise<boolean> {
  const updateData: Record<string, any> = {};

  if (updates.displayName !== undefined) {
    updateData.description = updates.displayName;
  }
  if (updates.quota !== undefined) {
    updateData.quota = updates.quota;
  }
  if (updates.enabled !== undefined) {
    updateData.enabled = updates.enabled;
  }

  const result = await stalwartFetch(`/api/principal/${username}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });

  return result.success;
}

/**
 * Update user password (for app passwords)
 */
export async function updatePassword(username: string, newPassword: string): Promise<boolean> {
  const result = await stalwartFetch(`/api/principal/${username}`, {
    method: 'PATCH',
    body: JSON.stringify({
      secrets: [newPassword],
    }),
  });

  return result.success;
}

/**
 * Add an app-specific password
 */
export async function addAppPassword(
  username: string,
  appPassword: string,
  appName: string
): Promise<boolean> {
  // Stalwart supports multiple passwords per account
  // We add a new one with a specific format
  const result = await stalwartFetch(`/api/principal/${username}/app-password`, {
    method: 'POST',
    body: JSON.stringify({
      name: appName,
      password: appPassword,
    }),
  });

  return result.success;
}

/**
 * Remove an app password
 */
export async function removeAppPassword(username: string, appPasswordId: string): Promise<boolean> {
  const result = await stalwartFetch(`/api/principal/${username}/app-password/${appPasswordId}`, {
    method: 'DELETE',
  });

  return result.success;
}

/**
 * Get user storage usage
 */
export async function getStorageUsage(username: string): Promise<{
  used: number;
  quota: number;
} | null> {
  const result = await stalwartFetch<{ quota: number; used: number }>(
    `/api/principal/${username}/quota`
  );

  if (result.success && result.data) {
    return {
      used: result.data.used,
      quota: result.data.quota,
    };
  }

  return null;
}

/**
 * Get mailboxes for a user (via JMAP)
 */
export async function getMailboxes(email: string, password: string): Promise<StalwartMailbox[]> {
  // JMAP request to get mailboxes
  const jmapRequest = {
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [['Mailbox/get', { accountId: email }, 'a']],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const mailboxes = data.methodResponses?.[0]?.[1]?.list || [];

    return mailboxes.map((mb: any) => ({
      id: mb.id,
      name: mb.name,
      role: mb.role,
      totalMessages: mb.totalEmails || 0,
      unreadMessages: mb.unreadEmails || 0,
      totalBytes: mb.totalBytes || 0,
    }));
  } catch (error) {
    console.error('[STALWART] Failed to get mailboxes:', error);
    return [];
  }
}

/**
 * Get messages from a mailbox
 */
export async function getMessages(
  email: string,
  password: string,
  mailboxId: string,
  options: {
    limit?: number;
    offset?: number;
    sort?: 'date' | 'from' | 'subject';
    sortDesc?: boolean;
  } = {}
): Promise<StalwartMessage[]> {
  const { limit = 50, offset = 0, sort = 'date', sortDesc = true } = options;

  const jmapRequest = {
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      // First, query for message IDs
      [
        'Email/query',
        {
          accountId: email,
          filter: { inMailbox: mailboxId },
          sort: [{ property: 'receivedAt', isAscending: !sortDesc }],
          position: offset,
          limit,
        },
        'query',
      ],
      // Then, get the message details
      [
        'Email/get',
        {
          accountId: email,
          '#ids': {
            resultOf: 'query',
            name: 'Email/query',
            path: '/ids',
          },
          properties: [
            'id',
            'threadId',
            'mailboxIds',
            'from',
            'to',
            'cc',
            'subject',
            'preview',
            'receivedAt',
            'size',
            'hasAttachment',
            'keywords',
          ],
        },
        'get',
      ],
    ],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const messages = data.methodResponses?.[1]?.[1]?.list || [];

    return messages.map((msg: any) => ({
      id: msg.id,
      threadId: msg.threadId,
      mailboxIds: Object.keys(msg.mailboxIds || {}),
      from: msg.from || [],
      to: msg.to || [],
      cc: msg.cc,
      subject: msg.subject || '(No Subject)',
      preview: msg.preview || '',
      receivedAt: msg.receivedAt,
      size: msg.size || 0,
      hasAttachment: msg.hasAttachment || false,
      isUnread: !msg.keywords?.['$seen'],
      isFlagged: msg.keywords?.['$flagged'] || false,
    }));
  } catch (error) {
    console.error('[STALWART] Failed to get messages:', error);
    return [];
  }
}

/**
 * Get a single message with full body
 */
export async function getMessage(
  email: string,
  password: string,
  messageId: string
): Promise<{
  id: string;
  subject: string;
  from: { name?: string; email: string }[];
  to: { name?: string; email: string }[];
  cc?: { name?: string; email: string }[];
  receivedAt: string;
  htmlBody?: string;
  textBody?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
  }[];
} | null> {
  const jmapRequest = {
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      [
        'Email/get',
        {
          accountId: email,
          ids: [messageId],
          properties: [
            'id',
            'subject',
            'from',
            'to',
            'cc',
            'receivedAt',
            'htmlBody',
            'textBody',
            'attachments',
            'bodyValues',
          ],
          fetchHTMLBodyValues: true,
          fetchTextBodyValues: true,
        },
        'get',
      ],
    ],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const msg = data.methodResponses?.[0]?.[1]?.list?.[0];

    if (!msg) return null;

    return {
      id: msg.id,
      subject: msg.subject || '(No Subject)',
      from: msg.from || [],
      to: msg.to || [],
      cc: msg.cc,
      receivedAt: msg.receivedAt,
      htmlBody: msg.bodyValues?.[msg.htmlBody?.[0]?.partId]?.value,
      textBody: msg.bodyValues?.[msg.textBody?.[0]?.partId]?.value,
      attachments: msg.attachments?.map((att: any) => ({
        id: att.blobId,
        name: att.name,
        type: att.type,
        size: att.size,
      })),
    };
  } catch (error) {
    console.error('[STALWART] Failed to get message:', error);
    return null;
  }
}

/**
 * Send an email
 */
export async function sendEmail(
  email: string,
  password: string,
  options: SendEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const jmapRequest = {
    using: [
      'urn:ietf:params:jmap:core',
      'urn:ietf:params:jmap:mail',
      'urn:ietf:params:jmap:submission',
    ],
    methodCalls: [
      // Create the email
      [
        'Email/set',
        {
          accountId: email,
          create: {
            draft: {
              from: [{ email: options.from }],
              to: options.to.map((e) => ({ email: e })),
              cc: options.cc?.map((e) => ({ email: e })),
              bcc: options.bcc?.map((e) => ({ email: e })),
              subject: options.subject,
              bodyValues: {
                body: {
                  value: options.textBody || options.htmlBody || '',
                  isEncodingProblem: false,
                  isTruncated: false,
                },
              },
              textBody: options.textBody ? [{ partId: 'body', type: 'text/plain' }] : undefined,
              htmlBody: options.htmlBody ? [{ partId: 'body', type: 'text/html' }] : undefined,
              mailboxIds: {}, // Will be set to Drafts then moved
            },
          },
        },
        'create',
      ],
      // Submit for delivery
      [
        'EmailSubmission/set',
        {
          accountId: email,
          create: {
            submission: {
              emailId: '#draft',
              envelope: {
                mailFrom: { email: options.from },
                rcptTo: [
                  ...options.to.map((e) => ({ email: e })),
                  ...(options.cc?.map((e) => ({ email: e })) || []),
                  ...(options.bcc?.map((e) => ({ email: e })) || []),
                ],
              },
            },
          },
          onSuccessDestroyEmail: ['#submission'], // Remove from Drafts after sending
        },
        'submit',
      ],
    ],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to send email' };
    }

    const data = await response.json();

    // Check for errors
    const submitResult = data.methodResponses?.find((r: any) => r[0] === 'EmailSubmission/set');
    if (submitResult?.[1]?.notCreated) {
      const error = Object.values(submitResult[1].notCreated)[0] as any;
      return { success: false, error: error?.description || 'Failed to send' };
    }

    return { success: true, messageId: submitResult?.[1]?.created?.submission?.id };
  } catch (error) {
    console.error('[STALWART] Failed to send email:', error);
    return { success: false, error: 'Connection failed' };
  }
}

/**
 * Mark message as read/unread
 */
export async function setMessageRead(
  email: string,
  password: string,
  messageId: string,
  isRead: boolean
): Promise<boolean> {
  const jmapRequest = {
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      [
        'Email/set',
        {
          accountId: email,
          update: {
            [messageId]: {
              [`keywords/$seen`]: isRead,
            },
          },
        },
        'set',
      ],
    ],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Move message to a mailbox (trash, archive, etc.)
 */
export async function moveMessage(
  email: string,
  password: string,
  messageId: string,
  toMailboxId: string
): Promise<boolean> {
  const jmapRequest = {
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      [
        'Email/set',
        {
          accountId: email,
          update: {
            [messageId]: {
              mailboxIds: { [toMailboxId]: true },
            },
          },
        },
        'set',
      ],
    ],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Delete message permanently
 */
export async function deleteMessage(
  email: string,
  password: string,
  messageId: string
): Promise<boolean> {
  const jmapRequest = {
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      [
        'Email/set',
        {
          accountId: email,
          destroy: [messageId],
        },
        'set',
      ],
    ],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Search emails
 */
export async function searchEmails(
  email: string,
  password: string,
  query: string,
  options: {
    mailboxId?: string;
    limit?: number;
  } = {}
): Promise<StalwartMessage[]> {
  const { mailboxId, limit = 50 } = options;

  const filter: any = {
    text: query,
  };

  if (mailboxId) {
    filter.inMailbox = mailboxId;
  }

  const jmapRequest = {
    using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
    methodCalls: [
      [
        'Email/query',
        {
          accountId: email,
          filter,
          sort: [{ property: 'receivedAt', isAscending: false }],
          limit,
        },
        'query',
      ],
      [
        'Email/get',
        {
          accountId: email,
          '#ids': {
            resultOf: 'query',
            name: 'Email/query',
            path: '/ids',
          },
          properties: [
            'id',
            'threadId',
            'mailboxIds',
            'from',
            'to',
            'subject',
            'preview',
            'receivedAt',
            'size',
            'hasAttachment',
            'keywords',
          ],
        },
        'get',
      ],
    ],
  };

  try {
    const authHeader = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await fetch(`${STALWART_API_URL}/jmap`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jmapRequest),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const messages = data.methodResponses?.[1]?.[1]?.list || [];

    return messages.map((msg: any) => ({
      id: msg.id,
      threadId: msg.threadId,
      mailboxIds: Object.keys(msg.mailboxIds || {}),
      from: msg.from || [],
      to: msg.to || [],
      subject: msg.subject || '(No Subject)',
      preview: msg.preview || '',
      receivedAt: msg.receivedAt,
      size: msg.size || 0,
      hasAttachment: msg.hasAttachment || false,
      isUnread: !msg.keywords?.['$seen'],
      isFlagged: msg.keywords?.['$flagged'] || false,
    }));
  } catch (error) {
    console.error('[STALWART] Search failed:', error);
    return [];
  }
}
