'use client';

/**
 * CLIENT SETLIST REQUEST FORM
 * 
 * Public form where fans/clients can request songs for a setlist
 * - No auth required (public access)
 * - Email optional for notification
 * - Dedication/message support
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Music,
  User,
  Mail,
  MessageSquare,
  Heart,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function SongRequestPage() {
  const params = useParams();
  const setlistId = params.setlist as string;

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    songTitle: '',
    requestedBy: '',
    email: '',
    message: '',
    dedication: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/song-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setlistId,
          ...formData,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Error submitting request');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-brand-primary/10 via-background to-background flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="rnrb-card p-8 text-center sm:p-12">
            <CheckCircle className="text-brand-primary mx-auto mb-6 h-20 w-20" />
            <h1 className="font-display mb-4 text-3xl font-bold sm:text-4xl">
              Request Submitted!
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Thank you for your song request. The band will review it and get back to you soon!
            </p>
            {formData.email && (
              <p className="text-muted-foreground mb-6 text-sm">
                We'll send you an email at <strong>{formData.email}</strong> once your request is
                reviewed.
              </p>
            )}
            <Link href="/">
              <Button className="rnrb-button-primary rounded-xl px-8 py-3 font-semibold">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand-primary/10 via-background to-background min-h-screen px-4 py-12">
      <div className="rnrb-container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="bg-brand-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Music className="text-brand-primary h-10 w-10" />
          </div>
          <h1 className="font-display mb-3 text-4xl font-bold sm:text-5xl">
            Request a Song
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
            Got a song you'd love to hear? Submit your request and we'll do our best to include it
            in our setlist!
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rnrb-card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Song Title */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Music className="h-4 w-4" />
                  Song Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.songTitle}
                  onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                  placeholder="What song would you like to hear?"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>

              {/* Your Name */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                  placeholder="So we know who requested it"
                  className="rnrb-input w-full rounded-xl"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="We'll let you know if we add your song"
                  className="rnrb-input w-full rounded-xl"
                />
                <p className="text-muted-foreground mt-1.5 text-xs">
                  We'll email you when your request is reviewed
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Message (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Any special reason you'd like to hear this song?"
                  rows={3}
                  className="rnrb-input w-full rounded-xl"
                />
              </div>

              {/* Dedication */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Heart className="h-4 w-4" />
                  Dedication (Optional)
                </label>
                <input
                  type="text"
                  value={formData.dedication}
                  onChange={(e) => setFormData({ ...formData, dedication: e.target.value })}
                  placeholder="Want to dedicate this song to someone?"
                  className="rnrb-input w-full rounded-xl"
                />
                <p className="text-muted-foreground mt-1.5 text-xs">
                  We might give you a shoutout if we play your request!
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Link href="/">
                  <Button type="button" variant="outline" className="rounded-xl px-6 py-3">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rnrb-button-primary rounded-xl px-8 py-3 font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Music className="mr-2 h-5 w-5" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rnrb-card mt-6 border-blue-500/20 bg-blue-500/5 p-6">
            <h3 className="mb-3 text-lg font-semibold">How It Works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-brand-primary mt-0.5">1.</span>
                <span>Submit your song request with your name and optional message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary mt-0.5">2.</span>
                <span>
                  The band reviews all requests and decides which songs to add to the setlist
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary mt-0.5">3.</span>
                <span>If your song is selected, you'll get notified (if you provided an email)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary mt-0.5">4.</span>
                <span>Come to the show and enjoy hearing your requested song!</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

