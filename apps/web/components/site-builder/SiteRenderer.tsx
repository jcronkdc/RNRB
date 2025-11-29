'use client';

import {
  HeroSection,
  MusicPlayerSection,
  TourDatesSection,
  BioSection,
  ContactSection,
  MailingListSection,
  HeaderSection,
  FooterSection,
  VideoHeroSection,
  StreamingSection,
  PhotoGallerySection,
  BookingSection,
  MerchStoreSection,
} from './sections';

// Type definitions for section props
interface VideoHeroSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    videoUrl?: string;
    youtubeId?: string;
    vimeoId?: string;
    posterImage?: string;
    ctaText?: string;
    ctaLink?: string;
    overlayOpacity?: number;
    textAlignment?: 'left' | 'center' | 'right';
    autoplay?: boolean;
    loop?: boolean;
    showControls?: boolean;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    overlayColor?: string;
  };
}

interface StreamingSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    links?: { platform: string; url: string; embedId?: string }[];
    featuredEmbed?: {
      platform: 'spotify' | 'apple' | 'soundcloud' | 'bandcamp';
      embedUrl: string;
      embedType: 'track' | 'album' | 'playlist' | 'artist';
    };
    layout?: 'featured' | 'grid' | 'list';
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

interface PhotoGallerySectionProps {
  content: {
    title?: string;
    subtitle?: string;
    photos?: { url: string; alt?: string; caption?: string }[];
    layout?: 'grid' | 'masonry' | 'carousel';
    columns?: 2 | 3 | 4;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

interface BookingSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    email?: string;
    showPricing?: boolean;
    pricingNote?: string;
    availableFor?: string[];
    requirements?: string;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  subdomain?: string;
}

interface MerchStoreSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    products?: {
      id: string;
      name: string;
      description?: string;
      price: number;
      comparePrice?: number;
      images: string[];
      category?: string;
      variants?: { name: string; options: string[] }[];
      inStock: boolean;
    }[];
    layout?: 'grid' | 'featured' | 'carousel';
    columns?: 2 | 3 | 4;
    showCategories?: boolean;
    stripeEnabled?: boolean;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  subdomain?: string;
}

interface SiteSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
  styles?: Record<string, unknown> | null;
  animation?: string | null;
  isVisible: boolean;
  order: number;
}

interface Site {
  id: string;
  siteName: string | null;
  subdomain: string;
  templateId: string;
  theme: Record<string, unknown> | null;
  socialLinks: Record<string, string> | null;
  sections: SiteSection[];
}

interface SiteRendererProps {
  site: Site;
  isPreview?: boolean;
}

