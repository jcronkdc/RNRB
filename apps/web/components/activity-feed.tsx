'use client';

/**
 * Activity Feed Component - Stub for build
 * TODO: Implement full activity feed with Ably integration
 */

export function ActivityFeed({ 
  channelName, 
  showHeader = true, 
  maxHeight = '500px' 
}: { 
  channelName: string; 
  showHeader?: boolean; 
  maxHeight?: string;
}) {
  return (
    <div style={{ maxHeight }} className="text-muted-foreground text-sm">
      <p>Activity feed coming soon...</p>
      <p className="text-xs mt-2">Channel: {channelName}</p>
    </div>
  );
}

export function CompactActivityFeed({ channelName }: { channelName: string }) {
  return (
    <div className="text-muted-foreground text-sm">
      <p>No recent activity</p>
      <p className="text-xs mt-2">Check back later for updates</p>
    </div>
  );
}
