import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const type = searchParams.get('type') || 'synonyms'; // synonyms, triggers, adjectives, nouns

    if (!word) {
      return NextResponse.json({ error: 'Word parameter required' }, { status: 400 });
    }

    // Build Datamuse API endpoints based on type
    const apiCalls: Promise<Response>[] = [];

    switch (type) {
      case 'synonyms':
        // ml = means like (synonyms)
        apiCalls.push(
          fetch(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=30&md=d`,
            {
              headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
            }
          )
        );
        break;
      case 'triggers':
        // rel_trg = "trigger words" (words that often follow)
        apiCalls.push(
          fetch(
            `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(word)}&max=20`,
            {
              headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
            }
          )
        );
        break;
      case 'adjectives':
        // rel_jjb = adjectives that modify this word
        apiCalls.push(
          fetch(
            `https://api.datamuse.com/words?rel_jjb=${encodeURIComponent(word)}&max=20`,
            {
              headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
            }
          )
        );
        break;
      case 'nouns':
        // rel_jja = nouns modified by this adjective
        apiCalls.push(
          fetch(
            `https://api.datamuse.com/words?rel_jja=${encodeURIComponent(word)}&max=20`,
            {
              headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
            }
          )
        );
        break;
      case 'all':
        // Fetch all types in parallel
        apiCalls.push(
          fetch(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=15&md=d`,
            {
              headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
            }
          ),
          fetch(
            `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(word)}&max=10`,
            {
              headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
            }
          )
        );
        break;
      default:
        apiCalls.push(
          fetch(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=30&md=d`,
            {
              headers: { 'User-Agent': 'CronkWaters-Songwriting-Tool' },
            }
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

