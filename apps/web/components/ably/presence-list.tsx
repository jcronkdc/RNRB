'use client';

import { usePresence } from 'ably/react';
import { Circle } from 'lucide-react';

interface PresenceListProps {
  channelName: string;
}

export function PresenceList({ channelName }: PresenceListProps) {
  const { presenceData } = usePresence(channelName);

  if (!presenceData || presenceData.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Online Users</h3>
        <p className="text-sm text-gray-500">No users online</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">
        Online Users ({presenceData.length})
      </h3>
      <ul className="space-y-2">
        {presenceData.map((member) => (
          <li key={member.clientId} className="flex items-center gap-2 text-sm">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            <span className="text-white">{member.data?.name || member.clientId}</span>
            {member.data?.status && (
              <span className="text-xs text-gray-500">({member.data.status})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
