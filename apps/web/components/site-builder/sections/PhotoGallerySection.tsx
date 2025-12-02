'use client';

import { ChevronLeft, ChevronRight, X, Maximize2, Grid } from '@/components/ui/custom-icons';
import Image from 'next/image';
import { useState } from 'react';

interface Photo {
  url: string;
  alt?: string;
  caption?: string;
}

interface PhotoGallerySectionProps {
  content: {
    title?: string;
    subtitle?: string;
    photos?: Photo[];
    layout?: 'grid' | 'masonry' | 'carousel';
    columns?: 2 | 3 | 4;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

export function PhotoGallerySection({ content, styles }: PhotoGallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { title = 'Gallery', subtitle, photos = [], layout = 'grid', columns = 3 } = content;

  const bgColor = styles?.backgroundColor || 'transparent';
  const textColor = styles?.textColor || 'var(--text)';

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : photos.length - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < photos.length - 1 ? selectedIndex + 1 : 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  const getColumnClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <section className="px-4 py-16 md:px-8 lg:py-24" style={{ background: bgColor }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2
                className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg opacity-70" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid Layout */}
        {layout === 'grid' && photos.length > 0 && (
          <div className={`grid gap-4 ${getColumnClass()}`}>
            {photos.map((photo, index) => (
              <div
                key={index}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt || `Photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 size={32} color="white" />
                  </div>
                </div>
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm text-white">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Masonry Layout */}
        {layout === 'masonry' && photos.length > 0 && (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="group relative mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-xl"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt || `Photo ${index + 1}`}
                  width={600}
                  height={400}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 size={32} color="white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {layout === 'carousel' && photos.length > 0 && (
          <div className="relative">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="group relative aspect-[4/3] w-[300px] flex-shrink-0 cursor-pointer snap-center overflow-hidden rounded-xl md:w-[400px] lg:w-[500px]"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt || `Photo ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-sm text-white">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {photos.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-16"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '2px dashed rgba(255,255,255,0.2)',
            }}
          >
            <Grid size={48} className="mb-4 opacity-40" style={{ color: textColor }} />
            <p className="font-medium" style={{ color: textColor }}>
              No photos added yet
            </p>
            <p className="text-sm opacity-60" style={{ color: textColor }}>
              Add photos from your media library
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && photos[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <X size={24} />
          </button>

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative h-[80vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].alt || ''}
              fill
              className="object-contain"
            />
          </div>

          {/* Caption & Counter */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            {photos[selectedIndex].caption && (
              <p className="mb-2 text-white">{photos[selectedIndex].caption}</p>
            )}
            <p className="text-sm text-white/60">
              {selectedIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

// Editor component
export function PhotoGallerySectionEditor({
  content,
  onChange,
}: {
  content: PhotoGallerySectionProps['content'];
  onChange: (content: PhotoGallerySectionProps['content']) => void;
}) {
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const addPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const newPhotos = [...(content.photos || []), { url: newPhotoUrl.trim() }];
    onChange({ ...content, photos: newPhotos });
    setNewPhotoUrl('');
  };

  const removePhoto = (index: number) => {
    const newPhotos = (content.photos || []).filter((_, i) => i !== index);
    onChange({ ...content, photos: newPhotos });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Section Title
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="Gallery"
        />
      </div>

      {/* Layout */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Layout
        </label>
        <div className="flex gap-2">
          {(['grid', 'masonry', 'carousel'] as const).map((layoutOption) => (
            <button
              key={layoutOption}
              onClick={() => onChange({ ...content, layout: layoutOption })}
              className={`rounded-lg px-4 py-2 capitalize ${
                content.layout === layoutOption ? 'ring-2 ring-[var(--accent)]' : ''
              }`}
              style={{
                background: content.layout === layoutOption ? 'var(--accent)' : 'var(--bg)',
                color: content.layout === layoutOption ? '#fff' : 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              {layoutOption}
            </button>
          ))}
        </div>
      </div>

      {/* Columns (for grid) */}
      {content.layout === 'grid' && (
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Columns
          </label>
          <div className="flex gap-2">
            {([2, 3, 4] as const).map((col) => (
              <button
                key={col}
                onClick={() => onChange({ ...content, columns: col })}
                className={`rounded-lg px-4 py-2 ${
                  content.columns === col ? 'ring-2 ring-[var(--accent)]' : ''
                }`}
                style={{
                  background: content.columns === col ? 'var(--accent)' : 'var(--bg)',
                  color: content.columns === col ? '#fff' : 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Photo */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Add Photo URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="https://example.com/photo.jpg"
            onKeyDown={(e) => e.key === 'Enter' && addPhoto()}
          />
          <button
            onClick={addPhoto}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Current Photos */}
      {(content.photos || []).length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Photos ({(content.photos || []).length})
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(content.photos || []).map((photo, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
                <Image src={photo.url} alt={photo.alt || ''} fill className="object-cover" />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
