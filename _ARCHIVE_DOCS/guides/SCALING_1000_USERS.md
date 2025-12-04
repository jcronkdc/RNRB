# Scaling CronkWaters for 1000+ Concurrent Users

**Created:** 2025-12-01  
**Status:** CONFIGURATION REQUIRED

---

## 🎯 Overview

To handle 1000+ concurrent users reliably, you need to configure:

1. ✅ **Database Connection Pooling** - Updated in schema.prisma
2. ⏳ **Distributed Rate Limiting** - Upstash Redis (needs env vars)
3. ⏳ **Vercel Pro Plan** - Higher limits
4. ⏳ **Neon Database Scaling** - Increase compute

---

## 1. Database: Neon PostgreSQL

### Current Setup

Your database uses Neon's connection pooler (`-pooler` in URL), which is good!

### Required Actions

**A) Add the unpooled URL for migrations:**

```env
# In Vercel Environment Variables AND .env.local:

# Pooled connection (for app queries) - you already have this
DATABASE_URL="postgresql://neondb_owner:xxx@ep-morning-shadow-ahxokvi8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Unpooled connection (for migrations/schema changes)
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:xxx@ep-morning-shadow-ahxokvi8.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Note: Remove `-pooler` from the hostname for the unpooled URL.

**B) Increase Neon Compute Size:**

1. Go to [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Go to **Settings → Compute**
4. Increase from 0.25 CU to at least **1 CU** for 1000 users
5. Enable **Autoscaling** (0.25 - 2 CU)

**Neon Limits by Tier:**

| Tier   | Connections | Compute | Monthly Cost |
| ------ | ----------- | ------- | ------------ |
| Free   | 100         | 0.25 CU | $0           |
| Launch | 500         | 1 CU    | $19/mo       |
| Scale  | 1000+       | 4 CU    | $69/mo       |

**For 1000 users, you need at least Launch tier.**

---

## 2. Distributed Rate Limiting: Upstash Redis

### Why This Matters

Your current rate limiting uses in-memory storage. With serverless:

- Each function instance has its own memory
- A user could bypass limits by hitting different instances
- No protection against coordinated attacks

### Setup Upstash (Free Tier: 10,000 requests/day)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database
3. Select region closest to your users (US East)
4. Copy the REST credentials

**Add to Vercel Environment Variables:**

```env
UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxx
```

### Verify It's Working

After deploying, check Vercel logs for:

```
[Rate Limit] ✅ Using Upstash Redis for distributed rate limiting
```

### Cost

| Tier          | Requests/Day | Monthly Cost |
| ------------- | ------------ | ------------ |
| Free          | 10,000       | $0           |
| Pay-as-you-go | 500,000      | ~$10/mo      |
| Pro           | Unlimited    | $120/mo      |

**For 1000 users, start with Pay-as-you-go (~$10/mo)**

---

## 3. Vercel Configuration

### Current Plan Limits (Hobby)

- 100 GB bandwidth/month
- 100 GB-hours compute/month
- 10s function timeout

### Recommended: Vercel Pro ($20/mo)

- 1 TB bandwidth/month
- 1000 GB-hours compute/month
- 60s function timeout
- Team features

### Optimize Function Performance

Add to `vercel.json`:

```json
{
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

---

## 4. External Service Limits

### Ably (Real-time)

- Free: 200 concurrent connections
- Pro: 10,000 concurrent connections ($29/mo)

**For 1000 users, you need Ably Pro**

### Daily.co (Video)

- Free: 5 participants/room
- Scale: 200 participants/room ($99/mo)

**Current setup is fine unless you need large video rooms**

### OpenAI

- Rate limits based on tier
- Tier 1: 60 RPM
- Tier 2: 100 RPM
- Tier 3: 500 RPM

**Already using Anthropic/Claude - check your tier**

---

## 5. Quick Cost Summary for 1000 Users

| Service       | Current | Recommended   | Monthly Cost |
| ------------- | ------- | ------------- | ------------ |
| Vercel        | Hobby   | Pro           | $20          |
| Neon DB       | Free    | Launch        | $19          |
| Upstash Redis | -       | Pay-as-you-go | $10          |
| Ably          | Free    | Pro           | $29          |
| **Total**     | **$0**  | **~$78/mo**   |              |

---

## 6. Implementation Checklist

### Immediate (Do Now)

- [ ] Add `DATABASE_URL_UNPOOLED` to Vercel env vars
- [ ] Create Upstash Redis database
- [ ] Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel
- [ ] Deploy: `git push origin main`

### This Week

- [ ] Upgrade to Neon Launch tier ($19/mo)
- [ ] Upgrade to Vercel Pro ($20/mo)
- [ ] Upgrade to Ably Pro ($29/mo)

### Verify Scaling

- [ ] Run load test from non-corporate network
- [ ] Check Vercel Analytics for response times
- [ ] Monitor Neon connection usage

---

## 7. Load Testing from Cloud

Since your machine is behind Zscaler, use these alternatives:

### Option A: GitHub Actions (Free)

Create `.github/workflows/load-test.yml`:

```yaml
name: Load Test
on: workflow_dispatch

jobs:
  loadtest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node load-test.js --mode=heavy
```

### Option B: loader.io (Free Tier)

1. Go to [loader.io](https://loader.io)
2. Verify domain ownership
3. Run tests up to 10,000 clients/test

### Option C: k6 Cloud

1. Sign up at [k6.io/cloud](https://k6.io/cloud)
2. Run distributed tests from multiple regions

---

## 8. Monitoring for 1000 Users

### Add These Alerts

**Vercel:**

- Function errors > 1%
- Response time P95 > 2s
- Bandwidth usage > 80%

**Neon:**

- Connection usage > 80%
- Query latency P99 > 1s
- Storage usage > 80%

**Upstash:**

- Daily commands > 80% of limit
- Latency P99 > 100ms

---

## Summary

Your infrastructure CAN handle 1000 users with these changes:

| Component        | Status          | Action           |
| ---------------- | --------------- | ---------------- |
| Vercel Edge      | ✅ Ready        | Auto-scales      |
| Database Pooling | ✅ Configured   | Add unpooled URL |
| Rate Limiting    | ⚠️ Needs Redis  | Add Upstash      |
| Neon Compute     | ⚠️ May throttle | Upgrade tier     |
| Ably             | ⚠️ 200 limit    | Upgrade to Pro   |

**Estimated monthly cost for 1000 users: ~$78/mo**
