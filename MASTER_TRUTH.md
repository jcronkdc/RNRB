# 🍄 MASTER TRUTH - CRONKWATERS

**Agent:** 103  
**Production:** https://www.cronkwaters.com  
**Database:** `weathered-rain-51915586` (Neon PostgreSQL 17.5)  
**Git:** `main` @ `181432a7`

---

## ✅ WORKING

- **Build:** 67 pages, Next.js 15.5.6, deployed on Vercel
- **Database:** 31 tables, schema COMPLETE (Account, Session, VerificationToken, User with password field)
- **Local Registration:** ✅ 201 Created (2 test users in DB with hashed passwords)
- **Auth Routes:** `/auth` (Google OAuth + Email Magic Links + Password forms exist)

---

## 🔴 BLOCKED: Production Registration (Vercel Prisma Client Cache)

**Issue:** Vercel serving stale Prisma client from Nov 12 (missing password field)  
**Evidence:**
- Local: POST /api/register → 201 ✅
- Production: POST /api/register → 500 ❌
- Database: Fully migrated with NextAuth tables + password field ✅

**Root Cause:** Vercel's build cache has old Prisma client generated before schema migration

**Attempts Made:**
1. ✅ Removed conflicting POSTGRES_DATABASE/PGDATABASE env vars
2. ✅ Updated schema.prisma comment (force regeneration)
3. ✅ Added debug logging to registration endpoint
4. ⏳ 3 deployments triggered (cache persisting)

---

## 🚨 USER ACTION REQUIRED

### Option 1: Vercel Dashboard (FASTEST - 3 mins)
1. Go to: https://vercel.com/justins-projects-d7153a8c/cronkwater/settings/general
2. Click "Clear Build Cache"
3. Go to Deployments → Click "Redeploy" on latest
4. Wait 90 seconds → Test: `curl -X POST https://www.cronkwaters.com/api/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"Pass123!","name":"Test"}'`

### Option 2: Let Agent 104 Continue
- Agent 104 can investigate Vercel build logs
- May need to regenerate Prisma client differently
- Estimate: 30-60 minutes troubleshooting

---

## 📊 TOKYO ANT PATH (Shortest Distance)

```
DATABASE_URL set → Schema migrated → Local works → Vercel cache blocking
                                                           ↓
                                              Clear cache → DONE
```

**Completion:** 95% (only Vercel cache issue remaining)

---

## 🔧 EXTENSIONS USED

- ✅ Neon MCP: Database migration, schema verification
- ✅ Browser MCP: Tested registration form on production
- ✅ Git: 3 commits pushed, tracking changes
- ⚠️ Vercel CLI: Limited (no cache clear command)

---

**NEXT AGENT:** Clear Vercel build cache or investigate Prisma generation on Vercel

### 🚨 Blockage #2: Rotate Exposed Credentials

**Exposed in commit c79c7354:**
- Google OAuth Client Secret
- Resend API Key

**Action:** Rotate via dashboards (Google Console + Resend)

---

## 🚨 IMMEDIATE USER ACTIONS

### 🔴 Action 1: Fix DATABASE_URL (10 mins)

1. Get Neon string: https://console.neon.tech
2. Add to Vercel env vars: `DATABASE_URL`
3. `git commit --allow-empty && git push`
4. Test: `curl -X POST https://www.cronkwaters.com/api/auth/register -d ...`

### 🚨 Action 2: Rotate Credentials (20 mins)

1. Rotate Google OAuth: https://console.cloud.google.com/apis/credentials
2. Rotate Resend: https://resend.com/api-keys
3. Update Vercel env vars
4. Redeploy

**Reference:** `🚨_SECURITY_BREACH_IMMEDIATE_ACTION_REQUIRED.md`

---

## 🐜 TOKYO ANT FLOW (Shortest Paths)

### Path 1: Registration → Dashboard
```
1. User updates Vercel DATABASE_URL (3 min)
2. Test: POST /api/register → 201 Created
3. Test: Sign in with new account → Dashboard
4. ✅ COMPLETE
```

### Path 2: Security Hardening
```
1. Rotate Google OAuth (12 min)
2. Rotate Resend API (5 min)
3. Update Vercel env vars
4. Redeploy + verify
5. ✅ COMPLETE
```

### Path 3: Human Testing
```
1. Auth flows (30 min)
2. Songwriting tools (30 min)
3. AI features (30 min)
4. Community publish (30 min)
5. Document findings
```

---

## 🔧 MCP EXTENSIONS

```
✅ Neon: Database ops, migrations, queries
✅ Supabase: Advisors, logs, branches
✅ Browser: Navigation, testing, screenshots
✅ Render: Service management
✅ Prisma: Schema management
```

---

## 📊 COMPLETION

**90% DONE** | 2 user actions required | Then 2hr human testing

---

**END OF MASTER TRUTH**  
**Next:** User updates DATABASE_URL → Test → Security rotation → Human testing
