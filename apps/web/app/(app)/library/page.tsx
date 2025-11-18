'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAudioUpload } from '@/hooks/use-audio-upload';
import { Card, Button } from '@cronkwaters/ui';
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
  Share2
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
      case 'stem': return <Disc className="w-5 h-5" />;
      case 'demo': return <Music className="w-5 h-5" />;
      case 'sample': return <Mic2 className="w-5 h-5" />;
      case 'loop': return <Radio className="w-5 h-5" />;
      default: return <FileAudio className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
              <Music className="w-8 h-8 text-brand-primary" />
              My Library
            </h1>
            <p className="text-muted-foreground">
              Your personal collection of stems, demos, samples, and loops
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-surface hover:bg-surface-muted'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-surface hover:bg-surface-muted'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
          >
            <option value="all">All Types</option>
            <option value="stem">Stems</option>
            <option value="demo">Demos</option>
            <option value="sample">Samples</option>
            <option value="loop">Loops</option>
            <option value="other">Other</option>
          </select>
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6 rnrb-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-primary" />
            Upload to Library
          </h3>
          
          {uploading ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-brand-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Uploading to Supabase Storage...</p>
              {progress && (
                <div className="max-w-md mx-auto mt-4">
                  <div className="w-full bg-surface-muted rounded-full h-2">
                    <div 
                      className="bg-brand-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(progress.percentage)}%
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { type: 'stem' as const, label: 'Stem', icon: Disc },
                { type: 'demo' as const, label: 'Demo', icon: Music },
                { type: 'sample' as const, label: 'Sample', icon: Mic2 },
                { type: 'loop' as const, label: 'Loop', icon: Radio },
                { type: 'other' as const, label: 'Other', icon: FileAudio }
              ].map(({ type, label, icon: Icon }) => (
                <div key={type}>
                  <input
                    type="file"
                    accept="audio/*"
                    id={`upload-${type}`}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, type)}
                    disabled={uploading}
                  />
                  <label htmlFor={`upload-${type}`}>
                    <div className="rnrb-card p-4 text-center cursor-pointer hover:border-brand-primary/50 transition">
                      <Icon className="w-8 h-8 text-brand-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">{label}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {uploadError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{uploadError}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Files stored in Supabase Storage • Max 500MB per file
          </p>
        </Card>
      </motion.div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-12 text-center rnrb-card">
            <Music className="w-16 h-16 text-brand-primary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {files.length === 0 ? 'Your library is empty' : 'No files match your search'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {files.length === 0 
                ? 'Upload stems, demos, samples, or loops to build your audio library'
                : 'Try adjusting your search or filter'
              }
            </p>
          </Card>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 rnrb-card hover:border-brand-primary/50 transition">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{file.type} • {formatFileSize(file.size)}</p>
                  </div>
                </div>
                <audio
                  src={file.url}
                  controls
                  className="w-full h-10 mb-3"
                  style={{ colorScheme: 'dark' }}
                />
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    download
                    className="flex-1 px-3 py-2 bg-surface hover:bg-surface-muted border border-border rounded-lg text-sm font-medium text-center transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="p-4 rnrb-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {file.type.charAt(0).toUpperCase() + file.type.slice(1)} • {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <audio
                  src={file.url}
                  controls
                  className="h-10 max-w-xs"
                  style={{ colorScheme: 'dark' }}
                />
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    download
                    className="p-2 hover:bg-surface-muted rounded-lg transition"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
