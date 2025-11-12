import type { OrgSession } from '@cronkwaters/auth';
import { getOrgSession } from '@cronkwaters/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import AppChrome from '../../components/app/AppChrome';

export default async function AppLayout({ children }: { children: ReactNode }) {
  let orgSession: OrgSession | null = null;

  try {
    orgSession = await getOrgSession();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    // No authentication bypass - require proper authentication
    if (message === 'UNAUTHENTICATED') {
      redirect('/auth');
    } else if (message === 'NO_ACTIVE_ORG') {
      redirect('/onboarding/organization');
    } else {
      // Re-throw unexpected errors
      throw error;
    }
  }

  if (!orgSession) {
    redirect('/auth');
  }

  const userName = orgSession.session.user?.name ?? 'CronkWaters Member';
  const userEmail = orgSession.session.user?.email ?? undefined;

  return (
    <AppChrome title="CronkWaters HQ" userName={userName} userEmail={userEmail}>
      {children}
    </AppChrome>
  );
}

