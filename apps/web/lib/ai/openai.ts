/**
 * OpenAI Integration for Rock N' Roll Basement
 *
 * ETHICAL AI PRINCIPLES:
 * 1. AI assists creativity, NEVER replaces it
 * 2. All AI suggestions clearly labeled
 * 3. User always has final decision
 * 4. No fake content generation
 * 5. Transparent about AI usage
 */

import OpenAI from 'openai';

import { AI_MODELS, AI_TEMPERATURES, AI_MAX_TOKENS } from './config';

// Initialize OpenAI client (runtime only)
export function getOpenAIClient() {
  if (typeof window !== 'undefined') return null; // Client-side not allowed

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured');
    return null;
  }

  return new OpenAI({
    apiKey: apiKey,
  });
}

/**
 * AI Collaboration Assistant
 * Helps with music theory, chord suggestions, lyric ideas
 */
export async function getChatAssistance(
  userMessage: string,
  context: {
    projectName?: string;
    currentKey?: string;
    currentTempo?: number;
    genre?: string;
  }
) {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are a helpful music collaboration assistant for Rock N' Roll Basement.

ETHICAL GUIDELINES:
- You ASSIST musicians, you don't replace them
- Suggest chord progressions, song structures, lyric improvements
- Provide music theory help and creative ideas
- NEVER write complete songs - only suggest improvements
- Always acknowledge that the musician's creativity is paramount
- Be encouraging and supportive

PROJECT CONTEXT:
${context.projectName ? `- Project: ${context.projectName}` : ''}
${context.currentKey ? `- Key: ${context.currentKey}` : ''}
${context.currentTempo ? `- Tempo: ${context.currentTempo} BPM` : ''}
${context.genre ? `- Genre: ${context.genre}` : ''}

Keep responses concise (2-3 sentences max). Focus on actionable suggestions.`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODELS.FAST,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: AI_MAX_TOKENS.SHORT,
      temperature: AI_TEMPERATURES.CREATIVE,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

/**
 * AI Session Transcription
 * Transcribes video sessions and extracts action items
 */
export async function transcribeSession(audioUrl: string) {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    // Use Whisper API for transcription
    const response = await client.audio.transcriptions.create({
      file: (await fetch(audioUrl).then((r) => r.blob())) as any,
      model: AI_MODELS.TRANSCRIPTION,
      language: 'en',
    });

    return response.text;
  } catch (error) {
    console.error('Whisper API error:', error);
    return null;
  }
}

/**
 * Extract action items and decisions from transcription
 */
export async function extractActionItems(transcription: string) {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `Extract action items and decisions from this music session transcription.

Format as:
DECISIONS:
- [Timestamp] Decision text

ACTION ITEMS:
- [Timestamp] TODO: Action text

Be concise. Only extract clear decisions and actionable items.`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODELS.FAST,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcription },
      ],
      max_tokens: AI_MAX_TOKENS.LONG,
      temperature: AI_TEMPERATURES.PRECISE,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

/**
 * AI Tour Router - Tokyo Subway Ant Model
 * Optimizes tour routing for shortest travel distances
 */
export async function optimizeTourRoute(
  venues: Array<{
    name: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  }>
) {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are a tour routing optimizer using the Tokyo subway ant colony optimization model.

Given a list of venues, suggest the optimal order to minimize travel distance and time.

Consider:
- Geographic proximity
- Realistic travel times
- Logical routing (no backtracking)
- Rest days needed for long drives

Output format:
1. [City, State] - Venue Name
   (Travel: X miles, X hours from previous)
2. [Next city]...

Include total miles and recommended rest days.`;

  try {
    // Note: Tour routing requires complex geographic + business reasoning
    // Using GPT-4o for this task as it excels at spatial reasoning
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(venues, null, 2) },
      ],
      max_tokens: AI_MAX_TOKENS.VERY_LONG,
      temperature: AI_TEMPERATURES.PRECISE,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

/**
 * AI Mix Assistant
 * Analyzes audio and suggests improvements (NOT auto-mixing)
 */
export async function getMixSuggestions(audioAnalysis: {
  peakLevel: number;
  rmsLevel: number;
  dynamicRange: number;
  genre: string;
}) {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are a mixing assistant that provides SUGGESTIONS, not automation.

Analyze the audio metrics and suggest improvements based on industry standards for the genre.

ETHICAL RULES:
- Provide specific, actionable suggestions
- Reference industry standards
- Explain WHY each suggestion helps
- NEVER claim to do the mixing for them
- Encourage learning and understanding

Keep suggestions practical and educational.`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODELS.FAST,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(audioAnalysis, null, 2) },
      ],
      max_tokens: AI_MAX_TOKENS.MEDIUM,
      temperature: AI_TEMPERATURES.BALANCED,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

/**
 * AI Contribution Tracker
 * Suggests fair royalty splits based on logged contributions
 */
export async function suggestRoyaltySplit(
  contributions: Array<{
    collaborator: string;
    writingSessions: number;
    lyricsPercentage: number;
    melodyContribution: boolean;
    arrangementWork: boolean;
  }>
) {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are a fair royalty split advisor.

Analyze contribution data and suggest equitable splits based on industry standards.

IMPORTANT:
- This is a SUGGESTION only - humans decide final splits
- Explain your reasoning
- Consider: lyrics, melody, arrangement, production
- Reference standard industry practices
- Acknowledge gray areas where negotiation needed

Be fair and transparent.`;

  try {
    // Note: Royalty splits require careful fairness reasoning
    // Using GPT-4o for nuanced analysis of contribution data
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(contributions, null, 2) },
      ],
      max_tokens: AI_MAX_TOKENS.MEDIUM + 100, // 400 tokens
      temperature: AI_TEMPERATURES.PRECISE,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

/**
 * AI Content Generator
 * Helps write social media, emails, press releases
 */
export async function generateContent(
  type: 'social' | 'email' | 'press',
  context: {
    songTitle?: string;
    projectName?: string;
    releaseDate?: string;
    genre?: string;
    tourDates?: string;
  }
) {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are a music marketing content assistant.

Generate ${type} content based on the provided context.

ETHICAL RULES:
- Generate multiple options (3-5 variants)
- Clearly label as "AI-Generated Draft"
- Human MUST edit before publishing
- Don't make false claims about the music
- Professional, authentic tone
- Encourage personalization

Keep it authentic and aligned with artist's voice.`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODELS.FAST,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${type} content:\n${JSON.stringify(context, null, 2)}` },
      ],
      max_tokens: AI_MAX_TOKENS.LONG,
      temperature: AI_TEMPERATURES.VERY_CREATIVE,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}
