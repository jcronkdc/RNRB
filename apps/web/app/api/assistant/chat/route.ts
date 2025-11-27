import { type NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

import { buildAssistantContext, formatContextForAI } from '@/lib/ai/assistant-context';
import { AI_MODELS, AI_MAX_TOKENS } from '@/lib/ai/config';
import { handleApiError, AppError } from '@/lib/errors';
import { env, features } from '@/lib/env';
import { requireAuth } from '@/lib/session';
import { assistantChatSchema, parseBody } from '@/lib/validations';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { prisma } from '@cronkwaters/db';

// Initialize Claude client (only if API key is available)
const getAnthropicClient = () => {
  if (!features.ai) {
    throw new AppError(
      'AI features are not available',
      'SERVICE_UNAVAILABLE',
      503,
      'ANTHROPIC_API_KEY not configured'
    );
  }
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });
};

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

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
      const err = error as { code?: string; message?: string; tier?: string; used?: number; limit?: number; resetDate?: string };
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

    // Get Anthropic client
    const anthropic = getAnthropicClient();

    // Get current page from referer
    const referer = request.headers.get('referer') || '';

    // Build context
    const context = await buildAssistantContext(user.id, referer);
    const systemPrompt = formatContextForAI(context);

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

    // Call Claude API - using best reasoning model for assistant
    const response = await anthropic.messages.create({
      model: AI_MODELS.REASONING,
      max_tokens: AI_MAX_TOKENS.CONVERSATION,
      system: systemPrompt,
      messages: messages,
    });

    // Extract response text
    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');

    if (!responseText) {
      throw new AppError('AI service unavailable', 'SERVICE_UNAVAILABLE', 503);
    }

    // Calculate cost (Claude Sonnet pricing)
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost =
      (inputTokens / 1000000) * 3.0 + // $3 per 1M input tokens
      (outputTokens / 1000000) * 15.0; // $15 per 1M output tokens

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
  return NextResponse.json({
    status: features.ai ? 'ok' : 'disabled',
    message: features.ai ? 'AI Assistant endpoint is running' : 'AI features not configured',
    model: AI_MODELS.REASONING,
  });
}
