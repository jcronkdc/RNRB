'use client';

import { Ticket, MapPin, Clock, Star, ChevronDown, ChevronUp } from '@/components/ui/custom-icons';
import { useState } from 'react';

interface TicketTier {
  id: string;
  name: string;
  price: number;
  currency?: string;
  description?: string;
  available?: boolean;
  soldOut?: boolean;
  perks?: string[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  city: string;
  country?: string;
  description?: string;
  image?: string;
  // Tickets
  ticketUrl?: string;
  ticketPlatform?: 'eventbrite' | 'dice' | 'ticketmaster' | 'seetickets' | 'bandsintown' | 'custom';
  ticketTiers?: TicketTier[];
  priceRange?: { min: number; max: number; currency?: string };
  // Status
  status?: 'on_sale' | 'sold_out' | 'cancelled' | 'postponed' | 'coming_soon';
  // Additional
  ageRestriction?: string;
  doorsTime?: string;
  supportingActs?: string[];
  isHeadliner?: boolean;
  isFestival?: boolean;
}

interface TicketsSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    events?: Event[];
    showPastEvents?: boolean;
    embedWidget?: boolean;
    bandsintown_id?: string;
    songkick_id?: string;
  };
  theme?: Record<string, unknown>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  on_sale: { label: 'On Sale', color: '#22c55e' },
  sold_out: { label: 'Sold Out', color: '#ef4444' },
  cancelled: { label: 'Cancelled', color: '#6b7280' },
  postponed: { label: 'Postponed', color: '#f59e0b' },
  coming_soon: { label: 'Coming Soon', color: '#3b82f6' },
};

const PLATFORM_NAMES: Record<string, string> = {
  eventbrite: 'Eventbrite',
  dice: 'DICE',
  ticketmaster: 'Ticketmaster',
  seetickets: 'See Tickets',
  bandsintown: 'Bandsintown',
  custom: 'Get Tickets',
};

