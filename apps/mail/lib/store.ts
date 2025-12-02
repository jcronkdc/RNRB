import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jmapClient, type JMAPSession, type Mailbox, type Email } from './jmap-client';

interface AuthState {
  isAuthenticated: boolean;
  session: JMAPSession | null;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface MailState {
  mailboxes: Mailbox[];
  selectedMailboxId: string | null;
  emails: Email[];
  selectedEmailId: string | null;
  isLoading: boolean;
  error: string | null;
  totalEmails: number;

  fetchMailboxes: () => Promise<void>;
  selectMailbox: (mailboxId: string) => Promise<void>;
  selectEmail: (emailId: string) => void;
  refreshEmails: () => Promise<void>;
  markAsRead: (emailIds: string[]) => Promise<void>;
  markAsUnread: (emailIds: string[]) => Promise<void>;
  deleteEmails: (emailIds: string[]) => Promise<void>;
  searchEmails: (query: string) => Promise<void>;
}

interface ComposeState {
  isOpen: boolean;
  replyTo: Email | null;
  openCompose: (replyTo?: Email) => void;
  closeCompose: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      session: null,
      email: null,

      login: async (email: string, password: string) => {
        const session = await jmapClient.authenticate(email, password);
        set({ isAuthenticated: true, session, email });
      },

      logout: () => {
        jmapClient.clearCredentials();
        set({ isAuthenticated: false, session: null, email: null });
        // Clear mail state too
        useMailStore.getState().clearState();
      },
    }),
    {
      name: 'rnrb-mail-auth',
      partialize: (state) => ({ email: state.email }),
    }
  )
);

export const useMailStore = create<MailState & { clearState: () => void }>((set, get) => ({
  mailboxes: [],
  selectedMailboxId: null,
  emails: [],
  selectedEmailId: null,
  isLoading: false,
  error: null,
  totalEmails: 0,

  fetchMailboxes: async () => {
    set({ isLoading: true, error: null });
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
      set({ mailboxes: sortedMailboxes, isLoading: false });

      // Auto-select inbox
      const inbox = sortedMailboxes.find((m) => m.role === 'inbox');
      if (inbox && !get().selectedMailboxId) {
        get().selectMailbox(inbox.id);
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectMailbox: async (mailboxId: string) => {
    set({ selectedMailboxId: mailboxId, selectedEmailId: null, isLoading: true, error: null });
    try {
      const { emails, total } = await jmapClient.getEmails(mailboxId);
      set({ emails, totalEmails: total, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectEmail: (emailId: string) => {
    set({ selectedEmailId: emailId });
    // Mark as read
    const email = get().emails.find((e) => e.id === emailId);
    if (email && !email.keywords?.['$seen']) {
      get().markAsRead([emailId]);
    }
  },

  refreshEmails: async () => {
    const { selectedMailboxId } = get();
    if (selectedMailboxId) {
      await get().selectMailbox(selectedMailboxId);
    }
  },

  markAsRead: async (emailIds: string[]) => {
    try {
      await jmapClient.markAsRead(emailIds);
      set((state) => ({
        emails: state.emails.map((e) =>
          emailIds.includes(e.id) ? { ...e, keywords: { ...e.keywords, $seen: true } } : e
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
            return { ...e, keywords: rest };
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

    set({ isLoading: true, error: null });
    try {
      const emails = await jmapClient.searchEmails(query);
      set({ emails, totalEmails: emails.length, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearState: () => {
    set({
      mailboxes: [],
      selectedMailboxId: null,
      emails: [],
      selectedEmailId: null,
      isLoading: false,
      error: null,
      totalEmails: 0,
    });
  },
}));

export const useComposeStore = create<ComposeState>((set) => ({
  isOpen: false,
  replyTo: null,

  openCompose: (replyTo?: Email) => {
    set({ isOpen: true, replyTo: replyTo || null });
  },

  closeCompose: () => {
    set({ isOpen: false, replyTo: null });
  },
}));
