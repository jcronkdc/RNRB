/**
 * SEO Utilities for Rock N' Roll Basement
 * Comprehensive SEO metadata generation for optimal search engine ranking
 */

import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: "Rock N' Roll Basement",
  shortName: 'RNRB',
  description:
    "Rock N' Roll Basement is the all-in-one music collaboration platform for bands, studios, and musicians. Songwriting tools, AI assistance, real-time collaboration, tour management, and more.",
  url: 'https://cronkwaters.com',
  ogImage: 'https://cronkwaters.com/opengraph-image',
  links: {
    twitter: 'https://twitter.com/rocknrollbasement',
    github: 'https://github.com/jcronkdc/RNRB',
  },
  keywords: [
    // Primary keywords
    'music collaboration platform',
    'band management software',
    'songwriting tools',
    'music production software',
    'online music collaboration',

    // Feature-specific keywords
    'AI songwriting assistant',
    'real-time music collaboration',
    'tour management software',
    'setlist builder',
    'split sheet generator',
    'copyright registration music',
    'music project management',
    'DAW collaboration',
    'remote music recording',
    'band collaboration app',

    // User type keywords
    'software for musicians',
    'tools for bands',
    'music studio software',
    'songwriter tools',
    'producer collaboration',
    'independent artist tools',

    // Long-tail keywords
    'how to collaborate on music remotely',
    'best music collaboration software',
    'online band management',
    'manage band tours online',
    'protect music copyright',
    'AI music writing assistant',
    'real-time lyric collaboration',
    'music rights management',
    'royalty tracking software',
    'band revenue tracking',

    // Industry terms
    'ISWC tracking',
    'ISRC codes',
    'music licensing',
    'publishing splits',
    'mechanical royalties',
    'performance rights',
    'music metadata management',

    // Comparison keywords
    'alternative to Splice',
    'better than Soundtrap',
    'vs BandLab',
    'music workspace',
    'all-in-one music platform',
  ],
  creator: 'Justin Cronk',
  authors: [{ name: "Rock N' Roll Basement Team", url: 'https://cronkwaters.com' }],
};

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}

export function generateMetadata({
  title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  canonical,
  noindex = false,
  nofollow = false,
  keywords = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  section,
}: SEOProps = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords];
  const canonicalUrl = canonical || SITE_CONFIG.url;

  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: pageTitle,
    description,
    applicationName: SITE_CONFIG.name,
    keywords: allKeywords,
    authors: authors ? authors.map((name) => ({ name })) : SITE_CONFIG.authors,
    creator: SITE_CONFIG.creator,
    publisher: SITE_CONFIG.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: canonicalUrl,
      title: pageTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
          type: 'image/png',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [image],
      creator: '@rocknrollbasement',
      site: '@rocknrollbasement',
    },
    alternates: {
      canonical: canonicalUrl,
      types: {
        'application/rss+xml': `${SITE_CONFIG.url}/feed.xml`,
      },
    },
    icons: {
      icon: [
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/icon-192.png',
      apple: '/icon-192.png',
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: SITE_CONFIG.shortName,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      // Add other verification codes as needed
    },
    category: 'Music & Audio',
  };
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo-light.png`,
    description: SITE_CONFIG.description,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@rnrb.app',
      contactType: 'Customer Service',
      areaServed: 'Worldwide',
      availableLanguage: ['English'],
    },
    sameAs: [SITE_CONFIG.links.twitter, SITE_CONFIG.links.github],
    founder: {
      '@type': 'Person',
      name: SITE_CONFIG.creator,
    },
  };
}

/**
 * Generate JSON-LD structured data for WebApplication
 */
export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Free Plan',
        description: 'Perfect for getting started',
      },
      {
        '@type': 'Offer',
        price: '9.99',
        priceCurrency: 'USD',
        name: 'Creator Plan',
        description: 'For serious musicians',
      },
      {
        '@type': 'Offer',
        price: '29.99',
        priceCurrency: 'USD',
        name: 'Studio Plan',
        description: 'For professionals & teams',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '250',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
  };
}

/**
 * Generate JSON-LD structured data for FAQ
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD structured data for Breadcrumbs
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD structured data for SoftwareApplication
 */
export function generateSoftwareApplicationSchema(feature: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: feature.name,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    description: feature.description,
    url: feature.url,
    creator: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
  };
}

/**
 * Generate JSON-LD structured data for Article/BlogPost
 */
export function generateArticleSchema({
  title,
  description,
  publishedTime,
  modifiedTime,
  authorName,
  image,
  url,
}: {
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || SITE_CONFIG.ogImage,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo-light.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generate JSON-LD structured data for Product/Offer
 */
export function generateProductSchema({
  name,
  description,
  price,
  currency = 'USD',
  availability = 'InStock',
}: {
  name: string;
  description: string;
  price: string;
  currency?: string;
  availability?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url: SITE_CONFIG.url,
    },
  };
}

/**
 * Generate JSON-LD structured data for Course (for tutorials/guides)
 */
export function generateCourseSchema({
  name,
  description,
  provider,
}: {
  name: string;
  description: string;
  provider?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider || SITE_CONFIG.name,
    },
  };
}

/**
 * Generate JSON-LD structured data for HowTo
 */
export function generateHowToSchema({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: { text: string; image?: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

/**
 * Render JSON-LD script tag
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(data) ? data : [data]),
      }}
    />
  );
}
