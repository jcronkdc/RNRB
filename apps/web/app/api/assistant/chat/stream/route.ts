/**
 * STREAMING AI ASSISTANT CHAT API
 *
 * Returns responses word-by-word like ChatGPT for a more conversational feel.
 * Uses Server-Sent Events (SSE) for real-time streaming.
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@cronkwaters/db';
import { type NextRequest } from 'next/server';
import OpenAI from 'openai';

import { executeAction, AI_FUNCTIONS, type ActionName } from '@/lib/ai/assistant-actions';
import {
  generatePressRelease,
  generateSocialPosts,
  generateVenueEmail,
  analyzeMusicalPatterns,
  estimateTourBudget,
  calculateRoyaltySplits,
  draftCollaboratorMessage,
  suggestCollaborators,
  ADVANCED_AI_FUNCTIONS,
} from '@/lib/ai/assistant-tools';
import {
  storeMemory,
  updateMemory,
  deleteMemory,
  MEMORY_AI_FUNCTIONS,
  type MemoryType,
  type MemoryPriority,
} from '@/lib/ai/assistant-memory';
import {
  displaySong,
  searchSongs,
  generateSetlistOptions,
  createQuickSetlist,
  getPlaybackQueue,
  SONG_DISCOVERY_AI_FUNCTIONS,
} from '@/lib/ai/song-discovery';
import {
  getSubscriptionContext,
  getTierComparison,
  calculateTierChange,
  SUBSCRIPTION_AI_FUNCTIONS,
} from '@/lib/ai/subscription-helper';
import { buildGodlikeContext, formatGodlikeContext } from '@/lib/ai/godlike-context';
import { aiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

// AI Provider detection
type AIProvider = 'openai' | 'anthropic' | null;

function detectAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  // Create encoder for streaming
  const encoder = new TextEncoder();

  try {
    // Require authentication
    const user = await requireAuth();

    // Rate limit by user ID
    await checkRateLimit(aiLimiter, user.id);

    // Check subscription access
    try {
      await requireFeatureAccess('aiAssistant');
    } catch {
      // Return JSON response for error handling (not SSE)
      return new Response(
        JSON.stringify({
          error: 'Upgrade to Studio tier to use AI Assistant',
          code: 'SUBSCRIPTION_REQUIRED',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check usage quota
    try {
      await requireUsageQuota('assistantConversations', 1);
    } catch {
      // Return JSON response for error handling (not SSE)
      return new Response(
        JSON.stringify({
          error: 'Monthly conversation limit reached',
          code: 'QUOTA_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, conversationId, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Detect AI provider
    const provider = detectAIProvider();
    if (!provider) {
      return new Response(
        JSON.stringify({
          error:
            'AI service is not configured. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to environment variables.',
          code: 'AI_NOT_CONFIGURED',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get current page from referer
    const referer = request.headers.get('referer') || '';

    // Build context
    const context = await buildGodlikeContext(user.id, referer);
    const systemPrompt = formatGodlikeContext(context);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        let inputTokens = 0;
        let outputTokens = 0;
        let modelUsed = '';
        const actionsExecuted: Array<{ action: string; result: unknown }> = [];

        try {
          if (provider === 'openai') {
            const openai = getOpenAIClient()!;
            modelUsed = 'gpt-4o';

            // Build messages
            const messages: OpenAI.ChatCompletionMessageParam[] = [
              { role: 'system', content: systemPrompt },
            ];

            conversationHistory.forEach((msg: { role: 'user' | 'assistant'; content: string }) => {
              messages.push({ role: msg.role, content: msg.content });
            });

            messages.push({ role: 'user', content: message });

            // All available functions
            const allFunctions = [
              ...AI_FUNCTIONS,
              ...ADVANCED_AI_FUNCTIONS,
              ...MEMORY_AI_FUNCTIONS,
              ...SONG_DISCOVERY_AI_FUNCTIONS,
              ...SUBSCRIPTION_AI_FUNCTIONS,
            ];
            const tools: OpenAI.ChatCompletionTool[] = allFunctions.map((fn) => ({
              type: 'function' as const,
              function: {
                name: fn.name,
                description: fn.description,
                parameters: fn.parameters,
              },
            }));

            // First call - check for function calls
            const initialResponse = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages,
              max_tokens: 2000,
              temperature: 0.7,
              tools,
              tool_choice: 'auto',
            });

            // Handle function calls if present
            if (initialResponse.choices[0]?.message?.tool_calls) {
              const toolCalls = initialResponse.choices[0].message.tool_calls;
              messages.push(initialResponse.choices[0].message);

              // Execute each function
              for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                // Send action notification
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ action: functionName, status: 'executing' })}\n\n`
                  )
                );

                let result;
                switch (functionName) {
                  case 'generatePressRelease':
                    result = await generatePressRelease(user.id, functionArgs.projectId);
                    break;
                  case 'generateSocialPosts':
                    result = await generateSocialPosts(user.id, functionArgs);
                    break;
                  case 'generateVenueEmail':
                    result = await generateVenueEmail(user.id, functionArgs);
                    break;
                  case 'analyzeMusicalPatterns':
                    result = await analyzeMusicalPatterns(user.id);
                    break;
                  case 'estimateTourBudget':
                    result = await estimateTourBudget(user.id, functionArgs.tourId, functionArgs);
                    break;
                  case 'calculateRoyaltySplits':
                    result = await calculateRoyaltySplits(functionArgs.songId, user.id);
                    break;
                  case 'draftCollaboratorMessage':
                    result = await draftCollaboratorMessage(user.id, functionArgs);
                    break;
                  case 'suggestCollaborators':
                    result = await suggestCollaborators(user.id);
                    break;
                  case 'storeMemory':
                    result = await storeMemory(user.id, {
                      type: functionArgs.type as MemoryType,
                      content: functionArgs.content,
                      priority: functionArgs.priority as MemoryPriority,
                      tags: functionArgs.tags,
                      source: 'conversation',
                    });
                    break;
                  case 'updateMemory':
                    result = await updateMemory(functionArgs.memoryId, user.id, {
                      content: functionArgs.content,
                      supersede: functionArgs.supersede,
                    });
                    break;
                  case 'deleteMemory':
                    result = { success: await deleteMemory(functionArgs.memoryId, user.id) };
                    break;
                  case 'displaySong':
                    result = await displaySong(
                      user.id,
                      functionArgs.identifier,
                      functionArgs.viewMode
                    );
                    break;
                  case 'searchSongs':
                    result = await searchSongs(user.id, functionArgs);
                    break;
                  case 'generateSetlistOptions':
                    result = await generateSetlistOptions(user.id, functionArgs);
                    break;
                  case 'createQuickSetlist':
                    result = await createQuickSetlist(
                      user.id,
                      functionArgs.occasion,
                      functionArgs.songCount,
                      functionArgs.specificRequests
                    );
                    break;
                  case 'getPlaybackQueue':
                    result = await getPlaybackQueue(user.id, functionArgs.songIds);
                    break;
                  case 'getSubscriptionContext':
                    result = await getSubscriptionContext(user.id);
                    break;
                  case 'explainTiers':
                    const tiers = getTierComparison();
                    result = {
                      success: true,
                      tiers:
                        functionArgs.focusTier === 'all'
                          ? tiers
                          : tiers.filter((t) => t.tier === functionArgs.focusTier),
                    };
                    break;
                  case 'recommendSubscription':
                    const subCtx = await getSubscriptionContext(user.id);
                    if (functionArgs.consideringTier) {
                      const comparison = calculateTierChange(
                        subCtx.currentTier,
                        functionArgs.consideringTier
                      );
                      result = { ...subCtx, comparison };
                    } else {
                      result = subCtx;
                    }
                    break;
                  default:
                    result = await executeAction(user.id, functionName as ActionName, functionArgs);
                }

                actionsExecuted.push({ action: functionName, result });
                messages.push({
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(result),
                });

                // Send action completed notification
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ action: functionName, status: 'completed', result })}\n\n`
                  )
                );
              }
            }

            // Now stream the final response
            const streamResponse = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages,
              max_tokens: 2000,
              temperature: 0.7,
              stream: true,
            });

            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`)
                );
              }

              // Track usage from final chunk
              if (chunk.usage) {
                inputTokens = chunk.usage.prompt_tokens || 0;
                outputTokens = chunk.usage.completion_tokens || 0;
              }
            }

            // Estimate tokens if not provided
            if (!inputTokens) {
              inputTokens = Math.ceil(systemPrompt.length / 4) + Math.ceil(message.length / 4);
              outputTokens = Math.ceil(fullResponse.length / 4);
            }
          } else {
            // Anthropic streaming
            const anthropic = getAnthropicClient()!;
            modelUsed = 'claude-3-5-sonnet';

            const claudeMessages: Anthropic.MessageParam[] = [];
            conversationHistory.forEach((msg: { role: 'user' | 'assistant'; content: string }) => {
              claudeMessages.push({ role: msg.role, content: msg.content });
            });
            claudeMessages.push({ role: 'user', content: message });

            const streamResponse = await anthropic.messages.stream({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 2000,
              system: systemPrompt,
              messages: claudeMessages,
            });

            for await (const event of streamResponse) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                const text = event.delta.text;
                fullResponse += text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }

            const finalMessage = await streamResponse.finalMessage();
            inputTokens = finalMessage.usage.input_tokens;
            outputTokens = finalMessage.usage.output_tokens;
          }

          // Calculate cost
          const cost =
            provider === 'openai'
              ? (inputTokens / 1000000) * 5.0 + (outputTokens / 1000000) * 15.0
              : (inputTokens / 1000000) * 3.0 + (outputTokens / 1000000) * 15.0;

          // Save conversation
          let conversation;
          if (conversationId) {
            const existingConversation = await prisma.assistantConversation.findFirst({
              where: { id: conversationId, userId: user.id },
            });

            if (existingConversation) {
              conversation = await prisma.assistantConversation.update({
                where: { id: conversationId },
                data: {
                  messages: [
                    ...conversationHistory,
                    { role: 'user', content: message, timestamp: new Date().toISOString() },
                    {
                      role: 'assistant',
                      content: fullResponse,
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
            }
          }

          if (!conversation) {
            conversation = await prisma.assistantConversation.create({
              data: {
                userId: user.id,
                topic: detectTopic(message, context.currentPage),
                page: context.currentPage,
                messages: [
                  { role: 'user', content: message, timestamp: new Date().toISOString() },
                  {
                    role: 'assistant',
                    content: fullResponse,
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

          // Track usage
          await trackUsage(user.id, 'assistantConversations', 1);

          // Send completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversationId: conversation.id,
                model: modelUsed,
                usage: { inputTokens, outputTokens, cost },
                actionsExecuted: actionsExecuted.length > 0 ? actionsExecuted : undefined,
              })}\n\n`
            )
          );
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'An error occurred while processing your request' })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream setup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: `Failed to start AI Assistant: ${errorMessage}`,
        code: 'STREAM_INIT_ERROR',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function detectTopic(message: string, currentPage: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/create|make|start|new/i)) return 'action-create';
  if (lowerMessage.match(/how do i|where is|navigate/i)) return 'navigation';
  if (lowerMessage.match(/how does|what is|explain/i)) return 'feature-help';
  if (lowerMessage.match(/not working|broken|error|issue/i)) return 'troubleshooting';
  if (lowerMessage.match(/suggest|idea|help me|chord|lyric|rhyme/i)) return 'creative';
  if (lowerMessage.match(/setlist|tour|show|gig/i)) return 'tour-planning';
  if (lowerMessage.match(/upgrade|subscription|quota/i)) return 'support';
  if (currentPage && currentPage !== 'unknown') return `${currentPage}-help`;

  return 'general';
}
