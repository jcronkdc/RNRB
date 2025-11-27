'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, Sparkles } from 'lucide-react';

interface MailingListSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    provider?: 'native' | 'mailchimp' | 'convertkit';
    successMessage?: string;
  };
  theme: Record<string, unknown>;
  animation?: string;
  siteId: string;
}

export function MailingListSection({ content, theme, animation, siteId }: MailingListSectionProps) {
  const {
    title = 'Stay Updated',
    subtitle = 'Join our mailing list for exclusive news and updates',
    buttonText = 'Subscribe',
    successMessage = "You're in! Check your email for confirmation.",
  } = content;

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const accentColor = (theme.accentColor as string) || '#ff6347';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/sites/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, siteId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="px-4 py-20"
      style={{ backgroundColor: (theme.primaryColor as string) || '#000' }}
    >
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={animation === 'slide-up' ? { opacity: 0, y: 40 } : {}}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: accentColor + '20' }}
          >
            <Mail size={32} style={{ color: accentColor }} />
          </motion.div>

          <h2
            className="mb-4 text-3xl font-bold md:text-4xl"
            style={{
              fontFamily: (theme.fontHeading as string) || 'inherit',
              color: (theme.textColor as string) || '#fff',
            }}
          >
            {title}
          </h2>

          <p
            className="mx-auto mb-8 max-w-lg text-lg"
            style={{ color: (theme.mutedColor as string) || '#888' }}
          >
            {subtitle}
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={24} style={{ color: '#22c55e' }} />
                <Sparkles size={20} style={{ color: accentColor }} />
              </div>
              <p style={{ color: (theme.textColor as string) || '#fff' }}>{successMessage}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 border px-4 py-3 focus:outline-none focus:ring-2"
                  style={
                    {
                      backgroundColor: (theme.secondaryColor as string) || '#1a1a1a',
                      color: (theme.textColor as string) || '#fff',
                      borderColor: (theme.mutedColor as string) + '30' || '#333',
                      borderRadius: (theme.borderRadius as string) || '8px',
                      '--tw-ring-color': accentColor,
                    } as React.CSSProperties
                  }
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-8 py-3 font-semibold transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    backgroundColor: accentColor,
                    color: '#fff',
                    borderRadius: (theme.borderRadius as string) || '8px',
                  }}
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : buttonText}
                </button>
              </div>

              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

              <p className="mt-4 text-xs" style={{ color: (theme.mutedColor as string) || '#666' }}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
