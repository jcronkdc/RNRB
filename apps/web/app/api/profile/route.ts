import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    // Extract profile completion flag and musician profile data
    const {
      profileCompleted,
      display_name,
      username,
      bio,
      profile_picture_url,
      // Musician profile data
      socialLinks,
      websites,
      location,
      yearsExperience,
      availableForCollaboration,
      availableForGigs,
      stageName,
      recordLabel,
      management,
      bookingEmail,
      pressEmail,
      instruments,
      genres,
      phone,
      ...rest
    } = data;

    // Update user profile completion status and basic info
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileCompleted: profileCompleted ?? false,
        // Update name if provided in display_name
        ...(display_name && { name: display_name }),
        // Update profile picture if provided
        ...(profile_picture_url && { image: profile_picture_url }),
      },
    });

    // Upsert MusicianProfile with all the extended data
    await prisma.musicianProfile.upsert({
      where: { userId },
      create: {
        userId,
        instruments: instruments || [],
        genres: genres || [],
        skills: [],
        location: location || null,
        availableForCollaboration: availableForCollaboration ?? true,
        availableForGigs: availableForGigs ?? false,
        socialLinks: {
          // Store all social links and additional data in JSON
          ...socialLinks,
          // Store websites array
          websites: websites || [],
          // Store contact info
          phone: phone || null,
          bookingEmail: bookingEmail || null,
          pressEmail: pressEmail || null,
          management: management || null,
          // Store additional musician info
          stageName: stageName || null,
          recordLabel: recordLabel || null,
          yearsExperience: yearsExperience || null,
          // Store profile basics for convenience
          username: username || null,
          bio: bio || null,
        },
        portfolio: undefined,
      },
      update: {
        instruments: instruments || [],
        genres: genres || [],
        location: location || null,
        availableForCollaboration: availableForCollaboration ?? true,
        availableForGigs: availableForGigs ?? false,
        socialLinks: {
          ...socialLinks,
          websites: websites || [],
          phone: phone || null,
          bookingEmail: bookingEmail || null,
          pressEmail: pressEmail || null,
          management: management || null,
          stageName: stageName || null,
          recordLabel: recordLabel || null,
          yearsExperience: yearsExperience || null,
          username: username || null,
          bio: bio || null,
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PROFILE] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch profile data
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user and musician profile
    const [user, musicianProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profileCompleted: true,
        },
      }),
      prisma.musicianProfile.findUnique({
        where: { userId },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse socialLinks JSON to extract all stored data
    const socialLinksData = (musicianProfile?.socialLinks as Record<string, unknown>) || {};

    return NextResponse.json({
      // User basic info
      display_name: user.name || '',
      profile_picture_url: user.image || '',
      profileCompleted: user.profileCompleted,
      // From socialLinks JSON
      username: socialLinksData.username || '',
      bio: socialLinksData.bio || '',
      websites: socialLinksData.websites || [{ id: '1', label: 'Main Website', url: '' }],
      socialLinks: {
        spotify: socialLinksData.spotify || '',
        appleMusic: socialLinksData.appleMusic || '',
        soundcloud: socialLinksData.soundcloud || '',
        bandcamp: socialLinksData.bandcamp || '',
        audiomack: socialLinksData.audiomack || '',
        tidal: socialLinksData.tidal || '',
        deezer: socialLinksData.deezer || '',
        amazonMusic: socialLinksData.amazonMusic || '',
        youtube: socialLinksData.youtube || '',
        vimeo: socialLinksData.vimeo || '',
        twitch: socialLinksData.twitch || '',
        instagram: socialLinksData.instagram || '',
        twitter: socialLinksData.twitter || '',
        facebook: socialLinksData.facebook || '',
        tiktok: socialLinksData.tiktok || '',
        threads: socialLinksData.threads || '',
        bluesky: socialLinksData.bluesky || '',
        mastodon: socialLinksData.mastodon || '',
        linkedin: socialLinksData.linkedin || '',
        discord: socialLinksData.discord || '',
        telegram: socialLinksData.telegram || '',
        songkick: socialLinksData.songkick || '',
        bandsintown: socialLinksData.bandsintown || '',
        genius: socialLinksData.genius || '',
        patreon: socialLinksData.patreon || '',
        kofi: socialLinksData.kofi || '',
        buyMeACoffee: socialLinksData.buyMeACoffee || '',
        linktree: socialLinksData.linktree || '',
      },
      phone: socialLinksData.phone || '',
      bookingEmail: socialLinksData.bookingEmail || '',
      pressEmail: socialLinksData.pressEmail || '',
      management: socialLinksData.management || '',
      stageName: socialLinksData.stageName || '',
      recordLabel: socialLinksData.recordLabel || '',
      yearsExperience: socialLinksData.yearsExperience || '',
      // From MusicianProfile model fields
      location: musicianProfile?.location || '',
      instruments: musicianProfile?.instruments || [],
      genres: musicianProfile?.genres || [],
      availableForCollaboration: musicianProfile?.availableForCollaboration ?? true,
      availableForGigs: musicianProfile?.availableForGigs ?? false,
    });
  } catch (error) {
    console.error('[PROFILE GET] ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
