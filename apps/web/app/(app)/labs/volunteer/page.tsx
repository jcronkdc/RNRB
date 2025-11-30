'use client';

/**
 * R&R Labs Volunteer Portal
 *
 * Full volunteer signup and contribution management
 * - Detailed profile collection
 * - Interest selection
 * - Audio/MIDI file uploads (future)
 * - Progress tracking
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  User,
  Music,
  Upload,
  CheckCircle,
  Loader2,
  Guitar,
  Mic,
  Drum,
  Piano,
  Headphones,
  FileAudio,
  ArrowLeft,
  Sparkles,
  Shield,
  Users,
  Database,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

// Musician types
const MUSICIAN_TYPES = [
  { id: 'singer', label: 'Singer/Vocalist', icon: Mic },
  { id: 'guitarist', label: 'Guitarist', icon: Guitar },
  { id: 'drummer', label: 'Drummer', icon: Drum },
  { id: 'bassist', label: 'Bassist', icon: Guitar },
  { id: 'keyboardist', label: 'Keyboardist', icon: Piano },
  { id: 'producer', label: 'Producer', icon: Headphones },
  { id: 'songwriter', label: 'Songwriter', icon: FileAudio },
  { id: 'multi', label: 'Multi-Instrumentalist', icon: Music },
];

// Experience levels
const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: '0-2 years' },
  { id: 'intermediate', label: 'Intermediate', description: '2-5 years' },
  { id: 'advanced', label: 'Advanced', description: '5-10 years' },
  { id: 'professional', label: 'Professional', description: '10+ years / working musician' },
];

// Research interests
const INTERESTS = [
  {
    id: 'stem_generation',
    label: 'Stem Generation Testing',
    description: 'Test and provide feedback on AI-generated individual stems',
    icon: Music,
  },
  {
    id: 'audio_contribution',
    label: 'Audio Contribution',
    description: 'Upload recordings to help train our model',
    icon: Upload,
  },
  {
    id: 'collaboration_testing',
    label: 'Collaboration Testing',
    description: 'Test real-time collaborative features',
    icon: Users,
  },
  {
    id: 'feedback_surveys',
    label: 'Feedback & Surveys',
    description: 'Participate in surveys and usability studies',
    icon: CheckCircle,
  },
  {
    id: 'beta_testing',
    label: 'Beta Testing',
    description: 'Be among the first to test new features',
    icon: FlaskConical,
  },
];

// Genres
const GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'R&B',
  'Electronic',
  'Jazz',
  'Classical',
  'Country',
  'Folk',
  'Metal',
  'Indie',
  'Blues',
  'Soul',
  'Funk',
  'Reggae',
  'Latin',
  'World',
  'Other',
];

export default function VolunteerPortalPage() {
  const { user, loading } = useRequireAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState<{
    volunteerCount: number;
    phase: number;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    musicianType: '',
    experience: '',
    interests: [] as string[],
    genres: [] as string[],
    instruments: '',
    motivation: '',
    availableHoursPerWeek: '',
  });

  // Fetch volunteer stats
  useEffect(() => {
    fetch('/api/labs/volunteer')
      .then((res) => res.json())
      .then(setVolunteerStats)
      .catch(console.error);
  }, []);

  // Pre-fill email from user session
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/labs/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          musicianType: formData.musicianType,
          experience: formData.experience,
          interests: formData.interests,
          genres: formData.genres,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.musicianType && formData.experience;
      case 2:
        return formData.interests.length > 0;
      case 3:
        return formData.email;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-400" />
          <p className="text-gray-400">Loading volunteer portal...</p>
        </motion.div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">Welcome to R&R Labs!</h1>
          <p className="mb-6 text-gray-400">
            Thank you for volunteering! We've sent a confirmation email to{' '}
            <strong className="text-white">{formData.email}</strong>. We'll be in touch soon with
            next steps.
          </p>
          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">
              You're volunteer #
              {volunteerStats?.volunteerCount ? volunteerStats.volunteerCount + 1 : '...'} 🎉
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/labs">
              <Button className="w-full rounded-xl bg-white/10 px-6 py-3 text-white hover:bg-white/20 sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Labs
              </Button>
            </Link>
            <Link href="/labs/contribute">
              <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-500 px-6 py-3 text-white hover:from-orange-600 hover:to-purple-600 sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Upload Contributions
              </Button>
            </Link>
            <Link href="/labs/experiment">
              <Button className="w-full rounded-xl bg-white/10 px-6 py-3 text-white hover:bg-white/20 sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                Try the Experiment
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="group mb-6 inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="mb-4 flex items-center justify-center gap-2">
            <Link
              href="/labs"
              className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Labs
            </Link>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
            <User className="h-5 w-5 text-green-400" />
            <span className="font-bold text-green-400">VOLUNTEER PORTAL</span>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-white">Join R&R Labs</h1>
          <p className="text-gray-400">Help us build the future of collaborative AI music</p>

          {volunteerStats && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">
                <strong className="text-white">{volunteerStats.volunteerCount}</strong> volunteers
                have joined
              </span>
            </div>
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                    step === s
                      ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                      : step > s
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`mx-2 h-1 w-8 rounded-full transition-all sm:w-16 ${
                      step > s ? 'bg-green-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-8 text-xs text-gray-500 sm:gap-20">
            <span className={step >= 1 ? 'text-white' : ''}>Profile</span>
            <span className={step >= 2 ? 'text-white' : ''}>Interests</span>
            <span className={step >= 3 ? 'text-white' : ''}>Confirm</span>
          </div>
        </motion.div>

        {/* Form Steps */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
            {/* Step 1: Profile */}
            {step === 1 && (
              <>
                <h2 className="mb-6 text-xl font-bold text-white">Tell us about yourself</h2>

                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-gray-300">
                    What type of musician are you?
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {MUSICIAN_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData((prev) => ({ ...prev, musicianType: type.id }))}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                          formData.musicianType === type.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <type.icon
                          className={`h-6 w-6 ${
                            formData.musicianType === type.id ? 'text-purple-400' : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            formData.musicianType === type.id ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-300">
                    Experience Level
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setFormData((prev) => ({ ...prev, experience: level.id }))}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          formData.experience === level.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            formData.experience === level.id
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-500'
                          }`}
                        />
                        <div>
                          <p
                            className={
                              formData.experience === level.id
                                ? 'font-medium text-white'
                                : 'text-gray-300'
                            }
                          >
                            {level.label}
                          </p>
                          <p className="text-xs text-gray-500">{level.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <>
                <h2 className="mb-2 text-xl font-bold text-white">
                  What would you like to help with?
                </h2>
                <p className="mb-6 text-sm text-gray-400">Select all that interest you</p>

                <div className="mb-6 space-y-3">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                        formData.interests.includes(interest.id)
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          formData.interests.includes(interest.id)
                            ? 'bg-green-500/20'
                            : 'bg-white/10'
                        }`}
                      >
                        <interest.icon
                          className={`h-5 w-5 ${
                            formData.interests.includes(interest.id)
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={
                            formData.interests.includes(interest.id)
                              ? 'font-medium text-white'
                              : 'text-gray-300'
                          }
                        >
                          {interest.label}
                        </p>
                        <p className="text-sm text-gray-500">{interest.description}</p>
                      </div>
                      {formData.interests.includes(interest.id) && (
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-300">
                    Favorite Genres (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                          formData.genres.includes(genre)
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <>
                <h2 className="mb-6 text-xl font-bold text-white">Almost there!</h2>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  {user?.email && (
                    <p className="mt-2 text-xs text-gray-500">
                      Pre-filled from your account. You can change it if you prefer a different
                      email.
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-medium text-gray-300">Your Profile Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-white">
                        {MUSICIAN_TYPES.find((t) => t.id === formData.musicianType)?.label || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Experience:</span>
                      <span className="text-white">
                        {EXPERIENCE_LEVELS.find((l) => l.id === formData.experience)?.label || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Interests:</span>
                      <span className="text-white">{formData.interests.length} selected</span>
                    </div>
                    {formData.genres.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Genres:</span>
                        <span className="text-white">{formData.genres.length} selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy Note */}
                <div className="flex items-start gap-3 rounded-xl bg-purple-500/10 p-4">
                  <Shield className="h-5 w-5 shrink-0 text-purple-400" />
                  <p className="text-sm text-gray-400">
                    Your data is secure. We only use it to improve R&R Labs and will never share it
                    with third parties. You can opt out at any time.
                  </p>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <Button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="rounded-xl bg-white/10 px-6 py-3 text-white hover:bg-white/20 disabled:opacity-50"
              >
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  disabled={!canProceed()}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-orange-600 disabled:opacity-50"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Join R&R Labs
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Benefits Reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid gap-4 sm:grid-cols-3"
        >
          {[
            { icon: Sparkles, text: 'Early access to AI features' },
            { icon: Database, text: 'Direct impact on model training' },
            { icon: Clock, text: 'Recognition in research credits' },
          ].map((benefit) => (
            <div
              key={benefit.text}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <benefit.icon className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-300">{benefit.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
