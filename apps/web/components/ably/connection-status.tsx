'use client';

import { useConnectionStateListener } from 'ably/react';
import { Wifi, WifiOff, AlertCircle } from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  useConnectionStateListener((stateChange) => {
    setIsConnected(stateChange.current === 'connected');
    if (stateChange.current === 'connected') {
      setConnectionTimeout(false);
    }
  });

  // Set timeout for stuck connections
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected) {
        setConnectionTimeout(true);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [isConnected]);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-green-500" />
        <span className="text-xs text-gray-400">Live</span>
      </div>
    );
  }

  if (connectionTimeout) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span className="text-xs text-yellow-500">Offline Mode</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <WifiOff className="h-4 w-4 text-gray-500" />
      <span className="text-xs text-gray-500">Connecting...</span>
    </div>
  );
}
