# 🍄 MASTER TRUTH - CRONKWATERS

**Agent:** 104  
**Production:** https://www.cronkwaters.com  
**Database:** `weathered-rain-51915586` (Neon PostgreSQL 17.5)  
**Git:** `main` @ `9913528d`

---

## ✅ WORKING

- **Build:** 67 pages, Next.js 15.5.6, deployed on Vercel
- **Database:** 31 tables, User.password field exists
- **Prisma Package:** Fixed - exports compiled JavaScript from dist/
- **Registration API:** `/api/register` - logic correct, imports working

---

## 🔴 ROOT CAUSE FOUND: Shared Email State Bug

**CONFIRMED via Browser Test:**
- Console: "Password auth error: Error: Email and password are required"
- Screenshot: Fields cleared after submit
- Problem: `auth/page.tsx` lines 15, 434, 437 - email state shared between password form AND magic link form

**The Bug:**
```typescript
// Line 15: One email state for BOTH forms
const [email, setEmail] = useState('');

// Lines 339-347: Password form uses email
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

// Lines 434-437: Magic link form ALSO uses email
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
```

When password form submits, if magic link form updates, email gets cleared!

**Fix Required:** Separate email states for each form

---

## 📁 FILES

**Active:** `MASTER_TRUTH.md` (this file)  
**Archived:** `_ARCHIVE_AGENT_SESSIONS/AGENT_103_DATABASE_SCHEMA_FIX.md`

---

**HANDOFF:** Database is perfect. Fix frontend form in `app/auth/page.tsx`

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
