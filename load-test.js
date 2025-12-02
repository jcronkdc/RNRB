#!/usr/bin/env node
/**
 * CronkWaters Load Testing Script
 * ================================
 * Tests the production website with configurable load patterns up to 1000 users.
 *
 * Usage:
 *   node load-test.js [--mode=light|medium|heavy|stress|max] [--duration=30]
 *
 * Examples:
 *   node load-test.js                    # Light test (10 users)
 *   node load-test.js --mode=medium      # Medium load (50 users)
 *   node load-test.js --mode=heavy       # Heavy load (100 users)
 *   node load-test.js --mode=stress      # Stress test (500 users)
 *   node load-test.js --mode=max         # MAX capacity (1000 users) ⚠️
 *
 * ⚠️ NOTE: If you're behind a corporate firewall (Zscaler, etc.),
 *    this test will fail. Run from a personal network or cloud service.
 *
 * For accurate 1000-user testing, use cloud load testing services:
 *   - loader.io (free tier available)
 *   - k6 cloud
 *   - GitHub Actions (see SCALING_1000_USERS.md)
 */

// Disable TLS certificate validation for corporate proxies
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://www.cronkwaters.com';

// Configuration presets
const PRESETS = {
  light: {
    name: 'Light Load Test',
    concurrency: 10, // 10 concurrent users
    requestsPerSecond: 5, // 5 RPS
    duration: 30, // 30 seconds
    description: 'Safe for production - simulates light traffic',
  },
  medium: {
    name: 'Medium Load Test',
    concurrency: 50, // 50 concurrent users
    requestsPerSecond: 25, // 25 RPS
    duration: 60, // 60 seconds
    description: 'Moderate load - tests scalability',
  },
  heavy: {
    name: 'Heavy Load Test',
    concurrency: 100, // 100 concurrent users
    requestsPerSecond: 50, // 50 RPS
    duration: 120, // 2 minutes
    description: '⚠️ CAUTION: May trigger rate limits or affect users',
  },
  stress: {
    name: '🔥 STRESS TEST - 500 Users',
    concurrency: 500, // 500 concurrent users
    requestsPerSecond: 250, // 250 RPS
    duration: 120, // 2 minutes
    description: '⚠️ EXTREME: Tests near 1000-user threshold',
  },
  max: {
    name: '🚨 MAX CAPACITY TEST - 1000 Users',
    concurrency: 1000, // 1000 concurrent users
    requestsPerSecond: 500, // 500 RPS
    duration: 180, // 3 minutes
    description: '🚨 DANGER: Full capacity test - will stress all systems!',
  },
};

// Endpoints to test (verified routes)
const ENDPOINTS = [
  { path: '/', name: 'Landing Page', weight: 40 },
  { path: '/auth', name: 'Auth Page', weight: 15 },
  { path: '/pricing', name: 'Pricing Page', weight: 15 },
  { path: '/solutions/bands', name: 'Solutions - Bands', weight: 10 },
  { path: '/solutions/songwriters', name: 'Solutions - Songwriters', weight: 5 },
  { path: '/features/ai-music', name: 'AI Music Feature', weight: 5 },
  { path: '/why-rnrb', name: 'Why RNRB', weight: 5 },
  { path: '/terms', name: 'Terms Page', weight: 3 },
  { path: '/privacy', name: 'Privacy Page', weight: 2 },
];

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let mode = 'light';
  let duration = null;

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
    }
    if (arg.startsWith('--duration=')) {
      duration = parseInt(arg.split('=')[1], 10);
    }
  }

  return { mode, duration };
}

// Statistics tracking
class Stats {
  constructor() {
    this.requests = 0;
    this.success = 0;
    this.errors = 0;
    this.latencies = [];
    this.statusCodes = {};
    this.startTime = Date.now();
    this.endpointStats = {};
  }

  record(endpoint, statusCode, latency, error = null) {
    this.requests++;
    this.latencies.push(latency);

    if (!this.endpointStats[endpoint]) {
      this.endpointStats[endpoint] = { requests: 0, success: 0, errors: 0, latencies: [] };
    }
    this.endpointStats[endpoint].requests++;
    this.endpointStats[endpoint].latencies.push(latency);

