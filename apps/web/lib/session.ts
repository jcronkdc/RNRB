import { cookies } from 'next/headers';
import { auth } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';

export async function requireUserSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth');
  }
  return session;
}

export async function requireOrgSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth');
  }
  
  const cookieStore = await cookies();
  const orgId = cookieStore.get('sf_org')?.value;
  
  if (!orgId) {
    redirect('/onboarding/organization');
  }
  
  return {
    user: {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
    },
    organization: {
      id: orgId
    }
  };
}
