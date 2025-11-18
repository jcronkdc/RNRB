'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAudioUpload } from '@/hooks/use-audio-upload';
import { 
  Music, 
  Upload, 
  Download, 
  Play,
  Pause,
  Trash2,
  Grid3x3,
  List,
  Search,
  Filter,
  FileAudio,
  Disc,
  Mic2,
  Radio,
  Loader2,
  Sparkles,
  Share2,
  MoreVertical,
  FolderMusic
} from 'lucide-react';

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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { upload, uploading, progress, error: uploadError } = useAudioUpload();

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        // Load library files from user metadata
        const libraryFiles = user.user_metadata?.library_files || [];
        setFiles(libraryFiles);
        setLoading(false);
      }
    });
  }, [router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: LibraryFile['type']) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Upload to library folder in Supabase Storage
    const result = await upload(file, 'library', user.id, type);
    if (result) {
      const newFile: LibraryFile = {
        id: `lib_${Date.now()}`,
        name: file.name,
        url: result.url,
        path: result.path,
        size: file.size,
        type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.email || 'Unknown'
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);

      // Save to user metadata
      await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          library_files: updatedFiles
        }
      });
    }

    event.target.value = '';
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file from your library?')) return;

    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);

    await supabase!.auth.updateUser({
      data: {
        ...user.user_metadata,
        library_files: updatedFiles
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'stem': return <Disc className="w-5 h-5 text-orange-500" />;
      case 'demo': return <Music className="w-5 h-5 text-orange-500" />;
      case 'sample': return <Mic2 className="w-5 h-5 text-orange-500" />;
      case 'loop': return <Radio className="w-5 h-5 text-orange-500" />;
      default: return <FileAudio className="w-5 h-5 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header with Orange Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 border border-orange-500/20 p-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <FolderMusic className="w-6 h-6 text-orange-500" />
                </div>
                <h1 className="text-4xl font-bold text-white">My Library</h1>
              </div>
              <p className="text-xl text-gray-300">
                Your music assets, ready to collaborate
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'stem', 'demo', 'sample', 'loop', 'other'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { type: 'stem' as const, label: 'Upload Stem', icon: Disc },
              { type: 'demo' as const, label: 'Upload Demo', icon: Music },
              { type: 'sample' as const, label: 'Upload Sample', icon: Mic2 },
              { type: 'loop' as const, label: 'Upload Loop', icon: Radio },
              { type: 'other' as const, label: 'Upload File', icon: FileAudio }
            ].map((uploadType) => (
              <label
                key={uploadType.type}
                className="group cursor-pointer bg-gray-900 border-2 border-dashed border-gray-800 hover:border-orange-500 rounded-xl p-6 flex flex-col items-center gap-3 transition-all hover:bg-gray-800/50"
              >
                <uploadType.icon className="w-8 h-8 text-gray-500 group-hover:text-orange-500 transition-colors" />
                <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors text-center">
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
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                <span className="text-white">Uploading... {progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400">{uploadError}</p>
            </div>
          )}
        </motion.div>

        {/* Files Grid/List */}
        {filteredFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center"
          >
            <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderMusic className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {searchQuery || filterType !== 'all' ? 'No files found' : 'Your Library is Empty'}
            </h2>
            <p className="text-gray-400 mb-6">
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
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}
          >
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all ${
                  viewMode === 'list' ? 'flex items-center gap-4' : ''
                }`}
              >
                {/* Icon */}
                <div className={`${viewMode === 'grid' ? 'mb-4' : 'shrink-0'} w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center`}>
                  {getTypeIcon(file.type)}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1 truncate group-hover:text-orange-500 transition-colors">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="capitalize">{file.type}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => setPlayingId(playingId === file.id ? null : file.id)}
                    className="p-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-lg transition-all"
                  >
                    {playingId === file.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
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
