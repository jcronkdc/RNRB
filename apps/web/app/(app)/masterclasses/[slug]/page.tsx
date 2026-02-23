'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Play,
  Users,
  Clock,
  Star,
  BookOpen,
  Video,
  Download,
  Lock,
  CheckCircle,
  Calendar,
  Globe,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Share2,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CourseCardSkeleton } from '@/components/loading-skeletons';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration?: number;
  isFreePreview: boolean;
  isLive: boolean;
  scheduledAt?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    image?: string;
  };
  instructorResponse?: string;
}

interface MasterclassDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  shortDesc?: string;
  category: string;
  tags: string[];
  skillLevel: string;
  format: string;
  isFree: boolean;
  price?: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  promoVideoUrl?: string;
  totalDuration: number;
  lessonCount: number;
  accessDays?: number;
  maxStudents?: number;
  features: string[];
  requirements: string[];
  whatYouLearn: string[];
  averageRating: number;
  enrollmentCount: number;
  instructor: {
    id: string;
    userId: string;
    displayName: string;
    headline?: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
    credentials: string[];
    specialties: string[];
    verified: boolean;
    totalStudents: number;
    averageRating: number;
    reviewCount: number;
    website?: string;
    instagram?: string;
    youtube?: string;
  };
  lessons: Lesson[];
  reviews: Review[];
  liveSessions: any[];
  _count: {
    enrollments: number;
    lessons: number;
    reviews: number;
  };
}

interface Enrollment {
  id: string;
  status: string;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercent: number;
  accessEndsAt?: string;
  progress: any[];
}

