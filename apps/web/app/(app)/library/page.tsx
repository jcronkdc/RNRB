'use client';

import { motion } from 'framer-motion';
import {
  Music,
  Play,
  Pause,
  Trash2,
  Grid3x3,
  List,
  Search,
  FileAudio,
  Disc,
  Mic2,
  Radio,
  Loader2,
  Share2,
  Folder,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAudioUpload } from '@/hooks/use-audio-upload';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { createBrowserClient } from '@/lib/supabase';


type LibraryFile = {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: 'stem' | 'demo' | 'sample' | 'loop' | 'other';
  uploadedAt: string;
  uploadedBy: string;
  tags?: string[];
};

export default function LibraryPage() {
  const { user, loading } = useRequireAuth();
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { upload, uploading, progress, error: uploadError } = useAudioUpload();

  useEffect(() => {
    if (user) {
      // Load library files from user metadata
      const libraryFiles = user.user_metadata?.library_files || [];
      setFiles(libraryFiles);
    }
  }, [user]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: LibraryFile['type']
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Map library types to upload types
    const uploadType: 'demo' | 'stem' | 'final' | 'reference' =
      type === 'other' || type === 'loop' || type === 'sample'
        ? 'demo'
        : type;

    // Upload to library folder in Supabase Storage
    const result = await upload(file, 'library', user.id, uploadType);
    if (result) {
      const newFile: LibraryFile = {
        id: `lib_${Date.now()}`,
        name: file.name,
        url: result.url,
        path: result.path,
        size: file.size,
        type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.email || 'Unknown',
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);

      // Save to user metadata
      const supabase = createBrowserClient();
      if (user && supabase) {
        await supabase.auth.updateUser({
          data: {
            ...(user.user_metadata || {}),
            library_files: updatedFiles,
          },
        });
      }
    }

    event.target.value = '';
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file from your library?')) return;

    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);

    const supabase = createBrowserClient();
    if (user && supabase) {
      await supabase.auth.updateUser({
        data: {
          ...(user.user_metadata || {}),
          library_files: updatedFiles,
        },
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stem':
        return <Disc className="h-5 w-5 text-orange-500" />;
      case 'demo':
        return <Music className="h-5 w-5 text-orange-500" />;
      case 'sample':
        return <Mic2 className="h-5 w-5 text-orange-500" />;
      case 'loop':
        return <Radio className="h-5 w-5 text-orange-500" />;
      default:
        return <FileAudio className="h-5 w-5 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <div className="text-center">
            <div className="text-lg font-medium text-white">Loading your library...</div>
            <div className="mt-2 text-sm text-gray-400">Preparing your music assets</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/50 to-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {/* Improved Header with Better Mobile Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 p-4 sm:mb-8 sm:p-6 lg:mb-12 lg:p-10"
        >
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 sm:h-12 sm:w-12">
                  <Folder className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
                </div>
                <h1 className="truncate text-2xl font-bold text-white sm:text-3xl lg:text-4xl">My Library</h1>
              </div>
              <p className="text-sm text-gray-300 sm:text-base lg:text-xl">Your music assets, ready to collaborate</p>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-xl p-2 transition-all sm:p-3 ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-xl p-2 transition-all sm:p-3 ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4 md:flex-row lg:mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2.5 pl-9 pr-3 text-sm text-white transition-all placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:py-3 sm:pl-12 sm:pr-4 sm:text-base"
            />
          </div>

          {/* Filter - Horizontal Scroll on Mobile */}
          <div className="flex gap-1.5 overflow-x-auto sm:gap-2">
            {['all', 'stem', 'demo', 'sample', 'loop', 'other'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-3 sm:text-sm ${
                  filterType === type
                    ? 'bg-orange-500 text-white'
                    : 'border border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Upload Section - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6 lg:mb-8"
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5 lg:gap-4">
            {[
              { type: 'stem' as const, label: 'Upload Stem', icon: Disc },
              { type: 'demo' as const, label: 'Upload Demo', icon: Music },
              { type: 'sample' as const, label: 'Upload Sample', icon: Mic2 },
              { type: 'loop' as const, label: 'Upload Loop', icon: Radio },
              { type: 'other' as const, label: 'Upload File', icon: FileAudio },
            ].map((uploadType) => (
              <label
                key={uploadType.type}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-800 bg-gray-900 p-3 transition-all hover:border-orange-500 hover:bg-gray-800/50 sm:gap-3 sm:p-4 lg:p-6"
              >
                <uploadType.icon className="h-6 w-6 text-gray-500 transition-colors group-hover:text-orange-500 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                <span className="text-center text-xs font-medium text-gray-400 transition-colors group-hover:text-white sm:text-sm">
                  {uploadType.label}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, uploadType.type)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            ))}
          </div>

          {uploading && (
            <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900 p-3 sm:mt-4 sm:p-4">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500 sm:h-5 sm:w-5" />
                <span className="text-sm text-white sm:text-base">Uploading... {progress?.percentage || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-800">
                <div
                  className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${progress?.percentage || 0}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 sm:mt-4 sm:p-4">
              <p className="text-sm text-red-400 sm:text-base">{uploadError}</p>
            </div>
          )}
        </motion.div>

        {/* Files Grid/List - Mobile Optimized */}
        {filteredFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center sm:p-8 lg:p-12"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 sm:mb-6 sm:h-24 sm:w-24">
              <Folder className="h-10 w-10 text-orange-500 sm:h-12 sm:w-12" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
              {searchQuery || filterType !== 'all' ? 'No files found' : 'Your Library is Empty'}
            </h2>
            <p className="mb-4 text-sm text-gray-400 sm:mb-6 sm:text-base">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Upload your first audio file to get started'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3'
                : 'space-y-2'
            }
          >
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`group rounded-xl border border-gray-800 bg-gray-900 p-4 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 sm:p-6 ${
                  viewMode === 'list' ? 'flex items-center gap-3 sm:gap-4' : ''
                }`}
              >
                {/* Icon */}
                <div
                  className={`${viewMode === 'grid' ? 'mb-3 sm:mb-4' : 'shrink-0'} flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 sm:h-12 sm:w-12`}
                >
                  {getTypeIcon(file.type)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 truncate text-sm font-semibold text-white transition-colors group-hover:text-orange-500 sm:text-base">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 sm:gap-2 sm:text-sm">
                    <span className="capitalize">{file.type}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-1.5 sm:mt-4 sm:gap-2 md:mt-0">
                  <button
                    onClick={() => setPlayingId(playingId === file.id ? null : file.id)}
                    className="rounded-lg bg-orange-500/10 p-1.5 text-orange-500 transition-all hover:bg-orange-500 hover:text-white sm:p-2"
                  >
                    {playingId === file.id ? (
                      <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>
                  <button className="rounded-lg bg-gray-800 p-1.5 text-gray-400 transition-all hover:bg-gray-700 hover:text-white sm:p-2">
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="rounded-lg bg-gray-800 p-1.5 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-500 sm:p-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
