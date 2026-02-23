'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2 } from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

import { ImageUpload } from './ImageUpload';
import { SyncControls } from './SyncControls';

interface SyncConfig {
  enabled: boolean;
  dataType: 'songs' | 'shows' | 'members' | 'awards';
  selectedIds: string[];
  lastSyncedAt?: string;
  autoRefresh?: boolean;
}

interface SiteSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  isVisible: boolean;
  animation?: string | null;
  syncConfig?: SyncConfig | null;
}

interface SectionEditorProps {
  section: SiteSection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: SiteSection) => void;
}

// Field configurations for each section type
const sectionFields: Record<
  string,
  { label: string; key: string; type: string; placeholder?: string }[]
> = {
  hero_image: [
    { label: 'Headline', key: 'headline', type: 'text', placeholder: 'Your headline here' },
    { label: 'Subheadline', key: 'subheadline', type: 'text', placeholder: 'Supporting text' },
    { label: 'Image URL', key: 'imageUrl', type: 'image', placeholder: 'https://...' },
    { label: 'Button Text', key: 'buttonText', type: 'text', placeholder: 'Get Started' },
    { label: 'Button URL', key: 'buttonUrl', type: 'url', placeholder: '/contact' },
  ],
  hero_video: [
    { label: 'Headline', key: 'headline', type: 'text', placeholder: 'Your headline here' },
    { label: 'Subheadline', key: 'subheadline', type: 'text', placeholder: 'Supporting text' },
    { label: 'Video URL', key: 'videoUrl', type: 'url', placeholder: 'YouTube or Vimeo URL' },
    { label: 'Poster Image', key: 'posterUrl', type: 'image', placeholder: 'Fallback image URL' },
    { label: 'Button Text', key: 'buttonText', type: 'text', placeholder: 'Watch Now' },
  ],
  video_hero: [
    { label: 'Video URL', key: 'videoUrl', type: 'url', placeholder: 'YouTube or Vimeo URL' },
    { label: 'Overlay Text', key: 'overlayText', type: 'text', placeholder: 'Text over video' },
    { label: 'Overlay Opacity', key: 'overlayOpacity', type: 'range', placeholder: '50' },
  ],
  bio_split: [
    { label: 'Title', key: 'title', type: 'text', placeholder: 'About Us' },
    { label: 'Biography', key: 'content', type: 'textarea', placeholder: 'Your bio here...' },
    { label: 'Image URL', key: 'imageUrl', type: 'image', placeholder: 'Profile image URL' },
    { label: 'Image Position', key: 'imagePosition', type: 'select', placeholder: 'left' },
  ],
  bio_full: [
    { label: 'Title', key: 'title', type: 'text', placeholder: 'About' },
    { label: 'Biography', key: 'content', type: 'textarea', placeholder: 'Your full bio...' },
    {
      label: 'Background Image',
      key: 'backgroundUrl',
      type: 'image',
      placeholder: 'Background URL',
    },
  ],
  music_player: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Latest Tracks' },
    {
      label: 'Embed Code',
      key: 'embedCode',
      type: 'code',
      placeholder: 'Spotify/SoundCloud embed',
    },
    { label: 'Description', key: 'description', type: 'textarea', placeholder: 'About your music' },
  ],
  streaming: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Listen Now' },
    { label: 'Spotify URL', key: 'spotifyUrl', type: 'url', placeholder: 'Spotify artist link' },
    {
      label: 'Apple Music URL',
      key: 'appleMusicUrl',
      type: 'url',
      placeholder: 'Apple Music link',
    },
    { label: 'YouTube URL', key: 'youtubeUrl', type: 'url', placeholder: 'YouTube channel' },
    {
      label: 'SoundCloud URL',
      key: 'soundcloudUrl',
      type: 'url',
      placeholder: 'SoundCloud profile',
    },
  ],
  tour_dates: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Upcoming Shows' },
    { label: 'Description', key: 'description', type: 'text', placeholder: 'Come see us live!' },
    { label: 'Events', key: 'events', type: 'events', placeholder: '' },
  ],
  photo_gallery: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Gallery' },
    { label: 'Description', key: 'description', type: 'text', placeholder: 'Our photos' },
    { label: 'Images', key: 'images', type: 'gallery', placeholder: '' },
  ],
  band_members: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'The Band' },
    { label: 'Members', key: 'members', type: 'members', placeholder: '' },
  ],
  achievements: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Achievements' },
    { label: 'Achievements', key: 'items', type: 'achievements', placeholder: '' },
  ],
  contact_form: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Get in Touch' },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      placeholder: "We'd love to hear from you",
    },
    {
      label: 'Email Recipient',
      key: 'recipientEmail',
      type: 'email',
      placeholder: 'your@email.com',
    },
  ],
  booking: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Book Us' },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      placeholder: 'Available for events',
    },
    {
      label: 'Booking Email',
      key: 'bookingEmail',
      type: 'email',
      placeholder: 'booking@example.com',
    },
    { label: 'Minimum Budget', key: 'minBudget', type: 'text', placeholder: '$500' },
  ],
  mailing_list: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Stay Updated' },
    {
      label: 'Description',
      key: 'description',
      type: 'text',
      placeholder: 'Join our mailing list',
    },
    { label: 'Button Text', key: 'buttonText', type: 'text', placeholder: 'Subscribe' },
  ],
  social_links: [
    { label: 'Section Title', key: 'title', type: 'text', placeholder: 'Follow Us' },
    { label: 'Instagram', key: 'instagram', type: 'url', placeholder: 'Instagram URL' },
    { label: 'Twitter/X', key: 'twitter', type: 'url', placeholder: 'Twitter URL' },
    { label: 'Facebook', key: 'facebook', type: 'url', placeholder: 'Facebook URL' },
    { label: 'TikTok', key: 'tiktok', type: 'url', placeholder: 'TikTok URL' },
  ],
  header: [
    { label: 'Logo Text', key: 'logoText', type: 'text', placeholder: 'Your Name' },
    { label: 'Logo Image URL', key: 'logoUrl', type: 'image', placeholder: 'Logo image URL' },
    { label: 'Navigation Style', key: 'navStyle', type: 'select', placeholder: 'default' },
  ],
  footer: [
    { label: 'Copyright Text', key: 'copyright', type: 'text', placeholder: '© 2025 Your Name' },
    { label: 'Show Social Links', key: 'showSocial', type: 'toggle', placeholder: '' },
    { label: 'Show Quick Links', key: 'showLinks', type: 'toggle', placeholder: '' },
  ],
};

