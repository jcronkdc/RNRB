/**
 * AI-Enhanced Key Detection
 * Combines deterministic music theory with LLM analysis for 10x better results
 */

import { detectKey, type KeySuggestion } from './key-detector';

export interface AIKeyAnalysis {
  primaryKey: string;
  confidence: number;
  mode: string;
  reasons: string[];

  // Advanced analysis
  modalAnalysis?: {
    mode: 'Ionian' | 'Dorian' | 'Phrygian' | 'Lydian' | 'Mixolydian' | 'Aeolian' | 'Locrian';
    confidence: number;
  };

  secondaryDominants?: string[];
  borrowedChords?: string[];
  modulations?: {
    fromKey: string;
    toKey: string;
    atChord: number;
  }[];

  progressionType?: string; // "I-IV-V-vi pop progression", "ii-V-I jazz", etc.
  suggestedNextChords?: string[];

  // Chord substitutions for each chord in the progression
  chordAlternatives?: {
    originalChord: string;
    alternatives: {
      chord: string;
      reason: string; // Why this works
      vibe: 'similar' | 'jazzier' | 'mellower' | 'brighter' | 'darker';
    }[];
  }[];

  // AI insights
  aiInsights: string[];
  musicalCharacter?: string; // "Melancholic", "Uplifting", "Jazzy", etc.
}

const AI_ANALYSIS_PROMPT = (
  chords: string[]
) => `You are an expert music theorist and composer. Analyze this chord progression with deep musical knowledge:

Chords: ${chords.join(' → ')}

Provide a comprehensive analysis including:

1. **Primary Key**: What key is this in? Be specific (e.g., "C Major", "A Minor", "D Dorian")
2. **Mode**: Is it a standard major/minor, or a mode (Dorian, Mixolydian, Lydian, etc.)?
3. **Confidence**: 0-100% how certain are you?
4. **Secondary Dominants**: Any V/V, V/IV, or other tonicizations?
5. **Borrowed Chords**: Any chords borrowed from parallel keys?
6. **Modulations**: Does the progression change keys? Where?
7. **Progression Type**: Common pattern? (I-IV-V, ii-V-I, 12-bar blues, etc.)
8. **Musical Character**: How does this progression feel? (uplifting, melancholic, jazzy, etc.)
9. **Next Chord Suggestions**: What 3-5 chords would work well next?
10. **Chord Alternatives**: For EACH chord in the progression, suggest 2-3 alternative chords that could replace it. Include:
    - The alternative chord
    - Why it works (music theory reason)
    - The vibe it creates ("similar", "jazzier", "mellower", "brighter", "darker")
11. **Key Musical Insights**: Interesting theory observations about this progression

Format your response as JSON:
{
  "primaryKey": "C Major",
  "mode": "Ionian",
  "confidence": 95,
  "reasons": ["All chords are diatonic", "Contains I-IV-V progression"],
  "modalAnalysis": { "mode": "Ionian", "confidence": 90 },
  "secondaryDominants": ["D7 (V/V)"],
  "borrowedChords": ["Bb (bVII from parallel minor)"],
  "modulations": [{ "fromKey": "C Major", "toKey": "G Major", "atChord": 4 }],
  "progressionType": "I-IV-V-vi pop progression",
  "suggestedNextChords": ["F", "Am", "G", "Em", "Dm"],
  "chordAlternatives": [
    {
      "originalChord": "C",
      "alternatives": [
        { "chord": "Cmaj7", "reason": "Adds sophistication with major 7th", "vibe": "jazzier" },
        { "chord": "Cadd9", "reason": "Adds shimmer with 9th", "vibe": "brighter" },
        { "chord": "Em", "reason": "Relative minor substitution", "vibe": "mellower" }
      ]
    },
    {
      "originalChord": "Am",
      "alternatives": [
        { "chord": "Am7", "reason": "Softens with 7th", "vibe": "jazzier" },
        { "chord": "C", "reason": "Relative major substitution", "vibe": "brighter" },
        { "chord": "Fmaj7", "reason": "Substitute with IV", "vibe": "similar" }
      ]
    }
  ],
  "aiInsights": [
    "Classic pop progression popularized in the 2000s",
    "The vi chord adds emotional depth",
    "Consider adding a sus4 on the V for more tension"
  ],
  "musicalCharacter": "Uplifting and optimistic, with a hint of melancholy from the vi chord"
}`;

/**
 * Call AI API for deep music theory analysis
 */
async function callAIAnalysis(chords: string[]): Promise<AIKeyAnalysis | null> {
  try {
    // Use OpenRouter or direct API
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('No AI API key configured for key detection');
      return null;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer':
          typeof window !== 'undefined' ? window.location.origin : 'https://cronkwaters.com',
        'X-Title': "Rock N' Roll Basement - AI Key Detection",
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // Best for reasoning
        messages: [
          {
            role: 'user',
            content: AI_ANALYSIS_PROMPT(chords),
          },
        ],
        temperature: 0.3, // Low temperature for consistent analysis
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch =
      content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || content.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const analysis = JSON.parse(jsonMatch[1]);

    return analysis as AIKeyAnalysis;
  } catch (error) {
    console.error('AI key detection failed:', error);
    return null;
  }
}

/**
 * Enhanced key detection with AI fallback
 */
export async function detectKeyWithAI(chords: string[]): Promise<{
  deterministic: KeySuggestion[];
  ai: AIKeyAnalysis | null;
  combined: KeySuggestion[];
}> {
  // Always run deterministic analysis (fast)
  const deterministicResults = detectKey(chords);

  // Run AI analysis in parallel (if API key available)
  let aiAnalysis: AIKeyAnalysis | null = null;

  // Only use AI for 3+ chords (better context)
  if (chords.length >= 3) {
    aiAnalysis = await callAIAnalysis(chords);
  }

  // Combine results: AI takes priority if confidence is high
  let combinedResults = [...deterministicResults];

  if (aiAnalysis && aiAnalysis.confidence >= 70) {
    // Insert AI result as top suggestion
    const aiSuggestion: KeySuggestion = {
      key: aiAnalysis.primaryKey,
      confidence: aiAnalysis.confidence,
      reasons: [...aiAnalysis.reasons, ...(aiAnalysis.aiInsights?.slice(0, 2) || [])],
      mode: aiAnalysis.primaryKey.toLowerCase().includes('minor') ? 'minor' : 'major',
    };

    // Remove duplicate if exists
    combinedResults = combinedResults.filter(
      (r) => r.key.toLowerCase() !== aiAnalysis!.primaryKey.toLowerCase()
    );

    // Add AI result at top
    combinedResults.unshift(aiSuggestion);
  }

  return {
    deterministic: deterministicResults,
    ai: aiAnalysis,
    combined: combinedResults.slice(0, 5), // Top 5
  };
}

/**
 * Simple wrapper for just getting the best key (with AI)
 */
export async function getMainKeyWithAI(chords: string[]): Promise<string | null> {
  const result = await detectKeyWithAI(chords);
  return result.combined.length > 0 ? result.combined[0].key : null;
}
