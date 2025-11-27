import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

// POST /api/sites/quick-start - Auto-generate a website from user's existing data
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { templateId = 'noir' } = body;

    // Check if user already has a site
    const existingSite = await prisma.musicianSite.findUnique({
      where: { userId },
    });

    if (existingSite) {
      return NextResponse.json(
        {
          error: 'Site already exists',
          site: existingSite,
          editUrl: `/sites/edit`,
        },
        { status: 409 }
      );
    }

    // Fetch all user data in parallel for the quick start
    const [user, musicianProfile, memberships, songs, communityTracks, shows, tours] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        }),
        prisma.musicianProfile.findUnique({
          where: { userId },
        }),
        prisma.membership.findMany({
          where: { userId },
          include: {
            org: {
              include: {
                bandMembers: true,
                awards: true,
              },
            },
          },
        }),
        prisma.song.findMany({
          where: {
            userId,
            archived: false,
            audioUrl: { not: null },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        prisma.communityTrack.findMany({
          where: { userId },
          include: { song: true },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        }),
        prisma.show.findMany({
          where: {
            org: {
              memberships: {
                some: { userId },
              },
            },
            date: { gte: new Date() },
          },
          include: { venue: true },
          orderBy: { date: 'asc' },
          take: 20,
        }),
        prisma.tour.findMany({
          where: {
            org: {
              memberships: {
                some: { userId },
              },
            },
          },
          orderBy: { startDate: 'desc' },
          take: 5,
        }),
      ]);

    // Get primary org if user is in a band
    const primaryMembership = memberships.find((m) => m.role === 'owner') || memberships[0];
    const primaryOrg = primaryMembership?.org;

    // Generate subdomain from name
    const baseName = primaryOrg?.name || user?.name || 'musician';
    const subdomain = generateSubdomain(baseName);

    // Determine what sections to auto-create based on available data
    const sections: SectionConfig[] = [];
    let sectionOrder = 0;

    // Always add header
    sections.push({
      type: 'header',
      order: sectionOrder++,
      content: {
        siteName: primaryOrg?.name || user?.name || 'My Music',
        showNav: true,
        navItems: ['Home', 'Music', 'Tour', 'About', 'Contact'],
      },
    });

    // Always add hero section
    sections.push({
      type: 'hero_image',
      order: sectionOrder++,
      content: {
        title: primaryOrg?.name || user?.name || 'Welcome',
        subtitle: primaryOrg?.tagline || musicianProfile?.experience || 'Official Website',
        backgroundImage: primaryOrg?.images
          ? (primaryOrg.images as Record<string, string>).hero
          : null,
        ctaText:
          songs.length > 0 ? 'Listen Now' : shows.length > 0 ? 'See Tour Dates' : 'Learn More',
        ctaLink: songs.length > 0 ? '#music' : shows.length > 0 ? '#tour' : '#about',
        overlay: 0.6,
      },
      animation: 'fade-in',
    });

    // Add music section if they have songs
    if (songs.length > 0 || communityTracks.length > 0) {
      sections.push({
        type: 'music_player',
        order: sectionOrder++,
        content: {
          autoSync: true,
          title: 'Music',
          subtitle: 'Listen to our latest tracks',
          songIds: songs.map((s) => s.id),
          communityTrackIds: communityTracks.map((ct) => ct.id),
          showWaveform: true,
          layout: 'list',
        },
        animation: 'slide-up',
      });
    }

    // Add tour section if they have upcoming shows
    if (shows.length > 0) {
      sections.push({
        type: 'tour_dates',
        order: sectionOrder++,
        content: {
          autoSync: true,
          title: 'Tour Dates',
          subtitle: 'Catch us live',
          showIds: shows.map((s) => s.id),
          showMap: true,
          showTicketLinks: true,
        },
        animation: 'slide-up',
      });
    }

    // Add about/bio section
    const bioContent = primaryOrg?.bio || musicianProfile?.experience || '';
    sections.push({
      type: 'bio_split',
      order: sectionOrder++,
      content: {
        title: 'About',
        bio:
          bioContent ||
          `Welcome to the official website of ${primaryOrg?.name || user?.name || 'the artist'}.`,
        image:
          user?.image || primaryOrg?.images
            ? (primaryOrg?.images as Record<string, string>)?.profile
            : null,
        genres: primaryOrg?.genre || musicianProfile?.genres || [],
        location: primaryOrg?.location || musicianProfile?.location,
      },
      animation: 'fade-in',
    });

    // Add band members if it's a band with members
    if (primaryOrg?.bandMembers && primaryOrg.bandMembers.length > 0) {
      sections.push({
        type: 'band_members',
        order: sectionOrder++,
        content: {
          title: 'The Band',
          members: primaryOrg.bandMembers.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            image: m.image,
            instruments: m.instruments,
          })),
        },
        animation: 'slide-up',
      });
    }

    // Add awards if they have any
    if (primaryOrg?.awards && primaryOrg.awards.length > 0) {
      sections.push({
        type: 'achievements',
        order: sectionOrder++,
        content: {
          title: 'Achievements',
          awards: primaryOrg.awards.map((a) => ({
            id: a.id,
            name: a.name,
            organization: a.organization,
            year: a.year,
            image: a.image,
          })),
        },
        animation: 'fade-in',
      });
    }

    // Add social links section
    const socialLinks = primaryOrg?.socialLinks || musicianProfile?.socialLinks;
    if (socialLinks) {
      sections.push({
        type: 'social_links',
        order: sectionOrder++,
        content: {
          title: 'Connect',
          links: socialLinks,
          layout: 'icons',
        },
      });
    }

    // Add mailing list section
    sections.push({
      type: 'mailing_list',
      order: sectionOrder++,
      content: {
        title: 'Stay Updated',
        subtitle: 'Join our mailing list for exclusive news and updates',
        provider: 'native',
        buttonText: 'Subscribe',
      },
      animation: 'slide-up',
    });

    // Add contact form
    sections.push({
      type: 'contact_form',
      order: sectionOrder++,
      content: {
        title: 'Get In Touch',
        subtitle: 'For booking inquiries and press',
        fields: ['name', 'email', 'subject', 'message', 'inquiryType'],
        inquiryTypes: ['Booking', 'Press', 'Fan Message', 'Other'],
        submitTo: 'email',
        email: primaryOrg?.bookingEmail || user?.email,
      },
      animation: 'fade-in',
    });

    // Always add footer
    sections.push({
      type: 'footer',
      order: sectionOrder++,
      content: {
        copyright: `© ${new Date().getFullYear()} ${primaryOrg?.name || user?.name || 'Artist'}. All rights reserved.`,
        socialLinks: socialLinks,
        showPoweredBy: true,
      },
    });

    // Get theme defaults for template
    const themeDefaults = getTemplateTheme(templateId);

    // Create the site with all sections
    const site = await prisma.musicianSite.create({
      data: {
        userId,
        orgId: primaryOrg?.id,
        subdomain,
        templateId,
        theme: themeDefaults,
        siteName: primaryOrg?.name || user?.name || 'My Music',
        tagline: primaryOrg?.description || '',
        siteTitle: `${primaryOrg?.name || user?.name || 'Artist'} | Official Website`,
        metaDescription:
          primaryOrg?.bio ||
          `Welcome to the official website of ${primaryOrg?.name || user?.name}.`,
        socialLinks: socialLinks || {},
        bookingEmail: primaryOrg?.bookingEmail,
        publicEmail: primaryOrg?.contactEmail || user?.email,
        quickStartUsed: true,
        status: 'draft',
        // Create homepage
        pages: {
          create: {
            slug: 'home',
            title: 'Home',
            isHomepage: true,
            order: 0,
          },
        },
        // Create all sections
        sections: {
          create: sections.map((s) => ({
            type: s.type as any,
            order: s.order,
            content: s.content,
            animation: s.animation,
            isVisible: true,
          })),
        },
      },
      include: {
        sections: true,
        pages: true,
      },
    });

    return NextResponse.json({
      success: true,
      site,
      message: 'Your website has been created! Review and customize it before publishing.',
      editUrl: `/sites/edit`,
      previewUrl: `/s/${subdomain}`,
      stats: {
        sectionsCreated: sections.length,
        songsIncluded: songs.length,
        showsIncluded: shows.length,
        dataSourced: {
          profile: !!musicianProfile,
          org: !!primaryOrg,
          songs: songs.length > 0,
          shows: shows.length > 0,
          bandMembers: (primaryOrg?.bandMembers?.length || 0) > 0,
          awards: (primaryOrg?.awards?.length || 0) > 0,
        },
      },
    });
  } catch (error) {
    console.error('[QUICK-START] Error:', error);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}

