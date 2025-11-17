import { notFound, redirect } from 'next/navigation';
import { getOrgSession } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { TourDetailClient } from './TourDetailClient';

export const dynamic = 'force-dynamic';

interface TourDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;
  const session = await getOrgSession();
  
  if (!session) {
    redirect('/auth');
  }

  const tour = await prisma.tour.findUnique({
    where: {
      slug,
      orgId: session.orgId,
    },
    include: {
      shows: {
        include: {
          venue: true,
          _count: {
            select: { fanEngagements: true },
          },
        },
        orderBy: { date: 'asc' },
      },
      _count: {
        select: { 
          shows: true,
          fanEngagements: true,
        },
      },
    },
  });

  if (!tour) {
    notFound();
  }

  return <TourDetailClient tour={tour} />;
}







