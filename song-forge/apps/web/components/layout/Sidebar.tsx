'use client';

import { 
  LayoutDashboard,
  Music,
  DollarSign,
  Mic,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  FolderOpen,
  Calendar,
  Database,
  Award,
  User,
  HelpCircle,
  LogOut,
  Search,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useMemo, memo } from 'react';
import { cn } from '@cronkwaters/ui';

type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
};

const navigation: NavItem[] = [
  {
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  {
    label: 'Projects', 
    href: '/projects', 
    icon: FolderOpen,
    badge: '12' 
  },
  { 
    label: 'Music Library', 
    icon: Music,
    children: [
      { label: 'All Songs', href: '/music', icon: Music },
      { label: 'Albums', href: '/music/albums', icon: FolderOpen },
      { label: 'Playlists', href: '/music/playlists', icon: Database }
    ]
  },
  {
    label: 'Revenue', 
    icon: DollarSign,
    children: [
      { label: 'Overview', href: '/revenue', icon: BarChart3 },
      { label: 'Royalties', href: '/revenue/royalties', icon: DollarSign },
      { label: 'Payouts', href: '/revenue/payouts', icon: Calendar }
    ]
  },
  {
    label: 'Live Shows', 
    href: '/shows', 
    icon: Mic,
    badge: '3' 
  },
  {
    label: 'Collaborators', 
    href: '/collaborators', 
    icon: Users 
  },
  { 
    label: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3 
  },
  { 
    label: 'Assets', 
    href: '/assets', 
    icon: Database 
  }
];

const bottomNavigation: NavItem[] = [
  { label: 'Profile', href: '/settings/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle }
];

// Memoized navigation item component
const NavItemComponent = memo(({ 
  item,
  depth = 0,
  isExpanded,
  isActive,
  onToggle 
}: {
  item: NavItem;
  depth?: number;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
}) => {
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "hover:bg-surface",
            depth > 0 && "ml-6"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span>{item.label}</span>
          </div>
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>
        {isExpanded && item.children && (
          <div className="mt-1">
            {item.children.map(child => (
              <NavItemRenderer key={child.label} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        "hover:bg-surface",
        isActive && "bg-surface text-foreground",
        !isActive && "text-muted-foreground hover:text-foreground",
        depth > 0 && "ml-6"
      )}
    >
      <div className="flex items-center gap-3">
        <item.icon className={cn(
          "w-5 h-5",
          isActive && "text-brand-primary"
        )} />
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span className="rnrb-badge text-xs">
          {item.badge}
        </span>
      )}
    </Link>
  );
});
NavItemComponent.displayName = 'NavItemComponent';

// Wrapper component to provide state
function NavItemRenderer({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isActive = useMemo(() => {
    if (!item.href) return false;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }, [pathname, item.href]);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <NavItemComponent
      item={item}
      depth={depth}
      isExpanded={isExpanded}
      isActive={isActive}
      onToggle={handleToggle}
    />
  );
}

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <aside className="w-64 h-screen bg-surface/30 border-r border-border/50 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/rnrdark.png"
            alt="Rock N' Roll Basement"
            width={40}
            height={40}
            priority
            className="dark:hidden"
          />
          <Image
            src="/rnrlight.png"
            alt="Rock N' Roll Basement"
            width={40}
            height={40}
            priority
            className="hidden dark:block"
          />
          <div>
            <h2 className="font-semibold">Rock N' Roll</h2>
            <p className="text-xs text-muted-foreground">Basement</p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="rnrb-input pl-9 py-2"
          />
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-4 mb-4">
        <Link
          href="/projects/new" 
          className="rnrb-button-primary w-full justify-center py-2.5 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4">
        <div className="space-y-1">
          {navigation.map(item => (
            <NavItemRenderer key={item.label} item={item} />
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className="space-y-1 mb-4">
          {bottomNavigation.map(item => (
            <NavItemRenderer key={item.label} item={item} />
          ))}
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary/50 flex items-center justify-center text-white font-medium">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
          <button className="p-1 hover:bg-surface-muted rounded">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}