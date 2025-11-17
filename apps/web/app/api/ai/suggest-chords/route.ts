import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Chord Progression Suggestions
 * Uses OpenAI to suggest chords for verse, chorus, bridge
 * Based on song key and section type
 */

export async function POST(request: NextRequest) {
  try {
    const { key, sectionType, lyrics } = await request.json();

    // Validate input
    if (!key || !sectionType) {
      return NextResponse.json(
        { error: 'Key and section type are required' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Common chord progressions by section type
    const commonProgressions = {
      verse: [
        ['I', 'V', 'vi', 'IV'], // Very common
        ['I', 'vi', 'IV', 'V'],
        ['vi', 'IV', 'I', 'V'],
      ],
      chorus: [
        ['I', 'V', 'vi', 'IV'], // Same as verse but often stronger
        ['IV', 'V', 'I'],
        ['I', 'IV', 'V'],
      ],
      bridge: [
        ['vi', 'IV', 'I', 'V'], // Different from verse/chorus
        ['IV', 'V', 'vi'],
        ['ii', 'V', 'I'],
      ],
    };

    // Convert Roman numerals to actual chords based on key
    const keyChordMap: { [key: string]: string[] } = {
      'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
      'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
      'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
      'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
      'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
      'Am': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
      'Em': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
      'Dm': ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'],
    };

    const chords = keyChordMap[key] || keyChordMap['C'];
    const romanToIndex: { [key: string]: number } = {
      'I': 0, 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5, 'vii': 6
    };

    const progressions = commonProgressions[sectionType as keyof typeof commonProgressions];
    const randomProgression = progressions[Math.floor(Math.random() * progressions.length)];
    
    const suggestedChords = randomProgression.map(roman => {
      const index = romanToIndex[roman];
      return chords[index] || 'C';
    });

    // Call OpenAI for more creative suggestions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a music theory expert. Suggest chord progressions for songwriting. 
                     Focus on common, pleasing progressions. Keep it simple and musical.`
          },
          {
            role: 'user',
            content: `Song key: ${key}\nSection: ${sectionType}\n${lyrics ? `Lyrics: ${lyrics}\n` : ''}
                     Suggest a 4-chord progression. Return ONLY the chords separated by spaces (e.g. "C Am F G").`
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      // Fallback to common progressions if AI fails
      return NextResponse.json({
        suggestions: suggestedChords,
        source: 'common-progressions'
      });
    }

    const data = await response.json();
    const aiSuggestion = data.choices[0]?.message?.content?.trim() || '';
    const aiChords = aiSuggestion.split(/\s+/).filter(c => c.length > 0);

    return NextResponse.json({
      suggestions: aiChords.length >= 3 ? aiChords : suggestedChords,
      source: aiChords.length >= 3 ? 'ai' : 'common-progressions',
      key,
      sectionType,
    });

  } catch (error: any) {
    console.error('Chord suggestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate chord suggestions' },
      { status: 500 }
    );
  }
}
