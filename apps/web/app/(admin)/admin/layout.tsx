'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bug,
  CreditCard,
  Database,
  FileText,
  Home,
  Loader2,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/bugs', label: 'Bug Monitor', icon: Bug, hasBadge: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/database', label: 'Database', icon: Database },
  { href: '/admin/activity', label: 'Activity', icon: Activity },
];

function BugBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/admin/error-alerts?acknowledged=false');
        if (!res.ok) return;
        const data = await res.json();
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // Ignore errors - user may not have access
      }
    };

    fetchAlerts();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  // Check if user is the platform owner
  useEffect(() => {
    async function checkOwnerAccess() {
      if (status === 'loading') return;

      if (!session?.user) {
        router.replace('/auth/signin?callbackUrl=/admin');
        return;
      }

      try {
        // Verify owner status via API
        const res = await fetch('/api/admin/verify-owner');
        if (res.ok) {
          const data = await res.json();
          setIsOwner(data.isOwner === true);
        } else {
          setIsOwner(false);
        }
      } catch {
        setIsOwner(false);
      } finally {
        setChecking(false);
      }
    }

    checkOwnerAccess();
  }, [session, status, router]);

  // Loading state
  if (status === 'loading' || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-4 text-sm text-zinc-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
          <p className="mb-6 text-zinc-400">
            This area is restricted to the platform owner only. If you believe this is an error,
            please contact support.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-zinc-800/50 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Admin Panel</p>
              <p className="text-xs text-zinc-500">Owner Only</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.hasBadge && <BugBadge />}
              </Link>
            );
          })}
        </nav>

        {/* Back to App */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800/50 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Home className="h-5 w-5" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
