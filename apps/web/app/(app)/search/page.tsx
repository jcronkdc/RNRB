import { getOrgSession } from '@cronkwater/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { SearchResults } from './SearchResults';
import PageHeader from '../../../components/app/PageHeader';
import { CardGridSkeleton } from '../../../components/app/Skeletons';

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q, type: typeParam } = await searchParams;
  const enableBypass = process.env.DEMO_BYPASS === '1';
  let _orgId: string | null = null;

  try {
    const session = await getOrgSession();
    _orgId = session.orgId;
  } catch {
    if (enableBypass) {
      _orgId = 'demo-org';
    } else {
      redirect('/signin');
    }
  }

  const query = q || '';
  const type = typeParam || 'all';

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

