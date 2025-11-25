# 🚨 CRITICAL SECURITY BREACH - IMMEDIATE ACTION REQUIRED

**Date:** 2025-11-24  
**Severity:** CRITICAL  
**Status:** 🔴 **CREDENTIALS EXPOSED IN GIT HISTORY**

---

## WHAT HAPPENED

Production API credentials were exposed in multiple documentation files and **committed to git history** in commit `c79c7354`. These credentials are now accessible to anyone with repository access.

## EXPOSED CREDENTIALS

### 1. Google OAuth Client Secret
- **Type:** Google Cloud Platform OAuth 2.0 Client
- **Client ID:** `251126367330-***` (REDACTED)
- **Client Secret:** `GOCSPX-***` (REDACTED - was exposed in commit)
- **Files:** MASTER_TRUTH.md, AGENT_94_AUTH_RESTORED.md, FIX_AUTH_NOW.md

### 2. Resend API Key
- **Type:** Resend Email Service API Key
- **API Key:** `re_ZmH***` (REDACTED - was exposed in commit)
- **Files:** MASTER_TRUTH.md, AGENT_94_AUTH_RESTORED.md, RESEND_CONFIG_CHECK.md

---

## IMMEDIATE ACTIONS REQUIRED (DO THIS NOW)

### Step 1: Rotate Google OAuth Credentials (5 minutes)
1. Go to https://console.cloud.google.com/apis/credentials
2. Find client ID: `251126367330-hgh5kfe785k7pmbi1rgvdsos4jisdllv`
3. Click "Edit OAuth Client"
4. Click "Reset Secret" or delete and create new OAuth 2.0 Client ID
5. Download new `client_secret_*.json` file
6. Update Vercel environment variables:
   ```bash
   # In Vercel dashboard under cronkwaters.com project:
   # Settings > Environment Variables > Production
   # UPDATE these variables with NEW values:
   GOOGLE_CLIENT_ID=<new_client_id>
   GOOGLE_CLIENT_SECRET=<new_client_secret>
   ```

### Step 2: Rotate Resend API Key (2 minutes)
1. Go to https://resend.com/api-keys
2. Find and **DELETE** the exposed API key: `re_ZmHYNEjV_*****`
3. Click "Create API Key"
4. Copy the new API key
5. Update Vercel environment variables:
   ```bash
   # In Vercel dashboard:
   # Update EMAIL_SERVER_URL with new API key:
   EMAIL_SERVER_URL=smtp://resend:<NEW_API_KEY>@smtp.resend.com:587
   ```

### Step 3: Redeploy Production (1 minute)
```bash
# Trigger new deployment with rotated credentials:
git commit --allow-empty -m "security: rotate exposed credentials"
git push origin main
```

### Step 4: Monitor for Unauthorized Access (Ongoing)
1. **Google Cloud Console:**
   - Check "Audit Logs" for any unauthorized OAuth requests
   - Review "OAuth consent screen" user list
   
2. **Resend Dashboard:**
   - Check email sending logs for unauthorized sends
   - Review API usage metrics

3. **Vercel Logs:**
   - Monitor for unusual authentication attempts
   - Check for spikes in failed auth requests

---

## GIT HISTORY CLEANUP (OPTIONAL BUT RECOMMENDED)

**WARNING:** This is destructive and requires force push. Only do this if you understand the consequences.

```bash
# Option 1: Use BFG Repo-Cleaner (recommended)
# Install: brew install bfg
bfg --replace-text <(echo "GOCSPX-***==>REDACTED_GOOGLE_SECRET")
bfg --replace-text <(echo "re_ZmH***==>REDACTED_RESEND_KEY")
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 2: Interactive rebase (for single commit)
git rebase -i HEAD~5  # Adjust number based on commits to review
# Mark commit c79c7354 as "edit"
# Edit files to remove credentials
# git add . && git commit --amend
# git rebase --continue

# Force push (CAUTION: coordinate with team)
git push origin main --force
```

**ALTERNATIVE:** If force push is not acceptable, simply ensure:
1. New credentials are generated and deployed
2. Old credentials are revoked/deleted
3. Monitoring is in place for unauthorized access

---

## FILES TO CLEAN UP

After rotating credentials, remove exposed values from these files:

1. ✅ `MASTER_TRUTH.md` - Lines 128-130, 139, 145
2. ✅ `AGENT_94_AUTH_RESTORED.md` - Search and redact
3. ✅ `RESEND_CONFIG_CHECK.md` - Search and redact
4. ✅ `_ARCHIVE_AGENT_SESSIONS/FIX_AUTH_NOW.md` - Search and redact
5. ⚠️ `client_secret_*.json` - Keep for local dev, but add to .gitignore

---

## PREVENTION MEASURES

### Immediate (Do Now):
1. ✅ Add to `.gitignore`:
   ```
   # Secrets and credentials
   client_secret_*.json
   .env.temp
   *.key
   *.pem
   ```

2. ✅ Install pre-commit hook to detect secrets:
   ```bash
   # Install gitleaks
   brew install gitleaks
   
   # Add pre-commit hook
   cat > .git/hooks/pre-commit << 'EOF'
   #!/bin/sh
   gitleaks protect --staged --redact --verbose
   EOF
   chmod +x .git/hooks/pre-commit
   ```

### Long-term:
1. Use secret scanning tools (GitHub Secret Scanning, GitGuardian)
2. Store all secrets in environment variables (Vercel, never in code)
3. Rotate credentials quarterly
4. Use short-lived tokens when possible
5. Document all credential locations in secure password manager

---

## VERIFICATION CHECKLIST

After completing rotation:

- [ ] Google OAuth credentials rotated in Google Console
- [ ] Resend API key deleted and regenerated
- [ ] Vercel environment variables updated with NEW credentials
- [ ] Production redeployed (new commit pushed)
- [ ] Auth tested on production (Google OAuth works)
- [ ] Email tested on production (Magic links work)
- [ ] Old credentials confirmed revoked (test with old values - should fail)
- [ ] Audit logs checked (no unauthorized access detected)
- [ ] Documentation files cleaned (credentials redacted)
- [ ] `.gitignore` updated (prevent future leaks)
- [ ] Pre-commit hooks installed (automated prevention)

---

## ESTIMATED TIME TO COMPLETE

- **Credential Rotation:** 10 minutes
- **Deployment & Testing:** 5 minutes
- **Documentation Cleanup:** 5 minutes
- **Prevention Measures:** 10 minutes
- **Total:** ~30 minutes

---

## RISK ASSESSMENT

**If credentials are NOT rotated:**
- ❌ Anyone with repo access can authenticate as your app
- ❌ Unauthorized users could sign in as any Google account user
- ❌ Unauthorized users could send emails from your domain
- ❌ Potential for data breach, account takeover, or email spam
- ❌ Violates security best practices and compliance requirements

**After rotation:**
- ✅ Old credentials are useless (revoked)
- ✅ New credentials are secure (not in git)
- ✅ Production remains operational with new creds
- ✅ Monitoring in place to detect any unauthorized access attempts

---

## SUPPORT RESOURCES

- **Google Cloud Support:** https://console.cloud.google.com/support
- **Resend Support:** support@resend.com
- **Vercel Support:** https://vercel.com/support
- **Git History Cleanup:** https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

**THIS IS A CRITICAL SECURITY ISSUE. DO NOT IGNORE.**

**Start with Steps 1-3 immediately. Complete within 1 hour maximum.**


