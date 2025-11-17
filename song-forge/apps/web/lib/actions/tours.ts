'use server';

import { requireOrgSession } from '@cronkwaters/auth';
import { prisma, validateSlug } from '@cronkwaters/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema validations
const createTourSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  public: z.boolean().default(false),
  posterImage: z.string().optional(),
});

const createShowSchema = z.object({
  tourId: z.string().optional(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  date: z.string().datetime(),
  doorsTime: z.string().datetime().optional(),
  soundcheckTime: z.string().datetime().optional(),
  setLength: z.number().int().positive().optional(),
  venueId: z.string().optional(),
  ticketUrl: z.string().url().optional(),
  ticketPrice: z.record(z.number()).optional(),
  ageRestriction: z.string().optional(),
  posterImage: z.string().optional(),
  public: z.boolean().default(true),
});

const createVenueSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  type: z.enum(['club', 'theater', 'arena', 'stadium', 'festival', 'other']),
  capacity: z.number().int().positive().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  parkingInfo: z.string().optional(),
  accessibilityInfo: z.string().optional(),
});

// Tour Actions
export async function createTourAction(formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const validatedFields = createTourSchema.parse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    public: formData.get('public') === 'true',
    posterImage: formData.get('posterImage'),
  });

  if (!validateSlug(validatedFields.slug)) {
    throw new Error('Invalid slug format');
  }

  const tour = await prisma.tour.create({
    data: {
      ...validatedFields,
      orgId,
    },
  });

  revalidatePath('/tours');
  revalidatePath(`/tours/${tour.slug}`);
  
  return tour;
}

export async function updateTourAction(tourId: string, formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { orgId: true },
  });

  if (!tour || tour.orgId !== orgId) {
    throw new Error('Tour not found');
  }

  const validatedFields = createTourSchema.partial().parse({
    name: formData.get('name'),
    description: formData.get('description'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    public: formData.get('public') === 'true',
    posterImage: formData.get('posterImage'),
  });

  const updatedTour = await prisma.tour.update({
    where: { id: tourId },
    data: validatedFields,
  });

  revalidatePath('/tours');
  revalidatePath(`/tours/${updatedTour.slug}`);
  
  return updatedTour;
}

export async function deleteTourAction(tourId: string) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { orgId: true },
  });

  if (!tour || tour.orgId !== orgId) {
    throw new Error('Tour not found');
  }

  await prisma.tour.delete({
    where: { id: tourId },
  });

  revalidatePath('/tours');
}

// Show Actions
export async function createShowAction(formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const validatedFields = createShowSchema.parse({
    tourId: formData.get('tourId') || undefined,
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    date: formData.get('date'),
    doorsTime: formData.get('doorsTime') || undefined,
    soundcheckTime: formData.get('soundcheckTime') || undefined,
    setLength: formData.get('setLength') ? parseInt(formData.get('setLength') as string) : undefined,
    venueId: formData.get('venueId') || undefined,
    ticketUrl: formData.get('ticketUrl') || undefined,
    ageRestriction: formData.get('ageRestriction') || undefined,
    posterImage: formData.get('posterImage') || undefined,
    public: formData.get('public') !== 'false',
  });

  if (!validateSlug(validatedFields.slug)) {
    throw new Error('Invalid slug format');
  }

  // Verify tour ownership if tourId provided
  if (validatedFields.tourId) {
    const tour = await prisma.tour.findUnique({
      where: { id: validatedFields.tourId },
      select: { orgId: true },
    });

    if (!tour || tour.orgId !== orgId) {
      throw new Error('Tour not found');
    }
  }

  const show = await prisma.show.create({
    data: {
      ...validatedFields,
      orgId,
    },
  });

  revalidatePath('/shows');
  revalidatePath(`/shows/${show.slug}`);
  if (validatedFields.tourId) {
    revalidatePath(`/tours/${validatedFields.tourId}`);
  }
  
  return show;
}

