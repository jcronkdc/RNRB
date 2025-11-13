/**
 * Type definitions for optional email dependencies
 */

declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface MailOptions {
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
  }

  export interface SentMessageInfo {
    messageId: string;
    accepted?: string[];
    rejected?: string[];
  }

  export interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<SentMessageInfo>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}

declare module 'stripe' {
  export default class Stripe {
    constructor(apiKey: string, options?: { apiVersion?: string });
    
    paymentIntents: {
      create(params: any): Promise<{ id: string }>;
    };
    
    checkout: {
      sessions: {
        create(params: any): Promise<{ url: string | null }>;
      };
    };
    
    webhooks: {
      constructEvent(payload: string | Buffer, signature: string, secret: string): any;
    };
    
    billingPortal: {
      sessions: {
        create(params: { customer: string; return_url: string }): Promise<{ url: string }>;
      };
    };
  }
}
