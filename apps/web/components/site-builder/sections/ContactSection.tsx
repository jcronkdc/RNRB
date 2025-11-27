'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle } from 'lucide-react';

interface ContactSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    fields?: string[];
    inquiryTypes?: string[];
    submitTo?: 'email' | 'webhook';
    email?: string;
    successMessage?: string;
  };
  theme: Record<string, unknown>;
  animation?: string;
  siteId: string;
}

export function ContactSection({ content, theme, animation, siteId }: ContactSectionProps) {
  const {
    title = 'Get In Touch',
    subtitle = '',
    inquiryTypes = ['Booking', 'Press', 'Fan Message', 'Other'],
    successMessage = 'Thank you! Your message has been sent.',
  } = content;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: inquiryTypes[0] || '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const accentColor = (theme.accentColor as string) || '#ff6347';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/sites/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, siteId }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        inquiryType: inquiryTypes[0] || '',
        subject: '',
        message: '',
      });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = {
    backgroundColor: (theme.primaryColor as string) || '#000',
    color: (theme.textColor as string) || '#fff',
    borderColor: (theme.mutedColor as string) + '50' || '#333',
    borderRadius: (theme.borderRadius as string) || '8px',
  };

  return (
    <section
      id="contact"
      className="px-4 py-20"
      style={{ backgroundColor: (theme.secondaryColor as string) || '#1a1a1a' }}
    >
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={animation === 'fade-in' ? { opacity: 0, y: 40 } : {}}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
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
            <p className="text-lg" style={{ color: (theme.mutedColor as string) || '#888' }}>
              {subtitle}
            </p>
          )}
        </motion.div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <CheckCircle size={64} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
            <p className="text-xl" style={{ color: (theme.textColor as string) || '#fff' }}>
              {successMessage}
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 px-6 py-2 text-sm underline"
              style={{ color: accentColor }}
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: (theme.mutedColor as string) || '#888' }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border px-4 py-3 focus:outline-none focus:ring-2"
                  style={
                    {
                      ...inputStyles,
                      '--tw-ring-color': accentColor,
                    } as React.CSSProperties
                  }
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: (theme.mutedColor as string) || '#888' }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: (theme.mutedColor as string) || '#888' }}
                >
                  Inquiry Type
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full border px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                >
                  {inquiryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: (theme.mutedColor as string) || '#888' }}
                >
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border px-4 py-3 focus:outline-none focus:ring-2"
                  style={inputStyles}
                  placeholder="Subject"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: (theme.mutedColor as string) || '#888' }}
              >
                Message *
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full resize-none border px-4 py-3 focus:outline-none focus:ring-2"
                style={inputStyles}
                placeholder="Your message..."
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 py-4 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                backgroundColor: accentColor,
                color: '#fff',
                borderRadius: (theme.borderRadius as string) || '8px',
              }}
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
          </motion.form>
        )}
      </div>
    </section>
  );
}
