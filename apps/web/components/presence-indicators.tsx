'use client';

/**
 * Presence Indicators Component
 *
 * Shows who's online with rich context:
 * - Status badges (active, idle, away, DND)
 * - Activity descriptions
 * - Real-time participant list
 * - Device/browser icons
 * - Follow user button
 *
 * Integrates with enhanced presence system
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Circle,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  MessageCircle,
  Edit3,
  Headphones,
  Moon,
  Minus,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

import type { PresenceMember } from '@/hooks/use-enhanced-presence';

interface PresenceIndicatorsProps {
  members: PresenceMember[];
  onFollowUser?: (userId: string) => void;
  followingUserId?: string | null;
  className?: string;
}

export function PresenceIndicators({
  members,
  onFollowUser,
  followingUserId,
  className = '',
}: PresenceIndicatorsProps) {
  const [expanded, setExpanded] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-orange-500';
      case 'dnd':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'idle':
        return 'Idle';
      case 'away':
        return 'Away';
      case 'dnd':
        return 'Do Not Disturb';
      default:
        return 'Offline';
    }
  };

  const getActivityIcon = (activity?: string) => {
    if (!activity) return null;

    if (activity.toLowerCase().includes('edit')) {
      return <Edit3 className="h-3 w-3" />;
    }
    if (activity.toLowerCase().includes('listen')) {
      return <Headphones className="h-3 w-3" />;
    }
    if (activity.toLowerCase().includes('view')) {
      return <Eye className="h-3 w-3" />;
    }
    if (activity.toLowerCase().includes('chat') || activity.toLowerCase().includes('message')) {
      return <MessageCircle className="h-3 w-3" />;
    }

    return <Circle className="h-3 w-3" />;
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-3 w-3" />;
      case 'tablet':
        return <Tablet className="h-3 w-3" />;
      default:
        return <Monitor className="h-3 w-3" />;
    }
  };

  if (members.length === 0) {
    return (
      <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
        <div className="text-center">
          <Moon className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No one else is here right now</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invite collaborators to work together
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border bg-surface ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className={`h-2 w-2 animate-pulse rounded-full ${getStatusColor('active')}`} />
            Online Now
          </h3>
          <p className="text-sm text-muted-foreground">
            {members.filter((m) => m.status === 'active').length} active • {members.length} total
          </p>
        </div>
        <Button onClick={() => setExpanded(!expanded)} variant="secondary" size="sm">
          {expanded ? <Minus className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Participants List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[500px] space-y-2 overflow-y-auto p-4">
              {members.map((member) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg border border-border p-3 transition ${
                    followingUserId === member.userId
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'bg-surface-muted hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with status */}
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-foreground">
                        {member.userAvatar ? (
                          <img
                            src={member.userAvatar}
                            alt={member.userName}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          member.userName[0].toUpperCase()
                        )}
                      </div>

                      {/* Status indicator */}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${getStatusColor(member.status)}`}
                        title={getStatusLabel(member.status)}
                      />
                    </div>

                    {/* User info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium text-foreground">
                          {member.userName}
                        </span>

                        {/* Device icon */}
                        <div className="shrink-0 text-muted-foreground">
                          {getDeviceIcon(member.deviceType)}
                        </div>
                      </div>

                      {/* Activity */}
                      {member.activity && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {getActivityIcon(member.activity)}
                          <span className="truncate">{member.activity}</span>
                        </div>
                      )}

                      {/* Viewport info */}
                      {member.viewport && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Viewing: <span className="font-medium">{member.viewport.section}</span>
                        </div>
                      )}

                      {/* Selection info */}
                      {member.selection && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Selected {member.selection.end - member.selection.start} characters
                        </div>
                      )}

                      {/* Follow button */}
                      {onFollowUser && (
                        <Button
                          onClick={() => onFollowUser(member.userId)}
                          variant={followingUserId === member.userId ? 'default' : 'secondary'}
                          size="sm"
                          className="mt-2"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{followingUserId === member.userId ? 'Following' : 'Follow'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
