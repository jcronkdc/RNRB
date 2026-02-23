'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkspace } from './workspace-context';
import {
  Plus,
  Home,
  Music4,
  Users,
  Calendar,
  Briefcase,
  Radio,
  Mic2,
  LayoutDashboard,
  Edit2,
  X,
  Check,
  GripVertical,
} from '@/components/ui/custom-icons';

// Icon mapping for workspace tabs
const WORKSPACE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  layout: LayoutDashboard,
  music: Music4,
  collab: Users,
  calendar: Calendar,
  business: Briefcase,
  live: Radio,
  studio: Mic2,
};

interface WorkspaceTabsProps {
  onCreateWorkspace: () => void;
}

export function WorkspaceTabs({ onCreateWorkspace }: WorkspaceTabsProps) {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    isEditMode,
    toggleEditMode,
    exitEditMode,
    deleteWorkspace,
    updateWorkspace,
  } = useWorkspace();

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleTabClick = (id: string) => {
    if (editingTabId) return;
    setActiveWorkspace(id);
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingTabId(id);
    setEditingName(currentName);
  };

  const handleSaveRename = () => {
    if (editingTabId && editingName.trim()) {
      updateWorkspace(editingTabId, { name: editingName.trim() });
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  const handleDeleteTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace?.isDefault) return;

    if (confirm(`Delete "${workspace?.name}" workspace? This cannot be undone.`)) {
      deleteWorkspace(id);
    }
  };

  return (
    <div className="relative">
      {/* Tab Container */}
      <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto pb-2">
        <AnimatePresence mode="popLayout">
          {workspaces
            .sort((a, b) => a.order - b.order)
            .map((workspace) => {
              const IconComponent = WORKSPACE_ICONS[workspace.icon] || LayoutDashboard;
              const isActive = workspace.id === activeWorkspaceId;
              const isEditing = editingTabId === workspace.id;

              return (
                <motion.div
                  key={workspace.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="relative shrink-0"
                >
                  <button
                    onClick={() => handleTabClick(workspace.id)}
                    onDoubleClick={() =>
                      !workspace.isDefault && handleStartRename(workspace.id, workspace.name)
                    }
                    className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-(--accent-glow) text-(--accent)'
                        : 'text-(--muted) hover:bg-(--panel-hover) hover:text-(--text)'
                    } ${isEditMode && !workspace.isDefault ? 'pr-8' : ''} `}
                  >
                    {/* Drag handle in edit mode */}
                    {isEditMode && (
                      <GripVertical className="h-3 w-3 cursor-grab opacity-50 hover:opacity-100" />
                    )}

                    {/* Icon */}
                    <IconComponent className="h-4 w-4" />

                    {/* Tab name (editable) */}
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          autoFocus
                          className="w-24 bg-transparent text-sm font-medium outline-hidden"
                          style={{ color: 'var(--text)' }}
                        />
                        <button
                          onClick={handleSaveRename}
                          className="rounded p-0.5 hover:bg-(--panel-hover)"
                        >
                          <Check className="h-3 w-3 text-green-500" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="rounded p-0.5 hover:bg-(--panel-hover)"
                        >
                          <X className="h-3 w-3 text-(--muted)" />
                        </button>
                      </div>
                    ) : (
                      <span className="whitespace-nowrap text-sm font-medium">
                        {workspace.name}
                      </span>
                    )}

                    {/* Active indicator */}
                    {isActive && !isEditMode && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{ background: 'var(--accent)' }}
                      />
                    )}
                  </button>

                  {/* Delete button (shows on hover) */}
                  {!workspace.isDefault && (
                    <button
                      onClick={(e) => handleDeleteTab(workspace.id, e)}
                      className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                      title="Delete tab"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* Add Workspace Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateWorkspace}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-dashed transition-all hover:border-(--accent) hover:bg-(--accent-glow)"
          style={{ borderColor: 'var(--border)' }}
        >
          <Plus className="h-4 w-4" style={{ color: 'var(--muted)' }} />
        </motion.button>

        {/* Edit Mode Toggle */}
        <div
          className="ml-2 flex items-center gap-2 border-l pl-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={isEditMode ? exitEditMode : toggleEditMode}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              isEditMode
                ? 'bg-(--accent) text-white'
                : 'text-(--muted) hover:bg-(--panel-hover) hover:text-(--text)'
            } `}
          >
            <Edit2 className="h-3.5 w-3.5" />
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Edit Mode Hint */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-xs"
            style={{ color: 'var(--muted)' }}
          >
            <span>Drag to reorder</span>
            <span>•</span>
            <span>Double-click to rename</span>
            <span>•</span>
            <span>Click Done when finished</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
