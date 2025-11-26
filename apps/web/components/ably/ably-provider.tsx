'use client';

import * as Ably from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  lazy?: boolean;
}

interface ConnectionMetrics {
  latency: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  reconnectAttempts: number;
  lastConnected: number | null;
}

// Exponential backoff configuration
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 15000]; // ms
const MAX_RETRIES = 5;
const CONNECTION_TIMEOUT = 15000; // 15s

export function AblyProvider({ children, lazy = true }: Props) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const [shouldInit, setShouldInit] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    quality: 'offline',
    reconnectAttempts: 0,
    lastConnected: null,
  });
  
  // Use ref to track lastConnected without causing re-initialization
  // This prevents the cycle: metrics update → initializeAbly re-runs → new client → repeat
  const lastConnectedRef = useRef<number | null>(null);
  
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  // Measure connection quality
  const measureLatency = useCallback(async (ablyClient: Ably.Realtime) => {
    try {
      const start = Date.now();
      await ablyClient.stats();
      const latency = Date.now() - start;
      
      let quality: ConnectionMetrics['quality'] = 'excellent';
      if (latency > 500) quality = 'poor';
      else if (latency > 200) quality = 'good';
      
      const now = Date.now();
      lastConnectedRef.current = now; // Update ref
      
      setMetrics(prev => ({
        ...prev,
        latency,
        quality,
        lastConnected: now,
      }));
    } catch (error) {
      setMetrics(prev => ({ ...prev, quality: 'offline' }));
    }
  }, []);

  // Initialize Ably with retry logic
  const initializeAbly = useCallback(async (attemptNum: number = 0): Promise<void> => {
    if (!isAuthenticated || !session?.user?.id) return;
    
    // Check if we've exceeded max retries
    if (attemptNum >= MAX_RETRIES) {
      console.warn(`Ably: Max retries (${MAX_RETRIES}) exceeded - disabling real-time features`);
      setHasError(true);
      setMetrics(prev => ({ ...prev, quality: 'offline' }));
      return;
    }

    // Apply exponential backoff for retries
    if (attemptNum > 0) {
      const delay = RETRY_DELAYS[Math.min(attemptNum - 1, RETRY_DELAYS.length - 1)];
      console.log(`Ably: Retry attempt ${attemptNum}/${MAX_RETRIES} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return new Promise((resolve) => {
      let isResolved = false;
      
      const connectionTimeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          console.warn(`Ably: Connection timeout (attempt ${attemptNum + 1}/${MAX_RETRIES})`);
          setRetryCount(attemptNum + 1);
          setMetrics(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
          
          // Retry with exponential backoff
          initializeAbly(attemptNum + 1).then(resolve);
        }
      }, CONNECTION_TIMEOUT);

      try {
        const ablyClient = new Ably.Realtime({
          authUrl: '/api/ably/token',
          authMethod: 'GET',
          clientId: session?.user?.id || 'anonymous',
          echoMessages: false,
          // FIX: closeOnUnload and recover() are mutually exclusive
          // Use recover() for better connection persistence
          closeOnUnload: false,
          // Optimized transport params
          transportParams: {
            remainPresentFor: 30, // Reduced from 60 for faster cleanup
          },
          // Add disconnection handling
          disconnectedRetryTimeout: 3000,
          suspendedRetryTimeout: 6000,
          // Performance optimizations
          autoConnect: true,
          recover: (lastConnectionDetails, cb) => {
            // Try to recover connection if possible
            // Use ref to avoid closure over metrics state which would cause re-initialization
            if (lastConnectionDetails && Date.now() - (lastConnectedRef.current || 0) < 120000) {
              cb(true);
            } else {
              cb(false);
            }
          },
        });

        // Connection successful
        ablyClient.connection.once('connected', () => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(connectionTimeout);
            console.log(`Ably: Connected successfully ${attemptNum > 0 ? `(after ${attemptNum} retries)` : ''}`);
            
            const now = Date.now();
            lastConnectedRef.current = now; // Update ref
            
            setClient(ablyClient);
            setHasError(false);
            setRetryCount(0);
            setMetrics(prev => ({
              ...prev,
              quality: 'good',
              lastConnected: now,
            }));
            
            // Measure initial latency
            measureLatency(ablyClient);
            
            // Periodic quality checks (every 30s)
            const qualityCheck = setInterval(() => {
              if (ablyClient.connection.state === 'connected') {
                measureLatency(ablyClient);
              }
            }, 30000);
            
            // Cleanup quality checks on disconnect
            ablyClient.connection.once('closed', () => clearInterval(qualityCheck));
            
            resolve();
          }
        });

        // Handle connection failures
        ablyClient.connection.on('failed', () => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(connectionTimeout);
            console.warn(`Ably: Connection failed (attempt ${attemptNum + 1}/${MAX_RETRIES})`);
            
            setMetrics(prev => ({ ...prev, quality: 'offline', reconnectAttempts: prev.reconnectAttempts + 1 }));
            ablyClient.close();
            
            // Retry
            initializeAbly(attemptNum + 1).then(resolve);
          }
        });

        // Monitor disconnections
        ablyClient.connection.on('disconnected', () => {
          console.warn('Ably: Disconnected - will auto-reconnect');
          setMetrics(prev => ({ ...prev, quality: 'poor' }));
        });

        // Monitor suspensions
        ablyClient.connection.on('suspended', () => {
          console.warn('Ably: Connection suspended - attempting to recover');
          setMetrics(prev => ({ ...prev, quality: 'poor' }));
        });

        // Monitor reconnections
        ablyClient.connection.on('connecting', () => {
          console.log('Ably: Reconnecting...');
        });

      } catch (error) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(connectionTimeout);
          console.error(`Ably: Initialization error (attempt ${attemptNum + 1}/${MAX_RETRIES}):`, error);
          
          setMetrics(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
          
          // Retry
          initializeAbly(attemptNum + 1).then(resolve);
        }
      }
    });
  }, [isAuthenticated, session?.user?.id, measureLatency]);
  // Note: metrics.lastConnected removed from dependencies to prevent infinite re-initialization
  // We use lastConnectedRef instead to read the value without causing re-renders

  // Initialize Ably when ready
  useEffect(() => {
    if (typeof window === 'undefined' || !shouldInit || !isAuthenticated || !session?.user?.id) {
      return;
    }

    let mounted = true;
    
    initializeAbly(0).catch(error => {
      console.error('Ably: Fatal initialization error:', error);
      if (mounted) {
        setHasError(true);
        setMetrics(prev => ({ ...prev, quality: 'offline' }));
      }
    });

    return () => {
      mounted = false;
      if (client) {
        client.close();
        setClient(null);
      }
    };
  }, [shouldInit, isAuthenticated, session?.user?.id, initializeAbly]);

  // Lazy initialization with interaction detection
  useEffect(() => {
    if (!lazy || shouldInit || !isAuthenticated) return;

    // Initialize on first user interaction (optimized)
    const handleInteraction = () => {
      setShouldInit(true);
    };

    // Listen for any user interaction
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleInteraction, { once: true, passive: true }));

    // Fallback: initialize after 2 seconds if no interaction
    const timer = setTimeout(() => setShouldInit(true), 2000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleInteraction));
      clearTimeout(timer);
    };
  }, [lazy, shouldInit, isAuthenticated]);

  // Expose metrics to window for debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__ablyMetrics = metrics;
    }
  }, [metrics]);

  // Always render children immediately - don't block app
  if (!client || hasError) {
    return <>{children}</>;
  }

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}
