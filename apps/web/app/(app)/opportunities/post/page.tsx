'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Guitar,
  Clock,
  Briefcase,
  Loader2,
  Globe,
  AlertCircle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const opportunityTypes = [
  { id: 'gig', label: 'Gig', description: 'One-time performance opportunity' },
  { id: 'session', label: 'Session Work', description: 'Recording or studio work' },
  { id: 'sync_license', label: 'Sync Licensing', description: 'Licensing your music for media' },
  { id: 'tour', label: 'Tour', description: 'Multi-date touring opportunity' },
  { id: 'teaching', label: 'Teaching', description: 'Music instruction or workshop' },
  { id: 'other', label: 'Other', description: 'Other music opportunity' },
];

const compensationTypes = [
  { id: 'paid', label: 'Paid', description: 'Fixed compensation' },
  { id: 'royalty_share', label: 'Royalty Share', description: 'Share of earnings' },
  { id: 'door_split', label: 'Door Split', description: 'Share of ticket sales' },
  { id: 'tips', label: 'Tips', description: 'Tip-based compensation' },
  { id: 'unpaid', label: 'Unpaid', description: 'No compensation' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'professional', label: 'Professional' },
];

const commonInstruments = [
  'Vocals',
  'Guitar',
  'Bass',
  'Drums',
  'Keyboard',
  'Piano',
  'Saxophone',
  'Trumpet',
  'Violin',
  'DJ',
  'Producer',
];

const commonGenres = [
  'Rock',
  'Pop',
  'Jazz',
  'Blues',
  'Country',
  'Hip Hop',
  'R&B',
  'Electronic',
  'Classical',
  'Folk',
  'Metal',
  'Indie',
];

