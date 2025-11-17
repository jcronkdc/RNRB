'use server';

import { requireOrgSession } from '@cronkwaters/auth';
import { calculateRoyaltyWaterfall, calculateAggregatedRoyalties } from '@cronkwaters/db';
import { z } from 'zod';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const calculateRoyaltiesSchema = z.object({
  splitSheetId: z.string().cuid(),
  revenue: z.number().min(0, 'Revenue must be positive')
});

/**
 * Calculate royalty waterfall for a split sheet
 */
export async function calculateRoyaltiesAction(
  input: unknown
): Promise<ActionResult<{
  totalRevenue: number;
  totalDistributed: number;
  roundingDifference: number;
  royalties: Array<{
    contributorId: string;
    contributorName: string;
    percentage: number;
    amount: number;
    roundedAmount: number;
  }>;
}>> {
  try {
    await requireOrgSession();
    const validated = calculateRoyaltiesSchema.parse(input);

    const result = await calculateRoyaltyWaterfall(validated.splitSheetId, validated.revenue);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate royalties'
    };
  }
}

/**
 * Calculate aggregated royalties for multiple split sheets
 */
export async function calculateAggregatedRoyaltiesAction(
  splitSheetIds: string[],
  revenue: number
): Promise<ActionResult<{
  totalRevenue: number;
  totalDistributed: number;
  roundingDifference: number;
  royalties: Array<{
    contributorId: string;
    contributorName: string;
    percentage: number;
    amount: number;
    roundedAmount: number;
  }>;
}>> {
  try {
    await requireOrgSession();

    if (!Array.isArray(splitSheetIds) || splitSheetIds.length === 0) {
      return {
        success: false,
        error: 'At least one split sheet ID is required'
      };
    }

    if (!Number.isFinite(revenue) || revenue < 0) {
      return {
        success: false,
        error: 'Revenue must be a positive number'
      };
    }

    const result = await calculateAggregatedRoyalties(splitSheetIds, revenue);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate aggregated royalties'
    };
  }
}






