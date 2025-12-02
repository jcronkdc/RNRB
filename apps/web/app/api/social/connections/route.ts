import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';

import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/social/connections - List user's connected social accounts
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: connections, error } = await supabase
      .from('social_connections')
      .select(
        `
        id,
        platform,
        platform_username,
        platform_display_name,
        platform_avatar_url,
        account_type,
        page_id,
        page_name,
        is_active,
        last_used_at,
        created_at
      `
      )
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    return NextResponse.json({ connections: connections || [] });
  } catch (error) {
    console.error('Social connections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/social/connections - Disconnect a social account
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await req.json();
    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('social_connections')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', connectionId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error disconnecting:', error);
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
