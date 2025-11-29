import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security';

/**
 * Rhyme Dictionary API - Uses Datamuse API for free rhyme suggestions
 * Datamuse is a powerful free API with no rate limits for reasonable use
 * API docs: https://www.datamuse.com/api/
 */

export async function GET(request: Request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔒 RATE LIMITING: Prevent external API abuse (100 per minute per user)
    try {
      await checkRateLimit(standardLimiter, `rhyme:${session.user.id}`);
    } catch {
      logSecurityEvent('rate_limit', {
        action: 'rhyme-lookup',
        userId: session.user.id,
      });
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const type = searchParams.get('type') || 'perfect'; // perfect, near, sounds-like

    if (!word) {
      return NextResponse.json({ error: 'Word parameter required' }, { status: 400 });
    }

    // Build Datamuse API endpoint based on type
    let apiUrl = '';
    switch (type) {
      case 'perfect':
        // rel_rhy = perfect rhymes
        apiUrl = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=30`;
        break;
      case 'near':
        // rel_nry = near rhymes (words that almost rhyme)
        apiUrl = `https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}&max=30`;
        break;
      case 'sounds-like':
        // sl = sounds like (homophones and close matches)
        apiUrl = `https://api.datamuse.com/words?sl=${encodeURIComponent(word)}&max=20`;
        break;
      default:
        apiUrl = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=30`;
    }

    // Fetch rhymes from Datamuse API (with 5s timeout)
    const response = await fetchWithTimeout(
      apiUrl,
      {
        headers: {
          'User-Agent': 'CronkWaters-Songwriting-Tool',
        },
      },
      TIMEOUTS.FAST_API
    );

    if (!response.ok) {
      throw new Error('Datamuse API request failed');
    }

    const data = await response.json();

    // Transform the response
    const rhymes = data.map((item: { word: string; score: number; syllables?: string }) => ({
      word: item.word,
      score: item.score,
      syllables: item.syllables || null,
    }));

    // Sort by score (Datamuse returns relevance score)
    rhymes.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    // Group by syllable count if available
    const groupedBySyllables: Record<number, string[]> = {};
    rhymes.forEach((rhyme: { word: string; syllables: string | null }) => {
      if (rhyme.syllables) {
        const syllableCount = rhyme.syllables.split('-').length;
        if (!groupedBySyllables[syllableCount]) {
          groupedBySyllables[syllableCount] = [];
        }
        groupedBySyllables[syllableCount].push(rhyme.word);
      }
    });

    return NextResponse.json({
      word,
      type,
      rhymes: rhymes.map((r: { word: string }) => r.word),
      grouped: groupedBySyllables,
      count: rhymes.length,
    });
  } catch (error) {
    console.error('Rhyme API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch rhymes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
