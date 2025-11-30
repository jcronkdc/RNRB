'use client';

/**
 * R&R Labs Contribution Portal
 *
 * Upload audio and MIDI files to help train the AI model
 * - Drag & drop file upload
 * - Metadata collection (genre, BPM, key)
 * - Contribution history
 * - Progress tracking
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Upload,
  CheckCircle,
  Loader2,
  FileAudio,
  Music,
  ArrowLeft,
  Sparkles,
  Shield,
  Trash2,
  X,
  AlertCircle,
  File,
  Clock,
  BarChart3,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

import { useRequireAuth } from '@/hooks/use-require-auth';

// Supported file types
const SUPPORTED_AUDIO_TYPES = ['.mp3', '.wav', '.ogg', '.flac'];
const SUPPORTED_MIDI_TYPES = ['.mid', '.midi'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Genre options
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
  'Ambient',
];

// Musical keys
const KEYS = [
  'C Major',
  'C Minor',
  'C# Major',
  'C# Minor',
  'D Major',
  'D Minor',
  'D# Major',
  'D# Minor',
  'E Major',
  'E Minor',
  'F Major',
  'F Minor',
  'F# Major',
  'F# Minor',
  'G Major',
  'G Minor',
  'G# Major',
  'G# Minor',
  'A Major',
  'A Minor',
  'A# Major',
  'A# Minor',
  'B Major',
  'B Minor',
];

type FileWithMeta = {
  file: File;
  id: string;
  type: 'audio' | 'midi';
  genre: string;
  bpm: string;
  key: string;
  description: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
};

type Contribution = {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
};

export default function ContributePage() {
  const { user, loading } = useRequireAuth();
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState({ audioUploads: 0, midiUploads: 0 });
  const [isLoadingContributions, setIsLoadingContributions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing contributions
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch('/api/labs/contributions');
        if (response.ok) {
          const data = await response.json();
          setContributions(data.contributions || []);
          setStats(data.stats || { audioUploads: 0, midiUploads: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch contributions:', error);
      } finally {
        setIsLoadingContributions(false);
      }
    };

    if (user) {
      fetchContributions();
    }
  }, [user]);

  const detectFileType = (file: File): 'audio' | 'midi' | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (SUPPORTED_AUDIO_TYPES.includes(ext)) return 'audio';
    if (SUPPORTED_MIDI_TYPES.includes(ext)) return 'midi';
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesToAdd: FileWithMeta[] = [];

    for (const file of Array.from(newFiles)) {
      const type = detectFileType(file);
      if (!type) {
        alert(
          `Unsupported file type: ${file.name}. Supported types: ${[...SUPPORTED_AUDIO_TYPES, ...SUPPORTED_MIDI_TYPES].join(', ')}`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`File too large: ${file.name}. Maximum size is 100MB.`);
        continue;
      }

      filesToAdd.push({
        file,
        id: crypto.randomUUID(),
        type,
        genre: '',
        bpm: '',
        key: '',
        description: '',
        status: 'pending',
      });
    }

    setFiles((prev) => [...prev, ...filesToAdd]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const updateFile = (id: string, updates: Partial<FileWithMeta>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (fileWithMeta: FileWithMeta) => {
    updateFile(fileWithMeta.id, { status: 'uploading' });

    const formData = new FormData();
    formData.append('file', fileWithMeta.file);
    formData.append('type', fileWithMeta.type);
    if (fileWithMeta.genre) formData.append('genre', fileWithMeta.genre);
    if (fileWithMeta.bpm) formData.append('bpm', fileWithMeta.bpm);
    if (fileWithMeta.key) formData.append('key', fileWithMeta.key);
    if (fileWithMeta.description) formData.append('description', fileWithMeta.description);

    try {
      const response = await fetch('/api/labs/contributions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        updateFile(fileWithMeta.id, { status: 'success' });
        // Refresh contributions list
        const contribResponse = await fetch('/api/labs/contributions');
        if (contribResponse.ok) {
          const data = await contribResponse.json();
          setContributions(data.contributions || []);
          setStats(data.stats || { audioUploads: 0, midiUploads: 0 });
        }
      } else {
        const data = await response.json();
        updateFile(fileWithMeta.id, {
          status: 'error',
          errorMessage: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      updateFile(fileWithMeta.id, {
        status: 'error',
        errorMessage: 'Network error. Please try again.',
      });
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-400" />
          <p className="text-gray-400">Loading contribution portal...</p>
        </motion.div>
      </div>
    );
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const successCount = files.filter((f) => f.status === 'success').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="group mb-6 inline-block">
            <Image
              src="/logo-light.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-transform group-hover:scale-105"
              style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.3))' }}
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

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2">
            <Upload className="h-5 w-5 text-orange-400" />
            <span className="font-bold text-orange-400">CONTRIBUTE</span>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-white">Upload Your Music</h1>
          <p className="text-gray-400">
            Help train our AI model by contributing audio recordings and MIDI files
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-2"
        >
          <Card className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="flex items-center gap-3">
              <FileAudio className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.audioUploads}</p>
                <p className="text-sm text-gray-400">Audio Files Uploaded</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.midiUploads}</p>
                <p className="text-sm text-gray-400">MIDI Files Uploaded</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...SUPPORTED_AUDIO_TYPES, ...SUPPORTED_MIDI_TYPES].join(',')}
              onChange={(e) => e.target.files && addFiles(e.target.files)}
              className="hidden"
            />
            <Upload
              className={`mx-auto mb-4 h-12 w-12 ${isDragging ? 'text-orange-400' : 'text-gray-400'}`}
            />
            <p className="mb-2 text-lg font-medium text-white">
              {isDragging ? 'Drop files here...' : 'Drag & drop files here'}
            </p>
            <p className="mb-4 text-sm text-gray-400">or click to browse</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-400">
                Audio: {SUPPORTED_AUDIO_TYPES.join(', ')}
              </span>
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-400">
                MIDI: {SUPPORTED_MIDI_TYPES.join(', ')}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-400">
                Max 100MB per file
              </span>
            </div>
          </div>
        </motion.div>

        {/* Files Queue */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-white">
                    <File className="h-5 w-5 text-orange-400" />
                    Upload Queue ({files.length})
                  </h3>
                  {pendingCount > 0 && (
                    <Button
                      onClick={uploadAllFiles}
                      disabled={uploadingCount > 0}
                      className="rounded-lg bg-gradient-to-r from-orange-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:from-orange-600 hover:to-purple-600 disabled:opacity-50"
                    >
                      {uploadingCount > 0 ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload All ({pendingCount})
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {files.map((fileWithMeta) => (
                    <motion.div
                      key={fileWithMeta.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`rounded-xl border p-4 ${
                        fileWithMeta.status === 'success'
                          ? 'border-green-500/30 bg-green-500/10'
                          : fileWithMeta.status === 'error'
                            ? 'border-red-500/30 bg-red-500/10'
                            : fileWithMeta.status === 'uploading'
                              ? 'border-orange-500/30 bg-orange-500/10'
                              : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {fileWithMeta.type === 'audio' ? (
                            <FileAudio className="h-5 w-5 text-orange-400" />
                          ) : (
                            <Music className="h-5 w-5 text-purple-400" />
                          )}
                          <div>
                            <p className="font-medium text-white">{fileWithMeta.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(fileWithMeta.file.size)} •{' '}
                              {fileWithMeta.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {fileWithMeta.status === 'success' && (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          )}
                          {fileWithMeta.status === 'error' && (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          )}
                          {fileWithMeta.status === 'uploading' && (
                            <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
                          )}
                          {fileWithMeta.status === 'pending' && (
                            <button
                              onClick={() => removeFile(fileWithMeta.id)}
                              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {fileWithMeta.status === 'error' && fileWithMeta.errorMessage && (
                        <p className="mb-3 text-sm text-red-400">{fileWithMeta.errorMessage}</p>
                      )}

                      {fileWithMeta.status === 'pending' && (
                        <div className="grid gap-3 sm:grid-cols-4">
                          <select
                            value={fileWithMeta.genre}
                            onChange={(e) => updateFile(fileWithMeta.id, { genre: e.target.value })}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                          >
                            <option value="">Genre</option>
                            {GENRES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="BPM"
                            value={fileWithMeta.bpm}
                            onChange={(e) => updateFile(fileWithMeta.id, { bpm: e.target.value })}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500"
                          />
                          <select
                            value={fileWithMeta.key}
                            onChange={(e) => updateFile(fileWithMeta.id, { key: e.target.value })}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                          >
                            <option value="">Key</option>
                            {KEYS.map((k) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </select>
                          <Button
                            onClick={() => uploadFile(fileWithMeta)}
                            className="rounded-lg bg-orange-500/20 px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/30"
                          >
                            Upload
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contribution History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <h3 className="font-bold text-white">Your Contributions</h3>
            </div>

            {isLoadingContributions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : contributions.length > 0 ? (
              <div className="space-y-2">
                {contributions.map((contrib) => (
                  <div
                    key={contrib.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {contrib.type === 'audio' ? (
                        <FileAudio className="h-4 w-4 text-orange-400" />
                      ) : (
                        <Music className="h-4 w-4 text-purple-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{contrib.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(contrib.fileSize)} •{' '}
                          {new Date(contrib.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        contrib.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : contrib.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {contrib.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileAudio className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                <p className="text-gray-400">No contributions yet</p>
                <p className="text-sm text-gray-500">Upload your first file to get started!</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-start gap-3 rounded-xl bg-purple-500/10 p-4">
            <Shield className="h-5 w-5 shrink-0 text-purple-400" />
            <div className="text-sm text-gray-400">
              <p className="mb-1 font-medium text-white">Your contributions are secure</p>
              <p>
                Files are used only for training our AI model. You retain ownership of your
                recordings and can request removal at any time. We use Creative Commons licensing by
                default to protect both contributors and the project.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
