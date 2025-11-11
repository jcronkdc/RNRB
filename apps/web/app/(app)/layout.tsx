import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { OrgSession } from '@songforge/auth';
import { getOrgSession } from '@songforge/auth';
import AppChrome from '../../components/app/AppChrome';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let orgSession: OrgSession | null = null;

  try {
    orgSession = await getOrgSession();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (enableBypass && message === 'UNAUTHENTICATED') {
      const cookieOrg = cookies().get('sf_org')?.value ?? null;
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
        redirect('/signin');
      }
    } else if (enableBypass && message === 'NO_ACTIVE_ORG') {
      const cookieOrg = cookies().get('sf_org')?.value ?? null;
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
      redirect('/signin');
    } else if (message === 'NO_ACTIVE_ORG') {
      redirect('/onboarding/organization');
    } else {
      throw error;
    }
  }

  if (!orgSession) {
    redirect('/signin');
  }

  const userName = orgSession.session.user?.name ?? 'SongForge Member';
  const userEmail = orgSession.session.user?.email ?? undefined;

  return (
    <AppChrome title="SongForge HQ" userName={userName} userEmail={userEmail}>
      {children}
    </AppChrome>
  );
}

