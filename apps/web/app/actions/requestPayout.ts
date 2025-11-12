'use server';

import { prisma } from '@cronkwaters/db';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

const payoutSchema = z.object({
  songId: z.string().min(1)
});

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // ignored in RSC context
          }
        }
      }
    }
  );
}

function parseMetadata(raw: string | null): Record<string, unknown> {
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

export async function requestPayoutAction(formData: FormData) {
  const payloadRaw = formData.get('payload');
  if (!payloadRaw || typeof payloadRaw !== 'string') {
    return { success: false as const, error: 'Invalid payload' };
  }

  let payload: z.infer<typeof payoutSchema>;
  try {
    payload = payoutSchema.parse(JSON.parse(payloadRaw));
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Invalid payout payload'
    };
  }

  const supabase = await getSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { success: false as const, error: 'You must be signed in to request a payout.' };
  }

  const song = await prisma.song.findUnique({ where: { id: payload.songId } });
  if (!song) {
    return { success: false as const, error: 'Song not found.' };
  }

  const metadata = parseMetadata(song.description);
  const leaseMetadata = (metadata.lease as Record<string, unknown> | undefined) ?? {};
  const payoutHistory = Array.isArray(leaseMetadata.payouts) ? [...(leaseMetadata.payouts as unknown[])] : [];

  payoutHistory.push({
    requestedAt: new Date().toISOString(),
    amount: leaseMetadata.amount ?? 0,
    status: 'pending'
  });

  const updatedMetadata = {
    ...metadata,
    lease: {
      ...leaseMetadata,
      payouts: payoutHistory
    }
  } as Record<string, unknown>;

  await prisma.song.update({
    where: { id: song.id },
    data: {
      description: JSON.stringify(updatedMetadata)
    }
  });

  revalidatePath('/dashboard/distribute');

  return {
    success: true as const,
    data: {
      payouts: payoutHistory
    }
  };
}
