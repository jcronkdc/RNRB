import { notFound } from 'next/navigation';
import { prisma } from '@cronkwater/db';
import { ArtistPageClient } from './ArtistPageClient';

export const dynamic = 'force-dynamic';

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  
  const org = await prisma.org.findUnique({
    where: {
      slug,
      type: 'band',
    },
    include: {
      projects: {
        where: {
          visibility: 'public',
          status: 'active',
        },
        include: {
          _count: {
            select: { songs: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      tours: {
        where: {
          public: true,
          status: { in: ['announced', 'ongoing'] },
        },
        include: {
          shows: {
            where: {
              date: { gte: new Date() },
              public: true,
              status: { in: ['scheduled', 'soldout'] },
            },
            include: {
              venue: true,
            },
            orderBy: {
              date: 'asc',
            },
            take: 5,
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      },
    },
  });

  if (!org) {
    notFound();
  }

  // Get latest songs from public projects
  const latestSongs = await prisma.song.findMany({
    where: {
      project: {
        orgId: org.id,
        visibility: 'public',
      },
    },
    include: {
      project: {
        select: {
          name: true,
          coverImage: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  return <ArtistPageClient org={org} latestSongs={latestSongs} />;
}


