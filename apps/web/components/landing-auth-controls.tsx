'use client';

import { LogOut, LayoutDashboard } from 'lucide-react';
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

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-3">
      {/* User greeting */}
      <span className="hidden text-sm sm:inline" style={{ color: 'var(--muted)' }}>
        Hey, {session.user.name?.split(' ')[0] || 'there'}!
      </span>

      {/* Go to Dashboard */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'var(--text)',
        }}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-red-500/20"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
        }}
      >
        {isSigningOut ? (
          <>
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
            <span className="hidden sm:inline">Signing out...</span>
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </>
        )}
      </button>
    </div>
  );
}
