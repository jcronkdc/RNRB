'use server';

import { requireOrgSession } from '@cronkwaters/auth';
import { prisma, generateSlug } from '@cronkwaters/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema validations
const updateOrgProfileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  genre: z.string().transform(str => str ? JSON.parse(str) : []).optional(),
  influences: z.string().transform(str => str ? JSON.parse(str) : []).optional(),
  founded: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  bookingEmail: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  socialLinks: z.string().transform(str => str ? JSON.parse(str) : {}).optional(),
  spotifyArtistId: z.string().optional(),
  appleMusicId: z.string().optional(),
});

const createBandMemberSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  bio: z.string().optional(),
  instruments: z.array(z.string()).optional(),
  joinedAt: z.string().datetime().optional(),
});

const createAwardSchema = z.object({
  name: z.string().min(1).max(255),
  organization: z.string().min(1).max(255),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  category: z.string().optional(),
  description: z.string().optional(),
});

const createPressReleaseSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  public: z.boolean().default(false),
});

// Update Org Profile
export async function updateOrgProfileAction(formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const validatedFields = updateOrgProfileSchema.parse({
    bio: formData.get('bio'),
    location: formData.get('location'),
    genre: formData.get('genre'),
    influences: formData.get('influences'),
    founded: formData.get('founded'),
    contactEmail: formData.get('contactEmail'),
    bookingEmail: formData.get('bookingEmail'),
    website: formData.get('website'),
    socialLinks: formData.get('socialLinks'),
    spotifyArtistId: formData.get('spotifyArtistId'),
    appleMusicId: formData.get('appleMusicId'),
  });

  // Clean up empty strings
  const cleanedData = Object.fromEntries(
    Object.entries(validatedFields).filter(([_, value]) => value !== '' && value !== undefined)
  );

  const updatedOrg = await prisma.org.update({
    where: { id: orgId },
    data: cleanedData,
  });

  revalidatePath('/settings/artist-profile');
  revalidatePath(`/artist/${updatedOrg.slug}`);
  
  return updatedOrg;
}

// Band Member Actions
export async function createBandMemberAction(formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const validatedFields = createBandMemberSchema.parse({
    name: formData.get('name'),
    role: formData.get('role'),
    bio: formData.get('bio'),
    instruments: formData.get('instruments') ? JSON.parse(formData.get('instruments') as string) : [],
    joinedAt: formData.get('joinedAt'),
  });

  // Get the highest order value
  const highestOrder = await prisma.bandMember.findFirst({
    where: { orgId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const bandMember = await prisma.bandMember.create({
    data: {
      ...validatedFields,
      orgId,
      order: (highestOrder?.order || 0) + 1,
    },
  });

  revalidatePath('/settings/artist-profile');
  
  return bandMember;
}

export async function updateBandMemberAction(memberId: string, formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  // Verify member belongs to org
  const member = await prisma.bandMember.findUnique({
    where: { id: memberId },
    select: { orgId: true },
  });

  if (!member || member.orgId !== orgId) {
    throw new Error('Band member not found');
  }

  const validatedFields = createBandMemberSchema.partial().parse({
    name: formData.get('name'),
    role: formData.get('role'),
    bio: formData.get('bio'),
    instruments: formData.get('instruments') ? JSON.parse(formData.get('instruments') as string) : undefined,
    joinedAt: formData.get('joinedAt'),
  });

  const updatedMember = await prisma.bandMember.update({
    where: { id: memberId },
    data: validatedFields,
  });

  revalidatePath('/settings/artist-profile');
  
  return updatedMember;
}

export async function deleteBandMemberAction(memberId: string) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const member = await prisma.bandMember.findUnique({
    where: { id: memberId },
    select: { orgId: true },
  });

  if (!member || member.orgId !== orgId) {
    throw new Error('Band member not found');
  }

  await prisma.bandMember.delete({
    where: { id: memberId },
  });

  revalidatePath('/settings/artist-profile');
}

// Award Actions
export async function createAwardAction(formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const validatedFields = createAwardSchema.parse({
    name: formData.get('name'),
    organization: formData.get('organization'),
    year: parseInt(formData.get('year') as string),
    category: formData.get('category'),
    description: formData.get('description'),
  });

  const award = await prisma.award.create({
    data: {
      ...validatedFields,
      orgId,
    },
  });

  revalidatePath('/settings/artist-profile');
  
  return award;
}

export async function deleteAwardAction(awardId: string) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const award = await prisma.award.findUnique({
    where: { id: awardId },
    select: { orgId: true },
  });

  if (!award || award.orgId !== orgId) {
    throw new Error('Award not found');
  }

  await prisma.award.delete({
    where: { id: awardId },
  });

  revalidatePath('/settings/artist-profile');
}

// Press Release Actions
export async function createPressReleaseAction(formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const validatedFields = createPressReleaseSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    excerpt: formData.get('excerpt'),
    publishedAt: formData.get('publishedAt'),
    public: formData.get('public') === 'true',
  });

  const slug = generateSlug(validatedFields.title);

  const pressRelease = await prisma.pressRelease.create({
    data: {
      ...validatedFields,
      slug,
      orgId,
    },
  });

  revalidatePath('/settings/artist-profile');
  revalidatePath(`/artist/${orgId}/press`);
  
  return pressRelease;
}

export async function updatePressReleaseAction(releaseId: string, formData: FormData) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const release = await prisma.pressRelease.findUnique({
    where: { id: releaseId },
    select: { orgId: true },
  });

  if (!release || release.orgId !== orgId) {
    throw new Error('Press release not found');
  }

  const validatedFields = createPressReleaseSchema.partial().parse({
    title: formData.get('title'),
    content: formData.get('content'),
    excerpt: formData.get('excerpt'),
    publishedAt: formData.get('publishedAt'),
    public: formData.get('public') === 'true',
  });

  const updatedRelease = await prisma.pressRelease.update({
    where: { id: releaseId },
    data: validatedFields,
  });

  revalidatePath('/settings/artist-profile');
  revalidatePath(`/artist/${orgId}/press`);
  
  return updatedRelease;
}

export async function deletePressReleaseAction(releaseId: string) {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;

  if (role !== 'owner' && role !== 'admin') {
    throw new Error('Insufficient permissions');
  }

  const release = await prisma.pressRelease.findUnique({
    where: { id: releaseId },
    select: { orgId: true },
  });

  if (!release || release.orgId !== orgId) {
    throw new Error('Press release not found');
  }

  await prisma.pressRelease.delete({
    where: { id: releaseId },
  });

  revalidatePath('/settings/artist-profile');
  revalidatePath(`/artist/${orgId}/press`);
}

