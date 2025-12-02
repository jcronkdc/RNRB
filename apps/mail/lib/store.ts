import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jmapClient, type JMAPSession, type Mailbox, type Email } from './jmap-client';
import { syncClient } from './sync-client';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  session: JMAPSession | null;
  email: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

interface MailState {
  mailboxes: Mailbox[];
  selectedMailboxId: string | null;
  emails: Email[];
  selectedEmailId: string | null;
  selectedEmail: string | null;
  loading: boolean;
  error: string | null;
  totalEmails: number;

  fetchMailboxes: () => Promise<void>;
  fetchEmails: (mailboxId: string) => Promise<void>;
  selectMailbox: (mailboxId: string) => void;
  selectEmail: (emailId: string) => void;
  refreshEmails: () => Promise<void>;
  markAsRead: (emailIds: string[]) => Promise<void>;
  markAsUnread: (emailIds: string[]) => Promise<void>;
  deleteEmails: (emailIds: string[]) => Promise<void>;
  searchEmails: (query: string) => Promise<void>;
  clearState: () => void;
}

interface DraftData {
  to?: { email: string; name?: string }[];
  subject?: string;
  body?: string;
  inReplyTo?: string;
}

interface ComposeState {
  isOpen: boolean;
  isMinimized: boolean;
  draftData: DraftData | null;
  openCompose: (draftData?: DraftData) => void;
  closeCompose: () => void;
  toggleMinimize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      loading: false,
      session: null,
      email: null,

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const session = await jmapClient.authenticate(email, password);
          set({ isAuthenticated: true, session, email, loading: false });

          // Sync with main platform
          syncClient.setEmail(email);
          syncClient.trackLogin();
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          set({ loading: false });
          return false;
        }
      },

      logout: () => {
        jmapClient.clearCredentials();
        syncClient.clearEmail();
        set({ isAuthenticated: false, session: null, email: null });
        // Clear mail state too
        useMailStore.getState().clearState();
      },
    }),
    {
      name: 'rnrb-mail-auth',
      partialize: (state) => ({ email: state.email, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useMailStore = create<MailState>((set, get) => ({
  mailboxes: [],
  selectedMailboxId: null,
  emails: [],
  selectedEmailId: null,
  selectedEmail: null,
  loading: false,
  error: null,
  totalEmails: 0,

  fetchMailboxes: async () => {
    set({ loading: true, error: null });
    try {
      const mailboxes = await jmapClient.getMailboxes();
      // Sort mailboxes: system folders first, then alphabetically
      const sortedMailboxes = mailboxes.sort((a, b) => {
        const roleOrder: Record<string, number> = {
          inbox: 0,
          drafts: 1,
          sent: 2,
          archive: 3,
          junk: 4,
          trash: 5,
        };
        const aOrder = a.role ? (roleOrder[a.role] ?? 10) : 10;
        const bOrder = b.role ? (roleOrder[b.role] ?? 10) : 10;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
      });
      set({ mailboxes: sortedMailboxes, loading: false });

      // Auto-select inbox
      const inbox = sortedMailboxes.find((m) => m.role === 'inbox');
      if (inbox && !get().selectedMailboxId) {
        set({ selectedMailboxId: inbox.id });
        get().fetchEmails(inbox.id);
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchEmails: async (mailboxId: string) => {
    set({ loading: true, error: null });
    try {
      const { emails, total } = await jmapClient.getEmails(mailboxId);
      set({ emails, totalEmails: total, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  selectMailbox: (mailboxId: string) => {
    set({ selectedMailboxId: mailboxId, selectedEmailId: null, selectedEmail: null });
    get().fetchEmails(mailboxId);
  },

  selectEmail: (emailId: string) => {
    set({ selectedEmailId: emailId, selectedEmail: emailId });
    // Mark as read
    const email = get().emails.find((e) => e.id === emailId);
    if (email && !email.keywords?.['$seen']) {
      get().markAsRead([emailId]);
    }
  },

  refreshEmails: async () => {
    const { selectedMailboxId } = get();
    if (selectedMailboxId) {
      await get().fetchEmails(selectedMailboxId);
    }
  },

  markAsRead: async (emailIds: string[]) => {
    try {
      await jmapClient.markAsRead(emailIds);
      set((state) => ({
        emails: state.emails.map((e) =>
          emailIds.includes(e.id)
            ? { ...e, isRead: true, keywords: { ...e.keywords, $seen: true } }
            : e
        ),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAsUnread: async (emailIds: string[]) => {
    try {
      await jmapClient.markAsUnread(emailIds);
      set((state) => ({
        emails: state.emails.map((e) => {
          if (emailIds.includes(e.id)) {
            const { $seen, ...rest } = e.keywords || {};
            return { ...e, isRead: false, keywords: rest };
          }
          return e;
        }),
      }));
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  },

  deleteEmails: async (emailIds: string[]) => {
    const { mailboxes } = get();
    const trashMailbox = mailboxes.find((m) => m.role === 'trash');

    try {
      if (trashMailbox) {
        await jmapClient.moveToTrash(emailIds, trashMailbox.id);
      } else {
        await jmapClient.deleteEmails(emailIds);
      }
      set((state) => ({
        emails: state.emails.filter((e) => !emailIds.includes(e.id)),
        selectedEmailId: emailIds.includes(state.selectedEmailId || '')
          ? null
          : state.selectedEmailId,
        selectedEmail: emailIds.includes(state.selectedEmail || '') ? null : state.selectedEmail,
      }));
    } catch (error) {
      console.error('Failed to delete emails:', error);
    }
  },

  searchEmails: async (query: string) => {
    if (!query.trim()) {
      await get().refreshEmails();
      return;
    }

    set({ loading: true, error: null });
    try {
      const emails = await jmapClient.searchEmails(query);
      set({ emails, totalEmails: emails.length, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearState: () => {
    set({
      mailboxes: [],
      selectedMailboxId: null,
      emails: [],
      selectedEmailId: null,
      selectedEmail: null,
      loading: false,
      error: null,
      totalEmails: 0,
    });
  },
}));

export const useComposeStore = create<ComposeState>((set) => ({
  isOpen: false,
  isMinimized: false,
  draftData: null,

  openCompose: (draftData?: DraftData) => {
    set({ isOpen: true, isMinimized: false, draftData: draftData || null });
  },

  closeCompose: () => {
    set({ isOpen: false, isMinimized: false, draftData: null });
  },

  toggleMinimize: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },
}));