    if (error || statusCode >= 400) {
      this.errors++;
      this.endpointStats[endpoint].errors++;
    } else {
      this.success++;
      this.endpointStats[endpoint].success++;
    }

    this.statusCodes[statusCode] = (this.statusCodes[statusCode] || 0) + 1;
  }

  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  report() {
    const duration = (Date.now() - this.startTime) / 1000;
    const rps = this.requests / duration;

    console.log('\n' + '='.repeat(60));
    console.log('📊 LOAD TEST RESULTS');
    console.log('='.repeat(60));

    console.log('\n📈 Overall Statistics:');
    console.log(`  Total Requests:    ${this.requests}`);
    console.log(
      `  Successful:        ${this.success} (${((this.success / this.requests) * 100).toFixed(1)}%)`
    );
    console.log(
      `  Failed:            ${this.errors} (${((this.errors / this.requests) * 100).toFixed(1)}%)`
    );
    console.log(`  Duration:          ${duration.toFixed(2)}s`);
    console.log(`  Requests/sec:      ${rps.toFixed(2)}`);

    console.log('\n⏱️ Latency Statistics (ms):');
    console.log(`  Min:               ${Math.min(...this.latencies).toFixed(0)}ms`);
    console.log(`  Max:               ${Math.max(...this.latencies).toFixed(0)}ms`);
    console.log(
      `  Average:           ${(this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length).toFixed(0)}ms`
    );
    console.log(`  P50 (median):      ${this.percentile(this.latencies, 50).toFixed(0)}ms`);
    console.log(`  P90:               ${this.percentile(this.latencies, 90).toFixed(0)}ms`);
    console.log(`  P95:               ${this.percentile(this.latencies, 95).toFixed(0)}ms`);
    console.log(`  P99:               ${this.percentile(this.latencies, 99).toFixed(0)}ms`);

    console.log('\n📡 Status Codes:');
    for (const [code, count] of Object.entries(this.statusCodes).sort()) {
      const pct = ((count / this.requests) * 100).toFixed(1);
      const icon = code.startsWith('2') ? '✅' : code.startsWith('3') ? '🔄' : '❌';
      console.log(`  ${icon} ${code}: ${count} (${pct}%)`);
    }

    console.log('\n📍 Per-Endpoint Breakdown:');
    for (const [path, stats] of Object.entries(this.endpointStats)) {
      const avgLatency =
        stats.latencies.length > 0
          ? (stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length).toFixed(0)
          : 0;
      const successRate = ((stats.success / stats.requests) * 100).toFixed(1);
      console.log(`  ${path}`);
      console.log(
        `    Requests: ${stats.requests} | Success: ${successRate}% | Avg: ${avgLatency}ms`
      );
    }

    console.log('\n' + '='.repeat(60));

    // Health assessment
    const avgLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    const successRate = (this.success / this.requests) * 100;

    console.log('\n🏥 HEALTH ASSESSMENT:');

    if (successRate >= 99 && avgLatency < 500) {
      console.log('  ✅ EXCELLENT - Site is performing well under load');
    } else if (successRate >= 95 && avgLatency < 1000) {
      console.log('  🟡 GOOD - Minor performance concerns');
    } else if (successRate >= 90 && avgLatency < 2000) {
      console.log('  🟠 FAIR - Some optimization needed');
    } else {
      console.log('  🔴 POOR - Significant performance issues detected');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (avgLatency > 1000) {
      console.log('  - Consider enabling CDN caching for static assets');
      console.log('  - Review server-side rendering performance');
    }
    if (this.statusCodes['429']) {
      console.log('  - Rate limiting is active - consider adjusting limits if needed');
    }
    if (this.errors > this.requests * 0.05) {
      console.log('  - High error rate detected - check server logs');
    }
    if (successRate > 99 && avgLatency < 300) {
      console.log('  - ✨ No immediate concerns - site handles load well!');
    }

    console.log('\n');
  }
}

// Make a single request
async function makeRequest(url, stats, endpoint) {
  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CronkWaters-LoadTest/1.0',
        Accept: 'text/html,application/json',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    const latency = Date.now() - start;
    stats.record(endpoint, response.status, latency);
    return { success: true, status: response.status, latency };
  } catch (error) {
    const latency = Date.now() - start;
    stats.record(endpoint, error.name === 'TimeoutError' ? 408 : 0, latency, error);
    return { success: false, error: error.message, latency };
  }
}

