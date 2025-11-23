'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@cronkwaters/ui';

interface ProjectVideoRoomProps {
  projectSlug: string;
  projectName: string;
}

export function ProjectVideoRoom({ projectSlug, projectName }: ProjectVideoRoomProps) {
  const [isStudioTier, setIsStudioTier] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase!.auth.getUser();
        
        if (!user) return;
        
        // Check if user has Studio tier subscription
        const response = await fetch(`/api/user/subscription?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsStudioTier(data.tier === 'studio');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

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
                <span><strong>Screen Sharing:</strong> Show your DAW, lyrics, or chord charts</span>
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

  // Studio tier - show video room (simplified version, full Daily.co integration would be more complex)
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">Video Collaboration Room</h3>
        <p className="text-sm text-muted-foreground">{projectName}</p>
      </div>

      {/* Video Area - Placeholder for Daily.co embed */}
      <div className="bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Video room ready</p>
            <p className="text-sm text-gray-500">
              Daily.co integration will be initialized here
            </p>
            <p className="text-xs text-gray-600 mt-4">
              Requires DAILY_API_KEY environment variable
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="secondary" className="rounded-full w-12 h-12 p-0">
          <Mic className="w-5 h-5" />
        </Button>
        <Button variant="secondary" className="rounded-full w-12 h-12 p-0">
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="secondary" className="rounded-full w-12 h-12 p-0 bg-red-500 hover:bg-red-600 text-white">
          <PhoneOff className="w-5 h-5" />
        </Button>
        <Button variant="secondary" className="rounded-full w-12 h-12 p-0">
          <Users className="w-5 h-5" />
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>🎥 Video calls powered by Daily.co</p>
        <p className="text-xs mt-1">HD quality • Screen sharing • Recording</p>
      </div>
    </div>
  );
}
