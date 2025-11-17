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
    title: '🎸 MAIN STAGE',
    items: [
      { label: 'Command Center', href: '/dashboard', icon: Home }
    ]
  },
  {
    title: '🎵 RECORDING STUDIO',
    items: [
      { label: 'Active Sessions', href: '/projects', icon: FolderOpen },
      { label: 'Track Library', href: '/songs', icon: Music },
      { label: 'Sound Bank', href: '/assets', icon: FileAudio },
      { label: 'Live Recording', href: '/sessions', icon: Calendar }
    ]
  },
  {
    title: '💰 BUSINESS OFFICE',
    items: [
      { label: 'Split Deals', href: '/splits', icon: FileText },
      { label: 'Song Rights', href: '/song-splits', icon: Music },
      { label: 'License Vault', href: '/licenses', icon: Shield },
      { label: 'Cash Flow', href: '/transactions', icon: CreditCard },
      { label: 'Tip Jar', href: '/donations', icon: Gift }
    ]
  },
  {
    title: '🚌 TOUR BUS',
    items: [
      { label: 'Road Maps', href: '/tours', icon: Globe },
      { label: 'Gig Calendar', href: '/shows', icon: Mic },
      { label: 'Venue Guide', href: '/venues', icon: Building },
      { label: 'Set Lists', href: '/setlists', icon: ListMusic },
      { label: 'Fan Base', href: '/fans', icon: Users }
    ]
  },
  {
    title: '🎤 GREEN ROOM',
    items: [
      { label: 'Your Bands', href: '/organizations', icon: Building },
      { label: 'Band Mates', href: '/members', icon: Users },
      { label: 'Guest List', href: '/invites', icon: UserPlus }
    ]
  },
  {
    title: '🍺 THE BAR',
    items: [
      { label: 'Talent Board', href: '/marketplace', icon: Globe },
      { label: 'DMs', href: '/messages', icon: Mail },
      { label: 'Open Mic', href: '/forums', icon: MessageSquare }
    ]
  },
  {
    title: '📰 PRESS ROOM',
    items: [
      { label: 'Event Board', href: '/events', icon: Calendar },
      { label: 'Press Kit', href: '/press', icon: Megaphone },
      { label: 'Trophy Case', href: '/awards', icon: Award },
      { label: 'Podcast Booth', href: '/podcasts', icon: Podcast }
    ]
  },
  {
    title: '⚙️ MANAGER\'S OFFICE',
    items: [
      { label: 'Artist Profile', href: '/profile', icon: User },
      { label: 'Venue Settings', href: '/settings', icon: Settings },
      { label: 'Box Office', href: '/billing', icon: BillingIcon }
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
      {/* Venue Sign - Logo */}
      <div className="p-6 border-b border-rnrb-smoke-haze/50 bg-rnrb-shadow relative overflow-hidden">
        <div className="rnrb-stage-light absolute inset-0 opacity-20"></div>
        <Link href="/dashboard" className="relative z-10 block text-center">
          <h1 className="rnrb-neon text-3xl font-black tracking-wider">RN'RB</h1>
          <p className="text-xs text-rnrb-dust uppercase tracking-widest mt-1">Underground HQ</p>
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

      {/* Exit Sign */}
      <div className="p-4 border-t border-rnrb-smoke-haze/50">
        <div className="rnrb-exit-sign text-center">
          <span className="text-xs">QUICK SEARCH ⌘K</span>
        </div>
      </div>
    </aside>
  );
}
