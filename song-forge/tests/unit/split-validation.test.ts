import { describe, it, expect } from 'vitest';
import { createSplitSheet, updateContributor, finalizeSplitSheet } from '@cronkwaters/db';
import { prisma } from '@cronkwaters/db';
import { randomUUID } from 'crypto';

/**
 * Unit tests for split validation bugs
 */

describe('Split Validation Bugs', () => {
  let testOrgId: string | undefined;
  let testProjectId: string | undefined;
  let testSplitSheetId: string | undefined;

  beforeEach(async () => {
    testSplitSheetId = undefined;
    const suffix = randomUUID();

    const org = await prisma.org.create({
      data: {
        name: `Test Org ${suffix}`,
        slug: `test-org-${suffix}`,
        type: 'studio'
      }
    });

    const project = await prisma.project.create({
      data: {
        orgId: org.id,
        name: `Test Project ${suffix}`,
        slug: `test-project-${suffix}`
      }
    });

    testOrgId = org.id;
    testProjectId = project.id;
  });

  afterEach(async () => {
    if (testSplitSheetId) {
      await prisma.splitContributor.deleteMany({ where: { splitSheetId: testSplitSheetId } });
      await prisma.splitSheet.deleteMany({ where: { id: testSplitSheetId } });
      testSplitSheetId = undefined;
    }

    if (testProjectId) {
      await prisma.project.deleteMany({ where: { id: testProjectId } });
      testProjectId = undefined;
    }

    if (testOrgId) {
      await prisma.org.deleteMany({ where: { id: testOrgId } });
      testOrgId = undefined;
    }
  });

  it('BUG 1: Split validation allows percentages > 100%', async () => {
    await expect(
      createSplitSheet({
        projectId: testProjectId!,
        title: 'Test Split',
        contributors: [
          { name: 'Artist 1', percentage: 60 },
          { name: 'Artist 2', percentage: 50 }
        ]
      })
    ).rejects.toThrow(/must.*total.*100|exceed.*100/i);
  });

  it('BUG 2: Split validation allows negative percentages', async () => {
    await expect(
      createSplitSheet({
        projectId: testProjectId!,
        title: 'Test Split',
        contributors: [{ name: 'Artist 1', percentage: -10 }]
      })
    ).rejects.toThrow(/must.*be.*positive|greater.*than.*0|invalid.*percentage/i);
  });

  it('BUG 3: Split validation allows zero contributors', async () => {
    await expect(
      createSplitSheet({
        projectId: testProjectId!,
        title: 'Test Split',
        contributors: []
      })
    ).rejects.toThrow(/at least.*one.*contributor|require.*contributor/i);
  });

  it('BUG 4: Update contributor allows exceeding 100%', async () => {
    const splitSheet = await createSplitSheet({
      projectId: testProjectId!,
      title: 'Test Split',
      contributors: [
        { name: 'Artist 1', percentage: 50 },
        { name: 'Artist 2', percentage: 50 }
      ]
    });
    testSplitSheetId = splitSheet.id;

    const contributor = await prisma.splitContributor.findFirst({
      where: { splitSheetId: splitSheet.id }
    });

    if (contributor) {
      await expect(
        updateContributor(contributor.id, { percentage: 60 })
      ).rejects.toThrow(/exceed.*100|must.*total.*100/i);
    }
  });

  it('BUG 5: Finalization allows non-100% totals', async () => {
    await expect(
      createSplitSheet({
        projectId: testProjectId!,
        title: 'Test Split',
        contributors: [{ name: 'Artist 1', percentage: 95 }]
      })
    ).rejects.toThrow(/must.*total.*100.*percent|exactly.*100/i);
  });

  it('BUG 6: Floating point precision errors in percentage calculations', async () => {
    const splitSheet = await createSplitSheet({
      projectId: testProjectId!,
      title: 'Test Split',
      contributors: [
        { name: 'Artist 1', percentage: 33.333333 },
        { name: 'Artist 2', percentage: 33.333333 },
        { name: 'Artist 3', percentage: 33.333334 }
      ]
    });
    testSplitSheetId = splitSheet.id;

    await expect(
      finalizeSplitSheet(splitSheet.id, 'test-pdf-key.pdf')
    ).resolves.toBeDefined();
  });

  it("BUG 7: Split validation doesn't check for duplicate contributor names", async () => {
    await expect(
      createSplitSheet({
        projectId: testProjectId!,
        title: 'Test Split',
        contributors: [
          { name: 'John Doe', percentage: 50 },
          { name: 'John Doe', percentage: 50 }
        ]
      })
    ).rejects.toThrow(/contributor names must be unique/i);
  });
});






