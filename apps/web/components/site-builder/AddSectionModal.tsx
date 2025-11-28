'use client';

import { useState } from 'react';
import {
  X,
  Plus,
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
  Grid3x3,
  Headphones,
  Send,
  ShoppingCart,
  Search,
} from 'lucide-react';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sectionType: string) => Promise<void>;
}

interface SectionType {
  id: string;
  name: string;
  description: string;
  icon: typeof Image;
  category: 'hero' | 'content' | 'media' | 'engagement' | 'commerce';
  color: string;
}

const sectionTypes: SectionType[] = [
  // Hero Sections
  {
    id: 'hero_image',
    name: 'Hero Image',
    description: 'Full-width hero with background image',
    icon: Image,
    category: 'hero',
    color: '#ec4899',
  },
  {
    id: 'hero_video',
    name: 'Hero Video',
    description: 'Hero section with video background',
    icon: Video,
    category: 'hero',
    color: '#dc2626',
  },
  {
    id: 'video_hero',
    name: 'Video Hero',
    description: 'YouTube/Vimeo background',
    icon: Video,
    category: 'hero',
    color: '#dc2626',
  },

  // Media Sections
  {
    id: 'music_player',
    name: 'Music Player',
    description: 'Showcase your tracks with audio player',
    icon: Music,
    category: 'media',
    color: '#10b981',
  },
  {
    id: 'streaming',
    name: 'Streaming Links',
    description: 'Spotify, Apple Music, and more',
    icon: Headphones,
    category: 'media',
    color: '#1DB954',
  },
  {
    id: 'photo_gallery',
    name: 'Photo Gallery',
    description: 'Image grid with lightbox',
    icon: Grid3x3,
    category: 'media',
    color: '#a855f7',
  },

  // Content Sections
  {
    id: 'tour_dates',
    name: 'Tour Dates',
    description: 'Upcoming shows and events',
    icon: Calendar,
    category: 'content',
    color: '#f59e0b',
  },
  {
    id: 'bio_split',
    name: 'Bio (Split)',
    description: 'Image and text side by side',
    icon: User,
    category: 'content',
    color: '#8b5cf6',
  },
  {
    id: 'bio_full',
    name: 'Bio (Full)',
    description: 'Full-width biography section',
    icon: User,
    category: 'content',
    color: '#8b5cf6',
  },
  {
    id: 'band_members',
    name: 'Band Members',
    description: 'Team/member profiles',
    icon: Users,
    category: 'content',
    color: '#06b6d4',
  },
  {
    id: 'achievements',
    name: 'Achievements',
    description: 'Awards and milestones',
    icon: Award,
    category: 'content',
    color: '#eab308',
  },

  // Engagement Sections
  {
    id: 'booking',
    name: 'Booking Form',
    description: 'Venue booking requests',
    icon: Send,
    category: 'engagement',
    color: '#f97316',
  },
  {
    id: 'contact_form',
    name: 'Contact Form',
    description: 'General contact form',
    icon: Mail,
    category: 'engagement',
    color: '#ef4444',
  },
  {
    id: 'mailing_list',
    name: 'Mailing List',
    description: 'Email signup form',
    icon: Mail,
    category: 'engagement',
    color: '#3b82f6',
  },
  {
    id: 'social_links',
    name: 'Social Links',
    description: 'Social media buttons',
    icon: Share2,
    category: 'engagement',
    color: '#14b8a6',
  },

  // Commerce
  {
    id: 'merch_store',
    name: 'Merch Store',
    description: 'Sell merchandise',
    icon: ShoppingCart,
    category: 'commerce',
    color: '#8b5cf6',
  },
];

const categories = [
  { id: 'all', label: 'All Sections' },
  { id: 'hero', label: 'Hero' },
  { id: 'media', label: 'Media' },
  { id: 'content', label: 'Content' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'commerce', label: 'Commerce' },
];

export function AddSectionModal({ isOpen, onClose, onAdd }: AddSectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddSection = async (sectionType: string) => {
    setIsAdding(true);
    try {
      await onAdd(sectionType);
      onClose();
    } catch (error) {
      console.error('Failed to add section:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const filteredSections = sectionTypes.filter((section) => {
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="flex h-[80vh] w-full max-w-5xl flex-col rounded-xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Add Section
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Choose a section type to add to your page
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Categories */}
        <div className="space-y-4 px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections..."
              className="w-full rounded-lg py-2 pl-10 pr-4"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.id ? 'bg-white/10' : ''
                }`}
                style={{
                  color: selectedCategory === category.id ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSections.length === 0 ? (
            <div
              className="flex h-full items-center justify-center rounded-lg"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="text-center">
                <Layout size={48} style={{ color: 'var(--muted)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text)' }}>No sections found</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Try a different search or category
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleAddSection(section.id)}
                    disabled={isAdding}
                    className="group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                      style={{ background: section.color + '20', color: section.color }}
                    >
                      <Icon size={24} />
                    </div>

                    {/* Content */}
                    <h3 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
                      {section.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {section.description}
                    </p>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <Plus size={16} />
                        Add Section
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'}{' '}
            available
          </p>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium transition-colors hover:bg-white/5"
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
  );
}
