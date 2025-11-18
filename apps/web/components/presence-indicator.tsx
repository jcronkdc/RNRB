'use client';

/**
 * Presence Indicator Component
 * 
 * Shows who's actively working in real-time
 * Displays avatars, status, and activity
 * 
 * Used in: Projects, Songs, Songwriting, Video Rooms
 */

import { usePresence } from '@/hooks/use-presence';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Users, 
  Circle, 
  Eye,
  Music,
  Video,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

type PresenceIndicatorProps = {
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
};

export function PresenceIndicator({ 
  channelName, 
  currentUser, 
  location,
  showDetails = false,
  maxVisible = 5 
}: PresenceIndicatorProps) {
  const { members, isConnected, totalMembers, activeMembers } = usePresence({
    channelName,
    userData: {
      ...currentUser,
      location,
    },
  });

  const [showAll, setShowAll] = useState(false);

  // Filter out current user
  const otherMembers = members.filter(m => m.data.userId !== currentUser.userId);
  const visibleMembers = showAll ? otherMembers : otherMembers.slice(0, maxVisible);
  const hiddenCount = otherMembers.length - visibleMembers.length;

  if (!isConnected || otherMembers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="w-4 h-4" />
        <span>Just you</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar Stack */}
      <div className="flex items-center -space-x-2">
        <AnimatePresence mode="popLayout">
          {visibleMembers.map((member, index) => (
            <motion.div
              key={member.data.userId}
              initial={{ opacity: 0, scale: 0, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
              title={`${member.data.userName} (${member.data.status})`}
            >
              {/* Avatar Circle */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 relative"
                style={{
                  background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
                  borderColor: member.data.status === 'active' 
                    ? '#22c55e' 
                    : member.data.status === 'idle' 
                    ? '#eab308' 
                    : '#64748b',
                  color: 'white',
                }}
              >
                {member.data.avatar ? (
                  <img 
                    src={member.data.avatar} 
                    alt={member.data.userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="uppercase">
                    {member.data.userName.slice(0, 2)}
                  </span>
                )}

                {/* Status Indicator */}
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
                  style={{
                    backgroundColor: member.data.status === 'active' 
                      ? '#22c55e' 
                      : member.data.status === 'idle' 
                      ? '#eab308' 
                      : '#64748b'
                  }}
                />
              </div>
            </motion.div>
          ))}

          {/* Show more indicator */}
          {hiddenCount > 0 && !showAll && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowAll(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-border bg-muted hover:bg-muted/80 transition-colors"
              title={`${hiddenCount} more`}
            >
              +{hiddenCount}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Status Text */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Users className="w-4 h-4 text-green-500" />
            {isConnected && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-sm font-medium">
            {activeMembers} active
          </span>
        </div>

        {showDetails && (
          <span className="text-xs text-muted-foreground">
            · {totalMembers} total
          </span>
        )}
      </div>

      {/* Detailed View (Optional) */}
      {showDetails && otherMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="absolute top-full left-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[250px]"
        >
          <div className="space-y-2">
            {otherMembers.map((member) => (
              <div 
                key={member.data.userId}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Avatar */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium relative shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
                    color: 'white',
                  }}
                >
                  {member.data.avatar ? (
                    <img 
                      src={member.data.avatar} 
                      alt={member.data.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="uppercase">
                      {member.data.userName.slice(0, 2)}
                    </span>
                  )}

                  {/* Status dot */}
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card"
                    style={{
                      backgroundColor: member.data.status === 'active' 
                        ? '#22c55e' 
                        : member.data.status === 'idle' 
                        ? '#eab308' 
                        : '#64748b'
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.data.userName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {member.data.status}
                  </p>
                </div>

                {/* Activity indicator */}
                <div className="shrink-0">
                  {member.data.location.includes('video') ? (
                    <Video className="w-4 h-4 text-purple-500" />
                  ) : member.data.location.includes('chat') ? (
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  ) : member.data.location.includes('song') ? (
                    <Music className="w-4 h-4 text-green-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Compact Presence Dot
 * Shows just a pulsing indicator with count
 */
export function PresenceDot({ 
  channelName, 
  currentUser, 
  location 
}: Omit<PresenceIndicatorProps, 'showDetails' | 'maxVisible'>) {
  const { totalMembers, isConnected } = usePresence({
    channelName,
    userData: {
      ...currentUser,
      location,
    },
  });

  if (!isConnected || totalMembers === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5"
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-green-500"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs text-muted-foreground">
        {totalMembers} online
      </span>
    </motion.div>
  );
}

