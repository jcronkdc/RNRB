'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Calendar,
  Play,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  isFreePreview: boolean;
  order: number;
}

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
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all', label: 'All Levels' },
];

export default function CreateMasterclassPage() {
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const trailerInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [category, setCategory] = useState('');
  const [skillLevel, setSkillLevel] = useState('all');
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [courseType, setCourseType] = useState<'pre_recorded' | 'live'>('pre_recorded');
  const [scheduledAt, setScheduledAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'lessons' | 'pricing' | 'preview'>(
    'details'
  );

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      isFreePreview: false,
      order: lessons.length + 1,
    };
    setLessons([...lessons, newLesson]);
    setExpandedLesson(newLesson.id);
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setLessons(lessons.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i + 1 })));
  };

  const moveLesson = (id: string, direction: 'up' | 'down') => {
    const index = lessons.findIndex((l) => l.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === lessons.length - 1)
    ) {
      return;
    }

    const newLessons = [...lessons];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newLessons[index], newLessons[swapIndex]] = [newLessons[swapIndex], newLessons[index]];
    setLessons(newLessons.map((l, i) => ({ ...l, order: i + 1 })));
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/masterclasses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          shortDescription,
          thumbnailUrl,
          trailerUrl,
          category,
          skillLevel,
          priceCents: isFree ? 0 : Math.round(price * 100),
          type: courseType,
          scheduledAt: courseType === 'live' ? scheduledAt : undefined,
          maxParticipants: courseType === 'live' ? maxParticipants : undefined,
          status: 'draft',
          lessons: lessons.map((l) => ({
            title: l.title,
            description: l.description,
            videoUrl: l.videoUrl,
            duration: l.duration,
            isFreePreview: l.isFreePreview,
            order: l.order,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save draft');

      const { masterclass } = await response.json();
      router.push(`/masterclasses/instructor?created=${masterclass.id}`);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/masterclasses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          shortDescription,
          thumbnailUrl,
          trailerUrl,
          category,
          skillLevel,
          priceCents: isFree ? 0 : Math.round(price * 100),
          type: courseType,
          scheduledAt: courseType === 'live' ? scheduledAt : undefined,
          maxParticipants: courseType === 'live' ? maxParticipants : undefined,
          status: 'published',
          lessons: lessons.map((l) => ({
            title: l.title,
            description: l.description,
            videoUrl: l.videoUrl,
            duration: l.duration,
            isFreePreview: l.isFreePreview,
            order: l.order,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to publish');

      const { masterclass } = await response.json();
      router.push(`/masterclasses/${masterclass.slug}`);
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = () => {
    if (!title.trim()) return false;
    if (!description.trim()) return false;
    if (!category) return false;
    if (courseType === 'pre_recorded' && lessons.length === 0) return false;
    if (courseType === 'live' && !scheduledAt) return false;
    return true;
  };

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/masterclasses/instructor">
              <button className="text-[var(--muted)] hover:text-[var(--text)]">
                <X className="h-6 w-6" />
              </button>
            </Link>
            <div>
              <h1 className="font-bold text-[var(--text)]">Create Masterclass</h1>
              <p className="text-xs text-[var(--muted)]">Draft • Not published</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-[var(--muted)] hover:text-[var(--text)]"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </button>
            <button
              onClick={publish}
              disabled={!canPublish() || isPublishing}
              className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-2 text-[var(--text)] disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-6 border-b border-transparent">
            {(['details', 'lessons', 'pricing', 'preview'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`-mb-px border-b-2 px-2 pb-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-8 lg:grid-cols-3"
            >
              {/* Main form */}
              <div className="space-y-6 lg:col-span-2">
                {/* Course Type */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                  <h2 className="mb-4 font-bold text-[var(--text)]">Course Type</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCourseType('pre_recorded')}
                      className={`rounded-xl border-2 p-4 text-left transition-colors ${
                        courseType === 'pre_recorded'
                          ? 'bg-[var(--accent)]/10 border-[var(--accent)]'
                          : 'hover:border-[var(--accent)]/50 border-[var(--border)]'
                      }`}
                    >
                      <Video className="mb-2 h-8 w-8 text-[var(--accent)]" />
                      <div className="font-medium text-[var(--text)]">Pre-recorded</div>
                      <div className="text-sm text-[var(--muted)]">Upload video lessons</div>
                    </button>
                    <button
                      onClick={() => setCourseType('live')}
                      className={`rounded-xl border-2 p-4 text-left transition-colors ${
                        courseType === 'live'
                          ? 'bg-[var(--accent)]/10 border-[var(--accent)]'
                          : 'hover:border-[var(--accent)]/50 border-[var(--border)]'
                      }`}
                    >
                      <Play className="mb-2 h-8 w-8 text-[var(--accent)]" />
                      <div className="font-medium text-[var(--text)]">Live Session</div>
                      <div className="text-sm text-[var(--muted)]">Stream in real-time</div>
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                  <h2 className="mb-4 font-bold text-[var(--text)]">Basic Information</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Complete Guitar Mastery"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="A brief one-liner about your course"
                        maxLength={160}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {shortDescription.length}/160
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                        Full Description *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what students will learn, prerequisites, and what makes your course unique..."
                        rows={6}
                        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                          Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                          <option value="">Select category</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                          Skill Level
                        </label>
                        <select
                          value={skillLevel}
                          onChange={(e) => setSkillLevel(e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                          {SKILL_LEVELS.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Session Settings */}
                {courseType === 'live' && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                    <h2 className="mb-4 font-bold text-[var(--text)]">Live Session Settings</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                          Scheduled Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                          Max Participants
                        </label>
                        <input
                          type="number"
                          value={maxParticipants}
                          onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 100)}
                          min={1}
                          max={1000}
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Thumbnail */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                  <h2 className="mb-4 font-bold text-[var(--text)]">Thumbnail</h2>
                  <button
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg)] transition-colors hover:border-[var(--accent)]"
                  >
                    {thumbnailUrl ? (
                      <Image src={thumbnailUrl} alt="Thumbnail" fill className="object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto mb-2 h-10 w-10 text-[var(--muted)]" />
                        <span className="text-sm text-[var(--muted)]">Upload thumbnail</span>
                      </div>
                    )}
                  </button>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setThumbnailUrl(URL.createObjectURL(file));
                    }}
                    className="hidden"
                  />
                </div>

                {/* Trailer */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                  <h2 className="mb-4 font-bold text-[var(--text)]">Preview Video</h2>
                  <input
                    type="url"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    placeholder="YouTube or Vimeo URL"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* Course Stats */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                  <h2 className="mb-4 font-bold text-[var(--text)]">Course Stats</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Lessons</span>
                      <span className="text-[var(--text)]">{lessons.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Total Duration</span>
                      <span className="text-[var(--text)]">
                        {Math.round(totalDuration / 60)} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Price</span>
                      <span className="text-[var(--text)]">{isFree ? 'Free' : `$${price}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'lessons' && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[var(--text)]">Course Curriculum</h2>
                    <p className="text-sm text-[var(--muted)]">Add and organize your lessons</p>
                  </div>
                  <button
                    onClick={addLesson}
                    className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-[var(--text)]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </button>
                </div>

                {lessons.length === 0 ? (
                  <div className="py-12 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]" />
                    <h3 className="mb-2 font-medium text-[var(--text)]">No lessons yet</h3>
                    <p className="mb-4 text-sm text-[var(--muted)]">
                      Add your first lesson to get started
                    </p>
                    <button
                      onClick={addLesson}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-[var(--text)]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="rounded-lg border border-[var(--border)] bg-[var(--bg)]"
                      >
                        <div
                          className="flex cursor-pointer items-center gap-3 p-4"
                          onClick={() =>
                            setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)
                          }
                        >
                          <GripVertical className="h-5 w-5 text-[var(--muted)]" />
                          <div className="bg-[var(--accent)]/20 flex h-8 w-8 items-center justify-center rounded-full">
                            <span className="text-sm text-[var(--accent)]">{index + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-[var(--text)]">
                              {lesson.title || 'Untitled Lesson'}
                            </div>
                            {lesson.duration > 0 && (
                              <div className="text-xs text-[var(--muted)]">
                                {Math.round(lesson.duration / 60)} min
                              </div>
                            )}
                          </div>
                          {lesson.isFreePreview && (
                            <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                              Free Preview
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveLesson(lesson.id, 'up');
                              }}
                              className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveLesson(lesson.id, 'down');
                              }}
                              className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLesson(lesson.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedLesson === lesson.id && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-4 border-t border-[var(--border)] p-4 pt-0">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                                    Lesson Title
                                  </label>
                                  <input
                                    type="text"
                                    value={lesson.title}
                                    onChange={(e) =>
                                      updateLesson(lesson.id, { title: e.target.value })
                                    }
                                    placeholder="e.g., Introduction to Chord Progressions"
                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                                    Description
                                  </label>
                                  <textarea
                                    value={lesson.description}
                                    onChange={(e) =>
                                      updateLesson(lesson.id, { description: e.target.value })
                                    }
                                    placeholder="What will students learn in this lesson?"
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                                      Video URL
                                    </label>
                                    <input
                                      type="url"
                                      value={lesson.videoUrl}
                                      onChange={(e) =>
                                        updateLesson(lesson.id, { videoUrl: e.target.value })
                                      }
                                      placeholder="https://..."
                                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                                      Duration (minutes)
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        lesson.duration > 0 ? Math.round(lesson.duration / 60) : ''
                                      }
                                      onChange={(e) =>
                                        updateLesson(lesson.id, {
                                          duration: parseInt(e.target.value) * 60 || 0,
                                        })
                                      }
                                      placeholder="10"
                                      min={1}
                                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    />
                                  </div>
                                </div>
                                <label className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={lesson.isFreePreview}
                                    onChange={(e) =>
                                      updateLesson(lesson.id, { isFreePreview: e.target.checked })
                                    }
                                    className="h-4 w-4 rounded border-[var(--border)] bg-[var(--panel)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                  />
                                  <span className="text-sm text-[var(--muted)]">
                                    Make this lesson a free preview
                                  </span>
                                </label>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-2xl"
            >
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                <h2 className="mb-6 font-bold text-[var(--text)]">Pricing</h2>

                {/* Free/Paid Toggle */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsFree(true)}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      isFree
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-[var(--border)] hover:border-green-500/50'
                    }`}
                  >
                    <div className="font-medium text-[var(--text)]">Free</div>
                    <div className="text-sm text-[var(--muted)]">Open to everyone</div>
                  </button>
                  <button
                    onClick={() => setIsFree(false)}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      !isFree
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)]'
                        : 'hover:border-[var(--accent)]/50 border-[var(--border)]'
                    }`}
                  >
                    <div className="font-medium text-[var(--text)]">Paid</div>
                    <div className="text-sm text-[var(--muted)]">Set your own price</div>
                  </button>
                </div>

                {/* Price Input */}
                {!isFree && (
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        $
                      </span>
                      <input
                        type="number"
                        value={price || ''}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        placeholder="49"
                        min={0}
                        step={1}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] py-3 pl-8 pr-4 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                  </div>
                )}

                {/* Revenue Breakdown */}
                {!isFree && price > 0 && (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                    <h3 className="mb-4 font-medium text-[var(--text)]">Revenue Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted)]">Course Price</span>
                        <span className="text-[var(--text)]">${price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted)]">Platform Fee (15%)</span>
                        <span className="text-red-400">-${(price * 0.15).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted)]">Payment Processing (~3%)</span>
                        <span className="text-red-400">-${(price * 0.03).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-[var(--border)] pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[var(--text)]">Your Earnings</span>
                          <span className="text-xl font-bold text-green-400">
                            ${(price * 0.82).toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Per enrollment, before taxes
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                {/* Preview header */}
                <div className="relative aspect-video bg-[var(--bg)]">
                  {thumbnailUrl ? (
                    <Image src={thumbnailUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-[var(--muted)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="mb-3 inline-block rounded-full bg-[var(--accent)] px-3 py-1 text-sm text-[var(--text)]">
                      {category || 'Category'}
                    </span>
                    <h2 className="mb-2 text-3xl font-bold text-[var(--text)]">
                      {title || 'Course Title'}
                    </h2>
                    <p className="text-[var(--muted)]">
                      {shortDescription || 'Short description of your course'}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[var(--muted)]" />
                      <span className="text-[var(--text)]">
                        {Math.round(totalDuration / 60)} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[var(--muted)]" />
                      <span className="text-[var(--text)]">{lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[var(--muted)]" />
                      <span className="text-[var(--text)]">
                        {SKILL_LEVELS.find((l) => l.value === skillLevel)?.label || 'All Levels'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 text-[var(--muted)]">
                    {description || 'Full description of your course will appear here...'}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-[var(--text)]">
                      {isFree ? 'Free' : `$${price}`}
                    </div>
                    <button className="rounded-full bg-[var(--accent)] px-8 py-3 text-[var(--text)]">
                      {isFree ? 'Enroll Free' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
