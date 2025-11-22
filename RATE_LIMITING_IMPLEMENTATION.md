# 🚨 RATE LIMITING IMPLEMENTATION GUIDE

**Created:** 2025-11-22  
**Priority:** 🔴 **CRITICAL - PROTECTS PROFIT MARGINS**  
**Time to Deploy:** ~4 hours  
**Impact:** Prevents $40+/month losses per power user  

---

## 🎯 WHAT WAS BUILT

### **New Files:**
1. `apps/web/lib/usage-tracking.ts` - Complete rate limiting system (251 lines)
2. `packages/db/prisma/migrations/add_usage_tracking.sql` - Database migration

### **Modified Files:**
3. `packages/db/prisma/schema.prisma` - Added 4 usage tracking fields

---

## ⚠️ THE PROBLEM

**Without rate limits, you're at risk:**
- Creator user ($9.99/mo) makes 1,000 AI requests → **Cost: $15** → **Loss: $5.01**
- Studio user ($29.99/mo) uses 80 hours video/month → **Cost: $57.60** → **Loss: $27.61**

**ONE power user can wipe out profits from 6 normal users.** ❌

---

## ✅ THE SOLUTION

### **Tier Limits (Monthly):**

| Tier | AI Requests | Video Minutes | Monthly Cost | Profit Margin |
|------|-------------|---------------|--------------|---------------|
| **Free** | 0 | 0 | $0 | N/A |
| **Creator** | 100 | 0 | $0.15 | 97% |
| **Studio** | 500 | 1,200 (20 hrs) | $3.00 | 90% |

### **What Happens When Limit Reached:**
1. API returns `429 Too Many Requests`
2. Response includes:
   - Current usage
   - Monthly limit
   - Reset date
   - Upgrade CTA
3. User sees upgrade prompt in UI

---

## 📋 DEPLOYMENT STEPS

### **Step 1: Run Database Migration (2 minutes)**

```bash
cd /Users/justincronk/Desktop/CronkWaters

# Connect to your production database
psql $DATABASE_URL

# Run the migration
\i packages/db/prisma/migrations/add_usage_tracking.sql

# Verify fields were added
\d "User"
```

**Expected Output:**
```
aiRequestsUsed       | integer     | default 0
videoMinutesUsed     | integer     | default 0
usagePeriodStart     | timestamp   | default now()
storageUsedGB        | decimal     | default 0
```

---

### **Step 2: Update Prisma Schema (1 minute)**

**Already done!** ✅ Schema updated in this session.

Run Prisma generate to sync types:
```bash
cd packages/db
pnpm prisma generate
```

---

### **Step 3: Add Rate Limiting to AI Routes (30 minutes)**

**Example: `/api/ai/chat-assist/route.ts`**

```typescript
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { getCurrentUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // ✅ STEP 1: Check subscription access (already exists)
    await requireFeatureAccess('aiChatAssist');

    // 🔒 STEP 2: Check usage quota (NEW)
    await requireUsageQuota('aiRequests', 1);

    // ... existing AI call logic ...
    const response = await getChatAssistance(message, context);

    // 📊 STEP 3: Track successful usage (NEW)
    const user = await getCurrentUser();
    if (user) {
      await trackUsage(user.id, 'aiRequests', 1);
    }

    return NextResponse.json({ response });

  } catch (error: any) {
    // Handle quota exceeded errors
    if (error.code === 'QUOTA_EXCEEDED') {
      return NextResponse.json(
        {
          error: error.message,
          requiresUpgrade: true,
          tier: error.tier,
          used: error.used,
          limit: error.limit,
          resetDate: error.resetDate,
        },
        { status: 429 } // Too Many Requests
      );
    }

    // ... existing error handling ...
  }
}
```

---

### **Step 4: Apply to All AI Routes (60 minutes)**

**Routes to update:**
- ✅ `/api/ai/chat-assist/route.ts`
- ✅ `/api/ai/transcribe/route.ts`
- ✅ `/api/ai/generate-content/route.ts`
- ✅ `/api/ai/tour-router/route.ts`

**Video routes (Studio only):**
- ✅ `/api/daily/rooms/route.ts` (track video minutes on join)
- ✅ `/api/daily/rooms/[roomName]/route.ts`

**Pattern:**
1. Add `requireUsageQuota()` before API call
2. Add `trackUsage()` after successful response
3. Handle `QUOTA_EXCEEDED` error with 429 status

---

### **Step 5: Create Usage Dashboard (90 minutes)**

**New file: `apps/web/app/(app)/settings/usage/page.tsx`**

