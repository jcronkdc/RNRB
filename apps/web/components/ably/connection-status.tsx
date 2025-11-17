'use client';

import { useConnectionStateListener } from 'ably/react';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const connectionState = useConnectionStateListener();

  if (!connectionState) return null;

  const isConnected = connectionState.current.state === 'connected';

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-xs text-gray-400">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500">Connecting...</span>
        </>
      )}
    </div>
  );
}

