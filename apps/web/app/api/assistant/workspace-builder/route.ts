/**
 * AI WORKSPACE BUILDER API - ENHANCED VERSION
 *
 * A powerful AI that understands natural language workspace customization.
 *
 * Capabilities:
 * - Create new workspaces with custom names and specific tools
 * - Modify existing workspaces (rename, add/remove tools)
 * - Remove specific elements from workspaces
 * - Hide/show promotional banners per workspace
 * - Reorganize tools across workspaces
 * - Smart suggestions based on workflow
 *
 * The AI understands context and can handle complex requests like:
 * - "Create a songwriting workspace with just lyrics and melody tools"
 * - "Rename this tab to Songwriting"
 * - "Remove the merch and email from this workspace"
 * - "Add collaboration tools to my current workspace"
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

import { auth } from '@/auth';
import { requireFeatureAccess } from '@/lib/subscription-access';
import {
  WORKSPACE_TEMPLATES,
  findMatchingTemplates,
} from '@/components/workspace/workspace-templates';
import { TOOL_CATALOG, getToolByKey } from '@/components/workspace/tool-catalog';

// Enhanced action types
type WorkspaceAction =
  | 'create'
  | 'modify'
  | 'rename'
  | 'add_tools'
  | 'remove_tools'
  | 'reorganize'
  | 'suggest'
  | 'cleanup'
  | 'merge'
  | 'configure'; // For workspace settings like hiding banners

interface WorkspaceBuilderRequest {
  message: string;
  action?: WorkspaceAction;
  currentWorkspaceId?: string;
  currentWorkspaceName?: string;
  existingWorkspaces?: Array<{
    id: string;
    name: string;
    tools: string[];
    settings?: WorkspaceSettings;
  }>;
}

interface WorkspaceSettings {
  showMerchBanner?: boolean;
  showEmailBanner?: boolean;
  showPromotionalBanners?: boolean;
}

interface WorkspacePreview {
  name: string;
  icon: string;
  tools: string[];
  gradient?: string;
  description?: string;
  matchedTemplate?: string;
  settings?: WorkspaceSettings;
}

interface WorkspaceModification {
  workspaceId?: string;
  newName?: string;
  addTools?: string[];
  removeTools?: string[];
  settings?: WorkspaceSettings;
}

interface WorkspaceBuilderResponse {
  response: string;
  action: WorkspaceAction;
  preview?: WorkspacePreview;
  previews?: WorkspacePreview[];
  modification?: WorkspaceModification;
  requiresConfirmation: boolean;
  suggestions?: string[];
  error?: string;
  // Direct action for immediate execution without confirmation
  executeImmediately?: boolean;
}

// Available tools for the AI to understand
const TOOL_DESCRIPTIONS = TOOL_CATALOG.map(
  (t) => `${t.key}: ${t.label} - ${t.description} (category: ${t.category})`
).join('\n');

// Template descriptions for AI
const TEMPLATE_DESCRIPTIONS = WORKSPACE_TEMPLATES.map(
  (t) => `${t.id}: "${t.name}" - ${t.description} (tools: ${t.tools.join(', ')})`
).join('\n');

// All available tool keys for validation
const ALL_TOOL_KEYS = TOOL_CATALOG.map((t) => t.key);

/**
 * POST /api/assistant/workspace-builder
 * Process natural language workspace requests with full customization power
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription access for AI features
    let isPaidUser = true;
    try {
      await requireFeatureAccess('aiAssistant');
    } catch {
      isPaidUser = false;
    }

    const body: WorkspaceBuilderRequest = await request.json();
    const { message, currentWorkspaceId, currentWorkspaceName, existingWorkspaces } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Use Claude for intelligent understanding
    const anthropic = new Anthropic();

    // Enhanced system prompt that understands customization
    const systemPrompt = buildEnhancedSystemPrompt(existingWorkspaces, currentWorkspaceName);

    // Analyze the user's intent with AI
    const aiResponse = await analyzeAndExecute(
      anthropic,
      systemPrompt,
      message,
      existingWorkspaces,
      currentWorkspaceId,
      currentWorkspaceName,
      isPaidUser
    );

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('[WORKSPACE BUILDER] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process workspace request',
        response:
          "I had trouble understanding that request. Try something like 'Create a songwriting workspace' or 'Set up my tour management area'.",
        action: 'create' as WorkspaceAction,
        requiresConfirmation: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Build an enhanced system prompt that gives the AI full customization power
 */
