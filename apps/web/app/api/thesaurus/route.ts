import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security';

/**
 * Thesaurus API - Uses Datamuse API for synonyms and related words
 * Datamuse provides multiple types of word relationships:
 * - Synonyms (means like)
 * - Antonyms (opposite of)
 * - Triggers (words that often follow)
 * - Adjectives that modify
 * - Nouns modified by
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
      await checkRateLimit(standardLimiter, `thesaurus:${session.user.id}`);
    } catch {
      logSecurityEvent('rate_limit', {
        action: 'thesaurus-lookup',
        userId: session.user.id,
      });
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const type = searchParams.get('type') || 'synonyms'; // synonyms, triggers, adjectives, nouns

    if (!word) {
      return NextResponse.json({ error: 'Word parameter required' }, { status: 400 });
    }

    // Build Datamuse API endpoints based on type
    const apiCalls: Promise<Response>[] = [];

    // Build API calls with timeout protection (5s)
    const fetchOptions = {
      headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
    };

    switch (type) {
      case 'synonyms':
        // ml = means like (synonyms)
        apiCalls.push(
          fetchWithTimeout(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=30&md=d`,
            fetchOptions,
            TIMEOUTS.FAST_API
          )
        );
        break;
      case 'triggers':
        // rel_trg = "trigger words" (words that often follow)
        apiCalls.push(
          fetchWithTimeout(
            `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(word)}&max=20`,
            fetchOptions,
            TIMEOUTS.FAST_API
          )
        );
        break;
      case 'adjectives':
        // rel_jjb = adjectives that modify this word
        apiCalls.push(
          fetchWithTimeout(
            `https://api.datamuse.com/words?rel_jjb=${encodeURIComponent(word)}&max=20`,
            fetchOptions,
            TIMEOUTS.FAST_API
          )
        );
        break;
      case 'nouns':
        // rel_jja = nouns modified by this adjective
        apiCalls.push(
          fetchWithTimeout(
            `https://api.datamuse.com/words?rel_jja=${encodeURIComponent(word)}&max=20`,
            fetchOptions,
            TIMEOUTS.FAST_API
          )
        );
        break;
      case 'all':
        // Fetch all types in parallel
        apiCalls.push(
          fetchWithTimeout(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=15&md=d`,
            fetchOptions,
            TIMEOUTS.FAST_API
          ),
          fetchWithTimeout(
            `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(word)}&max=10`,
            fetchOptions,
            TIMEOUTS.FAST_API
          )
        );
        break;
      default:
        apiCalls.push(
          fetchWithTimeout(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=30&md=d`,
            fetchOptions,
            TIMEOUTS.FAST_API
          )
        );
    }

    // Fetch all API calls in parallel
    const responses = await Promise.all(apiCalls);
    const dataArrays = await Promise.all(responses.map((r) => r.json()));

    // Process results
    interface DatamuseWord {
      word: string;
      score: number;
      defs?: string[];
      tags?: string[];
    }

    const result: {
      word: string;
      type: string;
      synonyms?: Array<{ word: string; definition?: string }>;
      triggers?: string[];
      adjectives?: string[];
      nouns?: string[];
      count: number;
    } = {
      word,
      type,
      count: 0,
    };

    if (type === 'synonyms' || type === 'all') {
      const synonymData = dataArrays[0] as DatamuseWord[];
      result.synonyms = synonymData.map((item) => ({
        word: item.word,
        definition: item.defs?.[0]?.replace(/^\w+\t/, ''), // Remove part of speech prefix
      }));
      result.count += result.synonyms.length;
    }

    if (type === 'triggers') {
      const triggerData = dataArrays[0] as DatamuseWord[];
      result.triggers = triggerData.map((item) => item.word);
      result.count += result.triggers.length;
    }

    if (type === 'adjectives') {
      const adjData = dataArrays[0] as DatamuseWord[];
      result.adjectives = adjData.map((item) => item.word);
      result.count += result.adjectives.length;
    }

    if (type === 'nouns') {
      const nounData = dataArrays[0] as DatamuseWord[];
      result.nouns = nounData.map((item) => item.word);
      result.count += result.nouns.length;
    }

    if (type === 'all') {
      const triggerData = dataArrays[1] as DatamuseWord[];
      result.triggers = triggerData.map((item) => item.word);
      result.count += result.triggers.length;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Thesaurus API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch synonyms',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
