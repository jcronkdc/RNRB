import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAsset, getAssetByChecksum } from '@songforge/db';
import { prisma } from '@songforge/db';

/**
 * Unit tests for asset sync race conditions
 */

describe('Asset Sync Race Conditions', () => {
  let testProjectId: string;

  beforeEach(async () => {
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
    await prisma.asset.deleteMany({ where: { projectId: testProjectId } });
    await prisma.project.deleteMany({ where: { id: testProjectId } });
  });

  it('BUG 8: Offline asset sync creates duplicates on race condition', async () => {
    const storageKey = `uploads/${Date.now()}-test.mp3`;
    const checksum = 'test-checksum-123';

    // Simulate concurrent uploads (race condition)
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
        checksum, // Same checksum = same file
        assetType: 'audio'
      })
    ];

    // BUG: Should detect duplicates by checksum and prevent
    const results = await Promise.allSettled(promises);
    
    // Check if duplicates were created
    const assets = await prisma.asset.findMany({
      where: { checksum }
    });

    // Should only have one asset with this checksum
    expect(assets.length).toBeLessThanOrEqual(1);
  });

  it('BUG 9: Asset metadata leaks sensitive information', async () => {
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

    // BUG: Metadata should be sanitized
    if (asset.metadata) {
      const metadata = asset.metadata as Record<string, unknown>;
      expect(metadata).not.toHaveProperty('internalPath');
      expect(metadata).not.toHaveProperty('apiKey');
      expect(metadata).not.toHaveProperty('watermark');
    }
  });
});




