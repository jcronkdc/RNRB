'use client';

import { motion } from 'motion/react';
import {
  GraduationCap,
  Play,
  Users,
  Clock,
  Star,
  Filter,
  Search,
  BookOpen,
  Mic,
  Music,
  Radio,
  Headphones,
  Video,
  Sparkles,
  TrendingUp,
  BadgeCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { EmptyState } from '@/components/empty-states';

interface Instructor {
  id: string;
  displayName: string;
  headline?: string;
  profileImage?: string;
  verified: boolean;
  averageRating: number;
}

interface Masterclass {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  shortDesc?: string;
  category: string;
  tags: string[];
  skillLevel: string;
  format: string;
  isFree: boolean;
  price?: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  totalDuration?: number;
  lessonCount: number;
  averageRating: number;
  enrollmentCount: number;
  instructor: Instructor;
  _count: {
    lessons: number;
    enrollments: number;
    reviews: number;
  };
}

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: BookOpen },
  { value: 'guitar', label: 'Guitar', icon: Music },
  { value: 'vocals', label: 'Vocals', icon: Mic },
  { value: 'production', label: 'Production', icon: Headphones },
  { value: 'mixing', label: 'Mixing', icon: Radio },
  { value: 'songwriting', label: 'Songwriting', icon: Music },
  { value: 'music_business', label: 'Music Business', icon: TrendingUp },
  { value: 'recording', label: 'Recording', icon: Video },
];

