import { type NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

import { buildAssistantContext, formatContextForAI } from '@/lib/ai/assistant-context';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { getCurrentUser } from '@/lib/supabase';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { prisma } from '@cronkwaters/db';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Check subscription access
    try {
      await requireFeatureAccess('aiAssistant');
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || 'Upgrade to Studio plan or add AI Assistant add-on to access this feature',
          requiresUpgrade: true,
          currentTier: error.tier || 'free',
        },
        { status: 403 }
      );
    }

    // 🔒 RATE LIMITING: Check usage quota
    try {
      await requireUsageQuota('assistantConversations', 1);
    } catch (error: any) {
      if (error.code === 'QUOTA_EXCEEDED') {
        return NextResponse.json(
          {
            error: error.message,
            requiresUpgrade: true,
            tier: error.tier,
            used: error.used,
            limit: error.limit,
            resetDate: error.resetDate,
          },
          { status: 429 } // Too Many Requests
        );
      }
      throw error;
    }

    const body = await request.json();
    const { message, conversationId, conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get current user
    const supabaseUser = await getCurrentUser();
    if (!supabaseUser?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current page from referer
    const referer = request.headers.get('referer') || '';
    
    // Build context
    const context = await buildAssistantContext(dbUser.id, referer);
    const systemPrompt = formatContextForAI(context);

    // Build conversation messages
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history if exists
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Extract response text
    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');

    if (!responseText) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    // Calculate cost (Claude Sonnet pricing: ~$0.003 per request average)
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost =
      (inputTokens / 1000000) * 3.0 + // $3 per 1M input tokens
      (outputTokens / 1000000) * 15.0; // $15 per 1M output tokens

    // Save or update conversation
    let conversation;
    if (conversationId) {
      // Update existing conversation
      conversation = await prisma.assistantConversation.update({
        where: { id: conversationId },
        data: {
          messages: [
            ...(conversationHistory || []),
            { role: 'user', content: message, timestamp: new Date().toISOString() },
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
      // Detect topic from message
      const topic = detectTopic(message, context.currentPage);
      
      conversation = await prisma.assistantConversation.create({
        data: {
          userId: dbUser.id,
          topic,
          page: context.currentPage,
          messages: [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
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

    // 📊 Track successful usage
    await trackUsage(dbUser.id, 'assistantConversations', 1);

    return NextResponse.json({
      response: responseText,
      conversationId: conversation.id,
      usage: {
        inputTokens,
        outputTokens,
        cost,
      },
    });
  } catch (error: any) {
    console.error('AI Assistant error:', error);
    
    // Check if it's an Anthropic API error
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'AI service is currently busy. Please try again in a moment.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get AI assistance. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Detect conversation topic from message and context
 */
function detectTopic(message: string, currentPage: string): string {
  const lowerMessage = message.toLowerCase();

  // Navigation patterns
  if (lowerMessage.match(/how do i (get to|find|access)|where is|navigate/i)) {
    return 'navigation';
  }

  // Feature help patterns
  if (lowerMessage.match(/how does|what is|explain|tell me about/i)) {
    return 'feature-help';
  }

  // Troubleshooting patterns
  if (lowerMessage.match(/not working|broken|error|issue|problem|can't|won't/i)) {
    return 'troubleshooting';
  }

  // Creative patterns
  if (lowerMessage.match(/suggest|idea|help me write|recommend|chord|lyric/i)) {
    return 'creative';
  }

  // Support patterns
  if (lowerMessage.match(/upgrade|subscription|quota|limit|storage/i)) {
    return 'support';
  }

  // Default based on current page
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
    status: 'ok',
    message: 'AI Assistant endpoint is running',
    model: 'claude-3-5-sonnet-20241022',
  });
}

