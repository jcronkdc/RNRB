'use client';

import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  Image,
  Music,
  Calendar,
  User,
  Mail,
  Users,
  Award,
  Share2,
  Layout,
  Video,
  Grid,
  Headphones,
  Send,
} from '@/components/ui/custom-icons';
import { useState, useRef } from 'react';

interface SiteSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  isVisible: boolean;
}

interface DraggableSectionsProps {
  sections: SiteSection[];
  onReorder: (sections: SiteSection[]) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (section: SiteSection) => void;
}

const sectionConfig: Record<
  string,
  { label: string; icon: typeof Image; description: string; color: string }
> = {
  header: {
    label: 'Header',
    icon: Layout,
    description: 'Navigation and logo',
    color: '#6366f1',
  },
  footer: {
    label: 'Footer',
    icon: Layout,
    description: 'Footer links and copyright',
    color: '#6366f1',
  },
  hero_image: {
    label: 'Hero Image',
    icon: Image,
    description: 'Full-width hero with image',
    color: '#ec4899',
  },
  hero_video: {
    label: 'Hero Video',
    icon: Video,
    description: 'Video background hero',
    color: '#ec4899',
  },
  video_hero: {
    label: 'Video Hero',
    icon: Video,
    description: 'YouTube/Vimeo background',
    color: '#dc2626',
  },
  music_player: {
    label: 'Music Player',
    icon: Music,
    description: 'Showcase your tracks',
    color: '#10b981',
  },
  streaming: {
    label: 'Streaming Links',
    icon: Headphones,
    description: 'Spotify, Apple Music & more',
    color: '#1DB954',
  },
  photo_gallery: {
    label: 'Photo Gallery',
    icon: Grid,
    description: 'Image grid with lightbox',
    color: '#a855f7',
  },
  tour_dates: {
    label: 'Tour Dates',
    icon: Calendar,
    description: 'Upcoming shows and events',
    color: '#f59e0b',
  },
  bio_split: {
    label: 'Bio (Split)',
    icon: User,
    description: 'Image + text side by side',
    color: '#8b5cf6',
  },
  bio_full: {
    label: 'Bio (Full)',
    icon: User,
    description: 'Full-width biography',
    color: '#8b5cf6',
  },
  band_members: {
    label: 'Band Members',
    icon: Users,
    description: 'Team/member profiles',
    color: '#06b6d4',
  },
  achievements: {
    label: 'Achievements',
    icon: Award,
    description: 'Awards and milestones',
    color: '#eab308',
  },
  booking: {
    label: 'Booking Form',
    icon: Send,
    description: 'Venue booking requests',
    color: '#f97316',
  },
  contact_form: {
    label: 'Contact Form',
    icon: Mail,
    description: 'Get in touch form',
    color: '#ef4444',
  },
  mailing_list: {
    label: 'Mailing List',
    icon: Mail,
    description: 'Email signup form',
    color: '#3b82f6',
  },
  social_links: {
    label: 'Social Links',
    icon: Share2,
    description: 'Social media buttons',
    color: '#14b8a6',
  },
};

export function DraggableSections({
  sections,
  onReorder,
  onToggleVisibility,
  onDelete,
  onEdit,
}: DraggableSectionsProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, section: SiteSection) => {
    setDraggedId(section.id);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', section.id);

    // Add dragging class after a short delay to allow the drag image to be captured
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = () => {
    if (dragNode.current) {
      dragNode.current.style.opacity = '1';
    }
    setDraggedId(null);
    setDragOverId(null);
    dragNode.current = null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, section: SiteSection) => {
    e.preventDefault();
    if (draggedId && draggedId !== section.id) {
      setDragOverId(section.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSection: SiteSection) => {
    e.preventDefault();

    if (!draggedId || draggedId === targetSection.id) {
      setDragOverId(null);
      return;
    }

    const draggedIndex = sortedSections.findIndex((s) => s.id === draggedId);
    const targetIndex = sortedSections.findIndex((s) => s.id === targetSection.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSections = [...sortedSections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);

    // Update order values
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    onReorder(reorderedSections);
    setDragOverId(null);
  };

  return (
    <div className="space-y-2">
      {sortedSections.map((section) => {
        const config = sectionConfig[section.type] || {
          label: section.type,
          icon: Layout,
          description: '',
          color: '#6b7280',
        };
        const Icon = config.icon;
        const isDragging = draggedId === section.id;
        const isDragOver = dragOverId === section.id;

        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, section)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section)}
            className={`group relative flex items-center gap-3 rounded-xl p-4 transition-all ${
              isDragging ? 'opacity-50' : ''
            } ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--bg)]' : ''}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              cursor: 'grab',
            }}
          >
            {/* Drag Handle */}
            <div
              className="flex-shrink-0 cursor-grab opacity-40 transition-opacity group-hover:opacity-100"
              style={{ color: 'var(--muted)' }}
            >
              <GripVertical size={20} />
            </div>

            {/* Section Icon */}
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${config.color}20`, color: config.color }}
            >
              <Icon size={20} />
            </div>

            {/* Section Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--text)' }}>
                  {config.label}
                </span>
                {!section.isVisible && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ background: 'var(--border)', color: 'var(--muted)' }}
                  >
                    Hidden
                  </span>
                )}
              </div>
              <p className="truncate text-sm" style={{ color: 'var(--muted)' }}>
                {config.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {/* Edit Button */}
              <button
                onClick={() => onEdit(section)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                style={{ color: 'var(--accent)' }}
                title="Edit Section"
              >
                <ChevronRight size={18} />
              </button>

              {/* Toggle Visibility */}
              <button
                onClick={() => onToggleVisibility(section.id)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                style={{ color: section.isVisible ? 'var(--muted)' : 'var(--accent)' }}
                title={section.isVisible ? 'Hide Section' : 'Show Section'}
              >
                {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              {/* Delete Button */}
              <button
                onClick={() => {
                  if (confirm('Delete this section?')) {
                    onDelete(section.id);
                  }
                }}
                className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
                title="Delete Section"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}

      {sortedSections.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-xl py-12"
          style={{ background: 'var(--panel)', border: '2px dashed var(--border)' }}
        >
          <Layout size={48} style={{ color: 'var(--muted)' }} />
          <p className="mt-4 text-lg font-medium" style={{ color: 'var(--text)' }}>
            No sections yet
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Add sections to build your website
          </p>
        </div>
      )}
    </div>
  );
}