// Animation options
const animationOptions = [
  { value: '', label: 'None' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideLeft', label: 'Slide from Left' },
  { value: 'slideRight', label: 'Slide from Right' },
  { value: 'zoom', label: 'Zoom In' },
  { value: 'bounce', label: 'Bounce' },
];

// Section types that support data syncing
const syncableSectionTypes = [
  'music_player',
  'music_spotify',
  'music_apple',
  'discography',
  'streaming',
  'tour_dates',
  'tour_map',
  'tour_upcoming',
  'band_members',
  'achievements',
  'awards',
];

export function SectionEditor({ section, isOpen, onClose, onSave }: SectionEditorProps) {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [animation, setAnimation] = useState<string>('');
  const [syncConfig, setSyncConfig] = useState<SyncConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isSyncable = section ? syncableSectionTypes.includes(section.type) : false;

  useEffect(() => {
    if (section) {
      setContent(section.content || {});
      setAnimation(section.animation || '');
      setSyncConfig((section.syncConfig as SyncConfig) || null);
    }
  }, [section]);

  const handleFieldChange = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSyncConfigChange = (config: SyncConfig | null) => {
    setSyncConfig(config);
  };

  const handleSyncRefresh = (items: unknown[]) => {
    // Update content based on section type
    if (!section) return;

    if (['music_player', 'discography', 'streaming'].includes(section.type)) {
      setContent((prev) => ({ ...prev, tracks: items }));
    } else if (['tour_dates', 'tour_map', 'tour_upcoming'].includes(section.type)) {
      setContent((prev) => ({ ...prev, shows: items }));
    } else if (section.type === 'band_members') {
      setContent((prev) => ({ ...prev, members: items }));
    } else if (['achievements', 'awards'].includes(section.type)) {
      setContent((prev) => ({ ...prev, items: items }));
    }
  };

  const handleSave = async () => {
    if (!section) return;
    setIsSaving(true);

    try {
      const updatedSection: SiteSection = {
        ...section,
        content,
        animation: animation || null,
        syncConfig: syncConfig,
      };
      await onSave(updatedSection);
      onClose();
    } catch (error) {
      console.error('Failed to save section:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const fields = section ? sectionFields[section.type] || [] : [];

  const renderField = (field: {
    label: string;
    key: string;
    type: string;
    placeholder?: string;
  }) => {
    const value = content[field.key] as string | boolean | undefined;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        );

      case 'code':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={6}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 font-mono text-sm text-green-400 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        );

      case 'image':
        return (
          <ImageUpload
            value={(value as string) || null}
            onChange={(url) => handleFieldChange(field.key, url)}
            label={field.placeholder || 'Upload Image'}
          />
        );

      case 'select': {
        const options =
          field.key === 'imagePosition'
            ? [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ]
            : field.key === 'navStyle'
              ? [
                  { value: 'default', label: 'Default' },
                  { value: 'centered', label: 'Centered' },
                  { value: 'minimal', label: 'Minimal' },
                ]
              : [];

        return (
          <select
            value={(value as string) || options[0]?.value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => handleFieldChange(field.key, !value)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              value ? 'bg-orange-500' : 'bg-gray-700'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                value ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        );

      case 'range': {
        const rangeValue = typeof value === 'number' ? value : 50;
        return (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={rangeValue}
              onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-gray-400">{rangeValue}%</span>
          </div>
        );
      }

      case 'events':
        return (
          <EventsEditor
            events={(content[field.key] as unknown[]) || []}
            onChange={(events) => handleFieldChange(field.key, events)}
          />
        );

      case 'gallery':
        return (
          <GalleryEditor
            images={(content[field.key] as string[]) || []}
            onChange={(images) => handleFieldChange(field.key, images)}
          />
        );

      case 'members':
        return (
          <MembersEditor
            members={(content[field.key] as unknown[]) || []}
            onChange={(members) => handleFieldChange(field.key, members)}
          />
        );

      case 'achievements':
        return (
          <AchievementsEditor
            items={(content[field.key] as unknown[]) || []}
            onChange={(items) => handleFieldChange(field.key, items)}
          />
        );

      default:
        return null;
    }
  };

  if (!section) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 mx-auto my-auto flex h-fit max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 p-6">
              <div>
                <h2 className="text-xl font-bold text-white">Edit Section</h2>
                <p className="text-sm text-gray-400">
                  {section.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Sync Controls - Only show for syncable sections */}
                {isSyncable && (
                  <SyncControls
                    sectionType={section.type}
                    syncConfig={syncConfig}
                    onSyncConfigChange={handleSyncConfigChange}
                    onRefresh={handleSyncRefresh}
                  />
                )}

                {/* Section Fields */}
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      {field.label}
                    </label>
                    {renderField(field)}
                  </div>
                ))}

                {/* Animation Setting */}
                <div className="border-t border-gray-800 pt-6">
                  <label
                    htmlFor="section-animation"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Entrance Animation
                  </label>
                  <select
                    id="section-animation"
                    value={animation}
                    onChange={(e) => setAnimation(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {animationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-800 p-6">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 font-medium text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Sub-editors for complex field types
function EventsEditor({
  events,
  onChange,
}: {
  events: unknown[];
  onChange: (events: unknown[]) => void;
}) {
  const addEvent = () => {
    onChange([...events, { date: '', venue: '', city: '', ticketUrl: '' }]);
  };

  const updateEvent = (index: number, field: string, value: string) => {
    const updated = [...events];
    updated[index] = { ...(updated[index] as object), [field]: value };
    onChange(updated);
  };

  const removeEvent = (index: number) => {
    onChange(events.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {events.map((event: unknown, index: number) => {
        const e = event as { date?: string; venue?: string; city?: string; ticketUrl?: string };
        return (
          <div key={index} className="flex gap-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
            <input
              type="date"
              value={e.date || ''}
              onChange={(ev) => updateEvent(index, 'date', ev.target.value)}
              className="w-32 rounded bg-gray-800 px-2 py-1 text-sm text-white"
            />
            <input
              type="text"
              placeholder="Venue"
              value={e.venue || ''}
              onChange={(ev) => updateEvent(index, 'venue', ev.target.value)}
              className="flex-1 rounded bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="City"
              value={e.city || ''}
              onChange={(ev) => updateEvent(index, 'city', ev.target.value)}
              className="w-24 rounded bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500"
            />
            <button onClick={() => removeEvent(index)} className="text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <button
        onClick={addEvent}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-2 text-gray-400 hover:border-gray-600 hover:text-gray-300"
      >
        <Plus className="h-4 w-4" /> Add Event
      </button>
    </div>
  );
}

function GalleryEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) onChange([...images, url]);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {images.map((url, index) => (
          <div
            key={index}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-700"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 rounded bg-red-500/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addImage}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-2 text-gray-400 hover:border-gray-600 hover:text-gray-300"
      >
        <Plus className="h-4 w-4" /> Add Image
      </button>
    </div>
  );
}

function MembersEditor({
  members,
  onChange,
}: {
  members: unknown[];
  onChange: (members: unknown[]) => void;
}) {
  const addMember = () => {
    onChange([...members, { name: '', role: '', imageUrl: '', bio: '' }]);
  };

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...(updated[index] as object), [field]: value };
    onChange(updated);
  };

  const removeMember = (index: number) => {
    onChange(members.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {members.map((member: unknown, index: number) => {
        const m = member as { name?: string; role?: string; imageUrl?: string };
        return (
          <div key={index} className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Member {index + 1}</span>
              <button
                onClick={() => removeMember(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2">
              <input
                type="text"
                placeholder="Name"
                value={m.name || ''}
                onChange={(e) => updateMember(index, 'name', e.target.value)}
                className="rounded bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Role (e.g., Lead Guitar)"
                value={m.role || ''}
                onChange={(e) => updateMember(index, 'role', e.target.value)}
                className="rounded bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500"
              />
              <input
                type="url"
                placeholder="Photo URL"
                value={m.imageUrl || ''}
                onChange={(e) => updateMember(index, 'imageUrl', e.target.value)}
                className="rounded bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500"
              />
            </div>
          </div>
        );
      })}
      <button
        onClick={addMember}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-2 text-gray-400 hover:border-gray-600 hover:text-gray-300"
      >
        <Plus className="h-4 w-4" /> Add Member
      </button>
    </div>
  );
}

function AchievementsEditor({
  items,
  onChange,
}: {
  items: unknown[];
  onChange: (items: unknown[]) => void;
}) {
  const addItem = () => {
    onChange([...items, { title: '', description: '', year: '' }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...(updated[index] as object), [field]: value };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item: unknown, index: number) => {
        const a = item as { title?: string; description?: string; year?: string };
        return (
          <div key={index} className="flex gap-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
            <input
              type="text"
              placeholder="Year"
              value={a.year || ''}
              onChange={(e) => updateItem(index, 'year', e.target.value)}
              className="w-20 rounded bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Achievement"
              value={a.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              className="flex-1 rounded bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500"
            />
            <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-2 text-gray-400 hover:border-gray-600 hover:text-gray-300"
      >
        <Plus className="h-4 w-4" /> Add Achievement
      </button>
    </div>
  );
}
