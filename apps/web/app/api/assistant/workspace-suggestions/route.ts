import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

import { auth } from '@/auth';

// Available tools that can be suggested
const AVAILABLE_TOOLS = [
  {
    key: 'songwriting',
    label: 'Songwriting',
    description: 'Write lyrics, melodies, and arrangements',
  },
  { key: 'songs', label: 'My Songs', description: 'Your song library and projects' },
  { key: 'studio', label: 'Studio', description: 'Record, mix, and produce' },
  { key: 'library', label: 'Library', description: 'Stems, samples, and files' },
  { key: 'discover', label: 'Discover', description: 'Find and connect with musicians' },
  { key: 'collaboration', label: 'Collaborate', description: 'Work with other artists' },
  { key: 'messages', label: 'Messages', description: 'Chat with collaborators' },
  { key: 'feed', label: 'Feed', description: 'Social updates and posts' },
  { key: 'meet', label: 'Meet', description: 'Video calls with your team' },
  { key: 'shows', label: 'Shows', description: 'Manage your gig calendar' },
  { key: 'tours', label: 'Tours', description: 'Plan and manage tours' },
  { key: 'setlists', label: 'Setlists', description: 'Build and manage setlists' },
  { key: 'live', label: 'Go Live', description: 'Stream to your fans' },
  { key: 'opportunities', label: 'Opportunities', description: 'Find gigs and placements' },
  { key: 'sites', label: 'My Site', description: 'Your artist website' },
  { key: 'merch', label: 'Merch', description: 'Sell your merchandise' },
  { key: 'marketplace', label: 'Gear Market', description: 'Buy and sell equipment' },
  { key: 'revenue', label: 'Revenue', description: 'Track your earnings' },
  { key: 'mail', label: 'Email', description: 'Professional @rnrb.me email' },
  { key: 'tools', label: 'Toolbox', description: "Musician's utilities" },
  { key: 'masterclasses', label: 'Classes', description: 'Learn from the best' },
  { key: 'labs', label: 'Labs', description: 'Experimental features' },
  { key: 'settings', label: 'Settings', description: 'Account preferences' },
];

/**
 * POST /api/assistant/workspace-suggestions
 * Get AI-powered suggestions for tools to add to a workspace
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceName, existingTools } = await request.json();

    if (!workspaceName) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    // Filter out already added tools
    const availableToolKeys = AVAILABLE_TOOLS.filter((t) => !existingTools?.includes(t.key))
      .map((t) => `${t.key}: ${t.label} - ${t.description}`)
      .join('\n');

    // Use Claude to suggest relevant tools
    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `A musician is creating a workspace called "${workspaceName}" in their music career app.

Available tools to add:
${availableToolKeys}

Based on the workspace name, suggest 3-5 tools that would be most useful. Only return the tool keys as a JSON array, nothing else.

Example response: ["songwriting", "library", "tools"]`,
        },
      ],
    });

    // Parse the response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    try {
      const suggestions = JSON.parse(content.text);
      if (Array.isArray(suggestions)) {
        // Validate that all suggestions are valid tool keys
        const validKeys = new Set(AVAILABLE_TOOLS.map((t) => t.key));
        const validSuggestions = suggestions.filter(
          (s) => validKeys.has(s) && !existingTools?.includes(s)
        );
        return NextResponse.json({ suggestions: validSuggestions });
      }
    } catch {
      // If parsing fails, try to extract keys from the text
      const keys = AVAILABLE_TOOLS.filter(
        (t) => content.text.includes(t.key) && !existingTools?.includes(t.key)
      )
        .map((t) => t.key)
        .slice(0, 5);
      return NextResponse.json({ suggestions: keys });
    }

    return NextResponse.json({ suggestions: [] });
  } catch (error) {
    console.error('[WORKSPACE SUGGESTIONS] ERROR:', error);

    // Fallback to basic keyword matching if AI fails
    return NextResponse.json({
      suggestions: [],
      error: 'AI suggestions unavailable, using basic matching',
    });
  }
}
