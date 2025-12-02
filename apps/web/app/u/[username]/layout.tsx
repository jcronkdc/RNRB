import { prisma } from '@cronkwaters/db';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
};

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    // Find profile by username
    const profiles = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "MusicianProfile" 
      WHERE "socialLinks" IS NOT NULL 
      AND "socialLinks"->>'username' = ${username}
      LIMIT 1
    `;

    if (!profiles || profiles.length === 0) {
      return {
        title: "Profile Not Found | Rock N' Roll Basement",
        description: 'This musician profile does not exist.',
      };
    }

    const musicianProfile = await prisma.musicianProfile.findUnique({
      where: { id: profiles[0].id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!musicianProfile?.user) {
      return {
        title: "Profile Not Found | Rock N' Roll Basement",
        description: 'This musician profile does not exist.',
      };
    }

    const socialLinks = (musicianProfile.socialLinks as Record<string, unknown>) || {};
    const displayName = socialLinks.stageName || musicianProfile.user.name || username;
    const bio =
      (socialLinks.bio as string) || `Check out ${displayName}'s music on Rock N' Roll Basement.`;
    const genres = musicianProfile.genres?.slice(0, 3).join(', ') || 'Music';
    const instruments = musicianProfile.instruments?.slice(0, 3).join(', ');

    const description = instruments
      ? `${displayName} - ${genres} musician playing ${instruments}. ${bio.slice(0, 100)}...`
      : `${displayName} - ${genres} musician. ${bio.slice(0, 120)}...`;

    const profileImage = musicianProfile.user.image || '/og-default.png';

    return {
      title: `${displayName} (@${username}) | Rock N' Roll Basement`,
      description: description.slice(0, 160),
      keywords: [
        displayName as string,
        username,
        ...musicianProfile.genres,
        ...musicianProfile.instruments,
        'musician',
        'artist',
        'music',
        'rock n roll basement',
      ].filter(Boolean),
      authors: [{ name: displayName as string }],
      openGraph: {
        type: 'profile',
        title: `${displayName} | Rock N' Roll Basement`,
        description: description.slice(0, 160),
        url: `https://cronkwaters.com/u/${username}`,
        siteName: "Rock N' Roll Basement",
        images: [
          {
            url: profileImage,
            width: 400,
            height: 400,
            alt: `${displayName}'s profile picture`,
          },
        ],
        username: username,
      },
      twitter: {
        card: 'summary',
        title: `${displayName} (@${username})`,
        description: description.slice(0, 160),
        images: [profileImage],
      },
      alternates: {
        canonical: `https://cronkwaters.com/u/${username}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('[Profile Metadata] Error:', error);
    return {
      title: "Musician Profile | Rock N' Roll Basement",
      description: "Discover musicians on Rock N' Roll Basement.",
    };
  }
}

export default function PublicProfileLayout({ children }: Props) {
  return children;
}
