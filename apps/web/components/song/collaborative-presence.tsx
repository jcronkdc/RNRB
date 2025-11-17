'use client';

import { usePresence } from 'ably/react';
import { Users, Video, MessageSquare, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Collaborative Presence Indicator
 * Shows who's currently editing the song
 * Prevents conflicts by showing active editors
 */

interface CollaborativePresenceProps {
  songId: string;
  currentUserName: string;
  onStartVideo?: () => void;
}

export default function CollaborativePresence({
  songId,
  currentUserName,
  onStartVideo
}: CollaborativePresenceProps) {
  const { presenceData, updateStatus } = usePresence(`rnrb:song:${songId}:presence`, {
    name: currentUserName,
    status: 'viewing',
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color per user
  });

  const activeUsers = presenceData || [];
  const othersEditing = activeUsers.filter((u: any) => u.clientId !== presenceData?.[0]?.clientId);

  return (
    <div className="space-y-3">
      {/* Active Collaborators */}
      <div className="rnrb-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-primary" />
            <span className="font-semibold text-sm">
              {activeUsers.length} {activeUsers.length === 1 ? 'Person' : 'People'} Here
            </span>
          </div>
          {onStartVideo && othersEditing.length > 0 && (
            <button
              onClick={onStartVideo}
              className="px-3 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 rounded text-xs font-semibold text-brand-primary transition-colors"
            >
              <Video className="w-3 h-3 inline mr-1" />
              START VIDEO
            </button>
          )}
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {activeUsers.map((user: any) => (
              <motion.div
                key={user.clientId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-2 bg-surface/30 rounded"
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: user.data?.color || '#c9a961' }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {user.data?.name || 'Anonymous'}
                    {user.clientId === presenceData?.[0]?.clientId && ' (You)'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.data?.status || 'viewing'}
                  </p>
                </div>
                {user.data?.status === 'editing' && (
                  <Eye className="w-4 h-4 text-brand-primary" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Collaboration Mode Indicator */}
      {othersEditing.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rnrb-card bg-brand-primary/5 border-brand-primary/30"
        >
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Collaborative Mode Active</p>
              <p className="text-xs text-muted-foreground">
                Others are viewing this song. Use the <strong>Suggestions workflow</strong> to propose changes, 
                or start a <strong>video session</strong> to discuss edits in real-time.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Updater */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => updateStatus({ status: 'viewing' })}
          className="px-3 py-1.5 bg-surface hover:bg-surface-muted rounded transition-colors"
        >
          Just Viewing
        </button>
        <button
          onClick={() => updateStatus({ status: 'editing' })}
          className="px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded transition-colors"
        >
          Actively Editing
        </button>
      </div>
    </div>
  );
}
