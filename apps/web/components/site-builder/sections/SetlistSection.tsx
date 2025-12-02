'use client';

import {
  Music,
  Clock,
  Calendar,
  MapPin,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface SetlistSong {
  id: string;
  title: string;
  duration?: string;
  notes?: string;
  isEncore?: boolean;
  isCover?: boolean;
  originalArtist?: string;
}

interface Setlist {
  id: string;
  name: string;
  date?: string;
  venue?: string;
  city?: string;
  songs: SetlistSong[];
  totalDuration?: string;
  notes?: string;
}

interface SetlistSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    setlists?: Setlist[];
    showDurations?: boolean;
    allowSharing?: boolean;
    showVenueInfo?: boolean;
  };
  theme?: Record<string, unknown>;
}

export function SetlistSection({ content, theme }: SetlistSectionProps) {
  const {
    headline = 'Setlists',
    subheadline = 'What we play live',
    setlists = [],
    showDurations = true,
    allowSharing = true,
    showVenueInfo = true,
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [expandedSetlist, setExpandedSetlist] = useState<string | null>(
    setlists.length > 0 ? setlists[0].id : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySetlist = (setlist: Setlist) => {
    const text = [
      setlist.name,
      setlist.venue ? `${setlist.venue}, ${setlist.city}` : '',
      setlist.date || '',
      '',
      ...setlist.songs.map((song, i) => {
        let line = `${i + 1}. ${song.title}`;
        if (song.isCover && song.originalArtist) {
          line += ` (${song.originalArtist} cover)`;
        }
        if (song.isEncore) {
          line = `[Encore] ${line}`;
        }
        return line;
      }),
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(setlist.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (setlist: Setlist) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: setlist.name,
          text: `Check out this setlist: ${setlist.name}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopySetlist(setlist);
    }
  };

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Setlists */}
        <div className="space-y-6">
          {setlists.map((setlist) => (
            <div
              key={setlist.id}
              className="overflow-hidden rounded-xl"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              {/* Setlist Header */}
              <button
                onClick={() =>
                  setExpandedSetlist(expandedSetlist === setlist.id ? null : setlist.id)
                }
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/5"
              >
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    {setlist.name}
                  </h3>
                  {showVenueInfo && (setlist.venue || setlist.date) && (
                    <div
                      className="mt-2 flex flex-wrap items-center gap-4 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      {setlist.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {setlist.venue}
                          {setlist.city && `, ${setlist.city}`}
                        </span>
                      )}
                      {setlist.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {setlist.date}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: accentColor }}>
                      {setlist.songs.length}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      songs
                    </div>
                  </div>
                  <div style={{ color: 'var(--muted)' }}>
                    {expandedSetlist === setlist.id ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedSetlist === setlist.id && (
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                  {/* Actions */}
                  {allowSharing && (
                    <div
                      className="flex gap-2 border-b p-4"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <button
                        onClick={() => handleShare(setlist)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                        style={{ background: 'var(--bg)', color: 'var(--text)' }}
                      >
                        <Share2 size={14} />
                        Share
                      </button>
                      <button
                        onClick={() => handleCopySetlist(setlist)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/5"
                        style={{ background: 'var(--bg)', color: 'var(--text)' }}
                      >
                        {copiedId === setlist.id ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Song List */}
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {setlist.songs.map((song, index) => {
                      // Check if this is the first encore song
                      const isFirstEncore =
                        song.isEncore && (index === 0 || !setlist.songs[index - 1].isEncore);

                      return (
                        <div key={song.id}>
                          {/* Encore Divider */}
                          {isFirstEncore && (
                            <div
                              className="flex items-center gap-4 px-6 py-3"
                              style={{ background: 'var(--bg)' }}
                            >
                              <div
                                className="h-px flex-1"
                                style={{ background: 'var(--border)' }}
                              />
                              <span
                                className="text-sm font-semibold uppercase"
                                style={{ color: accentColor }}
                              >
                                Encore
                              </span>
                              <div
                                className="h-px flex-1"
                                style={{ background: 'var(--border)' }}
                              />
                            </div>
                          )}

                          {/* Song Row */}
                          <div className="flex items-center gap-4 px-6 py-4">
                            {/* Track Number */}
                            <span
                              className="w-8 text-center font-mono text-lg"
                              style={{ color: 'var(--muted)' }}
                            >
                              {index + 1}
                            </span>

                            {/* Song Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="truncate font-medium"
                                  style={{ color: 'var(--text)' }}
                                >
                                  {song.title}
                                </span>
                                {song.isCover && (
                                  <span
                                    className="rounded px-2 py-0.5 text-xs"
                                    style={{ background: `${accentColor}20`, color: accentColor }}
                                  >
                                    Cover
                                  </span>
                                )}
                              </div>
                              {song.isCover && song.originalArtist && (
                                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                  Originally by {song.originalArtist}
                                </p>
                              )}
                              {song.notes && (
                                <p className="text-sm italic" style={{ color: 'var(--muted)' }}>
                                  {song.notes}
                                </p>
                              )}
                            </div>

                            {/* Duration */}
                            {showDurations && song.duration && (
                              <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
                                {song.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  {(setlist.totalDuration || setlist.notes) && (
                    <div
                      className="flex items-center justify-between border-t p-4"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                    >
                      {setlist.notes && (
                        <p className="text-sm italic" style={{ color: 'var(--muted)' }}>
                          {setlist.notes}
                        </p>
                      )}
                      {setlist.totalDuration && (
                        <div
                          className="flex items-center gap-1 text-sm"
                          style={{ color: 'var(--muted)' }}
                        >
                          <Clock size={14} />
                          Total: {setlist.totalDuration}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {setlists.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Music size={48} className="mx-auto mb-4 opacity-50" />
            <p>No setlists available yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
