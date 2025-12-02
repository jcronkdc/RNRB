'use client';

import { Trophy, Star, Medal, Disc, Calendar } from '@/components/ui/custom-icons';

interface AwardItem {
  id: string;
  title: string;
  organization?: string;
  year?: string;
  category?: string;
  description?: string;
  image?: string;
  type?: 'award' | 'certification' | 'nomination' | 'achievement';
  // For certifications
  certification?: 'gold' | 'platinum' | 'diamond' | 'multi-platinum';
  certificationCount?: number;
  // For achievements
  value?: string;
  label?: string;
}

interface AwardsSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    awards?: AwardItem[];
    showYear?: boolean;
    layout?: 'grid' | 'timeline' | 'showcase';
  };
  theme?: Record<string, unknown>;
}

const CERTIFICATION_COLORS: Record<string, string> = {
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  'multi-platinum': '#E5E4E2',
};

const TYPE_ICONS = {
  award: Trophy,
  certification: Disc,
  nomination: Star,
  achievement: Medal,
};

export function AwardsSection({ content, theme }: AwardsSectionProps) {
  const {
    headline = 'Awards & Achievements',
    subheadline = 'Recognition for our music',
    awards = [],
    showYear = true,
    layout = 'grid',
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';

  // Group awards by type
  const certifications = awards.filter((a) => a.type === 'certification');
  const awardsAndNominations = awards.filter(
    (a) => a.type !== 'certification' && a.type !== 'achievement'
  );
  const achievements = awards.filter((a) => a.type === 'achievement');

  const getCertificationLabel = (cert: string, count?: number) => {
    if (count && count > 1) {
      return `${count}x ${cert.charAt(0).toUpperCase() + cert.slice(1)}`;
    }
    return cert.charAt(0).toUpperCase() + cert.slice(1);
  };

  const AwardCard = ({ award }: { award: AwardItem }) => {
    const TypeIcon = TYPE_ICONS[award.type || 'award'] || Trophy;
    const isCertification = award.type === 'certification';
    const certColor =
      isCertification && award.certification
        ? CERTIFICATION_COLORS[award.certification]
        : accentColor;

    return (
      <div
        className="group overflow-hidden rounded-xl transition-all hover:scale-[1.02]"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {/* Image or Icon */}
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden"
          style={{ background: `${certColor}10` }}
        >
          {award.image ? (
            <img
              src={award.image}
              alt={award.title}
              className="h-full w-full object-contain p-8 transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="text-center">
              {isCertification ? (
                <div className="relative">
                  <Disc
                    size={80}
                    style={{ color: certColor }}
                    className="transition-transform group-hover:rotate-12"
                  />
                  {award.certificationCount && award.certificationCount > 1 && (
                    <span
                      className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                      style={{ background: certColor, color: '#000' }}
                    >
                      {award.certificationCount}x
                    </span>
                  )}
                </div>
              ) : (
                <TypeIcon
                  size={64}
                  style={{ color: certColor }}
                  className="transition-transform group-hover:scale-110"
                />
              )}
            </div>
          )}

          {/* Type Badge */}
          {award.type && (
            <span
              className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize"
              style={{
                background: award.type === 'nomination' ? 'var(--bg)' : certColor,
                color: award.type === 'nomination' ? 'var(--text)' : '#000',
              }}
            >
              {award.type === 'nomination' ? 'Nominated' : award.type}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Certification Label */}
          {isCertification && award.certification && (
            <div
              className="mb-2 inline-block rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: certColor, color: '#000' }}
            >
              {getCertificationLabel(award.certification, award.certificationCount)}
            </div>
          )}

          <h3 className="mb-1 font-semibold" style={{ color: 'var(--text)' }}>
            {award.title}
          </h3>

          {award.category && (
            <p className="text-sm" style={{ color: accentColor }}>
              {award.category}
            </p>
          )}

          {award.organization && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {award.organization}
            </p>
          )}

          {showYear && award.year && (
            <p className="mt-2 flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
              <Calendar size={14} />
              {award.year}
            </p>
          )}

          {award.description && (
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              {award.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const AchievementCard = ({ achievement }: { achievement: AwardItem }) => (
    <div className="rounded-xl p-6 text-center" style={{ background: 'var(--panel)' }}>
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: `${accentColor}20` }}
      >
        <Medal size={32} style={{ color: accentColor }} />
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
        {achievement.value}
      </div>
      <div style={{ color: 'var(--muted)' }}>{achievement.label || achievement.title}</div>
    </div>
  );

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Certifications
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((cert) => (
                <AwardCard key={cert.id} award={cert} />
              ))}
            </div>
          </div>
        )}

        {/* Awards & Nominations */}
        {awardsAndNominations.length > 0 && (
          <div>
            {certifications.length > 0 && (
              <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Awards & Nominations
              </h2>
            )}

            {/* Timeline Layout */}
            {layout === 'timeline' && (
              <div className="relative">
                {/* Timeline Line */}
                <div
                  className="absolute left-8 top-0 h-full w-0.5"
                  style={{ background: 'var(--border)' }}
                />
                <div className="space-y-8">
                  {awardsAndNominations.map((award) => {
                    const TypeIcon = TYPE_ICONS[award.type || 'award'] || Trophy;
                    return (
                      <div key={award.id} className="relative flex gap-6 pl-16">
                        {/* Dot */}
                        <div
                          className="absolute left-6 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ background: accentColor }}
                        >
                          <TypeIcon size={12} className="text-white" />
                        </div>
                        <div
                          className="flex-1 rounded-xl p-4"
                          style={{ background: 'var(--panel)' }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                                {award.title}
                              </h3>
                              {award.category && (
                                <p className="text-sm" style={{ color: accentColor }}>
                                  {award.category}
                                </p>
                              )}
                              {award.organization && (
                                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                  {award.organization}
                                </p>
                              )}
                            </div>
                            {award.year && (
                              <span
                                className="rounded-full px-3 py-1 text-sm"
                                style={{ background: 'var(--bg)', color: 'var(--muted)' }}
                              >
                                {award.year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid Layout */}
            {layout === 'grid' && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {awardsAndNominations.map((award) => (
                  <AwardCard key={award.id} award={award} />
                ))}
              </div>
            )}

            {/* Showcase Layout */}
            {layout === 'showcase' && (
              <div className="grid gap-8 md:grid-cols-2">
                {awardsAndNominations.map((award) => (
                  <AwardCard key={award.id} award={award} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {awards.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>No awards or achievements listed yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
