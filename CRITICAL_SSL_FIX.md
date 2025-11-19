# 🔴 CRITICAL: SSL Certificate Issue - Permanent Fix Required

## The Problem

**Pattern:** Every time we deploy to production, `www.cronkwaters.com` throws `SSL_ERROR_SYSCALL` errors for ~2-5 minutes.

**Root Cause:** Vercel's custom domain SSL certificate provisioning is unstable. The certificate fails to regenerate properly during deployments.

## Current State (2025-11-19)

- ✅ `cronkwater.vercel.app` → Always works
- ✅ Deployment URLs → Always work
- ❌ `www.cronkwaters.com` → Fails during/after deployments
- ❌ SSL handshake fails: `LibreSSL SSL_connect: SSL_ERROR_SYSCALL`

## Why This Keeps Happening

1. Domain is configured in Vercel Dashboard (not via CLI)
2. Every `git push` triggers new deployment
3. During deployment, Vercel tries to regenerate SSL certificates
4. Certificate provisioning fails or times out
5. Custom domain becomes inaccessible until manual intervention

## THE PERMANENT FIX (Do This in Vercel Dashboard)

### Option 1: Switch to Cloudflare for SSL (Recommended)
1. Go to Vercel Dashboard → cronkwater → Settings → Domains
2. Remove `www.cronkwaters.com` temporarily
3. Set up Cloudflare:
   - Add `cronkwaters.com` to Cloudflare
   - Enable "Full (Strict)" SSL mode
   - Add CNAME: `www` → `cname.vercel-dns.com`
   - Enable "Always Use HTTPS"
4. Re-add domain to Vercel (Cloudflare will handle SSL)
5. Benefit: Cloudflare's SSL is rock-solid, never fails

### Option 2: Force Certificate Regeneration (Temporary)
1. Go to Vercel Dashboard → cronkwater → Settings → Domains
2. Click on `www.cronkwaters.com`
3. Click "Refresh" or "Regenerate Certificate"
4. Wait 2-3 minutes for certificate to provision
5. Test: `curl -I https://www.cronkwaters.com`

### Option 3: Use cronkwater.vercel.app (Works Always)
- This domain NEVER fails because it uses Vercel's wildcard certificate
- Can be used as a reliable fallback
- Less "professional" but 100% reliable

## Immediate Workaround (When It Breaks)

```bash
# Wait for deployment to finish
sleep 60

# Force certificate refresh by triggering new deployment
vercel --prod

# OR use working URLs:
# - https://cronkwater.vercel.app
# - https://cronkwater-HASH.vercel.app (latest deployment)
```

## Long-Term Solution

**Implement Cloudflare in front of Vercel:**
- Cloudflare handles SSL termination (100% reliable)
- Vercel handles app logic
- Zero downtime during deployments
- Free on Cloudflare's free tier

## Action Required

Someone with access to:
1. Vercel Dashboard (justins-projects-d7153a8c)
2. Domain registrar (cronkwaters.com DNS)

Needs to implement Option 1 (Cloudflare) to permanently solve this.

---

**Status:** Issue documented. Awaiting manual Vercel Dashboard intervention.

