'use client';

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
  FileText,
  Mic,
  ListMusic,
  Disc,
  Star,
  Radio,
  Ticket,
  Film,
  Clock,
  Heart,
  Quote,
  UserPlus,
  Link,
  Trophy,
  Download,
  VideoIcon,
  Phone,
  Info,
} from 'lucide-react';
import { useState } from 'react';

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
  category: 'hero' | 'content' | 'media' | 'engagement' | 'commerce' | 'pro' | 'pages';
  color: string;
  isPro?: boolean;
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
  {
    id: 'countdown',
    name: 'Countdown Timer',
    description: 'Release countdown with pre-save links',
    icon: Clock,
    category: 'hero',
    color: '#f97316',
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
  {
    id: 'music_videos',
    name: 'Music Videos',
    description: 'Video gallery with modal player',
    icon: Film,
    category: 'media',
    color: '#ef4444',
  },
  {
    id: 'discography',
    name: 'Discography',
    description: 'Full album catalog with track lists',
    icon: Disc,
    category: 'media',
    color: '#8b5cf6',
  },
  {
    id: 'lyrics',
    name: 'Lyrics',
    description: 'Searchable lyrics with streaming links',
    icon: FileText,
    category: 'media',
    color: '#06b6d4',
  },
  {
    id: 'live_stream',
    name: 'Live Stream',
    description: 'Twitch/YouTube live integration',
    icon: Radio,
    category: 'media',
    color: '#9333ea',
    isPro: true,
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
  {
    id: 'setlist',
    name: 'Setlist',
    description: 'Shareable setlists with covers & encores',
    icon: ListMusic,
    category: 'content',
    color: '#10b981',
  },
  {
    id: 'press_quotes',
    name: 'Press Quotes',
    description: 'Media reviews and testimonials',
    icon: Quote,
    category: 'content',
    color: '#f43f5e',
  },
  {
    id: 'credits',
    name: 'Credits',
    description: 'Collaborators and production credits',
    icon: UserPlus,
    category: 'content',
    color: '#0ea5e9',
  },
  {
    id: 'awards',
    name: 'Awards & Certifications',
    description: 'Gold/platinum records, awards display',
    icon: Trophy,
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
  {
    id: 'fan_club',
    name: 'Fan Club',
    description: 'VIP memberships and exclusive content',
    icon: Star,
    category: 'engagement',
    color: '#f59e0b',
    isPro: true,
  },
  {
    id: 'pre_save',
    name: 'Pre-Save Links',
    description: 'Smart links for all platforms',
    icon: Link,
    category: 'engagement',
    color: '#22c55e',
  },
  {
    id: 'support',
    name: 'Support / Tip Jar',
    description: 'Patreon, Ko-fi, and tip integration',
    icon: Heart,
    category: 'engagement',
    color: '#ec4899',
  },
  {
    id: 'meet_greet',
    name: 'Meet & Greet',
    description: 'Virtual meet & greet booking',
    icon: VideoIcon,
    category: 'engagement',
    color: '#8b5cf6',
    isPro: true,
  },

  // Commerce Sections
  {
    id: 'merch_store',
    name: 'Merch Store',
    description: 'Sell merchandise',
    icon: ShoppingCart,
    category: 'commerce',
    color: '#8b5cf6',
  },
  {
    id: 'tickets',
    name: 'Ticket Integration',
    description: 'Eventbrite, DICE, and more',
    icon: Ticket,
    category: 'commerce',
    color: '#f97316',
  },
  {
    id: 'downloads',
    name: 'Downloads Store',
    description: 'Sell stems, samples, and presets',
    icon: Download,
    category: 'commerce',
    color: '#06b6d4',
    isPro: true,
  },

  // Pro/Professional Sections
  {
    id: 'epk',
    name: 'Electronic Press Kit',
    description: 'Complete EPK with PDF export',
    icon: FileText,
    category: 'pro',
    color: '#3b82f6',
    isPro: true,
  },
  {
    id: 'tech_rider',
    name: 'Tech Rider',
    description: 'Stage plot, input list, hospitality',
    icon: Mic,
    category: 'pro',
    color: '#10b981',
    isPro: true,
  },

  // Full Pages
  {
    id: 'about_page',
    name: 'About Page',
    description: 'Full about page with timeline & story',
    icon: Info,
    category: 'pages',
    color: '#8b5cf6',
  },
  {
    id: 'contact_page',
    name: 'Contact Page',
    description: 'Contact page with team & FAQ',
    icon: Phone,
    category: 'pages',
    color: '#ef4444',
  },
];

const categories = [
  { id: 'all', label: 'All Sections' },
  { id: 'hero', label: 'Hero' },
  { id: 'media', label: 'Media' },
  { id: 'content', label: 'Content' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'pro', label: 'Professional' },
  { id: 'pages', label: 'Pages' },
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
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                        {section.name}
                      </h3>
                      {section.isPro && (
                        <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                          PRO
                        </span>
                      )}
                    </div>
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
