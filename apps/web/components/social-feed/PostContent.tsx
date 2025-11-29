'use client';

import Link from 'next/link';
import { Fragment } from 'react';

interface PostContentProps {
  content: string;
  className?: string;
}

interface ParsedPart {
  type: 'text' | 'hashtag' | 'mention' | 'url';
  value: string;
  href?: string;
}

/**
 * Parses post content and extracts hashtags, mentions, and URLs
 */
function parseContent(content: string): ParsedPart[] {
  if (!content) return [];

  // Combined regex to match hashtags, mentions, and URLs
  const pattern = /(#\w+)|(@\w+)|(https?:\/\/[^\s]+)/g;
  const parts: ParsedPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }

    const fullMatch = match[0];

    if (match[1]) {
      // Hashtag
      const tag = fullMatch.slice(1); // Remove #
      parts.push({
        type: 'hashtag',
        value: fullMatch,
        href: `/feed?tag=${encodeURIComponent(tag)}`,
      });
    } else if (match[2]) {
      // Mention
      const username = fullMatch.slice(1); // Remove @
      parts.push({
        type: 'mention',
        value: fullMatch,
        href: `/profile/search?q=${encodeURIComponent(username)}`,
      });
    } else if (match[3]) {
      // URL
      parts.push({
        type: 'url',
        value: fullMatch,
        href: fullMatch,
      });
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Renders post content with clickable hashtags, mentions, and URLs
 */
export function PostContent({ content, className = '' }: PostContentProps) {
  const parts = parseContent(content);

  if (parts.length === 0) {
    return <p className={className}>{content}</p>;
  }

  return (
    <p className={`whitespace-pre-wrap text-base leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <Fragment key={index}>{part.value}</Fragment>;
        }

        if (part.type === 'hashtag') {
          return (
            <Link
              key={index}
              href={part.href!}
              className="font-medium text-purple-400 transition-colors hover:text-purple-300 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </Link>
          );
        }

        if (part.type === 'mention') {
          return (
            <Link
              key={index}
              href={part.href!}
              className="font-medium text-pink-400 transition-colors hover:text-pink-300 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </Link>
          );
        }

        if (part.type === 'url') {
          return (
            <a
              key={index}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 transition-colors hover:text-blue-300 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value.length > 40 ? `${part.value.slice(0, 40)}...` : part.value}
            </a>
          );
        }

        return null;
      })}
    </p>
  );
}

/**
 * Extracts all hashtags from content
 */
export function extractHashtags(content: string): string[] {
  const hashtags: string[] = [];
  const regex = /#(\w+)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    if (!hashtags.includes(tag)) {
      hashtags.push(tag);
    }
  }

  return hashtags;
}

/**
 * Extracts all mentions from content
 */
export function extractMentions(content: string): string[] {
  const mentions: string[] = [];
  const regex = /@(\w+)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const mention = match[1].toLowerCase();
    if (!mentions.includes(mention)) {
      mentions.push(mention);
    }
  }

  return mentions;
}
