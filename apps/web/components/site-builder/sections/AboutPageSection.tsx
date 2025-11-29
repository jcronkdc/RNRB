'use client';

import { Music, Award, Calendar, MapPin, Users, Disc, Quote, ExternalLink } from 'lucide-react';

interface AboutPageSectionProps {
  content: {
    headline?: string;
    story?: string;
    origin?: string;
    location?: string;
    yearFormed?: string;
    genre?: string;
    members?: Array<{
      name: string;
      role: string;
      image?: string;
      bio?: string;
    }>;
    achievements?: Array<{
      icon?: string;
      value: string;
      label: string;
    }>;
    influences?: string[];
    quote?: string;
    quoteAuthor?: string;
    pressPhotos?: string[];
    pressKit?: string;
    timeline?: Array<{
      year: string;
      event: string;
    }>;
  };
  theme?: Record<string, unknown>;
}

export function AboutPageSection({ content, theme }: AboutPageSectionProps) {
  const {
    headline = 'Our Story',
    story = '',
    origin = '',
    location = '',
    yearFormed = '',
    genre = '',
    members = [],
    achievements = [],
    influences = [],
    quote = '',
    quoteAuthor = '',
    pressPhotos = [],
    pressKit = '',
    timeline = [],
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          {origin && (
            <p className="text-xl" style={{ color: 'var(--muted)' }}>
              {origin}
            </p>
          )}
        </div>

        {/* Quick Facts */}
        {(location || yearFormed || genre) && (
          <div className="mb-16 flex flex-wrap justify-center gap-8">
            {location && (
              <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <MapPin size={20} style={{ color: accentColor }} />
                <span>{location}</span>
              </div>
            )}
            {yearFormed && (
              <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <Calendar size={20} style={{ color: accentColor }} />
                <span>Est. {yearFormed}</span>
              </div>
            )}
            {genre && (
              <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <Music size={20} style={{ color: accentColor }} />
                <span>{genre}</span>
              </div>
            )}
          </div>
        )}

        {/* Main Story */}
        {story && (
          <div className="mb-20">
            <div
              className="mx-auto max-w-3xl text-lg leading-relaxed"
              style={{ color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: story.replace(/\n/g, '<br/>') }}
            />
          </div>
        )}

        {/* Quote */}
        {quote && (
          <div
            className="relative mb-20 rounded-2xl p-8 text-center md:p-12"
            style={{ background: 'var(--panel)' }}
          >
            <Quote
              size={48}
              className="absolute left-6 top-6 opacity-20"
              style={{ color: accentColor }}
            />
            <blockquote
              className="relative z-10 text-2xl font-medium italic md:text-3xl"
              style={{ color: 'var(--text)' }}
            >
              &ldquo;{quote}&rdquo;
            </blockquote>
            {quoteAuthor && (
              <cite className="mt-4 block text-lg not-italic" style={{ color: 'var(--muted)' }}>
                — {quoteAuthor}
              </cite>
            )}
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Highlights
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 text-center"
                  style={{ background: 'var(--panel)' }}
                >
                  <div
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ background: `${accentColor}20` }}
                  >
                    <Award size={24} style={{ color: accentColor }} />
                  </div>
                  <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {achievement.value}
                  </div>
                  <div style={{ color: 'var(--muted)' }}>{achievement.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Band Members */}
        {members.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold" style={{ color: 'var(--text)' }}>
              The Band
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member, i) => (
                <div key={i} className="text-center">
                  <div
                    className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full"
                    style={{ background: 'var(--panel)' }}
                  >
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users size={48} style={{ color: 'var(--muted)' }} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
                    {member.name}
                  </h3>
                  <p style={{ color: accentColor }}>{member.role}</p>
                  {member.bio && (
                    <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Our Journey
            </h2>
            <div className="relative mx-auto max-w-2xl">
              {/* Timeline line */}
              <div
                className="absolute left-4 top-0 h-full w-0.5"
                style={{ background: 'var(--border)' }}
              />
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-6 pl-12">
                    {/* Dot */}
                    <div
                      className="absolute left-2 top-1 h-5 w-5 rounded-full"
                      style={{ background: accentColor }}
                    />
                    <div>
                      <div className="text-lg font-semibold" style={{ color: accentColor }}>
                        {item.year}
                      </div>
                      <div style={{ color: 'var(--text)' }}>{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Influences */}
        {influences.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Influences
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {influences.map((influence, i) => (
                <span
                  key={i}
                  className="rounded-full px-4 py-2"
                  style={{
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {influence}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Press Photos */}
        {pressPhotos.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Press Photos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pressPhotos.map((photo, i) => (
                <a
                  key={i}
                  href={photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl"
                  style={{ background: 'var(--panel)' }}
                >
                  <img
                    src={photo}
                    alt={`Press ${i + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-2 text-white">
                      <ExternalLink size={20} />
                      Download
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Press Kit Download */}
        {pressKit && (
          <div className="text-center">
            <a
              href={pressKit}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold transition-all hover:scale-105"
              style={{ background: accentColor, color: '#fff' }}
            >
              <Disc size={20} />
              Download Press Kit
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
