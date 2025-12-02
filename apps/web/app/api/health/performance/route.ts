import { NextResponse } from 'next/server';

/**
 * Performance Health Check Endpoint
 *
 * Tests internal server performance and returns timing data.
 * Access at: https://www.cronkwaters.com/api/health/performance
 *
 * This can be called from external monitoring services like:
 * - UptimeRobot
 * - Pingdom
 * - loader.io
 */

interface PerformanceResult {
  timestamp: string;
  serverTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  checks: {
    name: string;
    duration: number;
    status: 'ok' | 'error';
    message?: string;
  }[];
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    totalDuration: number;
  };
}

export async function GET() {
  const startTime = performance.now();
  const checks: PerformanceResult['checks'] = [];

  // Check 1: Basic computation performance
  const computeStart = performance.now();
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += Math.sqrt(i);
  }
  const computeTime = performance.now() - computeStart;
  checks.push({
    name: 'cpu_compute',
    duration: Math.round(computeTime * 100) / 100,
    status: computeTime < 100 ? 'ok' : 'error',
    message: computeTime < 100 ? 'CPU compute normal' : 'CPU compute slow',
  });

  // Check 2: Memory availability
  const memCheck = process.memoryUsage();
  const heapUsedMB = Math.round(memCheck.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memCheck.heapTotal / 1024 / 1024);
  const heapUsagePercent = (memCheck.heapUsed / memCheck.heapTotal) * 100;

  checks.push({
    name: 'memory',
    duration: 0,
    status: heapUsagePercent < 85 ? 'ok' : 'error',
    message: `${heapUsedMB}MB / ${heapTotalMB}MB (${Math.round(heapUsagePercent)}%)`,
  });

  // Check 3: Date/timezone
  const dateStart = performance.now();
  const now = new Date();
  const iso = now.toISOString();
  const dateTime = performance.now() - dateStart;
  checks.push({
    name: 'datetime',
    duration: Math.round(dateTime * 100) / 100,
    status: dateTime < 10 ? 'ok' : 'error',
    message: `Current time: ${iso}`,
  });

  // Calculate overall health
  const totalDuration = performance.now() - startTime;
  const hasErrors = checks.some((c) => c.status === 'error');

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (hasErrors) {
    overallStatus = 'degraded';
  }
  if (totalDuration > 1000) {
    overallStatus = 'unhealthy';
  }

  const result: PerformanceResult = {
    timestamp: new Date().toISOString(),
    serverTime: Math.round(totalDuration * 100) / 100,
    memoryUsage: {
      heapUsed: Math.round(memCheck.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memCheck.heapTotal / 1024 / 1024),
      external: Math.round(memCheck.external / 1024 / 1024),
      rss: Math.round(memCheck.rss / 1024 / 1024),
    },
    checks,
    overall: {
      status: overallStatus,
      totalDuration: Math.round(totalDuration * 100) / 100,
    },
  };

  // Return appropriate status code based on health
  const statusCode = overallStatus === 'unhealthy' ? 503 : overallStatus === 'degraded' ? 200 : 200;

  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${Math.round(totalDuration)}ms`,
    },
  });
}
