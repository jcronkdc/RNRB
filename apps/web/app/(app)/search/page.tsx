import { getOrgSession } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { SearchResults } from './SearchResults';

export const dynamic = 'force-dynamic';
import PageHeader from '../../../components/app/PageHeader';
import { CardGridSkeleton } from '../../../components/app/Skeletons';

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q, type: typeParam } = await searchParams;
  let _orgId: string | null = null;

  try {
    const session = await getOrgSession();
    _orgId = session.orgId;
  } catch {
    // No authentication bypass - require proper authentication
    redirect('/auth');
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

