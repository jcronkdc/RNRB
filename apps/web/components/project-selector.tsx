import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Folder, Plus, ExternalLink } from '@/components/ui/custom-icons';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

import { useProjects, useProjectSongActions } from '@/hooks/use-projects';

interface ProjectSelectorProps {
  songId: string | undefined;
  onProjectAdded?: (projectSlug: string) => void;
  className?: string;
  allowNavigation?: boolean; // New prop to enable "View Project" links
}

/**
 * Project Selector Component
 * Allows users to save songs to projects from anywhere in the app
 * Now with optional navigation to project pages
 */
export function ProjectSelector({
  songId,
  onProjectAdded,
  className = '',
  allowNavigation = true,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { projects, isLoading, error: projectsError } = useProjects();
  const { addSongToProject, isAdding, error: addError } = useProjectSongActions();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToProject = async (projectSlug: string) => {
    if (!songId) {
      alert('Please save your song first before adding it to a project');
      return;
    }

    try {
      await addSongToProject(projectSlug, songId);
      setSelectedProjects((prev) => new Set([...prev, projectSlug]));
      onProjectAdded?.(projectSlug);
    } catch (err) {
      console.error('Failed to add song to project:', err);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-500 ${className}`}
      >
        <Folder className="h-4 w-4" />
        <span>Loading projects...</span>
      </button>
    );
  }

  if (projectsError) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 ${className}`}
      >
        <Folder className="h-4 w-4" />
        <span>Error loading projects</span>
      </button>
    );
  }

  if (projects.length === 0) {
    return (
      <a
        href="/projects/new"
        className={`flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-orange-500 hover:bg-zinc-900 hover:text-white ${className}`}
      >
        <Plus className="h-4 w-4" />
        <span>Create First Project</span>
      </a>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!songId || isAdding}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
          songId
            ? 'border-zinc-800 bg-zinc-900/50 text-white hover:border-orange-500 hover:bg-zinc-900'
            : 'cursor-not-allowed border-zinc-800/50 bg-zinc-900/30 text-zinc-600'
        }`}
      >
        <Folder className="h-4 w-4" />
        <span>
          {selectedProjects.size > 0 ? `In ${selectedProjects.size} project(s)` : 'Add to Project'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          >
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="mb-2 border-b border-zinc-800 pb-2">
                <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Your Projects
                </p>
              </div>

              {projects.map((project) => {
                const isSelected = selectedProjects.has(project.slug);

                return (
                  <div key={project.id} className="group relative">
                    <button
                      onClick={() => handleAddToProject(project.slug)}
                      disabled={isSelected || isAdding}
                      className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                        isSelected
                          ? 'bg-orange-500/10 text-orange-400'
                          : 'text-white hover:bg-zinc-800'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                        {project.cover_image ? (
                          <img
                            src={project.cover_image}
                            alt={project.name}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <Folder className="h-5 w-5 text-zinc-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{project.name}</p>
                        <p className="truncate text-xs text-zinc-500">
                          {project.song_count} song{project.song_count !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {isSelected && <Check className="h-4 w-4 shrink-0 text-orange-500" />}
                    </button>

                    {/* View Project Link - appears on hover */}
                    {allowNavigation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${project.slug}`);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-800/90 p-1.5 opacity-0 transition-opacity hover:bg-zinc-700 group-hover:opacity-100"
                        title="View Project"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="mt-2 border-t border-zinc-800 pt-2">
                <a
                  href="/projects/new"
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Project</span>
                </a>
              </div>
            </div>

            {addError && (
              <div className="border-t border-zinc-800 bg-red-500/10 p-3">
                <p className="text-xs text-red-400">{addError}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
