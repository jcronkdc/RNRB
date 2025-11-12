import { PageHeaderSkeleton, CardGridSkeleton } from '../../../components/app/Skeletons';

export default function Loading() {
  return (
    <main className="space-y-10 px-6 py-10 sm:px-10">
      <h1 className="sr-only">Loading Projects</h1>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={8} />
    </main>
  );
}
