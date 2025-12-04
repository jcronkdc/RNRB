'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Sparkles,
  FolderOpen,
  Library,
  Users,
  UserSearch,
  Compass,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Headphones,
  MessageSquare,
  LogOut,
  Loader2,
  Globe,
  X,
  FlaskConical,
  Share2,
  Target,
  Trophy,
  Guitar,
  Heart,
  GraduationCap,
  Video,
  ShoppingBag,
  Tag,
  Palette,
  Mail,
  Bell,
  Folder,
  Lock,
  FileText,
  CheckCircle,
  Edit3,
  AlertCircle,
  User,
  Pin,
  Plus,
  Music,
  FileAudio,
  Image as ImageIcon,
  File,
  Calendar,
  MapPin,
  // Custom musician icons
  SongManuscript,
  VintageCondenserMic,
  BroadcastTower,
  TourCalendar,
  SessionFolder,
  MusiciansMultiTool,
  BandMembers,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect, createContext, useContext } from 'react';

import { useThemeSafe } from '@/components/theme';
import { useToast } from '@/hooks/useToast';

// ============================================
// Mobile Menu Context
// ============================================

interface MobileMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
});

export const useMobileMenu = () => useContext(MobileMenuContext);

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <MobileMenuContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

// ============================================
// Navigation Structure - The Musician's Journey
// ============================================

interface NavSection {
  title: string;
  description: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  visibility: 'private' | 'org' | 'public';
}

interface Song {
  id: string;
  title: string;
  status: 'draft' | 'in_progress' | 'needs_review' | 'complete';
  isFavorite?: boolean;
  projectId?: string | null;
  project?: {
    name: string;
    slug: string;
  } | null;
}

interface Conversation {
  id: string;
  type: string;
  participant: {
    id: string;
    name: string | null;
    image: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  isPinned: boolean;
}

interface LibraryFile {
  id: string;
  name: string;
  type: string;
  isFavorite: boolean;
  mimeType: string;
}

interface Show {
  id: string;
  name: string;
  slug: string;
  date: string;
  status: string;
  venue?: {
    name: string;
    city: string;
    state: string;
  } | null;
}

// Pinned Items for sidebar quick access
interface PinnedItem {
  id: string;
  type: 'project' | 'song' | 'file' | 'conversation';
  name: string;
  url: string;
  meta?: {
    projectName?: string;
    status?: string;
    fileType?: string;
    avatar?: string;
  };
  pinnedAt: number;
}

// Organized around THE JOURNEY, not features
const navSections: NavSection[] = [
  {
    title: 'Home',
    description: 'Your workshop',
    items: [{ label: 'Workshop', href: '/dashboard', icon: Home }],
  },
  {
    title: 'Social',
    description: 'Your community',
    items: [
      { label: 'Feed', href: '/social', icon: Sparkles },
      { label: 'Explore', href: '/social/explore', icon: Compass },
      { label: 'My Network', href: '/social/network', icon: Users },
      { label: 'Friends', href: '/social/friends', icon: Heart, badge: 'NEW' },
      { label: 'Discover', href: '/social/discover', icon: UserSearch },
      { label: 'Messages', href: '/social/messages', icon: MessageSquare },
      { label: 'Notifications', href: '/social/notifications', icon: Bell },
      { label: 'My Profile', href: '/social/profile', icon: Guitar },
    ],
  },
  {
    title: 'Create',
    description: 'Make your music',
    items: [
      { label: 'Songwriting', href: '/songwriting', icon: SongManuscript },
      { label: 'Sketches', href: '/create', icon: Sparkles, badge: 'BETA' },
      { label: 'Projects', href: '/projects', icon: SessionFolder },
      { label: 'RNRB Labs', href: '/labs', icon: FlaskConical },
    ],
  },
  {
    title: 'Grow',
    description: 'Develop your craft',
    items: [
      { label: 'Masterclasses', href: '/masterclasses', icon: GraduationCap, badge: 'NEW' },
      { label: 'Practice Log', href: '/tools?tool=practice-logger', icon: Target },
      { label: 'Library', href: '/library', icon: Library },
      { label: 'Toolbox', href: '/tools', icon: MusiciansMultiTool },
      { label: 'Studio', href: '/studio', icon: VintageCondenserMic },
    ],
  },
  {
    title: 'Connect',
    description: 'Communicate',
    items: [
      { label: 'RNRB Mail', href: '/settings/email', icon: Mail, badge: 'NEW' },
      { label: 'Meet', href: '/meet', icon: Video, badge: 'NEW' },
      { label: 'Collaborate', href: '/collaboration', icon: BandMembers },
      { label: 'Collab Board', href: '/collaboration-needs', icon: Headphones },
    ],
  },
  {
    title: 'Perform',
    description: 'Hit the stage',
    items: [
      { label: 'Go Live', href: '/live', icon: BroadcastTower, badge: 'NEW' },
      { label: 'Shows & Tours', href: '/tours', icon: TourCalendar },
      { label: 'Opportunities', href: '/opportunities', icon: Compass },
      { label: 'My Website', href: '/sites', icon: Globe },
      { label: 'Share', href: '/share', icon: Share2 },
    ],
  },
  {
    title: 'Earn',
    description: 'Get paid',
    items: [
      { label: 'Revenue', href: '/revenue', icon: CreditCard },
      { label: 'My Merch', href: '/my-merch', icon: ShoppingBag, badge: 'EARN' },
      { label: 'RNRB Store', href: '/merch', icon: Tag },
    ],
  },
  {
    title: 'Marketplace',
    description: 'Buy, sell & trade gear',
    items: [
      { label: 'Browse Gear', href: '/marketplace', icon: ShoppingBag },
      { label: 'My Listings', href: '/marketplace/my-listings', icon: Tag },
      { label: 'Messages', href: '/marketplace/messages', icon: MessageSquare },
      { label: 'Saved Items', href: '/marketplace?tab=saved', icon: Heart },
    ],
  },
];

// Bottom settings items
const settingsItems: NavItem[] = [
  { label: 'Credits', href: '/credits', icon: CreditCard },
  { label: 'Theme', href: '/settings/display', icon: Palette },
  { label: 'Settings', href: '/settings', icon: Settings },
];

// ============================================
// Theme-Aware Sidebar Logo Component
// ============================================

interface SidebarLogoProps {
  isCollapsed: boolean;
  isMobile: boolean;
  isHovered: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

function SidebarLogo({
  isCollapsed,
  isMobile,
  isHovered,
  onClose,
  onToggleCollapse,
}: SidebarLogoProps) {
  const { resolvedTheme } = useThemeSafe();

  // logo-dark.png = white logo (for dark backgrounds)
  // logo-light.png = dark logo (for light backgrounds)
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <div
      className="flex h-16 items-center justify-between px-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <Link href="/" className="flex items-center">
        <motion.img
          src={logoSrc}
          alt="Rock N' Roll Basement"
          animate={{
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-10 w-auto"
          style={{
            maxWidth: isCollapsed && !isMobile ? '40px' : '180px',
            transition: 'max-width 0.3s ease',
          }}
        />
      </Link>

      {/* Close button on mobile, collapse toggle on desktop */}
      {isMobile ? (
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={onToggleCollapse}
          className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-110 hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
          title={isCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// Sidebar Navigation Component
// ============================================

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load saved preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { isOpen: mobileMenuOpen, setIsOpen: setMobileMenuOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Home',
    'Create',
    'Grow',
    'Connect',
    'Perform',
    'Earn',
    'Marketplace',
  ]); // All sections expanded by default
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsExpanded, setProjectsExpanded] = useState(() => {
    // Load saved preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-projects-expanded');
      return saved !== 'false'; // Default to true if not set
    }
    return true;
  });
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Songs state
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsExpanded, setSongsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-songs-expanded');
      return saved !== 'false'; // Default to true if not set
    }
    return true;
  });
  const [loadingSongs, setLoadingSongs] = useState(false);