function buildEnhancedSystemPrompt(
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceName?: string
): string {
  return `You are an advanced AI workspace builder for Rock N' Roll Basement, a music career platform.
You have FULL POWER to customize workspaces exactly as the user requests. You understand natural language and can:

1. CREATE new workspaces with custom names and specific tools
2. RENAME existing workspaces to any name the user wants
3. ADD specific tools to workspaces
4. REMOVE specific tools or elements from workspaces
5. CONFIGURE workspace settings (hide/show promotional banners)

AVAILABLE TOOLS (use exact keys):
${TOOL_DESCRIPTIONS}

TOOL KEYS FOR REFERENCE: ${ALL_TOOL_KEYS.join(', ')}

PROMOTIONAL ELEMENTS (can be hidden per workspace):
- merchBanner: "Sell Your Own Merch" promotional banner
- emailBanner: "Get Your @rnrb.me Email" promotional banner

WORKSPACE TEMPLATES (for inspiration only - you can create ANY custom configuration):
${TEMPLATE_DESCRIPTIONS}

${
  existingWorkspaces && existingWorkspaces.length > 0
    ? `
USER'S EXISTING WORKSPACES:
${existingWorkspaces.map((w) => `- "${w.name}" (id: ${w.id}): tools=[${w.tools.join(', ')}]`).join('\n')}
`
    : 'User has no existing workspaces yet.'
}

${currentWorkspaceName ? `CURRENT ACTIVE WORKSPACE: "${currentWorkspaceName}"` : ''}

RESPONSE FORMAT:
You MUST respond with a valid JSON object. Choose the appropriate action type:

For CREATING a new workspace:
{
  "action": "create",
  "name": "Workspace Name",
  "icon": "music|mic|studio|map|list|users|globe|briefcase|bag|target|graduation|flask|radio|sparkles",
  "tools": ["tool1", "tool2", ...],
  "settings": { "showMerchBanner": true/false, "showEmailBanner": true/false },
  "description": "One-line description",
  "message": "Friendly confirmation message to user"
}

For RENAMING a workspace:
{
  "action": "rename",
  "workspaceId": "id if known, or null for current",
  "targetWorkspace": "name of workspace to rename",
  "newName": "New Name",
  "message": "Confirmation message"
}

For ADDING tools:
{
  "action": "add_tools",
  "workspaceId": "id or null for current",
  "targetWorkspace": "workspace name",
  "addTools": ["tool1", "tool2"],
  "message": "Confirmation message"
}

For REMOVING tools/elements:
{
  "action": "remove_tools",
  "workspaceId": "id or null for current",
  "targetWorkspace": "workspace name",
  "removeTools": ["tool1", "tool2"],
  "settings": { "showMerchBanner": false, "showEmailBanner": false },
  "message": "Confirmation message"
}

For CONFIGURING settings (hiding banners, etc):
{
  "action": "configure",
  "workspaceId": "id or null for current",
  "targetWorkspace": "workspace name",
  "settings": { "showMerchBanner": true/false, "showEmailBanner": true/false },
  "message": "Confirmation message"
}

CRITICAL RULES:
1. ALWAYS understand what the user wants, even if their request is informal
2. When user says "this tab/workspace" or "this page", they mean the CURRENT active workspace
3. When user wants to "remove merch" or "remove email", set the appropriate banner settings to false
4. When user asks to "rename to X", create a rename action with newName: "X"
5. Users get EXACTLY what they ask for - nothing more, nothing less
6. Be creative with workspace names but respect explicit naming requests
7. Only use valid tool keys from the list above
8. The "message" field should be friendly and confirm what you're doing

EXAMPLES OF UNDERSTANDING:
- "rename this to songwriting" → rename action with newName: "Songwriting"
- "remove the merch and email" → configure with showMerchBanner: false, showEmailBanner: false
- "create a songwriting workspace" → create with songwriting-focused tools
- "add collaboration tools" → add_tools with collaboration, messages, meet, discover
- "just give me lyrics and melody tools" → create with minimal, focused tools

Respond ONLY with valid JSON, no other text.`;
}

/**
 * Analyze user request with AI and execute the appropriate action
 */
