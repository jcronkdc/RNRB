import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';

// Commission rates by tier
const COMMISSION_RATES: Record<string, number> = {
  STARTER: 0.1,
  BRONZE: 0.12,
  SILVER: 0.15,
  GOLD: 0.18,
  PLATINUM: 0.22,
  AMBASSADOR: 0.25,
};

// Tier thresholds
const TIER_THRESHOLDS = [
  { tier: 'AMBASSADOR', minReferrals: 250 },
  { tier: 'PLATINUM', minReferrals: 100 },
  { tier: 'GOLD', minReferrals: 50 },
  { tier: 'SILVER', minReferrals: 25 },
  { tier: 'BRONZE', minReferrals: 10 },
  { tier: 'STARTER', minReferrals: 0 },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateCode, userId, plan, amount } = body;

    if (!affiliateCode || !userId || !plan || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { code: affiliateCode },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });
    }

    // Get referred user
    const referredUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Calculate commission
    const commissionRate = COMMISSION_RATES[affiliate.tier] || 0.1;
    const commissionAmount = amount * commissionRate;

    // Create referral record
    const referral = await prisma.affiliateReferral.create({
      data: {
        affiliateId: affiliate.id,
        referredUserId: userId,
        subscriptionTier: plan,
        commissionEarned: commissionAmount,
        status: 'converted',
        convertedAt: new Date(),
      },
    });

    // Update affiliate stats
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        lifetimeEarnings: { increment: commissionAmount },
        pendingEarnings: { increment: commissionAmount },
        totalReferrals: { increment: 1 },
      },
    });

    // Check and update tier
    await updateAffiliateTier(affiliate.id);

    return NextResponse.json({
      success: true,
      referralId: referral.id,
      commission: commissionAmount,
    });
  } catch (error) {
    console.error('Error recording conversion:', error);
    return NextResponse.json({ error: 'Failed to record conversion' }, { status: 500 });
  }
}

async function updateAffiliateTier(affiliateId: string) {
  // Count active referrals
  const activeReferrals = await prisma.affiliateReferral.count({
    where: {
      affiliateId,
      status: 'ACTIVE',
    },
  });

  // Determine new tier
  const newTier = TIER_THRESHOLDS.find((t) => activeReferrals >= t.minReferrals)?.tier || 'STARTER';

  // Update if changed
  await prisma.affiliate.update({
    where: { id: affiliateId },
    data: { tier: newTier },
  });
}
