'use client';

import { motion } from 'motion/react';
import {
  ArrowLeft,
  Users,
  Music,
  Mic2,
  Guitar,
  Radio,
  Zap,
  MapPin,
  DollarSign,
  Loader2,
  Check,
  Plus,
  X,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

const needTypes = [
  { id: 'musician', label: 'Musician', icon: Guitar, description: 'Looking for instrumentalists' },
  { id: 'vocalist', label: 'Vocalist', icon: Mic2, description: 'Need vocals or harmonies' },
  { id: 'producer', label: 'Producer', icon: Radio, description: 'Seeking production help' },
  { id: 'writer', label: 'Songwriter', icon: Music, description: 'Co-writing partner needed' },
  { id: 'mixer', label: 'Mixer/Engineer', icon: Zap, description: 'Mixing or mastering' },
  { id: 'other', label: 'Other', icon: Users, description: 'Something else entirely' },
];

const urgencyOptions = [
  { id: 'low', label: 'Flexible', description: 'No rush' },
  { id: 'normal', label: 'Normal', description: 'Within a few weeks' },
  { id: 'high', label: 'High Priority', description: 'Within a week' },
  { id: 'urgent', label: 'Urgent', description: 'ASAP' },
];

const compensationOptions = [
  { id: 'credit_only', label: 'Credit Only' },
  { id: 'royalty_share', label: 'Royalty Share' },
  { id: 'paid', label: 'Paid' },
  { id: 'negotiable', label: 'Negotiable' },
];

const commonGenres = [
  'Rock', 'Pop', 'Hip Hop', 'R&B', 'Country', 'Jazz', 'Blues', 'Electronic',
  'Folk', 'Metal', 'Punk', 'Indie', 'Classical', 'Soul', 'Funk', 'Reggae',
];

const commonInstruments = [
  'Guitar', 'Bass', 'Drums', 'Piano/Keys', 'Vocals', 'Violin', 'Cello',
  'Saxophone', 'Trumpet', 'Synth', 'Ukulele', 'Banjo', 'Harmonica', 'Flute',
];

export default function NewCollaborationNeedPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [needType, setNeedType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isRemote, setIsRemote] = useState(true);
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [compensation, setCompensation] = useState('credit_only');
  const [isPaid, setIsPaid] = useState(false);
  const [budget, setBudget] = useState('');

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const addSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!needType) {
      setError('Please select what type of collaborator you need');
      return;
    }
    if (!title.trim()) {
      setError('Please add a title');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/ecosystem/collaboration-needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needType,
          title: title.trim(),
          description: description.trim() || null,
          genres: selectedGenres,
          instruments: selectedInstruments,
          skills,
          isRemote,
          location: location.trim() || null,
          urgency,
          compensation,
          isPaid,
          budget: isPaid && budget ? budget : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post');
      }

      router.push('/collaboration-needs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [needType, title, description, selectedGenres, selectedInstruments, skills, isRemote, location, urgency, compensation, isPaid, budget, router]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/collaboration-needs"
            className="mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Post a Collaboration Need
          </h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>
            Describe what you're looking for and let musicians find you.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-8">
          {/* Step 1: Need Type */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              What are you looking for?
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {needTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setNeedType(type.id)}
                  className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: needType === type.id ? 'var(--accent)' : 'var(--surface)',
                    borderColor: needType === type.id ? 'var(--accent)' : 'var(--border)',
                    color: needType === type.id ? 'white' : 'var(--text)',
                  }}
                >
                  <type.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs opacity-70">{type.description}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Step 2: Title & Description */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Looking for a lead guitarist for indie rock album"
                  maxLength={120}
                  className="w-full rounded-xl border px-4 py-3 outline-hidden transition-all focus:ring-2"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project, what you need, your vision..."
                  rows={4}
                  maxLength={2000}
                  className="w-full resize-none rounded-xl border px-4 py-3 outline-hidden transition-all focus:ring-2"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          </motion.section>

          {/* Step 3: Genres */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Genres
            </h2>
            <div className="flex flex-wrap gap-2">
              {commonGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleItem(selectedGenres, setSelectedGenres, genre)}
                  className="rounded-full border px-3 py-1.5 text-sm transition-all"
                  style={{
                    background: selectedGenres.includes(genre) ? 'var(--accent)' : 'var(--surface)',
                    borderColor: selectedGenres.includes(genre) ? 'var(--accent)' : 'var(--border)',
                    color: selectedGenres.includes(genre) ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Step 4: Instruments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Instruments Needed
            </h2>
            <div className="flex flex-wrap gap-2">
              {commonInstruments.map((inst) => (
                <button
                  key={inst}
                  onClick={() => toggleItem(selectedInstruments, setSelectedInstruments, inst)}
                  className="rounded-full border px-3 py-1.5 text-sm transition-all"
                  style={{
                    background: selectedInstruments.includes(inst) ? 'var(--accent)' : 'var(--surface)',
                    borderColor: selectedInstruments.includes(inst) ? 'var(--accent)' : 'var(--border)',
                    color: selectedInstruments.includes(inst) ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {inst}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Step 5: Additional Skills */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Additional Skills
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g. Pro Tools, songwriting, arranging..."
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-hidden transition-all focus:ring-2"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
              <button
                onClick={addSkill}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'var(--accent)' }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    {skill}
                    <button
                      onClick={() => setSkills(skills.filter((s) => s !== skill))}
                      className="opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </motion.section>

          {/* Step 6: Location */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Location
            </h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm" style={{ color: 'var(--text)' }}>
                  Remote collaboration OK
                </span>
              </label>
              <div className="relative">
                <MapPin
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--muted)' }}
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State (optional)"
                  className="w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm outline-hidden transition-all focus:ring-2"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          </motion.section>

          {/* Step 7: Urgency */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Urgency
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setUrgency(opt.id)}
                  className="rounded-xl border p-3 text-center transition-all"
                  style={{
                    background: urgency === opt.id ? 'var(--accent)' : 'var(--surface)',
                    borderColor: urgency === opt.id ? 'var(--accent)' : 'var(--border)',
                    color: urgency === opt.id ? 'white' : 'var(--text)',
                  }}
                >
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs opacity-70">{opt.description}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Step 8: Compensation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Compensation
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {compensationOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setCompensation(opt.id);
                      setIsPaid(opt.id === 'paid');
                    }}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      background: compensation === opt.id ? 'var(--accent)' : 'var(--surface)',
                      borderColor: compensation === opt.id ? 'var(--accent)' : 'var(--border)',
                      color: compensation === opt.id ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {isPaid && (
                <div className="relative">
                  <DollarSign
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--muted)' }}
                  />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Budget (USD)"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm outline-hidden transition-all focus:ring-2"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              )}
            </div>
          </motion.section>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 border-t pt-6"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 12px var(--accent-glow)' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Post Collaboration Need
                </>
              )}
            </button>
            <Link
              href="/collaboration-needs"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--muted)' }}
            >
              Cancel
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
