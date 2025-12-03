/**
 * Workspace Components
 *
 * Custom workspace system for user-owned dashboard customization.
 * Users can create their own workspaces, name them, and populate them
 * with the tools they use most.
 */

// Context provider
export { WorkspaceProvider, useWorkspace } from './workspace-context';
export type { Workspace, WorkspaceTool, UserPreferences } from './workspace-context';

// UI Components
export { WorkspaceTabs } from './workspace-tabs';
export { WorkspaceGrid } from './workspace-grid';
export { WorkspaceCreatorModal } from './workspace-creator-modal';
export { ToolCatalogModal } from './tool-catalog-modal';
export { CustomizableDashboard } from './customizable-dashboard';
export { AIWorkspaceChat } from './ai-workspace-chat';
export { WorkspaceCustomizer } from './workspace-customizer';

// Tool Catalog
export {
  TOOL_CATALOG,
  TOOL_CATEGORIES,
  DEFAULT_WORKSPACE_TOOLS,
  getToolByKey,
  getToolsByCategory,
  getSuggestedToolsForWorkspace,
  type ToolDefinition,
} from './tool-catalog';

// Workspace Templates
export {
  WORKSPACE_TEMPLATES,
  TEMPLATE_ICONS,
  findMatchingTemplates,
  getTemplateById,
  parseWorkspaceDescription,
  type WorkspaceTemplate,
} from './workspace-templates';
