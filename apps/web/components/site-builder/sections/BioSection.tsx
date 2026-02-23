'use client';

import { motion } from 'motion/react';

interface BioSectionProps {
  content: {
    title?: string;
    bio?: string;
    image?: string | null;
    genres?: string[];
    location?: string;
    layout?: 'split' | 'full' | 'centered';
  };
  theme: Record<string, unknown>;
  animation?: string;
}

export function BioSection({ content, theme, animation }: BioSectionProps) {
  const { title = 'About', bio = '', image, genres = [], location, layout = 'split' } = content;

  const accentColor = (theme.accentColor as string) || '#ff6347';

  if (layout === 'centered' || layout === 'full') {
    return (
      <section
        id="about"
        className="px-4 py-20"
        style={{ backgroundColor: (theme.secondaryColor as string) || '#1a1a1a' }}
      >
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={animation === 'fade-in' ? { opacity: 0, y: 40 } : {}}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2
              className="mb-8 text-4xl font-bold md:text-5xl"
              style={{
                fontFamily: (theme.fontHeading as string) || 'inherit',
                color: (theme.textColor as string) || '#fff',
              }}
            >
              {title}
            </h2>

            {image && (
              <div className="mx-auto mb-8 h-48 w-48 overflow-hidden rounded-full">
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            {bio && (
              <p
                className="mb-8 text-lg leading-relaxed whitespace-pre-wrap md:text-xl"
                style={{
                  fontFamily: (theme.fontBody as string) || 'inherit',
                  color: (theme.textColor as string) || '#fff',
                }}
              >
                {bio}
              </p>
            )}

            {(genres.length > 0 || location) && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {genres.map((genre, i) => (
                  <span
                    key={i}
                    className="rounded-full px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: accentColor + '20',
                      color: accentColor,
                    }}
                  >
                    {genre}
                  </span>
                ))}
                {location && (
                  <span
                    className="rounded-full px-4 py-2 text-sm"
                    style={{
                      backgroundColor: (theme.mutedColor as string) + '20' || '#333',
                      color: (theme.mutedColor as string) || '#888',
                    }}
                  >
                    📍 {location}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // Split layout (default)
  return (
    <section
      id="about"
      className="px-4 py-20"
      style={{ backgroundColor: (theme.secondaryColor as string) || '#1a1a1a' }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {image ? (
              <div
                className="aspect-square overflow-hidden rounded-2xl"
                style={{ borderRadius: (theme.borderRadius as string) || '16px' }}
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="flex aspect-square items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: accentColor + '10',
                  borderRadius: (theme.borderRadius as string) || '16px',
                }}
              >
                <span className="text-8xl text-gray-400">♪</span>
              </div>
            )}

            {/* Decorative accent */}
            <div
              className="absolute -right-4 -bottom-4 -z-10 h-32 w-32"
              style={{
                backgroundColor: accentColor + '30',
                borderRadius: (theme.borderRadius as string) || '16px',
              }}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2
              className="mb-6 text-4xl font-bold md:text-5xl"
              style={{
                fontFamily: (theme.fontHeading as string) || 'inherit',
                color: (theme.textColor as string) || '#fff',
              }}
            >
              {title}
            </h2>

            {bio && (
              <p
                className="mb-8 text-lg leading-relaxed whitespace-pre-wrap"
                style={{
                  fontFamily: (theme.fontBody as string) || 'inherit',
                  color: (theme.mutedColor as string) || '#ccc',
                }}
              >
                {bio}
              </p>
            )}

            {(genres.length > 0 || location) && (
              <div className="flex flex-wrap gap-3">
                {genres.map((genre, i) => (
                  <span
                    key={i}
                    className="rounded-full px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: accentColor + '20',
                      color: accentColor,
                    }}
                  >
                    {genre}
                  </span>
                ))}
                {location && (
                  <span
                    className="rounded-full px-4 py-2 text-sm"
                    style={{
                      backgroundColor: (theme.mutedColor as string) + '20' || '#333',
                      color: (theme.mutedColor as string) || '#888',
                    }}
                  >
                    📍 {location}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
