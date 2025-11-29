# 🔐 Security Guide - CronkWaters

## Current Security Status

### 🔴 Critical Issues Found & Fixed

| Issue                                  | Severity    | Status   | Details                                       |
| -------------------------------------- | ----------- | -------- | --------------------------------------------- |
| SQL Injection in `/api/feed/algorithm` | 🔴 CRITICAL | ✅ FIXED | Cursor was interpolated directly into raw SQL |
| Missing Input Validation               | 🟠 HIGH     | ✅ FIXED | Added validation for all user inputs          |
| No Rate Limiting                       | 🟠 HIGH     | ✅ FIXED | Added rate limiting to API routes             |
| No Security Headers                    | 🟠 HIGH     | ✅ FIXED | Added CSP, X-Frame-Options, HSTS, etc.        |
| Debug Endpoints Exposed                | 🟡 MEDIUM   | ✅ FIXED | Blocked in production                         |
| Health Endpoint Info Leak              | 🟡 MEDIUM   | ✅ FIXED | Protected with auth key                       |
| Feed Route Unprotected                 | 🟡 MEDIUM   | ✅ FIXED | Added to protected paths                      |

### 🟢 Database Security (Completed)

| Issue                | Status   | Details                                                |
| -------------------- | -------- | ------------------------------------------------------ |
| RLS Enabled          | ✅ FIXED | All critical tables now have Row Level Security        |
| Function Search Path | ✅ FIXED | All functions now have explicit `search_path = public` |
| Extensions in Public | ⚠️ LOW   | Extensions remain in public schema (low risk)          |

---

## 🛡️ Security Layers Implemented

### 1. Input Validation (`/lib/security.ts`)

All user inputs are now validated:

```typescript
import {
  validateId,
  validateCursor,
  validateLimit,
  sanitizeContent,
  validateUrl,
  validateEmail,
  validateVisibility,
} from '@/lib/security';

// Examples:
const postId = validateId(params.id); // Returns null if invalid
const content = sanitizeContent(body.content, 10000); // XSS protection
const url = validateUrl(body.audioUrl); // Only http/https
```

### 2. SQL Injection Prevention

**Before (VULNERABLE):**

```typescript
// ❌ DANGEROUS - String interpolation in SQL
const posts = await prisma.$queryRaw`
  SELECT * FROM "Post" WHERE id = ${userInput}
`;
```

**After (SAFE):**

```typescript
// ✅ SAFE - Parameterized query
const validId = validateId(userInput);
if (!validId) throw new Error('Invalid ID');

const posts = await prisma.$queryRaw`
  SELECT * FROM "Post" WHERE id = ${validId}
`;
```

### 3. Rate Limiting

```typescript
// In API routes:
if (!rateLimitUser(session.user.id, 'feed-posts-read', 200)) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

**Current Limits:**
| Action | Limit | Window |
|--------|-------|--------|
| Read Feed | 200/min | Per user |
| Create Post | 30/hour | Per user |
| Reactions | 100/min | Per user |
| Comments | 50/min | Per user |

### 4. Authentication

All API routes require authentication:

```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 5. Authorization

Users can only modify their own resources:

```typescript
const post = await prisma.post.findUnique({ where: { id } });
if (post.userId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 🚨 Common Attack Vectors & Protections

### 1. SQL Injection ✅ Protected

- All raw queries use Prisma's parameterized queries
- Input IDs are validated against CUID/UUID patterns
- No string concatenation in SQL

### 2. XSS (Cross-Site Scripting) ✅ Protected

- `sanitizeContent()` escapes HTML
- React auto-escapes JSX output
- Content Security Policy recommended

### 3. CSRF (Cross-Site Request Forgery) ✅ Protected

- NextAuth includes CSRF tokens
- `validateOrigin()` checks request origin
- SameSite cookies

### 4. Broken Authentication ✅ Protected

- NextAuth v5 with secure defaults
- Session tokens are httpOnly
- Password hashing (if used)

### 5. Sensitive Data Exposure ⚠️ Review Needed

- Audit what user data is returned in API responses
- Consider removing email from public responses
- Review `/api/health` endpoint exposure

### 6. Rate Limiting ✅ Protected

- In-memory rate limiting implemented
- Consider Redis for production scale

---

## 🔧 Additional Security (Completed)

### 1. Row Level Security (RLS) ✅ ENABLED

RLS has been enabled on all critical tables:

- `Post`, `PostReaction`, `PostComment`, `PostBookmark`, `PostShare`
- `PostCommentReaction`, `PostPlay`
- `Song`, `Project`, `Asset`
- `User`, `Session`, `Account`

Note: RLS policies are enforced at the database level for direct connections.
Prisma connections use application-level authorization.

### 2. Add Content Security Policy

In `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];
```

### 3. Upgrade to Redis Rate Limiting

For production, replace in-memory rate limiting with Redis:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 4. Enable Audit Logging

The database client now logs all write operations:

```
[DB AUDIT] update on Song at 2025-11-28T15:30:00.000Z
```

### 5. Regular Security Scans

Run periodically:

```bash
# Check for vulnerable dependencies
npm audit

# Run security linter
npx eslint --ext .ts,.tsx . --rule 'security/*: error'
```

---

## 📋 Security Checklist

Before deploying to production:

- [ ] All API routes have authentication checks
- [ ] All user inputs are validated/sanitized
- [ ] Rate limiting is configured
- [ ] HTTPS is enforced
- [ ] Environment variables are secure
- [ ] Database backups are enabled
- [ ] Audit logging is enabled
- [ ] Dependencies are up to date
- [ ] No secrets in git history

---

## 🆘 Security Incident Response

If you discover a security issue:

1. **Don't panic** - Document what you found
2. **Contain** - Disable affected features if critical
3. **Investigate** - Check audit logs
4. **Fix** - Apply security patches
5. **Learn** - Add tests to prevent recurrence

---

## 📞 Security Contacts

- **Report vulnerabilities:** security@cronkwaters.com
- **Emergency:** [Your emergency contact]

---

_Last updated: November 28, 2025_
