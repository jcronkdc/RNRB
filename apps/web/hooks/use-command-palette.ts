/**
 * Command Palette Hook
 *
 * The ultimate Tokyo Subway navigation system
 * Press Cmd+K to instantly go anywhere, do anything
 *
 * Features:
 * - Fuzzy search across all pages, actions, and content
 * - Keyboard shortcuts
 * - Recent items
 * - Quick actions (create project, start video, send message)
 * - Navigation (jump to any page)
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

export type CommandAction = 'navigate' | 'create' | 'open' | 'send' | 'start' | 'toggle';

export type Command = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  action: CommandAction;
  keywords: string[];
  shortcut?: string;
  category: 'navigation' | 'actions' | 'recent' | 'projects' | 'songs';
  handler: () => void;
};

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Listen for keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Define all available commands
  const allCommands = useMemo<Command[]>(
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
        id: 'nav-live',
        title: 'Go Live',
        description: 'Stream to your fans',
        icon: '📺',
        action: 'navigate',
        keywords: ['live', 'stream', 'streaming', 'broadcast', 'twitch', 'fans'],
        category: 'navigation',
        handler: () => {
          router.push('/live');
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

      // Action Commands
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
        id: 'action-go-live',
        title: 'Go Live Now',
        description: 'Start streaming to your fans',
        icon: '🔴',
        action: 'start',
        keywords: ['live', 'stream', 'broadcast', 'go live'],
        category: 'actions',
        handler: () => {
          router.push('/live/go');
          setIsOpen(false);
        },
      },
      {
        id: 'action-search',
        title: 'Search Everything',
        description: 'Search across all projects and songs',
        icon: '🔍',
        action: 'open',
        keywords: ['search', 'find', 'look'],
        shortcut: 'Cmd+/',
        category: 'actions',
        handler: () => {
          // This would open a search modal
          console.log('Search modal');
          setIsOpen(false);
        },
      },
    ],
    [router]
  );

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands;

    const searchLower = search.toLowerCase();
    return allCommands.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(searchLower))
      );
    });
  }, [search, allCommands]);

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

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setSearch('');
  };

  return {
    isOpen,
    search,
    setSearch,
    filteredCommands,
    groupedCommands,
    toggle,
    open,
    close,
  };
}
