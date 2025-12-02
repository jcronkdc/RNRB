'use client';

import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Check,
  Calendar,
  Mic,
  MessageSquare,
  Clock,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

interface ContactPageSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    // Contact Info
    email?: string;
    bookingEmail?: string;
    pressEmail?: string;
    phone?: string;
    location?: string;
    // Management
    manager?: { name: string; email: string; company?: string };
    agent?: { name: string; email: string; company?: string };
    publicist?: { name: string; email: string; company?: string };
    label?: { name: string; email: string; company?: string };
    // Social Links
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    spotify?: string;
    // Form Settings
    showBookingForm?: boolean;
    showGeneralForm?: boolean;
    showPressForm?: boolean;
    inquiryTypes?: string[];
    // Response Time
    responseTime?: string;
    // FAQ
    faqs?: Array<{ question: string; answer: string }>;
  };
  theme?: Record<string, unknown>;
  siteId?: string;
}

export function ContactPageSection({ content, theme, siteId }: ContactPageSectionProps) {
  const {
    headline = 'Get in Touch',
    subheadline = "We'd love to hear from you",
    email = '',
    bookingEmail = '',
    pressEmail = '',
    phone = '',
    location = '',
    manager,
    agent,
    publicist,
    label,
    instagram = '',
    twitter = '',
    facebook = '',
    youtube = '',
    showBookingForm = true,
    showGeneralForm = true,
    inquiryTypes = ['General Inquiry', 'Booking Request', 'Press/Media', 'Collaboration', 'Other'],
    responseTime = '24-48 hours',
    faqs = [],
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';

  const [formType, setFormType] = useState<'general' | 'booking'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    subject: '',
    message: '',
    // Booking specific
    eventDate: '',
    eventType: '',
    venue: '',
    budget: '',
    attendees: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/sites/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          formType,
          ...formData,
        }),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { id: 'instagram', url: instagram, icon: Instagram, label: 'Instagram' },
    { id: 'twitter', url: twitter, icon: Twitter, label: 'Twitter' },
    { id: 'facebook', url: facebook, icon: Facebook, label: 'Facebook' },
    { id: 'youtube', url: youtube, icon: Youtube, label: 'YouTube' },
  ].filter((s) => s.url);

  const contacts = [
    { type: 'General', email, icon: Mail },
    { type: 'Booking', email: bookingEmail, icon: Calendar },
    { type: 'Press', email: pressEmail, icon: Mic },
  ].filter((c) => c.email);

  const team = [
    { role: 'Manager', ...manager },
    { role: 'Booking Agent', ...agent },
    { role: 'Publicist', ...publicist },
    { role: 'Record Label', ...label },
  ].filter((t) => t.name);

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            {/* Quick Contact */}
            {contacts.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--panel)' }}>
                <h2 className="mb-6 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Contact Us Directly
                </h2>
                <div className="space-y-4">
                  {contacts.map((contact, i) => (
                    <a
                      key={i}
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/5"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: `${accentColor}20` }}
                      >
                        <contact.icon size={24} style={{ color: accentColor }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          {contact.type} Inquiries
                        </p>
                        <p style={{ color: accentColor }}>{contact.email}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Phone & Location */}
            {(phone || location) && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--panel)' }}>
                <div className="space-y-4">
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/5"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: `${accentColor}20` }}
                      >
                        <Phone size={24} style={{ color: accentColor }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          Phone
                        </p>
                        <p style={{ color: 'var(--muted)' }}>{phone}</p>
                      </div>
                    </a>
                  )}
                  {location && (
                    <div className="flex items-center gap-4 p-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: `${accentColor}20` }}
                      >
                        <MapPin size={24} style={{ color: accentColor }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text)' }}>
                          Based In
                        </p>
                        <p style={{ color: 'var(--muted)' }}>{location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Management Team */}
            {team.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--panel)' }}>
                <h2 className="mb-6 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Management & Representation
                </h2>
                <div className="space-y-4">
                  {team.map((person, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg)' }}>
                      <p className="text-sm font-medium" style={{ color: accentColor }}>
                        {person.role}
                      </p>
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>
                        {person.name}
                      </p>
                      {person.company && (
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          {person.company}
                        </p>
                      )}
                      {person.email && (
                        <a
                          href={`mailto:${person.email}`}
                          className="mt-1 inline-block text-sm hover:underline"
                          style={{ color: accentColor }}
                        >
                          {person.email}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: 'var(--panel)' }}>
                <h2 className="mb-6 text-xl font-semibold" style={{ color: 'var(--text)' }}>
                  Follow Us
                </h2>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl px-4 py-3 transition-colors hover:bg-white/5"
                      style={{ background: 'var(--bg)' }}
                    >
                      <social.icon size={20} style={{ color: accentColor }} />
                      <span style={{ color: 'var(--text)' }}>{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Response Time */}
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
              <Clock size={16} />
              <span>Typical response time: {responseTime}</span>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--panel)' }}>
              {isSubmitted ? (
                <div className="py-12 text-center">
                  <div
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ background: `${accentColor}20` }}
                  >
                    <Check size={40} style={{ color: accentColor }} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: 'var(--muted)' }}>
                    We&apos;ll get back to you within {responseTime}.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        inquiryType: '',
                        subject: '',
                        message: '',
                        eventDate: '',
                        eventType: '',
                        venue: '',
                        budget: '',
                        attendees: '',
                      });
                    }}
                    className="mt-6 rounded-lg px-6 py-2 font-medium transition-colors hover:bg-white/10"
                    style={{ color: accentColor }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  {/* Form Type Toggle */}
                  {showBookingForm && showGeneralForm && (
                    <div className="mb-6 flex gap-2">
                      <button
                        onClick={() => setFormType('general')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-colors ${
                          formType === 'general' ? '' : 'hover:bg-white/5'
                        }`}
                        style={{
                          background: formType === 'general' ? accentColor : 'var(--bg)',
                          color: formType === 'general' ? '#fff' : 'var(--text)',
                        }}
                      >
                        <MessageSquare size={18} />
                        General Inquiry
                      </button>
                      <button
                        onClick={() => setFormType('booking')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-colors ${
                          formType === 'booking' ? '' : 'hover:bg-white/5'
                        }`}
                        style={{
                          background: formType === 'booking' ? accentColor : 'var(--bg)',
                          color: formType === 'booking' ? '#fff' : 'var(--text)',
                        }}
                      >
                        <Calendar size={18} />
                        Booking Request
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="mb-2 block text-sm font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg px-4 py-3"
                          style={{
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="mb-2 block text-sm font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg px-4 py-3"
                          style={{
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Inquiry Type */}
                    {formType === 'general' && (
                      <div>
                        <label
                          htmlFor="inquiry-type"
                          className="mb-2 block text-sm font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          Inquiry Type
                        </label>
                        <select
                          id="inquiry-type"
                          value={formData.inquiryType}
                          onChange={(e) =>
                            setFormData({ ...formData, inquiryType: e.target.value })
                          }
                          className="w-full rounded-lg px-4 py-3"
                          style={{
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <option value="">Select type...</option>
                          {inquiryTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Booking Specific Fields */}
                    {formType === 'booking' && (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="event-date"
                              className="mb-2 block text-sm font-medium"
                              style={{ color: 'var(--text)' }}
                            >
                              Event Date *
                            </label>
                            <input
                              id="event-date"
                              type="date"
                              required
                              value={formData.eventDate}
                              onChange={(e) =>
                                setFormData({ ...formData, eventDate: e.target.value })
                              }
                              className="w-full rounded-lg px-4 py-3"
                              style={{
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                              }}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="event-type"
                              className="mb-2 block text-sm font-medium"
                              style={{ color: 'var(--text)' }}
                            >
                              Event Type
                            </label>
                            <select
                              id="event-type"
                              value={formData.eventType}
                              onChange={(e) =>
                                setFormData({ ...formData, eventType: e.target.value })
                              }
                              className="w-full rounded-lg px-4 py-3"
                              style={{
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              <option value="">Select type...</option>
                              <option value="concert">Concert</option>
                              <option value="festival">Festival</option>
                              <option value="private">Private Event</option>
                              <option value="corporate">Corporate Event</option>
                              <option value="wedding">Wedding</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="venue"
                            className="mb-2 block text-sm font-medium"
                            style={{ color: 'var(--text)' }}
                          >
                            Venue / Location
                          </label>
                          <input
                            id="venue"
                            type="text"
                            value={formData.venue}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                            placeholder="Venue name and city"
                            className="w-full rounded-lg px-4 py-3"
                            style={{
                              background: 'var(--bg)',
                              color: 'var(--text)',
                              border: '1px solid var(--border)',
                            }}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="budget"
                              className="mb-2 block text-sm font-medium"
                              style={{ color: 'var(--text)' }}
                            >
                              Budget Range
                            </label>
                            <select
                              id="budget"
                              value={formData.budget}
                              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                              className="w-full rounded-lg px-4 py-3"
                              style={{
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              <option value="">Select range...</option>
                              <option value="under-1k">Under $1,000</option>
                              <option value="1k-5k">$1,000 - $5,000</option>
                              <option value="5k-10k">$5,000 - $10,000</option>
                              <option value="10k-25k">$10,000 - $25,000</option>
                              <option value="25k+">$25,000+</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="attendees"
                              className="mb-2 block text-sm font-medium"
                              style={{ color: 'var(--text)' }}
                            >
                              Expected Attendance
                            </label>
                            <input
                              id="attendees"
                              type="text"
                              value={formData.attendees}
                              onChange={(e) =>
                                setFormData({ ...formData, attendees: e.target.value })
                              }
                              placeholder="e.g., 500 people"
                              className="w-full rounded-lg px-4 py-3"
                              style={{
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        Subject *
                      </label>
                      <input
                        id="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-lg px-4 py-3"
                        style={{
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={
                          formType === 'booking'
                            ? 'Tell us about your event...'
                            : 'How can we help?'
                        }
                        className="w-full rounded-lg px-4 py-3"
                        style={{
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ background: accentColor, color: '#fff' }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 text-center text-3xl font-bold" style={{ color: 'var(--text)' }}>
              Frequently Asked Questions
            </h2>
            <div className="mx-auto max-w-3xl space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl"
                  style={{ background: 'var(--panel)' }}
                >
                  <summary
                    className="flex cursor-pointer items-center justify-between p-6 font-medium"
                    style={{ color: 'var(--text)' }}
                  >
                    {faq.question}
                    <span className="transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="px-6 pb-6" style={{ color: 'var(--muted)' }}>
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
