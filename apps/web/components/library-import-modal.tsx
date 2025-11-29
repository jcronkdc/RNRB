import { motion } from 'framer-motion';
import { Check, Search, Music, X, Loader2, FileAudio } from 'lucide-react';
import { useState } from 'react';

import { useLibrary, type LibraryFile } from '@/hooks/use-library';

interface LibraryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: LibraryFile) => void;
  acceptTypes?: ('stem' | 'demo' | 'sample' | 'loop' | 'other')[];
}

/**
 * Library Import Modal
 * Allows users to import files from their library into other features
 */
export function LibraryImportModal({
  isOpen,
  onClose,
  onImport,
  acceptTypes,
}: LibraryImportModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { files, isLoading, error } = useLibrary({
    search: searchQuery,
    type: acceptTypes && acceptTypes.length === 1 ? acceptTypes[0] : 'all',
  });

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
      onClose();
    }
  };

  const formatFileSize = (bytesStr: string): string => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    return <FileAudio className="h-5 w-5 text-orange-500" />;
  };

  // Filter files by accepted types
  const filteredFiles = acceptTypes
    ? files.filter((file) => acceptTypes.includes(file.type))
    : files;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Import from Library</h2>
            <p className="mt-1 text-sm text-zinc-400">Select a file from your library to import</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-zinc-800 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-white transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* File List */}
        <div className="max-h-96 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Music className="mb-4 h-12 w-12 text-zinc-700" />
              <p className="text-zinc-400">
                {searchQuery ? 'No files found' : 'Your library is empty'}
              </p>
              <a href="/library" className="mt-4 text-sm text-orange-500 hover:text-orange-400">
                Upload files to your library →
              </a>
            </div>
          )}

          {!isLoading && !error && filteredFiles.length > 0 && (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    selectedFile?.id === file.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    {getTypeIcon(file.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">{file.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="capitalize">{file.type}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                      {file.duration && (
                        <>
                          <span>•</span>
                          <span>
                            {Math.floor(file.duration / 60)}:
                            {(file.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedFile?.id === file.id && (
                    <Check className="h-5 w-5 shrink-0 text-orange-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 p-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile}
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import Selected File
          </button>
        </div>
      </motion.div>
    </div>
  );
}