async function analyzeAndExecute(
  anthropic: Anthropic,
  systemPrompt: string,
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceId?: string,
  currentWorkspaceName?: string,
  isPaidUser: boolean = true
): Promise<WorkspaceBuilderResponse> {
  // For free users, provide limited functionality
  if (!isPaidUser) {
    return handleFreeUserRequest(message, existingWorkspaces);
  }

  try {
    // Use Claude to understand the request
    const aiMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const content = aiMessage.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected AI response format');
    }

    // Parse the AI response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const action = parsed.action as WorkspaceAction;

    // Process based on action type
    switch (action) {
      case 'create':
        return handleCreateResponse(parsed, existingWorkspaces);

      case 'rename':
        return handleRenameResponse(parsed, existingWorkspaces, currentWorkspaceId);

      case 'add_tools':
        return handleAddToolsResponse(parsed, existingWorkspaces, currentWorkspaceId);

      case 'remove_tools':
        return handleRemoveToolsResponse(parsed, existingWorkspaces, currentWorkspaceId);

      case 'configure':
        return handleConfigureResponse(parsed, existingWorkspaces, currentWorkspaceId);

      case 'modify':
        return handleModifyResponse(parsed, existingWorkspaces, currentWorkspaceId);

      default:
        // Default to create if action not recognized
        return handleCreateResponse(parsed, existingWorkspaces);
    }
  } catch (error) {
    console.error('[AI Analysis Error]:', error);

    // Fallback: try to understand the request with simple parsing
    return handleFallbackParsing(message, existingWorkspaces, currentWorkspaceId);
  }
}

/**
 * Handle CREATE action response
 */
function handleCreateResponse(
  parsed: Record<string, unknown>,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>
): WorkspaceBuilderResponse {
  // Validate and filter tools
  const requestedTools = (parsed.tools as string[]) || [];
  const validTools = requestedTools.filter((t) => getToolByKey(t));

  // If no valid tools, provide sensible defaults based on name
  const finalTools =
    validTools.length > 0
      ? validTools
      : getDefaultToolsForName((parsed.name as string) || 'workspace');

  // Get gradient from similar templates
  const similarTemplates = findMatchingTemplates((parsed.name as string) || '', 1);
  const gradient = similarTemplates[0]?.gradient || 'from-violet-500 to-purple-500';

  return {
    response:
      (parsed.message as string) ||
      `I'll create "${parsed.name}" for you with ${finalTools.length} tools!`,
    action: 'create',
    preview: {
      name: (parsed.name as string) || 'My Workspace',
      icon: (parsed.icon as string) || 'sparkles',
      tools: finalTools,
      gradient,
      description: parsed.description as string,
      settings: parsed.settings as WorkspaceSettings,
    },
    requiresConfirmation: true,
  };
}

/**
 * Handle RENAME action response
 */
function handleRenameResponse(
  parsed: Record<string, unknown>,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceId?: string
): WorkspaceBuilderResponse {
  // Find the workspace to rename
  let targetId = parsed.workspaceId as string;
  const targetName = parsed.targetWorkspace as string;
  const newName = parsed.newName as string;

  if (!targetId && targetName && existingWorkspaces) {
    const found = existingWorkspaces.find((w) => w.name.toLowerCase() === targetName.toLowerCase());
    targetId = found?.id || currentWorkspaceId || '';
  }

  if (!targetId) {
    targetId = currentWorkspaceId || '';
  }

  return {
    response: (parsed.message as string) || `I'll rename this workspace to "${newName}"!`,
    action: 'rename',
    modification: {
      workspaceId: targetId,
      newName: newName,
    },
    requiresConfirmation: false, // Rename can be immediate
    executeImmediately: true,
  };
}

/**
 * Handle ADD_TOOLS action response
 */
function handleAddToolsResponse(
  parsed: Record<string, unknown>,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceId?: string
): WorkspaceBuilderResponse {
  let targetId = parsed.workspaceId as string;
  const addTools = ((parsed.addTools as string[]) || []).filter((t) => getToolByKey(t));

  if (!targetId) {
    targetId = currentWorkspaceId || '';
  }

  const workspace = existingWorkspaces?.find((w) => w.id === targetId);
  const toolNames = addTools.map((t) => getToolByKey(t)?.label || t).join(', ');

  return {
    response:
      (parsed.message as string) ||
      `I'll add ${toolNames} to "${workspace?.name || 'your workspace'}"!`,
    action: 'add_tools',
    modification: {
      workspaceId: targetId,
      addTools,
    },
    requiresConfirmation: false,
    executeImmediately: true,
  };
}

