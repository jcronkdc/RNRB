'use client';

import { motion } from 'motion/react';
import {
  GraduationCap,
  Plus,
  Users,
  DollarSign,
  Star,
  Video,
  BookOpen,
  Settings,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface InstructorProfile {
  id: string;
  displayName: string;
  headline?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  credentials: string[];
  specialties: string[];
  verified: boolean;
  stripeOnboarded: boolean;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  masterclasses: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    price?: number;
    isFree: boolean;
    thumbnailUrl?: string;
    enrollmentCount: number;
    averageRating: number;
    _count: {
      enrollments: number;
      reviews: number;
    };
  }>;
}

interface StripeStatus {
  connected: boolean;
  onboarded: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  payoutPercentage: number;
  totalEarnings: number;
  balance?: {
    available: Array<{ amount: number; currency: string }>;
    pending: Array<{ amount: number; currency: string }>;
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="bg-[var(--accent)]/10 rounded-lg p-3">
          <Icon className="h-6 w-6 text-[var(--accent)]" />
        </div>
        {trend && (
          <TrendingUp
            className={`h-5 w-5 ${trend === 'up' ? 'text-[var(--sage)]' : 'rotate-180 text-[var(--error)]'}`}
          />
        )}
      </div>
      <div className="mb-1 text-2xl font-bold text-[var(--text)]">{value}</div>
      <div className="text-sm text-[var(--muted)]">{label}</div>
      {subtext && <div className="mt-1 text-xs text-[var(--accent)]">{subtext}</div>}
    </div>
  );
}

function ClassCard({ masterclass }: { masterclass: InstructorProfile['masterclasses'][0] }) {
  return (
    <Link href={`/masterclasses/instructor/${masterclass.id}/edit`}>
      <div className="hover:border-[var(--accent)]/50 flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 transition-all">
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
          {masterclass.thumbnailUrl ? (
            <Image
              src={masterclass.thumbnailUrl}
              alt={masterclass.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2620] to-[#352f28]">
              <GraduationCap className="text-[var(--accent)]/30 h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-[var(--text)]">{masterclass.title}</h4>
          <div className="mt-1 flex items-center gap-4 text-sm text-[var(--muted)]">
            <span
              className={`capitalize ${
                masterclass.status === 'published'
                  ? 'text-[var(--sage)]'
                  : masterclass.status === 'draft'
                    ? 'text-[var(--warning)]'
                    : 'text-[var(--muted)]'
              }`}
            >
              {masterclass.status}
            </span>
            <span>{masterclass._count.enrollments} students</span>
            {masterclass.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                {masterclass.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-[var(--text)]">
            {masterclass.isFree ? 'Free' : `$${masterclass.price?.toFixed(2)}`}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function InstructorDashboardPage() {
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [instructorRes, stripeRes] = await Promise.all([
          fetch('/api/instructors?me=true'),
          fetch('/api/instructors/stripe-connect'),
        ]);

        if (instructorRes.ok) {
          const data = await instructorRes.json();
          setInstructor(data.instructor);
        }

        if (stripeRes.ok) {
          const data = await stripeRes.json();
          setStripeStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch instructor data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleStripeConnect = async () => {
    setConnectingStripe(true);
    try {
      const response = await fetch('/api/instructors/stripe-connect', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl;
        } else if (data.dashboardUrl) {
          window.open(data.dashboardUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Failed to connect Stripe:', error);
    } finally {
      setConnectingStripe(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  // Not an instructor yet - show sign up
  if (!instructor) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-4xl px-4 py-16">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={150}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--gold)]">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-[var(--text)]">
              Become a Masterclass Instructor
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-[var(--muted)]">
              Share your expertise with aspiring musicians worldwide. Create courses, host live
              sessions, and earn money doing what you love.
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-[var(--accent)]">70%</div>
              <div className="font-medium text-[var(--text)]">Revenue Share</div>
              <div className="mt-1 text-sm text-[var(--muted)]">You keep 70% of all earnings</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-[var(--accent)]">Unlimited</div>
              <div className="font-medium text-[var(--text)]">Students</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Reach musicians globally</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-[var(--accent)]">Live + VOD</div>
              <div className="font-medium text-[var(--text)]">Flexible Format</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Live sessions or pre-recorded</div>
            </div>
          </div>

          <div className="border-[var(--accent)]/20 from-[var(--accent)]/15 to-[var(--gold)]/15 rounded-2xl border bg-gradient-to-r p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text)]">Get Started</h2>
            <Link href="/masterclasses/instructor/setup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] py-4 font-semibold text-white"
              >
                Create Instructor Profile
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              {instructor.profileImage ? (
                <Image
                  src={instructor.profileImage}
                  alt={instructor.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] text-xl font-bold text-white">
                  {instructor.displayName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">{instructor.displayName}</h1>
              <p className="text-[var(--muted)]">{instructor.headline || 'Instructor'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/masterclasses/instructor/settings">
              <button className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 text-[var(--muted)] transition-colors hover:text-[var(--text)]">
                <Settings className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/masterclasses/instructor/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] px-4 py-3 font-medium text-white"
              >
                <Plus className="h-5 w-5" />
                New Masterclass
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Stripe Alert */}
        {!stripeStatus?.onboarded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-[var(--warning)]/30 bg-[var(--warning)]/10 mb-8 flex items-start gap-4 rounded-xl border p-4"
          >
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-[var(--warning)]" />
            <div className="flex-1">
              <h3 className="font-medium text-[var(--warning)]">Set Up Payouts</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Connect your Stripe account to receive payments for your masterclasses. You'll earn
                70% of every sale.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStripeConnect}
              disabled={connectingStripe}
              className="flex items-center gap-2 rounded-lg bg-[var(--warning)] px-4 py-2 font-medium text-black"
            >
              {connectingStripe ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  Connect Stripe
                  <ExternalLink className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={instructor.totalStudents.toLocaleString()}
          />
          <StatCard
            icon={DollarSign}
            label="Total Earnings"
            value={`$${Number(instructor.totalEarnings).toFixed(2)}`}
            subtext={
              stripeStatus?.balance?.available?.[0]
                ? `$${stripeStatus.balance.available[0].amount.toFixed(2)} available`
                : undefined
            }
          />
          <StatCard icon={BookOpen} label="Masterclasses" value={instructor.masterclasses.length} />
          <StatCard
            icon={Star}
            label="Average Rating"
            value={instructor.averageRating > 0 ? instructor.averageRating.toFixed(1) : 'N/A'}
            subtext={instructor.reviewCount > 0 ? `${instructor.reviewCount} reviews` : undefined}
          />
        </div>

        {/* Masterclasses List */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
            <h2 className="text-xl font-bold text-[var(--text)]">Your Masterclasses</h2>
            <Link
              href="/masterclasses/instructor/new"
              className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Create New
            </Link>
          </div>
          <div className="p-6">
            {instructor.masterclasses.length > 0 ? (
              <div className="space-y-4">
                {instructor.masterclasses.map((masterclass) => (
                  <ClassCard key={masterclass.id} masterclass={masterclass} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <GraduationCap className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]" />
                <h3 className="mb-2 text-lg font-medium text-[var(--text)]">
                  No Masterclasses Yet
                </h3>
                <p className="mb-6 text-[var(--muted)]">
                  Create your first masterclass and start teaching!
                </p>
                <Link href="/masterclasses/instructor/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] px-6 py-3 font-medium text-white"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Masterclass
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
