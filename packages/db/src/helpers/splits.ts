import type { SplitSheet, SplitContributor } from '@prisma/client';

import { prisma } from '../index';

export interface CreateSplitContributorInput {
  name: string;
  role?: string;
  percentage: number;
  pro?: string;
  ipi?: string;
  publisher?: string;
  email?: string;
}

export interface CreateSplitSheetInput {
  projectId: string;
  title: string;
  notes?: string;
  contributors: CreateSplitContributorInput[];
}

export interface UpdateSplitSheetInput {
  title?: string;
  notes?: string;
}

export interface UpdateContributorInput {
  name?: string;
  role?: string;
  percentage?: number;
  pro?: string;
  ipi?: string;
  publisher?: string;
  email?: string;
}

/**
 * Validate that contributors total 100%
 */
function validateContributors(contributors: CreateSplitContributorInput[]): void {
  if (contributors.length === 0) {
    throw new Error('At least one contributor is required');
  }

  // Validate all percentages are positive and within range
  for (const contributor of contributors) {
    if (contributor.percentage <= 0) {
      throw new Error(`Percentage must be greater than 0. Got: ${contributor.percentage}%`);
    }
    if (contributor.percentage > 100) {
      throw new Error(`Percentage cannot exceed 100%. Got: ${contributor.percentage}%`);
    }
  }

  // Use tighter tolerance for financial calculations
  const total = contributors.reduce((sum, c) => sum + c.percentage, 0);
  if (Math.abs(total - 100) > 0.001) {
    throw new Error(`Contributors must total exactly 100%. Current total: ${total.toFixed(2)}%`);
  }

  // Check for duplicate names
  const names = contributors.map((c) => c.name.toLowerCase().trim());
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    throw new Error('Contributor names must be unique');
  }
}

/**
 * Create a new split sheet with contributors
 */
export async function createSplitSheet(input: CreateSplitSheetInput): Promise<SplitSheet> {
  // Validate project exists
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!project) {
    throw new Error(`Project with id "${input.projectId}" not found`);
  }

  // Validate contributors
  validateContributors(input.contributors);

  // Create split sheet with contributors in a transaction
  return prisma.$transaction(async (tx) => {
    const splitSheet = await tx.splitSheet.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        notes: input.notes,
      },
    });

    await tx.splitContributor.createMany({
      data: input.contributors.map((c) => ({
        splitSheetId: splitSheet.id,
        name: c.name,
        role: c.role,
        percentage: c.percentage,
        pro: c.pro,
        ipi: c.ipi,
        publisher: c.publisher,
        email: c.email,
      })),
    });

    return splitSheet;
  });
}

/**
 * Update split sheet with org ownership validation
 */
