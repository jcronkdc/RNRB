'use client';

/**
 * Skeleton Performance Tracking Utilities
 *
 * Monitors skeleton → content transition performance
 * Helps identify slow-loading components and optimize UX
 */

interface SkeletonMetrics {
  componentName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  wasVisible: boolean;
}

class SkeletonPerformanceTracker {
  private metrics: Map<string, SkeletonMetrics> = new Map();
  private enabled: boolean =
    typeof window !== 'undefined' && process.env.NODE_ENV === 'development';

  /**
   * Start tracking a skeleton loading state
   */
  startTracking(componentName: string): void {
    if (!this.enabled) return;

    this.metrics.set(componentName, {
      componentName,
      startTime: performance.now(),
      wasVisible: true,
    });
  }

  /**
   * End tracking and record the transition time
   */
  endTracking(componentName: string): void {
    if (!this.enabled) return;

    const metric = this.metrics.get(componentName);
    if (!metric) {
      console.warn(`[SkeletonTracker] No tracking started for: ${componentName}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log to console in development
    this.logMetric(metric);

    // Send to analytics if configured
    this.sendToAnalytics(metric);
  }

  /**
   * Log metrics to console
   */
  private logMetric(metric: SkeletonMetrics): void {
    const { componentName, duration } = metric;

    if (!duration) return;

    // Color code based on performance
    const color = duration < 200 ? '🟢' : duration < 500 ? '🟡' : '🔴';

    console.log(`${color} Skeleton → Content: ${componentName} took ${duration.toFixed(0)}ms`);

    // Warn if slow
    if (duration > 1000) {
      console.warn(
        `⚠️ Slow skeleton transition detected for ${componentName} (${duration.toFixed(0)}ms)`
      );
    }
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(metric: SkeletonMetrics): void {
    // Only in production with analytics enabled
    if (process.env.NODE_ENV !== 'production') return;

    // Example: Send to your analytics service
    // window.gtag?.('event', 'skeleton_transition', {
    //   component: metric.componentName,
    //   duration: metric.duration,
    //   category: 'performance',
    // });
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): SkeletonMetrics[] {
    return Array.from(this.metrics.values()).filter((m) => m.duration !== undefined);
  }

  /**
   * Get average transition time across all components
   */
  getAverageTransitionTime(): number {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }

  /**
   * Get slowest components
   */
  getSlowestComponents(limit: number = 5): SkeletonMetrics[] {
    return this.getMetrics()
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const avgTime = this.getAverageTransitionTime();
    const slowest = this.getSlowestComponents(3);

    let report = '\n📊 Skeleton Performance Report\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += `Total Transitions: ${metrics.length}\n`;
    report += `Average Time: ${avgTime.toFixed(0)}ms\n\n`;

    if (slowest.length > 0) {
      report += 'Slowest Components:\n';
      slowest.forEach((m, i) => {
        const emoji = i === 0 ? '🔴' : i === 1 ? '🟡' : '🟠';
        report += `${emoji} ${m.componentName}: ${m.duration?.toFixed(0)}ms\n`;
      });
    }

    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    return report;
  }
}

// Singleton instance
const skeletonTracker = new SkeletonPerformanceTracker();

/**
 * React Hook for tracking skeleton performance
 */
export function useSkeletonTracking(componentName: string, isLoading: boolean): void {
  if (typeof window === 'undefined') return;

  // Start tracking when component mounts in loading state
  React.useEffect(() => {
    if (isLoading) {
      skeletonTracker.startTracking(componentName);
    } else {
      skeletonTracker.endTracking(componentName);
    }
  }, [componentName, isLoading]);
}

/**
 * Higher-order component for automatic skeleton tracking
 */
export function withSkeletonTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P & { isLoading?: boolean }> {
  return function TrackedComponent(props: P & { isLoading?: boolean }) {
    const { isLoading = false, ...restProps } = props;

    useSkeletonTracking(componentName, isLoading);

    return <Component {...(restProps as P)} />;
  };
}

/**
 * Utility to manually track skeleton transitions
 */
export const skeletonPerformance = {
  start: (componentName: string) => skeletonTracker.startTracking(componentName),
  end: (componentName: string) => skeletonTracker.endTracking(componentName),
  getReport: () => skeletonTracker.generateReport(),
  logReport: () => console.log(skeletonTracker.generateReport()),
  clear: () => skeletonTracker.clear(),
  getMetrics: () => skeletonTracker.getMetrics(),
  getAverage: () => skeletonTracker.getAverageTransitionTime(),
  getSlowest: (limit?: number) => skeletonTracker.getSlowestComponents(limit),
};

// Development helper: Print report on window
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).skeletonPerformance = skeletonPerformance;
}

// Add React import (will be tree-shaken if not used)
import * as React from 'react';

export default skeletonTracker;
