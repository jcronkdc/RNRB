# Cloudflare Performance Configuration Guide

**Based on Lighthouse Recommendations - December 2024**

This guide covers all Cloudflare features recommended by Lighthouse to maximize Rock N' Roll Basement's performance.

---

## 📊 Quick Status Dashboard

| Recommendation                      | Cloudflare Feature      | Status       | Priority |
| ----------------------------------- | ----------------------- | ------------ | -------- |
| Eliminate render-blocking resources | Rocket Loader™          | ⚙️ Configure | High     |
| Properly size images                | Polish + Image Resizing | ⚙️ Configure | High     |
| Efficiently encode images           | Polish                  | ⚙️ Configure | High     |
| Serve images in next-gen formats    | Polish (WebP/AVIF)      | ⚙️ Configure | High     |
| Initial server response time        | Argo Smart Routing      | 💰 Optional  | Medium   |
| Minimize third-party usage          | Zaraz                   | ⚙️ Configure | Medium   |
| Avoids enormous network payloads    | Polish + Minification   | ⚙️ Configure | High     |
| Efficient cache policy              | Cache Rules             | ⚙️ Configure | High     |
| Minimize main-thread work           | Zaraz + Rocket Loader   | ⚙️ Configure | High     |

---

## 🚀 STEP 1: Enable Rocket Loader™

**Purpose:** Eliminates render-blocking JavaScript

**Location:** `Speed > Optimization > Content Optimization`

### Settings

```
Rocket Loader: ON
```

### What it does

- Defers all JavaScript execution until after page render
- Significantly improves First Contentful Paint (FCP)
- Reduces main-thread blocking time

### Compatibility Note

Rocket Loader is generally safe for React/Next.js apps. If you notice issues:

1. Add `data-cfasync="false"` to critical scripts
2. Test thoroughly on staging first

---

## 🖼️ STEP 2: Enable Polish (Image Optimization)

**Purpose:** Optimize, resize, and serve modern image formats

**Location:** `Speed > Optimization > Image Optimization`

### Settings

```
Polish: Lossy (recommended) or Lossless
WebP: ON
AVIF: ON (if available on your plan)
```

### Quality Settings

| Polish Mode | Compression     | Best For                  |
| ----------- | --------------- | ------------------------- |
| Lossless    | No quality loss | Logos, icons, text images |
| Lossy       | ~15% smaller    | Photos, backgrounds       |

### Additional Image Settings

```
Hotlink Protection: ON (optional, saves bandwidth)
Mirage: ON (lazy loads images on mobile)
```

---

## 🔄 STEP 3: Configure Cache Rules

**Purpose:** Aggressive caching for static assets

**Location:** `Caching > Cache Rules`

### Rule 1: Static Assets (1 Year Cache)

```yaml
Name: "Static Assets - Immutable"
Match: URI Path contains any of:
  - /_next/static/
  - .woff2
  - .woff
  - .ttf
  - .ico

Then:
  Cache eligibility: Bypass cache [OFF]
  Edge TTL: Override origin, 1 year
  Browser TTL: Override origin, 1 year
  Cache Key: Standard
```

### Rule 2: Images (1 Year Cache)

```yaml
Name: "Images - Long Cache"
Match: URI Path ends with any of:
  - .jpg
  - .jpeg
  - .png
  - .gif
  - .webp
  - .avif
  - .svg

Then:
  Edge TTL: Override origin, 1 year
  Browser TTL: Override origin, 1 year
```

### Rule 3: HTML Pages (Stale-While-Revalidate)

```yaml
Name: 'HTML - SWR Strategy'
Match:
  - URI Path does not contain /api/
  - URI Path does not contain /_next/

Then:
  Edge TTL: 1 day
  Browser TTL: 1 hour
  Serve stale content while revalidating: ON
```

### Rule 4: API Responses (No Cache)

```yaml
Name: 'API - No Cache'
Match: URI Path starts with /api/

Then:
  Cache eligibility: Bypass cache
```

---

## 📡 STEP 4: Enable Zaraz (Third-Party Script Manager)

**Purpose:** Minimize main-thread work from third-party scripts

**Location:** `Analytics > Web Analytics > Zaraz`

### Currently Used Third-Party Scripts

| Script           | Current Loading | Zaraz Migration                     |
| ---------------- | --------------- | ----------------------------------- |
| PostHog          | Direct load     | Move to Zaraz                       |
| Stripe.js        | Direct load     | Keep direct (required for payments) |
| Vercel Analytics | Direct load     | Move to Zaraz                       |

### Zaraz Configuration

1. **Enable Zaraz** in Cloudflare dashboard
2. **Add Tools:**
   - PostHog (use server-side loading)
   - Vercel Web Analytics (optional migration)
3. **Trigger Settings:**

```yaml
Pageview Trigger:
  - Load timing: After paint
  - Delay: 2000ms (defer non-critical analytics)
```

### Benefits

- Scripts load from Cloudflare edge (faster)
- Server-side execution (no client JS)
- Single request for multiple tools
- Built-in consent management

---

## ⚡ STEP 5: Enable Minification

**Purpose:** Reduce payload sizes

**Location:** `Speed > Optimization > Content Optimization`

### Settings

