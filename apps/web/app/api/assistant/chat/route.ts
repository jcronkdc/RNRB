import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { executeAction, AI_FUNCTIONS, type ActionName } from '@/lib/ai/assistant-actions';
import { buildGodlikeContext, formatGodlikeContext } from '@/lib/ai/godlike-context';
import { handleApiError, AppError } from '@/lib/errors';
import { aiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { assistantChatSchema, parseBody } from '@/lib/validations';

// AI Provider detection - prefer OpenAI (more common), fallback to Claude
type AIProvider = 'openai' | 'anthropic' | null;

function detectAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

// Get OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// Get Anthropic client
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Rate limit by user ID (20 requests per minute)
    await checkRateLimit(aiLimiter, user.id);

    // Check subscription access
    try {
      await requireFeatureAccess('aiAssistant');
    } catch (error: unknown) {
      const err = error as { message?: string; tier?: string };
      throw new AppError(
        err.message || 'Upgrade to access AI Assistant',
        'SUBSCRIPTION_REQUIRED',
        403,
        undefined,
        { requiresUpgrade: true, currentTier: err.tier || 'free' }
      );
    }

    // Check usage quota
    try {
      await requireUsageQuota('assistantConversations', 1);
    } catch (error: unknown) {
      const err = error as {
        code?: string;
        message?: string;
        tier?: string;
        used?: number;
        limit?: number;
        resetDate?: string;
      };
      if (err.code === 'QUOTA_EXCEEDED') {
        throw AppError.quotaExceeded(
          'AI conversations',
          err.used || 0,
          err.limit || 0,
          err.tier || 'free'
        );
      }
      throw error;
    }

    // Validate input
    const validated = await parseBody(request, assistantChatSchema);

    // Detect which AI provider to use
    const provider = detectAIProvider();
    if (!provider) {
      throw new AppError(
        'AI features are not available',
        'SERVICE_UNAVAILABLE',
        503,
        'Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY configured'
      );
    }

    // Get current page from referer
    const referer = request.headers.get('referer') || '';

    // Build GODLIKE context - loads ALL user data
    const context = await buildGodlikeContext(user.id, referer);
    const systemPrompt = formatGodlikeContext(context);

    let responseText: string;
    let inputTokens: number;
    let outputTokens: number;
    let cost: number;
    let modelUsed: string;
    let actionsExecuted: Array<{ action: string; result: any }> = [];

    if (provider === 'openai') {
      // Use OpenAI GPT-4o with function calling
      const openai = getOpenAIClient()!;

      // Build messages array
      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add conversation history if exists
      if (validated.conversationHistory) {
        validated.conversationHistory.forEach((msg) => {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: validated.message,
      });

      // Convert AI_FUNCTIONS to OpenAI format
      const tools: OpenAI.ChatCompletionTool[] = AI_FUNCTIONS.map((fn) => ({
        type: 'function' as const,
        function: {
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters,
        },
      }));

      // Call OpenAI API with function calling
      let response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
        tools,
        tool_choice: 'auto',
      });

      // Handle function calls (may need multiple iterations)
      let iterations = 0;
      const maxIterations = 5; // Prevent infinite loops

      while (response.choices[0]?.message?.tool_calls && iterations < maxIterations) {
        iterations++;
        const toolCalls = response.choices[0].message.tool_calls;

        // Add assistant's response with tool calls to messages
        messages.push(response.choices[0].message);

        // Execute each function call
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name as ActionName;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log(`[AI Assistant] Executing action: ${functionName}`, functionArgs);

          // Execute the action (scoped to user.id for security)
          const result = await executeAction(user.id, functionName, functionArgs);
          actionsExecuted.push({ action: functionName, result });

          // Add function result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        // Get next response from AI
        response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
          max_tokens: 2000,
          temperature: 0.7,
          tools,
          tool_choice: 'auto',
        });
      }

      responseText = response.choices[0]?.message?.content || '';
      inputTokens = response.usage?.prompt_tokens || 0;
      outputTokens = response.usage?.completion_tokens || 0;

      // GPT-4o pricing: $5/1M input, $15/1M output
      cost = (inputTokens / 1000000) * 5.0 + (outputTokens / 1000000) * 15.0;
      modelUsed = 'gpt-4o';
    } else {
      // Use Claude (without function calling for now - Claude handles it differently)
      const anthropic = getAnthropicClient()!;

      // Add action instructions to system prompt for Claude
      const claudeSystemPrompt =
        systemPrompt +
        `\n\n## AVAILABLE ACTIONS
You can help the user by suggesting actions. When you want to perform an action, clearly state what you're doing and what the result is.

Available actions you can discuss:
- Create projects, songs, tours, shows
- Update song lyrics, chords, key, tempo
- Build setlists for shows
- Analyze their musical style
- Suggest chord progressions and rhymes

When the user asks you to do something, explain what you would do and guide them through the process.`;

      // Build conversation messages
      const messages: Anthropic.MessageParam[] = [];

      // Add conversation history if exists
      if (validated.conversationHistory) {
        validated.conversationHistory.forEach((msg) => {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: validated.message,
      });

      // Call Claude API
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: claudeSystemPrompt,
        messages: messages,
      });

      // Extract response text
      responseText = response.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      inputTokens = response.usage.input_tokens;
      outputTokens = response.usage.output_tokens;

      // Claude Sonnet pricing: $3/1M input, $15/1M output
      cost = (inputTokens / 1000000) * 3.0 + (outputTokens / 1000000) * 15.0;
      modelUsed = 'claude-3-5-sonnet';
    }

    if (!responseText) {
      throw new AppError('AI service unavailable', 'SERVICE_UNAVAILABLE', 503);
    }

    // Append action results to response if any actions were executed
    if (actionsExecuted.length > 0) {
      const actionSummary = actionsExecuted
        .map((a) => `✅ ${a.action}: ${a.result.message}`)
        .join('\n');
      responseText = responseText + '\n\n---\n**Actions Completed:**\n' + actionSummary;
    }

    // Save or update conversation
    let conversation;
    if (validated.conversationId) {
      // Update existing conversation
      conversation = await prisma.assistantConversation.update({
        where: { id: validated.conversationId },
        data: {
          messages: [
            ...(validated.conversationHistory || []),
            { role: 'user', content: validated.message, timestamp: new Date().toISOString() },
            {
              role: 'assistant',
              content: responseText,
              timestamp: new Date().toISOString(),
              actions: actionsExecuted,
            },
          ],
          messageCount: { increment: 2 },
          tokensUsed: { increment: inputTokens + outputTokens },
          cost: { increment: cost },
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new conversation
      const topic = detectTopic(validated.message, context.currentPage);

      conversation = await prisma.assistantConversation.create({
        data: {
          userId: user.id,
          topic,
          page: context.currentPage,
          messages: [
            { role: 'user', content: validated.message, timestamp: new Date().toISOString() },
            {
              role: 'assistant',
              content: responseText,
              timestamp: new Date().toISOString(),
              actions: actionsExecuted,
            },
          ],
          messageCount: 2,
          tokensUsed: inputTokens + outputTokens,
          cost,
          context: {
            usage: context.user.usage,
            page: context.currentPage,
            songsCount: context.songs.length,
            projectsCount: context.projects.length,
            toursCount: context.tours.length,
          },
        },
      });
    }

    // Track successful usage
    await trackUsage(user.id, 'assistantConversations', 1);

    return NextResponse.json({
      response: responseText,
      conversationId: conversation.id,
      model: modelUsed,
      actionsExecuted: actionsExecuted.length > 0 ? actionsExecuted : undefined,
      usage: {
        inputTokens,
        outputTokens,
        cost,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/assistant/chat', method: 'POST' });
  }
}

/**
 * Detect conversation topic from message and context
 */
function detectTopic(message: string, currentPage: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/create|make|start|new/i)) {
    return 'action-create';
  }

  if (lowerMessage.match(/how do i (get to|find|access)|where is|navigate/i)) {
    return 'navigation';
  }

  if (lowerMessage.match(/how does|what is|explain|tell me about/i)) {
    return 'feature-help';
  }

  if (lowerMessage.match(/not working|broken|error|issue|problem|can't|won't/i)) {
    return 'troubleshooting';
  }

  if (lowerMessage.match(/suggest|idea|help me write|recommend|chord|lyric|rhyme/i)) {
    return 'creative';
  }

  if (lowerMessage.match(/setlist|tour|show|gig/i)) {
    return 'tour-planning';
  }

  if (lowerMessage.match(/upgrade|subscription|quota|limit|storage/i)) {
    return 'support';
  }

  if (currentPage && currentPage !== 'unknown') {
    return `${currentPage}-help`;
  }

  return 'general';
}

/**
 * GET endpoint - for testing/healthcheck
 */
export async function GET() {
  const provider = detectAIProvider();
  const model =
    provider === 'openai' ? 'gpt-4o' : provider === 'anthropic' ? 'claude-3-5-sonnet' : 'none';

  return NextResponse.json({
    status: provider ? 'ok' : 'disabled',
    message: provider
      ? `🚀 GODLIKE AI Assistant LIVE with ${provider.toUpperCase()}`
      : 'No AI provider configured',
    provider,
    model,
    version: '2.0-MOONSHOT',
    dataAccess: {
      songs: 'ALL - titles, lyrics, chords, keys, tempos, collaborators',
      projects: 'ALL - with songs, milestones, team members',
      tours: 'ALL - with shows, venues, setlists',
      library: 'ALL - audio files, stems, demos',
      messages: 'Recent 20 conversations',
    },
    actions: {
      createProject: 'Create albums, EPs, singles',
      createSong: 'Start new songs with metadata',
      updateSong: 'Edit lyrics, chords, key, tempo',
      addSongToProject: 'Organize songs into projects',
      createTour: 'Plan tours with dates',
      createShow: 'Add shows with venues',
      buildSetlist: 'AI-optimized setlists by energy/key',
      analyzeStyle: 'Analyze musical patterns',
      getChordSuggestions: 'Rock, pop, folk, blues progressions',
      getRhymes: 'Songwriting word suggestions',
    },
    security: 'All actions scoped to authenticated user only',
  });
}
