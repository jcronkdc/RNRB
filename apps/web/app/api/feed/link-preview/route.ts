import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/feed/link-preview
 * Fetch Open Graph metadata for a URL
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RNRBBot/1.0; +https://rocknrollbasement.com)',
          Accept: 'text/html',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 });
      }

      const html = await response.text();

      // Parse Open Graph and meta tags
      const preview = extractMetadata(html, parsedUrl);

      return NextResponse.json({ preview });
    } catch (fetchError: any) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 });
  }
}

function extractMetadata(html: string, url: URL) {
  const preview: {
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
    type: string | null;
    url: string;
  } = {
    title: null,
    description: null,
    image: null,
    siteName: null,
    type: null,
    url: url.href,
  };

  // Extract Open Graph tags
  const ogTags: Record<string, RegExp> = {
    title: /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    description: /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
    image: /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    siteName: /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i,
    type: /<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i,
  };

  // Also try alternate attribute order
  const ogTagsAlt: Record<string, RegExp> = {
    title: /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
    description: /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i,
    image: /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    siteName: /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i,
    type: /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:type["']/i,
  };

  for (const [key, regex] of Object.entries(ogTags)) {
    let match = html.match(regex);
    if (!match) {
      match = html.match(ogTagsAlt[key]);
    }
    if (match) {
      (preview as any)[key] = decodeHTMLEntities(match[1]);
    }
  }

  // Fallback to standard meta tags
  if (!preview.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      preview.title = decodeHTMLEntities(titleMatch[1]);
    }
  }

  if (!preview.description) {
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    );
    if (descMatch) {
      preview.description = decodeHTMLEntities(descMatch[1]);
    }
  }

  // Make image URL absolute if relative
  if (preview.image && !preview.image.startsWith('http')) {
    preview.image = new URL(preview.image, url.origin).href;
  }

  // Use domain as siteName fallback
  if (!preview.siteName) {
    preview.siteName = url.hostname.replace('www.', '');
  }

  return preview;
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}
