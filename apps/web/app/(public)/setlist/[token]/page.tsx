'use client';

/**
 * PUBLIC SETLIST VIEWER
 *
 * VIRAL LOOP: Fans scan QR code → see tonight's setlist → discover RNRB
 *
 * This page is:
 * - Beautiful and mobile-optimized (fans are at gigs on phones)
 * - Branded with "Powered by Rock N' Roll Basement"
 * - Has clear CTA to sign up
 * - Tracks conversions for viral analytics
 */

import { Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Music,
  Clock,
  MapPin,
  Calendar,
  Star,
  Users,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SetlistSong {
  position: number;
  title: string;
  key?: string;
  tempo?: number;
  duration?: number;
  isEncore: boolean;
  notes?: string;
}

interface PublicSetlist {
  title: string;
  showName: string;
  showDate: string;
  venue?: {
    name: string;
    location: string;
  };
  artist: {
    name: string;
    slug: string;
    image?: string;
  };
  songs: SetlistSong[];
  totalDuration: number;
  viewCount: number;
}

export default function PublicSetlistPage() {
  const params = useParams();
  const token = params.token as string;

  const [setlist, setSetlist] = useState<PublicSetlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSetlist();
  }, [token]);

  const loadSetlist = async () => {
    try {
      const response = await fetch(`/api/setlist-public/${token}`);
      if (!response.ok) {
        throw new Error('Setlist not found');
      }
      const data = await response.json();
      setSetlist(data);
    } catch (err) {
      setError('This setlist is not available or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Music className="h-12 w-12 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (error || !setlist) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-white">Setlist Not Found</h1>
          <p className="mb-8 text-gray-400">{error}</p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Explore Rock N' Roll Basement
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const encoreSongs = setlist.songs.filter((s) => s.isEncore);
  const mainSongs = setlist.songs.filter((s) => !s.isEncore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-orange-500/20 via-transparent to-purple-500/20 px-4 py-8 backdrop-blur-sm"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Artist Avatar */}
          {setlist.artist.image && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-orange-500/50 shadow-lg shadow-orange-500/20"
            >
              <Image
                src={setlist.artist.image}
                alt={setlist.artist.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-2 text-3xl font-bold text-white md:text-4xl"
          >
            {setlist.artist.name}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-xl text-orange-400"
          >
            {setlist.title}
          </motion.h2>

          {/* Show Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400"
          >
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-orange-500" />
              {formatDate(setlist.showDate)}
            </div>
            {setlist.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-orange-500" />
                {setlist.venue.name}, {setlist.venue.location}
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex justify-center gap-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{setlist.songs.length}</div>
              <div className="text-xs text-gray-500">Songs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatTotalDuration(setlist.totalDuration)}
              </div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                <Users className="h-5 w-5 text-orange-500" />
                {setlist.viewCount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Setlist */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Main Set */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            <Music className="h-4 w-4 text-orange-500" />
            Set List
          </div>

          <div className="space-y-2">
            {mainSongs.map((song, index) => (
              <motion.div
                key={`${song.position}-${song.title}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all hover:border-orange-500/30 hover:bg-white/10"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-sm font-bold text-orange-400">
                  {song.position}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-white">{song.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {song.key && <span>{song.key}</span>}
                    {song.tempo && <span>{song.tempo} BPM</span>}
                    {song.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(song.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Encore */}
        {encoreSongs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-purple-400">
              <Star className="h-4 w-4" />
              Encore
            </div>

            <div className="space-y-2">
              {encoreSongs.map((song, index) => (
                <motion.div
                  key={`encore-${song.position}-${song.title}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-center gap-4 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/30 text-sm font-bold text-purple-300">
                    E{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{song.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {song.key && <span>{song.key}</span>}
                      {song.tempo && <span>{song.tempo} BPM</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* CTA Footer - VIRAL CONVERSION */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="border-t border-white/10 bg-gradient-to-r from-orange-500/10 via-transparent to-purple-500/10 px-4 py-12"
      >
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={150}
              height={50}
              className="mx-auto mb-6"
            />
          </Link>

          <h3 className="mb-2 text-xl font-bold text-white">Ready to rock your own shows?</h3>
          <p className="mb-6 text-gray-400">
            Create AI-powered setlists, manage your tours, and connect with fans.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button className="group flex items-center gap-2 bg-orange-500 px-8 py-3 text-lg font-semibold hover:bg-orange-600">
                <Sparkles className="h-5 w-5" />
                Start Free
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                See All Features
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-600">
            Powered by Rock N' Roll Basement • The platform for serious musicians
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
