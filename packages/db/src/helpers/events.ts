import { Prisma } from '@prisma/client';
import type { Event, EventType } from '@prisma/client';

import { prisma } from '../index';

export interface CreateEventInput {
  projectId?: string;
  orgId?: string;
  name: string;
  slug: string;
  description?: string;
  eventType: EventType;
  startDate: Date;
  endDate?: Date;
  venue?: string;
  venueAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  lineup?: string[];
  ticketUrl?: string;
  coverImage?: string;
  public?: boolean;
}

export interface UpdateEventInput {
  name?: string;
  slug?: string;
  description?: string;
  eventType?: EventType;
  startDate?: Date;
  endDate?: Date;
  venue?: string;
  venueAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  lineup?: string[];
  ticketUrl?: string;
  coverImage?: string;
  public?: boolean;
}

/**
 * Create a new event
 */
export async function createEvent(input: CreateEventInput): Promise<Event> {
  // Validate slug uniqueness
  const existing = await prisma.event.findUnique({
    where: { slug: input.slug },
  });

  if (existing) {
    throw new Error(`Event with slug "${input.slug}" already exists`);
  }

  // Validate at least one of projectId or orgId
  if (!input.projectId && !input.orgId) {
    throw new Error('Event must be associated with either a project or organization');
  }

  // Validate project exists if provided
  if (input.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
    });

    if (!project) {
      throw new Error(`Project with id "${input.projectId}" not found`);
    }
  }

  // Validate org exists if provided
  if (input.orgId) {
    const org = await prisma.org.findUnique({
      where: { id: input.orgId },
    });

    if (!org) {
      throw new Error(`Organization with id "${input.orgId}" not found`);
    }
  }

  return prisma.event.create({
    data: {
      ...input,
      lineup: input.lineup ? (input.lineup as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      public: input.public ?? false,
    },
  });
}

/**
 * Update event
 */
export async function updateEvent(eventId: string, input: UpdateEventInput): Promise<Event> {
  const existing = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existing) {
    throw new Error(`Event with id "${eventId}" not found`);
  }

  // If slug is being changed, check uniqueness
  if (input.slug && input.slug !== existing.slug) {
    const slugConflict = await prisma.event.findUnique({
      where: { slug: input.slug },
    });

    if (slugConflict) {
      throw new Error(`Event with slug "${input.slug}" already exists`);
    }
  }

  return prisma.event.update({
    where: { id: eventId },
    data: {
      ...input,
      lineup:
        input.lineup !== undefined
          ? input.lineup
            ? (input.lineup as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull
          : undefined,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get event by slug
 */
export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      org: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * List events with filtering
 */
export async function listEvents(options?: {
  orgId?: string;
  projectId?: string;
  eventType?: EventType;
  public?: boolean;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options?.orgId) where.orgId = options.orgId;
  if (options?.projectId) where.projectId = options.projectId;
  if (options?.eventType) where.eventType = options.eventType;
  if (options?.public !== undefined) where.public = options.public;
  if (options?.upcoming) {
    where.startDate = { gte: new Date() };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    total,
    hasMore: (options?.offset ?? 0) + events.length < total,
  };
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  await prisma.event.delete({
    where: { id: eventId },
  });
}
