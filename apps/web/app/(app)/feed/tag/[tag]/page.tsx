import { redirect } from 'next/navigation';

interface HashtagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: HashtagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag} | Rock N' Roll Basement`,
    description: `Explore posts tagged with #${decodedTag} on Rock N' Roll Basement`,
  };
}

export default async function HashtagPage({ params }: HashtagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag).toLowerCase();

  // Redirect to feed with tag filter
  redirect(`/feed?tag=${encodeURIComponent(decodedTag)}`);
}
