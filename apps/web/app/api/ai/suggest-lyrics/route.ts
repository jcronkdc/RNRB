import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Lyric Suggestions API Route
 * Uses OpenAI API to suggest alternative lyrics
 * Follows mycelial principle: Focused, clean, single purpose
 */

export async function POST(request: NextRequest) {
  try {
    const { line, context, style } = await request.json();

    // Validate input
    if (!line || typeof line !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: line is required' },
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

    // Call OpenAI API
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
            content: `You are a creative songwriting assistant. Suggest alternative versions of lyrics that maintain the original meaning but offer different word choices, rhyme schemes, or poetic expressions. Keep suggestions concise and focused. ${style ? `Style: ${style}` : ''}`
          },
          {
            role: 'user',
            content: `Original line: "${line}"\n${context ? `Context: ${context}` : ''}\n\nSuggest 3 alternative versions of this line.`
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content || '';

    // Parse the suggestions (GPT-4 will return numbered list)
    const suggestions = suggestion
      .split('\n')
      .filter(s => s.trim().length > 0)
      .map(s => s.replace(/^\d+\.\s*/, '').trim())
      .filter(s => s.length > 0);

    return NextResponse.json({
      originalLine: line,
      suggestions: suggestions.slice(0, 3), // Return max 3 suggestions
    });

  } catch (error: any) {
    console.error('AI suggestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

