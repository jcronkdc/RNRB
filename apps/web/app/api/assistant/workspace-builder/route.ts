/**
 * AI WORKSPACE BUILDER API
 * 
 * This API accepts natural language requests and returns workspace configurations.
 * It uses Claude to understand the user's intent and suggest the perfect workspace setup.
 * 
 * Actions:
 * - create: Create a new workspace from description
 * - modify: Modify an existing workspace
 * - reorganize: Reorganize tools across workspaces
 * - suggest: Get AI suggestions for workspace setup
 * - cleanup: Remove unused tools
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

import { auth } from '@/auth';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { 
  WORKSPACE_TEMPLATES, 
  findMatchingTemplates,
  parseWorkspaceDescription 
} from '@/components/workspace/workspace-templates';
import { TOOL_CATALOG, getToolByKey } from '@/components/workspace/tool-catalog';

// Types for the API
type WorkspaceAction = 'create' | 'modify' | 'reorganize' | 'suggest' | 'cleanup' | 'merge';

interface WorkspaceBuilderRequest {
  message: string;
  action?: WorkspaceAction;
  currentWorkspaceId?: string;
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>;
}

interface WorkspacePreview {
  name: string;
  icon: string;
  tools: string[];
  gradient?: string;
  description?: string;
  matchedTemplate?: string;
}

interface WorkspaceBuilderResponse {
  response: string;
  action: WorkspaceAction;
  preview?: WorkspacePreview;
  previews?: WorkspacePreview[];
  requiresConfirmation: boolean;
  suggestions?: string[];
  error?: string;
}

// Available tools for the AI to understand
const TOOL_DESCRIPTIONS = TOOL_CATALOG.map(t => 
  `${t.key}: ${t.label} - ${t.description} (category: ${t.category})`
).join('\n');

// Template descriptions for AI
const TEMPLATE_DESCRIPTIONS = WORKSPACE_TEMPLATES.map(t =>
  `${t.id}: "${t.name}" - ${t.description} (tools: ${t.tools.join(', ')})`
).join('\n');

/**
 * POST /api/assistant/workspace-builder
 * Process natural language workspace requests
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription access for AI features
    try {
      await requireFeatureAccess('aiAssistant');
    } catch {
      // Provide fallback for free users with limited capabilities
      const body: WorkspaceBuilderRequest = await request.json();
      return handleFreeUserRequest(body);
    }

    const body: WorkspaceBuilderRequest = await request.json();
    const { message, action, existingWorkspaces } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Detect action if not provided
    const detectedAction = action || detectAction(message);

    // Use Claude for advanced understanding
    const anthropic = new Anthropic();

    const systemPrompt = `You are an AI workspace builder for Rock N' Roll Basement, a music career platform.
Your job is to help musicians create custom workspaces (tabs) on their dashboard.

Available tools that can be added to workspaces:
${TOOL_DESCRIPTIONS}

Available workspace templates for inspiration:
${TEMPLATE_DESCRIPTIONS}

${existingWorkspaces ? `User's existing workspaces:
${existingWorkspaces.map(w => `- "${w.name}": ${w.tools.join(', ')}`).join('\n')}` : ''}

Based on the user's request, respond with a JSON object containing:
1. "name": A creative, concise workspace name (2-3 words max)
2. "icon": One of: music, mic, studio, map, list, users, globe, briefcase, bag, target, graduation, flask, radio, sparkles
3. "tools": Array of tool keys from the available tools (4-8 tools recommended)
4. "description": A one-line description of the workspace
5. "reasoning": Brief explanation of your choices

Keep names punchy and music-focused. Match the vibe of the request.
Only respond with valid JSON, no other text.`;

    let aiResponse: WorkspaceBuilderResponse;

    switch (detectedAction) {
      case 'create':
        aiResponse = await handleCreateAction(anthropic, systemPrompt, message);
        break;
      case 'suggest':
        aiResponse = await handleSuggestAction(anthropic, systemPrompt, message, existingWorkspaces);
        break;
      case 'modify':
        aiResponse = await handleModifyAction(anthropic, systemPrompt, message, existingWorkspaces);
        break;
      case 'merge':
        aiResponse = await handleMergeAction(anthropic, systemPrompt, message, existingWorkspaces);
        break;
      case 'reorganize':
        aiResponse = await handleReorganizeAction(anthropic, systemPrompt, message, existingWorkspaces);
        break;
      case 'cleanup':
        aiResponse = await handleCleanupAction(message, existingWorkspaces);
        break;
      default:
        aiResponse = await handleCreateAction(anthropic, systemPrompt, message);
    }

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('[WORKSPACE BUILDER] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process workspace request',
        response: "I had trouble understanding that request. Try something like 'Create a songwriting workspace' or 'Set up my tour management area'.",
        action: 'create' as WorkspaceAction,
        requiresConfirmation: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Detect action from natural language
 */
