'use client';

import { 
  Home,
  Music,
  DollarSign,
  Mic,
  Users,
  MessageSquare,
  Megaphone,
  Settings,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileAudio,
  Image,
  Calendar,
  FileText,
  CreditCard,
  Gift,
  MapPin,
  Building,
  ListMusic,
  UserPlus,
  Globe,
  Mail,
  Award,
  Podcast,
  User,
  Shield,
  CreditCard as BillingIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@cronkwaters/ui';

type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home }
    ]
  },
  {
    title: 'Creative',
    items: [
      { label: 'Projects', href: '/projects', icon: FolderOpen },
      { label: 'Songs', href: '/songs', icon: Music },
      { label: 'Assets', href: '/assets', icon: FileAudio },
      { label: 'Studio Sessions', href: '/sessions', icon: Calendar }
    ]
  },
  {
    title: 'Rights & Money',
    items: [
      { label: 'Split Sheets', href: '/splits', icon: FileText },
      { label: 'Song Splits', href: '/song-splits', icon: Music },
      { label: 'Licenses', href: '/licenses', icon: Shield },
      { label: 'Transactions', href: '/transactions', icon: CreditCard },
      { label: 'Donations', href: '/donations', icon: Gift }
    ]
  },
  {
    title: 'Live & Touring',
    items: [
      { label: 'Tours', href: '/tours', icon: Globe },
      { label: 'Shows', href: '/shows', icon: Mic },
      { label: 'Venues', href: '/venues', icon: Building },
      { label: 'Setlists', href: '/setlists', icon: ListMusic },
      { label: 'Fan Data', href: '/fans', icon: Users }
    ]
  },
  {
    title: 'People & Orgs',
    items: [
      { label: 'Organizations', href: '/organizations', icon: Building },
      { label: 'Members', href: '/members', icon: Users },
      { label: 'Invites', href: '/invites', icon: UserPlus }
    ]
  },
  {
    title: 'Community',
    items: [
      { label: 'Marketplace', href: '/marketplace', icon: Globe },
      { label: 'Messages', href: '/messages', icon: Mail },
      { label: 'Forums', href: '/forums', icon: MessageSquare }
    ]
  },
  {
    title: 'Media & Promotion',
    items: [
      { label: 'Events', href: '/events', icon: Calendar },
      { label: 'Press Releases', href: '/press', icon: Megaphone },
      { label: 'Awards', href: '/awards', icon: Award },
      { label: 'Podcasts', href: '/podcasts', icon: Podcast }
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Billing', href: '/billing', icon: BillingIcon }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="rnrb-sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Rock N' Roll</h1>
            <p className="text-xs text-muted-foreground">Basement</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((section) => (
          <div key={section.title} className="rnrb-nav-section">
            {section.title && (
              <h2 className="rnrb-nav-title">{section.title}</h2>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedSections.includes(item.label);

                return (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={cn('rnrb-nav-item', {
                          'active': isActive
                        })}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleSection(item.label)}
                          className="rnrb-nav-item w-full"
                        >
                          <item.icon size={18} />
                          <span className="flex-1 text-left">{item.label}</span>
                          {hasChildren && (
                            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                          )}
                        </button>
                        {hasChildren && isExpanded && (
                          <ul className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <Link
                                  href={child.href || '#'}
                                  className={cn('rnrb-nav-item text-sm', {
                                    'active': pathname === child.href
                                  })}
                                >
                                  <child.icon size={16} />
                                  <span>{child.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border">
        <div className="rnrb-card p-3 text-sm">
          <p className="font-semibold mb-1">Pro Tip</p>
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-surface-muted rounded text-xs">⌘K</kbd> to quickly search
          </p>
        </div>
      </div>
    </aside>
  );
}
