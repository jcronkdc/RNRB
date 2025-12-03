/**
 * useWorkspaceBuilder Hook
 * 
 * A hook for interacting with the AI Workspace Builder API.
 * Can be used standalone or integrated with other components.
 */

import { useState, useCallback } from 'react';
import { useWorkspace } from '@/components/workspace';

export interface WorkspacePreview {
  name: string;
  icon: string;
  tools: string[];
  gradient?: string;
  description?: string;
  matchedTemplate?: string;
}

interface WorkspaceBuilderState {
  isLoading: boolean;
  error: string | null;
  lastResponse: string | null;
  previews: WorkspacePreview[];
  suggestions: string[];
}

interface UseWorkspaceBuilderReturn extends WorkspaceBuilderState {
  buildWorkspace: (message: string) => Promise<void>;
  createFromPreview: (preview: WorkspacePreview) => Promise<void>;
  reset: () => void;
}

export function useWorkspaceBuilder(): UseWorkspaceBuilderReturn {
  const [state, setState] = useState<WorkspaceBuilderState>({
    isLoading: false,
    error: null,
    lastResponse: null,
    previews: [],
    suggestions: [],
  });

  const { createWorkspace, addToolToWorkspace, workspaces } = useWorkspace();

  /**
   * Send a message to the AI Workspace Builder
   */
  const buildWorkspace = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      // Prepare existing workspaces for context
      const existingWorkspaces = workspaces.map(w => ({
        id: w.id,
        name: w.name,
        tools: w.tools.map(t => t.toolKey),
      }));

      const response = await fetch('/api/assistant/workspace-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          existingWorkspaces,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: data.response,
        previews: data.previews || (data.preview ? [data.preview] : []),
        suggestions: data.suggestions || [],
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [workspaces]);

  /**
   * Create a workspace from a preview
   */
  const createFromPreview = useCallback(async (preview: WorkspacePreview) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create the workspace
      const workspace = await createWorkspace(preview.name, preview.icon);

      // Add all tools
      for (const toolKey of preview.tools) {
        await addToolToWorkspace(workspace.id, toolKey);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: `Created "${preview.name}" workspace with ${preview.tools.length} tools!`,
        previews: [],
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workspace';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [createWorkspace, addToolToWorkspace]);

  /**
   * Reset the builder state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastResponse: null,
      previews: [],
      suggestions: [],
    });
  }, []);

  return {
    ...state,
    buildWorkspace,
    createFromPreview,
    reset,
  };
}

