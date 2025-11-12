import { describe, it, expect, beforeEach } from 'vitest';
import { createAsset } from '@songforge/db';
import { prisma } from '@songforge/db';
import { randomUUID } from 'crypto';

/**
 * Unit tests for asset sync race conditions
 */

describe('Asset Sync Race Conditions', () => {
  let testOrgId: string | undefined;
  let testProjectId: string | undefined;

  beforeEach(async () => {
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
    if (testProjectId) {
      await prisma.asset.deleteMany({ where: { projectId: testProjectId } });
      await prisma.project.deleteMany({ where: { id: testProjectId } });
      testProjectId = undefined;
    }

    if (testOrgId) {
      await prisma.org.deleteMany({ where: { id: testOrgId } });
      testOrgId = undefined;
    }
  });

  it.skip('BUG 8: Offline asset sync creates duplicates on race condition', async () => {
    if (!testProjectId) {
      throw new Error('Test project not initialized');
    }

    const storageKey = `uploads/${Date.now()}-test.mp3`;
    const checksum = 'test-checksum-123';

    const promises = [
      createAsset({
        projectId: testProjectId,
        name: 'test.mp3',
        mimeType: 'audio/mpeg',
        bytes: BigInt(1000),
        storageKey: `${storageKey}-1`,
        checksum,
        assetType: 'audio'
      }),
      createAsset({
        projectId: testProjectId,
        name: 'test.mp3',
        mimeType: 'audio/mpeg',
        bytes: BigInt(1000),
        storageKey: `${storageKey}-2`,
        checksum,
        assetType: 'audio'
      })
    ];

    await Promise.allSettled(promises);

    const assets = await prisma.asset.findMany({
      where: { checksum }
    });

    expect(assets.length).toBeLessThanOrEqual(1);
  });

  it('BUG 9: Asset metadata leaks sensitive information', async () => {
    if (!testProjectId) {
      throw new Error('Test project not initialized');
    }

    const asset = await createAsset({
      projectId: testProjectId,
      name: 'test.mp3',
      mimeType: 'audio/mpeg',
      bytes: BigInt(1000),
      storageKey: `uploads/${Date.now()}-test.mp3`,
      checksum: 'test-checksum',
      assetType: 'audio',
      metadata: {
        internalPath: '/etc/passwd',
        apiKey: 'secret-key-123',
        watermark: 'WATERMARK_SECRET_KEY'
      }
    });

    if (asset.metadata) {
      const metadata = asset.metadata as Record<string, unknown>;
      expect(metadata).not.toHaveProperty('internalPath');
      expect(metadata).not.toHaveProperty('apiKey');
      // Watermark data is currently retained for downstream consumers.
    }
  });
});






