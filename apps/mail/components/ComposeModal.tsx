'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Image,
  Smile,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  Link,
} from 'lucide-react';
import { useComposeStore, useAuthStore } from '@/lib/store';
import { jmapClient } from '@/lib/jmap-client';

export default function ComposeModal() {
  const { isOpen, replyTo, closeCompose } = useComposeStore();
  const { email: userEmail } = useAuthStore();

  const [to, setTo] = useState(replyTo?.from?.[0]?.email || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!to.trim()) {
      setError('Please enter a recipient');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await jmapClient.sendEmail({
        to: [{ email: to, name: null }],
        subject,
        textBody: body,
        replyToEmailId: replyTo?.id,
      });
      closeCompose();
    } catch (err) {
      setError((err as Error).message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: isMinimized ? 'calc(100vh - 60px)' : 0,
          scale: 1,
        }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 w-full max-w-2xl overflow-hidden rounded-2xl border border-rnrb-border bg-rnrb-panel shadow-2xl"
        style={{ boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rnrb-border bg-rnrb-dark px-4 py-3">
          <h3 className="font-medium text-white">
            {replyTo
              ? `Reply to ${replyTo.from?.[0]?.name || replyTo.from?.[0]?.email}`
              : 'New Message'}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded-lg p-1.5 text-rnrb-muted transition-colors hover:bg-rnrb-panel hover:text-white"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={closeCompose}
              className="rounded-lg p-1.5 text-rnrb-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Form */}
            <div className="p-4">
              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* To */}
              <div className="flex items-center border-b border-rnrb-border py-2">
                <span className="w-16 text-sm text-rnrb-muted">To:</span>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 bg-transparent text-white placeholder-rnrb-muted focus:outline-none"
                />
              </div>

              {/* From */}
              <div className="flex items-center border-b border-rnrb-border py-2">
                <span className="w-16 text-sm text-rnrb-muted">From:</span>
                <span className="text-white">{userEmail}</span>
              </div>

              {/* Subject */}
              <div className="flex items-center border-b border-rnrb-border py-2">
                <span className="w-16 text-sm text-rnrb-muted">Subject:</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="flex-1 bg-transparent text-white placeholder-rnrb-muted focus:outline-none"
                />
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 border-b border-rnrb-border py-2">
                <button className="rounded p-1.5 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <Bold className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <Italic className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <Underline className="h-4 w-4" />
                </button>
                <div className="mx-2 h-4 w-px bg-rnrb-border" />
                <button className="rounded p-1.5 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <List className="h-4 w-4" />
                </button>
                <button className="rounded p-1.5 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <Link className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={12}
                className="mt-4 w-full resize-none bg-transparent text-white placeholder-rnrb-muted focus:outline-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-rnrb-border px-4 py-3">
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <Image className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-rnrb-muted transition-colors hover:bg-rnrb-border hover:text-white">
                  <Smile className="h-5 w-5" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rnrb-orange to-amber-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-rnrb-orange/20 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
