/**
 * Command Palette Hook
 *
 * The ultimate Tokyo Subway navigation system
 * Press Cmd+K to instantly go anywhere, do anything
 *
 * Features:
 * - Live global search across all content (projects, songs, users, messages, files, shows)
 * - Fuzzy search across all pages, actions, and content
 * - Keyboard shortcuts
 * - Recent items
 * - Quick actions (create project, start video, send message)
 * - Navigation (jump to any page)
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export type CommandAction = 'navigate' | 'create' | 'open' | 'send' | 'start' | 'toggle';

export type Command = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  action: CommandAction;
  keywords: string[];
  shortcut?: string;
  category:
    | 'navigation'
    | 'actions'
    | 'recent'
    | 'projects'
    | 'songs'
    | 'users'
    | 'messages'
    | 'files'
    | 'shows';
  handler: () => void;
  // For search results
  image?: string | null;
  subtitle?: string;
  meta?: Record<string, any>;
};

export type SearchResult = {
  id: string;
  type: 'project' | 'song' | 'user' | 'message' | 'file' | 'show';
  title: string;
  subtitle?: string;
  href: string;
  image?: string | null;
  [key: string]: any;
};

export type GlobalSearchResults = {
  projects?: SearchResult[];
  songs?: SearchResult[];
  users?: SearchResult[];
  messages?: SearchResult[];
  files?: SearchResult[];
  shows?: SearchResult[];
};

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalSearchResults>({});
  const [searchError, setSearchError] = useState<string | null>(null);
  const router = useRouter();
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K - Open command palette
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Cmd+Shift+T / Ctrl+Shift+T - Toggle theme
      if (e.key === 't' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        const currentTheme = localStorage.getItem('rnrb-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('rnrb-theme', newTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        window.dispatchEvent(new Event('theme-change'));
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
        setSearchResults({});
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Debounced global search
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults({});
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/search/global?q=${encodeURIComponent(query)}&limit=5`);

      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();
      setSearchResults(data.results || {});
    } catch (error) {
      console.error('Global search error:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults({});
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input with debounce
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (search.length >= 2) {
      setIsSearching(true);
      searchDebounceRef.current = setTimeout(() => {
        performSearch(search);
      }, 300);
    } else {
      setSearchResults({});
      setIsSearching(false);
    }

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [search, performSearch]);

  // Clear search results when closing
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSearchResults({});
      setSearchError(null);
    }
  }, [isOpen]);

  // Define all available static commands
  const staticCommands = useMemo<Command[]>(
    () => [
      // Navigation Commands
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        description: 'Go to your dashboard',
        icon: '🏠',
        action: 'navigate',
        keywords: ['dashboard', 'home', 'overview'],
        category: 'navigation',
        handler: () => {
          router.push('/dashboard');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-projects',
        title: 'Projects',
        description: 'View all your projects',
        icon: '📁',
        action: 'navigate',
        keywords: ['projects', 'albums', 'eps'],
        category: 'navigation',
        handler: () => {
          router.push('/projects');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-songwriting',
        title: 'Songwriting Studio',
        description: 'Open the collaborative songwriting tool',
        icon: '🎵',
        action: 'navigate',
        keywords: ['songwriting', 'studio', 'chords', 'lyrics', 'ai'],
        category: 'navigation',
        handler: () => {
          router.push('/songwriting');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-create',
        title: 'AI Sketches',
        description: 'Generate short music clips for inspiration (5-30 sec)',
        icon: '✨',
        action: 'navigate',
        keywords: ['create', 'ai', 'generate', 'music', 'track', 'sketch', 'loop'],
        category: 'navigation',
        handler: () => {
          router.push('/create');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-library',
        title: 'Library',
        description: 'Browse your audio files',
        icon: '🎧',
        action: 'navigate',
        keywords: ['library', 'files', 'audio', 'uploads'],
        category: 'navigation',
        handler: () => {
          router.push('/library');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-messages',
        title: 'Messages',
        description: 'Direct messages',
        icon: '💬',
        action: 'navigate',
        keywords: ['messages', 'chat', 'dm', 'direct'],
        category: 'navigation',
        handler: () => {
          router.push('/messages');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-studio',
        title: 'Studio',
        description: 'Recording studio with video',
        icon: '🎙️',
        action: 'navigate',
        keywords: ['studio', 'recording', 'video', 'session'],
        category: 'navigation',
        handler: () => {
          router.push('/studio');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-meet',
        title: 'Meet',
        description: 'Start or join a video call',
        icon: '📹',
        action: 'navigate',
        keywords: ['meet', 'video', 'call', 'zoom', 'conference', 'meeting', 'screen share'],
        category: 'navigation',
        handler: () => {
          router.push('/meet');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-masterclasses',
        title: 'Masterclasses',
        description: 'Learn from industry pros',
        icon: '🎓',
        action: 'navigate',
        keywords: ['masterclass', 'learn', 'education', 'course', 'lesson', 'teach', 'instructor'],
        category: 'navigation',
        handler: () => {
          router.push('/masterclasses');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-tours',
        title: 'Tours',
        description: 'Manage your tour schedule',
        icon: '🎸',
        action: 'navigate',
        keywords: ['tours', 'gigs', 'shows', 'concerts'],
        category: 'navigation',
        handler: () => {
          router.push('/tours');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-explore',
        title: 'Explore',
        description: 'Discover new music and artists',
        icon: '🌍',
        action: 'navigate',
        keywords: ['explore', 'discover', 'community', 'artists'],
        category: 'navigation',
        handler: () => {
          router.push('/explore');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        description: 'Account and preferences',
        icon: '⚙️',
        action: 'navigate',
        keywords: ['settings', 'preferences', 'account', 'profile'],
        category: 'navigation',
        handler: () => {
          router.push('/settings');
          setIsOpen(false);
        },
      },

      // Action Commands - Quick Creates
      {
        id: 'action-new-project',
        title: 'New Project',
        description: 'Create a new album or EP',
        icon: '➕',
        action: 'create',
        keywords: ['new', 'create', 'project', 'album'],
        shortcut: 'Cmd+N',
        category: 'actions',
        handler: () => {
          router.push('/projects/new');
          setIsOpen(false);
        },
      },
      {
        id: 'action-new-song',
        title: 'New Song',
        description: 'Start writing a new song',
        icon: '🎵',
        action: 'create',
        keywords: ['new', 'create', 'song', 'write', 'compose'],
        category: 'actions',
        handler: () => {
          router.push('/songwriting');
          setIsOpen(false);
        },
      },
      {
        id: 'action-schedule-show',
        title: 'Schedule Show',
        description: 'Add a new show or gig',
        icon: '📅',
        action: 'create',
        keywords: ['new', 'create', 'show', 'gig', 'concert', 'schedule', 'tour'],
        category: 'actions',
        handler: () => {
          router.push('/tours');
          setIsOpen(false);
        },
      },

      // Action Commands - Quick Actions
      {
        id: 'action-start-meeting',
        title: 'Start Meeting',
        description: 'Start an instant video call',
        icon: '📹',
        action: 'start',
        keywords: ['meeting', 'call', 'video', 'zoom', 'instant'],
        category: 'actions',
        handler: () => {
          router.push('/meet');
          setIsOpen(false);
        },
      },
      {
        id: 'action-upload-library',
        title: 'Upload to Library',
        description: 'Add files to your audio library',
        icon: '📤',
        action: 'open',
        keywords: ['upload', 'add', 'file', 'audio', 'library', 'import'],
        category: 'actions',
        handler: () => {
          router.push('/library?upload=true');
          setIsOpen(false);
        },
      },
      {
        id: 'action-view-notifications',
        title: 'View Notifications',
        description: 'Check your notifications',
        icon: '🔔',
        action: 'navigate',
        keywords: ['notifications', 'alerts', 'inbox', 'unread'],
        category: 'actions',
        handler: () => {
          router.push('/social/notifications');
          setIsOpen(false);
        },
      },
      {
        id: 'action-toggle-sidebar',
        title: 'Toggle Sidebar',
        description: 'Show or hide the sidebar',
        icon: '📐',
        action: 'toggle',
        keywords: ['sidebar', 'menu', 'collapse', 'expand', 'hide', 'show'],
        shortcut: 'Cmd+B',
        category: 'actions',
        handler: () => {
          const currentState = localStorage.getItem('sidebar-collapsed') === 'true';
          localStorage.setItem('sidebar-collapsed', String(!currentState));
          window.dispatchEvent(new Event('sidebar-toggle'));
          setIsOpen(false);
        },
      },
      {
        id: 'action-toggle-theme',
        title: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        icon: '🎨',
        action: 'toggle',
        keywords: ['theme', 'dark', 'light', 'mode', 'appearance', 'color'],
        shortcut: 'Cmd+Shift+T',
        category: 'actions',
        handler: () => {
          // Get current theme and toggle
          const currentTheme = localStorage.getItem('rnrb-theme') || 'dark';
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          localStorage.setItem('rnrb-theme', newTheme);
          // Apply theme
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
          // Dispatch event for theme provider
          window.dispatchEvent(new Event('theme-change'));
          setIsOpen(false);
        },
      },
      {
        id: 'action-theme-settings',
        title: 'Theme Settings',
        description: 'Open display & theme settings',
        icon: '🖼️',
        action: 'navigate',
        keywords: ['theme', 'display', 'settings', 'appearance', 'customize'],
        category: 'actions',
        handler: () => {
          router.push('/settings/display');
          setIsOpen(false);
        },
      },
      {
        id: 'action-quick-credits',
        title: 'View Credits',
        description: 'Check your AI credit balance',
        icon: '💰',
        action: 'navigate',
        keywords: ['credits', 'balance', 'ai', 'tokens', 'usage'],
        category: 'actions',
        handler: () => {
          router.push('/credits');
          setIsOpen(false);
        },
      },
      {
        id: 'action-email-settings',
        title: 'Email Settings',
        description: 'Manage your RNRB email',
        icon: '📧',
        action: 'navigate',
        keywords: ['email', 'mail', 'inbox', 'rnrb', 'settings'],
        category: 'actions',
        handler: () => {
          router.push('/settings/email');
          setIsOpen(false);
        },
      },
      {
        id: 'action-view-profile',
        title: 'My Profile',
        description: 'View your public profile',
        icon: '👤',
        action: 'navigate',
        keywords: ['profile', 'me', 'my', 'public', 'page'],
        category: 'actions',
        handler: () => {
          router.push('/social/profile');
          setIsOpen(false);
        },
      },
      {
        id: 'action-collaborate',
        title: 'Find Collaborators',
        description: 'Browse the collaboration board',
        icon: '🤝',
        action: 'navigate',
        keywords: ['collaborate', 'collab', 'find', 'musician', 'partner', 'team'],
        category: 'actions',
        handler: () => {
          router.push('/collaboration-needs');
          setIsOpen(false);
        },
      },
      {
        id: 'action-marketplace',
        title: 'Marketplace',
        description: 'Buy, sell, or trade gear',
        icon: '🛒',
        action: 'navigate',
        keywords: ['marketplace', 'gear', 'buy', 'sell', 'trade', 'equipment'],
        category: 'actions',
        handler: () => {
          router.push('/marketplace');
          setIsOpen(false);
        },
      },
      {
        id: 'action-view-pinned',
        title: 'View Pinned Items',
        description: 'See your pinned projects, songs, and files',
        icon: '📌',
        action: 'toggle',
        keywords: ['pinned', 'favorites', 'starred', 'quick', 'access', 'bookmarks'],
        category: 'actions',
        handler: () => {
          // Expand pinned section in sidebar
          localStorage.setItem('sidebar-pinned-expanded', 'true');
          localStorage.setItem('sidebar-collapsed', 'false');
          window.dispatchEvent(new Event('sidebar-toggle'));
          setIsOpen(false);
        },
      },
      {
        id: 'action-clear-pinned',
        title: 'Clear All Pinned Items',
        description: 'Remove all pinned items from sidebar',
        icon: '🗑️',
        action: 'toggle',
        keywords: ['clear', 'remove', 'unpin', 'all', 'pinned', 'reset'],
        category: 'actions',
        handler: () => {
          localStorage.setItem('sidebar-pinned-items', '[]');
          window.dispatchEvent(new Event('pinned-items-changed'));
          setIsOpen(false);
        },
      },
      {
        id: 'action-toggle-pinned',
        title: 'Toggle Pinned Section',
        description: 'Show or hide the pinned items section',
        icon: '📌',
        action: 'toggle',
        keywords: ['toggle', 'pinned', 'section', 'show', 'hide', 'expand', 'collapse'],
        category: 'actions',
        handler: () => {
          const currentState = localStorage.getItem('sidebar-pinned-expanded') !== 'false';
          localStorage.setItem('sidebar-pinned-expanded', String(!currentState));
          window.dispatchEvent(new Event('pinned-items-changed'));
          setIsOpen(false);
        },
      },
      {
        id: 'action-focus-mode',
        title: 'Enter Focus Mode',
        description: 'Distraction-free writing with no sidebar or navigation',
        icon: '🎯',
        action: 'toggle',
        keywords: [
          'focus',
          'mode',
          'distraction',
          'free',
          'zen',
          'write',
          'writing',
          'full',
          'screen',
          'clean',
        ],
        shortcut: 'Cmd+Shift+F',
        category: 'actions',
        handler: () => {
          window.dispatchEvent(new CustomEvent('focus-mode-change', { detail: { enabled: true } }));
          setIsOpen(false);
        },
      },
      {
        id: 'action-exit-focus-mode',
        title: 'Exit Focus Mode',
        description: 'Return to normal view with sidebar and navigation',
        icon: '🔙',
        action: 'toggle',
        keywords: ['exit', 'focus', 'mode', 'leave', 'normal', 'back', 'restore'],
        shortcut: 'Esc',
        category: 'actions',
        handler: () => {
          window.dispatchEvent(
            new CustomEvent('focus-mode-change', { detail: { enabled: false } })
          );
          setIsOpen(false);
        },
      },
    ],
    [router]
  );

  // Convert search results to commands
  const searchResultCommands = useMemo<Command[]>(() => {
    const commands: Command[] = [];

    // Projects
    if (searchResults.projects) {
      searchResults.projects.forEach((p) => {
        commands.push({
          id: `search-project-${p.id}`,
          title: p.title,
          subtitle: p.subtitle,
          description: p.subtitle,
          icon: p.visibility === 'private' ? '🔒' : '📁',
          image: p.image,
          action: 'navigate',
          keywords: [],
          category: 'projects',
          meta: { owner: p.owner, visibility: p.visibility },
          handler: () => {
            router.push(p.href);
            setIsOpen(false);
          },
        });
      });
    }

    // Songs
    if (searchResults.songs) {
      searchResults.songs.forEach((s) => {
        const statusIcon =
          {
            completed: '✅',
            in_progress: '✏️',
            idea: '💡',
          }[s.status as string] || '🎵';

        commands.push({
          id: `search-song-${s.id}`,
          title: s.title,
          subtitle: s.subtitle,
          description: s.subtitle,
          icon: s.isFavorite ? '⭐' : statusIcon,
          action: 'navigate',
          keywords: [],
          category: 'songs',
          meta: { status: s.status, isFavorite: s.isFavorite },
          handler: () => {
            router.push(s.href);
            setIsOpen(false);
          },
        });
      });
    }

    // Users
    if (searchResults.users) {
      searchResults.users.forEach((u) => {
        commands.push({
          id: `search-user-${u.id}`,
          title: u.title,
          subtitle: u.subtitle,
          description: u.subtitle || (u.isAvailable ? 'Available for collaboration' : ''),
          icon: u.isAvailable ? '🟢' : '👤',
          image: u.image,
          action: 'navigate',
          keywords: [],
          category: 'users',
          meta: { location: u.location, followerCount: u.followerCount },
          handler: () => {
            router.push(u.href);
            setIsOpen(false);
          },
        });
      });
    }

    // Messages
    if (searchResults.messages) {
      searchResults.messages.forEach((m) => {
        commands.push({
          id: `search-message-${m.id}`,
          title: m.title,
          subtitle: m.subtitle,
          description: m.subtitle,
          icon: '💬',
          image: m.image,
          action: 'navigate',
          keywords: [],
          category: 'messages',
          meta: { sender: m.sender, createdAt: m.createdAt },
          handler: () => {
            router.push(m.href);
            setIsOpen(false);
          },
        });
      });
    }

    // Files
    if (searchResults.files) {
      searchResults.files.forEach((f) => {
        const fileIcon =
          {
            audio: '🎵',
            image: '🖼️',
            midi: '🎹',
            document: '📄',
          }[f.fileType as string] || '📁';

        commands.push({
          id: `search-file-${f.id}`,
          title: f.title,
          subtitle: f.subtitle,
          description: f.subtitle,
          icon: f.isFavorite ? '⭐' : fileIcon,
          action: 'navigate',
          keywords: [],
          category: 'files',
          meta: { fileType: f.fileType, tags: f.tags },
          handler: () => {
            router.push(f.href);
            setIsOpen(false);
          },
        });
      });
    }

    // Shows
    if (searchResults.shows) {
      searchResults.shows.forEach((s) => {
        const showDate = new Date(s.date);
        const dateStr = showDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        commands.push({
          id: `search-show-${s.id}`,
          title: s.title,
          subtitle: `${dateStr} • ${s.subtitle}`,
          description: `${dateStr} • ${s.subtitle}`,
          icon: '🎸',
          action: 'navigate',
          keywords: [],
          category: 'shows',
          meta: { date: s.date, status: s.status, tour: s.tour },
          handler: () => {
            router.push(s.href);
            setIsOpen(false);
          },
        });
      });
    }

    return commands;
  }, [searchResults, router]);

  // Filter static commands based on search
  const filteredStaticCommands = useMemo(() => {
    if (!search) return staticCommands;

    const searchLower = search.toLowerCase();
    return staticCommands.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(searchLower))
      );
    });
  }, [search, staticCommands]);

  // Combine filtered commands with search results
  const filteredCommands = useMemo(() => {
    // If actively searching and have results, show search results first
    if (search.length >= 2 && searchResultCommands.length > 0) {
      // Show search results, then matching static commands
      return [...searchResultCommands, ...filteredStaticCommands.slice(0, 5)];
    }

    // No search or no results, show static commands
    return filteredStaticCommands;
  }, [search, searchResultCommands, filteredStaticCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};

    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Check if we have search results
  const hasSearchResults = useMemo(() => {
    return Object.keys(searchResults).length > 0;
  }, [searchResults]);

  const totalSearchResults = useMemo(() => {
    return Object.values(searchResults).reduce((acc, results) => acc + (results?.length || 0), 0);
  }, [searchResults]);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setSearch('');
    setSearchResults({});
  };

  return {
    isOpen,
    search,
    setSearch,
    isSearching,
    searchError,
    hasSearchResults,
    totalSearchResults,
    filteredCommands,
    groupedCommands,
    toggle,
    open,
    close,
  };
}