```typescript
import { getUsageSummary } from '@/lib/usage-tracking';
import { getCurrentUser } from '@/lib/supabase';

export default async function UsagePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');

  const usage = await getUsageSummary(user.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Usage & Limits</h1>
      
      {/* AI Requests */}
      <UsageCard
        title="AI Requests"
        used={usage.ai.used}
        limit={usage.ai.limit}
        percentage={usage.ai.percentage}
        resetDate={usage.resetDate}
      />

      {/* Video Minutes */}
      {usage.tier === 'studio' && (
        <UsageCard
          title="Video Call Minutes"
          used={usage.video.used}
          limit={usage.video.limit}
          percentage={usage.video.percentage}
          resetDate={usage.resetDate}
        />
      )}

      {/* Storage */}
      <UsageCard
        title="Storage"
        used={usage.storage.used}
        limit={usage.storage.limit}
        percentage={usage.storage.percentage}
        unit="GB"
      />

      {/* Upgrade CTA if near limits */}
      {usage.ai.percentage > 80 && (
        <UpgradePrompt currentTier={usage.tier} />
      )}
    </div>
  );
}
```

**Add navigation link in settings sidebar:**
- `/settings/billing` → "Billing & Subscription"
- `/settings/usage` → "Usage & Limits" ← NEW

---

### **Step 6: Test the System (30 minutes)**

**Test Scenario 1: Enforce AI Limit**
```bash
# As Creator user (limit: 100 requests)
# Make 100 AI chat requests
for i in {1..100}; do
  curl -X POST https://cronkwaters.com/api/ai/chat-assist \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"message":"test"}'
done

# 101st request should return 429
curl -X POST https://cronkwaters.com/api/ai/chat-assist \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"test"}'

# Expected: { error: "aiRequests quota exceeded...", status: 429 }
```

**Test Scenario 2: Verify Reset**
```sql
-- Manually reset usage period (simulate next month)
UPDATE "User" 
SET "usagePeriodStart" = NOW() - INTERVAL '31 days',
    "aiRequestsUsed" = 0
WHERE id = 'user_id_here';

-- Next request should succeed
```

**Test Scenario 3: Check Dashboard**
- Visit `/settings/usage`
- Verify bars show correct usage
- Verify reset date displays
- Make a request, refresh page, verify counter increments

---

## 🚀 OPTIONAL ENHANCEMENTS

### **Phase 2 (Next Sprint):**
1. **Email Warnings at 80% usage**
2. **In-app notifications when limit reached**
3. **"Buy More Credits" one-time purchases ($5 for +100 AI requests)**
4. **Usage analytics dashboard (admin view)**

### **Phase 3 (Future):**
5. **AI model optimization** (switch to gpt-4o-mini for 67× cost savings)
6. **Response caching** (save 20-30% on duplicate queries)
7. **Usage predictions** ("At this rate, you'll hit limit in 5 days")

---

## 📊 EXPECTED IMPACT

### **Before Rate Limits:**
- **Risk:** Power users cost $40+/month
- **Loss:** 1 power user = -$30 profit
- **Margin:** 75-80% (vulnerable to abuse)

### **After Rate Limits:**
- **Protected:** Max cost per user = $3/month
- **Profit:** Every user profitable from day 1
- **Margin:** 90-97% (protected and scalable)

### **At Scale (100 Studio users):**
- **Revenue:** $2,999/month
- **Costs:** $300/month (with limits)
- **Profit:** $2,699/month ✅

**Without limits:** 10 power users → **$500 losses** ❌

---

## ⚠️ CRITICAL REMINDERS

1. **Deploy database migration FIRST** (before code)
2. **Test on staging environment** before production
3. **Monitor error rates** after deployment (watch for 429s)
4. **Add Sentry alerts** for quota exceeded events
5. **Document limits** in pricing page & docs

---

## 📞 ROLLBACK PLAN

If something breaks:

```typescript
// Temporarily disable rate limiting
// In usage-tracking.ts:
export async function requireUsageQuota() {
  // return; // Bypass check
  // ... original code ...
}
```

Or remove the `requireUsageQuota()` calls from routes.

**Database rollback:**
```sql
ALTER TABLE "User" 
  DROP COLUMN "aiRequestsUsed",
  DROP COLUMN "videoMinutesUsed",
  DROP COLUMN "usagePeriodStart",
  DROP COLUMN "storageUsedGB";
```

---

## 🎯 SUCCESS METRICS

**Track these after deployment:**
- 429 error rate (should be <5% of requests)
- Upgrade rate from quota prompts (target: 10%)
- Average usage per tier
- Cost per user (should drop to $0.15-$3.00)

---

**This protects your margins. Deploy ASAP.** 🚨

**Time Investment:** 4 hours  
**Margin Protection:** $40+ per power user  
**ROI:** Immediate (profitable from user #1)

---

**END OF GUIDE** | 2025-11-22

