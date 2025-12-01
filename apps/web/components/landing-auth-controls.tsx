'use client';

import { LogOut, LayoutDashboard } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export function LandingAuthControls() {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Don't show anything while loading or if not authenticated
  if (status === 'loading' || !session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  const firstName = session.user.name?.split(' ')[0] || 'there';

  return (
    <div
      className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-full px-1 py-1"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Dashboard Button */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/10"
        style={{ color: 'var(--text)' }}
      >
        <LayoutDashboard className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        <span className="hidden sm:inline">{firstName}</span>
      </Link>

      {/* Divider */}
      <div className="h-5 w-px bg-white/20" />

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center justify-center rounded-full p-2 transition-all duration-200 hover:bg-red-500/20"
        style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        title="Sign Out"
      >
        {isSigningOut ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
