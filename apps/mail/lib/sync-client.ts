/**
 * Sync Client for RNRB Platform Integration
 * Reports email activity back to the main RNRB dashboard
 */

const SYNC_API_URL = process.env.NEXT_PUBLIC_RNRB_API_URL || 'https://rnrb.pro';
const SYNC_SECRET = process.env.SYNC_SECRET || 'rnrb-mail-sync-secret';

// Generate auth header for sync requests
function generateAuthHeader(): string {
  const timestamp = Date.now().toString();
  // In browser, we use a simpler approach - the server validates
  // For production, this should use Web Crypto API
  const signature = btoa(`${timestamp}:${SYNC_SECRET}`).slice(0, 64);
  return `${timestamp}:${signature}`;
}

interface SyncEvent {
  event: 'email_sent' | 'email_received' | 'login' | 'storage_update';
  email: string;
  data?: Record<string, unknown>;
}

class SyncClient {
  private email: string | null = null;
  private enabled: boolean = true;

  setEmail(email: string) {
    this.email = email;
  }

  clearEmail() {
    this.email = null;
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  private async sendEvent(event: SyncEvent): Promise<void> {
    if (!this.enabled || !this.email) return;

    try {
      const response = await fetch(`${SYNC_API_URL}/api/email/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Auth': generateAuthHeader(),
        },
        body: JSON.stringify({
          ...event,
          email: this.email,
        }),
      });

      if (!response.ok) {
        console.warn('[SYNC] Failed to sync event:', event.event, response.status);
      }
    } catch (error) {
      // Don't block on sync failures - just log
      console.warn('[SYNC] Error syncing event:', error);
    }
  }

  // Track when user logs in
  async trackLogin(): Promise<void> {
    await this.sendEvent({
      event: 'login',
      email: this.email!,
      data: {
        timestamp: new Date().toISOString(),
        source: 'webmail',
      },
    });
  }

  // Track when user sends an email
  async trackEmailSent(recipient?: string, subject?: string): Promise<void> {
    await this.sendEvent({
      event: 'email_sent',
      email: this.email!,
      data: {
        timestamp: new Date().toISOString(),
        recipient: recipient ? recipient.split('@')[1] : undefined, // Only domain for privacy
        hasSubject: !!subject,
      },
    });
  }

  // Track new emails received (called periodically or on refresh)
  async trackEmailsReceived(count: number): Promise<void> {
    if (count <= 0) return;

    await this.sendEvent({
      event: 'email_received',
      email: this.email!,
      data: {
        count,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Update storage usage
  async updateStorageUsage(bytesUsed: number): Promise<void> {
    await this.sendEvent({
      event: 'storage_update',
      email: this.email!,
      data: {
        storageUsedBytes: bytesUsed,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Fetch account settings from main platform
  async getAccountSettings(): Promise<{
    displayName?: string;
    signature?: string;
    signatureHtml?: string;
    avatar?: string;
    storageQuota?: string;
    storageUsed?: string;
  } | null> {
    if (!this.email) return null;

    try {
      const response = await fetch(
        `${SYNC_API_URL}/api/email/sync?email=${encodeURIComponent(this.email)}`,
        {
          headers: {
            'X-Sync-Auth': generateAuthHeader(),
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.account || null;
    } catch (error) {
      console.warn('[SYNC] Error fetching account settings:', error);
      return null;
    }
  }
}

export const syncClient = new SyncClient();