export function TicketsSection({ content, theme }: TicketsSectionProps) {
  const {
    headline = 'Tickets',
    subheadline = 'Get tickets to upcoming shows',
    events = [],
    showPastEvents = false,
    embedWidget = false,
    bandsintown_id = '',
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const pastEvents = events.filter((e) => new Date(e.date) < now);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  };

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
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

        {/* Bandsintown Widget */}
        {embedWidget && bandsintown_id && (
          <div className="mb-12">
            <a
              className="bit-widget-initializer"
              data-artist-name={bandsintown_id}
              data-display-local-dates="false"
              data-display-past-dates="false"
              data-auto-style="false"
              data-text-color="var(--text)"
              data-link-color={accentColor}
              data-background-color="transparent"
              data-display-limit="15"
              data-link-text-color="#FFFFFF"
              href={`https://www.bandsintown.com/${bandsintown_id}?came_from=267&utm_medium=web&utm_source=home&utm_campaign=search_bar`}
            >
              Get Tickets
            </a>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const dateInfo = formatDate(event.date);
              const statusInfo = event.status ? STATUS_LABELS[event.status] : null;
              const isExpanded = expandedEvent === event.id;

              return (
                <div
                  key={event.id}
                  className="overflow-hidden rounded-xl"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  {/* Main Row */}
                  <div className="flex items-center gap-4 p-4 md:gap-6 md:p-6">
                    {/* Date */}
                    <div
                      className="shrink-0 rounded-xl p-3 text-center"
                      style={{ background: 'var(--bg)', minWidth: '70px' }}
                    >
                      <div
                        className="text-xs font-medium uppercase"
                        style={{ color: 'var(--muted)' }}
                      >
                        {dateInfo.month}
                      </div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {dateInfo.date}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {dateInfo.day}
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold" style={{ color: 'var(--text)' }}>
                          {event.title}
                        </h3>
                        {event.isHeadliner && (
                          <Star
                            size={14}
                            className="shrink-0"
                            style={{ color: accentColor }}
                          />
                        )}
                        {event.isFestival && (
                          <span
                            className="shrink-0 rounded px-2 py-0.5 text-xs font-medium"
                            style={{ background: `${accentColor}20`, color: accentColor }}
                          >
                            Festival
                          </span>
                        )}
                      </div>
                      <div
                        className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                        style={{ color: 'var(--muted)' }}
                      >
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {event.venue}, {event.city}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {event.time}
                          </span>
                        )}
                      </div>
                      {event.supportingActs && event.supportingActs.length > 0 && (
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                          with {event.supportingActs.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Price & Status */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {statusInfo && (
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </span>
                      )}
                      {event.priceRange && event.status !== 'sold_out' && (
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>
                          {event.priceRange.min === event.priceRange.max
                            ? formatPrice(event.priceRange.min, event.priceRange.currency)
                            : `${formatPrice(event.priceRange.min, event.priceRange.currency)} - ${formatPrice(event.priceRange.max, event.priceRange.currency)}`}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      {event.ticketUrl &&
                        event.status !== 'sold_out' &&
                        event.status !== 'cancelled' && (
                          <a
                            href={event.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all hover:scale-105"
                            style={{ background: accentColor, color: '#fff' }}
                          >
                            <Ticket size={16} />
                            <span className="hidden sm:inline">
                              {PLATFORM_NAMES[event.ticketPlatform || 'custom']}
                            </span>
                          </a>
                        )}
                      {event.ticketTiers && event.ticketTiers.length > 0 && (
                        <button
                          onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                          className="rounded-lg p-2 transition-colors hover:bg-white/5"
                          style={{ color: 'var(--muted)' }}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t p-4 md:p-6" style={{ borderColor: 'var(--border)' }}>
                      {/* Event Image */}
                      {event.image && (
                        <div className="mb-6 overflow-hidden rounded-xl">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="h-48 w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Description */}
                      {event.description && (
                        <p className="mb-6" style={{ color: 'var(--text)' }}>
                          {event.description}
                        </p>
                      )}

                      {/* Event Details */}
                      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p
                            className="text-xs font-medium uppercase"
                            style={{ color: 'var(--muted)' }}
                          >
                            Date
                          </p>
                          <p style={{ color: 'var(--text)' }}>{dateInfo.full}</p>
                        </div>
                        {event.doorsTime && (
                          <div>
                            <p
                              className="text-xs font-medium uppercase"
                              style={{ color: 'var(--muted)' }}
                            >
                              Doors
                            </p>
                            <p style={{ color: 'var(--text)' }}>{event.doorsTime}</p>
                          </div>
                        )}
                        {event.ageRestriction && (
                          <div>
                            <p
                              className="text-xs font-medium uppercase"
                              style={{ color: 'var(--muted)' }}
                            >
                              Age
                            </p>
                            <p style={{ color: 'var(--text)' }}>{event.ageRestriction}</p>
                          </div>
                        )}
                        <div>
                          <p
                            className="text-xs font-medium uppercase"
                            style={{ color: 'var(--muted)' }}
                          >
                            Venue
                          </p>
                          <p style={{ color: 'var(--text)' }}>
                            {event.venue}, {event.city}
                            {event.country && `, ${event.country}`}
                          </p>
                        </div>
                      </div>

                      {/* Ticket Tiers */}
                      {event.ticketTiers && event.ticketTiers.length > 0 && (
                        <div>
                          <h4 className="mb-4 font-semibold" style={{ color: 'var(--text)' }}>
                            Ticket Options
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {event.ticketTiers.map((tier) => (
                              <div
                                key={tier.id}
                                className={`rounded-xl p-4 ${tier.soldOut ? 'opacity-60' : ''}`}
                                style={{ background: 'var(--bg)' }}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <h5 className="font-semibold" style={{ color: 'var(--text)' }}>
                                    {tier.name}
                                  </h5>
                                  <span className="font-bold" style={{ color: accentColor }}>
                                    {formatPrice(tier.price, tier.currency)}
                                  </span>
                                </div>
                                {tier.description && (
                                  <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                                    {tier.description}
                                  </p>
                                )}
                                {tier.perks && tier.perks.length > 0 && (
                                  <ul className="space-y-1">
                                    {tier.perks.map((perk, i) => (
                                      <li
                                        key={i}
                                        className="flex items-center gap-2 text-sm"
                                        style={{ color: 'var(--muted)' }}
                                      >
                                        <Star size={12} style={{ color: accentColor }} />
                                        {perk}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {tier.soldOut && (
                                  <p className="mt-2 text-sm font-medium text-red-400">Sold Out</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* No Upcoming Events */}
        {upcomingEvents.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Ticket size={48} className="mx-auto mb-4 opacity-50" />
            <p>No upcoming shows scheduled</p>
            <p className="text-sm">Check back soon for new dates</p>
          </div>
        )}

        {/* Past Events */}
        {showPastEvents && pastEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--text)' }}>
              Past Shows
            </h2>
            <div className="space-y-2">
              {pastEvents.slice(0, 10).map((event) => {
                const dateInfo = formatDate(event.date);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-xl p-4"
                    style={{ background: 'var(--panel)' }}
                  >
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>
                      {dateInfo.month} {dateInfo.date}, {dateInfo.year}
                    </div>
                    <div className="flex-1">
                      <span style={{ color: 'var(--text)' }}>{event.venue}</span>
                      <span style={{ color: 'var(--muted)' }}> • {event.city}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
