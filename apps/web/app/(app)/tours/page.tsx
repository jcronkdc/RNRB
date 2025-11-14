import { getOrgSession } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import { listToursAction } from '@/lib/actions/tours';
import { ToursPageClient } from './ToursPageClient';

export const dynamic = 'force-dynamic';

export default async function ToursPage() {
  const session = await getOrgSession();
  if (!session) {
    redirect('/auth');
  }

  const tours = await listToursAction();

  return <ToursPageClient initialTours={tours} />;
}






