'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Sparkles,
  Folder,
  Library,
  Users2,
  Compass,
  CreditCard,
  Settings,
  ChevronLeft,
  Music2,
  Menu
} from 'lucide-react';

// Navigation items following the specified IA
const navItems = [
  { 
    id: 'home',
    icon: Home, 
    label: 'Home', 
    href: '/dashboard',
    description: 'Overview & recent activity'
  },
  { 
    id: 'create',
    icon: Sparkles, 
    label: 'Create', 
    href: '/create',
    description: 'AI music composer',
    highlight: true // Special styling for primary CTA
  },
  { 
    id: 'projects',
    icon: Folder, 
    label: 'Projects', 
    href: '/projects',
    description: 'Your music projects'
  },
  { 
    id: 'library',
    icon: Library, 
    label: 'Library', 
    href: '/library',
    description: 'Assets & resources'
  },
  { 
    id: 'collab',
    icon: Users2, 
    label: 'Collab', 
    href: '/collab',
    description: 'Sessions & invites'
  },
  { 
    id: 'explore',
    icon: Compass, 
    label: 'Explore', 
    href: '/explore',
    description: 'Community & inspiration'
  },
];

const bottomNavItems = [
  { 
    id: 'credits',
    icon: CreditCard, 
    label: 'Credits', 
    href: '/credits',
    description: 'Usage & billing'
  },
  { 
    id: 'settings',
    icon: Settings, 
    label: 'Settings', 
    href: '/settings',
    description: 'Preferences'
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Restore collapsed state from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Don't show sidebar on marketing pages or auth pages
  if (
    pathname === '/' || 
    pathname?.startsWith('/pricing') || 
    pathname?.startsWith('/why-rnrb') ||
    pathname?.startsWith('/auth')
  ) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname?.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? '64px' : '240px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-background border-r border-border z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="h-[56px] flex items-center px-4 border-b border-border">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 overflow-hidden"
            title="Rock N' Roll Basement"
          >
            <Music2 className="w-6 h-6 text-brand-primary flex-shrink-0" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-lg whitespace-nowrap"
              >
                RNRB
              </motion.span>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {/* Primary Nav Items */}
          <div className="px-3 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md
                    transition-all duration-200 group relative
                    ${active 
                      ? item.highlight 
                        ? 'bg-brand-primary text-background font-semibold shadow-glow'
                        : 'bg-surface-hover text-foreground font-medium'
                      : item.highlight
                        ? 'text-foreground hover:bg-brand-primary/10 hover:text-brand-primary'
                        : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                    }
                  `}
                  title={isCollapsed ? item.label : item.description}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-0"
                    >
                      <span className="block truncate">{item.label}</span>
                      {!active && (
                        <span className="text-xs opacity-0 group-hover:opacity-60 transition-opacity block truncate">
                          {item.description}
                        </span>
                      )}
                    </motion.div>
                  )}
                  {active && !item.highlight && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-0.5 h-6 bg-brand-primary rounded-r"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Divider */}
          <div className="px-3 py-3">
            <div className="h-px bg-border" />
          </div>
          
          {/* Bottom Nav Items */}
          <div className="px-3">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md
                    transition-all duration-200
                    ${active 
                      ? 'bg-surface-hover text-foreground font-medium'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                    }
                  `}
                  title={isCollapsed ? item.label : item.description}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="
              w-full flex items-center justify-center gap-2 
              p-2 rounded-md text-foreground-muted
              hover:bg-surface-hover hover:text-foreground 
              transition-all duration-200
            "
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm"
                >
                  Collapse
                </motion.span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay - click to close on mobile */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}