export async function updateSplitSheet(
  splitSheetId: string,
  input: UpdateSplitSheetInput,
  orgId?: string
): Promise<SplitSheet> {
  const existing = await prisma.splitSheet.findUnique({
    where: { id: splitSheetId },
    include: {
      project: {
        select: {
          orgId: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error(`Split sheet with id "${splitSheetId}" not found`);
  }

  // SECURITY: Verify organization ownership if orgId provided
  if (orgId && existing.project.orgId !== orgId) {
    throw new Error('Unauthorized: Split sheet does not belong to this organization');
  }

  if (existing.finalized) {
    throw new Error('Cannot update finalized split sheet');
  }

  return prisma.splitSheet.update({
    where: { id: splitSheetId },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  });
}

/**
 * Add contributor to split sheet
 */
export async function addContributor(
  splitSheetId: string,
  input: CreateSplitContributorInput
): Promise<SplitContributor> {
  const splitSheet = await prisma.splitSheet.findUnique({
    where: { id: splitSheetId },
    include: { contributors: true },
  });

  if (!splitSheet) {
    throw new Error(`Split sheet with id "${splitSheetId}" not found`);
  }

  if (splitSheet.finalized) {
    throw new Error('Cannot add contributors to finalized split sheet');
  }

  // Validate percentage
  if (input.percentage <= 0) {
    throw new Error(`Percentage must be greater than 0. Got: ${input.percentage}%`);
  }
  if (input.percentage > 100) {
    throw new Error(`Percentage cannot exceed 100%. Got: ${input.percentage}%`);
  }

  // Check new total
  const currentTotal = splitSheet.contributors.reduce((sum, c) => sum + c.percentage, 0);
  const newTotal = currentTotal + input.percentage;

  if (newTotal > 100.001) {
    throw new Error(
      `Adding this contributor would exceed 100%. Current: ${currentTotal.toFixed(2)}%, Adding: ${input.percentage}%`
    );
  }

  // Check for duplicate names
  const existingNames = splitSheet.contributors.map((c) => c.name.toLowerCase().trim());
  if (existingNames.includes(input.name.toLowerCase().trim())) {
    throw new Error(`Contributor with name "${input.name}" already exists`);
  }

  return prisma.splitContributor.create({
    data: {
      splitSheetId,
      ...input,
    },
  });
}

/**
 * Update contributor
 */
export async function updateContributor(
  contributorId: string,
  input: UpdateContributorInput
): Promise<SplitContributor> {
  const contributor = await prisma.splitContributor.findUnique({
    where: { id: contributorId },
    include: { splitSheet: { include: { contributors: true } } },
  });

  if (!contributor) {
    throw new Error(`Contributor with id "${contributorId}" not found`);
  }

  if (contributor.splitSheet.finalized) {
    throw new Error('Cannot update contributors in finalized split sheet');
  }

  // If percentage is changing, validate new total
  if (input.percentage !== undefined) {
    if (input.percentage <= 0) {
      throw new Error(`Percentage must be greater than 0. Got: ${input.percentage}%`);
    }
    if (input.percentage > 100) {
      throw new Error(`Percentage cannot exceed 100%. Got: ${input.percentage}%`);
    }

    const otherContributors = contributor.splitSheet.contributors.filter(
      (c) => c.id !== contributorId
    );
    const otherTotal = otherContributors.reduce((sum, c) => sum + c.percentage, 0);
    const newTotal = otherTotal + input.percentage;

    if (newTotal > 100.001) {
      throw new Error(
        `Updating percentage would exceed 100%. Current others: ${otherTotal.toFixed(2)}%, New: ${input.percentage}%`
      );
    }
  }

  return prisma.splitContributor.update({
    where: { id: contributorId },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  });
}

/**
 * Remove contributor
 */
export async function removeContributor(contributorId: string): Promise<void> {
  const contributor = await prisma.splitContributor.findUnique({
    where: { id: contributorId },
    include: { splitSheet: true },
  });

  if (!contributor) {
    throw new Error(`Contributor with id "${contributorId}" not found`);
  }

  if (contributor.splitSheet.finalized) {
    throw new Error('Cannot remove contributors from finalized split sheet');
  }

  await prisma.splitContributor.delete({
    where: { id: contributorId },
  });
}

/**
 * Finalize split sheet
 */
export async function finalizeSplitSheet(
  splitSheetId: string,
  pdfKey: string
): Promise<SplitSheet> {
  const splitSheet = await prisma.splitSheet.findUnique({
    where: { id: splitSheetId },
    include: { contributors: true },
  });

  if (!splitSheet) {
    throw new Error(`Split sheet with id "${splitSheetId}" not found`);
  }

  if (splitSheet.finalized) {
    throw new Error('Split sheet is already finalized');
  }

  // Validate contributors total exactly 100% with tight tolerance
  const total = splitSheet.contributors.reduce((sum, c) => sum + c.percentage, 0);
  if (Math.abs(total - 100) > 0.001) {
    throw new Error(
      `Cannot finalize: Contributors total ${total.toFixed(2)}%, must be exactly 100%`
    );
  }

  // Ensure all contributors have valid percentages
  for (const contributor of splitSheet.contributors) {
    if (contributor.percentage <= 0 || contributor.percentage > 100) {
      throw new Error(
        `Cannot finalize: Invalid percentage ${contributor.percentage}% for contributor ${contributor.name}`
      );
    }
  }

  // Mark all contributors as finalized
  await prisma.$transaction(async (tx) => {
    await tx.splitContributor.updateMany({
      where: { splitSheetId },
      data: { finalized: true },
    });

    return tx.splitSheet.update({
      where: { id: splitSheetId },
      data: {
        finalized: true,
        finalizedAt: new Date(),
        pdfKey,
      },
    });
  });

  return prisma.splitSheet.findUniqueOrThrow({
    where: { id: splitSheetId },
    include: { contributors: true },
  });
}

/**
 * Get split sheet with contributors
 */
export async function getSplitSheetById(splitSheetId: string) {
  return prisma.splitSheet.findUnique({
    where: { id: splitSheetId },
    include: {
      contributors: {
        orderBy: { percentage: 'desc' },
      },
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
 * List split sheets for a project
 */
export async function listSplitSheets(projectId: string) {
  return prisma.splitSheet.findMany({
    where: { projectId },
    include: {
      contributors: {
        orderBy: { percentage: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
