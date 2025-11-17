'use client';

import { usePresence } from 'ably/react';
import { Users, Circle } from 'lucide-react';

interface ProjectPresenceProps {
  channelName: string;
}

export default function ProjectPresence({ channelName }: ProjectPresenceProps) {
  const { presenceData } = usePresence(channelName);

  return (
    <div className="space-y-3">
      {presenceData && presenceData.length > 0 ? (
        presenceData.map((member: any) => (
          <div
            key={member.clientId}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
            <div>
              <p className="font-medium text-sm">
                {member.data?.userName || member.clientId}
              </p>
              {member.data?.userEmail && (
                <p className="text-xs text-muted-foreground">
                  {member.data.userEmail}
                </p>
              )}
            </div>
            <span className="ml-auto text-xs text-muted-foreground">
              Active now
            </span>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 opacity-20 mb-3" />
          <p className="text-sm">No collaborators online right now</p>
          <p className="text-xs mt-1">Invite members to start collaborating!</p>
        </div>
      )}
    </div>
  );
}