export default function PostOpportunityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'gig',
    title: '',
    description: '',
    compensation: 'paid',
    payAmount: '',
    payType: 'flat',
    payDetails: '',
    isRemote: false,
    location: '',
    city: '',
    state: '',
    country: '',
    date: '',
    startTime: '',
    endTime: '',
    deadline: '',
    instruments: [] as string[],
    genres: [] as string[],
    experienceLevel: '',
    additionalInfo: '',
    contactEmail: '',
    contactPhone: '',
    allowApplications: true,
    dressCode: '',
  });

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--accent)" />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/ecosystem/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          payAmount: formData.payAmount ? parseFloat(formData.payAmount) : null,
          date: formData.date || null,
          deadline: formData.deadline || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/opportunities/${data.opportunity.id}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create opportunity');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      alert('Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  return (
    <div className="min-h-screen">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-(--accent)/5 absolute -left-64 top-0 h-[600px] w-[600px] rounded-full blur-[120px]" />
        <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
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
          <h1 className="mb-3 text-3xl font-bold text-(--text) md:text-4xl">
            Post an Opportunity
          </h1>
          <p className="mx-auto max-w-2xl text-(--text-secondary)">
            Share a gig, session work, or other opportunity with the community
          </p>
        </motion.div>

        {/* Back button */}
        <Link
          href="/opportunities"
          className="mb-6 inline-flex items-center gap-2 text-sm text-(--text-secondary) transition-colors hover:text-(--text)"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Opportunities
        </Link>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-(--text)">
              <Briefcase className="h-5 w-5" />
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="mb-3 block text-sm font-medium text-(--text)">
                  Opportunity Type *
                </label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {opportunityTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        formData.type === type.id
                          ? 'border-green-500 bg-(--accent-glow)'
                          : 'border-(--border) bg-(--panel) hover:bg-(--panel-hover)'
                      }`}
                    >
                      <p className="font-medium text-(--text)">{type.label}</p>
                      <p className="text-xs text-(--muted)">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Guitarist Needed for Wedding Gig"
                  className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about the opportunity..."
                  rows={6}
                  className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-(--text)">
              <DollarSign className="h-5 w-5" />
              Compensation
            </h2>

            <div className="space-y-4">
              {/* Compensation Type */}
              <div>
                <label className="mb-3 block text-sm font-medium text-(--text)">Type *</label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {compensationTypes.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, compensation: comp.id })}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        formData.compensation === comp.id
                          ? 'border-green-500 bg-(--accent-glow)'
                          : 'border-(--border) bg-(--panel) hover:bg-(--panel-hover)'
                      }`}
                    >
                      <p className="font-medium text-(--text)">{comp.label}</p>
                      <p className="text-xs text-(--muted)">{comp.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formData.compensation === 'paid' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--text)">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.payAmount}
                      onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                      placeholder="500.00"
                      className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--text)">
                      Pay Type
                    </label>
                    <select
                      value={formData.payType}
                      onChange={(e) => setFormData({ ...formData, payType: e.target.value })}
                      className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                    >
                      <option value="flat">Flat Rate</option>
                      <option value="hourly">Hourly</option>
                      <option value="per_show">Per Show</option>
                      <option value="per_song">Per Song</option>
                      <option value="negotiable">Negotiable</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">
                  Additional Pay Details
                </label>
                <input
                  type="text"
                  value={formData.payDetails}
                  onChange={(e) => setFormData({ ...formData, payDetails: e.target.value })}
                  placeholder="e.g., Plus meals and travel expenses"
                  className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                />
              </div>
            </div>
          </div>

          {/* Location & Timing */}
          <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-(--text)">
              <MapPin className="h-5 w-5" />
              Location & Timing
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRemote"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="h-5 w-5 rounded border-white/20 bg-(--panel) text-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                />
                <label
                  htmlFor="isRemote"
                  className="flex items-center gap-2 text-sm text-(--text)"
                >
                  <Globe className="h-4 w-4" />
                  This is a remote opportunity
                </label>
              </div>

              {!formData.isRemote && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--text)">
                      Location / Venue
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., The Blue Note Jazz Club"
                      className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-(--text)">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                        className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-(--text)">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="NY"
                        className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-(--text)">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="USA"
                        className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-(--text)">
              <Guitar className="h-5 w-5" />
              Requirements
            </h2>

            <div className="space-y-4">
              {/* Instruments */}
              <div>
                <label className="mb-3 block text-sm font-medium text-(--text)">
                  Instruments Needed
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonInstruments.map((instrument) => (
                    <button
                      key={instrument}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          instruments: toggleArrayItem(formData.instruments, instrument),
                        })
                      }
                      className={`rounded-full px-4 py-2 text-sm transition-all ${
                        formData.instruments.includes(instrument)
                          ? 'bg-(--accent) text-(--text)'
                          : 'border border-(--border) bg-(--panel) text-(--text-secondary) hover:bg-(--panel-hover)'
                      }`}
                    >
                      {instrument}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="mb-3 block text-sm font-medium text-(--text)">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {commonGenres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          genres: toggleArrayItem(formData.genres, genre),
                        })
                      }
                      className={`rounded-full px-4 py-2 text-sm transition-all ${
                        formData.genres.includes(genre)
                          ? 'bg-(--accent) text-(--text)'
                          : 'border border-(--border) bg-(--panel) text-(--text-secondary) hover:bg-(--panel-hover)'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="mb-3 block text-sm font-medium text-(--text)">
                  Experience Level
                </label>
                <div className="grid gap-3 sm:grid-cols-4">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: level.id })}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        formData.experienceLevel === level.id
                          ? 'border-green-500 bg-(--accent-glow) text-(--text)'
                          : 'border-(--border) bg-(--panel) text-(--text-secondary) hover:bg-(--panel-hover)'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">
                  Dress Code
                </label>
                <input
                  type="text"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  placeholder="e.g., Business casual, All black, Costume"
                  className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="rounded-2xl border border-(--border) bg-linear-to-br from-(--panel) to-(--bg-elevated) p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-(--text)">
              <AlertCircle className="h-5 w-5" />
              Additional Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-(--text)">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Any other details applicants should know..."
                  rows={4}
                  className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--text)">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-xl border border-(--border) bg-(--panel) p-4 text-(--text) placeholder-(--muted) outline-hidden transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowApplications"
                  checked={formData.allowApplications}
                  onChange={(e) =>
                    setFormData({ ...formData, allowApplications: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-white/20 bg-(--panel) text-(--accent) focus:ring-2 focus:ring-(--accent-glow)"
                />
                <label htmlFor="allowApplications" className="text-sm text-(--text)">
                  Allow musicians to apply through the platform
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-(--accent) to-(--clay) px-8 py-4 text-lg font-medium text-(--text) shadow-lg shadow-(--accent-glow) transition-all hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Post Opportunity
                </>
              )}
            </button>
            <Link
              href="/opportunities"
              className="rounded-xl border border-(--border) px-8 py-4 text-center font-medium text-(--text) transition-all hover:bg-(--panel)"
            >
              Cancel
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
