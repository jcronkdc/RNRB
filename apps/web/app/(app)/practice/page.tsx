import { getOrgSession } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import { PracticePageClient } from './PracticePageClient';

export const dynamic = 'force-dynamic';

export default async function PracticePage() {
  const session = await getOrgSession();
  if (!session) {
    redirect('/auth');
  }

  return <PracticePageClient />;
}




