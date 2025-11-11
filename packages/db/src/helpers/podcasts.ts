import { Prisma } from '@prisma/client';
import type { PodcastEpisode } from '@prisma/client';

import { prisma } from '../index';

export interface Guest {
  name: string;
  role?: string;
  bio?: string;
}

export interface CreatePodcastEpisodeInput {
  orgId: string;
  title: string;
  slug: string;
  description?: string;
  showNotes?: string;
  audioKey?: string;
  duration?: number;
  guests?: Guest[];
  tags?: string[];
  public?: boolean;
  publishedAt?: Date;
}

export interface UpdatePodcastEpisodeInput {
  title?: string;
  slug?: string;
  description?: string;
  showNotes?: string;
  audioKey?: string;
  duration?: number;
  guests?: Guest[];
  tags?: string[];
  public?: boolean;
  publishedAt?: Date;
}

/**
 * Create a new podcast episode
 */
export async function createPodcastEpisode(
  input: CreatePodcastEpisodeInput
): Promise<PodcastEpisode> {
  // Validate org exists
  const org = await prisma.org.findUnique({
    where: { id: input.orgId }
  });

  if (!org) {
    throw new Error(`Organization with id "${input.orgId}" not found`);
  }

  // Validate slug uniqueness
  const existing = await prisma.podcastEpisode.findUnique({
    where: { slug: input.slug }
  });

  if (existing) {
    throw new Error(`Podcast episode with slug "${input.slug}" already exists`);
  }

  return prisma.podcastEpisode.create({
    data: {
      ...input,
      guests: input.guests ? (input.guests as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      tags: input.tags ?? [],
      public: input.public ?? false
    }
  });
}

/**
 * Update podcast episode
 */
export async function updatePodcastEpisode(
  episodeId: string,
  input: UpdatePodcastEpisodeInput
): Promise<PodcastEpisode> {
  const existing = await prisma.podcastEpisode.findUnique({
    where: { id: episodeId }
  });

  if (!existing) {
    throw new Error(`Podcast episode with id "${episodeId}" not found`);
  }

  // If slug is being changed, check uniqueness
  if (input.slug && input.slug !== existing.slug) {
    const slugConflict = await prisma.podcastEpisode.findUnique({
      where: { slug: input.slug }
    });

    if (slugConflict) {
      throw new Error(`Podcast episode with slug "${input.slug}" already exists`);
    }
  }

  return prisma.podcastEpisode.update({
    where: { id: episodeId },
    data: {
      ...input,
      guests: input.guests !== undefined
        ? (input.guests ? (input.guests as unknown as Prisma.InputJsonValue) : Prisma.JsonNull)
        : undefined,
      updatedAt: new Date()
    }
  });
}

/**
 * Publish episode
 */
export async function publishEpisode(episodeId: string): Promise<PodcastEpisode> {
  const episode = await prisma.podcastEpisode.findUnique({
    where: { id: episodeId }
  });

  if (!episode) {
    throw new Error(`Podcast episode with id "${episodeId}" not found`);
  }

  if (!episode.audioKey) {
    throw new Error('Cannot publish episode without audio file');
  }

  return prisma.podcastEpisode.update({
    where: { id: episodeId },
    data: {
      public: true,
      publishedAt: episode.publishedAt ?? new Date(),
      updatedAt: new Date()
    }
  });
}

/**
 * Unpublish episode
 */
export async function unpublishEpisode(episodeId: string): Promise<PodcastEpisode> {
  return prisma.podcastEpisode.update({
    where: { id: episodeId },
    data: {
      public: false,
      updatedAt: new Date()
    }
  });
}

/**
 * Get episode by slug
 */
export async function getEpisodeBySlug(slug: string) {
  return prisma.podcastEpisode.findUnique({
    where: { slug },
    include: {
      org: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
}

/**
 * List episodes with filtering
 */
export async function listEpisodes(options?: {
  orgId?: string;
  public?: boolean;
  published?: boolean;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options?.orgId) where.orgId = options.orgId;
  if (options?.public !== undefined) where.public = options.public;
  if (options?.published) {
    where.publishedAt = { not: null };
  }

  const [episodes, total] = await Promise.all([
    prisma.podcastEpisode.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      include: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    }),
    prisma.podcastEpisode.count({ where })
  ]);

  return {
    episodes,
    total,
    hasMore: (options?.offset ?? 0) + episodes.length < total
  };
}

/**
 * Delete episode
 */
export async function deleteEpisode(episodeId: string): Promise<void> {
  await prisma.podcastEpisode.delete({
    where: { id: episodeId }
  });
}

