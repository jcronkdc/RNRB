'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  DollarSign,
  Video,
  Users,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Loader2,
  Sparkles,
  TrendingUp,
  Star,
  Music,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

const STEPS = [
  { id: 'intro', title: 'Welcome', icon: Sparkles },
  { id: 'profile', title: 'Profile', icon: Users },
  { id: 'expertise', title: 'Expertise', icon: GraduationCap },
  { id: 'payout', title: 'Payout Setup', icon: DollarSign },
  { id: 'complete', title: 'Complete', icon: CheckCircle },
];

const CATEGORIES = [
  'Guitar',
  'Bass',
  'Drums',
  'Keyboards',
  'Vocals',
  'Production',
  'Songwriting',
  'Music Theory',
  'Recording',
  'Mixing',
  'Mastering',
  'DJing',
  'Electronic Music',
  'Jazz',
  'Classical',
  'Rock',
  'Hip Hop',
  'Country',
  'R&B',
  'Blues',
  'Folk',
  'World Music',
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export default function BecomeInstructorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    website: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Intro
        return true;
      case 1: // Profile
        return displayName.trim().length > 0 && headline.trim().length > 0;
      case 2: // Expertise
        return selectedCategories.length > 0;
      case 3: // Payout
        return agreedToTerms;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create instructor profile
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          headline,
          bio,
          avatarUrl: avatarUrl || undefined,
          socialLinks,
          categories: selectedCategories,
          skillLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create instructor profile');
      }

      const { instructor } = await response.json();

      // Initiate Stripe Connect
      const stripeResponse = await fetch('/api/instructors/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (stripeResponse.ok) {
        const { url } = await stripeResponse.json();
        // Redirect to Stripe onboarding
        window.location.href = url;
      } else {
        // Go to dashboard without Stripe setup
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error creating instructor profile:', error);
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Intro
        return (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-r from-(--accent) to-(--gold)">
              <GraduationCap className="h-12 w-12 text-(--text)" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-(--text)">Share Your Music Expertise</h2>
            <p className="mx-auto mb-8 max-w-lg text-lg text-(--muted)">
              Create masterclasses, reach thousands of aspiring musicians, and earn money doing what
              you love.
            </p>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-(--border) bg-(--panel) p-6">
                <Video className="mb-4 h-10 w-10 text-(--accent)" />
                <h3 className="mb-2 font-bold text-(--text)">Create Content</h3>
                <p className="text-sm text-(--muted)">
                  Build comprehensive courses or host live sessions
                </p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--panel) p-6">
                <Users className="mb-4 h-10 w-10 text-(--accent)" />
                <h3 className="mb-2 font-bold text-(--text)">Grow Your Audience</h3>
                <p className="text-sm text-(--muted)">Connect with passionate students worldwide</p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--panel) p-6">
                <DollarSign className="mb-4 h-10 w-10 text-(--accent)" />
                <h3 className="mb-2 font-bold text-(--text)">Earn 85%</h3>
                <p className="text-sm text-(--muted)">Keep the majority of your earnings</p>
              </div>
            </div>

            <div className="rounded-xl border border-(--accent)/20 bg-linear-to-r from-(--accent)/10 to-(--gold)/10 p-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-(--text)">10K+</div>
                  <div className="text-sm text-(--muted)">Active Students</div>
                </div>
                <div className="h-12 w-px bg-(--border)" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-(--text)">$50K+</div>
                  <div className="text-sm text-(--muted)">Paid to Instructors</div>
                </div>
                <div className="h-12 w-px bg-(--border)" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-(--text)">4.8</div>
                  <div className="text-sm text-(--muted)">Avg Rating</div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 1: // Profile
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto max-w-xl"
          >
            <h2 className="mb-2 text-2xl font-bold text-(--text)">Your Instructor Profile</h2>
            <p className="mb-8 text-(--muted)">This is how students will see you</p>

            {/* Avatar */}
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-(--border) bg-(--panel) transition-colors hover:border-(--accent)"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <Upload className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-(--muted)" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-(--accent) hover:text-(--accent-hover)"
                >
                  Upload photo
                </button>
                <p className="text-xs text-(--muted)">JPG, PNG. Max 5MB</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-(--muted)">
                Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should students know you?"
                className="w-full rounded-lg border border-(--border) bg-(--panel) px-4 py-3 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
              />
            </div>

            {/* Headline */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-(--muted)">Headline *</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Grammy-winning producer & songwriter"
                maxLength={80}
                className="w-full rounded-lg border border-(--border) bg-(--panel) px-4 py-3 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
              />
              <p className="mt-1 text-xs text-(--muted)">{headline.length}/80</p>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-(--muted)">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell students about your background, experience, and what makes you unique..."
                rows={4}
                maxLength={1000}
                className="w-full resize-none rounded-lg border border-(--border) bg-(--panel) px-4 py-3 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
              />
              <p className="mt-1 text-xs text-(--muted)">{bio.length}/1000</p>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-(--muted)">
                Social Links (optional)
              </label>
              <div className="relative">
                <Instagram className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--muted)" />
                <input
                  type="text"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="Instagram username"
                  className="w-full rounded-lg border border-(--border) bg-(--panel) py-3 pr-4 pl-12 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--muted)" />
                <input
                  type="text"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="Twitter/X username"
                  className="w-full rounded-lg border border-(--border) bg-(--panel) py-3 pr-4 pl-12 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
                />
              </div>
              <div className="relative">
                <Youtube className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--muted)" />
                <input
                  type="text"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  placeholder="YouTube channel URL"
                  className="w-full rounded-lg border border-(--border) bg-(--panel) py-3 pr-4 pl-12 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
                />
              </div>
              <div className="relative">
                <Globe className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--muted)" />
                <input
                  type="text"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  placeholder="Personal website URL"
                  className="w-full rounded-lg border border-(--border) bg-(--panel) py-3 pr-4 pl-12 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2: // Expertise
        return (
          <motion.div
            key="expertise"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto max-w-xl"
          >
            <h2 className="mb-2 text-2xl font-bold text-(--text)">Your Expertise</h2>
            <p className="mb-8 text-(--muted)">Select all areas you can teach</p>

            {/* Categories */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-medium text-(--muted)">
                Teaching Categories *
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-(--accent) text-(--text)'
                        : 'bg-(--panel) text-(--muted) hover:bg-(--border)'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-medium text-(--muted)">
                Student Level You'll Teach
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSkillLevel(level)}
                    className={`rounded-lg px-4 py-3 text-sm transition-colors ${
                      skillLevel === level
                        ? 'bg-(--accent) text-(--text)'
                        : 'bg-(--panel) text-(--muted) hover:bg-(--border)'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Preview */}
            {selectedCategories.length > 0 && (
              <div className="rounded-xl border border-(--accent)/20 bg-linear-to-r from-(--accent)/10 to-(--gold)/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-(--accent)" />
                  <span className="font-medium text-(--text)">Market Demand</span>
                </div>
                <p className="text-sm text-(--muted)">
                  Courses in {selectedCategories[0]} are in high demand! Students are actively
                  searching for instructors in this area.
                </p>
              </div>
            )}
          </motion.div>
        );

      case 3: // Payout
        return (
          <motion.div
            key="payout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto max-w-xl"
          >
            <h2 className="mb-2 text-2xl font-bold text-(--text)">Payment Setup</h2>
            <p className="mb-8 text-(--muted)">Connect your Stripe account to receive payouts</p>

            {/* Revenue Split */}
            <div className="mb-6 rounded-xl border border-(--border) bg-(--panel) p-6">
              <h3 className="mb-4 font-bold text-(--text)">Revenue Split</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-(--muted)">Your share</span>
                    <span className="text-2xl font-bold text-(--sage)">85%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-(--bg)">
                    <div className="h-full w-[85%] rounded-full bg-linear-to-r from-green-500 to-emerald-500" />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-(--muted)">
                Platform fee (15%) covers payment processing, hosting, and support.
              </p>
            </div>

            {/* How It Works */}
            <div className="mb-6 rounded-xl border border-(--border) bg-(--panel) p-6">
              <h3 className="mb-4 font-bold text-(--text)">How Payouts Work</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--accent)/20">
                    <span className="text-sm text-(--accent)">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-(--text)">Students Enroll</div>
                    <div className="text-sm text-(--muted)">
                      Payment is collected when students purchase your course
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--accent)/20">
                    <span className="text-sm text-(--accent)">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-(--text)">Earnings Accumulate</div>
                    <div className="text-sm text-(--muted)">
                      Track your earnings in real-time from your dashboard
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--accent)/20">
                    <span className="text-sm text-(--accent)">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-(--text)">Monthly Payouts</div>
                    <div className="text-sm text-(--muted)">
                      Funds are automatically transferred to your bank account
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-(--border) bg-(--panel) text-(--accent) focus:ring-(--accent)"
              />
              <span className="text-sm text-(--muted)">
                I agree to the{' '}
                <Link href="/legal/instructor-terms" className="text-(--accent) hover:underline">
                  Instructor Terms of Service
                </Link>{' '}
                and understand the revenue split arrangement.
              </span>
            </label>
          </motion.div>
        );

      case 4: // Complete
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-r from-green-500 to-emerald-500"
            >
              <CheckCircle className="h-12 w-12 text-(--text)" />
            </motion.div>
            <h2 className="mb-4 text-3xl font-bold text-(--text)">Welcome, Instructor!</h2>
            <p className="mx-auto mb-8 max-w-lg text-lg text-(--muted)">
              Your instructor profile has been created. Now let's create your first masterclass!
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/masterclasses/instructor">
                <button className="rounded-full bg-(--panel) px-6 py-3 text-(--text) transition-colors hover:bg-(--border)">
                  Go to Dashboard
                </button>
              </Link>
              <Link href="/masterclasses/create">
                <button className="rounded-full bg-linear-to-r from-(--accent) to-(--gold) px-6 py-3 text-(--text) transition-opacity hover:opacity-90">
                  Create First Course
                </button>
              </Link>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-(--bg)">
      {/* Header */}
      <header className="border-b border-(--border) bg-(--panel)">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/masterclasses" className="flex items-center gap-3">
            <Image src="/logo-dark.png" alt="Logo" width={40} height={40} />
            <span className="font-bold text-(--text)">Become an Instructor</span>
          </Link>
          <Link href="/masterclasses" className="text-(--muted) hover:text-(--text)">
            Cancel
          </Link>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-12 flex items-center justify-center gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isComplete
                        ? 'bg-(--sage)'
                        : isActive
                          ? 'bg-(--accent)'
                          : 'border border-(--border) bg-(--panel)'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-(--text)" />
                    ) : (
                      <Icon
                        className={`h-5 w-5 ${isActive ? 'text-(--text)' : 'text-(--muted)'}`}
                      />
                    )}
                  </div>
                  <span className={`mt-2 text-xs ${isActive ? 'text-(--text)' : 'text-(--muted)'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-12 ${isComplete ? 'bg-(--sage)' : 'bg-(--border)'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-(--muted) hover:text-(--text) disabled:opacity-0"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 rounded-full bg-linear-to-r from-(--accent) to-(--gold) px-6 py-3 text-(--text) disabled:opacity-50"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2 rounded-full bg-linear-to-r from-(--accent) to-(--gold) px-6 py-3 text-(--text) disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