function detectAction(message: string): WorkspaceAction {
  const lower = message.toLowerCase();
  
  if (lower.match(/\b(create|make|build|set up|new|add)\b/)) return 'create';
  if (lower.match(/\b(modify|change|update|edit|rename)\b/)) return 'modify';
  if (lower.match(/\b(merge|combine|join)\b/)) return 'merge';
  if (lower.match(/\b(reorganize|rearrange|move|reorder)\b/)) return 'reorganize';
  if (lower.match(/\b(suggest|recommend|what should|help me)\b/)) return 'suggest';
  if (lower.match(/\b(cleanup|clean up|remove unused|clear)\b/)) return 'cleanup';
  
  return 'create';
}

/**
 * Handle create workspace action
 */
async function handleCreateAction(
  anthropic: Anthropic,
  systemPrompt: string,
  message: string
): Promise<WorkspaceBuilderResponse> {
  // First try template matching for speed
  const templateMatch = parseWorkspaceDescription(message);
  
  if (templateMatch.matchedTemplate) {
    const template = templateMatch.matchedTemplate;
    return {
      response: `I'll create a "${template.name}" workspace for you! This setup is perfect for ${template.description.toLowerCase()}. It includes ${template.tools.length} tools to get you started.`,
      action: 'create',
      preview: {
        name: template.name,
        icon: template.icon,
        tools: template.tools,
        gradient: template.gradient,
        description: template.description,
        matchedTemplate: template.id,
      },
      requiresConfirmation: true,
    };
  }

  // Fall back to AI for custom requests
  const aiMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Create a workspace based on this request: "${message}"`,
      },
    ],
  });

  const content = aiMessage.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected AI response format');
  }

  try {
    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate tools
    const validTools = (parsed.tools || []).filter((t: string) => getToolByKey(t));
    if (validTools.length === 0) {
      validTools.push('songwriting', 'library', 'tools');
    }

    // Find matching gradient from templates
    const similarTemplates = findMatchingTemplates(message, 1);
    const gradient = similarTemplates[0]?.gradient || 'from-violet-500 to-purple-500';

    return {
      response: `I'll create "${parsed.name}" for you! ${parsed.reasoning || parsed.description || 'This workspace is customized for your needs.'}`,
      action: 'create',
      preview: {
        name: parsed.name || 'My Workspace',
        icon: parsed.icon || 'sparkles',
        tools: validTools,
        gradient,
        description: parsed.description,
      },
      requiresConfirmation: true,
    };
  } catch {
    // Fallback to basic parsing
    const fallback = parseWorkspaceDescription(message);
    return {
      response: `I'll set up "${fallback.suggestedName}" with some essential tools. Let me know if you want to customize it!`,
      action: 'create',
      preview: {
        name: fallback.suggestedName,
        icon: fallback.suggestedIcon,
        tools: fallback.suggestedTools,
        gradient: 'from-violet-500 to-purple-500',
      },
      requiresConfirmation: true,
    };
  }
}

/**
 * Handle suggestion action
 */
