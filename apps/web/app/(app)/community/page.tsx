import { getOrgSession } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import { CommunityPageClient } from './CommunityPageClient';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const session = await getOrgSession();
  if (!session) {
    redirect('/auth');
  }

  return <CommunityPageClient />;
}


