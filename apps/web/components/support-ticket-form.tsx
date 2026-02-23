'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface SupportTicketFormProps {
  variant?: 'default' | 'modal' | 'embedded';
  onSuccess?: () => void;
  className?: string;
}

// Custom icons
const IconTicket = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const IconCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconPaperclip = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const IconX = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const IconChevron = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CATEGORIES = [
  { value: 'GENERAL', label: 'General Question' },
  { value: 'ACCOUNT', label: 'Account & Login' },
  { value: 'BILLING', label: 'Billing & Subscription' },
  { value: 'TECHNICAL', label: 'Technical Issue' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'COLLABORATION', label: 'Collaboration Issues' },
  { value: 'VIDEO_CALLS', label: 'Video/Audio Quality' },
  { value: 'AI_ASSISTANT', label: 'AI Assistant' },
  { value: 'SECURITY', label: 'Security Concern' },
  { value: 'FEEDBACK', label: 'General Feedback' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', description: 'Not urgent' },
  { value: 'NORMAL', label: 'Normal', description: 'Standard request' },
  { value: 'HIGH', label: 'High', description: 'Need help soon' },
  { value: 'URGENT', label: 'Urgent', description: 'Blocking my work' },
];

export function SupportTicketForm({
  variant = 'default',
  onSuccess,
  className = '',
}: SupportTicketFormProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ticketNumber, setTicketNumber] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    name: session?.user?.name || '',
    subject: '',
    description: '',
    category: 'GENERAL',
    priority: 'NORMAL',
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.subject || !formData.description) return;

    setStatus('loading');

    try {
      // In a real implementation, you'd upload attachments first
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentPage: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setTicketNumber(data.ticketNumber);
        setMessage(data.message || 'Your ticket has been submitted!');
        onSuccess?.();
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to submit ticket. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Connection error. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.size <= 10 * 1024 * 1024 // 10MB max
    );
    setAttachments((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Success state
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center ${className}`}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
          <IconCheck />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">Ticket Submitted!</h3>
        <p className="mb-4 text-zinc-400">{message}</p>
        {ticketNumber && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2">
            <span className="text-sm text-zinc-500">Ticket #</span>
            <span className="text-gold-400 font-mono font-semibold">{ticketNumber}</span>
          </div>
        )}
        <p className="mt-4 text-sm text-zinc-500">
          We&apos;ll get back to you at <span className="text-zinc-300">{formData.email}</span>
        </p>
        <button
          onClick={() => {
            setStatus('idle');
            setFormData({
              ...formData,
              subject: '',
              description: '',
              category: 'GENERAL',
              priority: 'NORMAL',
            });
            setAttachments([]);
          }}
          className="mt-6 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          Submit Another Ticket
        </button>
      </motion.div>
    );
  }

  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-gold-500/10 text-gold-400 flex h-10 w-10 items-center justify-center rounded-lg">
          <IconTicket />
        </div>
        <div>
          <h3 className="font-semibold text-white">Submit a Support Ticket</h3>
          <p className="text-xs text-zinc-500">We typically respond within 24 hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Info */}
        {!session && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="focus:ring-gold-500/50 focus:border-gold-500 w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white transition-all placeholder:text-zinc-500 focus:outline-hidden focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="focus:ring-gold-500/50 focus:border-gold-500 w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white transition-all placeholder:text-zinc-500 focus:outline-hidden focus:ring-2"
              />
            </div>
          </div>
        )}

        {/* Category & Priority */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Category</label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="focus:ring-gold-500/50 focus:border-gold-500 w-full cursor-pointer appearance-none rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white transition-all focus:outline-hidden focus:ring-2"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <IconChevron />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Priority</label>
            <div className="relative">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="focus:ring-gold-500/50 focus:border-gold-500 w-full cursor-pointer appearance-none rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white transition-all focus:outline-hidden focus:ring-2"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri.value} value={pri.value}>
                    {pri.label} - {pri.description}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <IconChevron />
              </div>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief description of your issue"
            required
            className="focus:ring-gold-500/50 focus:border-gold-500 w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white transition-all placeholder:text-zinc-500 focus:outline-hidden focus:ring-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please describe your issue in detail. Include any steps to reproduce the problem, error messages, and what you expected to happen."
            required
            rows={5}
            className="focus:ring-gold-500/50 focus:border-gold-500 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-white transition-all placeholder:text-zinc-500 focus:outline-hidden focus:ring-2"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Attachments (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*,.pdf,.txt,.log"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-800 px-4 py-3 text-sm text-zinc-500 transition-all hover:border-zinc-700 hover:text-zinc-300"
          >
            <IconPaperclip />
            <span>Click to attach files (max 5, 10MB each)</span>
          </button>

          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1"
              >
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2"
                  >
                    <span className="truncate text-sm text-zinc-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-zinc-500 transition-colors hover:text-red-400"
                    >
                      <IconX />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error message */}
        {status === 'error' && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r py-3 font-semibold text-black transition-all disabled:opacity-50"
        >
          {status === 'loading' ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <IconTicket />
              </motion.span>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <IconTicket />
              <span>Submit Ticket</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-600">
          By submitting, you agree to our terms of service and privacy policy.
        </p>
      </form>
    </div>
  );
}

export default SupportTicketForm;