async function handleSuggestAction(
  anthropic: Anthropic,
  systemPrompt: string,
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>
): Promise<WorkspaceBuilderResponse> {
  // Get top 3 matching templates
  const matches = findMatchingTemplates(message, 3);
  
  if (matches.length > 0) {
    const previews: WorkspacePreview[] = matches.map(t => ({
      name: t.name,
      icon: t.icon,
      tools: t.tools,
      gradient: t.gradient,
      description: t.description,
      matchedTemplate: t.id,
    }));

    // Filter out workspaces that already exist
    const existing = existingWorkspaces?.map(w => w.name.toLowerCase()) || [];
    const filtered = previews.filter(p => !existing.includes(p.name.toLowerCase()));

    return {
      response: `Based on your needs, here are some workspace setups I'd recommend. Pick one to create instantly, or tell me what you'd like to customize!`,
      action: 'suggest',
      previews: filtered.length > 0 ? filtered : previews,
      requiresConfirmation: false,
    };
  }

  // Use AI for more specific suggestions
  const aiMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 768,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Suggest 2-3 workspace setups for a musician who says: "${message}". 
Return a JSON array of workspace objects, each with: name, icon, tools, description.`,
      },
    ],
  });

  const content = aiMessage.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected AI response format');
  }

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    
    const parsed = JSON.parse(jsonMatch[0]);
    const previews: WorkspacePreview[] = parsed.map((p: Record<string, unknown>, i: number) => ({
      name: p.name || `Workspace ${i + 1}`,
      icon: p.icon || 'sparkles',
      tools: ((p.tools as string[]) || []).filter((t: string) => getToolByKey(t)),
      gradient: WORKSPACE_TEMPLATES[i % WORKSPACE_TEMPLATES.length].gradient,
      description: p.description,
    }));

    return {
      response: 'Here are some custom workspace ideas based on your description:',
      action: 'suggest',
      previews,
      requiresConfirmation: false,
    };
  } catch {
    // Fallback to random templates
    const random = WORKSPACE_TEMPLATES.slice(0, 3);
    return {
      response: 'Here are some popular workspace setups to get you started:',
      action: 'suggest',
      previews: random.map(t => ({
        name: t.name,
        icon: t.icon,
        tools: t.tools,
        gradient: t.gradient,
        description: t.description,
        matchedTemplate: t.id,
      })),
      requiresConfirmation: false,
    };
  }
}

/**
 * Handle modify action
 */
async function handleModifyAction(
  anthropic: Anthropic,
  systemPrompt: string,
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>
): Promise<WorkspaceBuilderResponse> {
  if (!existingWorkspaces || existingWorkspaces.length === 0) {
    return {
      response: "You don't have any workspaces to modify yet. Would you like me to create one for you?",
      action: 'create',
      requiresConfirmation: false,
    };
  }

  const aiMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: `${systemPrompt}\n\nThe user wants to modify an existing workspace. Determine which workspace they're referring to and what changes they want.`,
    messages: [
      {
        role: 'user',
        content: `Existing workspaces: ${JSON.stringify(existingWorkspaces)}
User request: "${message}"

Respond with JSON: { "workspaceId": "id to modify", "name": "new name if changed", "tools": ["updated tool list"], "reasoning": "explanation" }`,
      },
    ],
  });

  const content = aiMessage.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected AI response format');
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const parsed = JSON.parse(jsonMatch[0]);
    const workspace = existingWorkspaces.find(w => w.id === parsed.workspaceId);
    
    return {
      response: `I'll update your "${workspace?.name || 'workspace'}" with these changes. ${parsed.reasoning || ''}`,
      action: 'modify',
      preview: {
        name: parsed.name || workspace?.name || 'Workspace',
        icon: 'sparkles',
        tools: (parsed.tools || []).filter((t: string) => getToolByKey(t)),
        description: parsed.reasoning,
      },
      requiresConfirmation: true,
    };
  } catch {
    return {
      response: "I couldn't determine which workspace to modify. Could you be more specific?",
      action: 'modify',
      requiresConfirmation: false,
      suggestions: existingWorkspaces.map(w => `Modify "${w.name}"`),
    };
  }
}

/**
 * Handle merge action
 */
async function handleMergeAction(
  anthropic: Anthropic,
  systemPrompt: string,
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>
): Promise<WorkspaceBuilderResponse> {
  if (!existingWorkspaces || existingWorkspaces.length < 2) {
    return {
      response: "You need at least 2 workspaces to merge them. Would you like to create some first?",
      action: 'create',
      requiresConfirmation: false,
    };
  }

  const aiMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: `${systemPrompt}\n\nThe user wants to merge workspaces. Determine which ones and create a combined workspace.`,
    messages: [
      {
        role: 'user',
        content: `Existing workspaces: ${JSON.stringify(existingWorkspaces)}
User request: "${message}"

Respond with JSON: { "workspacesToMerge": ["id1", "id2"], "newName": "merged name", "tools": ["combined unique tools"], "reasoning": "explanation" }`,
      },
    ],
  });

  const content = aiMessage.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected AI response format');
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      response: `I'll merge these workspaces into "${parsed.newName}". ${parsed.reasoning || ''}`,
      action: 'merge',
      preview: {
        name: parsed.newName || 'Merged Workspace',
        icon: 'sparkles',
        tools: (parsed.tools || []).filter((t: string) => getToolByKey(t)),
        description: parsed.reasoning,
      },
      requiresConfirmation: true,
    };
  } catch {
    return {
      response: "I couldn't determine which workspaces to merge. Could you specify which ones?",
      action: 'merge',
      requiresConfirmation: false,
      suggestions: existingWorkspaces.map(w => `Include "${w.name}"`),
    };
  }
}

