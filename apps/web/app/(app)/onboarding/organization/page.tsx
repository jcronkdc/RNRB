export const dynamic = 'force-dynamic';

import { Building2, UserPlus, Users } from '@/components/ui/custom-icons';
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

          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            Organizations let you manage band members, share projects, and split royalties fairly.
            This feature is coming soon — for now, head to your dashboard to start creating!
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div
              className="flex flex-1 flex-col items-center gap-3 rounded-xl p-6 opacity-50"
              style={{
                background: 'rgba(232, 93, 59, 0.1)',
                border: '1px solid rgba(232, 93, 59, 0.3)',
              }}
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
            </div>

            <div
              className="flex flex-1 flex-col items-center gap-3 rounded-xl p-6 opacity-50"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
              }}
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
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #ff6b4a)',
                boxShadow: '0 4px 16px rgba(232, 93, 59, 0.3)',
              }}
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
