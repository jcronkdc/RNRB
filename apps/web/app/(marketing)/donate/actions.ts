'use server';

import { prisma } from "@cronkwaters/db";
import { revalidatePath } from "next/cache";
import { processPayment } from "@/lib/stripe";

interface ProcessDonationInput {
  amount: number; // in cents
  frequency: "once" | "monthly";
  email: string;
  name: string;
  anonymous: boolean;
  message?: string;
  coverFees: boolean;
  userId?: string;
}

export async function processDonation(input: ProcessDonationInput) {
  const { amount, frequency, email, name, anonymous, message, userId, coverFees } = input;

  try {
    // Calculate final amount including fees if user opted to cover them
    let finalAmount = amount;
    if (coverFees) {
      // Stripe fee is 2.9% + 30¢ per transaction
      // Calculate fee and add to donation amount
      const stripeFee = Math.ceil(amount * 0.029 + 30);
      finalAmount = amount + stripeFee;
    }

    // Process payment through Stripe
    const paymentResult = await processPayment(
      finalAmount,
      'usd',
      `CronkWaters Foundation Donation${frequency === 'monthly' ? ' (Monthly)' : ''}`,
      {
        email,
        name,
        frequency,
        originalAmount: amount.toString(),
        coveredFees: coverFees.toString()
      }
    );

    if (!paymentResult.success) {
      return { 
        success: false as const, 
        error: paymentResult.error || "Payment processing failed" 
      };
    }

    // Create or find user
    let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
          }
        });
      }
    }

    // Create donation record with payment info
    const donation = await prisma.donation.create({
      data: {
        amount: finalAmount / 100, // Convert from cents to dollars
        donorAnonymous: anonymous,
        message,
        status: 'completed',
        donorEmail: email,
        donorName: name,
        processedAt: new Date(),
      }
    });

    // Send confirmation email (implementation can be added later)
    // For now, the email confirmation is simulated
    console.log(`Donation confirmation email would be sent to ${email}`);

    // Set up recurring payment if monthly
    if (frequency === 'monthly') {
      // This would create a subscription in Stripe
      // For now, we'll just log it
      console.log(`Monthly subscription would be set up for ${email}`);
    }

    revalidatePath('/donate');
    return { 
      success: true as const, 
      donationId: donation.id,
      paymentId: paymentResult.paymentId 
    };
  } catch (error) {
    console.error('Error processing donation:', error);
    return { success: false as const, error: "Failed to process donation" };
  }
}

export async function getDonationStats() {
  try {
    // Get aggregated donation stats
    const totalRaised = await prisma.donation.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true }
    });

    const donorCount = await prisma.donation.groupBy({
      by: ['donorEmail'],
      where: { status: 'completed' },
      _count: true
    });

    // Get recent donations for social proof
    const recentDonations = await prisma.donation.findMany({
      where: { 
        status: 'completed',
        donorAnonymous: false 
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        donorName: true,
        amount: true,
        createdAt: true,
        message: true
      }
    });

    // Campaign settings (would be in DB/env in real app)
    const campaignGoal = 50000 * 100; // $50,000 in cents
    const campaignEndDate = new Date('2024-12-31');
    const daysLeft = Math.max(0, Math.ceil((campaignEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return {
      raised: totalRaised._sum.amount ? Number(totalRaised._sum.amount) / 100 : 0, // Convert to dollars
      goal: campaignGoal / 100,
      donors: donorCount.length,
      daysLeft,
      recentDonors: recentDonations.map(d => ({
        name: d.donorName || 'Anonymous',
        amount: (Number(d.amount) / 100).toFixed(0),
        timeAgo: getTimeAgo(d.createdAt),
        message: d.message
      }))
    };
  } catch (error) {
    console.error('Error getting donation stats:', error);
    return {
      raised: 0,
      goal: 50000,
      donors: 0,
      daysLeft: 30,
      recentDonors: []
    };
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}
