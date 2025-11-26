# 🚨 URGENT: AI RATE LIMITING FIX REQUIRED

**Date:** 2025-11-26  
**Priority:** 🔴 **CRITICAL**  
**Time Required:** 30 minutes  
**Financial Impact:** Prevents $20-50/month losses per power user

---

## THE PROBLEM

Your AI rate limiting logic exists in `lib/usage-tracking.ts` (227 lines) but is **NOT BEING CALLED** in your AI API routes.

**Current State:**
- ✅ Rate limiting logic: EXISTS
- ✅ Database tracking fields: EXISTS
- ❌ Enforcement in API routes: **MISSING**

**Risk:**
A single power user can make unlimited AI requests today:
- 1,000 requests @ $0.002 avg = $2/month (tolerable)
- 10,000 requests @ $0.002 = $20/month on $9.99 plan = **$10 LOSS**
- 25,000 requests = $50/month on $9.99 plan = **$40 LOSS**

**One power user wipes out profits from 6 normal users.** ❌

---

## THE FIX

Add 3 lines to each AI API route:

### BEFORE (Current - Unprotected):
```typescript
export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // ❌ NO QUOTA CHECK - ANYONE CAN SPAM
    const response = await getChatAssistance(message, context);
    
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
```

### AFTER (Protected):
```typescript
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { getCurrentUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // ✅ STEP 1: Check quota BEFORE making expensive API call
    await requireUsageQuota('aiRequests', 1);
    
    const response = await getChatAssistance(message, context);
    
    // ✅ STEP 2: Track successful usage
    const user = await getCurrentUser();
    if (user) {
      await trackUsage(user.id, 'aiRequests', 1);
    }
    
    return NextResponse.json({ response });
  } catch (error: any) {
    // ✅ STEP 3: Handle quota exceeded gracefully
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
    
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
```

---

## FILES TO UPDATE (4 Total)

### 1. `/apps/web/app/api/ai/chat-assist/route.ts`
- **Purpose:** Real-time songwriting assistance
- **Current:** No quota check
- **Add:** 3 lines (import + 2 calls)

### 2. `/apps/web/app/api/ai/transcribe/route.ts`
- **Purpose:** Audio transcription (Whisper API)
- **Current:** No quota check
- **Add:** 3 lines + handle transcription cost

### 3. `/apps/web/app/api/ai/generate-content/route.ts`
- **Purpose:** Social media, email, press release generation
- **Current:** No quota check
- **Add:** 3 lines

### 4. `/apps/web/app/api/ai/tour-router/route.ts`
- **Purpose:** Tour route optimization
- **Current:** No quota check
- **Add:** 3 lines

---

## STEP-BY-STEP DEPLOYMENT

### Step 1: Update the 4 API Routes (20 minutes)

For each file, add:

**At the top (imports):**
```typescript
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { getCurrentUser } from '@/lib/supabase';
```

**Before AI API call:**
```typescript
await requireUsageQuota('aiRequests', 1);
```

**After successful AI response:**
```typescript
const user = await getCurrentUser();
if (user) {
  await trackUsage(user.id, 'aiRequests', 1);
}
```

**In catch block:**
```typescript
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
    { status: 429 }
  );
}
```

### Step 2: Test Locally (5 minutes)

```bash
# As Creator user (limit: 100 requests)
# Make 100 AI requests
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/ai/chat-assist \
    -H "Content-Type: application/json" \
    -H "Cookie: YOUR_SESSION_COOKIE" \
    -d '{"message":"test"}'
done

# 101st request should return 429
curl -X POST http://localhost:3000/api/ai/chat-assist \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"message":"test"}'

# Expected response:
# {
#   "error": "aiRequests quota exceeded. Upgrade to Studio plan for more.",
#   "requiresUpgrade": true,
#   "tier": "creator",
#   "used": 100,
#   "limit": 100,
#   "resetDate": "2025-12-26T..."
# }
# Status: 429 Too Many Requests
```

### Step 3: Verify Database Tracking (2 minutes)

```sql
-- Check that usage is being tracked
SELECT 
  email,
  "subscriptionTier",
  "aiRequestsUsed",
  "usagePeriodStart"
FROM "User"
WHERE email = 'your-test-email@example.com';

-- Should show aiRequestsUsed = 100
```

### Step 4: Deploy to Production (3 minutes)

```bash
git add .
git commit -m "fix: enforce AI rate limiting on all API routes"
git push origin main

# Wait for Vercel deployment (~3 min)
# Test in production with same curl commands
```

---

## TESTING CHECKLIST

- [ ] Local build succeeds (`pnpm build`)
- [ ] Can make AI requests when under limit
- [ ] Gets 429 error when over limit
- [ ] Database `aiRequestsUsed` increments correctly
- [ ] Error response includes upgrade CTA
- [ ] Free tier users get blocked (0 limit)
- [ ] Creator tier users get 100 limit
- [ ] Studio tier users get 500 limit
- [ ] Usage resets after 30 days

---

## COST IMPACT

### Before Fix (Current):
- **Risk:** Unlimited AI usage
- **Worst Case:** $50/month cost per power user
- **Break-even:** Need 6 normal users to cover 1 power user
- **Margin Risk:** 15% power users = ZERO profit

### After Fix:
- **Protected:** Max 100-500 requests/user/month
- **Max Cost:** $0.15-$0.75/user/month
- **Margin:** 91-97% on all users
- **Scalable:** Every user profitable from day 1

---

## WHAT HAPPENS IF YOU DON'T FIX THIS?

**Scenario: 100 Paying Users (50 Creator + 50 Studio)**

**Without Fix:**
- 90 normal users: $2,999 revenue - $270 costs = $2,729 profit
- 10 power users: $0 revenue - $500 costs = **-$500 loss**
- **Net:** $2,229 profit (25% margin loss)

**With Fix:**
- 100 users: $2,999 revenue - $300 costs = **$2,699 profit**
- **Protected:** All users profitable
- **Predictable:** Costs scale linearly

---

## ROLLBACK PLAN (If Something Breaks)

**Option 1: Temporary Bypass**
```typescript
// In lib/usage-tracking.ts
export async function requireUsageQuota() {
  return; // Temporarily bypass all checks
}
```

**Option 2: Remove from Routes**
Just comment out the `requireUsageQuota()` and `trackUsage()` calls.

**Option 3: Increase Limits**
```typescript
// In lib/usage-tracking.ts
const TIER_LIMITS = {
  creator: {
    aiRequests: 1000, // Temporarily raise limit
    // ...
  },
}
```

---

## FREQUENTLY ASKED QUESTIONS

### Q: Will this break existing users?
**A:** No. They'll just hit their monthly limit and see an upgrade prompt. The free tier already has 0 AI access.

### Q: What if legitimate users need more?
**A:** They can upgrade to Studio (500 requests) or we add "buy more credits" feature later.

### Q: Can we test without affecting production?
**A:** Yes. Test locally first, or increase limits temporarily in production.

### Q: What about admin/testing accounts?
**A:** Create a "testing" tier with unlimited access for internal use.

### Q: Will this affect user experience?
**A:** Only for power users. Normal users won't hit limits. Add usage dashboard so they can track.

---

## SUMMARY

**Time Investment:** 30 minutes  
**Financial Protection:** $40+ per power user  
**Risk Reduction:** 100% (eliminates unlimited usage)  
**ROI:** Immediate (profitable from user #1)  

**This is the most important 30-minute fix for your financial viability.**

---

**Deploy this before onboarding your first 10 paying users.**

---

**END OF URGENT FIX GUIDE** | Agent 133 | 2025-11-26

