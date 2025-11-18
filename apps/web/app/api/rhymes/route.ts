import { NextRequest, NextResponse } from 'next/server';

/**
 * Rhyme Dictionary API
 * Uses Datamuse API (free, comprehensive)
 * Returns rhyming words with syllable counts
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');
  const syllables = searchParams.get('syllables');

  if (!word) {
    return NextResponse.json({ error: 'Word parameter required' }, { status: 400 });
  }

  try {
    // Datamuse API - free rhyme dictionary
    let url = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=100&md=s`;
    
    // Add syllable filter if specified
    if (syllables) {
      url += `&syllables=${syllables}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Datamuse API error');
    }

    const data = await response.json();

    // Process results
    const rhymes = data.map((item: any) => ({
      word: item.word,
      score: item.score,
      syllables: item.numSyllables || null,
    }));

    // Sort by score (more common first)
    rhymes.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    return NextResponse.json({
      originalWord: word,
      rhymes,
      total: rhymes.length,
    });

  } catch (error: any) {
    console.error('Rhyme API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rhymes' },
      { status: 500 }
    );
  }
}
