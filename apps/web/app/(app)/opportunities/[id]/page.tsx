'use client';

import { motion } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Guitar,
  Clock,
  Users,
  Globe,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
  ExternalLink,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ROUTES } from '@/lib/routes';

import { microCopy } from '@/lib/workshop-voice';

const compensationBadges: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-400' },
  royalty_share: { label: 'Royalty Share', color: 'bg-purple-500/20 text-purple-400' },
  door_split: { label: 'Door Split', color: 'bg-blue-500/20 text-blue-400' },
  tips: { label: 'Tips', color: 'bg-yellow-500/20 text-yellow-400' },
  unpaid: { label: 'Unpaid', color: 'bg-gray-500/20 text-gray-400' },
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [application, setApplication] = useState({
    coverLetter: '',
    portfolioUrls: '',
    audioSamples: '',
    availability: '',
    expectedPay: '',
  });

  useEffect(() => {
    loadOpportunity();
    checkApplicationStatus();
  }, [params.id]);

  const loadOpportunity = async () => {
    try {
      const response = await fetch(`/api/ecosystem/opportunities/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunity(data.opportunity);
      } else if (response.status === 404) {
        router.push('/opportunities');
      }
    } catch (error) {
      console.error('Error loading opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/ecosystem/opportunities/${params.id}/apply`);
      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.hasApplied);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`/api/ecosystem/opportunities/${params.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: application.coverLetter,
          portfolioUrls: application.portfolioUrls
            .split('\n')
            .map((url) => url.trim())
            .filter(Boolean),
          audioSamples: application.audioSamples
            .split('\n')
            .map((url) => url.trim())
            .filter(Boolean),
          availability: application.availability,
          expectedPay: application.expectedPay ? parseFloat(application.expectedPay) : null,
        }),
      });

      if (response.ok) {
        setHasApplied(true);
        setShowApplicationForm(false);
        // Success message would go here
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-(--accent)" />
          <p className="text-sm text-(--muted)">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return null;
  }

  const compBadge = compensationBadges[opportunity.compensation] || compensationBadges.paid;
  const isOwnOpportunity = session?.user?.id === opportunity.postedById;

  return (
    <div className="min-h-screen">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-(--accent)/5 absolute -left-64 top-0 h-[600px] w-[600px] rounded-full blur-[120px]" />
        <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8">
        {/* Header with logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="mb-6 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={56}
              className="transition-transform hover:scale-105"
              priority
            />
          </Link>
        </motion.div>

        {/* Back button */}
        <Link
          href="/opportunities"
          className="mb-6 inline-flex items-center gap-2 text-sm text-(--text-secondary) transition-colors hover:text-(--text)"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Opportunities
        </Link>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Left column - Main details */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-8">
              {/* Header */}
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${compBadge.color}`}>
                    {compBadge.label}
                  </span>
                  {opportunity.payAmount && (
                    <span className="flex items-center gap-1 rounded-full bg-(--sage-dim) px-3 py-1 text-sm font-semibold text-emerald-400">
                      <DollarSign className="h-4 w-4" />
                      {opportunity.payAmount.toLocaleString()}
                      {opportunity.payType && ` / ${opportunity.payType}`}
                    </span>
                  )}
                  {opportunity.isRemote && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                      <Globe className="h-3.5 w-3.5" />
                      Remote
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-(--panel-hover) px-3 py-1 text-sm capitalize text-(--text-secondary)">
                  {opportunity.type.replace('_', ' ')}
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="mb-4 text-3xl font-bold text-(--text)">{opportunity.title}</h1>

              {opportunity.description && (
                <div className="mb-6 whitespace-pre-wrap text-(--text-secondary)">
                  {opportunity.description}
                </div>
              )}

              {/* Meta grid */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                {opportunity.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-(--accent)" />
                    <div>
                      <p className="text-sm font-medium text-(--text)">Location</p>
                      <p className="text-sm text-(--text-secondary)">{opportunity.location}</p>
                    </div>
                  </div>
                )}

                {opportunity.date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-(--accent)" />
                    <div>
                      <p className="text-sm font-medium text-(--text)">Date</p>
                      <p className="text-sm text-(--text-secondary)">
                        {new Date(opportunity.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.startTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-(--accent)" />
                    <div>
                      <p className="text-sm font-medium text-(--text)">Time</p>
                      <p className="text-sm text-(--text-secondary)">
                        {opportunity.startTime}
                        {opportunity.endTime && ` - ${opportunity.endTime}`}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.deadline && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-(--text)">Application Deadline</p>
                      <p className="text-sm text-(--text-secondary)">
                        {new Date(opportunity.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {(opportunity.instruments?.length > 0 ||
                opportunity.genres?.length > 0 ||
                opportunity.skills?.length > 0) && (
                <div className="mb-6 space-y-4 border-t border-(--border) pt-6">
                  <h2 className="text-lg font-semibold text-(--text)">Requirements</h2>

                  {opportunity.instruments?.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-(--text-secondary)">
                        <Guitar className="h-4 w-4" />
                        Instruments
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.instruments.map((inst: string) => (
                          <span
                            key={inst}
                            className="text-(--text)/80 rounded-full bg-(--panel-hover) px-3 py-1 text-sm"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {opportunity.genres?.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-(--text-secondary)">
                        Genres
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.genres.map((genre: string) => (
                          <span
                            key={genre}
                            className="rounded-full bg-(--accent-glow) px-3 py-1 text-sm text-(--accent)"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {opportunity.experienceLevel && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-(--text-secondary)">
                        Experience Level
                      </p>
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm capitalize text-blue-400">
                        {opportunity.experienceLevel}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Additional info */}
              {opportunity.additionalInfo && (
                <div className="border-t border-(--border) pt-6">
                  <h2 className="mb-3 text-lg font-semibold text-(--text)">
                    Additional Information
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-(--text-secondary)">
                    {opportunity.additionalInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Application form */}
            {showApplicationForm && !hasApplied && !isOwnOpportunity && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-8"
              >
                <h2 className="mb-6 text-xl font-bold text-(--text)">
                  Submit Your Application
                </h2>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--text)">
                      Cover Letter
                    </label>
                    <textarea
                      value={application.coverLetter}
                      onChange={(e) =>
                        setApplication({ ...application, coverLetter: e.target.value })
                      }
                      placeholder="Tell them why you're the perfect fit..."
                      rows={6}
                      className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--text)">
                      Portfolio URLs (one per line)
                    </label>
                    <textarea
                      value={application.portfolioUrls}
                      onChange={(e) =>
                        setApplication({ ...application, portfolioUrls: e.target.value })
                      }
                      placeholder="https://example.com/portfolio&#10;https://example.com/work"
                      rows={3}
                      className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--text)">
                      Audio Samples (one per line)
                    </label>
                    <textarea
                      value={application.audioSamples}
                      onChange={(e) =>
                        setApplication({ ...application, audioSamples: e.target.value })
                      }
                      placeholder="https://soundcloud.com/track&#10;https://youtube.com/video"
                      rows={3}
                      className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--text)">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={application.availability}
                      onChange={(e) =>
                        setApplication({ ...application, availability: e.target.value })
                      }
                      placeholder="e.g., Weekends, evenings..."
                      className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                    />
                  </div>

                  {opportunity.compensation === 'negotiable' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-(--text)">
                        Expected Pay (optional)
                      </label>
                      <input
                        type="number"
                        value={application.expectedPay}
                        onChange={(e) =>
                          setApplication({ ...application, expectedPay: e.target.value })
                        }
                        placeholder="Your rate"
                        className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={applying}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-(--accent) to-(--clay) px-6 py-3 font-medium text-(--text) shadow-lg shadow-(--accent-glow) transition-all hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {applying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Submit Application
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="rounded-xl border border-(--border) px-6 py-3 font-medium text-(--text) transition-all hover:bg-(--panel)"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Posted by */}
            <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-6">
              <h3 className="mb-4 text-sm font-medium text-(--text-secondary)">Posted By</h3>
              <Link href={ROUTES.profile.view(opportunity.postedBy.id)} className="group block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-linear-to-br from-(--accent) to-(--clay)">
                    {opportunity.postedBy.image ? (
                      <Image
                        src={opportunity.postedBy.image}
                        alt={opportunity.postedBy.name || ''}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-(--text)">
                        {(opportunity.postedBy.name || 'U')[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-(--text) group-hover:text-(--text)">
                      {opportunity.postedBy.name || 'Anonymous'}
                    </p>
                    {opportunity.postedBy.username && (
                      <p className="text-sm text-(--muted)">
                        @{opportunity.postedBy.username}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-6">
              <h3 className="mb-4 text-sm font-medium text-(--text-secondary)">Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-(--text-secondary)">
                    <Users className="h-4 w-4" />
                    Applications
                  </span>
                  <span className="font-medium text-(--text)">
                    {opportunity._count.applications}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-(--text-secondary)">
                    <Briefcase className="h-4 w-4" />
                    Views
                  </span>
                  <span className="font-medium text-(--text)">{opportunity.views || 0}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {!session?.user ? (
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-(--accent) to-(--clay) px-6 py-3 font-medium text-(--text) shadow-lg shadow-(--accent-glow) transition-all hover:from-green-600 hover:to-emerald-700"
                >
                  <Send className="h-5 w-5" />
                  Login to Apply
                </Link>
              ) : isOwnOpportunity ? (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-center text-sm text-blue-300">
                  This is your opportunity
                </div>
              ) : hasApplied ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-(--border-strong) bg-(--accent-glow) p-4 text-center text-sm font-medium text-(--text)">
                  <CheckCircle className="h-5 w-5" />
                  Application Submitted
                </div>
              ) : opportunity.status !== 'open' ? (
                <div className="rounded-xl border border-(--border) bg-(--panel) p-4 text-center text-sm text-(--muted)">
                  This opportunity is closed
                </div>
              ) : !opportunity.allowApplications ? (
                opportunity.applicationUrl ? (
                  <a
                    href={opportunity.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-(--accent) to-(--clay) px-6 py-3 font-medium text-(--text) shadow-lg shadow-(--accent-glow) transition-all hover:from-green-600 hover:to-emerald-700"
                  >
                    Apply Externally
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="rounded-xl border border-(--border) bg-(--panel) p-4 text-center text-sm text-(--muted)">
                    Contact poster directly
                  </div>
                )
              ) : (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-(--accent) to-(--clay) px-6 py-3 font-medium text-(--text) shadow-lg shadow-(--accent-glow) transition-all hover:from-green-600 hover:to-emerald-700"
                >
                  <Send className="h-5 w-5" />
                  Apply Now
                </button>
              )}

              {/* Contact info */}
              {(opportunity.contactEmail || opportunity.contactPhone) && (
                <div className="rounded-xl border border-(--border) bg-(--panel) p-4 text-sm">
                  <p className="mb-2 font-medium text-(--text-secondary)">Contact</p>
                  {opportunity.contactEmail && (
                    <a
                      href={`mailto:${opportunity.contactEmail}`}
                      className="block text-(--accent) hover:underline"
                    >
                      {opportunity.contactEmail}
                    </a>
                  )}
                  {opportunity.contactPhone && (
                    <a
                      href={`tel:${opportunity.contactPhone}`}
                      className="block text-(--accent) hover:underline"
                    >
                      {opportunity.contactPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
