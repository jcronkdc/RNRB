'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from './workspace-context';
import { useSession } from 'next-auth/react';
import {
  TOOL_CATALOG,
  TOOL_CATEGORIES,
  getSuggestedToolsForWorkspace,
  type ToolDefinition,
} from './tool-catalog';
import { X, Check, Plus, Sparkles, Search, Loader2 } from '@/components/ui/custom-icons';

interface ToolCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

export function ToolCatalogModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: ToolCatalogModalProps) {
  const { data: session } = useSession();
  const { activeWorkspace, addToolToWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);

  // Get existing tool keys in the workspace
  const existingToolKeys = useMemo(() => {
    return new Set(activeWorkspace?.tools.map((t) => t.toolKey) || []);
  }, [activeWorkspace?.tools]);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return TOOL_CATALOG.filter((tool) => {
      // Filter out already added tools
      if (existingToolKeys.has(tool.key)) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tool.label.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.key.toLowerCase().includes(query)
        );
      }

      // Category filter
      if (selectedCategory) {
        return tool.category === selectedCategory;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, existingToolKeys]);

  // Get AI suggestions based on workspace name
  const handleGetSuggestions = async () => {
    // Check if user has paid subscription for AI features
    const isPaidUser =
      session?.user && (session.user as { subscriptionTier?: string }).subscriptionTier !== 'free';

    if (!isPaidUser) {
      // Use basic keyword matching for free users
      const suggestions = getSuggestedToolsForWorkspace(workspaceName);
      setAiSuggestions(suggestions.filter((key) => !existingToolKeys.has(key)));
      return;
    }

    // For paid users, use AI assistant
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/assistant/workspace-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName,
          existingTools: Array.from(existingToolKeys),
          availableTools: TOOL_CATALOG.map((t) => ({
            key: t.key,
            label: t.label,
            description: t.description,
          })),
        }),
      });

      if (response.ok) {
        const { suggestions } = await response.json();
        setAiSuggestions(suggestions.filter((key: string) => !existingToolKeys.has(key)));
      } else {
        // Fallback to basic suggestions
        const suggestions = getSuggestedToolsForWorkspace(workspaceName);
        setAiSuggestions(suggestions.filter((key) => !existingToolKeys.has(key)));
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      const suggestions = getSuggestedToolsForWorkspace(workspaceName);
      setAiSuggestions(suggestions.filter((key) => !existingToolKeys.has(key)));
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAddTool = (toolKey: string) => {
    addToolToWorkspace(workspaceId, toolKey);
  };

  const handleAddAllSuggested = () => {
    if (aiSuggestions) {
      aiSuggestions.forEach((key) => {
        if (!existingToolKeys.has(key)) {
          addToolToWorkspace(workspaceId, key);
        }
      });
      setAiSuggestions(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl"
          style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                Add Tools
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Choose tools to add to "{workspaceName}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-(--panel-hover)"
            >
              <X className="h-5 w-5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Search and AI Suggestions */}
          <div className="border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
            {/* Search */}
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-hidden transition-colors focus:border-(--accent)"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {/* AI Suggestions Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGetSuggestions}
                disabled={isLoadingAI}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                  color: 'white',
                }}
              >
                {isLoadingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoadingAI ? 'Thinking...' : 'Get ideas for this workspace'}
              </button>
              {aiSuggestions && aiSuggestions.length > 0 && (
                <button
                  onClick={handleAddAllSuggested}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Add all ({aiSuggestions.length})
                </button>
              )}
            </div>

            {/* AI Suggestions Display */}
            <AnimatePresence>
              {aiSuggestions && aiSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden rounded-xl border p-4"
                  style={{ background: 'var(--accent-glow)', borderColor: 'var(--accent)' }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Suggested for "{workspaceName}"
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((key) => {
                      const tool = TOOL_CATALOG.find((t) => t.key === key);
                      if (!tool || existingToolKeys.has(key)) return null;
                      return (
                        <button
                          key={key}
                          onClick={() => handleAddTool(key)}
                          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all hover:border-(--accent)"
                          style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
                        >
                          <tool.icon className="h-3.5 w-3.5" style={{ color: tool.color }} />
                          <span style={{ color: 'var(--text)' }}>{tool.label}</span>
                          <Plus className="h-3 w-3" style={{ color: 'var(--muted)' }} />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Tabs */}
          <div
            className="scrollbar-hide flex gap-2 overflow-x-auto border-b px-6 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-(--accent) text-white'
                  : 'text-(--muted) hover:bg-(--panel-hover)'
              }`}
            >
              All
            </button>
            {Object.entries(TOOL_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-(--accent) text-white'
                    : 'text-(--muted) hover:bg-(--panel-hover)'
                }`}
              >
                <category.icon className="h-3.5 w-3.5" />
                {category.label}
              </button>
            ))}
          </div>

          {/* Tool Grid */}
          <div className="max-h-[45vh] overflow-y-auto p-6">
            {filteredTools.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {searchQuery
                    ? 'No tools match your search'
                    : 'All tools are already in this workspace'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.key}
                    tool={tool}
                    onAdd={() => handleAddTool(tool.key)}
                    isSuggested={aiSuggestions?.includes(tool.key)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Individual tool card
function ToolCard({
  tool,
  onAdd,
  isSuggested,
}: {
  tool: ToolDefinition;
  onAdd: () => void;
  isSuggested?: boolean;
}) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setIsAdded(true);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAdd}
      disabled={isAdded}
      className={`group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
        isAdded ? 'cursor-default opacity-50' : 'hover:border-(--accent) hover:shadow-lg'
      } ${isSuggested ? 'ring-2 ring-(--accent) ring-offset-2' : ''}`}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Icon */}
      <div
        className="rounded-lg p-2 transition-transform group-hover:scale-110"
        style={{ background: 'var(--panel)' }}
      >
        <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
      </div>

      {/* Label */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {tool.label}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: 'var(--muted)' }}>
          {tool.description}
        </p>
      </div>

      {/* Add indicator */}
      <div
        className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
          isAdded
            ? 'bg-green-500 text-white'
            : 'bg-(--panel) opacity-0 group-hover:opacity-100'
        }`}
      >
        {isAdded ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
        )}
      </div>

      {/* Suggested badge */}
      {isSuggested && !isAdded && (
        <div
          className="absolute -left-1 -top-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <Sparkles className="h-3 w-3" />
          Suggested
        </div>
      )}
    </motion.button>
  );
}
