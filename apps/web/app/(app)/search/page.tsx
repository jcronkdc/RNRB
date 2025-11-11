import { Suspense } from 'react';
import { getOrgSession } from '@songforge/auth';
import { redirect } from 'next/navigation';
import PageHeader from '../../../components/app/PageHeader';
import { SearchResults } from './SearchResults';
import { CardGridSkeleton } from '../../../components/app/Skeletons';

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string; type?: string }
}) {
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let orgId: string | null = null;

  try {
    const session = await getOrgSession();
    orgId = session.orgId;
  } catch (error) {
    if (enableBypass) {
      orgId = 'demo-org';
    } else {
      redirect('/signin');
    }
  }

  const query = searchParams.q || '';
  const type = searchParams.type || 'all';

  return (
    <div className="space-y-10">
      <PageHeader
        title="Search"
        subtitle={query ? `Results for "${query}"` : 'Search across projects, songs, and assets'}
      />
      <Suspense fallback={<CardGridSkeleton count={6} />}>
        <SearchResults query={query} type={type} />
      </Suspense>
    </div>
  );
}