  // Messages/Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesExpanded, setMessagesExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-messages-expanded');
      return saved !== 'false'; // Default to true if not set
    }
    return true;
  });
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Notifications state
  const [notificationCount, setNotificationCount] = useState(0);

  // Library state
  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>([]);
  const [libraryExpanded, setLibraryExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-library-expanded');
      return saved !== 'false';
    }
    return true;
  });
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Shows state
  const [upcomingShows, setUpcomingShows] = useState<Show[]>([]);
  const [showsExpanded, setShowsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-shows-expanded');
      return saved !== 'false';
    }
    return true;
  });
  const [loadingShows, setLoadingShows] = useState(false);

  // Pinned Items state
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebar-pinned-items');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [pinnedExpanded, setPinnedExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-pinned-expanded');
      return saved !== 'false';
    }
    return true;
  });

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save collapsed state to localStorage and dispatch event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
      // Dispatch custom event so app-layout can react to the change
      window.dispatchEvent(new Event('sidebar-toggle'));
    }
  }, [isCollapsed]);

  // Keyboard shortcut: Cmd+B / Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (!isMobile) {
          setIsCollapsed((prev) => !prev);
          showToast(isCollapsed ? 'Sidebar expanded' : 'Sidebar collapsed', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isCollapsed, showToast]);

  // Fetch user's projects
  useEffect(() => {
    let mounted = true;

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        if (mounted) {
          setProjects(data || []);
        }
      } catch (error) {
        console.error('Error fetching projects for sidebar:', error);
        if (mounted) {
          setProjects([]);
        }
      } finally {
        if (mounted) {
          setLoadingProjects(false);
        }
      }
    };

    fetchProjects();

    return () => {
      mounted = false;
    };
  }, []);

  // Save projects expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-projects-expanded', String(projectsExpanded));
    }
  }, [projectsExpanded]);

  // Fetch user's songs (recent ones for quick access)
  useEffect(() => {
    let mounted = true;

    const fetchSongs = async () => {
      setLoadingSongs(true);
      try {
        // Fetch recent songs (limit 8 for sidebar)
        const response = await fetch('/api/songs/all?limit=8&sortBy=updatedAt&sortOrder=desc');
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        if (mounted) {
          setSongs(data.songs || []);
        }
      } catch (error) {
        console.error('Error fetching songs for sidebar:', error);
        if (mounted) {
          setSongs([]);
        }
      } finally {
        if (mounted) {
          setLoadingSongs(false);
        }
      }
    };

    fetchSongs();

    return () => {
      mounted = false;
    };
  }, []);

  // Save songs expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-songs-expanded', String(songsExpanded));
    }
  }, [songsExpanded]);

  // Fetch user's conversations (recent ones for quick access) with real-time updates
  useEffect(() => {
    let mounted = true;

    const fetchConversations = async () => {
      setLoadingMessages(true);
      try {
        // Fetch recent conversations (limit 6 for sidebar)
        const response = await fetch('/api/messages/conversations?limit=6');
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await response.json();
        if (mounted) {
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error('Error fetching conversations for sidebar:', error);
        if (mounted) {
          setConversations([]);
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    };

    fetchConversations();

    // Poll for updates every 20 seconds (messages are more time-sensitive)
    const interval = setInterval(fetchConversations, 20000);

    // Refresh on tab focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchConversations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for custom events to refresh
    const handleMessageUpdate = () => fetchConversations();
    window.addEventListener('sidebar-refresh-messages', handleMessageUpdate);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('sidebar-refresh-messages', handleMessageUpdate);
    };
  }, []);

  // Save messages expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-messages-expanded', String(messagesExpanded));
    }
  }, [messagesExpanded]);

  // Fetch notification count with real-time updates
  useEffect(() => {
    let mounted = true;

    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (!response.ok) {
          throw new Error('Failed to fetch notification count');
        }
        const data = await response.json();
        if (mounted) {
          setNotificationCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    // Refresh on tab focus (when user comes back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotificationCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for custom events to refresh (other parts of app can trigger this)
    const handleNotificationUpdate = () => fetchNotificationCount();
    window.addEventListener('sidebar-refresh-notifications', handleNotificationUpdate);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('sidebar-refresh-notifications', handleNotificationUpdate);
    };
  }, []);

  // Fetch library files (recent ones for quick access)
  useEffect(() => {
    let mounted = true;

    const fetchLibraryFiles = async () => {
      setLoadingLibrary(true);
      try {
        const response = await fetch('/api/library?limit=6&sortBy=updatedAt&sortOrder=desc');
        if (!response.ok) {
          throw new Error('Failed to fetch library files');
        }
        const data = await response.json();
        if (mounted) {
          setLibraryFiles(data.files || []);
        }
      } catch (error) {
        console.error('Error fetching library files for sidebar:', error);
        if (mounted) {
          setLibraryFiles([]);
        }
      } finally {
        if (mounted) {
          setLoadingLibrary(false);
        }
      }
    };

    fetchLibraryFiles();

    return () => {
      mounted = false;
    };
  }, []);

  // Save library expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-library-expanded', String(libraryExpanded));
    }
  }, [libraryExpanded]);

  // Fetch upcoming shows
  useEffect(() => {
    let mounted = true;

    const fetchUpcomingShows = async () => {
      setLoadingShows(true);
      try {
        const response = await fetch('/api/shows?upcoming=true&limit=5');
        if (!response.ok) {
          // Silently fail - user might not have any shows
          throw new Error('Failed to fetch shows');
        }
        const data = await response.json();
        if (mounted) {
          setUpcomingShows(data.shows || []);
        }
      } catch (error) {
        // Silently handle - shows are optional
        if (mounted) {
          setUpcomingShows([]);
        }
      } finally {
        if (mounted) {
          setLoadingShows(false);
        }
      }
    };

    fetchUpcomingShows();

    return () => {
      mounted = false;
    };
  }, []);

  // Save shows expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-shows-expanded', String(showsExpanded));
    }
  }, [showsExpanded]);

  // Save pinned items to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-pinned-items', JSON.stringify(pinnedItems));
    }
  }, [pinnedItems]);

  // Save pinned expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-pinned-expanded', String(pinnedExpanded));
    }
  }, [pinnedExpanded]);

  // Listen for pinned items changes from command palette
  useEffect(() => {
    const handlePinnedItemsChanged = () => {
      const saved = localStorage.getItem('sidebar-pinned-items');
      setPinnedItems(saved ? JSON.parse(saved) : []);
      const expanded = localStorage.getItem('sidebar-pinned-expanded');
      setPinnedExpanded(expanded !== 'false');
    };

    window.addEventListener('pinned-items-changed', handlePinnedItemsChanged);
    return () => window.removeEventListener('pinned-items-changed', handlePinnedItemsChanged);
  }, []);

  // Pin/Unpin helper functions
  const pinItem = (item: Omit<PinnedItem, 'pinnedAt'>) => {
    setPinnedItems((prev) => {
      // Check if already pinned
      if (prev.some((p) => p.id === item.id && p.type === item.type)) {
        return prev;
      }
      // Add to beginning (most recently pinned first)
      return [{ ...item, pinnedAt: Date.now() }, ...prev];
    });
    showToast(`Pinned "${item.name}" to sidebar`, 'success');
  };

  const unpinItem = (id: string, type: PinnedItem['type']) => {
    const item = pinnedItems.find((p) => p.id === id && p.type === type);
    setPinnedItems((prev) => prev.filter((p) => !(p.id === id && p.type === type)));
    if (item) {
      showToast(`Unpinned "${item.name}"`, 'success');
    }
  };

  const isPinned = (id: string, type: PinnedItem['type']) => {
    return pinnedItems.some((p) => p.id === id && p.type === type);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Auto-expand section containing current route (only on navigation, not on manual toggle)
  useEffect(() => {
    navSections.forEach((section) => {
      const hasActiveItem = section.items.some(
        (item) =>
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]))
      );
      if (hasActiveItem) {
        setExpandedSections((prev) =>
          prev.includes(section.title) ? prev : [...prev, section.title]
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only run on pathname change, not on expandedSections change

  // Don't show sidebar on marketing pages
  const isMarketingPage =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact');

  if (isMarketingPage) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: '/' });
      showToast('See you next time, artist.', 'success');
    } catch (error) {
      showToast('An unexpected error occurred while signing out', 'error');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } finally {
      setSigningOut(false);
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    const basePath = href.split('?')[0];
    return pathname === basePath || (basePath !== '/dashboard' && pathname.startsWith(basePath));
  };

  // On mobile, only show if menu is open
  const shouldShow = !isMobile || mobileMenuOpen;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{
          x: shouldShow ? 0 : -260,
          width: isCollapsed && !isMobile ? 72 : 260,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 z-50 h-screen overflow-hidden ${!shouldShow ? 'pointer-events-none' : ''}`}
        style={{
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo Section - Theme Aware */}
        <SidebarLogo
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          isHovered={isHovered}
          onClose={() => setMobileMenuOpen(false)}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Navigation Sections - Scrollable */}
        <nav
          className="overflow-y-auto px-3 py-4"
          style={{
            height: 'calc(100vh - 64px - 120px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          }}
        >
          {/* Pinned Items Section */}
          {pinnedItems.length > 0 && (!isCollapsed || isMobile) && (
            <div className="mb-4">
              <button
                onClick={() => setPinnedExpanded(!pinnedExpanded)}
                className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
              >
                <span
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent)' }}
                >
                  <Pin className="h-3 w-3" />
                  Pinned
                </span>
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${pinnedExpanded ? 'rotate-90' : ''}`}
                  style={{ color: 'var(--muted)' }}
                />
              </button>

              <AnimatePresence>
                {pinnedExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5">
                      {pinnedItems.map((item) => {
                        const isItemActive =
                          pathname === item.url || pathname.startsWith(item.url.split('?')[0]);

                        // Get the right icon based on type
                        const ItemIcon =
                          item.type === 'project'
                            ? SessionFolder
                            : item.type === 'song'
                              ? SongManuscript
                              : item.type === 'file'
                                ? FileAudio
                                : item.type === 'conversation'
                                  ? MessageSquare
                                  : Folder;

                        const typeColor =
                          item.type === 'project'
                            ? '#8b5cf6'
                            : item.type === 'song'
                              ? '#f59e0b'
                              : item.type === 'file'
                                ? '#22c55e'
                                : item.type === 'conversation'
                                  ? '#3b82f6'
                                  : undefined;

                        return (
                          <motion.div
                            key={`${item.type}-${item.id}`}
                            className="group relative"
                            whileHover={{ x: 2 }}
                          >
                            <Link href={item.url}>
                              <motion.div
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                                  isItemActive ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                              >
                                {/* Icon with type indicator */}
                                <div
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                  style={{ background: 'var(--surface)' }}
                                >
                                  {item.type === 'conversation' && item.meta?.avatar ? (
                                    <img
                                      src={item.meta.avatar}
                                      alt=""
                                      className="h-full w-full rounded-lg object-cover"
                                    />
                                  ) : (
                                    <ItemIcon
                                      className="h-3.5 w-3.5"
                                      style={{
                                        color: isItemActive
                                          ? 'var(--accent)'
                                          : typeColor || 'var(--muted)',
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Name and meta info */}
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <span
                                    className="truncate text-xs font-medium"
                                    style={{
                                      color: isItemActive ? 'var(--text)' : 'var(--text-secondary)',
                                    }}
                                    title={item.name}
                                  >
                                    {item.name}
                                  </span>
                                  {item.meta?.projectName && (
                                    <span
                                      className="truncate text-[10px]"
                                      style={{ color: 'var(--muted)' }}
                                    >
                                      {item.meta.projectName}
                                    </span>
                                  )}
                                </div>

                                {/* Unpin button - appears on hover */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    unpinItem(item.id, item.type);
                                  }}
                                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-white/10 group-hover:opacity-100"
                                  title="Unpin"
                                >
                                  <X className="h-3 w-3" style={{ color: 'var(--muted)' }} />
                                </button>
                              </motion.div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {navSections.map((section) => {
            const isExpanded = expandedSections.includes(section.title) || isCollapsed;
            const hasActiveItem = section.items.some((item) => isActive(item.href));

            return (
              <div key={section.title} className="mb-2">
                {/* Section Header */}
                {(!isCollapsed || isMobile) && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: hasActiveItem ? 'var(--accent)' : 'var(--muted)',
                      }}
                    >
                      {section.title}
                    </span>
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      style={{ color: 'var(--muted)' }}
                    />
                  </button>
                )}

                {/* Section Items */}
                <AnimatePresence initial={false}>
                  {(isExpanded || isCollapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {section.items.map((item) => {
                        const active = isActive(item.href);
                        const isProjectsItem = item.href === '/projects';
                        const isSongwritingItem = item.href === '/songwriting';
                        const isMessagesItem = item.href === '/social/messages';
                        const isNotificationsItem = item.href === '/social/notifications';
                        const isLibraryItem = item.href === '/library';
                        const isToursItem = item.href === '/tours';

                        // Count total unread messages
                        const totalUnread = conversations.reduce(
                          (sum, c) => sum + c.unreadCount,
                          0
                        );

                        return (
                          <div key={item.href}>
                            <Link href={item.href}>
                              <motion.div
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 ${
                                  active ? '' : 'hover:bg-white/5'
                                }`}
                                style={{
                                  background: active ? 'var(--accent-glow)' : undefined,
                                }}
                              >
                                {/* Active Indicator */}
                                {active && (
                                  <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full"
                                    style={{ background: 'var(--accent)' }}
                                  />
                                )}

                                {/* Icon */}
                                <div
                                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200`}
                                  style={{
                                    background: active ? 'var(--accent)' : 'var(--surface)',
                                  }}
                                >
                                  <item.icon
                                    className="h-4 w-4"
                                    style={{
                                      color: active ? 'white' : 'var(--text-secondary)',
                                    }}
                                  />
                                  {/* Unread badge for Messages */}
                                  {isMessagesItem && totalUnread > 0 && (
                                    <span
                                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                      style={{ background: '#ef4444' }}
                                    >
                                      {totalUnread > 9 ? '9+' : totalUnread}
                                    </span>
                                  )}
                                  {/* Unread badge for Notifications */}
                                  {isNotificationsItem && notificationCount > 0 && (
                                    <span
                                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                      style={{ background: '#ef4444' }}
                                    >
                                      {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                  )}
                                </div>

                                {/* Label */}
                                <AnimatePresence>
                                  {(!isCollapsed || isMobile) && (
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      className="flex flex-1 items-center justify-between"
                                    >
                                      <span
                                        className="text-sm font-medium"
                                        style={{
                                          color: active ? 'var(--text)' : 'var(--text-secondary)',
                                        }}
                                      >
                                        {item.label}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {item.badge && (
                                          <span
                                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                            style={{
                                              background: 'var(--accent)',
                                              color: 'white',
                                            }}
                                          >
                                            {item.badge}
                                          </span>
                                        )}
                                        {isProjectsItem && projects.length > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setProjectsExpanded(!projectsExpanded);
                                            }}
                                            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
                                          >
                                            <ChevronRight
                                              className={`h-3 w-3 transition-transform ${projectsExpanded ? 'rotate-90' : ''}`}
                                              style={{ color: 'var(--muted)' }}
                                            />
                                          </button>
                                        )}
                                        {isSongwritingItem && songs.length > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setSongsExpanded(!songsExpanded);
                                            }}
                                            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
                                          >
                                            <ChevronRight
                                              className={`h-3 w-3 transition-transform ${songsExpanded ? 'rotate-90' : ''}`}
                                              style={{ color: 'var(--muted)' }}
                                            />
                                          </button>
                                        )}
                                        {isMessagesItem && conversations.length > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setMessagesExpanded(!messagesExpanded);
                                            }}
                                            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
                                          >
                                            <ChevronRight
                                              className={`h-3 w-3 transition-transform ${messagesExpanded ? 'rotate-90' : ''}`}
                                              style={{ color: 'var(--muted)' }}
                                            />
                                          </button>
                                        )}
                                        {isLibraryItem && libraryFiles.length > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setLibraryExpanded(!libraryExpanded);
                                            }}
                                            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
                                          >
                                            <ChevronRight
                                              className={`h-3 w-3 transition-transform ${libraryExpanded ? 'rotate-90' : ''}`}
                                              style={{ color: 'var(--muted)' }}
                                            />
                                          </button>
                                        )}
                                        {isToursItem && upcomingShows.length > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setShowsExpanded(!showsExpanded);
                                            }}
                                            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
                                          >
                                            <ChevronRight
                                              className={`h-3 w-3 transition-transform ${showsExpanded ? 'rotate-90' : ''}`}
                                              style={{ color: 'var(--muted)' }}
                                            />
                                          </button>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </Link>

                            {/* Quick Action: New Project Button */}
                            {isProjectsItem && (!isCollapsed || isMobile) && projectsExpanded && (
                              <Link href="/projects/new">
                                <motion.div
                                  whileHover={{ x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="ml-3 mt-1 flex items-center gap-2 rounded-lg border border-dashed px-3 py-1.5 transition-all hover:bg-white/5"
                                  style={{ borderColor: 'var(--border)' }}
                                >
                                  <Plus className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: 'var(--accent)' }}
                                  >
                                    New Project
                                  </span>
                                </motion.div>
                              </Link>
                            )}

                            {/* Quick Action: New Song Button */}
                            {isSongwritingItem && (!isCollapsed || isMobile) && songsExpanded && (
                              <Link href="/songwriting">
                                <motion.div
                                  whileHover={{ x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="ml-3 mt-1 flex items-center gap-2 rounded-lg border border-dashed px-3 py-1.5 transition-all hover:bg-white/5"
                                  style={{ borderColor: 'var(--border)' }}
                                >
                                  <Plus className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: 'var(--accent)' }}
                                  >
                                    New Song
                                  </span>
                                </motion.div>
                              </Link>
                            )}

                            {/* Individual Projects List */}
                            {isProjectsItem && (!isCollapsed || isMobile) && (
                              <AnimatePresence>
                                {projectsExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 mt-1 overflow-hidden border-l pl-3"
                                    style={{ borderColor: 'var(--border)' }}
                                  >
                                    {loadingProjects ? (
                                      <div className="flex items-center gap-2 px-3 py-2 text-xs">
                                        <Loader2
                                          className="h-3 w-3 animate-spin"
                                          style={{ color: 'var(--muted)' }}
                                        />
                                        <span style={{ color: 'var(--muted)' }}>Loading...</span>
                                      </div>
                                    ) : projects.length === 0 ? (
                                      <div className="px-3 py-2">
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                          No projects yet
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {projects.map((project) => {
                                          const projectActive = pathname.includes(
                                            `/projects/${project.slug}`
                                          );
                                          const isProjectPinned = isPinned(project.id, 'project');
                                          return (
                                            <motion.div
                                              key={project.id}
                                              className="group relative"
                                              whileHover={{ x: 2 }}
                                            >
                                              <Link href={`/projects/${project.slug}`}>
                                                <motion.div
                                                  whileTap={{ scale: 0.98 }}
                                                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
                                                    projectActive
                                                      ? 'bg-white/10'
                                                      : 'hover:bg-white/5'
                                                  }`}
                                                >
                                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                                    {project.visibility === 'private' ? (
                                                      <Lock
                                                        className="h-3 w-3"
                                                        style={{
                                                          color: projectActive
                                                            ? 'var(--accent)'
                                                            : 'var(--muted)',
                                                        }}
                                                      />
                                                    ) : project.visibility === 'public' ? (
                                                      <Globe
                                                        className="h-3 w-3"
                                                        style={{
                                                          color: projectActive
                                                            ? 'var(--accent)'
                                                            : 'var(--muted)',
                                                        }}
                                                      />
                                                    ) : (
                                                      <Folder
                                                        className="h-3 w-3"
                                                        style={{
                                                          color: projectActive
                                                            ? 'var(--accent)'
                                                            : 'var(--muted)',
                                                        }}
                                                      />
                                                    )}
                                                  </div>
                                                  <span
                                                    className="flex-1 truncate text-xs font-medium"
                                                    style={{
                                                      color: projectActive
                                                        ? 'var(--text)'
                                                        : 'var(--text-secondary)',
                                                    }}
                                                    title={project.name}
                                                  >
                                                    {project.name}
                                                  </span>
                                                  {/* Pin indicator */}
                                                  {isProjectPinned && (
                                                    <Pin
                                                      className="h-2.5 w-2.5 shrink-0"
                                                      style={{ color: 'var(--accent)' }}
                                                    />
                                                  )}
                                                  {/* Pin/Unpin button on hover */}
                                                  {!isProjectPinned && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        pinItem({
                                                          id: project.id,
                                                          type: 'project',
                                                          name: project.name,
                                                          url: `/projects/${project.slug}`,
                                                        });
                                                      }}
                                                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-white/10 group-hover:opacity-100"
                                                      title="Pin to sidebar"
                                                    >
                                                      <Pin
                                                        className="h-2.5 w-2.5"
                                                        style={{ color: 'var(--muted)' }}
                                                      />
                                                    </button>
                                                  )}
                                                </motion.div>
                                              </Link>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}

                            {/* Individual Songs List */}
                            {isSongwritingItem && (!isCollapsed || isMobile) && (
                              <AnimatePresence>
                                {songsExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 mt-1 overflow-hidden border-l pl-3"
                                    style={{ borderColor: 'var(--border)' }}
                                  >
                                    {loadingSongs ? (
                                      <div className="flex items-center gap-2 px-3 py-2 text-xs">
                                        <Loader2
                                          className="h-3 w-3 animate-spin"
                                          style={{ color: 'var(--muted)' }}
                                        />
                                        <span style={{ color: 'var(--muted)' }}>Loading...</span>
                                      </div>
                                    ) : songs.length === 0 ? (
                                      <div className="px-3 py-2">
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                          No songs yet
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {songs.map((song) => {
                                          // Songs can be standalone or in a project
                                          // Standalone songs open in songwriting mode
                                          const songUrl =
                                            song.projectId && song.project
                                              ? `/projects/${song.project.slug}/songs/${song.id}`
                                              : `/songwriting?song=${song.id}`;
                                          const songActive =
                                            pathname.includes(`/songs/${song.id}`) ||
                                            (pathname.includes(`songwriting`) &&
                                              pathname.includes(song.id));

                                          // Status-based icon
                                          const StatusIcon =
                                            song.status === 'complete'
                                              ? CheckCircle
                                              : song.status === 'in_progress'
                                                ? Edit3
                                                : song.status === 'needs_review'
                                                  ? AlertCircle
                                                  : FileText; // draft

                                          const statusColor =
                                            song.status === 'complete'
                                              ? '#22c55e'
                                              : song.status === 'in_progress'
                                                ? '#f59e0b'
                                                : song.status === 'needs_review'
                                                  ? '#ef4444'
                                                  : undefined;

                                          const isSongPinned = isPinned(song.id, 'song');

                                          return (
                                            <motion.div
                                              key={song.id}
                                              className="group relative"
                                              whileHover={{ x: 2 }}
                                            >
                                              <Link href={songUrl}>
                                                <motion.div
                                                  whileTap={{ scale: 0.98 }}
                                                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
                                                    songActive ? 'bg-white/10' : 'hover:bg-white/5'
                                                  }`}
                                                >
                                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                                    <StatusIcon
                                                      className="h-3 w-3"
                                                      style={{
                                                        color: songActive
                                                          ? 'var(--accent)'
                                                          : statusColor || 'var(--muted)',
                                                      }}
                                                    />
                                                  </div>
                                                  <div className="flex min-w-0 flex-1 flex-col">
                                                    <span
                                                      className="truncate text-xs font-medium"
                                                      style={{
                                                        color: songActive
                                                          ? 'var(--text)'
                                                          : 'var(--text-secondary)',
                                                      }}
                                                      title={song.title}
                                                    >
                                                      {song.title || 'Untitled'}
                                                    </span>
                                                    {song.project && (
                                                      <span
                                                        className="truncate text-[10px]"
                                                        style={{ color: 'var(--muted)' }}
                                                      >
                                                        {song.project.name}
                                                      </span>
                                                    )}
                                                  </div>
                                                  {song.isFavorite && (
                                                    <Heart
                                                      className="h-2.5 w-2.5 flex-shrink-0"
                                                      style={{ color: '#ef4444', fill: '#ef4444' }}
                                                    />
                                                  )}
                                                  {/* Pin indicator */}
                                                  {isSongPinned && (
                                                    <Pin
                                                      className="h-2.5 w-2.5 shrink-0"
                                                      style={{ color: 'var(--accent)' }}
                                                    />
                                                  )}
                                                  {/* Pin button on hover */}
                                                  {!isSongPinned && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        pinItem({
                                                          id: song.id,
                                                          type: 'song',
                                                          name: song.title || 'Untitled',
                                                          url: songUrl,
                                                          meta: {
                                                            projectName: song.project?.name,
                                                            status: song.status,
                                                          },
                                                        });
                                                      }}
                                                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-white/10 group-hover:opacity-100"
                                                      title="Pin to sidebar"
                                                    >
                                                      <Pin
                                                        className="h-2.5 w-2.5"
                                                        style={{ color: 'var(--muted)' }}
                                                      />
                                                    </button>
                                                  )}
                                                </motion.div>
                                              </Link>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}

                            {/* Recent Conversations List */}
                            {isMessagesItem && (!isCollapsed || isMobile) && (
                              <AnimatePresence>
                                {messagesExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 mt-1 overflow-hidden border-l pl-3"
                                    style={{ borderColor: 'var(--border)' }}
                                  >
                                    {loadingMessages ? (
                                      <div className="flex items-center gap-2 px-3 py-2 text-xs">
                                        <Loader2
                                          className="h-3 w-3 animate-spin"
                                          style={{ color: 'var(--muted)' }}
                                        />
                                        <span style={{ color: 'var(--muted)' }}>Loading...</span>
                                      </div>
                                    ) : conversations.length === 0 ? (
                                      <div className="px-3 py-2">
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                          No conversations yet
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {conversations.map((conv) => {
                                          const hasUnread = conv.unreadCount > 0;
                                          const isConvPinned = isPinned(conv.id, 'conversation');

                                          return (
                                            <motion.div
                                              key={conv.id}
                                              className="group relative"
                                              whileHover={{ x: 2 }}
                                            >
                                              <Link href="/messages">
                                                <motion.div
                                                  whileTap={{ scale: 0.98 }}
                                                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5 ${
                                                    hasUnread ? 'bg-white/5' : ''
                                                  }`}
                                                >
                                                  {/* Avatar */}
                                                  <div
                                                    className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full"
                                                    style={{ background: 'var(--surface)' }}
                                                  >
                                                    {conv.participant.image ? (
                                                      <img
                                                        src={conv.participant.image}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                      />
                                                    ) : (
                                                      <User
                                                        className="h-3 w-3"
                                                        style={{ color: 'var(--muted)' }}
                                                      />
                                                    )}
                                                    {/* Unread dot */}
                                                    {hasUnread && (
                                                      <span
                                                        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                                                        style={{ background: '#ef4444' }}
                                                      />
                                                    )}
                                                  </div>

                                                  {/* Name and preview */}
                                                  <div className="flex min-w-0 flex-1 flex-col">
                                                    <span
                                                      className={`truncate text-xs ${hasUnread ? 'font-semibold' : 'font-medium'}`}
                                                      style={{
                                                        color: hasUnread
                                                          ? 'var(--text)'
                                                          : 'var(--text-secondary)',
                                                      }}
                                                      title={conv.participant.name || 'Unknown'}
                                                    >
                                                      {conv.participant.name || 'Unknown'}
                                                    </span>
                                                    {conv.lastMessage && (
                                                      <span
                                                        className="truncate text-[10px]"
                                                        style={{ color: 'var(--muted)' }}
                                                      >
                                                        {conv.lastMessage.content.substring(0, 30)}
                                                        {conv.lastMessage.content.length > 30
                                                          ? '...'
                                                          : ''}
                                                      </span>
                                                    )}
                                                  </div>

                                                  {/* Indicators */}
                                                  <div className="flex items-center gap-1">
                                                    {(conv.isPinned || isConvPinned) && (
                                                      <Pin
                                                        className="h-2.5 w-2.5 flex-shrink-0"
                                                        style={{ color: 'var(--accent)' }}
                                                      />
                                                    )}
                                                    {hasUnread && (
                                                      <span
                                                        className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                                                        style={{ background: '#ef4444' }}
                                                      >
                                                        {conv.unreadCount}
                                                      </span>
                                                    )}
                                                    {/* Pin button on hover */}
                                                    {!isConvPinned && !conv.isPinned && (
                                                      <button
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                          pinItem({
                                                            id: conv.id,
                                                            type: 'conversation',
                                                            name:
                                                              conv.participant.name || 'Unknown',
                                                            url: '/messages',
                                                            meta: {
                                                              avatar:
                                                                conv.participant.image || undefined,
                                                            },
                                                          });
                                                        }}
                                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-white/10 group-hover:opacity-100"
                                                        title="Pin to sidebar"
                                                      >
                                                        <Pin
                                                          className="h-2.5 w-2.5"
                                                          style={{ color: 'var(--muted)' }}
                                                        />
                                                      </button>
                                                    )}
                                                  </div>
                                                </motion.div>
                                              </Link>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}

                            {/* Recent Library Files List */}
                            {isLibraryItem && (!isCollapsed || isMobile) && (
                              <AnimatePresence>
                                {libraryExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 mt-1 overflow-hidden border-l pl-3"
                                    style={{ borderColor: 'var(--border)' }}
                                  >
                                    {loadingLibrary ? (
                                      <div className="flex items-center gap-2 px-3 py-2 text-xs">
                                        <Loader2
                                          className="h-3 w-3 animate-spin"
                                          style={{ color: 'var(--muted)' }}
                                        />
                                        <span style={{ color: 'var(--muted)' }}>Loading...</span>
                                      </div>
                                    ) : libraryFiles.length === 0 ? (
                                      <div className="px-3 py-2">
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                          No files yet
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {libraryFiles.map((file) => {
                                          // File type icon
                                          const FileIcon =
                                            file.type === 'audio'
                                              ? FileAudio
                                              : file.type === 'image'
                                                ? ImageIcon
                                                : file.type === 'midi'
                                                  ? Music
                                                  : File;

                                          const fileColor =
                                            file.type === 'audio'
                                              ? '#22c55e'
                                              : file.type === 'image'
                                                ? '#3b82f6'
                                                : file.type === 'midi'
                                                  ? '#a855f7'
                                                  : undefined;

                                          const isFilePinned = isPinned(file.id, 'file');

                                          return (
                                            <motion.div
                                              key={file.id}
                                              className="group relative"
                                              whileHover={{ x: 2 }}
                                            >
                                              <Link href={`/library?file=${file.id}`}>
                                                <motion.div
                                                  whileTap={{ scale: 0.98 }}
                                                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5"
                                                >
                                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                                    <FileIcon
                                                      className="h-3 w-3"
                                                      style={{ color: fileColor || 'var(--muted)' }}
                                                    />
                                                  </div>
                                                  <span
                                                    className="flex-1 truncate text-xs font-medium"
                                                    style={{ color: 'var(--text-secondary)' }}
                                                    title={file.name}
                                                  >
                                                    {file.name}
                                                  </span>
                                                  {file.isFavorite && (
                                                    <Heart
                                                      className="h-2.5 w-2.5 flex-shrink-0"
                                                      style={{ color: '#ef4444', fill: '#ef4444' }}
                                                    />
                                                  )}
                                                  {/* Pin indicator */}
                                                  {isFilePinned && (
                                                    <Pin
                                                      className="h-2.5 w-2.5 shrink-0"
                                                      style={{ color: 'var(--accent)' }}
                                                    />
                                                  )}
                                                  {/* Pin button on hover */}
                                                  {!isFilePinned && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        pinItem({
                                                          id: file.id,
                                                          type: 'file',
                                                          name: file.name,
                                                          url: `/library?file=${file.id}`,
                                                          meta: {
                                                            fileType: file.type,
                                                          },
                                                        });
                                                      }}
                                                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-white/10 group-hover:opacity-100"
                                                      title="Pin to sidebar"
                                                    >
                                                      <Pin
                                                        className="h-2.5 w-2.5"
                                                        style={{ color: 'var(--muted)' }}
                                                      />
                                                    </button>
                                                  )}
                                                </motion.div>
                                              </Link>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}

                            {/* Upcoming Shows List */}
                            {isToursItem && (!isCollapsed || isMobile) && (
                              <AnimatePresence>
                                {showsExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 mt-1 overflow-hidden border-l pl-3"
                                    style={{ borderColor: 'var(--border)' }}
                                  >
                                    {loadingShows ? (
                                      <div className="flex items-center gap-2 px-3 py-2 text-xs">
                                        <Loader2
                                          className="h-3 w-3 animate-spin"
                                          style={{ color: 'var(--muted)' }}
                                        />
                                        <span style={{ color: 'var(--muted)' }}>Loading...</span>
                                      </div>
                                    ) : upcomingShows.length === 0 ? (
                                      <div className="px-3 py-2">
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                          No upcoming shows
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {upcomingShows.map((show) => {
                                          const showDate = new Date(show.date);
                                          const isToday =
                                            showDate.toDateString() === new Date().toDateString();
                                          const isTomorrow =
                                            showDate.toDateString() ===
                                            new Date(Date.now() + 86400000).toDateString();
                                          const isThisWeek =
                                            showDate.getTime() - Date.now() < 7 * 86400000;

                                          const dateLabel = isToday
                                            ? 'Today'
                                            : isTomorrow
                                              ? 'Tomorrow'
                                              : isThisWeek
                                                ? showDate.toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                  })
                                                : showDate.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                  });

                                          const urgencyColor = isToday
                                            ? '#ef4444'
                                            : isTomorrow
                                              ? '#f59e0b'
                                              : isThisWeek
                                                ? '#22c55e'
                                                : undefined;

                                          return (
                                            <Link key={show.id} href={`/tours/${show.slug}`}>
                                              <motion.div
                                                whileHover={{ x: 2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5 ${
                                                  isToday ? 'bg-red-500/10' : ''
                                                }`}
                                              >
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                                  <Calendar
                                                    className="h-3 w-3"
                                                    style={{
                                                      color: urgencyColor || 'var(--muted)',
                                                    }}
                                                  />
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col">
                                                  <span
                                                    className="truncate text-xs font-medium"
                                                    style={{ color: 'var(--text-secondary)' }}
                                                    title={show.name}
                                                  >
                                                    {show.name}
                                                  </span>
                                                  {show.venue && (
                                                    <span
                                                      className="flex items-center gap-1 truncate text-[10px]"
                                                      style={{ color: 'var(--muted)' }}
                                                    >
                                                      <MapPin className="h-2 w-2" />
                                                      {show.venue.city}, {show.venue.state}
                                                    </span>
                                                  )}
                                                </div>
                                                <span
                                                  className="shrink-0 text-[10px] font-semibold"
                                                  style={{ color: urgencyColor || 'var(--muted)' }}
                                                >
                                                  {dateLabel}
                                                </span>
                                              </motion.div>
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Settings Section */}
          <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            {settingsItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 ${
                      active ? '' : 'hover:bg-white/5'
                    }`}
                    style={{
                      background: active ? 'var(--accent-glow)' : undefined,
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: active ? 'var(--accent)' : 'var(--surface)',
                      }}
                    >
                      <item.icon
                        className="h-4 w-4"
                        style={{
                          color: active ? 'white' : 'var(--text-secondary)',
                        }}
                      />
                    </div>

                    <AnimatePresence>
                      {(!isCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-medium"
                          style={{
                            color: active ? 'var(--text)' : 'var(--text-secondary)',
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-4"
          style={{
            background: `linear-gradient(to top, var(--bg) 80%, transparent 100%)`,
            paddingTop: '24px',
          }}
        >
          {/* Theme Quick Switcher */}
          <ThemeQuickSwitcher isCollapsed={isCollapsed && !isMobile} />

          {/* Sign Out Button */}
          <motion.button
            onClick={handleSignOut}
            disabled={signingOut}
            whileHover={{ x: signingOut ? 0 : 3 }}
            whileTap={{ scale: signingOut ? 1 : 0.98 }}
            className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:bg-red-500/20"
              style={{ background: 'var(--surface)' }}
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-400" />
              ) : (
                <LogOut className="h-4 w-4 text-red-400/70 transition-colors group-hover:text-red-400" />
              )}
            </div>

            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium text-red-400/70 transition-colors group-hover:text-red-400"
                >
                  {signingOut ? 'Signing Out...' : 'Sign Out'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}

// ============================================
// Theme Quick Switcher
// ============================================

function ThemeQuickSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  const { theme, resolvedTheme, setTheme } = useThemeSafe();
  const [showMenu, setShowMenu] = useState(false);

  const themes = [
    {
      id: 'light' as const,
      label: 'Light',
      colors: { bg: '#faf8f5', accent: '#d5512f' },
      icon: '☀️',
    },
    {
      id: 'dark' as const,
      label: 'Dark',
      colors: { bg: '#1c1915', accent: '#e85d3b' },
      icon: '🌙',
    },
    {
      id: 'system' as const,
      label: 'System',
      colors: { bg: 'linear-gradient(135deg, #faf8f5 50%, #1c1915 50%)', accent: '#8b8680' },
      icon: '💻',
    },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[1];

  return (
    <div className="relative mb-2">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/5"
      >
        {/* Theme Preview Circle */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="h-5 w-5 rounded-full border-2 shadow-inner"
            style={{
              background: currentTheme.colors.bg,
              borderColor: currentTheme.colors.accent,
            }}
          />
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-1 items-center justify-between"
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Theme
              </span>
              <span
                className="rounded-md px-2 py-0.5 text-xs font-medium capitalize"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--muted)',
                }}
              >
                {theme}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Quick Theme Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="p-2">
                <div
                  className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  Choose Theme
                </div>
                {themes.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowMenu(false);
                      }}
                      whileHover={{ x: 4 }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                        isActive ? 'bg-accent/10' : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Theme Preview */}
                      <div
                        className="h-8 w-8 rounded-lg border-2 shadow-inner"
                        style={{
                          background: t.colors.bg,
                          borderColor: isActive ? 'var(--accent)' : t.colors.accent,
                        }}
                      />

                      {/* Label */}
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}
                        >
                          {t.label}
                        </p>
                      </div>

                      {/* Check */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ background: 'var(--accent)' }}
                        >
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick tip */}
              <div
                className="border-t px-3 py-2 text-xs"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--muted)',
                }}
              >
                Currently: {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Mobile Menu Button
// ============================================

export function MobileMenuButton() {
  const { toggle, isOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <button
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
      style={{ border: '1px solid var(--border)' }}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <motion.div
        animate={isOpen ? 'open' : 'closed'}
        className="flex flex-col items-center justify-center gap-1"
      >
        <motion.span
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 5 },
          }}
          className="block h-0.5 w-5"
          style={{ background: 'var(--text)' }}
        />
        <motion.span
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          className="block h-0.5 w-5"
          style={{ background: 'var(--text)' }}
        />
        <motion.span
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -5 },
          }}
          className="block h-0.5 w-5"
          style={{ background: 'var(--text)' }}
        />
      </motion.div>
    </button>
  );
}
