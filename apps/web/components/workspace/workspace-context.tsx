'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { DEFAULT_WORKSPACE_TOOLS, getToolByKey, type ToolDefinition } from './tool-catalog';

// Types matching the Prisma schema
export interface WorkspaceTool {
  id: string;
  workspaceId: string;
  toolKey: string;
  order: number;
  size: 'compact' | 'normal' | 'large';
}

export interface Workspace {
  id: string;
  userId: string;
  name: string;
  icon: string;
  order: number;
  isDefault: boolean;
  tools: WorkspaceTool[];
  // Custom image personalization
  headerImage?: string;    // URL for header/banner image
  backgroundColor?: string; // Custom background color or gradient
  accentColor?: string;     // Custom accent color for this workspace
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  colorScheme: string;
  compactMode: boolean;
  showWelcome: boolean;
  editModeHintSeen: boolean;
}

interface WorkspaceContextValue {
  // State
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setActiveWorkspace: (id: string) => void;
  toggleEditMode: () => void;
  exitEditMode: () => void;

  // Workspace CRUD
  createWorkspace: (name: string, icon?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  reorderWorkspaces: (workspaceIds: string[]) => Promise<void>;

  // Tool management
  addToolToWorkspace: (workspaceId: string, toolKey: string) => Promise<void>;
  removeToolFromWorkspace: (workspaceId: string, toolKey: string) => Promise<void>;
  reorderTools: (workspaceId: string, toolIds: string[]) => Promise<void>;
  updateToolSize: (toolId: string, size: 'compact' | 'normal' | 'large') => Promise<void>;

  // Workspace customization
  updateWorkspaceImage: (workspaceId: string, imageUrl: string | null) => Promise<void>;
  updateWorkspaceColors: (workspaceId: string, colors: { backgroundColor?: string; accentColor?: string }) => Promise<void>;

  // Preferences
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;

  // Reset
  resetToDefaults: () => Promise<void>;

  // Helpers
  getToolDefinitions: (workspace: Workspace) => ToolDefinition[];
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

// Create a default workspace with default tools
function createDefaultWorkspace(userId: string): Workspace {
  return {
    id: 'default',
    userId,
    name: 'Home',
    icon: 'home',
    order: 0,
    isDefault: true,
    tools: DEFAULT_WORKSPACE_TOOLS.map((toolKey, index) => ({
      id: `default-${toolKey}`,
      workspaceId: 'default',
      toolKey,
      order: index,
      size: 'normal' as const,
    })),
  };
}

function createDefaultPreferences(userId: string): UserPreferences {
  return {
    id: 'default',
    userId,
    theme: 'system',
    accentColor: 'default',
    colorScheme: 'midnight',
    compactMode: false,
    showWelcome: true,
    editModeHintSeen: false,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Derived state
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;

  // Load workspaces and preferences from API
  useEffect(() => {
    async function loadWorkspaceData() {
      if (status === 'loading') return;

      if (!userId) {
        // Not logged in - use defaults from localStorage or create new
        const stored = localStorage.getItem('workspace-data');
        if (stored) {
          try {
            const data = JSON.parse(stored);
            setWorkspaces(data.workspaces || [createDefaultWorkspace('guest')]);
            setPreferences(data.preferences || createDefaultPreferences('guest'));
            setActiveWorkspaceId(data.activeWorkspaceId || data.workspaces?.[0]?.id || 'default');
          } catch {
            setWorkspaces([createDefaultWorkspace('guest')]);
            setPreferences(createDefaultPreferences('guest'));
            setActiveWorkspaceId('default');
          }
        } else {
          setWorkspaces([createDefaultWorkspace('guest')]);
          setPreferences(createDefaultPreferences('guest'));
          setActiveWorkspaceId('default');
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/workspaces');
        if (response.ok) {
          const data = await response.json();
          if (data.workspaces && data.workspaces.length > 0) {
            setWorkspaces(data.workspaces);
            setPreferences(data.preferences || createDefaultPreferences(userId));
            setActiveWorkspaceId(data.workspaces[0].id);
          } else {
            // No workspaces yet - create default
            const defaultWorkspace = createDefaultWorkspace(userId);
            setWorkspaces([defaultWorkspace]);
            setPreferences(createDefaultPreferences(userId));
            setActiveWorkspaceId(defaultWorkspace.id);
            // Save to API
            await fetch('/api/workspaces', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workspace: defaultWorkspace }),
            });
          }
        } else {
          // API error - use defaults
          setWorkspaces([createDefaultWorkspace(userId)]);
          setPreferences(createDefaultPreferences(userId));
          setActiveWorkspaceId('default');
        }
      } catch (error) {
        console.error('Failed to load workspaces:', error);
        setWorkspaces([createDefaultWorkspace(userId)]);
        setPreferences(createDefaultPreferences(userId));
        setActiveWorkspaceId('default');
      }

      setIsLoading(false);
    }

    loadWorkspaceData();
  }, [userId, status]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!userId && workspaces.length > 0) {
      localStorage.setItem(
        'workspace-data',
        JSON.stringify({ workspaces, preferences, activeWorkspaceId })
      );
    }
  }, [workspaces, preferences, activeWorkspaceId, userId]);

  // Actions
  const setActiveWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  }, []);

  const createWorkspace = useCallback(
    async (name: string, icon = 'layout'): Promise<Workspace> => {
      const newWorkspace: Workspace = {
        id: `ws-${Date.now()}`,
        userId: userId || 'guest',
        name,
        icon,
        order: workspaces.length,
        isDefault: false,
        tools: [],
      };

      setWorkspaces((prev) => [...prev, newWorkspace]);
      setActiveWorkspaceId(newWorkspace.id);

      if (userId) {
        try {
          const response = await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspace: newWorkspace }),
          });
          if (response.ok) {
            const { workspace } = await response.json();
            // Update with server-generated ID
            setWorkspaces((prev) =>
              prev.map((w) => (w.id === newWorkspace.id ? { ...w, ...workspace } : w))
            );
            return workspace;
          }
        } catch (error) {
          console.error('Failed to create workspace:', error);
        }
      }

      return newWorkspace;
    },
    [workspaces.length, userId]
  );

  const updateWorkspace = useCallback(
    async (id: string, updates: Partial<Workspace>) => {
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
      setHasUnsavedChanges(true);

      if (userId) {
        try {
          await fetch(`/api/workspaces/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error('Failed to update workspace:', error);
        }
      }
    },
    [userId]
  );

  const deleteWorkspace = useCallback(
    async (id: string) => {
      const workspace = workspaces.find((w) => w.id === id);
      if (workspace?.isDefault) {
        console.warn('Cannot delete default workspace');
        return;
      }

      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (activeWorkspaceId === id) {
        const remaining = workspaces.filter((w) => w.id !== id);
        setActiveWorkspaceId(remaining[0]?.id || null);
      }

      if (userId) {
        try {
          await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
        } catch (error) {
          console.error('Failed to delete workspace:', error);
        }
      }
    },
    [workspaces, activeWorkspaceId, userId]
  );

  const reorderWorkspaces = useCallback(
    async (workspaceIds: string[]) => {
      setWorkspaces((prev) => {
        const reordered = workspaceIds
          .map((id, index) => {
            const ws = prev.find((w) => w.id === id);
            return ws ? { ...ws, order: index } : null;
          })
          .filter(Boolean) as Workspace[];
        return reordered;
      });

      if (userId) {
        try {
          await fetch('/api/workspaces/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceIds }),
          });
        } catch (error) {
          console.error('Failed to reorder workspaces:', error);
        }
      }
    },
    [userId]
  );

  const addToolToWorkspace = useCallback(
    async (workspaceId: string, toolKey: string) => {
      setWorkspaces((prev) =>
        prev.map((ws) => {
          if (ws.id !== workspaceId) return ws;
          // Don't add duplicates
          if (ws.tools.some((t) => t.toolKey === toolKey)) return ws;
          const newTool: WorkspaceTool = {
            id: `tool-${Date.now()}-${toolKey}`,
            workspaceId,
            toolKey,
            order: ws.tools.length,
            size: 'normal',
          };
          return { ...ws, tools: [...ws.tools, newTool] };
        })
      );
      setHasUnsavedChanges(true);

      if (userId) {
        try {
          await fetch(`/api/workspaces/${workspaceId}/tools`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toolKey }),
          });
        } catch (error) {
          console.error('Failed to add tool:', error);
        }
      }
    },
    [userId]
  );

  const removeToolFromWorkspace = useCallback(
    async (workspaceId: string, toolKey: string) => {
      setWorkspaces((prev) =>
        prev.map((ws) => {
          if (ws.id !== workspaceId) return ws;
          return { ...ws, tools: ws.tools.filter((t) => t.toolKey !== toolKey) };
        })
      );
      setHasUnsavedChanges(true);

      if (userId) {
        try {
          await fetch(`/api/workspaces/${workspaceId}/tools/${toolKey}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Failed to remove tool:', error);
        }
      }
    },
    [userId]
  );

  const reorderTools = useCallback(
    async (workspaceId: string, toolIds: string[]) => {
      setWorkspaces((prev) =>
        prev.map((ws) => {
          if (ws.id !== workspaceId) return ws;
          const reorderedTools = toolIds
            .map((id, index) => {
              const tool = ws.tools.find((t) => t.id === id);
              return tool ? { ...tool, order: index } : null;
            })
            .filter(Boolean) as WorkspaceTool[];
          return { ...ws, tools: reorderedTools };
        })
      );
      setHasUnsavedChanges(true);

      if (userId) {
        try {
          await fetch(`/api/workspaces/${workspaceId}/tools/reorder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toolIds }),
          });
        } catch (error) {
          console.error('Failed to reorder tools:', error);
        }
      }
    },
    [userId]
  );

  const updateToolSize = useCallback(
    async (toolId: string, size: 'compact' | 'normal' | 'large') => {
      setWorkspaces((prev) =>
        prev.map((ws) => ({
          ...ws,
          tools: ws.tools.map((t) => (t.id === toolId ? { ...t, size } : t)),
        }))
      );

      if (userId) {
        try {
          await fetch(`/api/workspaces/tools/${toolId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ size }),
          });
        } catch (error) {
          console.error('Failed to update tool size:', error);
        }
      }
    },
    [userId]
  );

  const updateWorkspaceImage = useCallback(
    async (workspaceId: string, imageUrl: string | null) => {
      setWorkspaces((prev) =>
        prev.map((ws) => (ws.id === workspaceId ? { ...ws, headerImage: imageUrl || undefined } : ws))
      );
      setHasUnsavedChanges(true);

      if (userId) {
        try {
          await fetch(`/api/workspaces/${workspaceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ headerImage: imageUrl }),
          });
        } catch (error) {
          console.error('Failed to update workspace image:', error);
        }
      }
    },
    [userId]
  );

  const updateWorkspaceColors = useCallback(
    async (workspaceId: string, colors: { backgroundColor?: string; accentColor?: string }) => {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === workspaceId
            ? { ...ws, backgroundColor: colors.backgroundColor, accentColor: colors.accentColor }
            : ws
        )
      );
      setHasUnsavedChanges(true);

      if (userId) {
        try {
          await fetch(`/api/workspaces/${workspaceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(colors),
          });
        } catch (error) {
          console.error('Failed to update workspace colors:', error);
        }
      }
    },
    [userId]
  );

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      setPreferences((prev) => (prev ? { ...prev, ...updates } : null));

      if (userId) {
        try {
          await fetch('/api/workspaces/preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error('Failed to update preferences:', error);
        }
      }
    },
    [userId]
  );

  const resetToDefaults = useCallback(async () => {
    const defaultWorkspace = createDefaultWorkspace(userId || 'guest');
    const defaultPrefs = createDefaultPreferences(userId || 'guest');

    setWorkspaces([defaultWorkspace]);
    setPreferences(defaultPrefs);
    setActiveWorkspaceId(defaultWorkspace.id);
    setIsEditMode(false);
    setHasUnsavedChanges(false);

    if (userId) {
      try {
        await fetch('/api/workspaces/reset', { method: 'POST' });
      } catch (error) {
        console.error('Failed to reset workspaces:', error);
      }
    }
  }, [userId]);

  const getToolDefinitions = useCallback((workspace: Workspace): ToolDefinition[] => {
    return workspace.tools
      .sort((a, b) => a.order - b.order)
      .map((tool) => getToolByKey(tool.toolKey))
      .filter(Boolean) as ToolDefinition[];
  }, []);

  const value: WorkspaceContextValue = {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    preferences,
    isLoading,
    isEditMode,
    hasUnsavedChanges,
    setActiveWorkspace,
    toggleEditMode,
    exitEditMode,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    reorderWorkspaces,
    addToolToWorkspace,
    removeToolFromWorkspace,
    reorderTools,
    updateToolSize,
    updateWorkspaceImage,
    updateWorkspaceColors,
    updatePreferences,
    resetToDefaults,
    getToolDefinitions,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
