import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface PostRequest {
  platforms: string[];
  content: {
    text: string;
    mediaUrls?: string[];
    link?: string;
  };
  platformContent?: Record<string, { text: string }>; // Platform-specific overrides
  scheduleFor?: string; // ISO date string for scheduling
}

interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

// Refresh Twitter token if expired
async function refreshTwitterToken(connection: any, supabase: any): Promise<string | null> {
  if (!connection.refresh_token) return null;

  const tokenExpiry = new Date(connection.token_expires_at);
  if (tokenExpiry > new Date()) {
    return connection.access_token; // Still valid
  }

  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
      }),
    });

    if (!response.ok) return null;

    const tokens = await response.json();

    // Update stored tokens
    await supabase
      .from('social_connections')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || connection.refresh_token,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
      })
      .eq('id', connection.id);

    return tokens.access_token;
  } catch {
    return null;
  }
}

// Post to Twitter
async function postToTwitter(
  connection: any,
  content: { text: string; mediaUrls?: string[] },
  supabase: any
): Promise<PostResult> {
  try {
    const accessToken = await refreshTwitterToken(connection, supabase);
    if (!accessToken) {
      return { platform: 'twitter', success: false, error: 'Token expired, please reconnect' };
    }

    // For now, text-only tweets. Media requires upload to Twitter first.
    const tweetData: any = { text: content.text };

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        platform: 'twitter',
        success: false,
        error: errorData.detail || errorData.title || 'Tweet failed',
      };
    }

    const data = await response.json();
    return {
      platform: 'twitter',
      success: true,
      postId: data.data.id,
      postUrl: `https://twitter.com/${connection.platform_username}/status/${data.data.id}`,
    };
  } catch (error: any) {
    return { platform: 'twitter', success: false, error: error.message };
  }
}

// Post to Facebook Page
async function postToFacebook(
  connection: any,
  content: { text: string; link?: string; mediaUrls?: string[] }
): Promise<PostResult> {
  try {
    const accessToken = connection.page_access_token || connection.access_token;
    const pageId = connection.page_id;

    if (!pageId) {
      return { platform: 'facebook', success: false, error: 'No Facebook Page connected' };
    }

    const postData: any = { message: content.text };
    if (content.link) postData.link = content.link;

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...postData,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        platform: 'facebook',
        success: false,
        error: errorData.error?.message || 'Facebook post failed',
      };
    }

    const data = await response.json();
    return {
      platform: 'facebook',
      success: true,
      postId: data.id,
      postUrl: `https://facebook.com/${data.id.replace('_', '/posts/')}`,
    };
  } catch (error: any) {
    return { platform: 'facebook', success: false, error: error.message };
  }
}

// Post to LinkedIn
async function postToLinkedIn(
  connection: any,
  content: { text: string; link?: string }
): Promise<PostResult> {
  try {
    const accessToken = connection.access_token;

    // LinkedIn requires URN format
    const authorUrn = `urn:li:person:${connection.platform_user_id}`;

    const postData: any = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content.text },
          shareMediaCategory: content.link ? 'ARTICLE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    if (content.link) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          originalUrl: content.link,
        },
      ];
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        platform: 'linkedin',
        success: false,
        error: errorData.message || 'LinkedIn post failed',
      };
    }

    const data = await response.json();
    const postId = data.id.split(':').pop();
    return {
      platform: 'linkedin',
      success: true,
      postId: data.id,
      postUrl: `https://linkedin.com/feed/update/${postId}`,
    };
  } catch (error: any) {
    return { platform: 'linkedin', success: false, error: error.message };
  }
}

// POST /api/social/post - Post to multiple platforms
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PostRequest = await req.json();
    const { platforms, content, platformContent, scheduleFor } = body;

    if (!platforms?.length) {
      return NextResponse.json({ error: 'No platforms specified' }, { status: 400 });
    }

    if (!content?.text) {
      return NextResponse.json({ error: 'Content text required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // If scheduling, store in scheduled_posts table
    if (scheduleFor) {
      const { data: scheduledPost, error: scheduleError } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: session.user.id,
          content_type: 'custom',
          caption: content.text,
          link_url: content.link,
          media_urls: content.mediaUrls || [],
          target_platforms: platforms,
          platform_specific_content: platformContent || {},
          scheduled_for: scheduleFor,
          status: 'scheduled',
        })
        .select()
        .single();

      if (scheduleError) {
        return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 });
      }

      return NextResponse.json({
        scheduled: true,
        postId: scheduledPost.id,
        scheduledFor: scheduleFor,
      });
    }

    // Get user's connected accounts for requested platforms
    const { data: connections, error: connError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .in('platform', platforms);

    if (connError || !connections?.length) {
      return NextResponse.json(
        { error: 'No connected accounts for selected platforms' },
        { status: 400 }
      );
    }

    // Post to each platform
    const results: PostResult[] = [];

    for (const connection of connections) {
      const platformText = platformContent?.[connection.platform]?.text || content.text;
      const postContent = { ...content, text: platformText };

      let result: PostResult;

      switch (connection.platform) {
        case 'twitter':
          result = await postToTwitter(connection, postContent, supabase);
          break;
        case 'facebook':
          result = await postToFacebook(connection, postContent);
          break;
        case 'linkedin':
          result = await postToLinkedIn(connection, postContent);
          break;
        default:
          result = {
            platform: connection.platform,
            success: false,
            error: `Platform ${connection.platform} not yet supported for direct posting`,
          };
      }

      results.push(result);

      // Update last_used_at
      await supabase
        .from('social_connections')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', connection.id);

      // Store analytics for successful posts
      if (result.success && result.postId) {
        await supabase.from('post_analytics').insert({
          user_id: session.user.id,
          platform: connection.platform,
          platform_post_id: result.postId,
          post_url: result.postUrl,
          posted_at: new Date().toISOString(),
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failCount === 0,
      results,
      summary: {
        total: results.length,
        succeeded: successCount,
        failed: failCount,
      },
    });
  } catch (error: any) {
    console.error('Social post error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
