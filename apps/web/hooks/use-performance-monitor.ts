/**
 * Performance Monitoring Hook
 *
 * Tracks and reports performance metrics for collaborative features
 * Helps identify bottlenecks and optimization opportunities
 *
 * Metrics tracked:
 * - Component render time
 * - Network latency
 * - Memory usage
 * - FPS (frames per second)
 * - User interactions
 * - Real-time sync performance
 *
 * Usage:
 * const { trackEvent, metrics } = usePerformanceMonitor('ComponentName');
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderCount: number;
  avgRenderTime: number;
  fps: number;
  memoryUsage: number; // MB
  eventCount: number;
  slowRenders: number; // >16ms
}

interface PerformanceEvent {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    componentName,
    renderCount: 0,
    avgRenderTime: 0,
    fps: 60,
    memoryUsage: 0,
    eventCount: 0,
    slowRenders: 0,
  });

  const renderStartRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);
  const eventsRef = useRef<PerformanceEvent[]>([]);
  const fpsFramesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Track render performance
  useEffect(() => {
    renderStartRef.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartRef.current;

      renderTimesRef.current.push(renderTime);

      // Keep only last 100 renders
      if (renderTimesRef.current.length > 100) {
        renderTimesRef.current.shift();
      }

      const avgRenderTime =
        renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

      const slowRenders = renderTimesRef.current.filter((t) => t > 16).length;

      setMetrics((prev) => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        avgRenderTime,
        slowRenders,
      }));

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(
          `[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (target: <16ms)`
        );
      }
    };
  });

  // Track FPS
  useEffect(() => {
    let rafId: number;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (delta > 0) {
        fpsFramesRef.current.push(1000 / delta);

        // Keep only last 60 frames
        if (fpsFramesRef.current.length > 60) {
          fpsFramesRef.current.shift();
        }

        const avgFps =
          fpsFramesRef.current.reduce((a, b) => a + b, 0) / fpsFramesRef.current.length;

        setMetrics((prev) => ({
          ...prev,
          fps: Math.round(avgFps),
        }));
      }

      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Track memory usage (if available)
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;

        setMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(usedMB),
        }));

        // Warn on high memory usage (>500MB)
        if (process.env.NODE_ENV === 'development' && usedMB > 500) {
          console.warn(
            `[Performance] High memory usage in ${componentName}: ${usedMB.toFixed(2)}MB`
          );
        }
      }
    };

    // Check memory every 5 seconds
    const interval = setInterval(measureMemory, 5000);
    measureMemory(); // Initial measurement

    return () => clearInterval(interval);
  }, [componentName]);

  // Track custom events
  const trackEvent = useCallback(
    (eventName: string, metadata?: Record<string, any>) => {
      const startTime = performance.now();

      return () => {
        const duration = performance.now() - startTime;

        const event: PerformanceEvent = {
          name: eventName,
          duration,
          timestamp: Date.now(),
          metadata,
        };

        eventsRef.current.push(event);

        // Keep only last 100 events
        if (eventsRef.current.length > 100) {
          eventsRef.current.shift();
        }

        setMetrics((prev) => ({
          ...prev,
          eventCount: prev.eventCount + 1,
        }));

        // Log slow events in development
        if (process.env.NODE_ENV === 'development' && duration > 100) {
          console.warn(
            `[Performance] Slow event in ${componentName}: ${eventName} took ${duration.toFixed(2)}ms`,
            metadata
          );
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
          // Could integrate with analytics service here
          (window as any).__performanceMetrics = (window as any).__performanceMetrics || [];
          (window as any).__performanceMetrics.push({
            component: componentName,
            event: eventName,
            duration,
            timestamp: Date.now(),
            ...metadata,
          });
        }
      };
    },
    [componentName]
  );

  // Get performance report
  const getReport = useCallback(() => {
    const recentEvents = eventsRef.current.slice(-20);
    const slowEvents = recentEvents.filter((e) => e.duration > 100);

    return {
      metrics,
      recentEvents,
      slowEvents,
      recommendations: generateRecommendations(metrics),
    };
  }, [metrics]);

  // Expose metrics to window for debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__performanceMetrics = (window as any).__performanceMetrics || {};
      (window as any).__performanceMetrics[componentName] = {
        ...metrics,
        getReport,
      };
    }
  }, [componentName, metrics, getReport]);

  return {
    metrics,
    trackEvent,
    getReport,
  };
}

function generateRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.slowRenders > 10) {
    recommendations.push(
      `High number of slow renders (${metrics.slowRenders}). Consider using React.memo or useMemo.`
    );
  }

  if (metrics.avgRenderTime > 16) {
    recommendations.push(
      `Average render time is ${metrics.avgRenderTime.toFixed(2)}ms (target: <16ms). Optimize render logic.`
    );
  }

  if (metrics.fps < 50) {
    recommendations.push(
      `Low FPS (${metrics.fps}). Check for layout thrashing or heavy computations.`
    );
  }

  if (metrics.memoryUsage > 300) {
    recommendations.push(
      `High memory usage (${metrics.memoryUsage}MB). Look for memory leaks or unnecessary data retention.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance looks good! 🚀');
  }

  return recommendations;
}
