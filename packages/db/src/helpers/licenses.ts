import type { License, LicenseTemplate, LicenseStatus } from '@prisma/client';

import { prisma } from '../index';

export interface CreateLicenseInput {
  projectId: string;
  template: LicenseTemplate;
  title: string;
  terms?: string;
  notes?: string;
}

export interface UpdateLicenseInput {
  title?: string;
  terms?: string;
  notes?: string;
}

export interface SignLicenseInput {
  signerName: string;
  signerEmail: string;
}

export interface CountersignLicenseInput {
  countersignerName: string;
  countersignerEmail: string;
}

/**
 * License template definitions
 */
export const LICENSE_TEMPLATES: Record<LicenseTemplate, { name: string; defaultTerms: string }> = {
  COLLAB_NDA: {
    name: 'Collaboration NDA',
    defaultTerms:
      'This agreement establishes confidentiality for collaborative work. All parties agree not to disclose project details without written consent.',
  },
  WORK_FOR_HIRE: {
    name: 'Work-for-Hire Agreement',
    defaultTerms:
      'This work is created as a work-for-hire. The hiring party owns all rights, title, and interest in the work.',
  },
  NON_EXCLUSIVE_COLLAB: {
    name: 'Non-Exclusive Collaboration',
    defaultTerms:
      'This is a non-exclusive collaboration. All parties retain rights to use the work independently.',
  },
  PODCAST_MUSIC_LICENSE: {
    name: 'Podcast Music License',
    defaultTerms:
      'This license grants permission to use the musical work in podcast episodes with proper attribution.',
  },
  EXCLUSIVE_LICENSE: {
    name: 'Exclusive License',
    defaultTerms:
      'This is an exclusive license. The licensor grants exclusive rights to the licensee for the specified term.',
  },
  MASTER_USE: {
    name: 'Master Use License',
    defaultTerms:
      'This license grants permission to use the master recording in the specified project.',
  },
  SYNCHRONIZATION: {
    name: 'Synchronization License',
    defaultTerms:
      'This license grants permission to synchronize the musical work with visual media.',
  },
};

/**
 * Create a new license
 */
export async function createLicense(input: CreateLicenseInput): Promise<License> {
  // Validate project exists
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!project) {
    throw new Error(`Project with id "${input.projectId}" not found`);
  }

  const template = LICENSE_TEMPLATES[input.template];
  const terms = input.terms ?? template.defaultTerms;

  return prisma.license.create({
    data: {
      projectId: input.projectId,
      template: input.template,
      title: input.title,
      terms,
      notes: input.notes,
      status: 'draft',
    },
  });
}

/**
 * Update license (only if draft) with org ownership validation
 */
export async function updateLicense(
  licenseId: string,
  input: UpdateLicenseInput,
  orgId?: string
): Promise<License> {
  const existing = await prisma.license.findUnique({
    where: { id: licenseId },
    include: {
      project: {
        select: {
          orgId: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error(`License with id "${licenseId}" not found`);
  }

  // SECURITY: Verify organization ownership if orgId provided
  if (orgId && existing.project.orgId !== orgId) {
    throw new Error('Unauthorized: License does not belong to this organization');
  }

  if (existing.status !== 'draft') {
    throw new Error('Can only update licenses in draft status');
  }

  return prisma.license.update({
    where: { id: licenseId },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  });
}

/**
 * Initiate signature process
 */
export async function initiateSignature(
  licenseId: string,
  input: SignLicenseInput
): Promise<License> {
  const license = await prisma.license.findUnique({
    where: { id: licenseId },
  });

  if (!license) {
    throw new Error(`License with id "${licenseId}" not found`);
  }

  if (license.status !== 'draft') {
    throw new Error('License must be in draft status to initiate signature');
  }

  return prisma.license.update({
    where: { id: licenseId },
    data: {
      signerName: input.signerName,
      signerEmail: input.signerEmail,
      status: 'pending_signature',
      updatedAt: new Date(),
    },
  });
}

/**
 * Sign license
 */
export async function signLicense(licenseId: string): Promise<License> {
  const license = await prisma.license.findUnique({
    where: { id: licenseId },
  });

  if (!license) {
    throw new Error(`License with id "${licenseId}" not found`);
  }

  if (license.status !== 'pending_signature') {
    throw new Error('License is not pending signature');
  }

  return prisma.license.update({
    where: { id: licenseId },
    data: {
      status: 'pending_countersignature',
      signedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Countersign license
 */
export async function countersignLicense(
  licenseId: string,
  input: CountersignLicenseInput,
  pdfKey: string
): Promise<License> {
  const license = await prisma.license.findUnique({
    where: { id: licenseId },
  });

  if (!license) {
    throw new Error(`License with id "${licenseId}" not found`);
  }

  if (license.status !== 'pending_countersignature') {
    throw new Error('License is not pending countersignature');
  }

  return prisma.license.update({
    where: { id: licenseId },
    data: {
      countersignerName: input.countersignerName,
      countersignerEmail: input.countersignerEmail,
      status: 'executed',
      countersignedAt: new Date(),
      pdfKey,
      updatedAt: new Date(),
    },
  });
}

/**
 * Cancel license
 */
export async function cancelLicense(licenseId: string): Promise<License> {
  const license = await prisma.license.findUnique({
    where: { id: licenseId },
  });

  if (!license) {
    throw new Error(`License with id "${licenseId}" not found`);
  }

  if (license.status === 'executed' || license.status === 'cancelled') {
    throw new Error('Cannot cancel license in current status');
  }

  return prisma.license.update({
    where: { id: licenseId },
    data: {
      status: 'cancelled',
      updatedAt: new Date(),
    },
  });
}

/**
 * Get license by ID
 */
export async function getLicenseById(licenseId: string) {
  return prisma.license.findUnique({
    where: { id: licenseId },
    include: {
      project: {
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
 * List licenses for a project
 */
export async function listLicenses(projectId: string, options?: { status?: LicenseStatus }) {
  return prisma.license.findMany({
    where: {
      projectId,
      ...(options?.status ? { status: options.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}
