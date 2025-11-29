'use client';

import type * as Ably from 'ably';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface ConnectionQualityMonitorProps {
  client: Ably.Realtime | null;
  showDetails?: boolean;
}

type QualityLevel = 'excellent' | 'good' | 'poor' | 'offline';

interface QualityMetrics {
  level: QualityLevel;
  latency: number;
  reconnectAttempts: number;
  lastPing: number | null;
  connectionState: string;
  uptime: number; // seconds
}

export function ConnectionQualityMonitor({
  client,
  showDetails = false,
}: ConnectionQualityMonitorProps) {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    level: 'offline',
    latency: 0,
    reconnectAttempts: 0,
    lastPing: null,
    connectionState: 'initialized',
    uptime: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const connectedAtRef = useState<number | null>(null);

  // Measure connection quality
  const measureQuality = useCallback(async () => {
    if (!client) return;

    try {
      const start = Date.now();

      // Ping the server using connection state check
      const state = client.connection.state;
      const latency = Date.now() - start;

      let level: QualityLevel = 'excellent';
      if (state !== 'connected') {
        level = 'offline';
      } else if (latency > 500) {
        level = 'poor';
      } else if (latency > 200) {
        level = 'good';
      }

      // Calculate uptime
      const uptime = connectedAtRef[0] ? Math.floor((Date.now() - connectedAtRef[0]) / 1000) : 0;

      setMetrics({
        level,
        latency,
        reconnectAttempts: metrics.reconnectAttempts,
        lastPing: Date.now(),
        connectionState: state,
        uptime,
      });
    } catch (error) {
      setMetrics((prev) => ({
        ...prev,
        level: 'offline',
        connectionState: 'failed',
      }));
    }
  }, [client, metrics.reconnectAttempts]);

  // Monitor connection events
  useEffect(() => {
    if (!client) return;

    const handleConnected = () => {
      connectedAtRef[1](Date.now());
      setMetrics((prev) => ({
        ...prev,
        level: 'good',
        connectionState: 'connected',
        reconnectAttempts: 0,
      }));
    };

    const handleDisconnected = () => {
      setMetrics((prev) => ({
        ...prev,
        level: 'poor',
        connectionState: 'disconnected',
      }));
    };

    const handleSuspended = () => {
      setMetrics((prev) => ({
        ...prev,
        level: 'poor',
        connectionState: 'suspended',
      }));
    };

    const handleFailed = () => {
      setMetrics((prev) => ({
        ...prev,
        level: 'offline',
        connectionState: 'failed',
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
      connectedAtRef[1](null);
    };

    client.connection.on('connected', handleConnected);
    client.connection.on('disconnected', handleDisconnected);
    client.connection.on('suspended', handleSuspended);
    client.connection.on('failed', handleFailed);

    // Initial state
    if (client.connection.state === 'connected') {
      handleConnected();
    }

    // Periodic quality checks every 10 seconds
    const interval = setInterval(measureQuality, 10000);

    return () => {
      client.connection.off('connected', handleConnected);
      client.connection.off('disconnected', handleDisconnected);
      client.connection.off('suspended', handleSuspended);
      client.connection.off('failed', handleFailed);
      clearInterval(interval);
    };
  }, [client, measureQuality]);

  // Don't show if offline and not showing details
  if (metrics.level === 'offline' && !showDetails) {
    return null;
  }

  const getStatusColor = (level: QualityLevel) => {
    switch (level) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'poor':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
    }
  };

  const getStatusIcon = (level: QualityLevel) => {
    switch (level) {
      case 'excellent':
      case 'good':
        return <Wifi className="h-4 w-4" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed right-4 top-20 z-50"
    >
      <div
        className={`cursor-pointer rounded-lg border border-border bg-surface/95 p-2 shadow-lg backdrop-blur-sm transition-all ${
          isExpanded ? 'w-64' : 'w-auto'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={getStatusColor(metrics.level)}>{getStatusIcon(metrics.level)}</div>

          {!isExpanded && (
            <span className="text-xs font-medium text-muted-foreground">
              {metrics.level === 'offline' ? 'Offline' : `${metrics.latency}ms`}
            </span>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-1 text-xs text-muted-foreground"
            >
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium capitalize">{metrics.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="font-medium">{metrics.latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium">{formatUptime(metrics.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reconnects:</span>
                <span className="font-medium">{metrics.reconnectAttempts}</span>
              </div>
              {metrics.lastPing && (
                <div className="flex justify-between text-[10px] text-muted-foreground/60">
                  <span>Last ping:</span>
                  <span>{new Date(metrics.lastPing).toLocaleTimeString()}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
