/**
 * JMAP Client for Stalwart Mail Server
 * Handles all email operations via JMAP protocol
 * Uses proxy API to avoid CORS issues
 */

// Use local proxy API instead of direct Stalwart connection
const JMAP_URL = '/api/jmap';

export interface JMAPSession {
  accountId: string;
  username: string;
  capabilities: Record<string, unknown>;
  primaryAccounts: Record<string, string>;
}

export interface Mailbox {
  id: string;
  name: string;
  role: string | null;
  parentId: string | null;
  sortOrder: number;
  totalEmails: number;
  unreadEmails: number;
  totalThreads: number;
  unreadThreads: number;
}

export interface EmailAddress {
  name: string | null;
  email: string;
}

export interface Email {
  id: string;
  threadId: string;
  mailboxIds: Record<string, boolean>;
  keywords: Record<string, boolean>;
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo: EmailAddress[];
  receivedAt: string;
  sentAt: string;
  preview: string;
  hasAttachment: boolean;
  size: number;
  bodyValues?: Record<string, { value: string; isEncodingProblem: boolean }>;
  textBody?: Array<{ partId: string; type: string }>;
  htmlBody?: Array<{ partId: string; type: string }>;
  attachments?: Array<{
    partId: string;
    blobId: string;
    name: string;
    type: string;
    size: number;
  }>;
}

export interface Thread {
  id: string;
  emailIds: string[];
}

class JMAPClient {
  private credentials: string | null = null;
  private session: JMAPSession | null = null;

  setCredentials(email: string, password: string) {
    this.credentials = btoa(`${email}:${password}`);
  }

  clearCredentials() {
    this.credentials = null;
    this.session = null;
  }

  private async request(body: unknown): Promise<unknown> {
    if (!this.credentials) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(JMAP_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error(`JMAP request failed: ${response.status}`);
    }

    return response.json();
  }

