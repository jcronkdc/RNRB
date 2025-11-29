'use client';

import {
  Video,
  Clock,
  Users,
  Star,
  Gift,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

interface MeetGreetOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  duration: number; // in minutes
  type: 'video_call' | 'video_message' | 'group_call' | 'vip_experience';
  maxParticipants?: number;
  perks?: string[];
  popular?: boolean;
  available?: boolean;
  availableSlots?: number;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

interface MeetGreetSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    artistName?: string;
    artistImage?: string;
    options?: MeetGreetOption[];
    // Booking
    availableSlots?: TimeSlot[];
    timezone?: string;
    // Customization
    allowCustomMessage?: boolean;
    showTestimonials?: boolean;
    testimonials?: Array<{
      name: string;
      message: string;
      rating: number;
      date?: string;
    }>;
  };
  theme?: Record<string, unknown>;
  siteId?: string;
}

const TYPE_ICONS: Record<string, typeof Video> = {
  video_call: Video,
  video_message: MessageSquare,
  group_call: Users,
  vip_experience: Star,
};

const DEFAULT_OPTIONS: MeetGreetOption[] = [
  {
    id: 'video-message',
    name: 'Personal Video Message',
    description: 'A custom recorded video message just for you',
    price: 49,
    duration: 1,
    type: 'video_message',
    perks: ['Personalized greeting', 'Downloadable video', 'Delivered in 7 days'],
  },
  {
    id: 'video-call',
    name: '1-on-1 Video Call',
    description: 'Private video chat with me',
    price: 99,
    duration: 15,
    type: 'video_call',
    perks: ['15 minutes private call', 'Ask anything', 'Screen recording allowed'],
    popular: true,
  },
  {
    id: 'group-call',
    name: 'Group Hangout',
    description: 'Join a group video call with other fans',
    price: 29,
    duration: 30,
    type: 'group_call',
    maxParticipants: 10,
    perks: ['30 minute session', 'Meet other fans', 'Q&A session'],
  },
];

