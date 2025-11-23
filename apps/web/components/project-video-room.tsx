'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Sparkles, ExternalLink, MousePointer2 } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import dynamic from 'next/dynamic';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { CursorOverlay } from '@/components/cursor-overlay';

// Dynamically import Daily.co component (client-side only)
const CollaborativeRoom = dynamic(() => import('@/components/app/CollaborativeRoom'), { ssr: false });

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
        const { data: { user: currentUser } } = await supabase!.auth.getUser();
        
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
          }
        })
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
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Video className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Video Collaboration - Studio Tier
          </h3>
          
          <p className="text-lg text-muted-foreground mb-6">
            Real-time video calls with your band are available on the Studio plan ($29.99/month)
          </p>

          <div className="bg-surface-muted border border-border rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-foreground mb-3">Studio Tier Includes:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground text-left">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited Video Calls:</strong> Collaborate face-to-face with your team</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <span><strong>Screen Sharing + Cursor Control:</strong> Show your DAW, and collaborators see your cursor in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <span><strong>Recording:</strong> Save your sessions for later review</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited Projects:</strong> No limits on your creativity</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited Collaborators:</strong> Bring your whole team</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                <span><strong>100 GB Storage:</strong> Store all your audio files</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => window.location.href = '/settings/subscription'}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Upgrade to Studio
            </Button>
            <Button
              variant="secondary"
              className="px-8 py-4 rounded-xl font-semibold"
              onClick={() => window.open('/pricing', '_blank')}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View All Plans
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            🎸 <strong>Creator Tier ($9.99/mo)</strong> includes AI features and 10 projects.<br />
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
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10 text-red-500" />
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Video Room Error
          </h3>
          
          <p className="text-lg text-muted-foreground mb-6">
            {error}
          </p>

          <Button
            onClick={() => window.location.reload()}
            className="px-8 py-4 rounded-xl font-semibold"
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
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Creating video room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          Video Collaboration Room
          {showCursors && cursorsConnected && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
              <MousePointer2 className="w-3 h-3" />
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
      <div className="flex items-center justify-center gap-3 p-4 bg-surface-muted border border-border rounded-xl">
        <Button
          onClick={() => setShowCursors(!showCursors)}
          variant={showCursors ? 'solid' : 'outline'}
          className="gap-2"
        >
          <MousePointer2 className="w-4 h-4" />
          {showCursors ? 'Cursor Control: ON' : 'Cursor Control: OFF'}
        </Button>
        <p className="text-xs text-muted-foreground max-w-md">
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
        <p className="text-xs mt-1">HD quality • Screen sharing • Recording • Up to 50 participants</p>
      </div>
    </div>
  );
}