```
Auto Minify:
  ✅ JavaScript
  ✅ CSS
  ✅ HTML
```

**Note:** Next.js already minifies in production, but Cloudflare provides an extra layer.

---

## 🛤️ STEP 6: Consider Argo Smart Routing (Optional - Paid)

**Purpose:** Faster server response times globally

**Location:** `Traffic > Argo`

### What it does

- Routes traffic through fastest paths
- Typically 30% faster TTFB
- ~$5/month base + $0.10/GB

### Recommendation

Enable if:

- You have users in multiple continents
- TTFB > 200ms for some regions
- Budget allows

---

## 📱 STEP 7: Mobile Optimization

**Location:** `Speed > Optimization > Content Optimization`

### Mirage Settings (Pro+ Plans)

```
Mirage: ON
```

- Lazy-loads images on slow connections
- Serves placeholder images initially
- Perfect for mobile users

### Automatic Platform Optimization (APO)

If on WordPress/Shopify, APO helps. For Next.js:

- Already handled by Vercel/Next.js optimizations
- Skip APO

---

## 🔧 STEP 8: Brotli Compression

**Location:** `Speed > Optimization > Content Optimization`

### Settings

```
Brotli: ON
```

### Compression Comparison

| Type   | Size Reduction | Support       |
| ------ | -------------- | ------------- |
| Gzip   | ~70%           | All browsers  |
| Brotli | ~80%           | 95%+ browsers |

---

## 🌐 STEP 9: HTTP/3 and Early Hints

**Location:** `Network`

### Settings

```
HTTP/3 (QUIC): ON
Early Hints: ON
0-RTT Connection Resumption: ON
```

### Benefits

- HTTP/3: Faster connections on poor networks
- Early Hints: Preload critical assets
- 0-RTT: Faster returning visitors

---

## 📋 Verification Checklist

After configuration, verify each setting:

### Speed Test Workflow

1. Clear Cloudflare cache: `Caching > Configuration > Purge Everything`
2. Wait 5 minutes
3. Run Lighthouse: https://pagespeed.web.dev/
4. Check each metric improvement

### Expected Improvements

| Metric | Before | Target | Notes                 |
| ------ | ------ | ------ | --------------------- |
| LCP    | ~2.5s  | <2.0s  | Polish + Cache        |
| FID    | ~100ms | <50ms  | Rocket Loader + Zaraz |
| CLS    | ~0.1   | <0.05  | Already good          |
| TTFB   | ~400ms | <200ms | Argo (paid)           |

---

## 🔒 Security + Performance

These settings improve both:

### Location: `SSL/TLS > Edge Certificates`

```
Always Use HTTPS: ON
Automatic HTTPS Rewrites: ON
Minimum TLS Version: TLS 1.2
```

### Location: `Security > Settings`

```
Browser Integrity Check: ON
Challenge Passage: 30 minutes
```

---

## 📊 Monitoring

### Analytics to Watch

**Location:** `Analytics > Traffic`

Key metrics after enabling optimizations:

- Bandwidth saved (Polish)
- Cache hit ratio (target: >85%)
- Rocket Loader activations
- Zaraz events

### Performance Alerts

Set up notifications for:

- Cache hit ratio drops below 80%
- Error rate spikes
- Bandwidth anomalies

---

## 🚨 Troubleshooting

### Issue: Site breaks after Rocket Loader

**Fix:** Add `data-cfasync="false"` to critical inline scripts

### Issue: Images not converting to WebP

**Fix:** Check Polish is enabled AND image is served through Cloudflare

### Issue: Cache not working

**Fix:**

1. Check origin Cache-Control headers
2. Review Page Rules for conflicts
3. Verify hostname is proxied (orange cloud)

### Issue: Third-party script not loading via Zaraz

**Fix:** Verify trigger conditions and check browser console for errors

---

## 📝 Current Implementation Status

### ✅ Already Implemented in Code

- Next.js Image optimization (WebP/AVIF)
- Static asset caching headers (1 year)
- PostHog lazy loading (requestIdleCallback)
- DNS prefetch for third-party origins
- Font preloading (display: swap)
- Code splitting for large libraries
- Bundle optimization

### ⚙️ Requires Cloudflare Dashboard Configuration

- [ ] Rocket Loader
- [ ] Polish (Image Optimization)
- [ ] WebP/AVIF conversion
- [ ] Cache Rules (as documented above)
- [ ] Zaraz (third-party script manager)
- [ ] Brotli compression
- [ ] HTTP/3 and Early Hints
- [ ] Mirage (mobile image optimization)

### 💰 Optional Paid Features

- [ ] Argo Smart Routing (~$5/month)
- [ ] Image Resizing (Pro+ plan)

---

## 🎯 Quick Start

**Minimum Configuration (5 minutes):**

1. **Enable Rocket Loader** → Speed > Optimization
2. **Enable Polish** → Speed > Optimization > Image Optimization
3. **Turn on Auto Minify** → Speed > Optimization
4. **Enable Brotli** → Speed > Optimization
5. **Purge cache and test**

**Full Configuration (30 minutes):**

- Complete all steps 1-9 above
- Verify with Lighthouse
- Monitor for 24 hours

---

_Last Updated: December 2024_
_For: Rock N' Roll Basement (cronkwaters.com)_