export function MeetGreetSection({ content, theme, siteId }: MeetGreetSectionProps) {
  const {
    headline = 'Meet & Greet',
    subheadline = 'Book a personal experience',
    artistName = '',
    artistImage = '',
    options = DEFAULT_OPTIONS,
    availableSlots = [],
    timezone = 'America/New_York',
    allowCustomMessage = true,
    showTestimonials = true,
    testimonials = [],
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const formatPrice = (price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + weekOffset * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleBook = async () => {
    if (!selectedOption) return;

    setIsBooking(true);

    try {
      // In production, this would create a booking and payment
      await fetch('/api/sites/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          optionId: selectedOption,
          slotId: selectedSlot,
          customMessage,
        }),
      });

      setBookingComplete(true);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const selectedOptionData = options.find((o) => o.id === selectedOption);

  if (bookingComplete) {
    return (
      <section className="py-20" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: `${accentColor}20` }}
          >
            <Check size={40} style={{ color: accentColor }} />
          </div>
          <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Booking Confirmed!
          </h2>
          <p className="mb-8 text-lg" style={{ color: 'var(--muted)' }}>
            You&apos;ll receive a confirmation email with all the details.
            {selectedOptionData?.type === 'video_message' &&
              ' Your video will be delivered within 7 days.'}
          </p>
          <button
            onClick={() => {
              setBookingComplete(false);
              setSelectedOption(null);
              setSelectedSlot(null);
              setCustomMessage('');
            }}
            className="rounded-xl px-6 py-3 font-medium transition-colors hover:bg-white/10"
            style={{ background: 'var(--panel)', color: 'var(--text)' }}
          >
            Book Another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          {artistImage && (
            <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full">
              <img src={artistImage} alt={artistName} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Options */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {options.map((option) => {
            const TypeIcon = TYPE_ICONS[option.type] || Video;
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                type="button"
                className={`relative cursor-pointer overflow-hidden rounded-2xl p-6 text-left transition-all ${
                  isSelected ? 'scale-105' : 'hover:scale-[1.02]'
                }`}
                style={{
                  background: 'var(--panel)',
                  border: isSelected ? `2px solid ${accentColor}` : '1px solid var(--border)',
                }}
                onClick={() => setSelectedOption(option.id)}
              >
                {/* Popular Badge */}
                {option.popular && (
                  <div
                    className="absolute -right-8 top-6 rotate-45 px-10 py-1 text-xs font-semibold text-white"
                    style={{ background: accentColor }}
                  >
                    Popular
                  </div>
                )}

                {/* Icon */}
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${accentColor}20` }}
                >
                  <TypeIcon size={24} style={{ color: accentColor }} />
                </div>

                {/* Name & Price */}
                <h3 className="mb-1 text-xl font-bold" style={{ color: 'var(--text)' }}>
                  {option.name}
                </h3>
                <div className="mb-2">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {formatPrice(option.price, option.currency)}
                  </span>
                </div>

                {/* Duration & Participants */}
                <div
                  className="mb-4 flex items-center gap-4 text-sm"
                  style={{ color: 'var(--muted)' }}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDuration(option.duration)}
                  </span>
                  {option.maxParticipants && (
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      Max {option.maxParticipants}
                    </span>
                  )}
                </div>

                {option.description && (
                  <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                    {option.description}
                  </p>
                )}

                {/* Perks */}
                {option.perks && option.perks.length > 0 && (
                  <ul className="space-y-2">
                    {option.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check size={14} style={{ color: accentColor }} />
                        <span style={{ color: 'var(--text)' }}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div
                    className="absolute bottom-4 right-4 flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ background: accentColor }}
                  >
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Booking Form */}
        {selectedOption && (
          <div className="mx-auto max-w-2xl rounded-2xl p-6" style={{ background: 'var(--panel)' }}>
            <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--text)' }}>
              Complete Your Booking
            </h2>

            {/* Time Slot Selection (for video calls) */}
            {selectedOptionData?.type !== 'video_message' && availableSlots.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 font-medium" style={{ color: 'var(--text)' }}>
                  Select a Time
                </p>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))}
                    disabled={currentWeek === 0}
                    className="rounded-lg p-2 transition-colors hover:bg-white/5 disabled:opacity-30"
                    style={{ color: 'var(--muted)' }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span style={{ color: 'var(--text)' }}>
                    {getWeekDates(currentWeek)[0].toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => setCurrentWeek((w) => w + 1)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/5"
                    style={{ color: 'var(--muted)' }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDates(currentWeek).map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const slots = availableSlots.filter((s) => s.date === dateStr);
                    const hasSlots = slots.some((s) => s.available);

                    return (
                      <div key={dateStr} className="text-center">
                        <div className="mb-1 text-xs" style={{ color: 'var(--muted)' }}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div
                          className={`rounded-lg py-2 text-sm ${hasSlots ? 'cursor-pointer hover:bg-white/5' : 'opacity-30'}`}
                          style={{ background: 'var(--bg)', color: 'var(--text)' }}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                  Timezone: {timezone}
                </p>
              </div>
            )}

            {/* Custom Message */}
            {allowCustomMessage && (
              <div className="mb-6">
                <label
                  htmlFor="custom-message"
                  className="mb-2 block font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  {selectedOptionData?.type === 'video_message'
                    ? 'What should I say in your video?'
                    : 'Any special requests or topics?'}
                </label>
                <textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Tell me about the occasion, who it's for, or anything you'd like me to mention..."
                  rows={4}
                  className="w-full rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBook}
              disabled={isBooking}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: accentColor, color: '#fff' }}
            >
              {isBooking ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift size={20} />
                  Book for {formatPrice(selectedOptionData?.price || 0)}
                </>
              )}
            </button>
          </div>
        )}

        {/* Testimonials */}
        {showTestimonials && testimonials.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-center text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Fan Experiences
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="rounded-xl p-6" style={{ background: 'var(--panel)' }}>
                  <div className="mb-3 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        fill={j < testimonial.rating ? accentColor : 'transparent'}
                        style={{ color: j < testimonial.rating ? accentColor : 'var(--muted)' }}
                      />
                    ))}
                  </div>
                  <p className="mb-4 italic" style={{ color: 'var(--text)' }}>
                    &ldquo;{testimonial.message}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      {testimonial.name}
                    </span>
                    {testimonial.date && (
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>
                        {testimonial.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {options.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Video size={48} className="mx-auto mb-4 opacity-50" />
            <p>No meet & greet options available yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
