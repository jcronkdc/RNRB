import { describe, it, expect } from 'vitest';
import { createSplitSheet, updateContributor, finalizeSplitSheet } from '@songforge/db';
import { prisma } from '@songforge/db';

/**
 * Unit tests for split validation bugs
 */

describe('Split Validation Bugs', () => {
  let testProjectId: string;
  let testSplitSheetId: string;

  beforeEach(async () => {
    // Create test project
    const org = await prisma.org.findFirst() || await prisma.org.create({
      data: {
        name: 'Test Org',
        slug: 'test-org',
        type: 'studio'
      }
    });

    const project = await prisma.project.create({
      data: {
        orgId: org.id,
        name: 'Test Project',
        slug: 'test-project'
      }
    });
    testProjectId = project.id;
  });

  afterEach(async () => {
    // Cleanup
    if (testSplitSheetId) {
      await prisma.splitContributor.deleteMany({ where: { splitSheetId: testSplitSheetId } });
      await prisma.splitSheet.delete({ where: { id: testSplitSheetId } });
    }
    await prisma.project.deleteMany({ where: { id: testProjectId } });
  });

  it('BUG 1: Split validation allows percentages > 100%', async () => {
    // BUG: Should reject but validation is too lenient
    await expect(
      createSplitSheet({
        projectId: testProjectId,
        title: 'Test Split',
        contributors: [
          { name: 'Artist 1', percentage: 60 },
          { name: 'Artist 2', percentage: 50 } // Total 110%
        ]
      })
    ).rejects.toThrow(/must.*total.*100|exceeds.*100/i);
  });

  it('BUG 2: Split validation allows negative percentages', async () => {
    await expect(
      createSplitSheet({
        projectId: testProjectId,
        title: 'Test Split',
        contributors: [
          { name: 'Artist 1', percentage: -10 }
        ]
      })
    ).rejects.toThrow(/must.*be.*positive|greater.*than.*0|invalid.*percentage/i);
  });

  it('BUG 3: Split validation allows zero contributors', async () => {
    await expect(
      createSplitSheet({
        projectId: testProjectId,
        title: 'Test Split',
        contributors: []
      })
    ).rejects.toThrow(/at least.*one.*contributor|require.*contributor/i);
  });

  it('BUG 4: Update contributor allows exceeding 100%', async () => {
    const splitSheet = await createSplitSheet({
      projectId: testProjectId,
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
      // Try to update to 60%, which would make total 110%
      await expect(
        updateContributor(contributor.id, { percentage: 60 })
      ).rejects.toThrow(/exceeds.*100|must.*total.*100/i);
    }
  });

  it('BUG 5: Finalization allows non-100% totals', async () => {
    const splitSheet = await createSplitSheet({
      projectId: testProjectId,
      title: 'Test Split',
      contributors: [
        { name: 'Artist 1', percentage: 95 } // Only 95%
      ]
    });
    testSplitSheetId = splitSheet.id;

    // BUG: Should reject finalization
    await expect(
      finalizeSplitSheet(splitSheet.id, 'test-pdf-key.pdf')
    ).rejects.toThrow(/must.*total.*100.*percent|exactly.*100/i);
  });

  it('BUG 6: Floating point precision errors in percentage calculations', async () => {
    // Test with values that sum to exactly 100 but have floating point issues
    const splitSheet = await createSplitSheet({
      projectId: testProjectId,
      title: 'Test Split',
      contributors: [
        { name: 'Artist 1', percentage: 33.333333 },
        { name: 'Artist 2', percentage: 33.333333 },
        { name: 'Artist 3', percentage: 33.333334 } // Should total 100
      ]
    });
    testSplitSheetId = splitSheet.id;

    // Should be able to finalize
    await expect(
      finalizeSplitSheet(splitSheet.id, 'test-pdf-key.pdf')
    ).resolves.toBeDefined();
  });

  it('BUG 7: Split validation doesn\'t check for duplicate contributor names', async () => {
    // BUG: Should warn or prevent duplicate names
    const splitSheet = await createSplitSheet({
      projectId: testProjectId,
      title: 'Test Split',
      contributors: [
        { name: 'John Doe', percentage: 50 },
        { name: 'John Doe', percentage: 50 } // Duplicate name
      ]
    });
    testSplitSheetId = splitSheet.id;

    // Should still work but might want to warn
    expect(splitSheet).toBeDefined();
  });
});