export function SiteRenderer({ site, isPreview = false }: SiteRendererProps) {
  const theme = (site.theme || {}) as Record<string, unknown>;
  const socialLinks = (site.socialLinks || {}) as Record<string, string>;

  // Sort sections by order
  const sortedSections = [...site.sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  // Separate header, footer, and content sections
  const headerSection = sortedSections.find((s) => s.type === 'header');
  const footerSection = sortedSections.find((s) => s.type === 'footer');
  const contentSections = sortedSections.filter((s) => s.type !== 'header' && s.type !== 'footer');

  const renderSection = (section: SiteSection) => {
    const content = section.content as Record<string, unknown>;
    const animation = section.animation || undefined;

    switch (section.type) {
      case 'hero_image':
      case 'hero_slideshow':
      case 'hero_animated':
      case 'hero_split':
        return (
          <HeroSection key={section.id} content={content} theme={theme} animation={animation} />
        );

      case 'hero_video':
      case 'video_hero':
        return (
          <VideoHeroSection
            key={section.id}
            content={content as VideoHeroSectionProps['content']}
            styles={{
              backgroundColor: theme.primaryColor as string,
              textColor: theme.textColor as string,
              accentColor: theme.accentColor as string,
              overlayColor: theme.secondaryColor as string,
            }}
          />
        );

      case 'streaming':
      case 'streaming_links':
        return (
          <StreamingSection
            key={section.id}
            content={content as StreamingSectionProps['content']}
            styles={{
              backgroundColor: theme.primaryColor as string,
              textColor: theme.textColor as string,
              accentColor: theme.accentColor as string,
            }}
          />
        );

      case 'photo_gallery':
      case 'gallery':
        return (
          <PhotoGallerySection
            key={section.id}
            content={content as PhotoGallerySectionProps['content']}
            styles={{
              backgroundColor: theme.primaryColor as string,
              textColor: theme.textColor as string,
              accentColor: theme.accentColor as string,
            }}
          />
        );

      case 'booking':
      case 'booking_form':
        return (
          <BookingSection
            key={section.id}
            content={content as BookingSectionProps['content']}
            styles={{
              backgroundColor: theme.primaryColor as string,
              textColor: theme.textColor as string,
              accentColor: theme.accentColor as string,
            }}
            subdomain={site.subdomain}
          />
        );

      case 'merch':
      case 'merch_store':
        return (
          <MerchStoreSection
            key={section.id}
            content={content as MerchStoreSectionProps['content']}
            styles={{
              backgroundColor: theme.primaryColor as string,
              textColor: theme.textColor as string,
              accentColor: theme.accentColor as string,
            }}
            subdomain={site.subdomain}
          />
        );

      case 'music_player':
      case 'music_spotify':
      case 'music_apple':
      case 'music_bandcamp':
      case 'discography':
        return (
          <MusicPlayerSection
            key={section.id}
            content={content}
            theme={theme}
            animation={animation}
          />
        );

      case 'tour_dates':
      case 'tour_map':
      case 'tour_upcoming':
        return (
          <TourDatesSection
            key={section.id}
            content={content}
            theme={theme}
            animation={animation}
          />
        );

      case 'bio_full':
      case 'bio_split':
      case 'band_members':
      case 'timeline':
      case 'achievements':
        return (
          <BioSection
            key={section.id}
            content={{
              ...content,
              layout:
                section.type === 'bio_split'
                  ? 'split'
                  : section.type === 'bio_full'
                    ? 'full'
                    : 'centered',
            }}
            theme={theme}
            animation={animation}
          />
        );

      case 'contact_form':
        return (
          <ContactSection
            key={section.id}
            content={content}
            theme={theme}
            animation={animation}
            siteId={site.id}
          />
        );

      case 'mailing_list':
        return (
          <MailingListSection
            key={section.id}
            content={content}
            theme={theme}
            animation={animation}
            siteId={site.id}
          />
        );

      case 'social_links':
        return (
          <SocialLinksSection
            key={section.id}
            content={content}
            theme={theme}
            socialLinks={socialLinks}
          />
        );

      default:
        // Fallback for unknown section types
        if (isPreview) {
          return (
            <div
              key={section.id}
              className="px-4 py-20 text-center"
              style={{ backgroundColor: (theme.secondaryColor as string) || '#1a1a1a' }}
            >
              <p style={{ color: (theme.mutedColor as string) || '#888' }}>
                Section: {section.type}
              </p>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: (theme.primaryColor as string) || '#000',
        fontFamily: (theme.fontBody as string) || 'inherit',
      }}
    >
      {/* Header */}
      {headerSection && (
        <HeaderSection
          content={headerSection.content as Record<string, unknown>}
          theme={theme}
          socialLinks={socialLinks}
        />
      )}

      {/* Main Content */}
      <main>{contentSections.map(renderSection)}</main>

      {/* Footer */}
      {footerSection && (
        <FooterSection
          content={footerSection.content as Record<string, unknown>}
          theme={theme}
          socialLinks={socialLinks}
          siteName={site.siteName || undefined}
        />
      )}

      {/* Preview Mode Indicator */}
      {isPreview && (
        <div className="fixed bottom-4 left-4 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black">
          Preview Mode
        </div>
      )}
    </div>
  );
}

// Simple social links section
function SocialLinksSection({
  content,
  theme,
  socialLinks,
}: {
  content: Record<string, unknown>;
  theme: Record<string, unknown>;
  socialLinks: Record<string, string>;
}) {
  const title = (content.title as string) || 'Connect';
  const accentColor = (theme.accentColor as string) || '#ff6347';

  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return null;
  }

  return (
    <section
      className="px-4 py-16"
      style={{ backgroundColor: (theme.primaryColor as string) || '#000' }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2
          className="mb-8 text-3xl font-bold"
          style={{
            fontFamily: (theme.fontHeading as string) || 'inherit',
            color: (theme.textColor as string) || '#fff',
          }}
        >
          {title}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {Object.entries(socialLinks).map(([platform, url]) => {
            if (!url) return null;
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: accentColor + '20',
                  color: accentColor,
                  borderRadius: (theme.borderRadius as string) || '8px',
                }}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
