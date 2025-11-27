'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Ticket, ExternalLink } from 'lucide-react';

interface Show {
  id: string;
  name: string;
  date: string;
  venue?: {
    name: string;
    city?: string;
    state?: string;
    country?: string;
  };
  ticketUrl?: string;
  status?: 'scheduled' | 'soldout' | 'cancelled';
}

interface TourDatesSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    shows?: Show[];
    showMap?: boolean;
    showTicketLinks?: boolean;
    autoSync?: boolean;
  };
  theme: Record<string, unknown>;
  animation?: string;
}

export function TourDatesSection({ content, theme, animation }: TourDatesSectionProps) {
  const { title = 'Tour Dates', subtitle = '', shows = [], showTicketLinks = true } = content;

  const accentColor = (theme.accentColor as string) || '#ff6347';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  if (shows.length === 0) {
    return (
      <section
        id="tour"
        className="px-4 py-20"
        style={{ backgroundColor: (theme.primaryColor as string) || '#000' }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="mb-4 text-4xl font-bold"
            style={{
              fontFamily: (theme.fontHeading as string) || 'inherit',
              color: (theme.textColor as string) || '#fff',
            }}
          >
            {title}
          </h2>
          <p style={{ color: (theme.mutedColor as string) || '#888' }}>
            No upcoming shows. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="tour"
      className="px-4 py-20"
      style={{ backgroundColor: (theme.primaryColor as string) || '#000' }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={animation === 'slide-up' ? { opacity: 0, y: 40 } : {}}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{
              fontFamily: (theme.fontHeading as string) || 'inherit',
              color: (theme.textColor as string) || '#fff',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl" style={{ color: (theme.mutedColor as string) || '#888' }}>
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className="space-y-4">
          {shows.map((show, index) => {
            const date = formatDate(show.date);
            const isSoldOut = show.status === 'soldout';
            const isCancelled = show.status === 'cancelled';

            return (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col items-stretch gap-4 rounded-xl p-6 transition-all hover:scale-[1.02] md:flex-row md:items-center md:gap-8 ${
                  isCancelled ? 'opacity-50' : ''
                }`}
                style={{
                  backgroundColor: (theme.secondaryColor as string) || '#1a1a1a',
                  borderRadius: (theme.borderRadius as string) || '12px',
                }}
              >
                {/* Date Block */}
                <div className="flex flex-shrink-0 items-center gap-2 md:w-24 md:flex-col md:items-center md:gap-0">
                  <span className="text-sm font-bold" style={{ color: accentColor }}>
                    {date.month}
                  </span>
                  <span
                    className="text-3xl font-bold md:text-4xl"
                    style={{ color: (theme.textColor as string) || '#fff' }}
                  >
                    {date.day}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: (theme.mutedColor as string) || '#888' }}
                  >
                    {date.weekday}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="hidden h-16 w-px md:block"
                  style={{ backgroundColor: (theme.mutedColor as string) + '30' || '#333' }}
                />

                {/* Venue Info */}
                <div className="flex-1">
                  <h3
                    className={`mb-1 text-xl font-bold ${isCancelled ? 'line-through' : ''}`}
                    style={{ color: (theme.textColor as string) || '#fff' }}
                  >
                    {show.name}
                  </h3>
                  {show.venue && (
                    <div
                      className="flex items-center gap-2"
                      style={{ color: (theme.mutedColor as string) || '#888' }}
                    >
                      <MapPin size={16} />
                      <span>
                        {show.venue.name}
                        {show.venue.city && ` - ${show.venue.city}`}
                        {show.venue.state && `, ${show.venue.state}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {isCancelled ? (
                    <span
                      className="rounded-full px-4 py-2 text-sm font-semibold"
                      style={{
                        backgroundColor: '#ef4444' + '20',
                        color: '#ef4444',
                      }}
                    >
                      Cancelled
                    </span>
                  ) : isSoldOut ? (
                    <span
                      className="rounded-full px-4 py-2 text-sm font-semibold"
                      style={{
                        backgroundColor: (theme.mutedColor as string) + '30' || '#333',
                        color: (theme.mutedColor as string) || '#888',
                      }}
                    >
                      Sold Out
                    </span>
                  ) : showTicketLinks && show.ticketUrl ? (
                    <a
                      href={show.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 font-semibold transition-all hover:scale-105"
                      style={{
                        backgroundColor: accentColor,
                        color: '#fff',
                        borderRadius: (theme.borderRadius as string) || '8px',
                      }}
                    >
                      <Ticket size={18} />
                      <span>Tickets</span>
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span
                      className="rounded-full px-4 py-2 text-sm font-semibold"
                      style={{
                        backgroundColor: accentColor + '20',
                        color: accentColor,
                      }}
                    >
                      Free Entry
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
