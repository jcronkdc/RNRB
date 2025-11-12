import { getOrgSession } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import { LearnPageClient } from './LearnPageClient';

export const dynamic = 'force-dynamic';

export default async function LearnPage() {
  const session = await getOrgSession();
  if (!session) {
    redirect('/auth');
  }

  return <LearnPageClient />;
}

