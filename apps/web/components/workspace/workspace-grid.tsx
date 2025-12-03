'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Link from 'next/link';
import { useWorkspace } from './workspace-context';
import { getToolByKey, type ToolDefinition } from './tool-catalog';
import { ChevronRight, X, Plus, GripVertical, Sparkles } from '@/components/ui/custom-icons';

interface WorkspaceGridProps {
  onOpenCatalog: () => void;
}

export function WorkspaceGrid({ onOpenCatalog }: WorkspaceGridProps) {
  const { activeWorkspace, isEditMode, removeToolFromWorkspace, reorderTools } = useWorkspace();

  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Get tool definitions with their workspace tool data
  const tools = activeWorkspace?.tools
    .sort((a, b) => a.order - b.order)
    .map((workspaceTool) => {
      const definition = getToolByKey(workspaceTool.toolKey);
      return definition ? { ...workspaceTool, definition } : null;
    })
    .filter(Boolean) as Array<{
    id: string;
    workspaceId: string;
    toolKey: string;
    order: number;
    size: string;
    definition: ToolDefinition;
  }>;

  // Handle reorder via drag and drop
  const handleReorder = useCallback(
    (newOrder: typeof tools) => {
      if (!activeWorkspace) return;
      const toolIds = newOrder.map((t) => t.id);
      reorderTools(activeWorkspace.id, toolIds);
    },
    [activeWorkspace, reorderTools]
  );

  // Handle removing a tool
  const handleRemoveTool = (toolKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeWorkspace) return;
    removeToolFromWorkspace(activeWorkspace.id, toolKey);
  };

  if (!activeWorkspace) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: 'var(--muted)' }}>No workspace selected</p>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-12 text-center"
      >
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ background: 'var(--accent-glow)' }}
        >
          <Plus className="h-10 w-10" style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
          This workspace is empty
        </h3>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
          Add some tools to get started
        </p>
        <button
          onClick={onOpenCatalog}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-[1.02]"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <Plus className="h-4 w-4" />
          Add Tools
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Edit Mode Add Button */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <GripVertical className="h-4 w-4" />
              <span>Drag tools to reorder</span>
            </div>
            <button
              onClick={onOpenCatalog}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <Plus className="h-4 w-4" />
              Add Tool
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool Grid */}
      {isEditMode ? (
        <Reorder.Group
          axis="y"
          values={tools}
          onReorder={handleReorder}
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
          style={{ listStyle: 'none' }}
        >
          {tools.map((tool) => (
            <Reorder.Item
              key={tool.id}
              value={tool}
              onDragStart={() => setDraggedId(tool.id)}
              onDragEnd={() => setDraggedId(null)}
              className="relative"
            >
              <ToolCard
                tool={tool.definition}
                isEditMode={true}
                isDragging={draggedId === tool.id}
                onRemove={(e) => handleRemoveTool(tool.toolKey, e)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <ToolCard tool={tool.definition} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Add More Tools Button (normal mode) */}
      {!isEditMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <button
            onClick={onOpenCatalog}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed px-4 py-2 text-sm font-medium transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            <Plus className="h-4 w-4" />
            Add more tools
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Individual tool card
function ToolCard({
  tool,
  isEditMode = false,
  isDragging = false,
  onRemove,
}: {
  tool: ToolDefinition;
  isEditMode?: boolean;
  isDragging?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
}) {
  const content = (
    <div
      className={`group relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all ${
        isEditMode
          ? isDragging
            ? 'scale-105 shadow-xl ring-2 ring-[var(--accent)]'
            : 'cursor-grab hover:bg-[var(--panel-hover)]'
          : 'hover:bg-[var(--panel-hover)]'
      }`}
      style={{ background: isDragging ? 'var(--panel)' : undefined }}
    >
      {/* Drag handle in edit mode */}
      {isEditMode && (
        <div className="absolute left-1 top-1 opacity-50">
          <GripVertical className="h-3 w-3" style={{ color: 'var(--muted)' }} />
        </div>
      )}

      {/* Remove button in edit mode */}
      {isEditMode && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Icon */}
      <div
        className="rounded-lg p-2 transition-transform group-hover:scale-110"
        style={{ background: 'var(--surface)' }}
      >
        <tool.icon className="h-4 w-4 transition-colors" style={{ color: tool.color }} />
      </div>

      {/* Label */}
      <span className="text-center text-xs font-medium" style={{ color: 'var(--text)' }}>
        {tool.label}
      </span>

      {/* Hover arrow (normal mode only) */}
      {!isEditMode && (
        <ChevronRight
          className="absolute bottom-1 right-1 h-3 w-3 opacity-0 transition-all group-hover:opacity-100"
          style={{ color: 'var(--accent)' }}
        />
      )}
    </div>
  );

  // In edit mode, don't wrap in Link
  if (isEditMode) {
    return content;
  }

  return <Link href={tool.href}>{content}</Link>;
}
