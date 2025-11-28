'use client';

import {
  Plus,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  GripVertical,
  Home,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import { useState } from 'react';

interface SitePage {
  id: string;
  slug: string;
  title: string;
  isHomepage: boolean;
  isVisible: boolean;
  order: number;
  sectionCount?: number;
}

interface PageManagerProps {
  pages: SitePage[];
  onPageAdd: (page: Omit<SitePage, 'id' | 'sectionCount'>) => Promise<void>;
  onPageUpdate: (pageId: string, updates: Partial<SitePage>) => Promise<void>;
  onPageDelete: (pageId: string) => Promise<void>;
  onPageReorder: (pages: SitePage[]) => Promise<void>;
}

export function PageManager({
  pages,
  onPageAdd,
  onPageUpdate,
  onPageDelete,
  onPageReorder,
}: PageManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // New page form state
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddPage = async () => {
    if (!newPageTitle.trim()) return;

    setIsCreating(true);
    try {
      const slug =
        newPageSlug.trim() ||
        newPageTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      await onPageAdd({
        slug,
        title: newPageTitle.trim(),
        isHomepage: false,
        isVisible: true,
        order: pages.length,
      });

      setNewPageTitle('');
      setNewPageSlug('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add page:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (page: SitePage) => {
    setEditingId(page.id);
    setEditTitle(page.title);
    setEditSlug(page.slug);
  };

  const handleSaveEdit = async (pageId: string) => {
    setIsUpdating(true);
    try {
      await onPageUpdate(pageId, {
        title: editTitle,
        slug: editSlug,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update page:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditSlug('');
  };

  const handleDeletePage = async (page: SitePage) => {
    if (page.isHomepage) {
      alert('Cannot delete the homepage');
      return;
    }

    if (!confirm(`Delete "${page.title}"? This will also delete all sections on this page.`)) {
      return;
    }

    try {
      await onPageDelete(page.id);
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, page: SitePage) => {
    setDraggedId(page.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, page: SitePage) => {
    e.preventDefault();
    if (!draggedId || draggedId === page.id) return;

    const draggedIndex = pages.findIndex((p) => p.id === draggedId);
    const targetIndex = pages.findIndex((p) => p.id === page.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPages = [...pages];
    const [removed] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, removed);

    // Update order
    const reorderedPages = newPages.map((p, i) => ({ ...p, order: i }));
    onPageReorder(reorderedPages);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Pages
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Manage your website pages
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all hover:scale-[1.02]"
          style={{
            background: 'var(--accent)',
            color: '#fff',
          }}
        >
          <Plus size={18} />
          Add Page
        </button>
      </div>

      {/* Pages List */}
      <div className="space-y-2">
        {sortedPages.map((page) => (
          <div
            key={page.id}
            draggable={!page.isHomepage}
            onDragStart={(e) => handleDragStart(e, page)}
            onDragOver={(e) => handleDragOver(e, page)}
            onDragEnd={handleDragEnd}
            className={`group rounded-xl p-4 transition-all ${
              draggedId === page.id ? 'opacity-50' : ''
            } ${page.isHomepage ? '' : 'cursor-move'}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
            }}
          >
            {editingId === page.id ? (
              // Edit Mode
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="edit-title"
                    className="mb-1 block text-sm"
                    style={{ color: 'var(--muted)' }}
                  >
                    Page Title
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg px-3 py-2"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-slug"
                    className="mb-1 block text-sm"
                    style={{ color: 'var(--muted)' }}
                  >
                    URL Slug
                  </label>
                  <input
                    id="edit-slug"
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 font-mono text-sm"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                    disabled={page.isHomepage}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(page.id)}
                    disabled={isUpdating}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
                    style={{
                      background: 'var(--accent)',
                      color: '#fff',
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="rounded-lg px-4 py-2 transition-colors hover:bg-white/5"
                    style={{ color: 'var(--muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                {!page.isHomepage && (
                  <div
                    className="flex-shrink-0 cursor-move opacity-40 transition-opacity group-hover:opacity-100"
                    style={{ color: 'var(--muted)' }}
                  >
                    <GripVertical size={20} />
                  </div>
                )}

                {/* Page Icon */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: page.isHomepage ? 'var(--accent)' + '20' : 'var(--bg)',
                    color: page.isHomepage ? 'var(--accent)' : 'var(--muted)',
                  }}
                >
                  {page.isHomepage ? <Home size={20} /> : <FileText size={20} />}
                </div>

                {/* Page Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold" style={{ color: 'var(--text)' }}>
                      {page.title}
                    </h4>
                    {page.isHomepage && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        Home
                      </span>
                    )}
                    {!page.isVisible && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: 'var(--border)', color: 'var(--muted)' }}
                      >
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm" style={{ color: 'var(--muted)' }}>
                    /{page.slug}
                    {page.sectionCount !== undefined && ` • ${page.sectionCount} sections`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onPageUpdate(page.id, { isVisible: !page.isVisible })}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    style={{ color: page.isVisible ? 'var(--accent)' : 'var(--muted)' }}
                    title={page.isVisible ? 'Hide page' : 'Show page'}
                  >
                    {page.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  <button
                    onClick={() => handleStartEdit(page)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    style={{ color: 'var(--accent)' }}
                    title="Edit page"
                  >
                    <Edit2 size={18} />
                  </button>

                  {!page.isHomepage && (
                    <button
                      onClick={() => handleDeletePage(page)}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
                      title="Delete page"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Page Form */}
      {isAdding && (
        <div
          className="rounded-xl p-6"
          style={{
            background: 'var(--panel)',
            border: '2px solid var(--accent)',
          }}
        >
          <h4 className="mb-4 font-semibold" style={{ color: 'var(--text)' }}>
            Create New Page
          </h4>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="new-page-title"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                Page Title *
              </label>
              <input
                id="new-page-title"
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="e.g., About, Tour, Music"
                className="w-full rounded-lg px-4 py-2"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="new-page-slug"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                URL Slug (optional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  /
                </span>
                <input
                  id="new-page-slug"
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="auto-generated from title"
                  className="flex-1 rounded-lg px-4 py-2 font-mono text-sm"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                Leave blank to auto-generate from title
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddPage}
                disabled={!newPageTitle.trim() || isCreating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Page
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewPageTitle('');
                  setNewPageSlug('');
                }}
                disabled={isCreating}
                className="rounded-lg px-4 py-3 font-medium transition-colors hover:bg-white/5"
                style={{
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedPages.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-xl py-12"
          style={{ background: 'var(--panel)', border: '2px dashed var(--border)' }}
        >
          <FileText size={48} style={{ color: 'var(--muted)' }} />
          <p className="mt-4 text-lg font-medium" style={{ color: 'var(--text)' }}>
            No pages yet
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Create your first page to get started
          </p>
        </div>
      )}
    </div>
  );
}
