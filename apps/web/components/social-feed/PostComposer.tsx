'use client';

import {
  Image as ImageIcon,
  Music,
  X,
  Loader2,
  Send,
  Link as LinkIcon,
  Hash,
  AtSign,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface PostComposerProps {
  onPostCreated: (post: any) => void;
}

interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  url: string;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'text' | 'audio' | 'image' | 'link'>('text');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  // Media state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Link preview state
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);

  // Audio metadata
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [bpm, setBpm] = useState('');

  // Extracted tags
  const [extractedTags, setExtractedTags] = useState<string[]>([]);
  const [extractedMentions, setExtractedMentions] = useState<string[]>([]);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkFetchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Extract hashtags and mentions from content
  useEffect(() => {
    const hashtagRegex = /#(\w+)/g;
    const mentionRegex = /@(\w+)/g;

    const hashtags: string[] = [];
    const mentions: string[] = [];

    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      if (!hashtags.includes(match[1])) hashtags.push(match[1]);
    }
    while ((match = mentionRegex.exec(content)) !== null) {
      if (!mentions.includes(match[1])) mentions.push(match[1]);
    }

    setExtractedTags(hashtags);
    setExtractedMentions(mentions);
  }, [content]);

  // Auto-detect and fetch link previews
  const fetchLinkPreview = useCallback(
    async (url: string) => {
      setFetchingPreview(true);
      try {
        const response = await fetch('/api/feed/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (response.ok) {
          const data = await response.json();
          setLinkUrl(url);
          setLinkPreview(data.preview);
          if (contentType === 'text') setContentType('link');
        }
      } catch (error) {
        console.error('Error fetching link preview:', error);
      } finally {
        setFetchingPreview(false);
      }
    },
    [contentType]
  );

  // Debounced URL detection in content
  useEffect(() => {
    if (linkFetchTimeout.current) {
      clearTimeout(linkFetchTimeout.current);
    }

    // Don't auto-fetch if we already have media
    if (audioUrl || imageFiles.length > 0 || linkPreview) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);

    if (matches && matches.length > 0) {
      linkFetchTimeout.current = setTimeout(() => {
        fetchLinkPreview(matches[0]);
      }, 1000);
    }

    return () => {
      if (linkFetchTimeout.current) clearTimeout(linkFetchTimeout.current);
    };
  }, [content, audioUrl, imageFiles.length, linkPreview, fetchLinkPreview]);

  // Handle audio upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate audio file
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid audio file (WAV, MP3, OGG)');
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setAudioFile(file);
      setAudioUrl(data.url);
      setContentType('audio');
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio');
    } finally {
      setUploading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 images
    const selectedFiles = files.slice(0, 4);

    // Create previews
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));

    setImageFiles(selectedFiles);
    setImagePreviews(previews);
    if (contentType === 'text') setContentType('image');
  };

  // Remove image
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Create post
  const handleSubmit = async () => {
    if (!content && !audioUrl && imageFiles.length === 0) {
      alert('Please add some content');
      return;
    }

    setPosting(true);
    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Image upload failed');
          const data = await response.json();
          return data.url;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      // Create post
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType: linkUrl && !audioUrl && imageUrls.length === 0 ? 'link' : contentType,
          audioUrl,
          audioPath: audioUrl ? `audio-posts/${Date.now()}` : undefined,
          imageUrls,
          linkUrl: linkUrl || undefined,
          linkPreview: linkPreview || undefined,
          genre: genre || undefined,
          mood: mood || undefined,
          bpm: bpm ? parseInt(bpm) : undefined,
          tags: extractedTags,
          visibility,
          allowComments: true,
          allowReactions: true,
          allowShares: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');

      const data = await response.json();
      onPostCreated(data.post);

      // Reset form
      setContent('');
      setAudioFile(null);
      setAudioUrl(null);
      setImageFiles([]);
      setImagePreviews([]);
      setLinkUrl(null);
      setLinkPreview(null);
      setExtractedTags([]);
      setExtractedMentions([]);
      setGenre('');
      setMood('');
      setBpm('');
      setContentType('text');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 via-purple-900/10 to-black/60 p-6">
      {/* User Avatar & Input */}
      <div className="mb-4 flex gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'You'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
              {(session.user.name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share your music, thoughts, or vibes..."
          className="flex-1 resize-none bg-transparent text-white placeholder:text-white/40 focus:outline-none"
          rows={3}
        />
      </div>

      {/* Audio File Preview */}
      {audioFile && audioUrl && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
            <Music className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">{audioFile.name}</p>
            <p className="text-sm text-white/60">
              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={() => {
              setAudioFile(null);
              setAudioUrl(null);
              setContentType('text');
            }}
            className="text-white/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          {imagePreviews.map((preview, i) => (
            <div key={i} className="group relative aspect-square">
              <Image
                src={preview}
                alt={`Preview ${i + 1}`}
                fill
                className="rounded-lg object-cover"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link Preview */}
      {(linkPreview || fetchingPreview) && (
        <div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-white/5">
          {fetchingPreview ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              <span className="ml-2 text-sm text-white/60">Fetching preview...</span>
            </div>
          ) : (
            linkPreview && (
              <div className="relative">
                {linkPreview.image && (
                  <div className="relative aspect-video">
                    <Image
                      src={linkPreview.image}
                      alt={linkPreview.title || 'Link preview'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{linkPreview.title}</p>
                      {linkPreview.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/60">
                          {linkPreview.description}
                        </p>
                      )}
                      <p className="mt-2 flex items-center gap-1 text-xs text-purple-400">
                        <LinkIcon className="h-3 w-3" />
                        {linkPreview.siteName}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setLinkUrl(null);
                        setLinkPreview(null);
                        setContentType('text');
                      }}
                      className="ml-2 text-white/40 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Detected Hashtags & Mentions */}
      {(extractedTags.length > 0 || extractedMentions.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {extractedTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300"
            >
              <Hash className="h-3 w-3" />
              {tag}
            </span>
          ))}
          {extractedMentions.map((mention) => (
            <span
              key={mention}
              className="flex items-center gap-1 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-300"
            >
              <AtSign className="h-3 w-3" />
              {mention}
            </span>
          ))}
        </div>
      )}

      {/* Audio Metadata (if audio post) */}
      {contentType === 'audio' && audioUrl && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none"
          />
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Mood"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none"
          />
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="BPM"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          {/* Upload Audio */}
          <button
            onClick={() => audioInputRef.current?.click()}
            disabled={uploading || posting || contentType === 'audio'}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <Music className="h-5 w-5" />
            <span className="hidden sm:inline">Audio</span>
          </button>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />

          {/* Upload Images */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading || posting || imagePreviews.length >= 4}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <ImageIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Photos</span>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Visibility Selector */}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white focus:border-purple-500/50 focus:outline-none"
          >
            <option value="public" className="bg-gray-900">
              🌍 Public
            </option>
            <option value="friends" className="bg-gray-900">
              Friends
            </option>
            <option value="private" className="bg-gray-900">
              🔒 Private
            </option>
          </select>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={posting || uploading || (!content && !audioUrl && imageFiles.length === 0)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50 disabled:shadow-none"
        >
          {posting || uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploading ? 'Uploading...' : 'Posting...'}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}