  async authenticate(email: string, password: string): Promise<JMAPSession> {
    this.setCredentials(email, password);

    try {
      // Get session/capabilities
      const response = await fetch(JMAP_URL, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${this.credentials}`,
        },
      });

      if (!response.ok) {
        this.clearCredentials();
        throw new Error('Authentication failed');
      }

      const sessionData = await response.json();

      this.session = {
        accountId: Object.keys(sessionData.accounts || {})[0] || email.split('@')[0],
        username: email,
        capabilities: sessionData.capabilities || {},
        primaryAccounts: sessionData.primaryAccounts || {},
      };

      return this.session;
    } catch (error) {
      this.clearCredentials();
      throw error;
    }
  }

  async getMailboxes(): Promise<Mailbox[]> {
    if (!this.session) throw new Error('Not authenticated');

    const response = (await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Mailbox/get',
          {
            accountId: this.session.accountId,
          },
          'a',
        ],
      ],
    })) as { methodResponses: Array<[string, { list: Mailbox[] }]> };

    return response.methodResponses[0][1].list;
  }

  async getEmails(
    mailboxId: string,
    options: {
      limit?: number;
      position?: number;
      sort?: Array<{ property: string; isAscending: boolean }>;
    } = {}
  ): Promise<{ emails: Email[]; total: number }> {
    if (!this.session) throw new Error('Not authenticated');

    const {
      limit = 50,
      position = 0,
      sort = [{ property: 'receivedAt', isAscending: false }],
    } = options;

    const response = (await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Email/query',
          {
            accountId: this.session.accountId,
            filter: { inMailbox: mailboxId },
            sort,
            position,
            limit,
            calculateTotal: true,
          },
          'a',
        ],
        [
          'Email/get',
          {
            accountId: this.session.accountId,
            '#ids': { resultOf: 'a', name: 'Email/query', path: '/ids' },
            properties: [
              'id',
              'threadId',
              'mailboxIds',
              'keywords',
              'subject',
              'from',
              'to',
              'cc',
              'receivedAt',
              'sentAt',
              'preview',
              'hasAttachment',
              'size',
            ],
          },
          'b',
        ],
      ],
    })) as {
      methodResponses: [[string, { ids: string[]; total: number }], [string, { list: Email[] }]];
    };

    return {
      emails: response.methodResponses[1][1].list,
      total: response.methodResponses[0][1].total,
    };
  }

  async getEmail(emailId: string): Promise<Email> {
    if (!this.session) throw new Error('Not authenticated');

    const response = (await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Email/get',
          {
            accountId: this.session.accountId,
            ids: [emailId],
            properties: [
              'id',
              'threadId',
              'mailboxIds',
              'keywords',
              'subject',
              'from',
              'to',
              'cc',
              'bcc',
              'replyTo',
              'receivedAt',
              'sentAt',
              'preview',
              'hasAttachment',
              'size',
              'bodyValues',
              'textBody',
              'htmlBody',
              'attachments',
            ],
            fetchTextBodyValues: true,
            fetchHTMLBodyValues: true,
          },
          'a',
        ],
      ],
    })) as { methodResponses: [[string, { list: Email[] }]] };

    const email = response.methodResponses[0][1].list[0];
    if (!email) throw new Error('Email not found');
    return email;
  }

  async markAsRead(emailIds: string[]): Promise<void> {
    if (!this.session) throw new Error('Not authenticated');

    await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Email/set',
          {
            accountId: this.session.accountId,
            update: emailIds.reduce(
              (acc, id) => {
                acc[id] = { 'keywords/$seen': true };
                return acc;
              },
              {} as Record<string, unknown>
            ),
          },
          'a',
        ],
      ],
    });
  }

  async markAsUnread(emailIds: string[]): Promise<void> {
    if (!this.session) throw new Error('Not authenticated');

    await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Email/set',
          {
            accountId: this.session.accountId,
            update: emailIds.reduce(
              (acc, id) => {
                acc[id] = { 'keywords/$seen': null };
                return acc;
              },
              {} as Record<string, unknown>
            ),
          },
          'a',
        ],
      ],
    });
  }

  async moveToTrash(emailIds: string[], trashMailboxId: string): Promise<void> {
    if (!this.session) throw new Error('Not authenticated');

    await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Email/set',
          {
            accountId: this.session.accountId,
            update: emailIds.reduce(
              (acc, id) => {
                acc[id] = { mailboxIds: { [trashMailboxId]: true } };
                return acc;
              },
              {} as Record<string, unknown>
            ),
          },
          'a',
        ],
      ],
    });
  }

  async deleteEmails(emailIds: string[]): Promise<void> {
    if (!this.session) throw new Error('Not authenticated');

    await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Email/set',
          {
            accountId: this.session.accountId,
            destroy: emailIds,
          },
          'a',
        ],
      ],
    });
  }

  async sendEmail(email: {
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    textBody?: string;
    htmlBody?: string;
    replyToEmailId?: string;
  }): Promise<string> {
    if (!this.session) throw new Error('Not authenticated');

    const bodyValue: Record<string, { value: string; charset: string }> = {};
    const textParts: Array<{ partId: string; type: string }> = [];
    const htmlParts: Array<{ partId: string; type: string }> = [];

    if (email.textBody) {
      bodyValue['text'] = { value: email.textBody, charset: 'utf-8' };
      textParts.push({ partId: 'text', type: 'text/plain' });
    }
    if (email.htmlBody) {
      bodyValue['html'] = { value: email.htmlBody, charset: 'utf-8' };
      htmlParts.push({ partId: 'html', type: 'text/html' });
    }

    const response = (await this.request({
      using: [
        'urn:ietf:params:jmap:core',
        'urn:ietf:params:jmap:mail',
        'urn:ietf:params:jmap:submission',
      ],
      methodCalls: [
        [
          'Email/set',
          {
            accountId: this.session.accountId,
            create: {
              draft: {
                mailboxIds: {}, // Will be set to Drafts
                to: email.to,
                cc: email.cc || [],
                bcc: email.bcc || [],
                subject: email.subject,
                bodyValues: bodyValue,
                textBody: textParts.length ? textParts : undefined,
                htmlBody: htmlParts.length ? htmlParts : undefined,
                ...(email.replyToEmailId && { inReplyTo: email.replyToEmailId }),
              },
            },
          },
          'create',
        ],
        [
          'EmailSubmission/set',
          {
            accountId: this.session.accountId,
            create: {
              sendIt: {
                emailId: '#draft',
              },
            },
            onSuccessDestroyEmail: ['#sendIt'],
          },
          'send',
        ],
      ],
    })) as {
      methodResponses: [
        [string, { created?: { draft: { id: string } }; notCreated?: unknown }],
        [string, { created?: { sendIt: { emailId: string } }; notCreated?: unknown }],
      ];
    };

    const created = response.methodResponses[1][1].created;
    if (!created) {
      throw new Error('Failed to send email');
    }

    return created.sendIt.emailId;
  }

  async searchEmails(query: string, options: { limit?: number } = {}): Promise<Email[]> {
    if (!this.session) throw new Error('Not authenticated');

    const { limit = 50 } = options;

    const response = (await this.request({
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail'],
      methodCalls: [
        [
          'Email/query',
          {
            accountId: this.session.accountId,
            filter: { text: query },
            sort: [{ property: 'receivedAt', isAscending: false }],
            limit,
          },
          'a',
        ],
        [
          'Email/get',
          {
            accountId: this.session.accountId,
            '#ids': { resultOf: 'a', name: 'Email/query', path: '/ids' },
            properties: [
              'id',
              'threadId',
              'mailboxIds',
              'keywords',
              'subject',
              'from',
              'to',
              'receivedAt',
              'preview',
              'hasAttachment',
            ],
          },
          'b',
        ],
      ],
    })) as { methodResponses: [[string, unknown], [string, { list: Email[] }]] };

    return response.methodResponses[1][1].list;
  }
}

export const jmapClient = new JMAPClient();