/**
 * Handle REMOVE_TOOLS action response
 */
function handleRemoveToolsResponse(
  parsed: Record<string, unknown>,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceId?: string
): WorkspaceBuilderResponse {
  let targetId = parsed.workspaceId as string;
  const removeTools = ((parsed.removeTools as string[]) || []).filter((t) => getToolByKey(t));
  const settings = parsed.settings as WorkspaceSettings;

  if (!targetId) {
    targetId = currentWorkspaceId || '';
  }

  const workspace = existingWorkspaces?.find((w) => w.id === targetId);

  // Build response message
  let responseMsg = parsed.message as string;
  if (!responseMsg) {
    const parts: string[] = [];
    if (removeTools.length > 0) {
      const toolNames = removeTools.map((t) => getToolByKey(t)?.label || t).join(', ');
      parts.push(`remove ${toolNames}`);
    }
    if (settings?.showMerchBanner === false) {
      parts.push('hide the Merch banner');
    }
    if (settings?.showEmailBanner === false) {
      parts.push('hide the Email banner');
    }
    responseMsg = `Done! I'll ${parts.join(' and ')} from "${workspace?.name || 'your workspace'}"!`;
  }

  return {
    response: responseMsg,
    action: 'remove_tools',
    modification: {
      workspaceId: targetId,
      removeTools,
      settings,
    },
    requiresConfirmation: false,
    executeImmediately: true,
  };
}

/**
 * Handle CONFIGURE action response (settings like hiding banners)
 */
function handleConfigureResponse(
  parsed: Record<string, unknown>,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceId?: string
): WorkspaceBuilderResponse {
  let targetId = parsed.workspaceId as string;
  const settings = parsed.settings as WorkspaceSettings;

  if (!targetId) {
    targetId = currentWorkspaceId || '';
  }

  const workspace = existingWorkspaces?.find((w) => w.id === targetId);

  // Build response message
  let responseMsg = parsed.message as string;
  if (!responseMsg) {
    const changes: string[] = [];
    if (settings?.showMerchBanner === false) {
      changes.push('hidden the Merch banner');
    } else if (settings?.showMerchBanner === true) {
      changes.push('shown the Merch banner');
    }
    if (settings?.showEmailBanner === false) {
      changes.push('hidden the Email banner');
    } else if (settings?.showEmailBanner === true) {
      changes.push('shown the Email banner');
    }
    responseMsg = `Done! I've ${changes.join(' and ')} in "${workspace?.name || 'your workspace'}"!`;
  }

  return {
    response: responseMsg,
    action: 'configure',
    modification: {
      workspaceId: targetId,
      settings,
    },
    requiresConfirmation: false,
    executeImmediately: true,
  };
}

/**
 * Handle MODIFY action response (general modifications)
 */
function handleModifyResponse(
  parsed: Record<string, unknown>,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceId?: string
): WorkspaceBuilderResponse {
  let targetId = parsed.workspaceId as string;

  if (!targetId) {
    targetId = currentWorkspaceId || '';
  }

  const modification: WorkspaceModification = {
    workspaceId: targetId,
  };

  if (parsed.newName) {
    modification.newName = parsed.newName as string;
  }
  if (parsed.addTools) {
    modification.addTools = ((parsed.addTools as string[]) || []).filter((t) => getToolByKey(t));
  }
  if (parsed.removeTools) {
    modification.removeTools = ((parsed.removeTools as string[]) || []).filter((t) =>
      getToolByKey(t)
    );
  }
  if (parsed.settings) {
    modification.settings = parsed.settings as WorkspaceSettings;
  }

  return {
    response: (parsed.message as string) || "I'll make those changes to your workspace!",
    action: 'modify',
    modification,
    requiresConfirmation: false,
    executeImmediately: true,
  };
}

/**
 * Fallback parsing when AI fails
 */