// Helper types
interface SectionConfig {
  type: string;
  order: number;
  content: Record<string, unknown>;
  animation?: string;
}

// Generate URL-safe subdomain
function generateSubdomain(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// Get default theme for a template
function getTemplateTheme(templateId: string): Record<string, unknown> {
  const themes: Record<string, Record<string, unknown>> = {
    noir: {
      primaryColor: '#000000',
      accentColor: '#ff6347',
      secondaryColor: '#1a1a1a',
      textColor: '#ffffff',
      mutedColor: '#888888',
      fontHeading: 'Playfair Display',
      fontBody: 'Inter',
      darkMode: true,
      borderRadius: '0px',
      heroOverlay: 0.7,
      animations: true,
    },
    vinyl: {
      primaryColor: '#2d1b0e',
      accentColor: '#d4a574',
      secondaryColor: '#4a3728',
      textColor: '#f5e6d3',
      mutedColor: '#a89080',
      fontHeading: 'Bitter',
      fontBody: 'Lora',
      darkMode: true,
      borderRadius: '8px',
      heroOverlay: 0.5,
      animations: true,
    },
    neon: {
      primaryColor: '#0a0a0a',
      accentColor: '#00ffff',
      secondaryColor: '#1a0a2e',
      textColor: '#ffffff',
      mutedColor: '#666666',
      fontHeading: 'Orbitron',
      fontBody: 'Rajdhani',
      darkMode: true,
      borderRadius: '0px',
      heroOverlay: 0.8,
      animations: true,
      glowEffects: true,
    },
    acoustic: {
      primaryColor: '#f5f0e8',
      accentColor: '#8b6914',
      secondaryColor: '#e8dcc8',
      textColor: '#2c2416',
      mutedColor: '#6b5d4a',
      fontHeading: 'Merriweather',
      fontBody: 'Source Serif Pro',
      darkMode: false,
      borderRadius: '12px',
      heroOverlay: 0.3,
      animations: true,
    },
    arena: {
      primaryColor: '#1a1a2e',
      accentColor: '#e94560',
      secondaryColor: '#16213e',
      textColor: '#ffffff',
      mutedColor: '#888888',
      fontHeading: 'Anton',
      fontBody: 'Roboto',
      darkMode: true,
      borderRadius: '4px',
      heroOverlay: 0.6,
      animations: true,
      dramaticEffects: true,
    },
    editorial: {
      primaryColor: '#ffffff',
      accentColor: '#000000',
      secondaryColor: '#f8f8f8',
      textColor: '#1a1a1a',
      mutedColor: '#666666',
      fontHeading: 'Cormorant Garamond',
      fontBody: 'Nunito Sans',
      darkMode: false,
      borderRadius: '0px',
      heroOverlay: 0.2,
      animations: false,
    },
    outlaw: {
      primaryColor: '#1c1610',
      accentColor: '#c9a962',
      secondaryColor: '#2d2520',
      textColor: '#e8dcc8',
      mutedColor: '#8a7a6a',
      fontHeading: 'Oswald',
      fontBody: 'Libre Baskerville',
      darkMode: true,
      borderRadius: '0px',
      heroOverlay: 0.5,
      animations: true,
      textureOverlay: true,
    },
    futura: {
      primaryColor: '#0d0d0d',
      accentColor: '#c0c0c0',
      secondaryColor: '#1a1a1a',
      textColor: '#ffffff',
      mutedColor: '#666666',
      fontHeading: 'Bebas Neue',
      fontBody: 'Montserrat',
      darkMode: true,
      borderRadius: '16px',
      heroOverlay: 0.7,
      animations: true,
      glassmorphism: true,
    },
  };

  return themes[templateId] || themes.noir;
}
