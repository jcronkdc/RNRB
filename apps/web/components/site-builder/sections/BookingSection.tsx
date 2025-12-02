'use client';

import {
  Send,
  Calendar,
  MapPin,
  DollarSign,
  Music,
  Check,
  Loader2,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface BookingSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    email?: string;
    showPricing?: boolean;
    pricingNote?: string;
    availableFor?: string[];
    requirements?: string;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  subdomain?: string;
}

const defaultAvailableFor = [
  'Festivals',
  'Private Events',
  'Corporate Events',
  'Weddings',
  'Club Shows',
  'Concerts',
];

export function BookingSection({ content, styles, subdomain }: BookingSectionProps) {
  const [formData, setFormData] = useState({
    venueName: '',
    contactName: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: '',
    location: '',
    budget: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    title = 'Book Us',
    subtitle = 'Interested in having us perform at your event?',
    description,
    availableFor = defaultAvailableFor,
    showPricing = false,
    pricingNote,
    requirements,
  } = content;

  const bgColor = styles?.backgroundColor || 'transparent';
  const textColor = styles?.textColor || 'var(--text)';
  const accentColor = styles?.accentColor || 'var(--accent)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/sites/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          ...formData,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          venueName: '',
          contactName: '',
          email: '',
          phone: '',
          eventDate: '',
          eventType: '',
          location: '',
          budget: '',
          message: '',
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit booking request');
      }
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="px-4 py-16 md:px-8 lg:py-24" style={{ background: bgColor }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Info Section */}
          <div>
            <h2
              className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
              style={{ color: textColor }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mb-6 text-xl opacity-80" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
            {description && (
              <p className="mb-8 opacity-70" style={{ color: textColor }}>
                {description}
              </p>
            )}

            {/* Available For */}
            {availableFor.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 font-semibold" style={{ color: textColor }}>
                  Available For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableFor.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-full px-4 py-2 text-sm"
                      style={{
                        background: `${accentColor}20`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Note */}
            {showPricing && pricingNote && (
              <div className="mb-8 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="mb-2 flex items-center gap-2" style={{ color: accentColor }}>
                  <DollarSign size={20} />
                  <span className="font-semibold">Pricing</span>
                </div>
                <p className="text-sm opacity-80" style={{ color: textColor }}>
                  {pricingNote}
                </p>
              </div>
            )}

            {/* Requirements */}
            {requirements && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="mb-2 flex items-center gap-2" style={{ color: accentColor }}>
                  <Music size={20} />
                  <span className="font-semibold">Technical Requirements</span>
                </div>
                <p className="whitespace-pre-line text-sm opacity-80" style={{ color: textColor }}>
                  {requirements}
                </p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: accentColor }}
                >
                  <Check size={32} color="white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold" style={{ color: textColor }}>
                  Request Submitted!
                </h3>
                <p className="opacity-70" style={{ color: textColor }}>
                  We'll get back to you within 48 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 rounded-lg px-6 py-2"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="mb-6 text-xl font-bold" style={{ color: textColor }}>
                  Request a Booking
                </h3>

                {/* Venue/Organization */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                    Venue / Organization *
                  </label>
                  <input
                    type="text"
                    name="venueName"
                    value={formData.venueName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      color: textColor,
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                    placeholder="The Blue Note"
                  />
                </div>

                {/* Contact Name & Email */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg px-4 py-3"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        color: textColor,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg px-4 py-3"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        color: textColor,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                      placeholder="john@venue.com"
                    />
                  </div>
                </div>

                {/* Event Date & Type */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                      Event Date *
                    </label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                        style={{ color: textColor }}
                      />
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg py-3 pl-10 pr-4"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          color: textColor,
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                      Event Type *
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg px-4 py-3"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        color: textColor,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <option value="">Select type...</option>
                      {availableFor.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                      style={{ color: textColor }}
                    />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg py-3 pl-10 pr-4"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        color: textColor,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                    Approximate Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full rounded-lg px-4 py-3"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      color: textColor,
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="under-1k">Under $1,000</option>
                    <option value="1k-5k">$1,000 - $5,000</option>
                    <option value="5k-10k">$5,000 - $10,000</option>
                    <option value="10k-25k">$10,000 - $25,000</option>
                    <option value="25k-plus">$25,000+</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: textColor }}>
                    Additional Details
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full resize-none rounded-lg px-4 py-3"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      color: textColor,
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                    placeholder="Tell us more about your event..."
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-4 font-semibold transition-transform hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Editor component
export function BookingSectionEditor({
  content,
  onChange,
}: {
  content: BookingSectionProps['content'];
  onChange: (content: BookingSectionProps['content']) => void;
}) {
  const [newAvailable, setNewAvailable] = useState('');

  const addAvailableFor = () => {
    if (!newAvailable.trim()) return;
    const updated = [...(content.availableFor || defaultAvailableFor), newAvailable.trim()];
    onChange({ ...content, availableFor: updated });
    setNewAvailable('');
  };

  const removeAvailableFor = (index: number) => {
    const updated = (content.availableFor || defaultAvailableFor).filter((_, i) => i !== index);
    onChange({ ...content, availableFor: updated });
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
          placeholder="Book Us"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Subtitle
        </label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="Interested in having us perform?"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Description
        </label>
        <textarea
          value={content.description || ''}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="Brief description about your booking process..."
        />
      </div>

      {/* Available For */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Available For
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {(content.availableFor || defaultAvailableFor).map((item, index) => (
            <span
              key={index}
              className="flex items-center gap-2 rounded-full px-3 py-1"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {item}
              <button onClick={() => removeAvailableFor(index)} className="hover:opacity-70">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAvailable}
            onChange={(e) => setNewAvailable(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="Add event type..."
            onKeyDown={(e) => e.key === 'Enter' && addAvailableFor()}
          />
          <button
            onClick={addAvailableFor}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Show Pricing */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={content.showPricing === true}
          onChange={(e) => onChange({ ...content, showPricing: e.target.checked })}
          className="h-4 w-4 rounded"
        />
        <span style={{ color: 'var(--text)' }}>Show Pricing Section</span>
      </label>

      {/* Pricing Note */}
      {content.showPricing && (
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Pricing Note
          </label>
          <textarea
            value={content.pricingNote || ''}
            onChange={(e) => onChange({ ...content, pricingNote: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-lg px-4 py-2"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            placeholder="Pricing varies based on event type, location, and duration..."
          />
        </div>
      )}

      {/* Technical Requirements */}
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Technical Requirements
        </label>
        <textarea
          value={content.requirements || ''}
          onChange={(e) => onChange({ ...content, requirements: e.target.value })}
          rows={4}
          className="w-full resize-none rounded-lg px-4 py-2"
          style={{
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          placeholder="- Full PA system&#10;- 3 monitor mixes&#10;- 2 hour soundcheck"
        />
      </div>
    </div>
  );
}
