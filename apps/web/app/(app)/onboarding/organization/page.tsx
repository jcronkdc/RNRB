export const dynamic = 'force-dynamic';

import { Button } from '@cronkwaters/ui';
import { Users, Building2, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OrganizationOnboardingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </div>

        <div
          className="space-y-6 rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <header className="space-y-3 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl"
              style={{ background: 'rgba(232, 93, 59, 0.15)' }}
            >
              <Users className="h-8 w-8" style={{ color: 'var(--accent)' }} />
            </div>
            <h1 className="text-3xl font-semibold" style={{ color: 'var(--text)' }}>
              Your Musical Journey Starts Here
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Create or join an organization to collaborate with your bandmates, manage projects,
              and share your creative work.
            </p>
          </header>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              className="flex flex-1 flex-col items-center gap-3 rounded-xl p-6 transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(232, 93, 59, 0.1)',
                border: '1px solid rgba(232, 93, 59, 0.3)',
              }}
              disabled
            >
              <Building2 className="h-8 w-8" style={{ color: 'var(--accent)' }} />
              <div className="text-center">
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  Create Organization
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Coming Soon
                </p>
              </div>
            </button>

            <button
              className="flex flex-1 flex-col items-center gap-3 rounded-xl p-6 transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
              disabled
            >
              <UserPlus className="h-8 w-8" style={{ color: 'var(--gold)' }} />
              <div className="text-center">
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  Join with Invite
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Coming Soon
                </p>
              </div>
            </button>
          </div>

          <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
            Organizations let you manage band members, share projects, and split royalties fairly.
          </p>

          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <Link
              href="/dashboard"
              className="block text-center text-sm font-medium transition-colors hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Skip for now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
