import type { OrgSession } from '@cronkwater/auth';
import { getOrgSession } from '@cronkwater/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import AppChrome from '../../components/app/AppChrome';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let orgSession: OrgSession | null = null;

  try {
    orgSession = await getOrgSession();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (enableBypass && message === 'UNAUTHENTICATED') {
      const cookieStore = await cookies();
      const cookieOrg = cookieStore.get('sf_org')?.value ?? null;
      if (cookieOrg) {
        orgSession = {
          session: {
            user: {
              id: 'demo-user',
              name: 'Demo User',
              email: 'demo@example.com',
              image: null
            },
            orgId: cookieOrg
          },
          orgId: cookieOrg,
          memberships: [],
          activeMembership: null
        };
      } else {
        redirect('/auth');
      }
    } else if (enableBypass && message === 'NO_ACTIVE_ORG') {
      const cookieStore = await cookies();
      const cookieOrg = cookieStore.get('sf_org')?.value ?? null;
      if (cookieOrg) {
        orgSession = {
          session: {
            user: {
              id: 'demo-user',
              name: 'Demo User',
              email: 'demo@example.com',
              image: null
            },
            orgId: cookieOrg
          },
          orgId: cookieOrg,
          memberships: [],
          activeMembership: null
        };
      } else {
        redirect('/onboarding/organization');
      }
    } else if (message === 'UNAUTHENTICATED') {
      redirect('/auth');
    } else if (message === 'NO_ACTIVE_ORG') {
      redirect('/onboarding/organization');
    } else {
      throw error;
    }
  }

  if (!orgSession) {
    redirect('/auth');
  }

  const userName = orgSession.session.user?.name ?? 'CronkWater Member';
  const userEmail = orgSession.session.user?.email ?? undefined;

  return (
    <AppChrome title="CronkWater HQ" userName={userName} userEmail={userEmail}>
      {children}
    </AppChrome>
  );
}

