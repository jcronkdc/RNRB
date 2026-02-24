import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkRateLimit, standardLimiter } from '@/lib/rate-limit';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limit: 20 profile updates per minute
    try {
      await checkRateLimit(standardLimiter, `profile-update:${userId}`);
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const data = await request.json();

    // Validate body is a plain object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

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

    // ── Input validation & sanitization ──────────────────────────────
    const safeName =
      typeof display_name === 'string' ? display_name.trim().slice(0, 100) : undefined;
    const safeUsername =
      typeof username === 'string'
        ? username
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '')
            .slice(0, 30)
        : undefined;
    const safeBio = typeof bio === 'string' ? bio.slice(0, 2000) : undefined;
    const safeLocation = typeof location === 'string' ? location.trim().slice(0, 200) : null;
    const safeStageName = typeof stageName === 'string' ? stageName.trim().slice(0, 100) : null;
    const safeRecordLabel =
      typeof recordLabel === 'string' ? recordLabel.trim().slice(0, 200) : null;
    const safeManagement = typeof management === 'string' ? management.trim().slice(0, 200) : null;
    const safeYearsExp =
      typeof yearsExperience === 'string' ? yearsExperience.trim().slice(0, 50) : null;
    const safePhone = typeof phone === 'string' ? phone.trim().slice(0, 30) : null;

    // Validate email fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const safeBookingEmail =
      typeof bookingEmail === 'string' && emailRegex.test(bookingEmail.trim())
        ? bookingEmail.trim().slice(0, 254)
        : null;
    const safePressEmail =
      typeof pressEmail === 'string' && emailRegex.test(pressEmail.trim())
        ? pressEmail.trim().slice(0, 254)
        : null;

    // Validate profile picture URL (must be https or empty)
    const safePicUrl =
      typeof profile_picture_url === 'string' &&
      (profile_picture_url === '' || profile_picture_url.startsWith('https://'))
        ? profile_picture_url
        : undefined;

    // Validate arrays (cap at reasonable sizes)
    const safeInstruments = Array.isArray(instruments)
      ? instruments
          .filter((i: unknown) => typeof i === 'string')
          .slice(0, 20)
          .map((i: string) => i.slice(0, 100))
      : [];
    const safeGenres = Array.isArray(genres)
      ? genres
          .filter((g: unknown) => typeof g === 'string')
          .slice(0, 20)
          .map((g: string) => g.slice(0, 100))
      : [];

    // Validate websites array
    const safeWebsites = Array.isArray(websites)
      ? websites.slice(0, 10).map((w: { id?: string; label?: string; url?: string }) => ({
          id: String(w.id || '').slice(0, 50),
          label: String(w.label || '').slice(0, 100),
          url: String(w.url || '').slice(0, 500),
        }))
      : [];

    // Sanitize social links (only allow string values, cap length)
    const safeSocialLinks: Record<string, string> = {};
    if (socialLinks && typeof socialLinks === 'object' && !Array.isArray(socialLinks)) {
      for (const [key, val] of Object.entries(socialLinks as Record<string, unknown>)) {
        if (typeof val === 'string') {
          safeSocialLinks[key.slice(0, 50)] = val.slice(0, 500);
        }
      }
    }

    // Update user profile completion status and basic info
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileCompleted: profileCompleted ?? false,
        // Update name if provided in display_name
        ...(safeName && { name: safeName }),
        // Update profile picture if provided
        ...(safePicUrl && { image: safePicUrl }),
      },
    });

    // Upsert MusicianProfile with all the extended data
    // Build the combined socialLinks JSON payload
    const socialLinksPayload = {
      ...safeSocialLinks,
      websites: safeWebsites,
      phone: safePhone,
      bookingEmail: safeBookingEmail,
      pressEmail: safePressEmail,
      management: safeManagement,
      stageName: safeStageName,
      recordLabel: safeRecordLabel,
      yearsExperience: safeYearsExp,
      username: safeUsername || null,
      bio: safeBio || null,
    };

    await prisma.musicianProfile.upsert({
      where: { userId },
      create: {
        userId,
        instruments: safeInstruments,
        genres: safeGenres,
        skills: [],
        location: safeLocation,
        availableForCollaboration: availableForCollaboration ?? true,
        availableForGigs: availableForGigs ?? false,
        socialLinks: socialLinksPayload,
        portfolio: undefined,
      },
      update: {
        instruments: safeInstruments,
        genres: safeGenres,
        location: safeLocation,
        availableForCollaboration: availableForCollaboration ?? true,
        availableForGigs: availableForGigs ?? false,
        socialLinks: socialLinksPayload,
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
