import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { buildAssistantContext, formatContextForAI } from '@/lib/ai/assistant-context';
import { AI_MAX_TOKENS } from '@/lib/ai/config';
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

    // Build context
    const context = await buildAssistantContext(user.id, referer);
    const systemPrompt = formatContextForAI(context);

    let responseText: string;
    let inputTokens: number;
    let outputTokens: number;
    let cost: number;
    let modelUsed: string;

    if (provider === 'openai') {
      // Use OpenAI GPT-4o
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

      // Call OpenAI API - using GPT-4o for best reasoning
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: AI_MAX_TOKENS.CONVERSATION,
        temperature: 0.7,
      });

      responseText = response.choices[0]?.message?.content || '';
      inputTokens = response.usage?.prompt_tokens || 0;
      outputTokens = response.usage?.completion_tokens || 0;

      // GPT-4o pricing: $5/1M input, $15/1M output
      cost = (inputTokens / 1000000) * 5.0 + (outputTokens / 1000000) * 15.0;
      modelUsed = 'gpt-4o';
    } else {
      // Use Claude
      const anthropic = getAnthropicClient()!;

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
        max_tokens: AI_MAX_TOKENS.CONVERSATION,
        system: systemPrompt,
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
            { role: 'assistant', content: responseText, timestamp: new Date().toISOString() },
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
            { role: 'assistant', content: responseText, timestamp: new Date().toISOString() },
          ],
          messageCount: 2,
          tokensUsed: inputTokens + outputTokens,
          cost,
          context: {
            usage: context.userContext.usage,
            page: context.currentPage,
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

  if (lowerMessage.match(/how do i (get to|find|access)|where is|navigate/i)) {
    return 'navigation';
  }

  if (lowerMessage.match(/how does|what is|explain|tell me about/i)) {
    return 'feature-help';
  }

  if (lowerMessage.match(/not working|broken|error|issue|problem|can't|won't/i)) {
    return 'troubleshooting';
  }

  if (lowerMessage.match(/suggest|idea|help me write|recommend|chord|lyric/i)) {
    return 'creative';
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
      ? `AI Assistant running with ${provider.toUpperCase()}`
      : 'No AI provider configured',
    provider,
    model,
  });
}
