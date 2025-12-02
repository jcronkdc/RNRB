'use client';

import { Button } from '@cronkwaters/ui';
import { Video, Sparkles, ExternalLink, MousePointer2 } from '@/components/ui/custom-icons';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { CursorOverlay } from '@/components/cursor-overlay';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';

// Dynamically import Daily.co component (client-side only)
const CollaborativeRoom = dynamic(() => import('@/components/app/CollaborativeRoom'), {
  ssr: false,
});

interface ProjectVideoRoomProps {
  projectSlug: string;
  projectName: string;
}

export function ProjectVideoRoom({ projectSlug, projectName }: ProjectVideoRoomProps) {
  const [isStudioTier, setIsStudioTier] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showCursors, setShowCursors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const {
          data: { user: currentUser },
        } = await supabase!.auth.getUser();

        if (!currentUser) {
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Check if user has Studio tier subscription
        const response = await fetch(`/api/user/subscription?userId=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsStudioTier(data.tier === 'studio');

          // If Studio tier, create/get room URL
          if (data.tier === 'studio') {
            await createVideoRoom(projectSlug);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setError('Failed to initialize video room');
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [projectSlug]);

  const createVideoRoom = async (slug: string) => {
    try {
      const response = await fetch('/api/daily/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `project-${slug}-${Date.now()}`,
          properties: {
            max_participants: 50,
            enable_screenshare: true,
            enable_recording: true,
            enable_live_streaming: true,
            enable_chat: true,
            enable_emoji_reactions: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }

      const roomData = await response.json();
      setRoomUrl(roomData.url);
    } catch (err) {
      console.error('Room creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create video room');
    }
  };

  // Initialize cursor tracking (only when cursors enabled)
  const { remoteCursors, isConnected: cursorsConnected } = useCollaborativeCursors({
    channelName: `video-cursors:${projectSlug}`,
    userId: user?.id || '',
    userName: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
    enabled: showCursors && isStudioTier,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Checking video access...</div>
      </div>
    );
  }

  if (!isStudioTier) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
            <Video className="h-10 w-10 text-white" />
          </div>

          <h3 className="mb-4 text-2xl font-bold text-foreground">
            Video Collaboration - Studio Tier
          </h3>

          <p className="mb-6 text-lg text-muted-foreground">
            Real-time video calls with your band are available on the Studio plan ($29.99/month)
          </p>

          <div className="mb-6 rounded-xl border border-border bg-surface-muted p-6">
            <h4 className="mb-3 font-semibold text-foreground">Studio Tier Includes:</h4>
            <ul className="space-y-2 text-left text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
                <span>
                  <strong>Unlimited Video Calls:</strong> Collaborate face-to-face with your team
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
                <span>
                  <strong>Screen Sharing + Cursor Control:</strong> Show your DAW, and collaborators
                  see your cursor in real-time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
                <span>
                  <strong>Recording:</strong> Save your sessions for later review
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
                <span>
                  <strong>Unlimited Projects:</strong> No limits on your creativity
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
                <span>
                  <strong>Unlimited Collaborators:</strong> Bring your whole team
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-primary" />
                <span>
                  <strong>100 GB Storage:</strong> Store all your audio files
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-xl"
              onClick={() => (window.location.href = '/settings/subscription')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Upgrade to Studio
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl px-8 py-4 font-semibold"
              onClick={() => window.open('/pricing', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              View All Plans
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            🎸 <strong>Creator Tier ($17.99/mo)</strong> includes AI features and 10 projects.
            <br />
            Studio is for serious bands who need video collaboration.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-red-500/30 bg-red-500/10">
            <Video className="h-10 w-10 text-red-500" />
          </div>

          <h3 className="mb-4 text-2xl font-bold text-foreground">Video Room Error</h3>

          <p className="mb-6 text-lg text-muted-foreground">{error}</p>

          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl px-8 py-4 font-semibold"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Studio tier - show full Daily.co video room with cursor overlay
  if (!roomUrl) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
          <p className="text-muted-foreground">Creating video room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <div className="text-center">
        <h3 className="mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-foreground">
          Video Collaboration Room
          {showCursors && cursorsConnected && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
              <MousePointer2 className="h-3 w-3" />
              Cursors Active
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">{projectName}</p>
      </div>

      {/* Daily.co Video Room */}
      <CollaborativeRoom
        roomUrl={roomUrl}
        roomName={projectName}
        userName={user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
      />

      {/* Cursor Control Toggle */}
      <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface-muted p-4">
        <Button
          onClick={() => setShowCursors(!showCursors)}
          variant={showCursors ? 'solid' : 'outline'}
          className="gap-2"
        >
          <MousePointer2 className="h-4 w-4" />
          {showCursors ? 'Cursor Control: ON' : 'Cursor Control: OFF'}
        </Button>
        <p className="max-w-md text-xs text-muted-foreground">
          {showCursors
            ? 'Team members can see your cursor in real-time during screen sharing'
            : 'Enable to show your cursor position to collaborators'}
        </p>
      </div>

      {/* Cursor Overlay (only when enabled) */}
      {showCursors && <CursorOverlay cursors={remoteCursors} />}

      <div className="text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          🎥 Video powered by <strong>Daily.co</strong>
          {showCursors && (
            <>
              • Cursors powered by <strong>Ably</strong>
            </>
          )}
        </p>
        <p className="mt-1 text-xs">
          HD quality • Screen sharing • Recording • Up to 50 participants
        </p>
      </div>
    </div>
  );
}
