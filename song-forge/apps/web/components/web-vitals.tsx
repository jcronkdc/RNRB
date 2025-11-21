'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can send to your analytics service here
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });

      // Example: Send to Vercel Analytics (automatically handled)
      // Or send to your own endpoint
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/vitals', body);
      } else {
        fetch('/api/vitals', {
          body,
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(console.error);
      }
    }
  });

  // Log initial page load performance
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation && process.env.NODE_ENV === 'development') {
        const metrics = {
          'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
          'TCP Connection': navigation.connectEnd - navigation.connectStart,
          'TLS Setup': navigation.connectEnd - navigation.secureConnectionStart,
          'Request Time': navigation.responseStart - navigation.requestStart,
          'Response Time': navigation.responseEnd - navigation.responseStart,
          'DOM Interactive': navigation.domInteractive - navigation.responseEnd,
          'DOM Complete': navigation.domComplete - navigation.domInteractive,
          'Total Load Time': navigation.loadEventEnd - navigation.fetchStart,
        };

        console.table(metrics);
      }
    }
  }, []);

  return null;
}