/**
 * Handle reorganize action
 */
async function handleReorganizeAction(
  anthropic: Anthropic,
  systemPrompt: string,
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>
): Promise<WorkspaceBuilderResponse> {
  if (!existingWorkspaces || existingWorkspaces.length === 0) {
    return {
      response: "You don't have any workspaces to reorganize. Let me help you create some!",
      action: 'suggest',
      requiresConfirmation: false,
    };
  }

  const aiMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 768,
    system: `${systemPrompt}\n\nThe user wants to reorganize their tools across workspaces. Suggest an optimal arrangement.`,
    messages: [
      {
        role: 'user',
        content: `Current workspaces: ${JSON.stringify(existingWorkspaces)}
User request: "${message}"

Respond with JSON array of reorganized workspaces: [{ "id": "existing-id", "name": "name", "tools": ["reorganized tools"] }]`,
      },
    ],
  });

  const content = aiMessage.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected AI response format');
  }

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      response: "Here's how I'd reorganize your workspaces for better workflow:",
      action: 'reorganize',
      previews: parsed.map((p: Record<string, unknown>) => ({
        name: p.name || 'Workspace',
        icon: 'sparkles',
        tools: ((p.tools as string[]) || []).filter((t: string) => getToolByKey(t)),
      })),
      requiresConfirmation: true,
    };
  } catch {
    return {
      response: "I had trouble creating a reorganization plan. Could you be more specific about what you'd like to move?",
      action: 'reorganize',
      requiresConfirmation: false,
    };
  }
}

/**
 * Handle cleanup action (no AI needed)
 */
async function handleCleanupAction(
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>
): Promise<WorkspaceBuilderResponse> {
  if (!existingWorkspaces || existingWorkspaces.length === 0) {
    return {
      response: "No workspaces to clean up! Your dashboard is already minimal.",
      action: 'cleanup',
      requiresConfirmation: false,
    };
  }

  // Find empty or near-empty workspaces
  const sparse = existingWorkspaces.filter(w => w.tools.length <= 1);
  
  if (sparse.length > 0) {
    return {
      response: `I found ${sparse.length} workspace(s) with very few tools. Would you like to remove or consolidate them?`,
      action: 'cleanup',
      suggestions: sparse.map(w => `Remove "${w.name}"`),
      requiresConfirmation: true,
    };
  }

  return {
    response: "Your workspaces look well-organized! Nothing to clean up.",
    action: 'cleanup',
    requiresConfirmation: false,
  };
}

/**
 * Handle requests from free users (limited capabilities)
 */
async function handleFreeUserRequest(body: WorkspaceBuilderRequest): Promise<NextResponse> {
  const { message } = body;
  
  // Use template matching only for free users
  const matches = findMatchingTemplates(message, 3);
  
  if (matches.length > 0) {
    return NextResponse.json({
      response: "Here are some workspace templates that match your request. Upgrade to Studio tier to get AI-powered custom workspace creation!",
      action: 'suggest',
      previews: matches.map(t => ({
        name: t.name,
        icon: t.icon,
        tools: t.tools,
        gradient: t.gradient,
        description: t.description,
        matchedTemplate: t.id,
      })),
      requiresConfirmation: false,
      suggestions: ['Upgrade for custom AI workspaces'],
    });
  }

  // Default templates for free users
  const defaultTemplates = WORKSPACE_TEMPLATES.slice(0, 3);
  return NextResponse.json({
    response: "Check out these popular workspace templates! Upgrade to get custom AI-powered workspace creation.",
    action: 'suggest',
    previews: defaultTemplates.map(t => ({
      name: t.name,
      icon: t.icon,
      tools: t.tools,
      gradient: t.gradient,
      description: t.description,
      matchedTemplate: t.id,
    })),
    requiresConfirmation: false,
  });
}

