import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function currentUser() {
  const session = await auth();
  return session?.user || null;
}

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
      id: orgId,
    },
  };
}

// Server-side getCurrentUser (for API routes using Supabase)
export async function getCurrentUser() {
  // Import here to avoid circular dependencies
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs');
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
}
