# 🛡️ Database Protection Guide

## Critical: Preventing Accidental Data Loss

Your users' work is precious. This guide ensures no one accidentally loses thousands of hours of their music and creative work.

---

## 🔒 Protection Layers Implemented

### 1. **Soft Delete Pattern** (Already Active)

Most critical models now use soft delete instead of permanent deletion:

```typescript
// Instead of permanently deleting
await prisma.post.delete({ where: { id } });

// We soft delete (mark as deleted, but data remains)
await prisma.post.update({
  where: { id },
  data: {
    isDeleted: true,
    deletedAt: new Date(),
  },
});
```

**Models with Soft Delete:**

- ✅ `Post` - Social feed posts
- ✅ `Song` - User songs (their most valuable work!)
- ✅ `Project` - Collaboration projects
- ✅ `Asset` - Uploaded files metadata

### 2. **Production Middleware** (Active)

The Prisma client now blocks dangerous operations in production:

```typescript
// ❌ BLOCKED in production:
await prisma.song.deleteMany({ where: { userId } });

// Error: "Bulk delete operations are blocked in production for safety"
```

### 3. **Audit Logging** (Active)

All write operations are logged in production:

```
[DB AUDIT] update on Song at 2025-11-28T15:30:00.000Z
```

---

## 🌿 Neon Database Branching (Instant Backups)

Your Neon database supports **instant branching** - think of it like Git for your database!

### Current Settings:

- **Project:** cronkwaters-production
- **Region:** AWS US-West-2
- **History Retention:** 6 hours (can be upgraded)

### Before Dangerous Operations:

```bash
# Create a backup branch via Neon MCP
# This creates an instant snapshot you can restore from
```

### Recommended: Increase History Retention

Upgrade to Neon Pro ($19/month) to get:

- **7-day history retention** (restore to any point in last 7 days)
- **Unlimited branches** (instant backups)
- **Automatic daily backups**

---

## 🚨 Emergency: How to Recover Data

### Option 1: Restore Soft-Deleted Records

```sql
-- Find deleted posts
SELECT * FROM "Post" WHERE "isDeleted" = true;

-- Restore them
UPDATE "Post" SET "isDeleted" = false, "deletedAt" = NULL WHERE id = 'xxx';
```

### Option 2: Neon Point-in-Time Recovery

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Branches** → **Restore**
4. Select a point in time to restore to

### Option 3: Contact Support

- Neon: support@neon.tech
- Within 6 hours, Neon can help restore from their logs

---

## 🔐 Environment Variables for Safety

Add these to your `.env.production`:

```env
# Block all destructive DB operations by default
# Only set this when you REALLY need to delete data permanently
# ALLOW_DESTRUCTIVE_DB_OPS="I_UNDERSTAND_THIS_WILL_DELETE_DATA"

# Set to production to enable all safety features
NODE_ENV=production
```

---

## ⚠️ NEVER Do These in Production

1. **Never run `prisma db push --force-reset`**
   - This DELETES all data
   - Use `prisma migrate deploy` instead

2. **Never run `prisma migrate reset`**
   - This DELETES all data
   - Only use in development

3. **Never use raw SQL DELETE without WHERE**

   ```sql
   -- ❌ DANGEROUS
   DELETE FROM "Song";

   -- ✅ SAFE
   DELETE FROM "Song" WHERE id = 'specific-id';
   ```

4. **Never DROP tables in production**
   - Always create a backup branch first
   - Use migrations for schema changes

---

## 📋 Pre-Deployment Checklist

Before any production deployment:

- [ ] Create a Neon backup branch
- [ ] Test migrations on staging first
- [ ] Review any DELETE operations in code
- [ ] Ensure soft delete is used where possible
- [ ] Check that `NODE_ENV=production` is set

---

## 🔧 CLI Commands for Safety

```bash
# Create a backup branch before changes
neon branches create --name backup-$(date +%Y%m%d-%H%M%S)

# List all branches (including backups)
neon branches list

# Restore from a branch if needed
neon branches restore <branch-id>
```

---

## 📞 Emergency Contacts

- **Neon Support:** support@neon.tech
- **Neon Status:** https://neonstatus.com
- **Your Project ID:** `weathered-rain-51915586`

---

## Summary

| Protection Layer  | Status       | Coverage                      |
| ----------------- | ------------ | ----------------------------- |
| Soft Delete       | ✅ Active    | Post, Song, Project, Asset    |
| Production Blocks | ✅ Active    | deleteMany, dangerous SQL     |
| Audit Logging     | ✅ Active    | All write operations          |
| Neon Branching    | ✅ Available | Instant point-in-time restore |
| History Retention | ⚠️ 6 hours   | Upgrade for 7 days            |

**Your users' work is now protected!** 🎸🛡️
