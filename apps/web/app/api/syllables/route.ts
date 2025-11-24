import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Syllable Counter API - Uses multiple methods for accuracy
 * 1. Datamuse API (primary - has syllable data)
 * 2. Fallback algorithm for offline use
 */

// Simple syllable counting algorithm (fallback)
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;

  // Remove silent 'e' at the end
  word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  // Count vowel groups
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
    }

    // Split into lines
    const lines = text.split('\n').filter((line) => line.trim());

    // Process each line
    const results = await Promise.all(
      lines.map(async (line) => {
        const words = line.trim().split(/\s+/);
        let totalSyllables = 0;
        const wordDetails: Array<{ word: string; syllables: number }> = [];

        for (const word of words) {
          const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
          if (!cleanWord) continue;

          try {
            // Try Datamuse API first for accurate syllable count
            const response = await fetch(
              `https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}&md=s&max=1`,
              {
                headers: {
                  'User-Agent': 'CronkWaters-Songwriting-Tool',
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data[0]?.numSyllables) {
                const syllables = data[0].numSyllables;
                totalSyllables += syllables;
                wordDetails.push({ word: cleanWord, syllables });
                continue;
              }
            }
          } catch (error) {
            // Fallback to algorithm if API fails
            console.log('Datamuse API unavailable, using fallback for:', cleanWord);
          }

          // Fallback: Use algorithm
          const syllables = countSyllables(cleanWord);
          totalSyllables += syllables;
          wordDetails.push({ word: cleanWord, syllables });
        }

        return {
          line: line.trim(),
          syllables: totalSyllables,
          words: wordDetails,
          wordCount: wordDetails.length,
        };
      })
    );

    // Detect meter inconsistencies
    const syllableCounts = results.map((r) => r.syllables).filter((s) => s > 0);
    const avgSyllables = syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length;
    const hasInconsistency = syllableCounts.some(
      (count) => Math.abs(count - avgSyllables) > 2
    );

    return NextResponse.json({
      lines: results,
      totalLines: results.length,
      averageSyllables: Math.round(avgSyllables * 10) / 10,
      hasInconsistency,
      meterWarning: hasInconsistency
        ? 'Some lines have inconsistent syllable counts - this may affect the flow'
        : null,
    });
  } catch (error) {
    console.error('Syllable counter error:', error);
    return NextResponse.json(
      {
        error: 'Failed to count syllables',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

