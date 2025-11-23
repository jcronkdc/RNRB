/**
 * Collaboration Error Tracker
 * 
 * Centralized error tracking for all Ably real-time features
 * Monitors connection status, logs errors, provides user feedback
 * 
 * Features:
 * - Connection health monitoring
 * - Error rate tracking
 * - Automatic reconnection attempts
 * - User-friendly error messages
 */

import { useEffect, useState, useCallback } from 'react';

type CollaborationError = {
  id: string;
  timestamp: number;
  feature: 'cursors' | 'suggestions' | 'presence' | 'chat' | 'setlist' | 'settings' | 'team';
  error: string;
  severity: 'warning' | 'error' | 'critical';
};

type ConnectionStatus = {
  cursors: boolean;
  suggestions: boolean;
  presence: boolean;
  chat: boolean;
};

export function useCollaborationErrorTracking() {
  const [errors, setErrors] = useState<CollaborationError[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    cursors: false,
    suggestions: false,
    presence: false,
    chat: false,
  });
  const [lastReconnectAttempt, setLastReconnectAttempt] = useState<number>(0);
  const [reconnectCount, setReconnectCount] = useState(0);

  // Track error
  const trackError = useCallback((
    feature: CollaborationError['feature'],
    error: string,
    severity: CollaborationError['severity'] = 'error'
  ) => {
    const newError: CollaborationError = {
      id: `${feature}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      feature,
      error,
      severity,
    };

    setErrors(prev => [...prev, newError].slice(-20)); // Keep last 20 errors

    // Log to console for debugging
    console.error(`[Collaboration ${severity.toUpperCase()}] ${feature}:`, error);

    // Send to monitoring service (if configured)
    if (typeof window !== 'undefined' && (window as any).logRocket) {
      (window as any).logRocket.captureException(new Error(`Collaboration ${feature}: ${error}`));
    }
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback((
    feature: keyof ConnectionStatus,
    isConnected: boolean
  ) => {
    setConnectionStatus(prev => ({
      ...prev,
      [feature]: isConnected,
    }));

    if (!isConnected) {
      trackError(feature, 'Connection lost', 'warning');
    }
  }, [trackError]);

  // Attempt reconnection
  const attemptReconnect = useCallback(() => {
    const now = Date.now();
    
    // Prevent too frequent reconnect attempts (min 5 seconds between attempts)
    if (now - lastReconnectAttempt < 5000) {
      return;
    }

    setLastReconnectAttempt(now);
    setReconnectCount(prev => prev + 1);

    // Emit reconnect event for hooks to listen to
    window.dispatchEvent(new CustomEvent('collaboration-reconnect'));
  }, [lastReconnectAttempt]);

  // Auto-reconnect if all connections are down
  useEffect(() => {
    const allDisconnected = Object.values(connectionStatus).every(status => !status);
    
    if (allDisconnected && reconnectCount < 3) {
      const timer = setTimeout(() => {
        attemptReconnect();
      }, 10000); // Try reconnecting after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [connectionStatus, reconnectCount, attemptReconnect]);

  // Get error rate (errors per minute)
  const getErrorRate = useCallback(() => {
    const oneMinuteAgo = Date.now() - 60000;
    return errors.filter(e => e.timestamp > oneMinuteAgo).length;
  }, [errors]);

  // Get health score (0-100)
  const getHealthScore = useCallback(() => {
    const connectedCount = Object.values(connectionStatus).filter(Boolean).length;
    const totalFeatures = Object.keys(connectionStatus).length;
    const connectionScore = (connectedCount / totalFeatures) * 100;

    const errorRate = getErrorRate();
    const errorPenalty = Math.min(errorRate * 10, 50); // Max 50% penalty from errors

    return Math.max(0, Math.round(connectionScore - errorPenalty));
  }, [connectionStatus, getErrorRate]);

  // Get user-friendly status message
  const getStatusMessage = useCallback(() => {
    const healthScore = getHealthScore();
    
    if (healthScore >= 90) return 'All collaboration features working perfectly';
    if (healthScore >= 70) return 'Minor connection issues detected';
    if (healthScore >= 50) return 'Some collaboration features may be slow';
    if (healthScore >= 30) return 'Collaboration features experiencing issues';
    return 'Collaboration unavailable - check your internet connection';
  }, [getHealthScore]);

  // Clear old errors (keep last hour)
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      setErrors(prev => prev.filter(e => e.timestamp > oneHourAgo));
    }, 60000); // Clean up every minute

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    errors,
    connectionStatus,
    reconnectCount,
    
    // Actions
    trackError,
    updateConnectionStatus,
    attemptReconnect,
    
    // Computed
    errorRate: getErrorRate(),
    healthScore: getHealthScore(),
    statusMessage: getStatusMessage(),
    
    // Flags
    hasErrors: errors.length > 0,
    hasCriticalErrors: errors.some(e => e.severity === 'critical'),
    isHealthy: getHealthScore() >= 70,
  };
}

/**
 * Error Display Component
 */
export function CollaborationErrorBanner({
  errors,
  healthScore,
  statusMessage,
  onDismiss,
}: {
  errors: CollaborationError[];
  healthScore: number;
  statusMessage: string;
  onDismiss?: () => void;
}) {
  if (errors.length === 0) return null;

  const latestError = errors[errors.length - 1];
  const criticalErrors = errors.filter(e => e.severity === 'critical');

  return (
    <div className={`p-4 rounded-xl border-2 ${
      healthScore >= 70
        ? 'bg-yellow-500/10 border-yellow-500/30'
        : 'bg-red-500/10 border-red-500/30'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${
              healthScore >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {statusMessage}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-muted text-xs font-medium">
              Health: {healthScore}%
            </span>
          </div>
          
          {latestError && (
            <p className="text-xs text-muted-foreground mt-2">
              {latestError.feature}: {latestError.error}
            </p>
          )}

          {criticalErrors.length > 0 && (
            <p className="text-xs text-red-400 mt-2 font-medium">
              {criticalErrors.length} critical {criticalErrors.length === 1 ? 'error' : 'errors'} detected
            </p>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Simple X icon component if not imported
function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