// Select endpoint based on weights
function selectEndpoint() {
  const total = ENDPOINTS.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * total;

  for (const endpoint of ENDPOINTS) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  return ENDPOINTS[0];
}

// Progress bar
function showProgress(current, total, stats) {
  const pct = Math.min(100, Math.floor((current / total) * 100));
  const filled = Math.min(50, Math.floor(pct / 2));
  const empty = Math.max(0, 50 - filled);
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const rps = stats.requests / ((Date.now() - stats.startTime) / 1000);

  process.stdout.write(
    `\r  [${bar}] ${pct}% | ${stats.requests} reqs | ${rps.toFixed(1)} req/s | ${stats.errors} errors`
  );
}

// Main load test function
async function runLoadTest() {
  const { mode, duration: customDuration } = parseArgs();

  if (!PRESETS[mode]) {
    console.error(`❌ Unknown mode: ${mode}. Use: light, medium, or heavy`);
    process.exit(1);
  }

  const config = { ...PRESETS[mode] };
  if (customDuration) {
    config.duration = customDuration;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🚀 ${config.name}`);
  console.log('='.repeat(60));
  console.log(`  Target:        ${BASE_URL}`);
  console.log(`  Concurrency:   ${config.concurrency} users`);
  console.log(`  Target RPS:    ${config.requestsPerSecond}`);
  console.log(`  Duration:      ${config.duration}s`);
  console.log(`  ${config.description}`);
  console.log('='.repeat(60));

  if (mode === 'heavy') {
    console.log('\n⚠️  WARNING: Heavy load test may affect production users!');
    console.log('  Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise((r) => setTimeout(r, 5000));
  }

  if (mode === 'stress' || mode === 'max') {
    console.log('\n🚨 ═══════════════════════════════════════════════════════════');
    console.log('🚨  DANGER ZONE: EXTREME LOAD TEST');
    console.log('🚨 ═══════════════════════════════════════════════════════════');
    console.log('  This test WILL:');
    console.log('  - Push your infrastructure to its limits');
    console.log('  - Potentially trigger rate limiting');
    console.log('  - May affect real users if any are online');
    console.log('  - Could incur additional serverless costs');
    console.log('\n  Recommended before running:');
    console.log('  ✓ Ensure Redis rate limiting is configured (Upstash)');
    console.log('  ✓ Database can handle connections (Neon Launch tier+)');
    console.log('  ✓ Ably can handle connections (Pro plan)');
    console.log('');
    console.log('  Press Ctrl+C within 10 seconds to cancel...\n');
    await new Promise((r) => setTimeout(r, 10000));
  }

  console.log('\n📡 Starting load test...\n');

  const stats = new Stats();
  const endTime = Date.now() + config.duration * 1000;
  const interval = 1000 / config.requestsPerSecond;

  const workers = [];

  // Create concurrent workers
  for (let i = 0; i < config.concurrency; i++) {
    workers.push(
      (async () => {
        while (Date.now() < endTime) {
          const endpoint = selectEndpoint();
          const url = `${BASE_URL}${endpoint.path}`;
          await makeRequest(url, stats, endpoint.path);

          // Pace requests to achieve target RPS
          await new Promise((r) => setTimeout(r, (interval * config.concurrency) / 2));
        }
      })()
    );
  }

  // Progress updater
  const progressInterval = setInterval(() => {
    const elapsed = (Date.now() - stats.startTime) / 1000;
    showProgress(elapsed, config.duration, stats);
  }, 100);

  // Wait for all workers
  await Promise.all(workers);

  clearInterval(progressInterval);
  process.stdout.write('\n');

  // Generate report
  stats.report();
}

// Run
runLoadTest().catch((err) => {
  console.error('❌ Load test failed:', err);
  process.exit(1);
});
