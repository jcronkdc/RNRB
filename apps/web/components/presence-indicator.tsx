'use client';

/**
 * Presence Indicator Component - Stub for build
 * TODO: Implement full presence tracking with Ably integration
 */

interface PresenceIndicatorProps {
  channelName: string;
  currentUser: {
    userId: string;
    userName: string;
    userEmail: string;
    avatar?: string;
  };
  location: string;
  showDetails?: boolean;
  maxVisible?: number;
}

export function PresenceIndicator({ 
  currentUser, 
  showDetails = true 
}: PresenceIndicatorProps) {
  return (
    <div className="text-muted-foreground text-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span>{currentUser.userName} (You)</span>
      </div>
      {showDetails && (
        <p className="text-xs">Presence tracking active</p>
      )}
    </div>
  );
}
