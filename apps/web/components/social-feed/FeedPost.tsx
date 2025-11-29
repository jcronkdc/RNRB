'use client';

import { format } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Music,
  Repeat2,
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { CommentSection } from './CommentSection';
import { PostContent } from './PostContent';
import { ReactionPicker } from './ReactionPicker';

import { WaveformPlayer } from '@/components/waveform-player';

interface FeedPostProps {
  post: any;
  onDeleted: (postId: string) => void;
  onUpdated: (post: any) => void;
}

export function FeedPost({ post, onDeleted, onUpdated }: FeedPostProps) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const isOwnPost = session?.user?.id === localPost.userId;
  const isRepost = localPost.originalPostId !== null;

  // Handle reaction with optimistic update
  const handleReaction = async (emoji: string) => {
    const wasReacted = localPost.currentUserReaction === emoji;
    const previousState = { ...localPost };

    // Optimistic update
    setLocalPost((prev: any) => ({
      ...prev,
      likeCount: wasReacted ? prev.likeCount - 1 : prev.likeCount + 1,
      currentUserReaction: wasReacted ? null : emoji,
    }));

    try {
      const response = await fetch('/api/feed/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: localPost.id,
          emoji,
        }),
      });

      if (!response.ok) {
        // Revert on error
        setLocalPost(previousState);
      }
    } catch (error) {
      console.error('Error reacting:', error);
      setLocalPost(previousState);
    }
  };

  // Track audio play
  const handleAudioPlay = async (duration?: number, completed?: boolean) => {
    try {
      await fetch('/api/feed/plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: localPost.id,
          duration,
          completed,
        }),
      });

      // Update play count optimistically
      if (!duration) {
        setLocalPost((prev: any) => ({
          ...prev,
          playCount: prev.playCount + 1,
        }));
      }
    } catch (error) {
      console.error('Error tracking play:', error);
    }
  };

  // Handle bookmark with optimistic update
  const handleBookmark = async () => {
    const wasBookmarked = localPost.currentUserBookmarked;
    const previousState = { ...localPost };

    // Optimistic update
    setLocalPost((prev: any) => ({
      ...prev,
      currentUserBookmarked: !prev.currentUserBookmarked,
    }));

    try {
      const method = wasBookmarked ? 'DELETE' : 'POST';
      const url = wasBookmarked
        ? `/api/feed/bookmarks?postId=${localPost.id}`
        : '/api/feed/bookmarks';

      const response = await fetch(url, {
        method,
        ...(method === 'POST' && {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: localPost.id }),
        }),
      });

      if (!response.ok) {
        setLocalPost(previousState);
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
      setLocalPost(previousState);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      const response = await fetch('/api/feed/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: localPost.id,
        }),
      });

      if (response.ok) {
        setLocalPost((prev: any) => ({
          ...prev,
          shareCount: prev.shareCount + 1,
          currentUserShared: true,
        }));
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 via-purple-900/10 to-black/60 p-6 backdrop-blur-xl transition-all hover:border-purple-500/30">
      {/* Repost Header */}
      {isRepost && (
        <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
          <Repeat2 className="h-4 w-4" />
          <span>
            {localPost.author.name} shared {localPost.originalPost?.author.name}'s post
          </span>
        </div>
      )}

      {/* Author Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            {localPost.author.image ? (
              <Image
                src={localPost.author.image}
                alt={localPost.author.name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {(localPost.author.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{localPost.author.name || 'Anonymous'}</h3>
            <p className="text-sm text-white/60">
              {format(new Date(localPost.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        {/* More Options */}
        {isOwnPost && (
          <button className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Post Content - with clickable hashtags, mentions, and URLs */}
      {localPost.content && (
        <div className="mb-4 text-white">
          <PostContent content={localPost.content} />
        </div>
      )}

      {/* Hashtag Tags Display */}
      {localPost.tags && localPost.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {localPost.tags.map((tag: string) => (
            <a
              key={tag}
              href={`/feed?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300 transition-all hover:bg-purple-500/30"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}

      {/* Audio Player (SoundCloud-style) */}
      {localPost.contentType === 'audio' && localPost.audioUrl && (
        <div className="mb-4 rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">Audio Track</p>
              {localPost.duration && (
                <p className="text-sm text-white/60">
                  {Math.floor(localPost.duration / 60)}:
                  {String(localPost.duration % 60).padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
          <WaveformPlayer
            audioUrl={localPost.audioUrl}
            audioName={localPost.content || 'Audio Post'}
          />
          {(localPost.genre || localPost.mood || localPost.bpm) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {localPost.genre && (
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                  {localPost.genre}
                </span>
              )}
              {localPost.mood && (
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-300">
                  {localPost.mood}
                </span>
              )}
              {localPost.bpm && (
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                  {localPost.bpm} BPM
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image Gallery */}
      {localPost.imageUrls && localPost.imageUrls.length > 0 && (
        <div
          className={`mb-4 grid gap-2 ${
            localPost.imageUrls.length === 1
              ? 'grid-cols-1'
              : localPost.imageUrls.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-2'
          }`}
        >
          {localPost.imageUrls.slice(0, 4).map((url: string, i: number) => (
            <div key={i} className="relative aspect-video overflow-hidden rounded-lg">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
              {i === 3 && localPost.imageUrls.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white">
                  +{localPost.imageUrls.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Link Preview */}
      {localPost.linkUrl && localPost.linkPreview && (
        <a
          href={localPost.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-purple-500/50"
        >
          {localPost.linkPreview.image && (
            <div className="relative aspect-video">
              <Image
                src={localPost.linkPreview.image}
                alt={localPost.linkPreview.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h4 className="font-semibold text-white">{localPost.linkPreview.title}</h4>
            {localPost.linkPreview.description && (
              <p className="mt-1 text-sm text-white/60">{localPost.linkPreview.description}</p>
            )}
            <p className="mt-2 text-xs text-purple-400">{new URL(localPost.linkUrl).hostname}</p>
          </div>
        </a>
      )}

      {/* Engagement Stats */}
      <div className="mb-4 flex items-center gap-4 text-sm text-white/60">
        {localPost.likeCount > 0 && <span>{localPost.likeCount} reactions</span>}
        {localPost.commentCount > 0 && <span>{localPost.commentCount} comments</span>}
        {localPost.shareCount > 0 && <span>{localPost.shareCount} shares</span>}
        {localPost.playCount > 0 && <span>{localPost.playCount} plays</span>}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          {/* React Button */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                localPost.currentUserReaction
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Heart className={`h-5 w-5 ${localPost.currentUserReaction ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{localPost.currentUserReaction || 'React'}</span>
            </button>

            {showReactions && (
              <ReactionPicker
                onSelect={handleReaction}
                onClose={() => setShowReactions(false)}
                currentReaction={localPost.currentUserReaction}
              />
            )}
          </div>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Comment</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={localPost.currentUserShared}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              localPost.currentUserShared
                ? 'bg-pink-500/20 text-pink-300'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Share2 className="h-5 w-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className={`rounded-lg p-2 transition-all ${
            localPost.currentUserBookmarked ? 'text-purple-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Bookmark
            className={`h-5 w-5 ${localPost.currentUserBookmarked ? 'fill-current' : ''}`}
          />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <CommentSection postId={localPost.id} />
        </div>
      )}
    </div>
  );
}
