'use client';

/**
 * Presence Indicator Component - FULLY WIRED
 * Shows real-time presence tracking with Ably integration
 *
 * Note: Wrapped in error boundary to gracefully handle missing ChannelProvider
 */

import { ChannelProvider } from 'ably/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Circle } from 'lucide-react';
import { Component, type ReactNode } from 'react';

import { usePresence } from '@/hooks/use-presence';

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

// Error boundary to catch ChannelProvider errors gracefully
class PresenceErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Silently log the error - this is expected when Ably isn't connected
    if (process.env.NODE_ENV === 'development') {
      console.warn('Presence unavailable:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Circle className="h-2 w-2 text-zinc-500" />
              <span>Presence offline</span>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// Inner component that uses the presence hook
function PresenceIndicatorInner({
  channelName,
  currentUser,
  location,
  showDetails = true,
  maxVisible = 10,
}: PresenceIndicatorProps) {
  const { members, isConnected, error, activeMembers, idleMembers } = usePresence({
    channelName,
    userData: {
      ...currentUser,
      location,
    },
  });

  // Filter out current user from display
  const otherMembers = members.filter((m) => m.data.userId !== currentUser.userId);
  const displayMembers = otherMembers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, otherMembers.length - maxVisible);

  if (error) {
    return (
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Circle className="h-2 w-2 text-red-500" />
          <span>Presence offline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <motion.div
          className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}
          animate={isConnected ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {isConnected ? `${activeMembers} active` : 'Connecting...'}
        </span>
      </div>

      {/* Members List */}
      <AnimatePresence mode="popLayout">
        {displayMembers.map((member) => (
          <motion.div
            key={member.clientId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2"
          >
            {/* Avatar or Icon */}
            {member.data.avatar ? (
              <img
                src={member.data.avatar}
                alt={member.data.userName}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded-full">
                <User className="text-primary h-3 w-3" />
              </div>
            )}

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{member.data.userName}</p>
              {showDetails && (
                <p className="truncate text-xs text-muted-foreground">
                  {member.data.status === 'active' ? '🟢 Active' : '🟡 Idle'}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hidden Count */}
      {hiddenCount > 0 && (
        <p className="text-xs text-muted-foreground">
          + {hiddenCount} more {hiddenCount === 1 ? 'person' : 'people'}
        </p>
      )}

      {/* You Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 border-t border-border/50 pt-2"
      >
        {currentUser.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.userName}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="bg-primary/30 flex h-6 w-6 items-center justify-center rounded-full">
            <User className="text-primary h-3 w-3" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {currentUser.userName} <span className="text-xs text-muted-foreground">(You)</span>
          </p>
        </div>
      </motion.div>

      {/* Summary (if details enabled) */}
      {showDetails && isConnected && (
        <div className="space-y-1 pt-2 text-xs text-muted-foreground">
          <p>
            📊 {activeMembers} active, {idleMembers} idle
          </p>
          <p>🍄 Mycelial network connected</p>
        </div>
      )}
    </div>
  );
}

// Main exported component - wraps with ChannelProvider and error boundary
export function PresenceIndicator(props: PresenceIndicatorProps) {
  return (
    <PresenceErrorBoundary>
      <ChannelProvider channelName={props.channelName}>
        <PresenceIndicatorInner {...props} />
      </ChannelProvider>
    </PresenceErrorBoundary>
  );
}