function handleFallbackParsing(
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>,
  currentWorkspaceId?: string
): WorkspaceBuilderResponse {
  const lower = message.toLowerCase();

  // Check for rename requests
  const renameMatch =
    lower.match(/rename.*(?:to|as)\s+['""]?([^'""]+)['""]?/i) ||
    lower.match(/call.*(?:it|this)\s+['""]?([^'""]+)['""]?/i);
  if (renameMatch) {
    const newName = renameMatch[1].trim();
    return {
      response: `I'll rename this workspace to "${newName}"!`,
      action: 'rename',
      modification: {
        workspaceId: currentWorkspaceId,
        newName,
      },
      requiresConfirmation: false,
      executeImmediately: true,
    };
  }

  // Check for remove merch/email requests
  const removeMerch = lower.includes('remove') && lower.includes('merch');
  const removeEmail = lower.includes('remove') && lower.includes('email');

  if (removeMerch || removeEmail) {
    const settings: WorkspaceSettings = {};
    if (removeMerch) settings.showMerchBanner = false;
    if (removeEmail) settings.showEmailBanner = false;

    const parts = [];
    if (removeMerch) parts.push('Merch banner');
    if (removeEmail) parts.push('Email banner');

    return {
      response: `Done! I've hidden the ${parts.join(' and ')} from your workspace!`,
      action: 'configure',
      modification: {
        workspaceId: currentWorkspaceId,
        settings,
      },
      requiresConfirmation: false,
      executeImmediately: true,
    };
  }

  // Check for create requests
  if (lower.match(/\b(create|make|build|set up|new)\b/)) {
    const templates = findMatchingTemplates(message, 1);
    if (templates.length > 0) {
      const t = templates[0];
      return {
        response: `I'll create a "${t.name}" workspace for you!`,
        action: 'create',
        preview: {
          name: t.name,
          icon: t.icon,
          tools: t.tools,
          gradient: t.gradient,
          description: t.description,
          matchedTemplate: t.id,
        },
        requiresConfirmation: true,
      };
    }
  }

  // Default: ask for clarification
  return {
    response:
      "I had trouble understanding that request. Try something like 'Create a songwriting workspace' or 'Set up my tour management area'.",
    action: 'create',
    requiresConfirmation: false,
    suggestions: [
      'Create a songwriting workspace',
      'Rename this to Songwriting',
      'Remove the merch and email banners',
      'Add collaboration tools',
    ],
  };
}

/**
 * Get default tools based on workspace name
 */
function getDefaultToolsForName(name: string): string[] {
  const lower = name.toLowerCase();

  if (lower.includes('song') || lower.includes('writ') || lower.includes('lyric')) {
    return ['songwriting', 'songs', 'library', 'tools'];
  }
  if (lower.includes('collab') || lower.includes('team')) {
    return ['collaboration', 'messages', 'meet', 'discover'];
  }
  if (lower.includes('tour') || lower.includes('live') || lower.includes('show')) {
    return ['tours', 'shows', 'setlists', 'live'];
  }
  if (lower.includes('studio') || lower.includes('record') || lower.includes('produc')) {
    return ['studio', 'library', 'songs', 'tools'];
  }
  if (lower.includes('business') || lower.includes('career')) {
    return ['opportunities', 'revenue', 'merch', 'sites'];
  }

  // Default set
  return ['songwriting', 'songs', 'library', 'tools'];
}

/**
 * Handle requests from free users (limited capabilities)
 */
function handleFreeUserRequest(
  message: string,
  existingWorkspaces?: Array<{ id: string; name: string; tools: string[] }>
): WorkspaceBuilderResponse {
  // Use template matching for free users
  const matches = findMatchingTemplates(message, 3);

  if (matches.length > 0) {
    return {
      response:
        'Here are some workspace templates that match your request. Upgrade to Studio tier to get AI-powered custom workspace creation!',
      action: 'suggest',
      previews: matches.map((t) => ({
        name: t.name,
        icon: t.icon,
        tools: t.tools,
        gradient: t.gradient,
        description: t.description,
        matchedTemplate: t.id,
      })),
      requiresConfirmation: false,
      suggestions: ['Upgrade for custom AI workspaces'],
    };
  }

  // Default templates for free users
  const defaultTemplates = WORKSPACE_TEMPLATES.slice(0, 3);
  return {
    response:
      'Check out these popular workspace templates! Upgrade to get custom AI-powered workspace creation.',
    action: 'suggest',
    previews: defaultTemplates.map((t) => ({
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