const SKILL_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function MasterclassCard({ masterclass }: { masterclass: Masterclass }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Link href={`/masterclasses/${masterclass.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-xl border border-(--border) bg-(--panel) transition-all hover:border-(--accent)/50"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video">
          {masterclass.thumbnailUrl ? (
            <Image
              src={masterclass.thumbnailUrl}
              alt={masterclass.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-[#2a2620] to-[#352f28]">
              <GraduationCap className="h-12 w-12 text-(--accent)/30" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <motion.div
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-(--accent)"
            >
              <Play className="ml-1 h-6 w-6 text-white" />
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {masterclass.isFree && (
              <span className="rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">
                FREE
              </span>
            )}
            {masterclass.format === 'live' && (
              <span className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            )}
          </div>

          {/* Duration */}
          {masterclass.totalDuration && (
            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
              <Clock className="h-3 w-3" />
              {formatDuration(masterclass.totalDuration)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <div className="mb-2 text-xs font-medium tracking-wider text-(--accent) uppercase">
            {masterclass.category.replace('_', ' ')}
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-(--text) transition-colors group-hover:text-(--accent)">
            {masterclass.title}
          </h3>

          {/* Instructor */}
          <div className="mb-3 flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-(--border)">
              {masterclass.instructor.profileImage ? (
                <Image
                  src={masterclass.instructor.profileImage}
                  alt={masterclass.instructor.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-(--accent) to-(--gold) text-xs font-bold text-white">
                  {masterclass.instructor.displayName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-sm text-(--muted)">{masterclass.instructor.displayName}</span>
            {masterclass.instructor.verified && <BadgeCheck className="h-4 w-4 text-(--sky)" />}
          </div>

          {/* Stats */}
          <div className="mb-3 flex items-center gap-4 text-xs text-(--muted)">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {masterclass._count.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {masterclass._count.enrollments.toLocaleString()}
            </span>
            {masterclass.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-(--gold) text-(--gold)" />
                {masterclass.averageRating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            {masterclass.isFree ? (
              <span className="font-bold text-(--sage)">Free</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-(--text)">
                  ${masterclass.price?.toFixed(2)}
                </span>
                {masterclass.originalPrice &&
                  masterclass.originalPrice > (masterclass.price || 0) && (
                    <span className="text-sm text-(--muted) line-through">
                      ${masterclass.originalPrice.toFixed(2)}
                    </span>
                  )}
              </div>
            )}
            <span className="text-xs text-(--muted) capitalize">{masterclass.skillLevel}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function FeaturedInstructor({
  instructor,
}: {
  instructor: Instructor & { _count: { masterclasses: number } };
}) {
  return (
    <Link href={`/masterclasses/instructors/${instructor.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-4 rounded-xl border border-(--accent)/20 bg-linear-to-r from-(--accent)/10 to-(--gold)/10 p-4 transition-all hover:border-(--accent)/50"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
          {instructor.profileImage ? (
            <Image
              src={instructor.profileImage}
              alt={instructor.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-(--accent) to-(--gold) text-xl font-bold text-white">
              {instructor.displayName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-bold text-(--text)">{instructor.displayName}</h4>
            {instructor.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-(--sky)" />}
          </div>
          <p className="truncate text-sm text-(--muted)">{instructor.headline}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-(--muted)">
            <span>{instructor._count.masterclasses} classes</span>
            {instructor.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-(--gold) text-(--gold)" />
                {instructor.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function MasterclassesPage() {
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [featuredInstructors, setFeaturedInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [skillLevel, setSkillLevel] = useState('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMasterclasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (skillLevel !== 'all') params.append('level', skillLevel);
      if (showFreeOnly) params.append('free', 'true');

      const [classesRes, instructorsRes] = await Promise.all([
        fetch(`/api/masterclasses?${params.toString()}`),
        fetch('/api/instructors?featured=true&limit=4'),
      ]);

      if (classesRes.ok) {
        const data = await classesRes.json();
        setMasterclasses(data.masterclasses);
      }

      if (instructorsRes.ok) {
        const data = await instructorsRes.json();
        setFeaturedInstructors(data.instructors);
      }
    } catch (error) {
      console.error('Failed to fetch masterclasses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, skillLevel, showFreeOnly]);

  useEffect(() => {
    const debounce = setTimeout(fetchMasterclasses, 300);
    return () => clearTimeout(debounce);
  }, [fetchMasterclasses]);

  return (
    <div className="min-h-screen bg-(--bg)">
      {/* Header */}
      <div className="border-b border-(--border) bg-(--panel)">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
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

          {/* Title */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--accent)/10 px-4 py-2 text-sm font-medium text-(--accent)">
              <GraduationCap className="h-4 w-4" />
              Masterclasses
            </div>
            <h1 className="mb-2 text-3xl font-bold text-(--text) md:text-4xl">
              Learn From the{' '}
              <span className="bg-linear-to-r from-(--accent) to-(--gold) bg-clip-text text-transparent">
                Best in Music
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-(--muted)">
              World-class instruction from Grammy winners, touring pros, and industry legends. Live
              sessions, pre-recorded courses, and hands-on learning.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-(--muted)" />
              <input
                type="text"
                placeholder="Search masterclasses, instructors, or topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-(--border) bg-(--bg) py-3 pr-4 pl-12 text-(--text) placeholder-(--muted) focus:ring-2 focus:ring-(--accent) focus:outline-hidden"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-2 transition-colors ${
                  showFilters ? 'bg-(--accent) text-white' : 'text-(--muted) hover:bg-(--border)'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 rounded-xl border border-(--border) bg-(--bg) p-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--muted)">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-(--border) bg-(--panel) px-3 py-2 text-(--text)"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--muted)">
                      Skill Level
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full rounded-lg border border-(--border) bg-(--panel) px-3 py-2 text-(--text)"
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showFreeOnly}
                        onChange={(e) => setShowFreeOnly(e.target.checked)}
                        className="h-5 w-5 rounded border-(--border) bg-(--panel) text-(--accent) focus:ring-(--accent)"
                      />
                      <span className="text-(--text)">Free classes only</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Category Pills */}
        <div className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'bg-(--accent) text-white'
                    : 'bg-(--panel) text-(--muted) hover:bg-(--border)'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Featured Instructors */}
        {featuredInstructors.length > 0 && !search && !category && (
          <section className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-(--gold)" />
              <h2 className="text-xl font-bold text-(--text)">Featured Instructors</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {featuredInstructors.map((instructor) => (
                <FeaturedInstructor key={instructor.id} instructor={instructor} />
              ))}
            </div>
          </section>
        )}

        {/* Masterclasses Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-(--accent) border-t-transparent" />
              <p className="text-(--muted)">Loading masterclasses...</p>
            </div>
          </div>
        ) : masterclasses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {masterclasses.map((masterclass) => (
              <MasterclassCard key={masterclass.id} masterclass={masterclass} />
            ))}
          </div>
        ) : (
          <EmptyState
            type="masterclasses"
            title={search || category ? 'No Masterclasses Found' : 'No Masterclasses Available'}
            description={
              search || category
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to create a masterclass and share your expertise!'
            }
            actionLabel="Become an Instructor"
            actionHref="/masterclasses/instructor"
          />
        )}

        {/* Become an Instructor CTA */}
        {masterclasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 rounded-2xl border border-(--accent)/20 bg-linear-to-r from-(--accent)/15 to-(--gold)/15 p-8 text-center"
          >
            <h3 className="mb-2 text-2xl font-bold text-(--text)">Share Your Expertise</h3>
            <p className="mx-auto mb-6 max-w-xl text-(--muted)">
              Are you a professional musician, producer, or industry expert? Create your own
              masterclass and earn money teaching what you love.
            </p>
            <Link href="/masterclasses/instructor">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-6 py-3 font-semibold text-white"
              >
                <GraduationCap className="h-5 w-5" />
                Become an Instructor
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
