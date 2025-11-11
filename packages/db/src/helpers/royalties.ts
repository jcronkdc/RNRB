
import { prisma } from '../index';

export interface RoyaltyCalculation {
  contributorId: string;
  contributorName: string;
  percentage: number;
  amount: number;
  roundedAmount: number;
}

export interface RoyaltyWaterfallResult {
  totalRevenue: number;
  totalDistributed: number;
  roundingDifference: number;
  royalties: RoyaltyCalculation[];
}

/**
 * Calculate royalty waterfall for a finalized split sheet
 * @param splitSheetId - The ID of the finalized split sheet
 * @param revenue - Total revenue amount in dollars
 * @returns Royalty calculation result
 */
export async function calculateRoyaltyWaterfall(
  splitSheetId: string,
  revenue: number
): Promise<RoyaltyWaterfallResult> {
  // Validate revenue
  if (!Number.isFinite(revenue) || revenue < 0) {
    throw new Error(`Invalid revenue amount: ${revenue}. Must be a positive number.`);
  }

  // Get split sheet with contributors
  const splitSheet = await prisma.splitSheet.findUnique({
    where: { id: splitSheetId },
    include: {
      contributors: {
        orderBy: { percentage: 'desc' }
      }
    }
  });

  if (!splitSheet) {
    throw new Error(`Split sheet with id "${splitSheetId}" not found`);
  }

  // BUG FIX: Must be finalized before calculating royalties
  if (!splitSheet.finalized) {
    throw new Error('Split sheet must be finalized before calculating royalties');
  }

  if (splitSheet.contributors.length === 0) {
    throw new Error('Split sheet has no contributors');
  }

  // Validate contributors total 100%
  const totalPercentage = splitSheet.contributors.reduce((sum, c) => sum + c.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.001) {
    throw new Error(`Split sheet contributors total ${totalPercentage.toFixed(2)}%, must be exactly 100%`);
  }

  // Calculate royalties with proper rounding
  const royalties: RoyaltyCalculation[] = splitSheet.contributors.map((contributor) => {
    const amount = (revenue * contributor.percentage) / 100;
    // Round to 2 decimal places for currency
    const roundedAmount = Math.round(amount * 100) / 100;

    return {
      contributorId: contributor.id,
      contributorName: contributor.name,
      percentage: contributor.percentage,
      amount,
      roundedAmount
    };
  });

  // Calculate total distributed (sum of rounded amounts)
  const totalDistributed = royalties.reduce((sum, r) => sum + r.roundedAmount, 0);
  const roundingDifference = revenue - totalDistributed;

  return {
    totalRevenue: revenue,
    totalDistributed,
    roundingDifference,
    royalties
  };
}

/**
 * Calculate royalties for multiple split sheets (aggregated)
 */
export async function calculateAggregatedRoyalties(
  splitSheetIds: string[],
  revenue: number
): Promise<RoyaltyWaterfallResult> {
  if (splitSheetIds.length === 0) {
    throw new Error('At least one split sheet is required');
  }

  // Calculate for each split sheet
  const results = await Promise.all(
    splitSheetIds.map(id => calculateRoyaltyWaterfall(id, revenue))
  );

  // Aggregate results
  const aggregatedRoyalties = new Map<string, RoyaltyCalculation>();

  for (const result of results) {
    for (const royalty of result.royalties) {
      const existing = aggregatedRoyalties.get(royalty.contributorId);
      if (existing) {
        existing.amount += royalty.amount;
        existing.roundedAmount = Math.round(existing.amount * 100) / 100;
      } else {
        aggregatedRoyalties.set(royalty.contributorId, { ...royalty });
      }
    }
  }

  const totalDistributed = Array.from(aggregatedRoyalties.values()).reduce(
    (sum, r) => sum + r.roundedAmount,
    0
  );
  const roundingDifference = revenue - totalDistributed;

  return {
    totalRevenue: revenue,
    totalDistributed,
    roundingDifference,
    royalties: Array.from(aggregatedRoyalties.values())
  };
}




