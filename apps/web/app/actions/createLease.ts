'use server';

import { prisma, createSplitSheet } from '@cronkwaters/db';
import { auth } from '@cronkwaters/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const leaseSchema = z.object({
  songId: z.string().min(1),
  price: z.number().positive().max(100000),
  collaborators: z
    .array(
      z.object({
        name: z.string().min(1, 'Name required'),
        email: z.string().email('Valid email required'),
        percentage: z.number().positive().max(100)
      })
    )
    .min(1, 'At least one collaborator required')
});

// Removed getSupabaseClient - using NextAuth for authentication

function parseMetadata(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function encodeMetadata(meta: Record<string, unknown>): string {
  return JSON.stringify(meta);
}

async function ensureStripePayment(price: number, songTitle: string): Promise<{ id: string; clientSecret: string | null }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key missing');
  }

  const params = new URLSearchParams();
  params.append('amount', String(Math.round(price * 100)));
  params.append('currency', 'usd');
  params.append('payment_method_types[]', 'card');
  params.append('confirm', 'true');
  params.append('payment_method', 'pm_card_visa');
  params.append('description', `CronkWaters lease - ${songTitle}`);

  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Stripe payment failed: ${response.status} ${text}`);
  }

  const payload = (await response.json()) as { id: string; client_secret?: string | null };
  return { id: payload.id, clientSecret: payload.client_secret ?? null };
}

async function ensureConnectAccount(email: string, name: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.append('type', 'express');
    params.append('email', email);
    params.append('business_type', 'individual');
    params.append('individual[first_name]', name.split(' ')[0] ?? 'Creator');
    params.append('individual[last_name]', name.split(' ').slice(1).join(' ') || 'CronkWaters');

    const response = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Stripe connect failed: ${response.status} ${text}`);
    }

    const payload = (await response.json()) as { id?: string };
    return payload.id ?? null;
  } catch (error) {
    console.error('Failed to create connect account', error);
    return null;
  }
}

export async function createLeaseAction(formData: FormData) {
  const payloadRaw = formData.get('payload');
  if (!payloadRaw || typeof payloadRaw !== 'string') {
    return { success: false as const, error: 'Invalid form payload' };
  }

  let parsedPayload: z.infer<typeof leaseSchema>;
  try {
    parsedPayload = leaseSchema.parse(JSON.parse(payloadRaw));
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Invalid lease payload'
    };
  }

  const total = parsedPayload.collaborators.reduce((sum, c) => sum + c.percentage, 0);
  if (Math.abs(total - 100) > 0.01) {
    return { success: false as const, error: 'Collaborator percentages must total 100%.' };
  }

  // Use NextAuth for authentication
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false as const, error: 'You must be signed in to lease a song.' };
  }

  const song = await prisma.song.findUnique({
    where: { id: parsedPayload.songId },
    include: { project: true }
  });

  if (!song || !song.project) {
    return { success: false as const, error: 'Song not found.' };
  }

  const connectAccounts: Array<{ email: string; accountId: string | null }> = [];
  for (const collaborator of parsedPayload.collaborators) {
    const accountId = await ensureConnectAccount(collaborator.email, collaborator.name);
    connectAccounts.push({ email: collaborator.email, accountId });
  }

  const splitSheet = await createSplitSheet({
    projectId: song.projectId,
    title: `${song.title} Lease ${new Date().toISOString().slice(0, 10)}`,
    contributors: parsedPayload.collaborators.map((collaborator) => ({
      name: collaborator.name,
      email: collaborator.email,
      percentage: collaborator.percentage,
      role: 'Collaborator'
    }))
  });

  const payment = await ensureStripePayment(parsedPayload.price, song.title);
  const leasePdfUrl = `https://cronkwaters.example/leases/${parsedPayload.songId}.pdf`;

  const currentMetadata = parseMetadata(song.description);
  const updatedMetadata = {
    ...currentMetadata,
    status: 'leased',
    lease: {
      amount: parsedPayload.price,
      currency: 'USD',
      transactionId: payment.id,
      clientSecret: payment.clientSecret,
      pdfUrl: leasePdfUrl,
      splitSheetId: splitSheet.id,
      collaborators: parsedPayload.collaborators,
      connectAccounts
    }
  } satisfies Record<string, unknown>;

  await prisma.song.update({
    where: { id: song.id },
    data: {
      description: encodeMetadata(updatedMetadata)
    }
  });

  revalidatePath('/dashboard');

  return {
    success: true as const,
    data: {
      transactionId: payment.id,
      pdfUrl: leasePdfUrl,
      splitSheetId: splitSheet.id
    }
  };
}
