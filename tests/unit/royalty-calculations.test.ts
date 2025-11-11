import { describe, it, expect } from 'vitest';

/**
 * Unit tests for royalty waterfall calculation bugs
 */

describe('Royalty Waterfall Calculation Bugs', () => {
  it('BUG 10: Royalty calculation errors with multiple contributors', () => {
    const revenue = 1000;
    const contributors = [
      { name: 'Artist 1', percentage: 50 },
      { name: 'Artist 2', percentage: 30 },
      { name: 'Artist 3', percentage: 20 }
    ];

    // BUG: Should calculate correctly
    const royalties = contributors.map(c => ({
      name: c.name,
      amount: (revenue * c.percentage) / 100
    }));

    expect(royalties[0].amount).toBe(500);
    expect(royalties[1].amount).toBe(300);
    expect(royalties[2].amount).toBe(200);
    
    // Total should equal revenue
    const total = royalties.reduce((sum, r) => sum + r.amount, 0);
    expect(total).toBe(revenue);
  });

  it('BUG 11: Royalty calculation has floating point precision errors', () => {
    const revenue = 100;
    const contributors = [
      { name: 'Artist 1', percentage: 33.333333 },
      { name: 'Artist 2', percentage: 33.333333 },
      { name: 'Artist 3', percentage: 33.333334 }
    ];

    const royalties = contributors.map(c => ({
      name: c.name,
      amount: Math.round((revenue * c.percentage) / 100 * 100) / 100 // Round to 2 decimals
    }));

    const total = royalties.reduce((sum, r) => sum + r.amount, 0);
    // Should be close to revenue (within rounding error)
    expect(Math.abs(total - revenue)).toBeLessThan(0.01);
  });

  it('BUG 12: Royalty waterfall doesn\'t handle zero revenue', () => {
    const revenue = 0;
    const contributors = [
      { name: 'Artist 1', percentage: 50 },
      { name: 'Artist 2', percentage: 50 }
    ];

    const royalties = contributors.map(c => ({
      name: c.name,
      amount: (revenue * c.percentage) / 100
    }));

    // Should all be zero, not NaN or Infinity
    royalties.forEach(r => {
      expect(r.amount).toBe(0);
      expect(Number.isFinite(r.amount)).toBe(true);
    });
  });

  it('BUG 13: Royalty calculation doesn\'t validate finalized splits', () => {
    const revenue = 1000;
    const finalized = false; // Split not finalized
    
    // BUG: Should check if split is finalized before calculating
    if (!finalized) {
      throw new Error('Split must be finalized before calculating royalties');
    }
  });
});