export async function updateShowAction(showId: string, formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: { orgId: true, tourId: true },
  });

  if (!show || show.orgId !== orgId) {
    throw new Error('Show not found');
  }

  const validatedFields = createShowSchema.partial().parse({
    name: formData.get('name'),
    description: formData.get('description'),
    date: formData.get('date'),
    doorsTime: formData.get('doorsTime') || undefined,
    soundcheckTime: formData.get('soundcheckTime') || undefined,
    setLength: formData.get('setLength') ? parseInt(formData.get('setLength') as string) : undefined,
    venueId: formData.get('venueId') || undefined,
    ticketUrl: formData.get('ticketUrl') || undefined,
    ageRestriction: formData.get('ageRestriction') || undefined,
    posterImage: formData.get('posterImage') || undefined,
    public: formData.get('public') !== 'false',
  });

  const updatedShow = await prisma.show.update({
    where: { id: showId },
    data: validatedFields,
  });

  revalidatePath('/shows');
  revalidatePath(`/shows/${updatedShow.slug}`);
  if (show.tourId) {
    revalidatePath(`/tours/${show.tourId}`);
  }
  
  return updatedShow;
}

export async function deleteShowAction(showId: string) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: { orgId: true, tourId: true },
  });

  if (!show || show.orgId !== orgId) {
    throw new Error('Show not found');
  }

  await prisma.show.delete({
    where: { id: showId },
  });

  revalidatePath('/shows');
  if (show.tourId) {
    revalidatePath(`/tours/${show.tourId}`);
  }
}

// Venue Actions
export async function createVenueAction(formData: FormData) {
  const session = await requireOrgSession();
  const { role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const validatedFields = createVenueSchema.parse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    type: formData.get('type'),
    capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined,
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    country: formData.get('country'),
    postalCode: formData.get('postalCode'),
    latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
    longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
    phone: formData.get('phone'),
    email: formData.get('email'),
    website: formData.get('website'),
    parkingInfo: formData.get('parkingInfo'),
    accessibilityInfo: formData.get('accessibilityInfo'),
  });

  if (!validateSlug(validatedFields.slug)) {
    throw new Error('Invalid slug format');
  }

  const venue = await prisma.venue.create({
    data: validatedFields,
  });

  revalidatePath('/venues');
  
  return venue;
}

// List Actions
export async function listToursAction(includeCompleted = false) {
  const session = await requireOrgSession();
  const { orgId } = session.activeMembership!;

  const where = includeCompleted 
    ? { orgId } 
    : { orgId, status: { not: 'completed' as const } };

  const tours = await prisma.tour.findMany({
    where,
    orderBy: { startDate: 'asc' },
    include: {
      _count: {
        select: { shows: true },
      },
    },
  });

  return tours;
}

export async function listShowsAction(tourId?: string) {
  const session = await requireOrgSession();
  const { orgId } = session.activeMembership!;

  const where = tourId 
    ? { orgId, tourId } 
    : { orgId };

  const shows = await prisma.show.findMany({
    where,
    orderBy: { date: 'asc' },
    include: {
      venue: true,
      tour: {
        select: { name: true, slug: true },
      },
    },
  });

  return shows;
}

export async function listUpcomingShowsAction(limit = 10) {
  const session = await requireOrgSession();
  const { orgId } = session.activeMembership!;

  const shows = await prisma.show.findMany({
    where: {
      orgId,
      date: { gte: new Date() },
      status: { in: ['scheduled', 'soldout'] },
    },
    orderBy: { date: 'asc' },
    take: limit,
    include: {
      venue: true,
      tour: {
        select: { name: true, slug: true },
      },
    },
  });

  return shows;
}

export async function searchVenuesAction(query: string) {
  const venues = await prisma.venue.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 10,
    orderBy: { name: 'asc' },
  });

  return venues;
}

// Fan Engagement Actions
export async function registerFanEngagementAction(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string | undefined;
  const tourId = formData.get('tourId') as string | undefined;
  const showId = formData.get('showId') as string | undefined;
  const notifyShows = formData.get('notifyShows') === 'true';
  const notifyMerch = formData.get('notifyMerch') === 'true';
  const location = formData.get('location') as string | undefined;

  if (!email || (!tourId && !showId)) {
    throw new Error('Invalid engagement data');
  }

  // Check if engagement already exists
  const existing = await prisma.fanEngagement.findFirst({
    where: {
      email,
      OR: [
        { tourId: tourId || undefined },
        { showId: showId || undefined },
      ],
    },
  });

  if (existing) {
    // Update preferences
    return await prisma.fanEngagement.update({
      where: { id: existing.id },
      data: { notifyShows, notifyMerch, name, location },
    });
  }

  // Create new engagement
  return await prisma.fanEngagement.create({
    data: {
      email,
      name,
      tourId,
      showId,
      notifyShows,
      notifyMerch,
      location,
    },
  });
}

