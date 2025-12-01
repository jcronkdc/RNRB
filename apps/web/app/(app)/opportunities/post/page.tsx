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
} from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-gray-950 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-64 top-0 h-[600px] w-[600px] rounded-full bg-green-500/5 blur-[120px]" />
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
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">Post an Opportunity</h1>
          <p className="mx-auto max-w-2xl text-white/60">
            Share a gig, session work, or other opportunity with the community
          </p>
        </motion.div>

        {/* Back button */}
        <Link
          href="/opportunities"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
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
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
              <Briefcase className="h-5 w-5" />
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white">
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
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <p className="font-medium text-white">{type.label}</p>
                      <p className="text-xs text-white/50">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Guitarist Needed for Wedding Gig"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about the opportunity..."
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
              <DollarSign className="h-5 w-5" />
              Compensation
            </h2>

            <div className="space-y-4">
              {/* Compensation Type */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white">Type *</label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {compensationTypes.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, compensation: comp.id })}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        formData.compensation === comp.id
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <p className="font-medium text-white">{comp.label}</p>
                      <p className="text-xs text-white/50">{comp.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formData.compensation === 'paid' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.payAmount}
                      onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                      placeholder="500.00"
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Pay Type</label>
                    <select
                      value={formData.payType}
                      onChange={(e) => setFormData({ ...formData, payType: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
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
                <label className="mb-2 block text-sm font-medium text-white">
                  Additional Pay Details
                </label>
                <input
                  type="text"
                  value={formData.payDetails}
                  onChange={(e) => setFormData({ ...formData, payDetails: e.target.value })}
                  placeholder="e.g., Plus meals and travel expenses"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>
          </div>

          {/* Location & Timing */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
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
                  className="h-5 w-5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-2 focus:ring-green-500/20"
                />
                <label htmlFor="isRemote" className="flex items-center gap-2 text-sm text-white">
                  <Globe className="h-4 w-4" />
                  This is a remote opportunity
                </label>
              </div>

              {!formData.isRemote && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Location / Venue
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., The Blue Note Jazz Club"
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="NY"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="USA"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
              <Guitar className="h-5 w-5" />
              Requirements
            </h2>

            <div className="space-y-4">
              {/* Instruments */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white">
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
                          ? 'bg-green-500 text-white'
                          : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {instrument}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white">Genres</label>
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
                          ? 'bg-green-500 text-white'
                          : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white">
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
                          ? 'border-green-500 bg-green-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Dress Code</label>
                <input
                  type="text"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  placeholder="e.g., Business casual, All black, Costume"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
              <AlertCircle className="h-5 w-5" />
              Additional Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Any other details applicants should know..."
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
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
                  className="h-5 w-5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-2 focus:ring-green-500/20"
                />
                <label htmlFor="allowApplications" className="text-sm text-white">
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
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
              className="rounded-xl border border-white/10 px-8 py-4 text-center font-medium text-white transition-all hover:bg-white/5"
            >
              Cancel
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