function formatDuration(seconds?: number) {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function LessonItem({
  lesson,
  index,
  hasAccess,
  isCompleted,
  onPlay,
}: {
  lesson: Lesson;
  index: number;
  hasAccess: boolean;
  isCompleted: boolean;
  onPlay: () => void;
}) {
  const canWatch = hasAccess || lesson.isFreePreview;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg p-4 ${canWatch ? 'cursor-pointer hover:bg-(--panel)' : 'opacity-60'}`}
      onClick={canWatch ? onPlay : undefined}
    >
      {/* Number/Status */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isCompleted ? 'bg-(--sage)' : canWatch ? 'bg-(--accent)' : 'bg-(--border)'
        }`}
      >
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-white" />
        ) : canWatch ? (
          <Play className="ml-0.5 h-4 w-4 text-white" />
        ) : (
          <Lock className="h-4 w-4 text-(--muted)" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-(--text)">
            {index}. {lesson.title}
          </h4>
          {lesson.isFreePreview && !hasAccess && (
            <span className="bg-(--sage)/20 rounded px-2 py-0.5 text-xs text-(--sage)">
              Preview
            </span>
          )}
          {lesson.isLive && (
            <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Live
            </span>
          )}
        </div>
        {lesson.description && (
          <p className="mt-0.5 truncate text-sm text-(--muted)">{lesson.description}</p>
        )}
      </div>

      {/* Duration */}
      {lesson.duration && (
        <span className="text-sm text-(--muted)">{formatDuration(lesson.duration)}</span>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--panel) p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
          {review.user.image ? (
            <Image src={review.user.image} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-(--accent) to-(--gold) font-bold text-white">
              {review.user.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-(--text)">
              {review.user.name || 'Anonymous'}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? 'fill-(--gold) text-(--gold)'
                      : 'text-(--border)'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-(--muted)">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {review.title && <h5 className="mb-1 font-medium text-(--text)">{review.title}</h5>}
      {review.content && <p className="text-sm text-(--muted)">{review.content}</p>}
      {review.instructorResponse && (
        <div className="mt-3 border-l-2 border-(--accent) pl-4">
          <span className="text-xs font-medium text-(--accent)">Instructor Response</span>
          <p className="mt-1 text-sm text-(--muted)">{review.instructorResponse}</p>
        </div>
      )}
    </div>
  );
}

function MasterclassDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const enrolled = searchParams?.get('enrolled') === 'true';

  const [masterclass, setMasterclass] = useState<MasterclassDetail | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    curriculum: true,
    requirements: false,
    reviews: false,
  });

  useEffect(() => {
    async function fetchMasterclass() {
      try {
        const response = await fetch(`/api/masterclasses/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setMasterclass(data.masterclass);
          setEnrollment(data.enrollment);
          setIsInstructor(data.isInstructor);
        }
      } catch (error) {
        console.error('Failed to fetch masterclass:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchMasterclass();
    }
  }, [slug, enrolled]);

  const handleEnroll = async () => {
    if (!masterclass) return;

    setEnrolling(true);
    try {
      const response = await fetch(`/api/masterclasses/${masterclass.id}/enroll`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else if (data.enrollment) {
          setEnrollment(data.enrollment);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-(--accent) border-t-transparent" />
          <p className="text-(--muted)">Loading masterclass...</p>
        </div>
      </div>
    );
  }

  if (!masterclass) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <div className="text-center">
          <GraduationCap className="mx-auto mb-4 h-16 w-16 text-(--muted)" />
          <h2 className="mb-2 text-2xl font-bold text-(--text)">Masterclass Not Found</h2>
          <p className="mb-6 text-(--muted)">
            This masterclass may have been removed or is no longer available.
          </p>
          <Link href="/masterclasses">
            <button className="rounded-full bg-(--accent) px-6 py-3 font-medium text-white">
              Browse Masterclasses
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess = !!enrollment && enrollment.status === 'active';
  const completedLessons =
    enrollment?.progress?.filter((p: any) => p.isCompleted).map((p: any) => p.lessonId) || [];

  return (
    <div className="min-h-screen bg-(--bg)">
      {/* Hero Section */}
      <div className="from-(--accent)/10 relative bg-linear-to-b to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/masterclasses"
              className="flex items-center gap-2 text-(--muted) transition-colors hover:text-(--text)"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Masterclasses</span>
            </Link>
            <div className="flex justify-center">
              <Link href="/" className="transition-opacity hover:opacity-80">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full bg-(--panel) p-2 text-(--muted) hover:text-white">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="rounded-full bg-(--panel) p-2 text-(--muted) hover:text-red-400">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Video/Thumbnail */}
              <div className="relative mb-6 aspect-video overflow-hidden rounded-xl">
                {masterclass.thumbnailUrl ? (
                  <Image
                    src={masterclass.thumbnailUrl}
                    alt={masterclass.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-[#2a2620] to-[#352f28]">
                    <GraduationCap className="text-(--accent)/30 h-20 w-20" />
                  </div>
                )}
                {masterclass.promoVideoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
                    >
                      <Play className="ml-1 h-10 w-10 text-white" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Title & Meta */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-medium uppercase text-(--accent)">
                    {masterclass.category.replace('_', ' ')}
                  </span>
                  <span className="text-(--muted)">•</span>
                  <span className="text-sm capitalize text-(--muted)">
                    {masterclass.skillLevel}
                  </span>
                  {masterclass.format === 'live' && (
                    <>
                      <span className="text-(--muted)">•</span>
                      <span className="flex items-center gap-1 text-sm text-red-400">
                        <Video className="h-4 w-4" />
                        Live Sessions
                      </span>
                    </>
                  )}
                </div>
                <h1 className="mb-2 text-3xl font-bold text-(--text) md:text-4xl">
                  {masterclass.title}
                </h1>
                {masterclass.subtitle && (
                  <p className="text-xl text-(--muted)">{masterclass.subtitle}</p>
                )}
              </div>

              {/* Stats */}
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
                {masterclass.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-(--gold) text-(--gold)" />
                    <span className="font-bold text-(--text)">
                      {masterclass.averageRating.toFixed(1)}
                    </span>
                    <span className="text-(--muted)">
                      ({masterclass._count.reviews} reviews)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-(--muted)">
                  <Users className="h-5 w-5" />
                  <span>{masterclass._count.enrollments.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1 text-(--muted)">
                  <BookOpen className="h-5 w-5" />
                  <span>{masterclass._count.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-1 text-(--muted)">
                  <Clock className="h-5 w-5" />
                  <span>{formatDuration(masterclass.totalDuration)} total</span>
                </div>
              </div>

              {/* Instructor */}
              <Link href={`/masterclasses/instructors/${masterclass.instructor.id}`}>
                <div className="hover:border-(--accent)/50 mb-8 flex items-center gap-4 rounded-xl border border-(--border) bg-(--panel) p-4 transition-colors">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    {masterclass.instructor.profileImage ? (
                      <Image
                        src={masterclass.instructor.profileImage}
                        alt={masterclass.instructor.displayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-(--accent) to-(--gold) text-xl font-bold text-white">
                        {masterclass.instructor.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-(--text)">
                        {masterclass.instructor.displayName}
                      </span>
                      {masterclass.instructor.verified && (
                        <BadgeCheck className="h-5 w-5 text-(--sky)" />
                      )}
                    </div>
                    <p className="text-(--muted)">{masterclass.instructor.headline}</p>
                    <div className="mt-1 flex items-center gap-4 text-sm text-(--muted)">
                      <span>{masterclass.instructor.totalStudents.toLocaleString()} students</span>
                      {masterclass.instructor.averageRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-(--gold) text-(--gold)" />
                          {masterclass.instructor.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Description */}
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-(--text)">About This Class</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-(--muted)">
                    {masterclass.description}
                  </p>
                </div>
              </div>

              {/* What You'll Learn */}
              {masterclass.whatYouLearn.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-bold text-(--text)">What You'll Learn</h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {masterclass.whatYouLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-(--sage)" />
                        <span className="text-(--muted)">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div className="mb-8">
                <button
                  onClick={() => setExpandedSections((s) => ({ ...s, curriculum: !s.curriculum }))}
                  className="mb-4 flex w-full items-center justify-between text-left"
                >
                  <h2 className="text-xl font-bold text-(--text)">
                    Curriculum ({masterclass.lessons.length} lessons)
                  </h2>
                  {expandedSections.curriculum ? (
                    <ChevronUp className="h-5 w-5 text-(--muted)" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-(--muted)" />
                  )}
                </button>

                {expandedSections.curriculum && (
                  <div className="space-y-1">
                    {masterclass.lessons.map((lesson, index) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        index={index + 1}
                        hasAccess={hasAccess}
                        isCompleted={completedLessons.includes(lesson.id)}
                        onPlay={() => {
                          // TODO: Open video player
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Requirements */}
              {masterclass.requirements.length > 0 && (
                <div className="mb-8">
                  <button
                    onClick={() =>
                      setExpandedSections((s) => ({ ...s, requirements: !s.requirements }))
                    }
                    className="mb-4 flex w-full items-center justify-between text-left"
                  >
                    <h2 className="text-xl font-bold text-(--text)">Requirements</h2>
                    {expandedSections.requirements ? (
                      <ChevronUp className="h-5 w-5 text-(--muted)" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-(--muted)" />
                    )}
                  </button>

                  {expandedSections.requirements && (
                    <ul className="space-y-2">
                      {masterclass.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-(--muted)">
                          <span className="text-(--accent)">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Reviews */}
              {masterclass.reviews.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedSections((s) => ({ ...s, reviews: !s.reviews }))}
                    className="mb-4 flex w-full items-center justify-between text-left"
                  >
                    <h2 className="text-xl font-bold text-(--text)">
                      Reviews ({masterclass._count.reviews})
                    </h2>
                    {expandedSections.reviews ? (
                      <ChevronUp className="h-5 w-5 text-(--muted)" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-(--muted)" />
                    )}
                  </button>

                  {expandedSections.reviews && (
                    <div className="space-y-4">
                      {masterclass.reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="overflow-hidden rounded-xl border border-(--border) bg-(--panel)">
                  {/* Price */}
                  <div className="border-b border-(--border) p-6">
                    {masterclass.isFree ? (
                      <div className="text-3xl font-bold text-(--sage)">Free</div>
                    ) : (
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-(--text)">
                          ${masterclass.price?.toFixed(2)}
                        </span>
                        {masterclass.originalPrice &&
                          masterclass.originalPrice > (masterclass.price || 0) && (
                            <>
                              <span className="text-lg text-(--muted) line-through">
                                ${masterclass.originalPrice.toFixed(2)}
                              </span>
                              <span className="rounded bg-red-500 px-2 py-0.5 text-sm text-white">
                                {Math.round(
                                  (1 - (masterclass.price || 0) / masterclass.originalPrice) * 100
                                )}
                                % OFF
                              </span>
                            </>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Enroll Button */}
                  <div className="p-6">
                    {hasAccess ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <CheckCircle className="mx-auto mb-2 h-12 w-12 text-(--sage)" />
                          <p className="font-medium text-(--text)">You're Enrolled!</p>
                          <p className="text-sm text-(--muted)">
                            {enrollment!.lessonsCompleted}/{enrollment!.totalLessons} lessons
                            completed
                          </p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-(--bg)">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-(--accent) to-(--gold) transition-all"
                            style={{ width: `${Number(enrollment!.progressPercent)}%` }}
                          />
                        </div>
                        <Link href={`/masterclasses/${masterclass.slug}/watch`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-(--accent) to-(--gold) py-3 font-semibold text-white"
                          >
                            <Play className="h-5 w-5" />
                            Continue Learning
                          </motion.button>
                        </Link>
                      </div>
                    ) : isInstructor ? (
                      <Link href={`/masterclasses/instructor/${masterclass.id}/edit`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full rounded-lg border border-(--border) bg-(--bg) py-3 font-semibold text-(--text)"
                        >
                          Edit Masterclass
                        </motion.button>
                      </Link>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full rounded-lg bg-linear-to-r from-(--accent) to-(--gold) py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {enrolling ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </span>
                        ) : masterclass.isFree ? (
                          'Enroll for Free'
                        ) : (
                          `Enroll Now - $${masterclass.price?.toFixed(2)}`
                        )}
                      </motion.button>
                    )}

                    {/* Features */}
                    {masterclass.features.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="font-medium text-(--text)">This class includes:</h4>
                        {masterclass.features.map((feature, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-(--muted)"
                          >
                            <CheckCircle className="h-4 w-4 text-(--sage)" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Access Info */}
                    <div className="mt-6 space-y-2 border-t border-(--border) pt-6 text-sm text-(--muted)">
                      {masterclass.accessDays ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {masterclass.accessDays} days of access
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Lifetime access
                        </div>
                      )}
                      {masterclass.format !== 'live' && (
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Downloadable resources
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MasterclassDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--bg)">
          <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Link href="/">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={140}
                  height={56}
                  className="transition-opacity hover:opacity-80"
                />
              </Link>
            </div>
            <div className="space-y-6">
              <CourseCardSkeleton />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <CourseCardSkeleton />
                  <CourseCardSkeleton />
                </div>
                <div>
                  <CourseCardSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <MasterclassDetailContent />
    </Suspense>
  );
}
