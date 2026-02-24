'use client';

export const dynamic = 'force-dynamic';

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Headphones,
  Music,
  UserPlus,
  Users,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type OrgType = 'band' | 'solo' | 'studio' | 'foundation';
type View = 'choose' | 'create' | 'join';

const ORG_TYPES: { value: OrgType; label: string; description: string; icon: React.ElementType }[] =
  [
    {
      value: 'band',
      label: 'Band',
      description: 'A group of musicians performing together',
      icon: Users,
    },
    {
      value: 'solo',
      label: 'Solo Artist',
      description: 'Independent musician or songwriter',
      icon: Music,
    },
    {
      value: 'studio',
      label: 'Studio',
      description: 'Recording studio or production house',
      icon: Headphones,
    },
    {
      value: 'foundation',
      label: 'Organization',
      description: 'Label, collective, or music org',
      icon: Building2,
    },
  ];

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('choose');

  // Create org state
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('band');
  const [orgDescription, setOrgDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join org state
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Success state
  const [successOrg, setSuccessOrg] = useState<{ name: string; slug: string } | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setCreating(true);
    setCreateError('');

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName.trim(),
          type: orgType,
          description: orgDescription.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Failed to create organization');
        return;
      }

      setSuccessOrg({ name: data.organization.name, slug: data.organization.slug });
    } catch {
      setCreateError('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    setJoinError('');

    try {
      const res = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setJoinError(data.error || 'Failed to join organization');
        return;
      }

      setSuccessOrg({ name: data.organization.name, slug: data.organization.slug });
    } catch {
      setJoinError('Something went wrong. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  // Success view
  if (successOrg) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-2xl px-4 py-12">
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
            className="space-y-6 rounded-2xl p-8 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <CheckCircle2 className="h-8 w-8" style={{ color: '#22c55e' }} />
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              Welcome to {successOrg.name}!
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Your organization is ready. Head to the dashboard to start creating projects and
              inviting collaborators.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3 font-medium text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #ff6b4a)',
                boxShadow: '0 4px 16px rgba(232, 93, 59, 0.3)',
              }}
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Choose View */}
          {view === 'choose' && (
            <>
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
                  Create or join an organization to collaborate with your bandmates, manage
                  projects, and share your creative work.
                </p>
              </header>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => setView('create')}
                  className="flex flex-1 flex-col items-center gap-3 rounded-xl p-6 transition-all hover:scale-[1.02]"
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
                      Start a band, studio, or collective
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setView('join')}
                  className="flex flex-1 flex-col items-center gap-3 rounded-xl p-6 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <UserPlus className="h-8 w-8" style={{ color: 'var(--gold)' }} />
                  <div className="text-center">
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      Join with Invite Code
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Enter a code from your bandmate
                    </p>
                  </div>
                </button>
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <Link
                  href="/dashboard"
                  className="block text-center text-sm font-medium transition-colors hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Skip for now →
                </Link>
              </div>
            </>
          )}

          {/* Create Organization View */}
          {view === 'create' && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('choose')}
                  className="rounded-lg p-2 transition-colors hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                </button>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                  Create Organization
                </h1>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-5">
                {/* Org Name */}
                <div>
                  <label
                    htmlFor="org-name"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Organization Name *
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. The Midnight Riders"
                    maxLength={100}
                    required
                    className="w-full rounded-lg px-4 py-3 transition-all"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                {/* Org Type */}
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ORG_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setOrgType(type.value)}
                          className="flex items-center gap-3 rounded-lg p-3 text-left transition-all"
                          style={{
                            background:
                              orgType === type.value ? 'rgba(232, 93, 59, 0.15)' : 'var(--panel)',
                            border:
                              orgType === type.value
                                ? '1px solid rgba(232, 93, 59, 0.5)'
                                : '1px solid var(--border)',
                          }}
                        >
                          <Icon
                            className="h-5 w-5 shrink-0"
                            style={{
                              color: orgType === type.value ? 'var(--accent)' : 'var(--muted)',
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                              {type.label}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {type.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="org-description"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id="org-description"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder="Tell us about your band, studio, or collective..."
                    maxLength={500}
                    rows={3}
                    className="w-full resize-none rounded-lg px-4 py-3 transition-all"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                {createError && (
                  <p
                    className="rounded-lg p-3 text-sm"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                  >
                    {createError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={creating || !orgName.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), #ff6b4a)',
                    boxShadow: '0 4px 16px rgba(232, 93, 59, 0.3)',
                  }}
                >
                  {creating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Organization
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Join Organization View */}
          {view === 'join' && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('choose')}
                  className="rounded-lg p-2 transition-colors hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                </button>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                  Join with Invite Code
                </h1>
              </div>

              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Ask your bandmate or organization admin for an invite code, then enter it below to
                join their organization.
              </p>

              <form onSubmit={handleJoinOrg} className="space-y-5">
                <div>
                  <label
                    htmlFor="invite-code"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Invite Code *
                  </label>
                  <input
                    id="invite-code"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC123"
                    maxLength={20}
                    required
                    className="w-full rounded-lg px-4 py-3 text-center font-mono text-lg tracking-widest uppercase transition-all"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                {joinError && (
                  <p
                    className="rounded-lg p-3 text-sm"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                  >
                    {joinError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={joining || !inviteCode.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold), #d4a800)',
                    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.2)',
                    color: '#000',
                  }}
                >
                  {joining ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Organization
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
